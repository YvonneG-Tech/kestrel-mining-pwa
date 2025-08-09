import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SkillLevel } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get('workerId');
    const skillId = searchParams.get('skillId');
    const verified = searchParams.get('verified');
    const certified = searchParams.get('certified');

    const where: Record<string, unknown> = {};

    if (workerId) {
      where.workerId = workerId;
    }

    if (skillId) {
      where.skillId = skillId;
    }

    if (verified) {
      where.verified = verified === 'true';
    }

    if (certified) {
      where.certified = certified === 'true';
    }

    const workerSkills = await prisma.workerSkill.findMany({
      where,
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            role: true,
            department: true,
          },
        },
        skill: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            requiresCertification: true,
            certificationAuthority: true,
            validityPeriod: true,
          },
        },
      },
      orderBy: [
        { worker: { name: 'asc' } },
        { skill: { name: 'asc' } },
      ],
    });

    return NextResponse.json(workerSkills);
  } catch (error) {
    console.error('Error fetching worker skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch worker skills' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const workerSkill = await prisma.workerSkill.create({
      data: {
        workerId: data.workerId,
        skillId: data.skillId,
        level: data.level,
        experienceYears: data.experienceYears,
        lastUsed: data.lastUsed ? new Date(data.lastUsed) : null,
        verified: data.verified || false,
        verifiedBy: data.verifiedBy,
        verifiedAt: data.verifiedAt ? new Date(data.verifiedAt) : null,
        certified: data.certified || false,
        certificationDate: data.certificationDate ? new Date(data.certificationDate) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        certificationNumber: data.certificationNumber,
        notes: data.notes,
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            role: true,
          },
        },
        skill: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json(workerSkill, { status: 201 });
  } catch (error) {
    console.error('Error creating worker skill:', error);
    return NextResponse.json(
      { error: 'Failed to create worker skill' },
      { status: 500 }
    );
  }
}