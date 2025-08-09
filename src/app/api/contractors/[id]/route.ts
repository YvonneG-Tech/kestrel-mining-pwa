import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contractor = await prisma.contractor.findUnique({
      where: { id },
      include: {
        certifications: {
          orderBy: { expiryDate: 'asc' },
        },
        assignments: {
          orderBy: { startDate: 'desc' },
        },
        equipmentUsage: {
          include: {
            equipment: {
              select: {
                id: true,
                name: true,
                type: true,
                model: true,
              },
            },
          },
          orderBy: { startTime: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            assignments: true,
            certifications: true,
            equipmentUsage: true,
          },
        },
      },
    });

    if (!contractor) {
      return NextResponse.json(
        { error: 'Contractor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(contractor);
  } catch (error) {
    console.error('Error fetching contractor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contractor' },
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

    const contractor = await prisma.contractor.update({
      where: { id },
      data: {
        companyName: data.companyName,
        abn: data.abn,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        status: data.status,
        hourlyRate: data.hourlyRate,
        dailyRate: data.dailyRate,
        emergencyRate: data.emergencyRate,
        skills: data.skills,
        isAvailable: data.isAvailable,
        availableFrom: data.availableFrom ? new Date(data.availableFrom) : null,
        availableTo: data.availableTo ? new Date(data.availableTo) : null,
        maxHoursPerWeek: data.maxHoursPerWeek,
      },
      include: {
        certifications: true,
        assignments: true,
        _count: {
          select: {
            assignments: true,
            certifications: true,
          },
        },
      },
    });

    return NextResponse.json(contractor);
  } catch (error) {
    console.error('Error updating contractor:', error);
    return NextResponse.json(
      { error: 'Failed to update contractor' },
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

    await prisma.contractor.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Contractor deleted successfully' });
  } catch (error) {
    console.error('Error deleting contractor:', error);
    return NextResponse.json(
      { error: 'Failed to delete contractor' },
      { status: 500 }
    );
  }
}