import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

function generateApplicationNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `LA-${year}-${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { applicationNumber: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [applications, total] = await Promise.all([
      prisma.loanApplication.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.loanApplication.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data = await request.json();

    const application = await prisma.loanApplication.create({
      data: {
        applicationNumber: generateApplicationNumber(),
        status: data.status || 'DRAFT',
        firstName: data.firstName,
        middleName: data.middleName || null,
        lastName: data.lastName,
        suffix: data.suffix || null,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        civilStatus: data.civilStatus,
        nationality: data.nationality || 'Filipino',
        email: data.email || null,
        mobileNumber: data.mobileNumber,
        telephoneNumber: data.telephoneNumber || null,
        streetAddress: data.streetAddress,
        barangayId: data.barangayId,
        zipCode: data.zipCode || null,
        sameAsPresent: data.sameAsPresent ?? true,
        permanentStreetAddress: data.sameAsPresent ? null : data.permanentStreetAddress,
        permanentBarangayId: data.sameAsPresent ? null : data.permanentBarangayId,
        permanentZipCode: data.sameAsPresent ? null : data.permanentZipCode,
        employmentStatus: data.employmentStatus,
        employerName: data.employerName || null,
        employerAddress: data.employerAddress || null,
        position: data.position || null,
        yearsEmployed: data.yearsEmployed ? parseInt(data.yearsEmployed) : null,
        monthlyIncome: parseFloat(data.monthlyIncome),
        otherIncome: data.otherIncome ? parseFloat(data.otherIncome) : null,
        incomeSource: data.incomeSource || null,
        loanPurpose: data.loanPurpose,
        loanAmount: parseFloat(data.loanAmount),
        loanTerm: parseInt(data.loanTerm),
        interestRate: parseFloat(data.interestRate || '12'),
        monthlyPayment: calculateMonthlyPayment(
          parseFloat(data.loanAmount),
          parseFloat(data.interestRate || '12'),
          parseInt(data.loanTerm)
        ),
        coMakerName: data.coMakerName || null,
        coMakerAddress: data.coMakerAddress || null,
        coMakerContact: data.coMakerContact || null,
        coMakerRelationship: data.coMakerRelationship || null,
        validIdType: data.validIdType || null,
        validIdNumber: data.validIdNumber || null,
        validIdExpiry: data.validIdExpiry ? new Date(data.validIdExpiry) : null,
        processedById: session.userId,
        submittedAt: data.status === 'SUBMITTED' ? new Date() : null,
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error('Create application error:', error);
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const data = await request.json();

    if (!data.id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    const existingApplication = await prisma.loanApplication.findUnique({
      where: { id: data.id },
    });

    if (!existingApplication) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const application = await prisma.loanApplication.update({
      where: { id: data.id },
      data: {
        status: data.status || existingApplication.status,
        firstName: data.firstName,
        middleName: data.middleName || null,
        lastName: data.lastName,
        suffix: data.suffix || null,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        civilStatus: data.civilStatus,
        nationality: data.nationality || 'Filipino',
        email: data.email || null,
        mobileNumber: data.mobileNumber,
        telephoneNumber: data.telephoneNumber || null,
        streetAddress: data.streetAddress,
        barangayId: data.barangayId,
        zipCode: data.zipCode || null,
        sameAsPresent: data.sameAsPresent ?? true,
        permanentStreetAddress: data.sameAsPresent ? null : data.permanentStreetAddress,
        permanentBarangayId: data.sameAsPresent ? null : data.permanentBarangayId,
        permanentZipCode: data.sameAsPresent ? null : data.permanentZipCode,
        employmentStatus: data.employmentStatus,
        employerName: data.employerName || null,
        employerAddress: data.employerAddress || null,
        position: data.position || null,
        yearsEmployed: data.yearsEmployed ? parseInt(data.yearsEmployed) : null,
        monthlyIncome: parseFloat(data.monthlyIncome),
        otherIncome: data.otherIncome ? parseFloat(data.otherIncome) : null,
        incomeSource: data.incomeSource || null,
        loanPurpose: data.loanPurpose,
        loanAmount: parseFloat(data.loanAmount),
        loanTerm: parseInt(data.loanTerm),
        interestRate: parseFloat(data.interestRate || '12'),
        monthlyPayment: calculateMonthlyPayment(
          parseFloat(data.loanAmount),
          parseFloat(data.interestRate || '12'),
          parseInt(data.loanTerm)
        ),
        coMakerName: data.coMakerName || null,
        coMakerAddress: data.coMakerAddress || null,
        coMakerContact: data.coMakerContact || null,
        coMakerRelationship: data.coMakerRelationship || null,
        validIdType: data.validIdType || null,
        validIdNumber: data.validIdNumber || null,
        validIdExpiry: data.validIdExpiry ? new Date(data.validIdExpiry) : null,
        submittedAt: data.status === 'SUBMITTED' && !existingApplication.submittedAt ? new Date() : existingApplication.submittedAt,
      },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

function calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
  const totalInterest = principal * (annualRate / 100) * (termMonths / 12);
  const totalAmount = principal + totalInterest;
  return totalAmount / termMonths;
}
