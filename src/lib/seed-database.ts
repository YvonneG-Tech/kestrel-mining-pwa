// Seed the database with sample data for testing
import { prisma } from './db';
import { WorkerStatus, DocumentType, DocumentStatus, ScanStatus } from '@prisma/client';

export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Clear existing data
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

    console.log('✅ Database seeded successfully!');
    return {
      workers: workers.length,
      documents: documents.length,
      scanHistory: scanHistory.length,
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