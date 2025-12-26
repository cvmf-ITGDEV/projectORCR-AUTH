import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';

config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const adapter = new PrismaMssql(process.env.DATABASE_URL);
const prisma = new PrismaClient({
  adapter: adapter as never,
  log: ['error', 'warn'],
});

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
}

const filipinoFirstNames = [
  'Maria', 'Jose', 'Juan', 'Ana', 'Antonio', 'Rosa', 'Pedro', 'Carmen', 'Luis', 'Teresa',
  'Carlos', 'Luz', 'Miguel', 'Elena', 'Ramon', 'Rosario', 'Francisco', 'Josefa', 'Manuel', 'Angela'
];

const filipinoLastNames = [
  'Reyes', 'Santos', 'Cruz', 'Garcia', 'Dela Cruz', 'Ramos', 'Mendoza', 'Torres', 'Lopez', 'Gonzales',
  'Rodriguez', 'Fernandez', 'Perez', 'Alvarez', 'Ramirez', 'Flores', 'Castro', 'Rivera', 'Morales', 'Aquino'
];

const barangayNames = [
  'San Antonio', 'Santa Cruz', 'San Jose', 'Poblacion', 'Santo Niño', 'San Roque',
  'Barangay 1', 'Bagong Silang', 'Maligaya', 'Pag-asa', 'Riverside', 'Greenfield',
  'San Isidro', 'Santa Maria', 'San Pedro'
];

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');

  await prisma.auditLog.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.receipt.deleteMany({});
  await prisma.loanApplication.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.barangay.deleteMany({});
  await prisma.city.deleteMany({});
  await prisma.province.deleteMany({});
  await prisma.region.deleteMany({});
  await prisma.systemSetting.deleteMany({});

  console.log('✅ Database cleared');
}

async function seedRegions() {
  console.log('📍 Seeding regions...');

  const regions = [
    { id: 'NCR', name: 'National Capital Region' },
    { id: 'CAR', name: 'Cordillera Administrative Region' },
    { id: 'R01', name: 'Region I - Ilocos Region' },
    { id: 'R02', name: 'Region II - Cagayan Valley' },
    { id: 'R03', name: 'Region III - Central Luzon' },
    { id: 'R04A', name: 'Region IV-A - CALABARZON' },
    { id: 'R04B', name: 'Region IV-B - MIMAROPA' },
    { id: 'R05', name: 'Region V - Bicol Region' },
    { id: 'R06', name: 'Region VI - Western Visayas' },
    { id: 'R07', name: 'Region VII - Central Visayas' },
    { id: 'R08', name: 'Region VIII - Eastern Visayas' },
    { id: 'R09', name: 'Region IX - Zamboanga Peninsula' },
    { id: 'R10', name: 'Region X - Northern Mindanao' },
    { id: 'R11', name: 'Region XI - Davao Region' },
    { id: 'R12', name: 'Region XII - SOCCSKSARGEN' },
  ];

  for (const region of regions) {
    await prisma.region.create({ data: region });
  }

  console.log(`✅ Created ${regions.length} regions`);
  return regions;
}

async function seedProvinces(regions: any[]) {
  console.log('🏛️  Seeding provinces...');

  const provinces = [
    { id: 'MNL', name: 'Metro Manila', regionId: 'NCR' },
    { id: 'BEN', name: 'Benguet', regionId: 'CAR' },
    { id: 'ILN', name: 'Ilocos Norte', regionId: 'R01' },
    { id: 'PAN', name: 'Pangasinan', regionId: 'R01' },
    { id: 'CAG', name: 'Cagayan', regionId: 'R02' },
    { id: 'BUL', name: 'Bulacan', regionId: 'R03' },
    { id: 'PAM', name: 'Pampanga', regionId: 'R03' },
    { id: 'CAV', name: 'Cavite', regionId: 'R04A' },
    { id: 'LAG', name: 'Laguna', regionId: 'R04A' },
    { id: 'RIZ', name: 'Rizal', regionId: 'R04A' },
    { id: 'ALB', name: 'Albay', regionId: 'R05' },
    { id: 'ILO', name: 'Iloilo', regionId: 'R06' },
    { id: 'CEB', name: 'Cebu', regionId: 'R07' },
    { id: 'BOH', name: 'Bohol', regionId: 'R07' },
    { id: 'DAV', name: 'Davao del Sur', regionId: 'R11' },
  ];

  for (const province of provinces) {
    await prisma.province.create({ data: province });
  }

  console.log(`✅ Created ${provinces.length} provinces`);
  return provinces;
}

