import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DocumentType, DocumentStatus } from '@prisma/client';

// GET /api/documents - Get all documents with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as DocumentType | null;
    const status = searchParams.get('status') as DocumentStatus | null;
    const workerId = searchParams.get('workerId');
    const search = searchParams.get('search');
    
    const documents = await prisma.document.findMany({
      where: {
        ...(type && { type }),
        ...(status && { status }),
        ...(workerId && { workerId }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            employeeId: true,
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    // Calculate document status based on expiry date
    const documentsWithStatus = documents.map(doc => {
      let calculatedStatus: DocumentStatus = 'VALID';
      
      if (doc.expiryDate) {
        const now = new Date();
        const expiryDate = new Date(doc.expiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
          calculatedStatus = 'EXPIRED';
        } else if (daysUntilExpiry <= 30) {
          calculatedStatus = 'EXPIRING';
        }
      }
      
      return {
        ...doc,
        status: calculatedStatus,
      };
    });

    return NextResponse.json({ 
      documents: documentsWithStatus, 
      count: documentsWithStatus.length 
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Create new document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      type, 
      description, 
      workerId, 
      expiryDate,
      fileName,
      fileSize 
    } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type' },
        { status: 400 }
      );
    }

    // Calculate initial status based on expiry date
    let status: DocumentStatus = 'VALID';
    if (expiryDate) {
      const now = new Date();
      const expiry = new Date(expiryDate);
      const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry < 0) {
        status = 'EXPIRED';
      } else if (daysUntilExpiry <= 30) {
        status = 'EXPIRING';
      }
    }

    const document = await prisma.document.create({
      data: {
        name,
        type,
        status,
        description,
        fileName,
        fileSize,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        ...(workerId && { workerId }),
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            employeeId: true,
          },
        },
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}