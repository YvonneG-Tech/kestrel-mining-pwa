// Predictive Maintenance AI Engine for Mining Equipment

import { getMLFramework, PredictionResult } from './ml-framework';
import { prisma } from '@/lib/db';

interface EquipmentWithRelations {
  id: string;
  name: string;
  type: string;
  currentHours?: number | null;
  currentKm?: number | null;
  purchaseDate?: Date | null;
  createdAt: Date;
  serviceIntervalHours?: number | null;
  maintenanceRecords: Array<{
    id: string;
    type: string;
    scheduledDate?: Date | null;
    completedDate?: Date | null;
    cost?: number | null;
    hoursReading?: number | null;
    kmReading?: number | null;
  }>;
  usage: Array<{
    id: string;
    startTime: Date;
    endTime?: Date | null;
    fuelUsed?: number | null;
  }>;
}

export interface MaintenancePrediction {
  equipmentId: string;
  equipmentName: string;
  riskScore: number; // 0-1, where 1 is highest risk
  predictedFailureDate: Date;
  daysUntilMaintenance: number;
  failureType: 'MECHANICAL' | 'ELECTRICAL' | 'HYDRAULIC' | 'ENGINE' | 'GENERAL';
  confidence: number;
  recommendations: string[];
  criticalComponents: string[];
  estimatedCost: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface MaintenanceAlert {
  id: string;
  equipmentId: string;
  alertType: 'IMMEDIATE' | 'SCHEDULE' | 'MONITOR' | 'OPTIMIZE';
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  generatedAt: Date;
  isAcknowledged: boolean;
}

export interface EquipmentHealth {
  overall: number; // 0-100 health score
  components: {
    engine: number;
    hydraulics: number;
    transmission: number;
    brakes: number;
    electrical: number;
  };
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  lastUpdated: Date;
}

export class PredictiveMaintenanceEngine {
  private isInitialized = false;
  private models = new Map<string, string>(); // equipmentType -> modelId mapping

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const mlFramework = getMLFramework();
    await mlFramework.initialize();

    // Create models for different equipment types
    const equipmentTypes = [
      'EXCAVATOR',
      'DUMP_TRUCK', 
      'DRILL_RIG',
      'LOADER',
      'BULLDOZER',
    ];

    for (const equipmentType of equipmentTypes) {
      const modelId = `maintenance_${equipmentType.toLowerCase()}`;
      
      await mlFramework.createModel({
        id: modelId,
        name: `${equipmentType} Maintenance Predictor`,
        type: 'regression',
        inputShape: [20], // 20 features: hours, km, age, usage patterns, etc.
        outputShape: 1, // Days until maintenance needed
        architecture: 'deep',
      });

      this.models.set(equipmentType, modelId);
      console.log(`🔧 Created maintenance model for ${equipmentType}`);
    }

    // Train models with historical data
    await this.trainModelsWithHistoricalData();

    this.isInitialized = true;
    console.log('🚀 Predictive Maintenance Engine initialized');
  }

  private async trainModelsWithHistoricalData(): Promise<void> {
    // Get equipment with maintenance history
    const equipment = await prisma.equipment.findMany({
      include: {
        maintenanceRecords: {
          where: { status: 'COMPLETED' },
          orderBy: { completedDate: 'asc' },
        },
        usage: {
          orderBy: { startTime: 'asc' },
        },
      },
    });

    const mlFramework = getMLFramework();

    for (const [equipmentType, modelId] of this.models) {
      const typeEquipment = equipment.filter(eq => eq.type === equipmentType);
      
      if (typeEquipment.length < 5) {
        console.log(`⚠️ Insufficient data for ${equipmentType}, using synthetic data`);
        await this.trainWithSyntheticData(modelId, equipmentType);
        continue;
      }

      const trainingData = this.prepareTrainingData(typeEquipment);
      
      if (trainingData.features.length > 0) {
        console.log(`📊 Training ${equipmentType} model with ${trainingData.features.length} samples`);
        
        await mlFramework.trainModel(modelId, trainingData, {
          epochs: 50,
          batchSize: 16,
          validationSplit: 0.2,
          patience: 10,
        });
      } else {
        await this.trainWithSyntheticData(modelId, equipmentType);
      }
    }
  }

