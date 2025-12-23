import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();

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
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
