import { NextRequest, NextResponse } from 'next/server';
import { getSession, canApproveApplications } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { action, rejectionReason } = await request.json();

    const application = await prisma.loanApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case 'review':
        if (application.status !== 'SUBMITTED') {
          return NextResponse.json(
            { error: 'Only submitted applications can be marked for review' },
            { status: 400 }
          );
        }
        updateData = {
          status: 'UNDER_REVIEW',
          processedById: session.userId,
        };
        break;

      case 'approve':
        if (!canApproveApplications(session.role)) {
          return NextResponse.json(
            { error: 'You do not have permission to approve applications' },
            { status: 403 }
          );
        }
        if (application.status !== 'UNDER_REVIEW') {
          return NextResponse.json(
            { error: 'Only applications under review can be approved' },
            { status: 400 }
          );
        }
        updateData = {
          status: 'APPROVED',
          approvedById: session.userId,
          approvedAt: new Date(),
        };
        break;

      case 'reject':
        if (!canApproveApplications(session.role)) {
          return NextResponse.json(
            { error: 'You do not have permission to reject applications' },
            { status: 403 }
          );
        }
        if (application.status !== 'UNDER_REVIEW') {
          return NextResponse.json(
            { error: 'Only applications under review can be rejected' },
            { status: 400 }
          );
        }
        if (!rejectionReason) {
          return NextResponse.json(
            { error: 'Rejection reason is required' },
            { status: 400 }
          );
        }
        updateData = {
          status: 'REJECTED',
          approvedById: session.userId,
          rejectedAt: new Date(),
          rejectionReason,
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updatedApplication = await prisma.loanApplication.update({
      where: { id },
      data: updateData,
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
        processedBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        approvedBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        entityType: 'LoanApplication',
        entityId: id,
        action: action.toUpperCase(),
        changes: JSON.stringify({ from: application.status, to: updateData.status, rejectionReason }),
        userId: session.userId,
        userEmail: session.email,
      },
    });

    return NextResponse.json({ application: updatedApplication });
  } catch (error) {
    console.error('Update application status error:', error);
    return NextResponse.json({ error: 'Failed to update application status' }, { status: 500 });
  }
}
