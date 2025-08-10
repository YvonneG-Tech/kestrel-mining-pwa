import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ContractorStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ContractorStatus | null;
    const search = searchParams.get('search');
    const available = searchParams.get('available');
    const skills = searchParams.get('skills');

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (available === 'true') {
      where.isAvailable = true;
    }

    if (skills) {
      where.skills = { hasSome: skills.split(',') };
    }

    const contractors = await prisma.contractor.findMany({
      where,
      include: {
        certifications: {
          orderBy: { expiryDate: 'asc' },
        },
        assignments: {
          where: { status: 'ACTIVE' },
          orderBy: { startDate: 'desc' },
        },
        _count: {
          select: {
            assignments: true,
            certifications: true,
          },
        },
      },
      orderBy: { companyName: 'asc' },
    });

    return NextResponse.json(contractors);
  } catch (error) {
    console.error('Error fetching contractors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contractors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const contractor = await prisma.contractor.create({
      data: {
        companyName: data.companyName,
        abn: data.abn,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        status: data.status || 'ACTIVE',
        hourlyRate: data.hourlyRate,
        dailyRate: data.dailyRate,
        emergencyRate: data.emergencyRate,
        skills: data.skills || [],
        isAvailable: data.isAvailable ?? true,
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

    return NextResponse.json(contractor, { status: 201 });
  } catch (error) {
    console.error('Error creating contractor:', error);
    return NextResponse.json(
      { error: 'Failed to create contractor' },
      { status: 500 }
    );
  }
}