async function seedCities(provinces: any[]) {
  console.log('🏙️  Seeding cities...');

  const cities = [
    { id: 'QC', name: 'Quezon City', provinceId: 'MNL' },
    { id: 'MNL-CITY', name: 'Manila', provinceId: 'MNL' },
    { id: 'MAK', name: 'Makati', provinceId: 'MNL' },
    { id: 'BGO', name: 'Baguio City', provinceId: 'BEN' },
    { id: 'LAO', name: 'Laoag City', provinceId: 'ILN' },
    { id: 'DAG', name: 'Dagupan City', provinceId: 'PAN' },
    { id: 'TUG', name: 'Tuguegarao City', provinceId: 'CAG' },
    { id: 'MAL', name: 'Malolos City', provinceId: 'BUL' },
    { id: 'SFD', name: 'San Fernando City', provinceId: 'PAM' },
    { id: 'CAV-CITY', name: 'Cavite City', provinceId: 'CAV' },
    { id: 'STA', name: 'Santa Rosa City', provinceId: 'LAG' },
    { id: 'ANT', name: 'Antipolo City', provinceId: 'RIZ' },
    { id: 'LEG', name: 'Legazpi City', provinceId: 'ALB' },
    { id: 'ILO-CITY', name: 'Iloilo City', provinceId: 'ILO' },
    { id: 'CEB-CITY', name: 'Cebu City', provinceId: 'CEB' },
    { id: 'TAG', name: 'Tagbilaran City', provinceId: 'BOH' },
    { id: 'DAV-CITY', name: 'Davao City', provinceId: 'DAV' },
  ];

  for (const city of cities) {
    await prisma.city.create({ data: city });
  }

  console.log(`✅ Created ${cities.length} cities`);
  return cities;
}

async function seedBarangays(cities: any[]) {
  console.log('🏘️  Seeding barangays...');

  const barangays = [];
  let counter = 1;

  for (const city of cities.slice(0, 10)) {
    for (let i = 0; i < 2; i++) {
      barangays.push({
        id: `BRG-${counter.toString().padStart(4, '0')}`,
        name: barangayNames[Math.floor(Math.random() * barangayNames.length)],
        cityId: city.id,
      });
      counter++;
    }
  }

  for (const barangay of barangays) {
    await prisma.barangay.create({ data: barangay });
  }

  console.log(`✅ Created ${barangays.length} barangays`);
  return barangays;
}

