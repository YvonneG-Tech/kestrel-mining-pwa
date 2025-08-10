import { NextRequest, NextResponse } from 'next/server';
import { getIntegrationManager } from '@/lib/integrations/integration-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const location = searchParams.get('location');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const result = searchParams.get('result');
    const limit = searchParams.get('limit');

    const integrationManager = getIntegrationManager();
    const gallagher = integrationManager.getGallagher();

    if (!gallagher) {
      return NextResponse.json(
        { error: 'Gallagher integration not configured' },
        { status: 503 }
      );
    }

    // If employeeId is provided, get events for specific worker
    if (employeeId) {
      const eventsResult = await gallagher.getWorkerAccessEvents(
        employeeId,
        fromDate ? new Date(fromDate) : undefined
      );

      if (!eventsResult.success) {
        return NextResponse.json(
          { error: eventsResult.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        employeeId,
        events: eventsResult.data || [],
        count: eventsResult.data?.length || 0,
      });
    }

    // Otherwise get events with filters
    const filters: Record<string, unknown> = {};
    
    if (location) filters.location = location;
    if (fromDate) filters.fromDate = new Date(fromDate);
    if (toDate) filters.toDate = new Date(toDate);
    if (result) filters.result = result;
    if (limit) filters.limit = parseInt(limit);

    const eventsResult = await gallagher.getEvents(filters);

    if (!eventsResult.success) {
      return NextResponse.json(
        { error: eventsResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      events: eventsResult.data || [],
      count: eventsResult.data?.length || 0,
      filters,
    });
  } catch (error) {
    console.error('Error fetching Gallagher events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Gallagher events' },
      { status: 500 }
    );
  }
}