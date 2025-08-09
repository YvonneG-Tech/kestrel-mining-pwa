// AI-Powered Workforce Optimization Engine for Mining Operations

import { getMLFramework, PredictionResult } from './ml-framework';
import { prisma } from '@/lib/db';

interface WorkerWithSkills {
  id: string;
  name: string;
  employeeId: string;
  role: string;
  department?: string | null;
  status: string;
  hourlyRate?: number | null;
  maxHoursPerWeek?: number | null;
  preferredShift?: string | null;
  createdAt: Date;
  skills: Array<{
    id: string;
    skillId: string;
    level: string;
    experienceYears?: number | null;
    verified: boolean;
    skill: {
      id: string;
      name: string;
      category: string;
      level?: string | null;
    };
  }>;
  usage: Array<{
    id: string;
    startTime: Date;
    endTime?: Date | null;
    equipmentId: string;
    location?: string | null;
  }>;
}

interface ContractorWithSkills {
  id: string;
  companyName: string;
  contactName: string;
  hourlyRate?: number | null;
  dailyRate?: number | null;
  emergencyRate?: number | null;
  isAvailable: boolean;
  availableFrom?: Date | null;
  availableTo?: Date | null;
  maxHoursPerWeek?: number | null;
  skills: string[];
  status: string;
}

export interface WorkTask {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedHours: number;
  requiredSkills: string[];
  preferredExperience: number;
  location?: string;
  equipmentRequired?: string[];
  deadline?: Date;
  shiftPreference?: 'DAY' | 'NIGHT' | 'ANY';
  minWorkers: number;
  maxWorkers: number;
  costBudget?: number;
}

export interface WorkAssignment {
  taskId: string;
  workerId: string;
  workerType: 'EMPLOYEE' | 'CONTRACTOR';
  assignedHours: number;
  skillMatch: number; // 0-1 score
  costPerHour: number;
  totalCost: number;
  confidenceScore: number;
  reasoning: string[];
}

export interface ShiftSchedule {
  workerId: string;
  workerName: string;
  workerType: 'EMPLOYEE' | 'CONTRACTOR';
  shift: 'DAY' | 'NIGHT';
  date: Date;
  startTime: Date;
  endTime: Date;
  tasks: WorkAssignment[];
  totalHours: number;
  utilizationRate: number; // 0-1
  efficiency: number; // 0-1
}

export interface OptimizationResult {
  assignments: WorkAssignment[];
  schedules: ShiftSchedule[];
  metrics: {
    totalCost: number;
    averageSkillMatch: number;
    utilizationRate: number;
    completionRate: number;
    riskScore: number;
  };
  recommendations: string[];
  warnings: string[];
}

export interface WorkforceMetrics {
  totalWorkers: number;
  availableWorkers: number;
  utilization: number;
  skillCoverage: Record<string, number>;
  costEfficiency: number;
  productivityScore: number;
  burnoutRisk: number;
}

export class WorkforceOptimizationEngine {
  private isInitialized = false;
  private models = new Map<string, string>();

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const mlFramework = getMLFramework();
    await mlFramework.initialize();

    // Create optimization models
    const modelConfigs = [
      {
        id: 'task_assignment',
        name: 'Task Assignment Optimizer',
        type: 'regression' as const,
        inputShape: [15], // worker skills, experience, availability, task requirements
        outputShape: 1, // assignment score
        architecture: 'deep' as const,
      },
      {
        id: 'shift_scheduler',
        name: 'Shift Schedule Optimizer',
        type: 'regression' as const,
        inputShape: [12], // worker preferences, workload, efficiency
        outputShape: 1, // schedule fitness score
        architecture: 'deep' as const,
      },
      {
        id: 'workload_balancer',
        name: 'Workload Balance Optimizer',
        type: 'regression' as const,
        inputShape: [10], // current workload, capacity, skills
        outputShape: 1, // balance score
        architecture: 'simple' as const,
      },
    ];

    for (const config of modelConfigs) {
      await mlFramework.createModel(config);
      this.models.set(config.id, config.id);
      console.log(`🎯 Created workforce optimization model: ${config.name}`);
    }

    // Train models with synthetic data initially
    await this.trainModelsWithSyntheticData();

