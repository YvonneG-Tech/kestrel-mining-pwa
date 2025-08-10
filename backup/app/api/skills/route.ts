import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SkillCategory, SkillLevel } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as SkillCategory | null;
    const level = searchParams.get('level') as SkillLevel | null;
    const search = searchParams.get('search');
    const requiresCertification = searchParams.get('requiresCertification');

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (level) {
      where.level = level;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (requiresCertification) {
      where.requiresCertification = requiresCertification === 'true';
    }

    const skills = await prisma.skill.findMany({
      where,
      include: {
        workerSkills: {
          include: {
            worker: {
              select: {
                id: true,
                name: true,
                employeeId: true,
              },
            },
          },
          where: {
            verified: true,
          },
          take: 10,
        },
        contractorSkills: {
          include: {
            contractor: {
              select: {
                id: true,
                companyName: true,
                contactName: true,
              },
            },
          },
          where: {
            verified: true,
          },
          take: 10,
        },
        trainingSkills: {
          include: {
            trainingProgram: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
        _count: {
          select: {
            workerSkills: true,
            contractorSkills: true,
            trainingSkills: true,
            jobRequirements: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const skill = await prisma.skill.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        level: data.level || 'BASIC',
        requiresCertification: data.requiresCertification || false,
        certificationAuthority: data.certificationAuthority,
        validityPeriod: data.validityPeriod,
      },
      include: {
        _count: {
          select: {
            workerSkills: true,
            contractorSkills: true,
            trainingSkills: true,
            jobRequirements: true,
          },
        },
      },
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json(
      { error: 'Failed to create skill' },
      { status: 500 }
    );
  }
}