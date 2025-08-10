import { NextRequest, NextResponse } from 'next/server';
import { getIntegrationManager } from '@/lib/integrations/integration-manager';

export async function GET(request: NextRequest) {
  try {
    const integrationManager = getIntegrationManager();
    const healthStatus = await integrationManager.getHealthStatus();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...healthStatus,
    });
  } catch (error) {
    console.error('Error checking integration health:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check integration health',
        timestamp: new Date().toISOString(),
        overall: 'UNHEALTHY',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const integrationManager = getIntegrationManager();
    
    // Force refresh all connections
    const statuses = await integrationManager.checkAllConnections();
    
    const integrations: Record<string, unknown> = {};
    for (const [name, status] of statuses) {
      integrations[name] = status;
    }

    const connected = Array.from(statuses.values()).filter(s => s.isConnected).length;
    const total = statuses.size;

    let overall: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
    if (connected === total && total > 0) {
      overall = 'HEALTHY';
    } else if (connected > 0) {
      overall = 'DEGRADED';
    } else {
      overall = 'UNHEALTHY';
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      overall,
      integrations,
      summary: {
        total,
        connected,
        disconnected: total - connected,
      },
      refreshed: true,
    });
  } catch (error) {
    console.error('Error refreshing integration health:', error);
    return NextResponse.json(
      { 
        error: 'Failed to refresh integration health',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}