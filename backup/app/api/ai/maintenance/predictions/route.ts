import { NextRequest, NextResponse } from 'next/server';
import { getPredictiveMaintenanceEngine } from '@/lib/ai/predictive-maintenance';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const equipmentId = searchParams.get('equipmentId');

    const engine = getPredictiveMaintenanceEngine();

    if (equipmentId) {
      // Get prediction for specific equipment
      const prediction = await engine.predictMaintenance(equipmentId);
      
      return NextResponse.json({
        equipmentId,
        prediction,
        generatedAt: new Date().toISOString(),
      });
    } else {
      // Get all maintenance alerts
      const alerts = await engine.generateMaintenanceAlerts();
      
      return NextResponse.json({
        alerts,
        alertCount: alerts.length,
        critical: alerts.filter(a => a.severity === 'CRITICAL').length,
        warnings: alerts.filter(a => a.severity === 'WARNING').length,
        generatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error generating maintenance predictions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate maintenance predictions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, equipmentId } = body;

    const engine = getPredictiveMaintenanceEngine();

    switch (action) {
      case 'initialize':
        await engine.initialize();
        return NextResponse.json({
          message: 'Predictive maintenance engine initialized',
          timestamp: new Date().toISOString(),
        });

      case 'retrain':
        await engine.initialize();
        return NextResponse.json({
          message: 'Models retrained with latest data',
          timestamp: new Date().toISOString(),
        });

      case 'predict':
        if (!equipmentId) {
          return NextResponse.json(
            { error: 'equipmentId is required for prediction' },
            { status: 400 }
          );
        }

        const prediction = await engine.predictMaintenance(equipmentId);
        return NextResponse.json({
          action: 'predict',
          equipmentId,
          prediction,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in maintenance prediction action:', error);
    return NextResponse.json(
      { 
        error: 'Action failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}