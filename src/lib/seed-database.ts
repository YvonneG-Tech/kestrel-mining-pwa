// Seed the database with sample data for testing
import { prisma } from './db';
import { 
  WorkerStatus, 
  DocumentType, 
  DocumentStatus, 
  ScanStatus,
  ContractorStatus,
  EquipmentType,
  EquipmentStatus,
  OperatorType,
  MaintenanceType,
  MaintenanceStatus
} from '@prisma/client';

export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await prisma.equipmentUsage.deleteMany();
    await prisma.equipmentMaintenance.deleteMany();
    await prisma.equipmentAssignment.deleteMany();
    await prisma.equipment.deleteMany();
    await prisma.contractorAssignment.deleteMany();
    await prisma.contractorCertification.deleteMany();
    await prisma.contractor.deleteMany();
    await prisma.scanHistory.deleteMany();
    await prisma.document.deleteMany();
    await prisma.worker.deleteMany();
    await prisma.user.deleteMany();

    console.log('🗑️  Cleared existing data');

    // Create sample workers
    const workers = await Promise.all([
      prisma.worker.create({
        data: {
          name: 'John Smith',
          employeeId: 'EMP001',
          email: 'john.smith@kestrelmining.com',
          phone: '+61 400 123 456',
          status: WorkerStatus.ACTIVE,
          role: 'Site Supervisor',
          department: 'Operations',
          startDate: new Date('2023-01-15'),
          lastSeen: new Date(),
        },
      }),
      prisma.worker.create({
        data: {
          name: 'Sarah Johnson',
          employeeId: 'EMP002',
          email: 'sarah.johnson@kestrelmining.com',
          phone: '+61 400 123 457',
          status: WorkerStatus.ACTIVE,
          role: 'Safety Officer',
          department: 'Safety',
          startDate: new Date('2023-02-01'),
          lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        },
      }),
      prisma.worker.create({
        data: {
          name: 'Mike Wilson',
          employeeId: 'EMP003',
          email: 'mike.wilson@kestrelmining.com',
          phone: '+61 400 123 458',
          status: WorkerStatus.PENDING,
          role: 'Equipment Operator',
          department: 'Operations',
          startDate: new Date('2023-03-01'),
          lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        },
      }),
      prisma.worker.create({
        data: {
          name: 'Lisa Chen',
          employeeId: 'EMP004',
          email: 'lisa.chen@kestrelmining.com',
          status: WorkerStatus.INACTIVE,
          role: 'Training Coordinator',
          department: 'HR',
          startDate: new Date('2022-11-01'),
          endDate: new Date('2024-01-31'),
          lastSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
      }),
    ]);

    console.log(`👷 Created ${workers.length} workers`);

    // Create sample documents
    const documents = await Promise.all([
      // John Smith documents
      prisma.document.create({
        data: {
          name: 'Mining Safety Certificate.pdf',
          type: DocumentType.CERTIFICATION,
          status: DocumentStatus.VALID,
          description: 'Annual mining safety certification',
          fileName: 'mining-safety-cert.pdf',
          fileSize: 2048576,
          expiryDate: new Date('2025-01-15'),
          workerId: workers[0].id,
        },
      }),
      prisma.document.create({
        data: {
          name: 'Medical Clearance.pdf',
          type: DocumentType.MEDICAL,
          status: DocumentStatus.VALID,
          description: 'Annual medical fitness assessment',
          fileName: 'medical-clearance.pdf',
          fileSize: 1024000,
          expiryDate: new Date('2025-03-01'),
          workerId: workers[0].id,
        },
      }),
      // Sarah Johnson documents
      prisma.document.create({
        data: {
          name: 'Driver License.jpg',
          type: DocumentType.ID,
          status: DocumentStatus.EXPIRING,
          description: 'Heavy vehicle driver license',
          fileName: 'driver-license.jpg',
          fileSize: 1536000,
          expiryDate: new Date('2024-12-31'),
          workerId: workers[1].id,
        },
      }),
      // Mike Wilson documents
      prisma.document.create({
        data: {
          name: 'First Aid Training.pdf',
          type: DocumentType.TRAINING,
          status: DocumentStatus.EXPIRED,
          description: 'Basic first aid and CPR training',
          fileName: 'first-aid-training.pdf',
          fileSize: 3145728,
          expiryDate: new Date('2023-12-31'),
          workerId: workers[2].id,
        },
      }),
      // Unassigned document
      prisma.document.create({
        data: {
          name: 'Site Induction Template.pdf',
          type: DocumentType.OTHER,
          status: DocumentStatus.VALID,
          description: 'Standard site induction template',
          fileName: 'site-induction-template.pdf',
          fileSize: 5242880,
        },
      }),
    ]);

    console.log(`📄 Created ${documents.length} documents`);

    // Create sample scan history
    const scanHistory = await Promise.all([
      prisma.scanHistory.create({
        data: {
          workerId: workers[0].id,
          status: ScanStatus.SUCCESS,
          location: 'Main Gate',
          scannedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          qrData: { id: workers[0].id, employeeId: workers[0].employeeId, timestamp: Date.now() },
        },
      }),
      prisma.scanHistory.create({
        data: {
          workerId: workers[1].id,
          status: ScanStatus.SUCCESS,
          location: 'Main Gate',
          scannedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          qrData: { id: workers[1].id, employeeId: workers[1].employeeId, timestamp: Date.now() },
        },
      }),
      prisma.scanHistory.create({
        data: {
          workerId: workers[2].id,
          status: ScanStatus.ERROR,
          location: 'Main Gate',
          scannedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          qrData: { id: workers[2].id, employeeId: workers[2].employeeId, timestamp: Date.now() },
        },
      }),
    ]);

    console.log(`📊 Created ${scanHistory.length} scan records`);

    // Create sample contractors
    const contractors = await Promise.all([
      prisma.contractor.create({
        data: {
          companyName: 'Elite Mining Solutions',
          abn: '12345678901',
          contactName: 'David Thompson',
          email: 'david@elitemining.com.au',
          phone: '+61 8 9876 5432',
          address: '123 Industrial Drive, Perth WA 6000',
          status: ContractorStatus.ACTIVE,
          hourlyRate: 85.50,
          dailyRate: 680.00,
          emergencyRate: 120.00,
          skills: ['Heavy Equipment Operation', 'Site Safety', 'Excavator Operation'],
          isAvailable: true,
          maxHoursPerWeek: 50,
        },
      }),
      prisma.contractor.create({
        data: {
          companyName: 'Outback Plant Hire',
          abn: '98765432109',
          contactName: 'Michelle Roberts',
          email: 'michelle@outbackplant.com.au',
          phone: '+61 8 9123 4567',
          address: '456 Mining Road, Kalgoorlie WA 6430',
          status: ContractorStatus.ACTIVE,
          hourlyRate: 95.00,
          dailyRate: 760.00,
          emergencyRate: 140.00,
          skills: ['Crane Operation', 'Equipment Maintenance', 'Site Management'],
          isAvailable: false,
          availableFrom: new Date('2024-12-01'),
          maxHoursPerWeek: 45,
        },
      }),
      prisma.contractor.create({
        data: {
          companyName: 'Professional Mining Services',
          contactName: 'Robert Chen',
          email: 'rob@promining.com.au',
          phone: '+61 8 9555 1234',
          status: ContractorStatus.PENDING,
          hourlyRate: 75.00,
          dailyRate: 600.00,
          skills: ['Drill Operation', 'Safety Training', 'First Aid'],
          isAvailable: true,
          maxHoursPerWeek: 40,
        },
      }),
    ]);

    console.log(`🤝 Created ${contractors.length} contractors`);

    // Create contractor certifications
    await Promise.all([
      prisma.contractorCertification.create({
        data: {
          contractorId: contractors[0].id,
          name: 'Heavy Equipment Operator License',
          issuer: 'Department of Mines WA',
          number: 'HEO-2024-001',
          issuedDate: new Date('2024-01-15'),
          expiryDate: new Date('2025-01-15'),
        },
      }),
      prisma.contractorCertification.create({
        data: {
          contractorId: contractors[1].id,
          name: 'High Risk Work License - Crane',
          issuer: 'WorkSafe WA',
          number: 'HRWL-CR-2023-456',
          issuedDate: new Date('2023-03-01'),
          expiryDate: new Date('2026-03-01'),
        },
      }),
    ]);

    // Create sample equipment
    const equipment = await Promise.all([
      prisma.equipment.create({
        data: {
          name: 'CAT 320D Excavator',
          type: EquipmentType.EXCAVATOR,
          model: '320D',
          serialNumber: 'CAT320D001',
          registrationId: 'EXC-001',
          status: EquipmentStatus.AVAILABLE,
          specifications: {
            operatingWeight: '20000kg',
            bucketCapacity: '1.2m³',
            enginePower: '121kW',
            maxDiggingDepth: '6.5m'
          },
          capacity: '1.2 cubic meters',
          fuelType: 'Diesel',
          isOwned: true,
          purchaseDate: new Date('2022-06-15'),
          purchasePrice: 450000,
          currentValue: 380000,
          dailyRate: 850,
          currentLocation: 'Site A - Main Pit',
          isAvailable: true,
          serviceIntervalKm: 5000,
          serviceIntervalHours: 500,
          currentKm: 15420,
          currentHours: 1840.5,
        },
      }),
      prisma.equipment.create({
        data: {
          name: 'Liebherr T 264 Dump Truck',
          type: EquipmentType.DUMP_TRUCK,
          model: 'T 264',
          serialNumber: 'LIE264001',
          registrationId: 'DT-001',
          status: EquipmentStatus.IN_USE,
          specifications: {
            payloadCapacity: '363000kg',
            grossVehicleWeight: '623690kg',
            enginePower: '2013kW',
            fuelCapacity: '4542L'
          },
          capacity: '363 tonnes',
          fuelType: 'Diesel',
          isOwned: true,
          purchaseDate: new Date('2021-09-20'),
          purchasePrice: 5200000,
          currentValue: 4100000,
          dailyRate: 2800,
          currentLocation: 'Site B - Haul Road',
          isAvailable: false,
          serviceIntervalKm: 2000,
          serviceIntervalHours: 250,
          currentKm: 89320,
          currentHours: 5240.2,
        },
      }),
      prisma.equipment.create({
        data: {
          name: 'Atlas Copco ROC L8 Drill Rig',
          type: EquipmentType.DRILL_RIG,
          model: 'ROC L8',
          serialNumber: 'AC-ROCL8-001',
          registrationId: 'DR-001',
          status: EquipmentStatus.MAINTENANCE,
          specifications: {
            drillingDiameter: '102-127mm',
            drillingDepth: '53.3m',
            enginePower: '563kW',
            operatingWeight: '65000kg'
          },
          capacity: '53m drilling depth',
          fuelType: 'Diesel',
          isOwned: false,
          dailyRate: 1850,
          currentLocation: 'Workshop - Service Bay 2',
          isAvailable: false,
          lastServiceDate: new Date('2024-08-01'),
          nextServiceDate: new Date('2024-09-01'),
          serviceIntervalHours: 1000,
          currentHours: 3420.8,
        },
      }),
    ]);

    console.log(`🚜 Created ${equipment.length} equipment items`);

    // Create equipment usage records
    const equipmentUsage = await Promise.all([
      // Active usage - dump truck by employee
      prisma.equipmentUsage.create({
        data: {
          equipmentId: equipment[1].id,
          operatorType: OperatorType.EMPLOYEE,
          workerId: workers[0].id,
          startTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          location: 'Site B - Haul Road',
          purpose: 'Ore transportation from pit to processing plant',
          startKm: 89200,
          startHours: 5235.0,
          notes: 'Normal haul operations',
        },
      }),
      // Completed usage - excavator by contractor
      prisma.equipmentUsage.create({
        data: {
          equipmentId: equipment[0].id,
          operatorType: OperatorType.CONTRACTOR,
          contractorId: contractors[0].id,
          startTime: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          endTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          location: 'Site A - Main Pit',
          purpose: 'Topsoil removal and overburden stripping',
          startKm: 15400,
          endKm: 15420,
          startHours: 1835.5,
          endHours: 1840.5,
          fuelUsed: 45.2,
          notes: 'Completed section 3A overburden removal',
        },
      }),
    ]);

    console.log(`⚙️ Created ${equipmentUsage.length} equipment usage records`);

    // Create maintenance records
    const maintenanceRecords = await Promise.all([
      prisma.equipmentMaintenance.create({
        data: {
          equipmentId: equipment[2].id,
          type: MaintenanceType.ROUTINE_SERVICE,
          description: '1000 hour service - oil change, filters, hydraulic system check',
          scheduledDate: new Date('2024-08-15'),
          completedDate: new Date('2024-08-16'),
          status: MaintenanceStatus.COMPLETED,
          cost: 8500.00,
          supplier: 'Atlas Copco Service',
          hoursReading: 3420.8,
          partsUsed: {
            'Engine Oil': '40L',
            'Hydraulic Filter': '2x',
            'Air Filter': '1x',
            'Fuel Filter': '1x'
          },
          notes: 'All systems functioning normally. Next service due at 4420 hours.',
        },
      }),
      prisma.equipmentMaintenance.create({
        data: {
          equipmentId: equipment[0].id,
          type: MaintenanceType.ROUTINE_SERVICE,
          description: '500 hour service due',
          scheduledDate: new Date('2024-09-15'),
          status: MaintenanceStatus.SCHEDULED,
          hoursReading: 1840.5,
          notes: 'Approaching service interval - schedule for next week',
        },
      }),
    ]);

    console.log(`🔧 Created ${maintenanceRecords.length} maintenance records`);

    console.log('✅ Database seeded successfully!');
    return {
      workers: workers.length,
      documents: documents.length,
      scanHistory: scanHistory.length,
      contractors: contractors.length,
      equipment: equipment.length,
      equipmentUsage: equipmentUsage.length,
      maintenanceRecords: maintenanceRecords.length,
    };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export function to run seed if called directly
if (require.main === module) {
  seedDatabase()
    .then((result) => {
      console.log('Seeding completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}