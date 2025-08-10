import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ScanStatus } from '@prisma/client';

// POST /api/scanner - Record scan result
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workerId, status, location, qrData } = body;

    // Validate required fields
    if (!workerId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: workerId, status' },
        { status: 400 }
      );
    }

    // Verify worker exists if status is SUCCESS
    if (status === 'SUCCESS') {
      const worker = await prisma.worker.findUnique({
        where: { id: workerId },
      });

      if (!worker) {
        return NextResponse.json(
          { error: 'Worker not found' },
          { status: 404 }
        );
      }

      // Update worker's last seen
      await prisma.worker.update({
        where: { id: workerId },
        data: { lastSeen: new Date() },
      });
    }

    // Create scan history record
    const scanRecord = await prisma.scanHistory.create({
      data: {
        workerId,
        status: status as ScanStatus,
        location,
        qrData,
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            status: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(scanRecord, { status: 201 });
  } catch (error) {
    console.error('Error recording scan:', error);
    return NextResponse.json(
      { error: 'Failed to record scan' },
      { status: 500 }
    );
  }
}

// GET /api/scanner - Get scan history with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get('workerId');
    const status = searchParams.get('status') as ScanStatus | null;
    const location = searchParams.get('location');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const scanHistory = await prisma.scanHistory.findMany({
      where: {
        ...(workerId && { workerId }),
        ...(status && { status }),
        ...(location && { location: { contains: location, mode: 'insensitive' } }),
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            status: true,
            role: true,
          },
        },
      },
      orderBy: {
        scannedAt: 'desc',
      },
      take: limit,
    });

    // Get scan statistics
    const stats = await prisma.scanHistory.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
      where: {
        scannedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today
        },
      },
    });

    const statsMap = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      scanHistory,
      count: scanHistory.length,
      todayStats: {
        success: statsMap.SUCCESS || 0,
        error: statsMap.ERROR || 0,
        notFound: statsMap.NOT_FOUND || 0,
        total: Object.values(statsMap).reduce((a, b) => a + b, 0),
      },
    });
  } catch (error) {
    console.error('Error fetching scan history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scan history' },
      { status: 500 }
    );
  }
}