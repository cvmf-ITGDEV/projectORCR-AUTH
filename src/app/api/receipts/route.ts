import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

function generateReceiptNumber(type: 'OFFICIAL_RECEIPT' | 'COLLECTION_RECEIPT'): string {
  const prefix = type === 'OFFICIAL_RECEIPT' ? 'OR' : 'CR';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${prefix}-${year}-${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {
      voidedAt: null,
    };

    if (type && type !== 'ALL') {
      where.receiptType = type;
    }

    if (search) {
      where.OR = [
        { receiptNumber: { contains: search } },
        { payerName: { contains: search } },
      ];
    }

    const [receipts, total] = await Promise.all([
      prisma.receipt.findMany({
        where,
        include: {
          loanApplication: {
            select: {
              id: true,
              applicationNumber: true,
              firstName: true,
              lastName: true,
            },
          },
          issuedBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { issuedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.receipt.count({ where }),
    ]);

    return NextResponse.json({
      receipts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get receipts error:', error);
    return NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data = await request.json();

    if (!data.receiptType || !['OFFICIAL_RECEIPT', 'COLLECTION_RECEIPT'].includes(data.receiptType)) {
      return NextResponse.json({ error: 'Invalid receipt type' }, { status: 400 });
    }

    if (!data.amount || parseFloat(data.amount) <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    if (!data.payerName) {
      return NextResponse.json({ error: 'Payer name is required' }, { status: 400 });
    }

    if (!data.purpose) {
      return NextResponse.json({ error: 'Purpose is required' }, { status: 400 });
    }

    if (!data.paymentMethod) {
      return NextResponse.json({ error: 'Payment method is required' }, { status: 400 });
    }

    if (data.loanApplicationId) {
      const application = await prisma.loanApplication.findUnique({
        where: { id: data.loanApplicationId },
      });

      if (!application) {
        return NextResponse.json({ error: 'Loan application not found' }, { status: 404 });
      }

      if (application.status !== 'APPROVED') {
        return NextResponse.json(
          { error: 'Can only generate receipts for approved applications' },
          { status: 400 }
        );
      }
    }

    const receipt = await prisma.receipt.create({
      data: {
        receiptNumber: generateReceiptNumber(data.receiptType),
        receiptType: data.receiptType,
        amount: parseFloat(data.amount),
        paymentMethod: data.paymentMethod,
        paymentDetails: data.paymentDetails || null,
        purpose: data.purpose,
        payerName: data.payerName,
        payerAddress: data.payerAddress || null,
        remarks: data.remarks || null,
        loanApplicationId: data.loanApplicationId || null,
        issuedById: session.userId,
      },
      include: {
        loanApplication: {
          select: {
            id: true,
            applicationNumber: true,
            firstName: true,
            lastName: true,
          },
        },
        issuedBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        entityType: 'Receipt',
        entityId: receipt.id,
        action: 'CREATE',
        changes: JSON.stringify({
          receiptNumber: receipt.receiptNumber,
          receiptType: receipt.receiptType,
          amount: receipt.amount,
        }),
        userId: session.userId,
        userEmail: session.email,
      },
    });

    return NextResponse.json({ receipt }, { status: 201 });
  } catch (error) {
    console.error('Create receipt error:', error);
    return NextResponse.json({ error: 'Failed to create receipt' }, { status: 500 });
  }
}
