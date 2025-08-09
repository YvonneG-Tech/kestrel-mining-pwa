import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/workers/[id] - Get specific worker
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const worker = await prisma.worker.findUnique({
      where: { id },
      include: {
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
        scanHistory: {
          orderBy: { scannedAt: 'desc' },
          take: 20, // Last 20 scans
        },
        _count: {
          select: {
            documents: true,
            scanHistory: true,
          },
        },
      },
    });

    if (!worker) {
      return NextResponse.json(
        { error: 'Worker not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(worker);
  } catch (error) {
    console.error('Error fetching worker:', error);
    return NextResponse.json(
      { error: 'Failed to fetch worker' },
      { status: 500 }
    );
  }
}

// PUT /api/workers/[id] - Update worker
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, role, department, status } = body;

    const worker = await prisma.worker.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(role && { role }),
        ...(department !== undefined && { department }),
        ...(status && { status }),
      },
      include: {
        documents: true,
        _count: {
          select: {
            documents: true,
            scanHistory: true,
          },
        },
      },
    });

    return NextResponse.json(worker);
  } catch (error) {
    console.error('Error updating worker:', error);
    return NextResponse.json(
      { error: 'Failed to update worker' },
      { status: 500 }
    );
  }
}

// DELETE /api/workers/[id] - Delete worker
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.worker.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Worker deleted successfully' });
  } catch (error) {
    console.error('Error deleting worker:', error);
    return NextResponse.json(
      { error: 'Failed to delete worker' },
      { status: 500 }
    );
  }
}