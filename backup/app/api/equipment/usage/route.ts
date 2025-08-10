import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const equipmentId = searchParams.get('equipmentId');
    const workerId = searchParams.get('workerId');
    const contractorId = searchParams.get('contractorId');
    const active = searchParams.get('active');

    const where: Record<string, unknown> = {};

    if (equipmentId) {
      where.equipmentId = equipmentId;
    }

    if (workerId) {
      where.workerId = workerId;
    }

    if (contractorId) {
      where.contractorId = contractorId;
    }

    if (active === 'true') {
      where.endTime = null;
    }

    const usage = await prisma.equipmentUsage.findMany({
      where,
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            type: true,
            model: true,
            registrationId: true,
          },
        },
        worker: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            role: true,
          },
        },
        contractor: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    return NextResponse.json(usage);
  } catch (error) {
    console.error('Error fetching equipment usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment usage' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const usage = await prisma.equipmentUsage.create({
      data: {
        equipmentId: data.equipmentId,
        operatorType: data.operatorType,
        workerId: data.workerId,
        contractorId: data.contractorId,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : null,
        location: data.location,
        purpose: data.purpose,
        startKm: data.startKm,
        endKm: data.endKm,
        startHours: data.startHours,
        endHours: data.endHours,
        fuelUsed: data.fuelUsed,
        notes: data.notes,
      },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            type: true,
            model: true,
          },
        },
        worker: {
          select: {
            id: true,
            name: true,
            employeeId: true,
          },
        },
        contractor: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
          },
        },
      },
    });

    // Update equipment status to IN_USE if this is an active usage
    if (!data.endTime) {
      await prisma.equipment.update({
        where: { id: data.equipmentId },
        data: { 
          status: 'IN_USE',
          isAvailable: false,
          currentKm: data.startKm,
          currentHours: data.startHours,
        },
      });
    }

    return NextResponse.json(usage, { status: 201 });
  } catch (error) {
    console.error('Error creating equipment usage:', error);
    return NextResponse.json(
      { error: 'Failed to create equipment usage' },
      { status: 500 }
    );
  }
}