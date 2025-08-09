import { NextRequest, NextResponse } from 'next/server';
import { getIntegrationManager } from '@/lib/integrations/integration-manager';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, workerId, employeeId } = body;

    const integrationManager = getIntegrationManager();

    switch (type) {
      case 'worker-to-gallagher': {
        if (!workerId) {
          return NextResponse.json(
            { error: 'workerId is required for worker-to-gallagher sync' },
            { status: 400 }
          );
        }

        // Get worker from database
        const worker = await prisma.worker.findUnique({
          where: { id: workerId },
        });

        if (!worker) {
          return NextResponse.json(
            { error: 'Worker not found' },
            { status: 404 }
          );
        }

        const result = await integrationManager.syncWorkerToGallagher({
          id: worker.id,
          name: worker.name,
          employeeId: worker.employeeId,
          email: worker.email || undefined,
          phone: worker.phone || undefined,
          department: worker.department || undefined,
          status: worker.status,
        });

        return NextResponse.json({
          type: 'worker-to-gallagher',
          workerId: worker.id,
          employeeId: worker.employeeId,
          ...result,
        });
      }

      case 'worker-from-sap': {
        if (!employeeId) {
          return NextResponse.json(
            { error: 'employeeId is required for worker-from-sap sync' },
            { status: 400 }
          );
        }

        const result = await integrationManager.syncWorkerFromSAP(employeeId);

        if (result.success && result.data) {
          // Check if worker exists in our database
          let worker = await prisma.worker.findUnique({
            where: { employeeId },
          });

          if (worker) {
            // Update existing worker
            worker = await prisma.worker.update({
              where: { employeeId },
              data: {
                name: `${result.data.firstName} ${result.data.lastName}`,
                email: result.data.email,
                department: result.data.department,
                role: result.data.position,
                status: result.data.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
              },
            });
          } else {
            // Create new worker
            worker = await prisma.worker.create({
              data: {
                name: `${result.data.firstName} ${result.data.lastName}`,
                employeeId: result.data.employeeId,
                email: result.data.email,
                department: result.data.department,
                role: result.data.position,
                status: result.data.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
              },
            });
          }

          return NextResponse.json({
            type: 'worker-from-sap',
            employeeId,
            workerId: worker.id,
            success: true,
            data: {
              worker,
              sapData: result.data,
            },
          });
        }

        return NextResponse.json({
          type: 'worker-from-sap',
          employeeId,
          ...result,
        });
      }

      case 'all-workers-to-powerbi': {
        // Get all active workers
        const workers = await prisma.worker.findMany({
          where: { status: 'ACTIVE' },
        });

        const result = await integrationManager.syncWorkforceToPowerBI(
          workers.map(worker => ({
            id: worker.id,
            name: worker.name,
            employeeId: worker.employeeId,
            status: worker.status,
            role: worker.role,
            department: worker.department || undefined,
            startDate: worker.startDate || undefined,
            lastSeen: worker.lastSeen || undefined,
          }))
        );

        return NextResponse.json({
          type: 'all-workers-to-powerbi',
          workerCount: workers.length,
          ...result,
        });
      }

      case 'full-sync': {
        // Get all workers for full sync
        const workers = await prisma.worker.findMany();

        const result = await integrationManager.performFullSync(
          workers.map(worker => ({
            id: worker.id,
            name: worker.name,
            employeeId: worker.employeeId,
            email: worker.email || undefined,
            phone: worker.phone || undefined,
            department: worker.department || undefined,
            status: worker.status,
            role: worker.role,
            startDate: worker.startDate || undefined,
            lastSeen: worker.lastSeen || undefined,
          }))
        );

        return NextResponse.json({
          type: 'full-sync',
          workerCount: workers.length,
          timestamp: new Date().toISOString(),
          ...result,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown sync type: ${type}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error during sync operation:', error);
    return NextResponse.json(
      { 
        error: 'Sync operation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}