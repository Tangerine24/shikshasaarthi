import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ShikshaSaarthi database with comprehensive mock data...');

  // Clean old data in safe foreign-key sequence
  await prisma.riskSignal.deleteMany({});
  await prisma.paymentEvent.deleteMany({});
  await prisma.exceptionCase.deleteMany({});
  await prisma.verificationResult.deleteMany({});
  await prisma.verificationRequest.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.consentRecord.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.jagoMessage.deleteMany({});
  await prisma.jagoConversation.deleteMany({});
  await prisma.applicationDocument.deleteMany({});
  await prisma.applicationStatusHistory.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.studentDocument.deleteMany({});
  await prisma.eligibilityRule.deleteMany({});
  await prisma.scholarshipDocumentRequirement.deleteMany({});
  await prisma.scholarship.deleteMany({});
  await prisma.applicationCycle.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.providerProfile.deleteMany({});
  await prisma.adminProfile.deleteMany({});
  await prisma.institution.deleteMany({});
  await prisma.stateDistrictReference.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});

  const hash = await bcrypt.hash('Demo@1234', 12);

  // 0. Seed Master Application Cycle (AY 2025-26)
  const activeCycle = await prisma.applicationCycle.create({
    data: {
      academicYear: 'AY 2025-26',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2026-06-30'),
      isActive: true,
      status: 'ACTIVE',
    },
  });

  // Master Institutions
  const bitMesra = await prisma.institution.create({
    data: {
      aisheCode: 'U-0239',
      name: 'Birla Institute of Technology, Mesra',
      type: 'Deemed University',
      state: 'Jharkhand',
      district: 'Ranchi',
      isVerified: true,
    },
  });

  const ranchiUniv = await prisma.institution.create({
    data: {
      aisheCode: 'U-0242',
      name: 'Ranchi University',
      type: 'State University',
      state: 'Jharkhand',
      district: 'Ranchi',
      isVerified: true,
    },
  });

  await prisma.institution.create({
    data: {
      aisheCode: 'C-41289',
      name: 'St. Xavier\'s College, Ranchi',
      type: 'Autonomous College',
      state: 'Jharkhand',
      district: 'Ranchi',
      isVerified: true,
    },
  });

  // State District References
  const districts = [
    { stateName: 'Jharkhand', districtName: 'Ranchi', stateCode: 'JH', districtCode: 'JH-01' },
    { stateName: 'Jharkhand', districtName: 'Khunti', stateCode: 'JH', districtCode: 'JH-02' },
    { stateName: 'Jharkhand', districtName: 'Gumla', stateCode: 'JH', districtCode: 'JH-03' },
    { stateName: 'Jharkhand', districtName: 'West Singhbhum', stateCode: 'JH', districtCode: 'JH-04' },
    { stateName: 'Jharkhand', districtName: 'Simdega', stateCode: 'JH', districtCode: 'JH-05' },
    { stateName: 'Jharkhand', districtName: 'Lohardaga', stateCode: 'JH', districtCode: 'JH-06' },
    { stateName: 'Jharkhand', districtName: 'Dumka', stateCode: 'JH', districtCode: 'JH-07' },
    { stateName: 'Jharkhand', districtName: 'East Singhbhum', stateCode: 'JH', districtCode: 'JH-08' },
  ];
  for (const d of districts) {
    await prisma.stateDistrictReference.create({ data: d });
  }

  // 1. Seed Demo Student (Explicit ST Caste - Santhal Tribe)
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@demo.shikshasaarthi.in',
      passwordHash: hash,
      role: 'STUDENT',
      preferredLanguage: 'EN',
    },
  });

  // DPDP Consent Records
  await prisma.consentRecord.createMany({
    data: [
      {
        userId: studentUser.id,
        purpose: 'eligibility_check',
        consentVersion: 'v1.0',
        scope: 'Automated evaluation against published scholarship criteria',
      },
      {
        userId: studentUser.id,
        purpose: 'jago_context',
        consentVersion: 'v1.0',
        scope: 'Grounding assistant responses using verified profile and active application status',
      },
      {
        userId: studentUser.id,
        purpose: 'ministry_analytics',
        consentVersion: 'v1.0',
        scope: 'De-identified aggregate reporting on tribal higher education coverage',
      },
    ],
  });

  const studentProfile = await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      fullName: 'Ramesh Kumar',
      dateOfBirth: new Date('2004-07-15'),
      gender: 'MALE',
      state: 'Jharkhand',
      district: 'Ranchi',
      category: 'ST', // Explicit Scheduled Tribe category
      annualFamilyIncome: 150000,
      educationLevel: 'UG',
      institution: 'Birla Institute of Technology, Mesra',
      institutionId: bitMesra.id,
      course: 'B.Tech Computer Science & Engineering',
      yearOfStudy: 2,
      academicPercentage: 78.5,
      isHosteller: true,
      hasDisability: false,
      hasBankAccount: true,
      previousScholarship: 'Pre-Matric Tribal Scholarship (2022-24)',
      profileCompletePercent: 96,
    },
  });

  // 2. Seed Demo Provider (Ministry of Tribal Affairs)
  const providerUser = await prisma.user.create({
    data: {
      email: 'provider@demo.shikshasaarthi.in',
      passwordHash: hash,
      role: 'PROVIDER',
      preferredLanguage: 'EN',
    },
  });

  const providerProfile = await prisma.providerProfile.create({
    data: {
      userId: providerUser.id,
      organizationName: 'Ministry of Tribal Affairs (Scholarship Division)',
      organizationType: 'Government Ministry',
      contactPerson: 'Director of Tribal Welfare',
      phone: '+91-11-2338-8445',
      website: 'https://tribal.nic.in',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
    },
  });

  // 2b. Seed State Provider (Jharkhand Welfare Dept)
  const stateProviderUser = await prisma.user.create({
    data: {
      email: 'jharkhand.welfare@demo.shikshasaarthi.in',
      passwordHash: hash,
      role: 'PROVIDER',
      preferredLanguage: 'HI',
    },
  });

  const stateProviderProfile = await prisma.providerProfile.create({
    data: {
      userId: stateProviderUser.id,
      organizationName: 'Jharkhand Scheduled Tribe Welfare Directorate (E-Kalyan)',
      organizationType: 'State Department / Welfare Directorate',
      contactPerson: 'S. N. Soren, Joint Secretary',
      phone: '+91-651-240-0112',
      website: 'https://ekalyan.cgg.gov.in',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
    },
  });

  // 3. Seed Demo Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@demo.shikshasaarthi.in',
      passwordHash: hash,
      role: 'ADMIN',
      preferredLanguage: 'EN',
    },
  });

  await prisma.adminProfile.create({
    data: {
      userId: adminUser.id,
      fullName: 'System Administrator',
    },
  });

  // 4. Seed Diverse Mock Scholarships
  // Scholarship 1: Tribal Higher Education Support Scholarship (Primary Demo Scheme - Eligible Now)
  const s1 = await prisma.scholarship.create({
    data: {
      providerId: providerProfile.id,
      cycleId: activeCycle.id,
      title: 'Tribal Higher Education Support Scholarship',
      description: 'Comprehensive financial assistance for Scheduled Tribe students pursuing undergraduate and professional courses in accredited Indian universities. Covers tuition fees, book grants, and maintenance allowances for hostellers.',
      benefit: 50000,
      benefitDescription: '₹50,000 per academic year (direct benefit transfer to Aadhaar-seeded bank account)',
      deadline: new Date(Date.now() + 90 * 86400000),
      status: 'PUBLISHED',
      targetGroup: 'ST undergraduate engineering & professional students in Jharkhand',
      applicationProcess: '1. Complete student profile. 2. Verify ST & Income certificates. 3. Submit application online. 4. Institution verifies enrollment.',
      isDemo: true,
      eligibilityRules: {
        create: [
          { field: 'category', operator: 'IN', value: '["ST"]', description: 'Belong to Scheduled Tribe (ST) category', isRequired: true },
          { field: 'state', operator: 'EQ', value: '"Jharkhand"', description: 'Domicile of Jharkhand state', isRequired: true },
          { field: 'annualFamilyIncome', operator: 'LTE', value: '250000', description: 'Annual family income not exceeding ₹2,50,000', isRequired: true },
          { field: 'educationLevel', operator: 'EQ', value: '"UG"', description: 'Enrolled in an Undergraduate degree programme', isRequired: true },
          { field: 'academicPercentage', operator: 'GTE', value: '60', description: 'Minimum 60% marks in previous examination', isRequired: true },
        ],
      },
      documentRequirements: {
        create: [
          { documentType: 'COMMUNITY_CERTIFICATE', description: 'ST Community / Caste Certificate issued by competent authority (SDO/Tehsildar)', isRequired: true },
          { documentType: 'INCOME_CERTIFICATE', description: 'Current financial year Income Certificate', isRequired: true },
          { documentType: 'MARKSHEET', description: 'Previous academic qualifying examination marksheet', isRequired: true },
          { documentType: 'BONAFIDE_CERTIFICATE', description: 'Institution Bonafide Certificate with current roll number', isRequired: true },
          { documentType: 'BANK_DOCUMENT', description: 'Aadhaar-seeded bank passbook copy or cancelled cheque', isRequired: true },
        ],
      },
    },
  });

  // Scholarship 2: ST Undergraduate Academic Assistance (Eligible Now - Approved / Disbursed Scheme)
  const s2 = await prisma.scholarship.create({
    data: {
      providerId: providerProfile.id,
      cycleId: activeCycle.id,
      title: 'ST Undergraduate Academic Assistance Scheme',
      description: 'Need-cum-merit scholarship for tribal youth across India to support college education, examination fees, and essential academic materials.',
      benefit: 30000,
      benefitDescription: '₹30,000 per annum disbursed in two equal installments of ₹15,000',
      deadline: new Date(Date.now() + 45 * 86400000),
      status: 'PUBLISHED',
      targetGroup: 'All ST students enrolled in recognized Indian colleges',
      applicationProcess: 'Submit community and academic certificates online through ShikshaSaarthi.',
      isDemo: true,
      eligibilityRules: {
        create: [
          { field: 'category', operator: 'IN', value: '["ST", "SC"]', description: 'ST or SC community background', isRequired: true },
          { field: 'educationLevel', operator: 'EQ', value: '"UG"', description: 'Undergraduate study', isRequired: true },
          { field: 'academicPercentage', operator: 'GTE', value: '50', description: 'At least 50% academic aggregate', isRequired: true },
          { field: 'annualFamilyIncome', operator: 'LTE', value: '300000', description: 'Annual household income up to ₹3,00,000', isRequired: true },
        ],
      },
      documentRequirements: {
        create: [
          { documentType: 'COMMUNITY_CERTIFICATE', description: 'Caste Certificate', isRequired: true },
          { documentType: 'MARKSHEET', description: 'Semester / Grade marksheet', isRequired: true },
          { documentType: 'INCOME_CERTIFICATE', description: 'Family income certificate', isRequired: true },
        ],
      },
    },
  });

  // Scholarship 3: National Higher Education Merit Support Scheme (Almost Eligible Demo - Academic & Year Gap)
  const s3 = await prisma.scholarship.create({
    data: {
      providerId: providerProfile.id,
      cycleId: activeCycle.id,
      title: 'National Higher Education Merit Support Scheme',
      description: 'Competitive merit scholarship recognizing outstanding academic achievement among undergraduate tribal students in STEM and professional courses. Requires academic aggregate >= 80% and minimum 3rd year standing.',
      benefit: 40000,
      benefitDescription: '₹40,000 one-time annual merit grant for senior undergraduates',
      deadline: new Date(Date.now() + 60 * 86400000),
      status: 'PUBLISHED',
      targetGroup: 'Senior ST undergraduate students with >= 80% aggregate',
      applicationProcess: 'Merit ranking based on cumulative GPA and institutional endorsement.',
      isDemo: true,
      eligibilityRules: {
        create: [
          { field: 'category', operator: 'IN', value: '["ST"]', description: 'Scheduled Tribe (ST) category', isRequired: true },
          { field: 'educationLevel', operator: 'EQ', value: '"UG"', description: 'Enrolled in Undergraduate degree programme', isRequired: true },
          { field: 'annualFamilyIncome', operator: 'LTE', value: '250000', description: 'Family income <= ₹2,50,000/year', isRequired: true },
          { field: 'yearOfStudy', operator: 'GTE', value: '3', description: 'Minimum 3rd year of undergraduate study', isRequired: true },
          { field: 'academicPercentage', operator: 'GTE', value: '80', description: 'Academic performance of 80% or higher (or 8.0 CGPA)', isRequired: true },
        ],
      },
      documentRequirements: {
        create: [
          { documentType: 'COMMUNITY_CERTIFICATE', description: 'ST Community Certificate', isRequired: true },
          { documentType: 'INCOME_CERTIFICATE', description: 'Current Income Certificate', isRequired: true },
          { documentType: 'MARKSHEET', description: 'Cumulative marksheet showing >= 80%', isRequired: true },
          { documentType: 'BONAFIDE_CERTIFICATE', description: 'College Bonafide Certificate with Roll No.', isRequired: true },
        ],
      },
    },
  });

  // Scholarship 4: National Fellowship for ST Students (NFST) - Future Opportunity (After Graduation)
  const s4 = await prisma.scholarship.create({
    data: {
      providerId: providerProfile.id,
      cycleId: activeCycle.id,
      title: 'National Fellowship for ST Students (NFST)',
      description: 'Prestigious fellowship scheme by the Ministry of Tribal Affairs for tribal scholars pursuing M.Phil. and Ph.D. degrees in Indian universities and research institutions. Provides monthly fellowship + contingency.',
      benefit: 420000,
      benefitDescription: '₹35,000/month JRF stipend + ₹20,000 annual contingency grant',
      deadline: new Date(Date.now() + 120 * 86400000),
      status: 'PUBLISHED',
      targetGroup: 'ST candidates enrolled in regular M.Phil / Ph.D. research programmes',
      applicationProcess: 'Online application with UGC-NET/GATE score and postgraduate degree certificate.',
      isDemo: true,
      eligibilityRules: {
        create: [
          { field: 'category', operator: 'IN', value: '["ST"]', description: 'Scheduled Tribe (ST) candidate', isRequired: true },
          { field: 'educationLevel', operator: 'IN', value: '["PG", "PHD"]', description: 'Enrolled in Postgraduate / Doctoral research programme', isRequired: true },
          { field: 'academicPercentage', operator: 'GTE', value: '55', description: 'Minimum 55% marks in qualifying degree', isRequired: true },
          { field: 'annualFamilyIncome', operator: 'LTE', value: '600000', description: 'Annual household income up to ₹6,00,000', isRequired: true },
        ],
      },
      documentRequirements: {
        create: [
          { documentType: 'COMMUNITY_CERTIFICATE', description: 'ST Certificate verified by DigiLocker', isRequired: true },
          { documentType: 'MARKSHEET', description: 'Postgraduate degree marksheet/certificate', isRequired: true },
          { documentType: 'BONAFIDE_CERTIFICATE', description: 'University Research Enrolment Certificate', isRequired: true },
        ],
      },
    },
  });

  // Scholarship 5: National Overseas Scholarship (NOS) - Future Opportunity (Abroad)
  const s5 = await prisma.scholarship.create({
    data: {
      providerId: providerProfile.id,
      cycleId: activeCycle.id,
      title: 'National Overseas Scholarship for ST Candidates (NOS)',
      description: 'Flagship central scholarship enabling meritorious tribal students to pursue Masters and Doctoral studies in top 500 QS-ranked global universities. Covers tuition fees, living expenses, and international airfare.',
      benefit: 1500000,
      benefitDescription: 'Complete foreign tuition fee + £9,900 / $15,400 annual living allowance',
      deadline: new Date(Date.now() + 180 * 86400000),
      status: 'PUBLISHED',
      targetGroup: 'ST students seeking Masters/PhD degrees in foreign universities',
      applicationProcess: 'Submit foreign university offer letter, ST certificate, and graduation degree.',
      isDemo: true,
      eligibilityRules: {
        create: [
          { field: 'category', operator: 'IN', value: '["ST"]', description: 'Must belong to Scheduled Tribe (ST)', isRequired: true },
          { field: 'educationLevel', operator: 'IN', value: '["PG", "PHD"]', description: 'Foreign Masters or Ph.D. enrolment', isRequired: true },
          { field: 'academicPercentage', operator: 'GTE', value: '60', description: 'Minimum 60% or equivalent in undergraduate degree', isRequired: true },
          { field: 'annualFamilyIncome', operator: 'LTE', value: '800000', description: 'Annual family income not exceeding ₹8,00,000', isRequired: true },
        ],
      },
      documentRequirements: {
        create: [
          { documentType: 'COMMUNITY_CERTIFICATE', description: 'ST Caste Certificate', isRequired: true },
          { documentType: 'INCOME_CERTIFICATE', description: 'Income Certificate from competent revenue officer', isRequired: true },
          { documentType: 'MARKSHEET', description: 'Undergraduate degree certificate and transcripts', isRequired: true },
        ],
      },
    },
  });

  // Scholarship 6: Birsa Munda Technical Education Fellowship (Jharkhand State - Eligible Now)
  const s6 = await prisma.scholarship.create({
    data: {
      providerId: stateProviderProfile.id,
      cycleId: activeCycle.id,
      title: 'Birsa Munda Technical Education Fellowship',
      description: 'Special technical grant instituted by the Government of Jharkhand to support Scheduled Tribe engineering and polytechnic students studying in premier state institutions.',
      benefit: 65000,
      benefitDescription: '₹65,000 per annum towards institution tuition fee + equipment allowance',
      deadline: new Date(Date.now() + 75 * 86400000),
      status: 'PUBLISHED',
      targetGroup: 'ST engineering students domiciled in Jharkhand',
      applicationProcess: 'Submit online application through E-Kalyan portal with AISHE institution certificate.',
      isDemo: true,
      eligibilityRules: {
        create: [
          { field: 'category', operator: 'IN', value: '["ST"]', description: 'Scheduled Tribe (ST) category', isRequired: true },
          { field: 'state', operator: 'EQ', value: '"Jharkhand"', description: 'Resident of Jharkhand state', isRequired: true },
          { field: 'annualFamilyIncome', operator: 'LTE', value: '300000', description: 'Family income <= ₹3,00,000/year', isRequired: true },
          { field: 'educationLevel', operator: 'EQ', value: '"UG"', description: 'Enrolled in Undergraduate engineering or technology degree', isRequired: true },
          { field: 'academicPercentage', operator: 'GTE', value: '65', description: 'Minimum 65% aggregate marks', isRequired: true },
        ],
      },
      documentRequirements: {
        create: [
          { documentType: 'COMMUNITY_CERTIFICATE', description: 'Jharkhand ST Caste Certificate', isRequired: true },
          { documentType: 'INCOME_CERTIFICATE', description: 'Income Certificate signed by Circle Officer / SDO', isRequired: true },
          { documentType: 'BONAFIDE_CERTIFICATE', description: 'Bonafide Certificate from Engineering College', isRequired: true },
          { documentType: 'MARKSHEET', description: 'Latest Semester Grade Card', isRequired: true },
        ],
      },
    },
  });

  // Scholarship 7: E-Kalyan Jharkhand Post-Matric Scholarship (Eligible Now)
  const s7 = await prisma.scholarship.create({
    data: {
      providerId: stateProviderProfile.id,
      cycleId: activeCycle.id,
      title: 'E-Kalyan Jharkhand Post-Matric ST Scholarship',
      description: 'Universal post-matric welfare scholarship by Jharkhand Welfare Directorate covering maintenance charges and non-refundable fees for tribal college students.',
      benefit: 38000,
      benefitDescription: '₹38,000 per academic year for hostellers (Direct Bank Transfer via PFMS)',
      deadline: new Date(Date.now() + 30 * 86400000),
      status: 'PUBLISHED',
      targetGroup: 'Scheduled Tribe post-matric students in Jharkhand',
      applicationProcess: 'Complete e-Kalyan verification and attach scanned documents.',
      isDemo: true,
      eligibilityRules: {
        create: [
          { field: 'category', operator: 'IN', value: '["ST"]', description: 'Scheduled Tribe (ST)', isRequired: true },
          { field: 'state', operator: 'EQ', value: '"Jharkhand"', description: 'Jharkhand domicile', isRequired: true },
          { field: 'annualFamilyIncome', operator: 'LTE', value: '250000', description: 'Family income within ₹2,50,000', isRequired: true },
          { field: 'educationLevel', operator: 'EQ', value: '"UG"', description: 'Post-matric college level study', isRequired: true },
        ],
      },
      documentRequirements: {
        create: [
          { documentType: 'COMMUNITY_CERTIFICATE', description: 'Caste Certificate issued by SDO/CO', isRequired: true },
          { documentType: 'INCOME_CERTIFICATE', description: 'Income Certificate', isRequired: true },
          { documentType: 'BONAFIDE_CERTIFICATE', description: 'College Bonafide with Fee Structure', isRequired: true },
        ],
      },
    },
  });

  // 5. Seed Comprehensive Student Documents for Ramesh Kumar (Tribal Scholar)
  const docCommunity = await prisma.studentDocument.create({
    data: {
      studentId: studentProfile.id,
      documentType: 'COMMUNITY_CERTIFICATE',
      fileName: 'st_caste_certificate_ramesh_santhal.pdf',
      originalName: 'ST_Certificate_Santhal_SDO_Ranchi.pdf',
      storagePath: 'uploads/demo/st_caste_certificate_ramesh.pdf',
      mimeType: 'application/pdf',
      fileSize: 420500,
      verificationState: 'VERIFIED',
      expiryDate: new Date('2035-12-31'),
      notes: 'Scheduled Tribe (Santhal) verified against Jharkhand State ST Registry',
    },
  });

  const docIncome = await prisma.studentDocument.create({
    data: {
      studentId: studentProfile.id,
      documentType: 'INCOME_CERTIFICATE',
      fileName: 'income_certificate_2025_26.pdf',
      originalName: 'Income_Certificate_CO_Kanke_2025.pdf',
      storagePath: 'uploads/demo/income_certificate_2025_26.pdf',
      mimeType: 'application/pdf',
      fileSize: 310200,
      verificationState: 'VERIFIED',
      expiryDate: new Date(Date.now() + 18 * 86400000), // 18 days left (Triggers Document Health warning)
      notes: 'Family income verified at ₹1,50,000/yr. Renewal recommended in 18 days.',
    },
  });

  const docMarksheet = await prisma.studentDocument.create({
    data: {
      studentId: studentProfile.id,
      documentType: 'MARKSHEET',
      fileName: 'btech_cse_sem2_marksheet.pdf',
      originalName: 'BIT_Mesra_BTech_CSE_Sem2_Transcript.pdf',
      storagePath: 'uploads/demo/btech_sem2_marksheet.pdf',
      mimeType: 'application/pdf',
      fileSize: 680400,
      verificationState: 'VERIFIED',
      notes: 'Cumulative CGPA 7.85 / 78.5% verified by Examination Controller, BIT Mesra',
    },
  });

  const docBonafide = await prisma.studentDocument.create({
    data: {
      studentId: studentProfile.id,
      documentType: 'BONAFIDE_CERTIFICATE',
      fileName: 'bit_mesra_bonafide_2025_26.pdf',
      originalName: 'BIT_Mesra_Bonafide_Roll_24BTECH089.pdf',
      storagePath: 'uploads/demo/bit_mesra_bonafide.pdf',
      mimeType: 'application/pdf',
      fileSize: 345000,
      verificationState: 'VERIFIED',
      notes: 'Bonafide 2nd Year UG Student (AISHE: U-0239)',
    },
  });

  const docBank = await prisma.studentDocument.create({
    data: {
      studentId: studentProfile.id,
      documentType: 'BANK_DOCUMENT',
      fileName: 'sbi_bank_passbook_seeded.pdf',
      originalName: 'SBI_Passbook_Aadhaar_Seeded_Mesra.pdf',
      storagePath: 'uploads/demo/sbi_bank_passbook_seeded.pdf',
      mimeType: 'application/pdf',
      fileSize: 512000,
      verificationState: 'VERIFIED',
      notes: 'State Bank of India (A/C: *******4108, IFSC: SBIN0002776, Aadhaar Seeded: YES)',
    },
  });

  // 6. Seed Multiple Realistic Student Applications
  // Application 1: s1 (Tribal Higher Education Support) -> Status: UNDER_VERIFICATION
  const app1 = await prisma.application.create({
    data: {
      studentId: studentProfile.id,
      scholarshipId: s1.id,
      cycleId: activeCycle.id,
      status: 'UNDER_VERIFICATION',
      submittedAt: new Date(Date.now() - 3 * 86400000),
      applicationDocuments: {
        create: [
          { documentId: docCommunity.id },
          { documentId: docIncome.id },
          { documentId: docMarksheet.id },
          { documentId: docBonafide.id },
          { documentId: docBank.id },
        ],
      },
      statusHistory: {
        create: [
          {
            toStatus: 'DRAFT',
            actorId: studentUser.id,
            note: 'Application initiated by student',
            createdAt: new Date(Date.now() - 5 * 86400000),
          },
          {
            fromStatus: 'DRAFT',
            toStatus: 'SUBMITTED',
            actorId: studentUser.id,
            note: 'Application submitted with 5 verified documents',
            createdAt: new Date(Date.now() - 3 * 86400000),
          },
          {
            fromStatus: 'SUBMITTED',
            toStatus: 'UNDER_VERIFICATION',
            actorId: providerUser.id,
            note: 'Under institutional review by BIT Mesra Nodal Officer',
            createdAt: new Date(Date.now() - 2 * 86400000),
          },
        ],
      },
    },
  });

  // Application 2: s2 (ST Undergraduate Assistance) -> Status: APPROVED & DISBURSED
  const app2 = await prisma.application.create({
    data: {
      studentId: studentProfile.id,
      scholarshipId: s2.id,
      cycleId: activeCycle.id,
      status: 'APPROVED',
      submittedAt: new Date(Date.now() - 60 * 86400000),
      applicationDocuments: {
        create: [
          { documentId: docCommunity.id },
          { documentId: docMarksheet.id },
          { documentId: docIncome.id },
        ],
      },
      statusHistory: {
        create: [
          {
            toStatus: 'DRAFT',
            actorId: studentUser.id,
            note: 'Application initiated',
            createdAt: new Date(Date.now() - 65 * 86400000),
          },
          {
            fromStatus: 'DRAFT',
            toStatus: 'SUBMITTED',
            actorId: studentUser.id,
            note: 'Application submitted',
            createdAt: new Date(Date.now() - 60 * 86400000),
          },
          {
            fromStatus: 'SUBMITTED',
            toStatus: 'UNDER_VERIFICATION',
            actorId: providerUser.id,
            note: 'Documents verified with State ST Registry',
            createdAt: new Date(Date.now() - 45 * 86400000),
          },
          {
            fromStatus: 'UNDER_VERIFICATION',
            toStatus: 'APPROVED',
            actorId: providerUser.id,
            note: 'Scholarship sanctioned for ₹30,000 by Ministry Welfare Committee',
            createdAt: new Date(Date.now() - 30 * 86400000),
          },
        ],
      },
    },
  });

  // Application 3: s7 (E-Kalyan Jharkhand Post-Matric) -> Status: SUBMITTED
  const app3 = await prisma.application.create({
    data: {
      studentId: studentProfile.id,
      scholarshipId: s7.id,
      cycleId: activeCycle.id,
      status: 'SUBMITTED',
      submittedAt: new Date(Date.now() - 1 * 86400000),
      applicationDocuments: {
        create: [
          { documentId: docCommunity.id },
          { documentId: docIncome.id },
          { documentId: docBonafide.id },
        ],
      },
      statusHistory: {
        create: [
          {
            toStatus: 'DRAFT',
            actorId: studentUser.id,
            note: 'Draft initiated on E-Kalyan portal',
            createdAt: new Date(Date.now() - 2 * 86400000),
          },
          {
            fromStatus: 'DRAFT',
            toStatus: 'SUBMITTED',
            actorId: studentUser.id,
            note: 'Submitted with verified bonafide and income proof',
            createdAt: new Date(Date.now() - 1 * 86400000),
          },
        ],
      },
    },
  });

  // 7. Seed Verification Request with Mismatch Result & Exception Case (For Provider Review Demo)
  const verifReq = await prisma.verificationRequest.create({
    data: {
      applicationId: app1.id,
      verificationType: 'IDENTITY',
      source: 'DIGILOCKER',
      status: 'MISMATCH',
    },
  });

  await prisma.verificationResult.create({
    data: {
      verificationRequestId: verifReq.id,
      status: 'MISMATCH',
      confidenceScore: 0.88,
      mismatchDetails: JSON.stringify({
        field: 'name',
        portalValue: 'Ramesh Kumar',
        digiLockerValue: 'Ramesh K',
        discrepancy: 'Middle initial abbreviation between application profile and DigiLocker ST identity certificate.',
      }),
      rawResponse: JSON.stringify({ source: 'DigiLocker Mock Gateway', verified: false, code: 'NAME_PARTIAL_MATCH' }),
    },
  });

  await prisma.exceptionCase.create({
    data: {
      applicationId: app1.id,
      verificationRequestId: verifReq.id,
      issueType: 'NAME_MISMATCH',
      title: 'DigiLocker ST Identity Discrepancy',
      details: 'DigiLocker returned name as "Ramesh K" while application record shows "Ramesh Kumar". Requires nodal verification or institutional roll sheet confirmation.',
      severity: 'MEDIUM',
      status: 'OPEN',
    },
  });

  // 8. Seed DBT Payment Events
  // Payment for App 1 (Currently in DBT_PROCESSING stage)
  await prisma.paymentEvent.create({
    data: {
      applicationId: app1.id,
      amount: 50000,
      dbtStatus: 'DBT_PROCESSING',
      transactionRef: 'PFMS-2026-JH-883921',
      failureReason: null,
      eventDate: new Date(Date.now() - 1 * 86400000),
    },
  });

  // Payment for App 2 (Successfully PAID / Disbursed via PFMS)
  await prisma.paymentEvent.create({
    data: {
      applicationId: app2.id,
      amount: 30000,
      dbtStatus: 'PAID',
      transactionRef: 'PFMS-2025-JH-774910',
      failureReason: null,
      eventDate: new Date(Date.now() - 25 * 86400000),
    },
  });

  // 9. Seed Risk Signal
  await prisma.riskSignal.create({
    data: {
      entityType: 'Application',
      entityId: app1.id,
      riskType: 'IDENTITY_MISMATCH',
      severity: 'MEDIUM',
      reason: 'Name nuance detected between DigiLocker credential ("Ramesh K") and student profile ("Ramesh Kumar").',
      evidence: 'DigiLocker Certificate Record ID: DL-ST-2022-99812 (Santhal Tribe, Ranchi)',
      status: 'ACTIVE',
      recommendedAction: 'Verify institutional roll sheet from BIT Mesra.',
    },
  });

  // 10. Seed Rich Notifications for Student
  await prisma.notification.createMany({
    data: [
      {
        userId: studentUser.id,
        type: 'PAYMENT_UPDATE',
        title: 'DBT Payment Disbursed / छात्रवृत्ति राशि प्राप्त',
        body: '₹30,000 has been successfully credited to your SBI account ending in 4108 for ST Undergraduate Academic Assistance Scheme (Ref: PFMS-2025-JH-774910).',
        isRead: false,
        metadata: JSON.stringify({ applicationId: app2.id, amount: 30000 }),
        createdAt: new Date(Date.now() - 25 * 86400000),
      },
      {
        userId: studentUser.id,
        type: 'VERIFICATION_UPDATE',
        title: 'Application Under Verification',
        body: 'Your application for Tribal Higher Education Support Scholarship is under active review by BIT Mesra Nodal Officer.',
        isRead: false,
        metadata: JSON.stringify({ applicationId: app1.id }),
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        userId: studentUser.id,
        type: 'DOCUMENT_EXPIRING',
        title: 'Document Expiry Alert / दस्तावेज़ नवीनीकरण',
        body: 'Your Income Certificate expires in 18 days. Please renew with Circle Officer to ensure uninterrupted DBT disbursements.',
        isRead: false,
        metadata: JSON.stringify({ documentId: docIncome.id, daysLeft: 18 }),
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
      {
        userId: studentUser.id,
        type: 'SCHOLARSHIP_MATCH',
        title: 'New 100% Eligible Scheme Found!',
        body: 'You are 100% eligible for Birsa Munda Technical Education Fellowship (₹65,000/year). Check your Eligibility Roadmap now.',
        isRead: false,
        metadata: JSON.stringify({ scholarshipId: s6.id }),
        createdAt: new Date(),
      },
    ],
  });

  console.log('✅ Seed completed successfully with comprehensive mock data!');
  console.log('----------------------------------------------------');
  console.log('DEMO CREDENTIALS:');
  console.log('  Student : student@demo.shikshasaarthi.in  / Demo@1234');
  console.log('            (Ramesh Kumar, ST - Santhal, BIT Mesra)');
  console.log('  Provider: provider@demo.shikshasaarthi.in / Demo@1234');
  console.log('            (Ministry of Tribal Affairs)');
  console.log('  Admin   : admin@demo.shikshasaarthi.in    / Demo@1234');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