  private prepareTrainingData(equipment: EquipmentWithRelations[]): {
    features: number[][];
    labels: number[];
    featureNames: string[];
    targetName: string;
  } {
    const features: number[][] = [];
    const labels: number[] = [];
    
    const featureNames = [
      'age_months', 'current_hours', 'current_km', 'hours_since_service',
      'km_since_service', 'avg_daily_hours', 'avg_fuel_consumption',
      'usage_intensity', 'maintenance_frequency', 'cost_trend',
      'season', 'operating_conditions', 'operator_experience',
      'component_age_engine', 'component_age_hydraulic', 'component_age_transmission',
      'failure_history_count', 'emergency_repairs', 'preventive_ratio', 'downtime_hours'
    ];

    for (const eq of equipment) {
      const maintenanceEvents = eq.maintenanceRecords;
      if (maintenanceEvents.length < 2) continue;

      for (let i = 1; i < maintenanceEvents.length; i++) {
        const prevMaintenance = maintenanceEvents[i - 1];
        const currentMaintenance = maintenanceEvents[i];
        
        if (!currentMaintenance.scheduledDate || !prevMaintenance.completedDate) continue;
        
        const daysBetween = Math.floor(
          (new Date(currentMaintenance.scheduledDate).getTime() - 
           new Date(prevMaintenance.completedDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysBetween <= 0 || daysBetween > 365) continue; // Filter unrealistic data

        const purchaseDate = eq.purchaseDate ? new Date(eq.purchaseDate) : new Date(eq.createdAt);
        const ageAtMaintenance = Math.floor(
          (new Date(prevMaintenance.completedDate).getTime() - 
           purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        );

        // Create feature vector
        const feature = [
          ageAtMaintenance, // age_months
          eq.currentHours || 0, // current_hours
          eq.currentKm || 0, // current_km
          (eq.currentHours || 0) - (prevMaintenance.hoursReading || 0), // hours_since_service
          (eq.currentKm || 0) - (prevMaintenance.kmReading || 0), // km_since_service
          (eq.currentHours || 0) / Math.max(ageAtMaintenance, 1), // avg_daily_hours
          this.calculateFuelConsumption(eq.usage), // avg_fuel_consumption
          this.calculateUsageIntensity(eq.usage), // usage_intensity
          maintenanceEvents.length / Math.max(ageAtMaintenance, 1), // maintenance_frequency
          this.calculateCostTrend(maintenanceEvents.slice(0, i)), // cost_trend
          this.getSeason(prevMaintenance.completedDate), // season
          this.getOperatingConditions(), // operating_conditions (simplified)
          this.getOperatorExperience(), // operator_experience (simplified)
          ageAtMaintenance * 0.8, // component_age_engine
          ageAtMaintenance * 0.6, // component_age_hydraulic  
          ageAtMaintenance * 0.7, // component_age_transmission
          this.countFailureHistory(maintenanceEvents.slice(0, i)), // failure_history_count
          this.countEmergencyRepairs(maintenanceEvents.slice(0, i)), // emergency_repairs
          this.calculatePreventiveRatio(maintenanceEvents.slice(0, i)), // preventive_ratio
          this.calculateDowntimeHours(maintenanceEvents.slice(0, i)), // downtime_hours
        ];

        features.push(feature);
        labels.push(daysBetween);
      }
    }

    return {
      features,
      labels,
      featureNames,
      targetName: 'days_until_maintenance',
    };
  }

  private async trainWithSyntheticData(modelId: string, equipmentType: string): Promise<void> {
    console.log(`🧪 Generating synthetic training data for ${equipmentType}`);
    
    const features: number[][] = [];
    const labels: number[] = [];

    // Generate synthetic data based on equipment type characteristics
    const typeConfig = this.getEquipmentTypeConfig(equipmentType);
    
    for (let i = 0; i < 1000; i++) {
      const age = Math.random() * 60; // 0-60 months
      const hours = Math.random() * typeConfig.maxHours;
      const km = Math.random() * typeConfig.maxKm;
      const intensity = Math.random();
      
      // Calculate synthetic days until maintenance based on realistic patterns
      const baseDays = typeConfig.baseMaintenanceInterval;
      const ageFactor = Math.max(0.5, 1 - (age / 100)); // Older equipment needs more frequent maintenance
      const intensityFactor = Math.max(0.5, 1 - intensity); // Higher intensity = more frequent maintenance
      const randomFactor = 0.8 + Math.random() * 0.4; // ±20% randomness
      
      const daysUntilMaintenance = Math.floor(baseDays * ageFactor * intensityFactor * randomFactor);

      const feature = [
        age, hours, km, hours * 0.1, km * 0.05, hours / Math.max(age, 1),
        Math.random() * 50, intensity, Math.random(), Math.random() * 1000,
        Math.floor(Math.random() * 4), Math.random(), Math.random(),
        age * 0.8, age * 0.6, age * 0.7, Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 3), Math.random(), Math.random() * 100
      ];

      features.push(feature);
      labels.push(Math.max(1, daysUntilMaintenance));
    }

    const mlFramework = getMLFramework();
    await mlFramework.trainModel(modelId, {
      features,
      labels,
      featureNames: ['synthetic_features'],
      targetName: 'days_until_maintenance',
    }, {
      epochs: 30,
      batchSize: 32,
      validationSplit: 0.2,
    });
  }

  private getEquipmentTypeConfig(type: string) {
    const configs: Record<string, { maxHours: number; maxKm: number; baseMaintenanceInterval: number }> = {
      'EXCAVATOR': { maxHours: 10000, maxKm: 50000, baseMaintenanceInterval: 90 },
      'DUMP_TRUCK': { maxHours: 15000, maxKm: 100000, baseMaintenanceInterval: 60 },
      'DRILL_RIG': { maxHours: 8000, maxKm: 20000, baseMaintenanceInterval: 120 },
      'LOADER': { maxHours: 12000, maxKm: 60000, baseMaintenanceInterval: 75 },
      'BULLDOZER': { maxHours: 10000, maxKm: 40000, baseMaintenanceInterval: 85 },
    };
    
    return configs[type] || { maxHours: 10000, maxKm: 50000, baseMaintenanceInterval: 90 };
  }

  async predictMaintenance(equipmentId: string): Promise<MaintenancePrediction> {
    await this.initialize();

    // Get equipment data
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        maintenanceRecords: {
          orderBy: { scheduledDate: 'desc' },
          take: 10,
        },
        usage: {
          orderBy: { startTime: 'desc' },
          take: 50,
        },
      },
    });

