import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { TrainingCategory, DeliveryMethod, AssessmentType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as TrainingCategory | null;
    const search = searchParams.get('search');
    const provider = searchParams.get('provider');
    const deliveryMethod = searchParams.get('deliveryMethod') as DeliveryMethod | null;

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { provider: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (provider) {
      where.provider = { contains: provider, mode: 'insensitive' };
    }

    if (deliveryMethod) {
      where.deliveryMethod = deliveryMethod;
    }

    const programs = await prisma.trainingProgram.findMany({
      where,
      include: {
        sessions: {
          where: {
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          },
          orderBy: { startDate: 'asc' },
          take: 5,
        },
        skills: {
          include: {
            skill: true,
          },
        },
        _count: {
          select: {
            sessions: true,
            enrollments: true,
            skills: true,
            requirements: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(programs);
  } catch (error) {
    console.error('Error fetching training programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch training programs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const program = await prisma.trainingProgram.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        provider: data.provider,
        duration: data.duration,
        validityPeriod: data.validityPeriod,
        isRecurring: data.isRecurring ?? false,
        renewalRequired: data.renewalRequired ?? false,
        prerequisites: data.prerequisites || [],
        minExperience: data.minExperience,
        deliveryMethod: data.deliveryMethod || 'IN_PERSON',
        materials: data.materials,
        assessmentType: data.assessmentType || 'PRACTICAL',
        passingScore: data.passingScore,
        cost: data.cost,
        maxParticipants: data.maxParticipants,
      },
      include: {
        sessions: true,
        skills: {
          include: {
            skill: true,
          },
        },
        _count: {
          select: {
            sessions: true,
            enrollments: true,
            skills: true,
            requirements: true,
          },
        },
      },
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error('Error creating training program:', error);
    return NextResponse.json(
      { error: 'Failed to create training program' },
      { status: 500 }
    );
  }
}