async function seedUsers() {
  console.log('👥 Seeding users...');

  const hashedPassword = await bcrypt.hash('Password123!', 10);
  const baseDate = new Date('2024-01-01');
  const users = [];
  const usedEmails = new Set<string>();

  const demoAccounts = [
    { email: 'admin@lending.ph', firstName: 'Admin', lastName: 'User', role: 'ADMIN' },
    { email: 'processor@lending.ph', firstName: 'Processor', lastName: 'User', role: 'PROCESSOR' },
    { email: 'approver@lending.ph', firstName: 'Approver', lastName: 'User', role: 'APPROVER' },
  ];

  for (const account of demoAccounts) {
    const createdAt = baseDate;
    const updatedAt = addDays(createdAt, 1);

    const user = await prisma.user.create({
      data: {
        email: account.email,
        password: hashedPassword,
        firstName: account.firstName,
        lastName: account.lastName,
        role: account.role,
        isActive: true,
        createdAt,
        updatedAt,
      },
    });
    users.push(user);
    usedEmails.add(account.email);
  }

  const roles = [
    { role: 'ADMIN', count: 2 },
    { role: 'PROCESSOR', count: 5 },
    { role: 'APPROVER', count: 2 },
  ];

  let userCounter = 1;

  for (const { role, count } of roles) {
    for (let i = 0; i < count; i++) {
      const firstName = filipinoFirstNames[Math.floor(Math.random() * filipinoFirstNames.length)];
      const lastName = filipinoLastNames[Math.floor(Math.random() * filipinoLastNames.length)];
      const createdAt = randomDate(baseDate, new Date());
      const updatedAt = addDays(createdAt, Math.floor(Math.random() * 7) + 1);

      let email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(' ', '')}${userCounter}@lending.ph`;

      while (usedEmails.has(email)) {
        userCounter++;
        email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(' ', '')}${userCounter}@lending.ph`;
      }

      usedEmails.add(email);
      userCounter++;

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role,
          isActive: Math.random() > 0.1,
          createdAt,
          updatedAt,
        },
      });
      users.push(user);
    }
  }

  console.log(`✅ Created ${users.length} users (including 3 demo accounts)`);
  return users;
}