    this.isInitialized = true;
    console.log('🚀 Workforce Optimization Engine initialized');
  }

  async optimizeTaskAssignments(tasks: WorkTask[]): Promise<OptimizationResult> {
    await this.initialize();

    // Get available workforce
    const workers = await this.getAvailableWorkers();
    const contractors = await this.getAvailableContractors();

    const assignments: WorkAssignment[] = [];
    const schedules: ShiftSchedule[] = [];
    let totalCost = 0;
    let totalSkillMatch = 0;

    // Process each task
    for (const task of tasks) {
      const bestAssignments = await this.findOptimalAssignments(task, workers, contractors);
      
      for (const assignment of bestAssignments) {
        assignments.push(assignment);
        totalCost += assignment.totalCost;
        totalSkillMatch += assignment.skillMatch;
      }
    }

    // Generate optimized schedules
    const optimizedSchedules = await this.generateOptimizedSchedules(assignments, workers, contractors);
    schedules.push(...optimizedSchedules);

    // Calculate metrics
    const metrics = {
      totalCost,
      averageSkillMatch: assignments.length > 0 ? totalSkillMatch / assignments.length : 0,
      utilizationRate: this.calculateUtilizationRate(schedules),
      completionRate: this.calculateCompletionRate(assignments, tasks),
      riskScore: this.calculateRiskScore(schedules, assignments),
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(metrics, schedules, assignments);
    const warnings = this.generateWarnings(metrics, schedules);

    return {
      assignments,
      schedules,
      metrics,
      recommendations,
      warnings,
    };
  }

  async predictWorkforceNeeds(timeframe: 'DAILY' | 'WEEKLY' | 'MONTHLY', factors: {
    seasonality?: boolean;
    projectDeadlines?: Date[];
    equipmentMaintenance?: string[];
    weatherConditions?: 'GOOD' | 'POOR' | 'EXTREME';
  } = {}): Promise<{
    recommendedWorkers: number;
    skillGaps: Array<{ skill: string; shortage: number }>;
    costProjection: number;
    optimalMix: {
      employees: number;
      contractors: number;
      breakdown: Record<string, number>;
    };
    confidenceScore: number;
  }> {
    await this.initialize();

    const mlFramework = getMLFramework();
    const modelId = this.models.get('workload_balancer')!;

    // Prepare prediction features
    const currentWorkforce = await this.getCurrentWorkforceMetrics();
    const historicalData = await this.getHistoricalWorkloadData();
    
    const features = [
      currentWorkforce.totalWorkers,
      currentWorkforce.utilization,
      this.getSeasonalityFactor(factors.seasonality),
      factors.projectDeadlines?.length || 0,
      factors.equipmentMaintenance?.length || 0,
      this.getWeatherImpact(factors.weatherConditions),
      historicalData.averageWorkload,
      historicalData.peakDemand,
      this.getTimeframeFactor(timeframe),
      currentWorkforce.skillCoverage['OPERATOR'] || 0,
    ];

    const prediction = await mlFramework.predict(modelId, features);
    const recommendedWorkers = Math.max(1, Math.round(prediction.value as number));

    // Analyze skill gaps
    const skillGaps = await this.analyzeSkillGaps(recommendedWorkers);
    
    // Calculate optimal worker mix
    const optimalMix = this.calculateOptimalWorkerMix(recommendedWorkers, skillGaps);
    
    // Project costs
    const costProjection = this.projectCosts(optimalMix, timeframe);

    return {
      recommendedWorkers,
      skillGaps,
      costProjection,
      optimalMix,
      confidenceScore: prediction.confidence,
    };
  }

  async optimizeShiftSchedules(workers: WorkerWithSkills[], constraints: {
    shiftLength: number;
    maxConsecutiveDays: number;
    minRestHours: number;
    coverage24h: boolean;
  }): Promise<ShiftSchedule[]> {
    await this.initialize();

    const schedules: ShiftSchedule[] = [];
    const mlFramework = getMLFramework();
    const modelId = this.models.get('shift_scheduler')!;

    for (const worker of workers) {
      const workHistory = await this.getWorkerHistory(worker.id);
      const preferences = this.inferWorkerPreferences(worker, workHistory);
      
      const features = [
        preferences.dayShiftPreference,
        preferences.nightShiftPreference,
        worker.maxHoursPerWeek || 40,
        workHistory.averageHours,
        workHistory.burnoutRisk,
        this.calculateSkillValue(worker.skills),
        constraints.shiftLength,
        constraints.maxConsecutiveDays,
        constraints.minRestHours ? 1 : 0,
        constraints.coverage24h ? 1 : 0,
        workHistory.efficiency,
        workHistory.reliability,
      ];

      const prediction = await mlFramework.predict(modelId, features);
      const scheduleScore = prediction.value as number;

      // Generate optimal schedule based on score
      const schedule = this.generateWorkerSchedule(worker, scheduleScore, constraints);
      if (schedule) {
        schedules.push(schedule);
      }
    }

    // Balance schedules for optimal coverage
    return this.balanceScheduleCoverage(schedules, constraints);
  }

  private async findOptimalAssignments(
    task: WorkTask, 
    workers: WorkerWithSkills[], 
    contractors: ContractorWithSkills[]
  ): Promise<WorkAssignment[]> {
    const assignments: WorkAssignment[] = [];
    const mlFramework = getMLFramework();
    const modelId = this.models.get('task_assignment')!;

    const candidates = [
      ...workers.map(w => ({ ...w, type: 'EMPLOYEE' as const })),
      ...contractors.map(c => ({ 
        ...c, 
        id: c.id,
        name: c.contactName,
        employeeId: c.id,
        role: 'CONTRACTOR',
        skills: c.skills.map(skill => ({
          id: skill,
          skillId: skill,
          level: 'INTERMEDIATE',
          experienceYears: 3,
          verified: true,
          skill: { id: skill, name: skill, category: 'GENERAL', level: 'INTERMEDIATE' }
        })),
        type: 'CONTRACTOR' as const
      }))
    ];

    for (const candidate of candidates) {
      const skillMatch = this.calculateSkillMatch(candidate.skills, task.requiredSkills);
      const costPerHour = this.calculateCostPerHour(candidate, task);
      const availability = await this.checkAvailability(candidate.id, candidate.type);

      if (!availability || skillMatch < 0.3) continue;

      const features = [
        skillMatch,
        this.calculateExperienceScore(candidate.skills),
        costPerHour / 100, // Normalize
        availability ? 1 : 0,
        this.getPriorityWeight(task.priority),
        task.estimatedHours / 8, // Normalize to days
        candidate.type === 'EMPLOYEE' ? 1 : 0,
        this.getLocationPreference(candidate, task.location),
        this.calculateWorkloadBalance(candidate.id),
        task.deadline ? this.getUrgencyScore(task.deadline) : 0.5,
        Math.min(task.maxWorkers, 5) / 5, // Normalize
        this.getShiftCompatibility(candidate, task.shiftPreference),
        this.calculateReliabilityScore(candidate.id),
        this.getEquipmentFamiliarity(candidate, task.equipmentRequired),
        Math.random() * 0.1, // Small randomization
      ];

      const prediction = await mlFramework.predict(modelId, features);
      const assignmentScore = prediction.value as number;

      if (assignmentScore > 0.6) {
        const assignment: WorkAssignment = {
          taskId: task.id,
          workerId: candidate.id,
          workerType: candidate.type,
          assignedHours: Math.min(task.estimatedHours, candidate.maxHoursPerWeek || 40),
          skillMatch,
          costPerHour,
          totalCost: costPerHour * Math.min(task.estimatedHours, candidate.maxHoursPerWeek || 40),
          confidenceScore: prediction.confidence,
          reasoning: this.generateAssignmentReasoning(skillMatch, costPerHour, assignmentScore),
        };

        assignments.push(assignment);
      }
    }

    // Sort by score and return top assignments within task limits
    assignments.sort((a, b) => b.confidenceScore - a.confidenceScore);
    return assignments.slice(0, task.maxWorkers);
  }

  private calculateSkillMatch(workerSkills: WorkerWithSkills['skills'], requiredSkills: string[]): number {
    if (requiredSkills.length === 0) return 1;

    const workerSkillNames = workerSkills.map(ws => ws.skill.name.toLowerCase());
    const matches = requiredSkills.filter(rs => 
      workerSkillNames.some(ws => ws.includes(rs.toLowerCase()) || rs.toLowerCase().includes(ws))
    );

    return matches.length / requiredSkills.length;
  }

  private calculateCostPerHour(candidate: WorkerWithSkills | ContractorWithSkills, task: WorkTask): number {
    // Check if candidate is a contractor by checking for properties unique to contractors
    if ('companyName' in candidate) {
      // It's a contractor
      if (task.priority === 'CRITICAL') {
        return candidate.emergencyRate || candidate.hourlyRate || (candidate.dailyRate ? candidate.dailyRate / 8 : 0) || 80;
      }
      return candidate.hourlyRate || (candidate.dailyRate ? candidate.dailyRate / 8 : 0) || 65;
    } else {
      // It's an employee
      return candidate.hourlyRate || 45; // Default employee rate
    }
  }

  private async checkAvailability(workerId: string, workerType: 'EMPLOYEE' | 'CONTRACTOR'): Promise<boolean> {
    // Simplified availability check - in reality would check schedules, time off, etc.
    if (workerType === 'CONTRACTOR') {
      const contractor = await prisma.contractor.findUnique({
        where: { id: workerId }
      });
      return contractor?.isAvailable || false;
    }

    const worker = await prisma.worker.findUnique({
      where: { id: workerId }
    });
    return worker?.status === 'ACTIVE';
  }

  private generateOptimizedSchedules(
    assignments: WorkAssignment[], 
    workers: WorkerWithSkills[], 
    contractors: ContractorWithSkills[]
  ): ShiftSchedule[] {
    const schedules: ShiftSchedule[] = [];
    const workerMap = new Map(workers.map(w => [w.id, w]));
    const contractorMap = new Map(contractors.map(c => [c.id, c]));

    // Group assignments by worker
    const workerAssignments = new Map<string, WorkAssignment[]>();
    for (const assignment of assignments) {
      const existing = workerAssignments.get(assignment.workerId) || [];
      existing.push(assignment);
      workerAssignments.set(assignment.workerId, existing);
    }

    // Generate schedules for each worker
    for (const [workerId, workerTasks] of workerAssignments) {
      const worker = workerMap.get(workerId);
      const contractor = contractorMap.get(workerId);
      
      if (!worker && !contractor) continue;

      const schedule: ShiftSchedule = {
        workerId,
        workerName: worker?.name || contractor?.contactName || 'Unknown',
        workerType: worker ? 'EMPLOYEE' : 'CONTRACTOR',
        shift: this.determineOptimalShift(workerTasks),
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        tasks: workerTasks,
        totalHours: workerTasks.reduce((sum, task) => sum + task.assignedHours, 0),
        utilizationRate: 0,
        efficiency: 0,
      };

      // Calculate utilization and efficiency
      const maxHours = worker?.maxHoursPerWeek || contractor?.maxHoursPerWeek || 40;
      schedule.utilizationRate = Math.min(1, schedule.totalHours / (maxHours / 5)); // Daily basis
      schedule.efficiency = this.calculateWorkerEfficiency(workerId, workerTasks);

      // Set optimal times
      this.setOptimalScheduleTimes(schedule);

      schedules.push(schedule);
    }

    return schedules;
  }

  private async trainModelsWithSyntheticData(): Promise<void> {
    const mlFramework = getMLFramework();

    // Train task assignment model
    const assignmentData = this.generateAssignmentTrainingData();
    await mlFramework.trainModel(this.models.get('task_assignment')!, assignmentData, {
      epochs: 30,
      batchSize: 16,
      validationSplit: 0.2,
    });

    // Train shift scheduler model
    const scheduleData = this.generateScheduleTrainingData();
    await mlFramework.trainModel(this.models.get('shift_scheduler')!, scheduleData, {
      epochs: 25,
      batchSize: 16,
      validationSplit: 0.2,
    });

    // Train workload balancer model
    const workloadData = this.generateWorkloadTrainingData();
    await mlFramework.trainModel(this.models.get('workload_balancer')!, workloadData, {
      epochs: 20,
      batchSize: 32,
      validationSplit: 0.2,
    });

    console.log('🎓 Workforce optimization models trained with synthetic data');
  }

  private generateAssignmentTrainingData() {
    const features: number[][] = [];
    const labels: number[] = [];

    for (let i = 0; i < 1000; i++) {
      const skillMatch = Math.random();
      const experience = Math.random();
      const cost = 20 + Math.random() * 100;
      const availability = Math.random() > 0.3 ? 1 : 0;
      const priority = Math.random();
      const hours = 1 + Math.random() * 10;
      const workerType = Math.random() > 0.7 ? 1 : 0; // Employee vs contractor
      const location = Math.random();
      const workload = Math.random();
      const urgency = Math.random();
      const teamSize = Math.random();
      const shift = Math.random();
      const reliability = Math.random();
      const equipment = Math.random();
      const randomness = Math.random() * 0.1;

      // Calculate synthetic assignment score
      let score = skillMatch * 0.3 + 
                 experience * 0.2 + 
                 availability * 0.2 + 
                 (1 - cost / 120) * 0.1 + 
                 priority * 0.1 + 
                 reliability * 0.1;

      score = Math.max(0, Math.min(1, score + (Math.random() - 0.5) * 0.2));

      features.push([
        skillMatch, experience, cost / 100, availability, priority,
        hours / 8, workerType, location, workload, urgency,
        teamSize, shift, reliability, equipment, randomness
      ]);
      labels.push(score);
    }

    return {
      features,
      labels,
      featureNames: [
        'skillMatch', 'experience', 'cost', 'availability', 'priority',
        'hours', 'workerType', 'location', 'workload', 'urgency',
        'teamSize', 'shift', 'reliability', 'equipment', 'randomness'
      ],
      targetName: 'assignmentScore'
    };
  }

  private generateScheduleTrainingData() {
    const features: number[][] = [];
    const labels: number[] = [];

    for (let i = 0; i < 800; i++) {
      const dayPreference = Math.random();
      const nightPreference = 1 - dayPreference;
      const maxHours = 35 + Math.random() * 20;
      const avgHours = 30 + Math.random() * 15;
      const burnoutRisk = Math.random();
      const skillValue = Math.random();
      const shiftLength = 8 + Math.random() * 4;
      const maxConsecutive = 3 + Math.random() * 4;
      const restHours = Math.random() > 0.5 ? 1 : 0;
      const coverage24h = Math.random() > 0.6 ? 1 : 0;
      const efficiency = Math.random();
      const reliability = Math.random();

      // Calculate schedule fitness score
      let score = (dayPreference + nightPreference) * 0.2 +
                 (1 - burnoutRisk) * 0.25 +
                 skillValue * 0.2 +
                 efficiency * 0.2 +
                 reliability * 0.15;

      score = Math.max(0, Math.min(1, score));

      features.push([
        dayPreference, nightPreference, maxHours / 60, avgHours / 50,
        burnoutRisk, skillValue, shiftLength / 12, maxConsecutive / 7,
        restHours, coverage24h, efficiency, reliability
      ]);
      labels.push(score);
    }

    return {
      features,
      labels,
      featureNames: [
        'dayPreference', 'nightPreference', 'maxHours', 'avgHours',
        'burnoutRisk', 'skillValue', 'shiftLength', 'maxConsecutive',
        'restHours', 'coverage24h', 'efficiency', 'reliability'
      ],
      targetName: 'scheduleScore'
    };
  }

  private generateWorkloadTrainingData() {
    const features: number[][] = [];
    const labels: number[] = [];

    for (let i = 0; i < 600; i++) {
      const currentWorkers = 10 + Math.random() * 100;
      const utilization = Math.random();
      const seasonality = Math.random();
      const deadlines = Math.floor(Math.random() * 10);
      const maintenance = Math.floor(Math.random() * 5);
      const weather = Math.random();
      const avgWorkload = Math.random();
      const peakDemand = Math.random();
      const timeframe = Math.random();
      const skillCoverage = Math.random();

      // Calculate recommended workers
      let recommended = currentWorkers;
      if (utilization > 0.9) recommended *= 1.2;
      if (deadlines > 5) recommended *= 1.1;
      if (maintenance > 2) recommended *= 0.9;
      if (weather < 0.3) recommended *= 0.8;

      recommended = Math.max(5, Math.min(200, recommended));

      features.push([
        currentWorkers / 100, utilization, seasonality, deadlines / 10,
        maintenance / 5, weather, avgWorkload, peakDemand, timeframe, skillCoverage
      ]);
      labels.push(recommended / 100);
    }

    return {
      features,
      labels,
      featureNames: [
        'currentWorkers', 'utilization', 'seasonality', 'deadlines',
        'maintenance', 'weather', 'avgWorkload', 'peakDemand', 'timeframe', 'skillCoverage'
      ],
      targetName: 'recommendedWorkers'
    };
  }

  // Helper methods for calculations and data processing
  private async getAvailableWorkers(): Promise<WorkerWithSkills[]> {
    return prisma.worker.findMany({
      where: { status: 'ACTIVE' },
      include: {
        skills: {
          include: { skill: true }
        },
        usage: {
          orderBy: { startTime: 'desc' },
          take: 10
        }
      }
    }) as Promise<WorkerWithSkills[]>;
  }

  private async getAvailableContractors(): Promise<ContractorWithSkills[]> {
    return prisma.contractor.findMany({
      where: { 
        status: 'ACTIVE',
        isAvailable: true 
      }
    });
  }

  private calculateUtilizationRate(schedules: ShiftSchedule[]): number {
    if (schedules.length === 0) return 0;
    return schedules.reduce((sum, s) => sum + s.utilizationRate, 0) / schedules.length;
  }

  private calculateCompletionRate(assignments: WorkAssignment[], tasks: WorkTask[]): number {
    if (tasks.length === 0) return 1;
    const assignedTasks = new Set(assignments.map(a => a.taskId));
    return assignedTasks.size / tasks.length;
  }

  private calculateRiskScore(schedules: ShiftSchedule[], assignments: WorkAssignment[]): number {
    let risk = 0;
    
    // Check for overutilization
    const overutilized = schedules.filter(s => s.utilizationRate > 0.9).length;
    risk += (overutilized / schedules.length) * 0.4;

    // Check for skill mismatches
    const poorMatches = assignments.filter(a => a.skillMatch < 0.5).length;
    risk += (poorMatches / assignments.length) * 0.3;

    // Check for high costs
    const avgCost = assignments.reduce((sum, a) => sum + a.costPerHour, 0) / assignments.length;
    if (avgCost > 80) risk += 0.3;

    return Math.min(1, risk);
  }

  private generateRecommendations(
    metrics: OptimizationResult['metrics'], 
    schedules: ShiftSchedule[], 
    assignments: WorkAssignment[]
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.utilizationRate < 0.7) {
      recommendations.push('Consider reducing workforce or increasing task load to improve utilization');
    }

    if (metrics.averageSkillMatch < 0.8) {
      recommendations.push('Invest in training programs to better match worker skills with task requirements');
    }

    if (metrics.riskScore > 0.6) {
      recommendations.push('High risk detected - review assignments and consider workload redistribution');
    }

    if (assignments.filter(a => a.workerType === 'CONTRACTOR').length / assignments.length > 0.4) {
      recommendations.push('High contractor usage - consider hiring permanent staff for cost efficiency');
    }

    const overworkedSchedules = schedules.filter(s => s.totalHours > 45).length;
    if (overworkedSchedules > 0) {
      recommendations.push(`${overworkedSchedules} workers scheduled for excessive hours - consider workload balancing`);
    }

    return recommendations;
  }

  private generateWarnings(metrics: OptimizationResult['metrics'], schedules: ShiftSchedule[]): string[] {
    const warnings: string[] = [];

    if (metrics.completionRate < 0.8) {
      warnings.push('WARNING: Less than 80% of tasks have been assigned - workforce shortage detected');
    }

    if (metrics.riskScore > 0.8) {
      warnings.push('CRITICAL: High risk score indicates potential operational issues');
    }

    const burnoutRisk = schedules.filter(s => s.totalHours > 50).length;
    if (burnoutRisk > 0) {
      warnings.push(`ALERT: ${burnoutRisk} workers at risk of burnout due to excessive hours`);
    }

    return warnings;
  }

  // Additional helper methods with simplified implementations
  private getPriorityWeight(priority: WorkTask['priority']): number {
    const weights = { 'LOW': 0.25, 'MEDIUM': 0.5, 'HIGH': 0.75, 'CRITICAL': 1.0 };
    return weights[priority];
  }

  private getUrgencyScore(deadline: Date): number {
    const daysUntil = (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.min(1, 1 - (daysUntil / 30))); // Normalize to 30 days
  }

  private calculateExperienceScore(skills: WorkerWithSkills['skills']): number {
    const avgExperience = skills.reduce((sum, s) => sum + (s.experienceYears || 2), 0) / skills.length;
    return Math.min(1, avgExperience / 10); // Normalize to 10 years max
  }

  private getLocationPreference(_candidate: WorkerWithSkills | ContractorWithSkills, _location?: string): number {
    return Math.random() * 0.2 + 0.8; // Simplified
  }

  private calculateWorkloadBalance(_workerId: string): number {
    return Math.random() * 0.5 + 0.5; // Simplified
  }

  private getShiftCompatibility(candidate: WorkerWithSkills | ContractorWithSkills, shiftPreference?: string): number {
    if (!shiftPreference || shiftPreference === 'ANY') return 1;
    
    // Check if candidate has preferredShift property (only workers have this)
    if ('preferredShift' in candidate && candidate.preferredShift) {
      return candidate.preferredShift === shiftPreference ? 1 : 0.6;
    }
    
    // For contractors or workers without preference, return neutral compatibility
    return 0.8;
  }

  private calculateReliabilityScore(_workerId: string): number {
    return Math.random() * 0.3 + 0.7; // Simplified
  }

  private getEquipmentFamiliarity(_candidate: WorkerWithSkills | ContractorWithSkills, equipment?: string[]): number {
    if (!equipment?.length) return 1;
    return Math.random() * 0.4 + 0.6; // Simplified
  }

  private generateAssignmentReasoning(skillMatch: number, cost: number, score: number): string[] {
    const reasons: string[] = [];
    
    if (skillMatch > 0.8) reasons.push('Excellent skill match for task requirements');
    if (cost < 50) reasons.push('Cost-effective assignment');
    if (score > 0.8) reasons.push('High confidence in assignment success');
    
    return reasons;
  }

  private determineOptimalShift(_tasks: WorkAssignment[]): 'DAY' | 'NIGHT' {
    return Math.random() > 0.7 ? 'NIGHT' : 'DAY'; // Simplified
  }

  private calculateWorkerEfficiency(workerId: string, tasks: WorkAssignment[]): number {
    const avgSkillMatch = tasks.reduce((sum, t) => sum + t.skillMatch, 0) / tasks.length;
    return Math.min(1, avgSkillMatch * 1.2);
  }

  private setOptimalScheduleTimes(schedule: ShiftSchedule): void {
    const now = new Date();
    schedule.startTime = schedule.shift === 'DAY' ? 
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0) :
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 0);
    
    schedule.endTime = new Date(schedule.startTime.getTime() + (schedule.totalHours * 60 * 60 * 1000));
  }

  private async getCurrentWorkforceMetrics(): Promise<WorkforceMetrics> {
    const workers = await prisma.worker.count({ where: { status: 'ACTIVE' } });
    const contractors = await prisma.contractor.count({ where: { status: 'ACTIVE', isAvailable: true } });
    
    return {
      totalWorkers: workers + contractors,
      availableWorkers: contractors,
      utilization: 0.75, // Simplified
      skillCoverage: { 'OPERATOR': 0.8, 'TECHNICAL': 0.6, 'SAFETY': 0.9 },
      costEfficiency: 0.7,
      productivityScore: 0.8,
      burnoutRisk: 0.2,
    };
  }

  private async getHistoricalWorkloadData(): Promise<{ averageWorkload: number; peakDemand: number }> {
    return { averageWorkload: 0.7, peakDemand: 0.9 }; // Simplified
  }

  private getSeasonalityFactor(seasonality?: boolean): number {
    return seasonality ? Math.sin(Date.now() / (1000 * 60 * 60 * 24 * 365) * 2 * Math.PI) * 0.2 + 0.5 : 0.5;
  }

  private getWeatherImpact(weather?: 'GOOD' | 'POOR' | 'EXTREME'): number {
    const impacts = { 'GOOD': 1, 'POOR': 0.8, 'EXTREME': 0.5 };
    return impacts[weather || 'GOOD'];
  }

  private getTimeframeFactor(timeframe: 'DAILY' | 'WEEKLY' | 'MONTHLY'): number {
    const factors = { 'DAILY': 0.33, 'WEEKLY': 0.66, 'MONTHLY': 1.0 };
    return factors[timeframe];
  }

  private async analyzeSkillGaps(recommendedWorkers: number): Promise<Array<{ skill: string; shortage: number }>> {
    const skills = await prisma.skill.findMany({
      include: {
        workerSkills: true
      }
    });

    return skills.map(skill => ({
      skill: skill.name,
      shortage: Math.max(0, Math.floor(recommendedWorkers * 0.1) - skill.workerSkills.length)
    })).filter(gap => gap.shortage > 0);
  }

  private calculateOptimalWorkerMix(totalWorkers: number, _skillGaps: Array<{ skill: string; shortage: number }>) {
    const employees = Math.floor(totalWorkers * 0.7);
    const contractors = totalWorkers - employees;

    return {
      employees,
      contractors,
      breakdown: {
        'OPERATORS': Math.floor(employees * 0.6),
        'TECHNICIANS': Math.floor(employees * 0.2),
        'SUPERVISORS': Math.floor(employees * 0.1),
        'SPECIALISTS': Math.floor(employees * 0.1),
        'CONTRACT_OPERATORS': Math.floor(contractors * 0.8),
        'CONTRACT_SPECIALISTS': Math.floor(contractors * 0.2),
      }
    };
  }

  private projectCosts(optimalMix: { employees: number; contractors: number }, timeframe: 'DAILY' | 'WEEKLY' | 'MONTHLY'): number {
    const employeeCost = optimalMix.employees * 45; // per hour
    const contractorCost = optimalMix.contractors * 65; // per hour
    const hoursMultiplier = timeframe === 'DAILY' ? 8 : timeframe === 'WEEKLY' ? 40 : 160;
    
    return (employeeCost + contractorCost) * hoursMultiplier;
  }

  private async getWorkerHistory(_workerId: string) {
    return {
      averageHours: 35 + Math.random() * 10,
      burnoutRisk: Math.random() * 0.3,
      efficiency: 0.7 + Math.random() * 0.3,
      reliability: 0.8 + Math.random() * 0.2,
    };
  }

  private inferWorkerPreferences(worker: WorkerWithSkills, _history: { averageHours: number; burnoutRisk: number; efficiency: number; reliability: number }) {
    return {
      dayShiftPreference: worker.preferredShift === 'DAY' ? 0.9 : 0.3,
      nightShiftPreference: worker.preferredShift === 'NIGHT' ? 0.9 : 0.3,
    };
  }

  private calculateSkillValue(skills: WorkerWithSkills['skills']): number {
    return Math.min(1, skills.length / 5) * (skills.filter(s => s.verified).length / skills.length || 0);
  }

  private generateWorkerSchedule(worker: WorkerWithSkills, score: number, _constraints: { shiftLength: number; maxConsecutiveDays: number; minRestHours: number; coverage24h: boolean }): ShiftSchedule | null {
    if (score < 0.5) return null;

    return {
      workerId: worker.id,
      workerName: worker.name,
      workerType: 'EMPLOYEE',
      shift: worker.preferredShift || 'DAY',
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      tasks: [],
      totalHours: Math.min(constraints.shiftLength, worker.maxHoursPerWeek / 5 || 8),
      utilizationRate: score,
      efficiency: score,
    };
  }

  private balanceScheduleCoverage(schedules: ShiftSchedule[], _constraints: { shiftLength: number; maxConsecutiveDays: number; minRestHours: number; coverage24h: boolean }): ShiftSchedule[] {
    return schedules; // Simplified - would implement coverage balancing logic
  }
}

// Singleton instance
let workforceOptimizationEngine: WorkforceOptimizationEngine | null = null;

export function getWorkforceOptimizationEngine(): WorkforceOptimizationEngine {
  if (!workforceOptimizationEngine) {
    workforceOptimizationEngine = new WorkforceOptimizationEngine();
  }
  return workforceOptimizationEngine;
}