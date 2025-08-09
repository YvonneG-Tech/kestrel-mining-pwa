import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { WorkerStatus } from '@prisma/client';

// GET /api/workers - Get all workers with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as WorkerStatus | null;
    const search = searchParams.get('search');
    
    const workers = await prisma.worker.findMany({
      where: {
        ...(status && { status }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { employeeId: { contains: search, mode: 'insensitive' } },
            { role: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        documents: true,
        _count: {
          select: {
            documents: true,
            scanHistory: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ workers, count: workers.length });
  } catch (error) {
    console.error('Error fetching workers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workers' },
      { status: 500 }
    );
  }
}

// POST /api/workers - Create new worker
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, employeeId, email, phone, role, department, status } = body;

    // Validate required fields
    if (!name || !employeeId || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: name, employeeId, role' },
        { status: 400 }
      );
    }

    // Check if employeeId already exists
    const existingWorker = await prisma.worker.findUnique({
      where: { employeeId },
    });

    if (existingWorker) {
      return NextResponse.json(
        { error: 'Worker with this employee ID already exists' },
        { status: 409 }
      );
    }

    const worker = await prisma.worker.create({
      data: {
        name,
        employeeId,
        email,
        phone,
        role,
        department,
        status: status || 'PENDING',
        lastSeen: new Date(),
      },
      include: {
        documents: true,
        _count: {
          select: {
            documents: true,
            scanHistory: true,
          },
        },
      },
    });

    return NextResponse.json(worker, { status: 201 });
  } catch (error) {
    console.error('Error creating worker:', error);
    return NextResponse.json(
      { error: 'Failed to create worker' },
      { status: 500 }
    );
  }
}