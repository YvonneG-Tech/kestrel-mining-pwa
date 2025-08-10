import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { EquipmentType, EquipmentStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as EquipmentType | null;
    const status = searchParams.get('status') as EquipmentStatus | null;
    const search = searchParams.get('search');
    const available = searchParams.get('available');

    const where: Record<string, unknown> = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { registrationId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (available === 'true') {
      where.isAvailable = true;
      where.status = 'AVAILABLE';
    }

    const equipment = await prisma.equipment.findMany({
      where,
      include: {
        usage: {
          where: { endTime: null },
          include: {
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
        },
        maintenanceRecords: {
          where: {
            status: { in: ['SCHEDULED', 'IN_PROGRESS', 'OVERDUE'] },
          },
          orderBy: { scheduledDate: 'asc' },
          take: 3,
        },
        assignments: {
          where: { status: 'ACTIVE' },
          orderBy: { startDate: 'desc' },
        },
        _count: {
          select: {
            usage: true,
            maintenanceRecords: true,
            assignments: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const equipment = await prisma.equipment.create({
      data: {
        name: data.name,
        type: data.type,
        model: data.model,
        serialNumber: data.serialNumber,
        registrationId: data.registrationId,
        status: data.status || 'AVAILABLE',
        specifications: data.specifications,
        capacity: data.capacity,
        fuelType: data.fuelType,
        isOwned: data.isOwned ?? true,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        purchasePrice: data.purchasePrice,
        currentValue: data.currentValue,
        dailyRate: data.dailyRate,
        currentLocation: data.currentLocation,
        isAvailable: data.isAvailable ?? true,
        lastServiceDate: data.lastServiceDate ? new Date(data.lastServiceDate) : null,
        nextServiceDate: data.nextServiceDate ? new Date(data.nextServiceDate) : null,
        serviceIntervalKm: data.serviceIntervalKm,
        serviceIntervalHours: data.serviceIntervalHours,
        currentKm: data.currentKm,
        currentHours: data.currentHours,
      },
      include: {
        usage: true,
        maintenanceRecords: true,
        assignments: true,
        _count: {
          select: {
            usage: true,
            maintenanceRecords: true,
            assignments: true,
          },
        },
      },
    });

    return NextResponse.json(equipment, { status: 201 });
  } catch (error) {
    console.error('Error creating equipment:', error);
    return NextResponse.json(
      { error: 'Failed to create equipment' },
      { status: 500 }
    );
  }
}