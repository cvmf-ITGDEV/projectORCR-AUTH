import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/server-auth';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const [
      totalApplications,
      draftApplications,
      submittedApplications,
      underReviewApplications,
      approvedApplications,
      rejectedApplications,
      receiptsData,
      recentApplications,
      recentReceipts,
    ] = await Promise.all([
      prisma.loanApplication.count(),
      prisma.loanApplication.count({ where: { status: 'DRAFT' } }),
      prisma.loanApplication.count({ where: { status: 'SUBMITTED' } }),
      prisma.loanApplication.count({ where: { status: 'UNDER_REVIEW' } }),
      prisma.loanApplication.count({ where: { status: 'APPROVED' } }),
      prisma.loanApplication.count({ where: { status: 'REJECTED' } }),
      prisma.receipt.aggregate({
        _count: true,
        _sum: { amount: true },
        where: { voidedAt: null },
      }),
      prisma.loanApplication.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          barangay: {
            include: {
              city: {
                include: {
                  province: {
                    include: { region: true },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.receipt.findMany({
        take: 5,
        orderBy: { issuedAt: 'desc' },
        include: {
          issuedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalApplications,
      draftApplications,
      submittedApplications,
      underReviewApplications,
      approvedApplications,
      rejectedApplications,
      totalReceipts: receiptsData._count,
      totalReceiptAmount: Number(receiptsData._sum.amount) || 0,
      recentApplications,
      recentReceipts,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('DATABASE_URL')) {
      return NextResponse.json(
        { error: 'Database configuration error. Please check DATABASE_URL.' },
        { status: 503 }
      );
    }

    if (errorMessage.includes('connect') || errorMessage.includes('Connection')) {
      return NextResponse.json(
        { error: 'Database connection failed. Please verify your database is accessible.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