    if (!equipment) {
      throw new Error(`Equipment ${equipmentId} not found`);
    }

    const modelId = this.models.get(equipment.type);
    if (!modelId) {
      throw new Error(`No model available for equipment type ${equipment.type}`);
    }

    // Prepare features for prediction
    const features = this.prepareEquipmentFeatures(equipment);
    
    // Make prediction
    const mlFramework = getMLFramework();
    const prediction = await mlFramework.predict(modelId, features);

    const daysUntilMaintenance = Math.max(1, Math.round(prediction.value as number));
    const predictedFailureDate = new Date();
    predictedFailureDate.setDate(predictedFailureDate.getDate() + daysUntilMaintenance);

    // Calculate risk score and other metrics
    const riskScore = this.calculateRiskScore(equipment, daysUntilMaintenance);
    const priority = this.calculatePriority(riskScore, daysUntilMaintenance);
    const recommendations = this.generateRecommendations(equipment, riskScore, daysUntilMaintenance);
    const estimatedCost = this.estimateMaintenanceCost(equipment, riskScore);

    return {
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      riskScore,
      predictedFailureDate,
      daysUntilMaintenance,
      failureType: this.predictFailureType(equipment, features),
      confidence: prediction.confidence,
      recommendations,
      criticalComponents: this.identifyCriticalComponents(equipment, features),
      estimatedCost,
      priority,
    };
  }

  async generateMaintenanceAlerts(): Promise<MaintenanceAlert[]> {
    await this.initialize();

    const activeEquipment = await prisma.equipment.findMany({
      where: {
        status: { in: ['AVAILABLE', 'IN_USE'] },
      },
    });

    const alerts: MaintenanceAlert[] = [];

    for (const equipment of activeEquipment) {
      try {
        const prediction = await this.predictMaintenance(equipment.id);
        
        if (prediction.priority === 'CRITICAL' && prediction.daysUntilMaintenance <= 3) {
          alerts.push({
            id: `alert_${equipment.id}_${Date.now()}`,
            equipmentId: equipment.id,
            alertType: 'IMMEDIATE',
            message: `${equipment.name} requires immediate maintenance! Risk score: ${(prediction.riskScore * 100).toFixed(0)}%`,
            severity: 'CRITICAL',
            generatedAt: new Date(),
            isAcknowledged: false,
          });
        } else if (prediction.priority === 'HIGH' && prediction.daysUntilMaintenance <= 7) {
          alerts.push({
            id: `alert_${equipment.id}_${Date.now()}`,
            equipmentId: equipment.id,
            alertType: 'SCHEDULE',
            message: `Schedule maintenance for ${equipment.name} within ${prediction.daysUntilMaintenance} days`,
            severity: 'WARNING',
            generatedAt: new Date(),
            isAcknowledged: false,
          });
        } else if (prediction.riskScore > 0.6) {
          alerts.push({
            id: `alert_${equipment.id}_${Date.now()}`,
            equipmentId: equipment.id,
            alertType: 'MONITOR',
            message: `Monitor ${equipment.name} closely - elevated risk detected`,
            severity: 'INFO',
            generatedAt: new Date(),
            isAcknowledged: false,
          });
        }
      } catch (error) {
        console.error(`Failed to predict maintenance for ${equipment.id}:`, error);
      }
    }

    return alerts;
  }

  private prepareEquipmentFeatures(equipment: EquipmentWithRelations): number[] {
    const now = new Date();
    const ageMonths = equipment.purchaseDate ? 
      Math.floor((now.getTime() - new Date(equipment.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 
      12;

    const lastMaintenance = equipment.maintenanceRecords[0];
    const hoursSinceService = lastMaintenance ? 
      (equipment.currentHours || 0) - (lastMaintenance.hoursReading || 0) : 
      equipment.currentHours || 0;

    const kmSinceService = lastMaintenance ? 
      (equipment.currentKm || 0) - (lastMaintenance.kmReading || 0) : 
      equipment.currentKm || 0;

    return [
      ageMonths,
      equipment.currentHours || 0,
      equipment.currentKm || 0,
      hoursSinceService,
      kmSinceService,
      (equipment.currentHours || 0) / Math.max(ageMonths, 1),
      this.calculateFuelConsumption(equipment.usage),
      this.calculateUsageIntensity(equipment.usage),
      equipment.maintenanceRecords.length / Math.max(ageMonths, 1),
      this.calculateCostTrend(equipment.maintenanceRecords),
      this.getSeason(now),
      0.5, // operating_conditions (simplified)
      0.7, // operator_experience (simplified)
      ageMonths * 0.8,
      ageMonths * 0.6,
      ageMonths * 0.7,
      this.countFailureHistory(equipment.maintenanceRecords),
      this.countEmergencyRepairs(equipment.maintenanceRecords),
      this.calculatePreventiveRatio(equipment.maintenanceRecords),
      this.calculateDowntimeHours(equipment.maintenanceRecords),
    ];
  }

  // Helper methods for feature calculation
  private calculateFuelConsumption(usage: EquipmentWithRelations['usage']): number {
    if (!usage.length) return 0;
    const totalFuel = usage.reduce((sum, u) => sum + (u.fuelUsed || 0), 0);
    return totalFuel / usage.length;
  }

  private calculateUsageIntensity(usage: EquipmentWithRelations['usage']): number {
    if (!usage.length) return 0;
    const totalHours = usage.reduce((sum, u) => {
      if (!u.endTime || !u.startTime) return sum;
      return sum + (new Date(u.endTime).getTime() - new Date(u.startTime).getTime()) / (1000 * 60 * 60);
    }, 0);
    return totalHours / (usage.length * 24); // Intensity as fraction of day
  }

  private calculateCostTrend(maintenanceRecords: EquipmentWithRelations['maintenanceRecords']): number {
    if (maintenanceRecords.length < 2) return 0;
    const recent = maintenanceRecords.slice(0, Math.min(5, maintenanceRecords.length));
    const avgCost = recent.reduce((sum, m) => sum + (m.cost || 0), 0) / recent.length;
    return avgCost;
  }

  private getSeason(date: Date): number {
    const month = date.getMonth();
    return Math.floor(month / 3); // 0=summer, 1=autumn, 2=winter, 3=spring (AU)
  }

  private getOperatingConditions(): number {
    return Math.random() * 0.5 + 0.5; // Simplified: 0.5-1.0
  }

  private getOperatorExperience(): number {
    return Math.random() * 0.5 + 0.5; // Simplified: 0.5-1.0
  }

  private countFailureHistory(maintenanceRecords: EquipmentWithRelations['maintenanceRecords']): number {
    return maintenanceRecords.filter(m => m.type === 'REPAIR').length;
  }

  private countEmergencyRepairs(maintenanceRecords: EquipmentWithRelations['maintenanceRecords']): number {
    return maintenanceRecords.filter(m => m.type === 'EMERGENCY').length;
  }

  private calculatePreventiveRatio(maintenanceRecords: EquipmentWithRelations['maintenanceRecords']): number {
    if (!maintenanceRecords.length) return 0;
    const preventive = maintenanceRecords.filter(m => m.type === 'ROUTINE_SERVICE').length;
    return preventive / maintenanceRecords.length;
  }

  private calculateDowntimeHours(maintenanceRecords: EquipmentWithRelations['maintenanceRecords']): number {
    return maintenanceRecords.reduce((sum, m) => {
      if (!m.scheduledDate || !m.completedDate) return sum;
      return sum + (new Date(m.completedDate).getTime() - new Date(m.scheduledDate).getTime()) / (1000 * 60 * 60);
    }, 0);
  }

  private calculateRiskScore(equipment: EquipmentWithRelations, daysUntilMaintenance: number): number {
    let risk = 0;

    // Time-based risk (higher risk as maintenance date approaches)
    risk += Math.max(0, 1 - (daysUntilMaintenance / 90)) * 0.4;

    // Age-based risk
    if (equipment.purchaseDate) {
      const ageMonths = (Date.now() - new Date(equipment.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
      risk += Math.min(0.3, ageMonths / 100);
    }

    // Usage-based risk
    if (equipment.currentHours && equipment.serviceIntervalHours) {
      const usageRatio = equipment.currentHours / equipment.serviceIntervalHours;
      risk += Math.min(0.2, usageRatio * 0.2);
    }

    // Critical equipment bonus
    if (['DUMP_TRUCK', 'EXCAVATOR', 'DRILL_RIG'].includes(equipment.type)) {
      risk += 0.1;
    }

    return Math.min(1, risk);
  }

  private calculatePriority(riskScore: number, daysUntilMaintenance: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (riskScore > 0.8 || daysUntilMaintenance <= 3) return 'CRITICAL';
    if (riskScore > 0.6 || daysUntilMaintenance <= 7) return 'HIGH';
    if (riskScore > 0.4 || daysUntilMaintenance <= 14) return 'MEDIUM';
    return 'LOW';
  }

  private generateRecommendations(equipment: EquipmentWithRelations, riskScore: number, daysUntilMaintenance: number): string[] {
    const recommendations: string[] = [];

    if (daysUntilMaintenance <= 3) {
      recommendations.push('Schedule immediate maintenance to prevent breakdown');
      recommendations.push('Consider taking equipment offline until maintenance is completed');
    } else if (daysUntilMaintenance <= 7) {
      recommendations.push('Schedule maintenance within the next week');
      recommendations.push('Reduce usage intensity until maintenance');
    }

    if (riskScore > 0.7) {
      recommendations.push('Increase monitoring frequency');
      recommendations.push('Prepare backup equipment');
      recommendations.push('Order critical spare parts in advance');
    }

    if (equipment.currentHours && equipment.serviceIntervalHours && 
        equipment.currentHours > equipment.serviceIntervalHours * 1.2) {
      recommendations.push('Equipment is overdue for service - prioritize maintenance');
    }

    if (equipment.type === 'DUMP_TRUCK' && riskScore > 0.5) {
      recommendations.push('Check tire condition and brake systems');
      recommendations.push('Inspect engine cooling system');
    }

    return recommendations;
  }

  private predictFailureType(equipment: EquipmentWithRelations, features: number[]): 'MECHANICAL' | 'ELECTRICAL' | 'HYDRAULIC' | 'ENGINE' | 'GENERAL' {
    // Simplified failure type prediction based on equipment type and features
    const [age, hours, km, hoursSinceService] = features;

    if (equipment.type === 'EXCAVATOR') {
      if (hoursSinceService > 500) return 'HYDRAULIC';
      if (age > 36) return 'MECHANICAL';
      return 'GENERAL';
    }

    if (equipment.type === 'DUMP_TRUCK') {
      if (km > 80000) return 'ENGINE';
      if (hours > 8000) return 'MECHANICAL';
      return 'GENERAL';
    }

    return 'GENERAL';
  }

  private identifyCriticalComponents(equipment: EquipmentWithRelations, features: number[]): string[] {
    const components: string[] = [];
    const [age, hours, km] = features;

    if (equipment.type === 'EXCAVATOR') {
      if (hours > 3000) components.push('Hydraulic pump');
      if (age > 24) components.push('Main boom cylinder');
      if (hours > 5000) components.push('Track chains');
    }

    if (equipment.type === 'DUMP_TRUCK') {
      if (km > 50000) components.push('Engine');
      if (hours > 6000) components.push('Transmission');
      if (km > 40000) components.push('Brake system');
    }

    return components;
  }

  private estimateMaintenanceCost(equipment: EquipmentWithRelations, riskScore: number): number {
    // const baseConfig = this.getEquipmentTypeConfig(equipment.type);
    let baseCost = 5000; // Base maintenance cost

    // Equipment type multiplier
    const typeMultipliers: Record<string, number> = {
      'DUMP_TRUCK': 1.5,
      'EXCAVATOR': 1.2,
      'DRILL_RIG': 1.8,
      'BULLDOZER': 1.3,
      'LOADER': 1.1,
    };

    baseCost *= typeMultipliers[equipment.type] || 1.0;

    // Risk multiplier
    baseCost *= (1 + riskScore * 0.5);

    // Age multiplier
    if (equipment.purchaseDate) {
      const ageMonths = (Date.now() - new Date(equipment.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
      baseCost *= (1 + Math.min(0.5, ageMonths / 60));
    }

    return Math.round(baseCost);
  }
}

// Singleton instance
let predictiveMaintenanceEngine: PredictiveMaintenanceEngine | null = null;

export function getPredictiveMaintenanceEngine(): PredictiveMaintenanceEngine {
  if (!predictiveMaintenanceEngine) {
    predictiveMaintenanceEngine = new PredictiveMaintenanceEngine();
  }
  return predictiveMaintenanceEngine;
}