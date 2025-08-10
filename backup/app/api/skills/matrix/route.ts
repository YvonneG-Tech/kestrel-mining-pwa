import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const role = searchParams.get('role');
    const skillCategory = searchParams.get('skillCategory');

    // Build filters
    const workerWhere: Record<string, unknown> = {};
    const skillWhere: Record<string, unknown> = {};

    if (department) {
      workerWhere.department = department;
    }

    if (role) {
      workerWhere.role = { contains: role, mode: 'insensitive' };
    }

    if (skillCategory) {
      skillWhere.category = skillCategory;
    }

    // Get workers with their skills
    const workers = await prisma.worker.findMany({
      where: {
        status: 'ACTIVE',
        ...workerWhere,
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
          where: {
            skill: skillWhere,
          },
        },
      },
      orderBy: [
        { department: 'asc' },
        { role: 'asc' },
        { name: 'asc' },
      ],
    });

    // Get all skills for the matrix headers
    const allSkills = await prisma.skill.findMany({
      where: skillWhere,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    // Get job requirements for comparison
    const jobRequirements = await prisma.jobSkillRequirement.findMany({
      where: {
        ...(department && { department }),
        ...(role && { jobTitle: { contains: role, mode: 'insensitive' } }),
      },
      include: {
        skill: true,
      },
    });

    // Build the skills matrix
    const matrix = workers.map(worker => {
      const skillsMap = new Map(
        worker.skills.map(ws => [ws.skillId, ws])
      );

      const skillLevels = allSkills.map(skill => {
        const workerSkill = skillsMap.get(skill.id);
        
        return {
          skillId: skill.id,
          skillName: skill.name,
          skillCategory: skill.category,
          level: workerSkill?.level || null,
          experienceYears: workerSkill?.experienceYears || null,
          verified: workerSkill?.verified || false,
          certified: workerSkill?.certified || false,
          expiryDate: workerSkill?.expiryDate || null,
          isExpiringSoon: workerSkill?.expiryDate ? 
            new Date(workerSkill.expiryDate).getTime() < Date.now() + (30 * 24 * 60 * 60 * 1000) :
            false,
        };
      });

      return {
        workerId: worker.id,
        workerName: worker.name,
        employeeId: worker.employeeId,
        role: worker.role,
        department: worker.department,
        skills: skillLevels,
      };
    });

    // Calculate summary statistics
    const summary = {
      totalWorkers: workers.length,
      totalSkills: allSkills.length,
      skillsDistribution: allSkills.map(skill => {
        const workersWithSkill = workers.filter(worker =>
          worker.skills.some(ws => ws.skillId === skill.id)
        );
        
        const levels = ['BASIC', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
        const levelCounts = levels.reduce((acc, level) => {
          acc[level.toLowerCase()] = workersWithSkill.filter(worker =>
            worker.skills.find(ws => ws.skillId === skill.id)?.level === level
          ).length;
          return acc;
        }, {} as Record<string, number>);

        return {
          skillId: skill.id,
          skillName: skill.name,
          category: skill.category,
          totalWorkers: workersWithSkill.length,
          verified: workersWithSkill.filter(worker =>
            worker.skills.find(ws => ws.skillId === skill.id)?.verified
          ).length,
          certified: workersWithSkill.filter(worker =>
            worker.skills.find(ws => ws.skillId === skill.id)?.certified
          ).length,
          levelBreakdown: levelCounts,
        };
      }),
      gapAnalysis: jobRequirements.map(req => {
        const workersWithRequiredSkill = workers.filter(worker =>
          worker.skills.some(ws => 
            ws.skillId === req.skillId && 
            ['INTERMEDIATE', 'ADVANCED', 'EXPERT'].includes(ws.level || '') &&
            ws.verified
          )
        );

        return {
          jobTitle: req.jobTitle,
          department: req.department,
          skill: req.skill.name,
          requiredLevel: req.requiredLevel,
          currentlyQualified: workersWithRequiredSkill.length,
          gap: Math.max(0, workers.length - workersWithRequiredSkill.length),
        };
      }),
    };

    return NextResponse.json({
      matrix,
      summary,
      skills: allSkills,
      jobRequirements,
    });
  } catch (error) {
    console.error('Error generating skills matrix:', error);
    return NextResponse.json(
      { error: 'Failed to generate skills matrix' },
      { status: 500 }
    );
  }
}