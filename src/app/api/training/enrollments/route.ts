import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ParticipantType, EnrollmentStatus, Priority } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');
    const workerId = searchParams.get('workerId');
    const contractorId = searchParams.get('contractorId');
    const status = searchParams.get('status') as EnrollmentStatus | null;
    const priority = searchParams.get('priority') as Priority | null;

    const where: Record<string, unknown> = {};

    if (programId) {
      where.trainingProgramId = programId;
    }

    if (workerId) {
      where.workerId = workerId;
    }

    if (contractorId) {
      where.contractorId = contractorId;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const enrollments = await prisma.trainingEnrollment.findMany({
      where,
      include: {
        trainingProgram: {
          select: {
            id: true,
            name: true,
            category: true,
            duration: true,
            deliveryMethod: true,
          },
        },
        worker: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            role: true,
            department: true,
          },
        },
        contractor: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
          },
        },
        attendances: {
          include: {
            trainingSession: {
              select: {
                id: true,
                startDate: true,
                endDate: true,
                status: true,
              },
            },
          },
          orderBy: {
            trainingSession: {
              startDate: 'desc',
            },
          },
        },
        requirements: true,
      },
      orderBy: [
        { priority: 'desc' },
        { deadline: 'asc' },
        { enrolledAt: 'desc' },
      ],
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error('Error fetching training enrollments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch training enrollments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const enrollment = await prisma.trainingEnrollment.create({
      data: {
        trainingProgramId: data.trainingProgramId,
        participantType: data.participantType,
        workerId: data.workerId,
        contractorId: data.contractorId,
        status: data.status || 'ENROLLED',
        priority: data.priority || 'MEDIUM',
        deadline: data.deadline ? new Date(data.deadline) : null,
        progressPercent: data.progressPercent || 0,
        startedAt: data.startedAt ? new Date(data.startedAt) : null,
        completedAt: data.completedAt ? new Date(data.completedAt) : null,
        finalScore: data.finalScore,
        passed: data.passed,
        certificateIssued: data.certificateIssued || false,
        notes: data.notes,
      },
      include: {
        trainingProgram: {
          select: {
            id: true,
            name: true,
            category: true,
            duration: true,
            deliveryMethod: true,
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
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error('Error creating training enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to create training enrollment' },
      { status: 500 }
    );
  }
}