async function seedLoanApplications(users: any[], barangays: any[]) {
  console.log('💰 Seeding loan applications...');

  const statuses = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];
  const genders = ['Male', 'Female'];
  const civilStatuses = ['Single', 'Married', 'Widowed', 'Separated'];
  const employmentStatuses = ['Employed', 'Self-Employed', 'Business Owner', 'Retired'];
  const loanPurposes = ['Business Capital', 'Home Improvement', 'Education', 'Medical', 'Personal'];
  const loanTerms = [6, 12, 24, 36];
  const idTypes = ['Government ID', 'SSS', 'PhilHealth', "Driver's License", 'Passport'];

  const processors = users.filter(u => u.role === 'PROCESSOR');
  const approvers = users.filter(u => u.role === 'APPROVER');
  const applications = [];
  const baseDate = new Date('2024-06-01');

  for (let i = 0; i < 15; i++) {
    const firstName = filipinoFirstNames[Math.floor(Math.random() * filipinoFirstNames.length)];
    const lastName = filipinoLastNames[Math.floor(Math.random() * filipinoLastNames.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const loanAmount = Math.floor(Math.random() * 490000) + 10000;
    const loanTerm = loanTerms[Math.floor(Math.random() * loanTerms.length)];
    const interestRate = parseFloat((Math.random() * 12 + 3).toFixed(2));
    const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTerm);
    const monthlyIncome = Math.floor(Math.random() * 80000) + 20000;

    const createdAt = randomDate(baseDate, new Date());
    const updatedAt = addDays(createdAt, Math.floor(Math.random() * 5) + 1);

    let submittedAt = null;
    let approvedAt = null;
    let rejectedAt = null;
    let processedById = null;
    let approvedById = null;

    if (['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].includes(status)) {
      submittedAt = addDays(createdAt, Math.floor(Math.random() * 3) + 1);
      processedById = processors[Math.floor(Math.random() * processors.length)].id;
    }

    if (status === 'APPROVED') {
      approvedAt = addDays(submittedAt!, Math.floor(Math.random() * 7) + 3);
      approvedById = approvers[Math.floor(Math.random() * approvers.length)].id;
    }

    if (status === 'REJECTED') {
      rejectedAt = addDays(submittedAt!, Math.floor(Math.random() * 7) + 3);
    }

    const barangay = barangays[Math.floor(Math.random() * barangays.length)];
    const hasCoMaker = Math.random() > 0.5;

    const application = await prisma.loanApplication.create({
      data: {
        applicationNumber: `LN-2024-${(i + 1).toString().padStart(4, '0')}`,
        status,
        firstName,
        middleName: Math.random() > 0.5 ? filipinoFirstNames[Math.floor(Math.random() * filipinoFirstNames.length)] : null,
        lastName,
        suffix: Math.random() > 0.9 ? 'Jr.' : null,
        dateOfBirth: new Date(1959 + Math.floor(Math.random() * 45), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: genders[Math.floor(Math.random() * genders.length)],
        civilStatus: civilStatuses[Math.floor(Math.random() * civilStatuses.length)],
        nationality: 'Filipino',
        email: Math.random() > 0.3 ? `${firstName.toLowerCase()}${lastName.toLowerCase().replace(' ', '')}@email.com` : null,
        mobileNumber: `09${Math.floor(Math.random() * 900000000) + 100000000}`,
        telephoneNumber: Math.random() > 0.6 ? `(02) ${Math.floor(Math.random() * 9000000) + 1000000}` : null,
        streetAddress: `${Math.floor(Math.random() * 500) + 1} ${['Main St', 'Rizal Ave', 'Bonifacio St', 'Luna St', 'Del Pilar St'][Math.floor(Math.random() * 5)]}`,
        barangayId: barangay.id,
        zipCode: (1000 + Math.floor(Math.random() * 8000)).toString(),
        permanentStreetAddress: Math.random() > 0.7 ? `${Math.floor(Math.random() * 500) + 1} ${['Main St', 'Rizal Ave'][Math.floor(Math.random() * 2)]}` : null,
        permanentBarangayId: Math.random() > 0.7 ? barangays[Math.floor(Math.random() * barangays.length)].id : null,
        permanentZipCode: Math.random() > 0.7 ? (1000 + Math.floor(Math.random() * 8000)).toString() : null,
        sameAsPresent: Math.random() > 0.3,
        employmentStatus: employmentStatuses[Math.floor(Math.random() * employmentStatuses.length)],
        employerName: ['ABC Corporation', 'XYZ Trading', 'Manila Enterprises', 'Golden Star Inc', 'Metro Business Solutions'][Math.floor(Math.random() * 5)],
        employerAddress: `${Math.floor(Math.random() * 200) + 1} Business District, Metro Manila`,
        position: ['Manager', 'Supervisor', 'Staff', 'Officer', 'Specialist'][Math.floor(Math.random() * 5)],
        yearsEmployed: Math.floor(Math.random() * 20) + 1,
        monthlyIncome,
        otherIncome: Math.random() > 0.6 ? Math.floor(Math.random() * 20000) + 5000 : null,
        incomeSource: Math.random() > 0.6 ? 'Side Business' : null,
        loanPurpose: loanPurposes[Math.floor(Math.random() * loanPurposes.length)],
        loanAmount,
        loanTerm,
        interestRate,
        monthlyPayment,
        coMakerName: hasCoMaker ? `${filipinoFirstNames[Math.floor(Math.random() * filipinoFirstNames.length)]} ${filipinoLastNames[Math.floor(Math.random() * filipinoLastNames.length)]}` : null,
        coMakerAddress: hasCoMaker ? `${Math.floor(Math.random() * 500) + 1} Somewhere St, Manila` : null,
        coMakerContact: hasCoMaker ? `09${Math.floor(Math.random() * 900000000) + 100000000}` : null,
        coMakerRelationship: hasCoMaker ? ['Spouse', 'Parent', 'Sibling', 'Friend', 'Colleague'][Math.floor(Math.random() * 5)] : null,
        validIdType: idTypes[Math.floor(Math.random() * idTypes.length)],
        validIdNumber: `${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.floor(Math.random() * 90000) + 10000}`,
        validIdExpiry: new Date(2025 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        remarks: status === 'APPROVED' ? 'All documents verified and approved' : null,
        rejectionReason: status === 'REJECTED' ? 'Insufficient income to support loan amount' : null,
        processedById,
        approvedById,
        submittedAt,
        approvedAt,
        rejectedAt,
        createdAt,
        updatedAt,
      },
    });

    applications.push(application);
  }

  console.log(`✅ Created ${applications.length} loan applications`);
  return applications;
}

async function seedDocuments(applications: any[]) {
  console.log('📄 Seeding documents...');

  const documentTypes = ['Valid ID', 'Proof of Income', 'Proof of Billing', 'Employment Certificate', 'Bank Statement'];
  const fileTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  const extensions = ['pdf', 'jpg', 'png'];
  const documents = [];

  for (const app of applications.filter(a => ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].includes(a.status))) {
    const numDocs = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < numDocs; i++) {
      const docType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
      const fileTypeIdx = Math.floor(Math.random() * fileTypes.length);
      const fileName = `${docType.toLowerCase().replace(/\s/g, '_')}_${app.applicationNumber}_${i + 1}.${extensions[fileTypeIdx]}`;
      const uploadedAt = randomDate(app.createdAt, app.submittedAt || new Date());

      const document = await prisma.document.create({
        data: {
          fileName,
          fileType: fileTypes[fileTypeIdx],
          fileSize: Math.floor(Math.random() * 4900000) + 100000,
          filePath: `/uploads/documents/${app.id}/${fileName}`,
          documentType: docType,
          loanApplicationId: app.id,
          uploadedAt,
        },
      });

      documents.push(document);
    }
  }

  console.log(`✅ Created ${documents.length} documents`);
  return documents;
}

async function seedReceipts(users: any[], applications: any[]) {
  console.log('🧾 Seeding receipts...');

  const receiptTypes = ['Official Receipt', 'Acknowledgment Receipt', 'Provisional Receipt'];
  const paymentMethods = ['Cash', 'Check', 'Bank Transfer', 'GCash', 'PayMaya'];
  const purposes = ['Application Fee', 'Processing Fee', 'Monthly Payment', 'Late Payment Fee', 'Miscellaneous Fee'];
  const receipts = [];
  const issuers = users.filter(u => ['PROCESSOR', 'ADMIN'].includes(u.role));
  const baseDate = new Date('2024-06-01');

  for (let i = 0; i < 15; i++) {
    const receiptType = receiptTypes[Math.floor(Math.random() * receiptTypes.length)];
    const prefix = receiptType === 'Official Receipt' ? 'OR' : receiptType === 'Acknowledgment Receipt' ? 'AR' : 'PR';
    const isLinkedToLoan = Math.random() > 0.3;
    const linkedApp = isLinkedToLoan && applications.length > 0
      ? applications[Math.floor(Math.random() * applications.length)]
      : null;

    const payerName = linkedApp
      ? `${linkedApp.firstName} ${linkedApp.lastName}`
      : `${filipinoFirstNames[Math.floor(Math.random() * filipinoFirstNames.length)]} ${filipinoLastNames[Math.floor(Math.random() * filipinoLastNames.length)]}`;

    const issuedAt = randomDate(baseDate, new Date());
    const isVoided = i === 14;

    const receipt = await prisma.receipt.create({
      data: {
        receiptNumber: `${prefix}-2024-${(i + 1).toString().padStart(4, '0')}`,
        receiptType,
        amount: Math.floor(Math.random() * 49500) + 500,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        paymentDetails: Math.random() > 0.5 ? `Reference: REF${Math.floor(Math.random() * 900000) + 100000}` : null,
        purpose: purposes[Math.floor(Math.random() * purposes.length)],
        payerName,
        payerAddress: Math.random() > 0.4 ? `${Math.floor(Math.random() * 500) + 1} Street, City` : null,
        remarks: Math.random() > 0.7 ? 'Payment received in full' : null,
        loanApplicationId: linkedApp?.id || null,
        issuedById: issuers[Math.floor(Math.random() * issuers.length)].id,
        issuedAt,
        voidedAt: isVoided ? addDays(issuedAt, 2) : null,
        voidedReason: isVoided ? 'Duplicate entry' : null,
      },
    });

    receipts.push(receipt);
  }

  console.log(`✅ Created ${receipts.length} receipts`);
  return receipts;
}

async function seedAuditLogs(users: any[], applications: any[], receipts: any[]) {
  console.log('📝 Seeding audit logs...');

  const actions = ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'SUBMIT'];
  const entityTypes = ['LoanApplication', 'Receipt', 'User', 'Document'];
  const logs = [];
  const baseDate = new Date('2024-06-01');

  for (let i = 0; i < 20; i++) {
    const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
    let entityId = '';

    if (entityType === 'LoanApplication' && applications.length > 0) {
      entityId = applications[Math.floor(Math.random() * applications.length)].id;
    } else if (entityType === 'Receipt' && receipts.length > 0) {
      entityId = receipts[Math.floor(Math.random() * receipts.length)].id;
    } else if (entityType === 'User' && users.length > 0) {
      entityId = users[Math.floor(Math.random() * users.length)].id;
    } else {
      entityId = faker.string.uuid();
    }

    const user = users[Math.floor(Math.random() * users.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];

    const changes = JSON.stringify({
      before: action === 'UPDATE' ? { status: 'DRAFT' } : null,
      after: { status: action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'SUBMITTED' },
    });

    const log = await prisma.auditLog.create({
      data: {
        entityType,
        entityId,
        action,
        changes,
        userId: user.id,
        userEmail: user.email,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        createdAt: randomDate(baseDate, new Date()),
      },
    });

    logs.push(log);
  }

  console.log(`✅ Created ${logs.length} audit logs`);
  return logs;
}

async function seedSystemSettings() {
  console.log('⚙️  Seeding system settings...');

  const settings = [
    { key: 'default_interest_rate', value: '8.5' },
    { key: 'minimum_loan_amount', value: '5000' },
    { key: 'maximum_loan_amount', value: '1000000' },
    { key: 'application_fee', value: '500' },
    { key: 'processing_fee_percentage', value: '2.5' },
    { key: 'email_notifications_enabled', value: 'true' },
    { key: 'maintenance_mode', value: 'false' },
    { key: 'business_hours', value: JSON.stringify({ start: '08:00', end: '17:00', days: 'Monday-Friday' }) },
    { key: 'contact_email', value: 'support@lending.ph' },
    { key: 'contact_phone', value: '+63-2-1234-5678' },
    { key: 'terms_version', value: '1.0' },
    { key: 'privacy_policy_version', value: '1.0' },
    { key: 'max_loan_term_months', value: '36' },
    { key: 'late_payment_penalty_percentage', value: '5' },
    { key: 'company_name', value: 'Philippine Lending Corporation' },
  ];

  const baseDate = new Date('2024-01-01');

  for (const setting of settings) {
    await prisma.systemSetting.create({
      data: {
        ...setting,
        updatedAt: randomDate(baseDate, new Date()),
      },
    });
  }

  console.log(`✅ Created ${settings.length} system settings`);
}

async function main() {
  console.log('🚀 Starting database seed...\n');

  try {
    await clearDatabase();

    const regions = await seedRegions();
    const provinces = await seedProvinces(regions);
    const cities = await seedCities(provinces);
    const barangays = await seedBarangays(cities);
    const users = await seedUsers();
    const applications = await seedLoanApplications(users, barangays);
    const documents = await seedDocuments(applications);
    const receipts = await seedReceipts(users, applications);
    await seedAuditLogs(users, applications, receipts);
    await seedSystemSettings();

    console.log('\n✨ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${regions.length} regions`);
    console.log(`   - ${provinces.length} provinces`);
    console.log(`   - ${cities.length} cities`);
    console.log(`   - ${barangays.length} barangays`);
    console.log(`   - ${users.length} users`);
    console.log(`   - ${applications.length} loan applications`);
    console.log(`   - ${documents.length} documents`);
    console.log(`   - ${receipts.length} receipts`);
    console.log(`   - 20 audit logs`);
    console.log(`   - 15 system settings`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
