import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const program = await prisma.trainingProgram.findUnique({
      where: { id },
      include: {
        sessions: {
          orderBy: { startDate: 'desc' },
          include: {
            attendances: {
              include: {
                trainingEnrollment: {
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
              },
            },
          },
        },
        enrollments: {
          include: {
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
          orderBy: { enrolledAt: 'desc' },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        requirements: true,
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

    if (!program) {
      return NextResponse.json(
        { error: 'Training program not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error('Error fetching training program:', error);
    return NextResponse.json(
      { error: 'Failed to fetch training program' },
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

    const program = await prisma.trainingProgram.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        provider: data.provider,
        duration: data.duration,
        validityPeriod: data.validityPeriod,
        isRecurring: data.isRecurring,
        renewalRequired: data.renewalRequired,
        prerequisites: data.prerequisites,
        minExperience: data.minExperience,
        deliveryMethod: data.deliveryMethod,
        materials: data.materials,
        assessmentType: data.assessmentType,
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

    return NextResponse.json(program);
  } catch (error) {
    console.error('Error updating training program:', error);
    return NextResponse.json(
      { error: 'Failed to update training program' },
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

    await prisma.trainingProgram.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Training program deleted successfully' });
  } catch (error) {
    console.error('Error deleting training program:', error);
    return NextResponse.json(
      { error: 'Failed to delete training program' },
      { status: 500 }
    );
  }
}