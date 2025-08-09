import { NextRequest, NextResponse } from 'next/server';
import { getWorkforceOptimizationEngine, WorkTask, WorkerWithSkills } from '@/lib/ai/workforce-optimization';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const timeframe = searchParams.get('timeframe') as 'DAILY' | 'WEEKLY' | 'MONTHLY' || 'WEEKLY';

    const engine = getWorkforceOptimizationEngine();

    switch (action) {
      case 'predict-needs':
        const seasonality = searchParams.get('seasonality') === 'true';
        const weatherConditions = searchParams.get('weather') as 'GOOD' | 'POOR' | 'EXTREME' || 'GOOD';
        
        const prediction = await engine.predictWorkforceNeeds(timeframe, {
          seasonality,
          weatherConditions,
          projectDeadlines: [], // Could be parsed from query params
          equipmentMaintenance: [], // Could be parsed from query params
        });

        return NextResponse.json({
          action: 'predict-needs',
          timeframe,
          prediction,
          generatedAt: new Date().toISOString(),
        });

      case 'current-metrics':
        // Return current workforce metrics (would implement actual metrics collection)
        return NextResponse.json({
          action: 'current-metrics',
          metrics: {
            totalWorkers: 85,
            availableWorkers: 72,
            utilization: 0.78,
            skillCoverage: {
              'OPERATOR': 0.82,
              'TECHNICAL': 0.65,
              'SAFETY': 0.91,
              'MAINTENANCE': 0.58,
              'SUPERVISOR': 0.71,
            },
            costEfficiency: 0.74,
            productivityScore: 0.81,
            burnoutRisk: 0.23,
          },
          generatedAt: new Date().toISOString(),
        });

      default:
        return NextResponse.json({
          message: 'Available actions: predict-needs, current-metrics',
          supportedTimeframes: ['DAILY', 'WEEKLY', 'MONTHLY'],
          generatedAt: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error('Error in workforce optimization:', error);
    return NextResponse.json(
      { 
        error: 'Workforce optimization failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tasks, constraints } = body;

    const engine = getWorkforceOptimizationEngine();

    switch (action) {
      case 'optimize-assignments':
        if (!tasks || !Array.isArray(tasks)) {
          return NextResponse.json(
            { error: 'tasks array is required for assignment optimization' },
            { status: 400 }
          );
        }

        const optimization = await engine.optimizeTaskAssignments(tasks as WorkTask[]);
        
        return NextResponse.json({
          action: 'optimize-assignments',
          optimization,
          taskCount: tasks.length,
          assignmentCount: optimization.assignments.length,
          generatedAt: new Date().toISOString(),
        });

      case 'optimize-schedules':
        if (!constraints) {
          return NextResponse.json(
            { error: 'constraints object is required for schedule optimization' },
            { status: 400 }
          );
        }

        // Get workers from database (simplified - would implement proper filtering)
        const workers: WorkerWithSkills[] = []; // Would fetch actual worker data
        const schedules = await engine.optimizeShiftSchedules(workers, {
          shiftLength: constraints.shiftLength || 8,
          maxConsecutiveDays: constraints.maxConsecutiveDays || 5,
          minRestHours: constraints.minRestHours || 12,
          coverage24h: constraints.coverage24h || false,
        });

        return NextResponse.json({
          action: 'optimize-schedules',
          schedules,
          workerCount: workers.length,
          generatedAt: new Date().toISOString(),
        });

      case 'initialize':
        await engine.initialize();
        
        return NextResponse.json({
          message: 'Workforce optimization engine initialized successfully',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in workforce optimization action:', error);
    return NextResponse.json(
      { 
        error: 'Action failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}