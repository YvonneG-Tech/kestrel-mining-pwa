import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        usage: {
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
          orderBy: { startTime: 'desc' },
          take: 20,
        },
        maintenanceRecords: {
          orderBy: { scheduledDate: 'desc' },
        },
        assignments: {
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
    });

    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        model: data.model,
        serialNumber: data.serialNumber,
        registrationId: data.registrationId,
        status: data.status,
        specifications: data.specifications,
        capacity: data.capacity,
        fuelType: data.fuelType,
        isOwned: data.isOwned,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        purchasePrice: data.purchasePrice,
        currentValue: data.currentValue,
        dailyRate: data.dailyRate,
        currentLocation: data.currentLocation,
        isAvailable: data.isAvailable,
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

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error updating equipment:', error);
    return NextResponse.json(
      { error: 'Failed to update equipment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.equipment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    return NextResponse.json(
      { error: 'Failed to delete equipment' },
      { status: 500 }
    );
  }
}