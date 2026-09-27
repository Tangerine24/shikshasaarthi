import { prisma } from '../../lib/prisma';

export interface RoadmapCriterion {
  field: string;
  description: string;
  studentValue: string | number | null;
  requiredValue: string;
  status: 'MET' | 'GAP' | 'FUTURE';
  explanation: string;
  actionRequired?: string;
  timeEstimate?: string;
}

export interface RoadmapNextStep {
  id: string;
  title: string;
  impact: string;
  description: string;
  category: 'DOCUMENT' | 'ACADEMIC' | 'PROFILE';
  actionText: string;
  actionUrl: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const RoadmapService = {
  async getStudentRoadmap(userId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        enrolledInstitution: true,
        documents: true,
        applications: {
          include: {
            scholarship: true,
            statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
      },
    });

    if (!student) {
      throw new Error('Student profile not found');
    }

    const scholarships = await prisma.scholarship.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        provider: true,
        eligibilityRules: true,
        documentRequirements: true,
      },
      orderBy: { benefit: 'desc' },
    });

    const eligibleNow: any[] = [];
    const almostEligible: any[] = [];
    const futureOpportunities: any[] = [];
    const nextStepsMap = new Map<string, RoadmapNextStep>();

    const now = new Date();
    const documentTypeHealthMap = new Map<string, { status: string; daysLeft: number | null; docId: string; name: string }>();
    
    for (const doc of student.documents) {
      let daysLeft: number | null = null;
      let status = 'VALID';
      if (doc.expiryDate) {
        const diff = Math.ceil((new Date(doc.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        daysLeft = diff;
        if (diff <= 0) status = 'EXPIRED';
        else if (diff <= 30) status = 'EXPIRING_SOON';
      }
      documentTypeHealthMap.set(doc.documentType, {
        status,
        daysLeft,
        docId: doc.id,
        name: doc.originalName || doc.documentType,
      });

      if (status === 'EXPIRING_SOON') {
        nextStepsMap.set('DOC_EXP_' + doc.documentType, {
          id: 'step-doc-exp-' + doc.id,
          title: 'Renew ' + (doc.originalName || doc.documentType),
          impact: 'Required by active and upcoming scholarship verification',
          description: 'Document expires in ' + daysLeft + ' days. Renew now to prevent sanction delays.',
          category: 'DOCUMENT',
          actionText: 'Renew Document',
          actionUrl: '/student/documents',
          urgency: 'HIGH',
        });
      } else if (status === 'EXPIRED') {
        nextStepsMap.set('DOC_EXPIRED_' + doc.documentType, {
          id: 'step-doc-expired-' + doc.id,
          title: 'Update Expired ' + (doc.originalName || doc.documentType),
          impact: 'Blocking application eligibility',
          description: 'Document has expired. An updated official certificate must be uploaded.',
          category: 'DOCUMENT',
          actionText: 'Upload New Document',
          actionUrl: '/student/documents',
          urgency: 'HIGH',
        });
      }
    }

    for (const s of scholarships) {
      const existingApp = student.applications.find((a) => a.scholarshipId === s.id);
      const daysLeft = Math.ceil((new Date(s.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      const passed: RoadmapCriterion[] = [];
      const failed: RoadmapCriterion[] = [];
      const future: RoadmapCriterion[] = [];

      let isFutureProgression = false;

      for (const rule of s.eligibilityRules) {
        const studentVal = (student as any)[rule.field];
        let ruleVal: any;
        try {
          ruleVal = JSON.parse(rule.value);
        } catch {
          ruleVal = rule.value;
        }

        let pass = false;
        if (studentVal !== null && studentVal !== undefined && studentVal !== '') {
          switch (rule.operator) {
            case 'EQ':
              pass = String(studentVal).toLowerCase() === String(ruleVal).toLowerCase();
              break;
            case 'IN':
              pass = Array.isArray(ruleVal) && ruleVal.map((x: any) => String(x).toLowerCase()).includes(String(studentVal).toLowerCase());
              break;
            case 'LTE':
              pass = Number(studentVal) <= Number(ruleVal);
              break;
            case 'GTE':
              pass = Number(studentVal) >= Number(ruleVal);
              break;
            case 'LT':
              pass = Number(studentVal) < Number(ruleVal);
              break;
            case 'GT':
              pass = Number(studentVal) > Number(ruleVal);
              break;
            default:
              pass = String(studentVal) === String(ruleVal);
          }
        }

        if (!pass && (rule.field === 'educationLevel' && (String(ruleVal).includes('PG') || String(ruleVal).includes('PHD')) && student.educationLevel === 'UG')) {
          isFutureProgression = true;
          future.push({
            field: rule.field,
            description: rule.description,
            studentValue: studentVal ?? 'Not specified',
            requiredValue: String(ruleVal),
            status: 'FUTURE',
            explanation: 'Requires post-graduate or research enrolment (currently undergraduate).',
            timeEstimate: 'After Graduation',
          });
        } else if (!pass && rule.field === 'yearOfStudy' && Number(studentVal) < Number(ruleVal)) {
          failed.push({
            field: rule.field,
            description: rule.description,
            studentValue: 'Year ' + studentVal,
            requiredValue: 'Year ' + ruleVal + '+',
            status: 'GAP',
            explanation: 'Currently in Year ' + studentVal + '. Requirement opens in Year ' + ruleVal + '.',
            actionRequired: 'Complete current academic year progression.',
            timeEstimate: 'Academic Year ' + (Number(studentVal) + 1),
          });
        } else if (!pass) {
          let actionRequired = 'Satisfy ' + rule.description;
          let timeEstimate = 'Upcoming Session';

          if (rule.field === 'academicPercentage') {
            actionRequired = 'Maintain academic performance >= ' + ruleVal + '% in upcoming semester exams.';
            timeEstimate = 'Next Semester Evaluation';
          } else if (rule.field === 'annualFamilyIncome') {
            actionRequired = 'Income certificate must be verified within limit of ₹' + Number(ruleVal).toLocaleString('en-IN') + '.';
          }

          failed.push({
            field: rule.field,
            description: rule.description,
            studentValue: studentVal !== null && studentVal !== undefined ? String(studentVal) : 'Missing in profile',
            requiredValue: String(ruleVal),
            status: 'GAP',
            explanation: studentVal !== null && studentVal !== undefined
              ? 'Current value (' + studentVal + ') does not satisfy required condition (' + rule.operator + ' ' + ruleVal + ').'
              : 'Profile field \'' + rule.field + '\' is incomplete.',
            actionRequired,
            timeEstimate,
          });
        } else {
          passed.push({
            field: rule.field,
            description: rule.description,
            studentValue: String(studentVal),
            requiredValue: String(ruleVal),
            status: 'MET',
            explanation: 'Criterion met (' + studentVal + ' satisfies requirement).',
          });
        }
      }

      let readyDocs = 0;
      const missingDocRequirements: any[] = [];
      for (const req of s.documentRequirements) {
        const userDoc = documentTypeHealthMap.get(req.documentType);
        if (userDoc && userDoc.status !== 'EXPIRED') {
          readyDocs++;
        } else {
          missingDocRequirements.push({
            documentType: req.documentType,
            description: req.description || req.documentType,
            status: userDoc ? userDoc.status : 'MISSING',
          });

          if (!nextStepsMap.has('MISSING_' + req.documentType)) {
            nextStepsMap.set('MISSING_' + req.documentType, {
              id: 'step-missing-' + req.documentType,
              title: 'Upload ' + (req.description || req.documentType),
              impact: 'Unlocks eligibility for ' + s.title,
              description: 'Required for verified document package. Obtain from college or state authority.',
              category: 'DOCUMENT',
              actionText: 'Upload to Wallet',
              actionUrl: '/student/documents',
              urgency: 'MEDIUM',
            });
          }
        }
      }

      const totalRules = s.eligibilityRules.length;
      const readinessPercent = totalRules > 0 ? Math.round((passed.length / totalRules) * 100) : 100;

      if (isFutureProgression) {
        futureOpportunities.push({
          id: s.id,
          title: s.title,
          provider: s.provider.organizationName,
          benefit: s.benefit,
          benefitFormatted: s.benefitDescription || ('₹' + s.benefit.toLocaleString('en-IN')),
          deadline: s.deadline,
          expectedStage: s.title.includes('Fellowship') ? 'After Graduation (Master\'s / Ph.D.)' : 'Post-Graduation Abroad',
          progressionStage: s.title.includes('Fellowship') ? 'AFTER GRADUATION' : 'INTERNATIONAL STUDY',
          progressionOrder: s.title.includes('Fellowship') ? 2 : 3,
          readinessPercent: Math.max(readinessPercent, 50),
          currentPreparation: [
            {
              label: 'ST Status Verification',
              status: student.category === 'ST' ? 'READY' : 'PENDING',
              detail: 'Verified ST Community credentials via State Registry',
            },
            {
              label: 'Academic Performance',
              status: (student.academicPercentage || 0) >= 60 ? 'READY' : 'IN_PROGRESS',
              detail: 'Current aggregate is ' + (student.academicPercentage || 0) + '%',
            },
            {
              label: 'Enrollment Qualification',
              status: 'FUTURE',
              detail: 'Requires graduation degree certificate and research admission',
            },
          ],
          whatToPrepareNow: 'Maintain high academic aggregate in current ' + (student.course || 'degree') + ', keep ST caste certificates digitally verified, and prepare entrance examinations.',
          primaryAction: {
            text: 'Track Opportunity',
            url: '/student/eligibility-roadmap/' + s.id,
          },
        });
      } else if (failed.length === 0 && future.length === 0) {
        eligibleNow.push({
          id: s.id,
          title: s.title,
          provider: s.provider.organizationName,
          benefit: s.benefit,
          benefitFormatted: s.benefitDescription || ('₹' + s.benefit.toLocaleString('en-IN')),
          deadline: s.deadline,
          daysLeft,
          status: 'ELIGIBLE',
          readinessPercent: 100,
          requirementsMetText: passed.length + '/' + totalRules + ' eligibility requirements met',
          passedCount: passed.length,
          totalCriteriaCount: totalRules,
          documentsReadyText: readyDocs + '/' + s.documentRequirements.length + ' documents ready',
          readyDocCount: readyDocs,
          requiredDocCount: s.documentRequirements.length,
          existingApplication: existingApp
            ? {
                id: existingApp.id,
                status: existingApp.status,
                submittedAt: existingApp.submittedAt,
              }
            : null,
          actionText: existingApp ? 'Track Status' : 'Apply Now',
          actionUrl: existingApp ? ('/student/applications/' + existingApp.id) : ('/student/scholarships/' + s.id),
        });
      } else if (failed.length <= 2) {
        const academicGap = failed.find((f) => f.field === 'academicPercentage');
        if (academicGap && !nextStepsMap.has('ACADEMIC_GAP')) {
          nextStepsMap.set('ACADEMIC_GAP', {
            id: 'step-academic-gap',
            title: 'Improve Aggregate to >= ' + academicGap.requiredValue,
            impact: 'Unlocks ' + s.title,
            description: 'Current aggregate is ' + student.academicPercentage + '%. An improvement of ' + (Number(academicGap.requiredValue) - (student.academicPercentage || 0)).toFixed(1) + '% satisfies merit criteria.',
            category: 'ACADEMIC',
            actionText: 'View Target Criteria',
            actionUrl: '/student/eligibility-roadmap/' + s.id,
            urgency: 'MEDIUM',
          });
        }

        almostEligible.push({
          id: s.id,
          title: s.title,
          provider: s.provider.organizationName,
          benefit: s.benefit,
          benefitFormatted: s.benefitDescription || ('₹' + s.benefit.toLocaleString('en-IN')),
          deadline: s.deadline,
          daysLeft,
          readinessPercent,
          remainingRequirementsCount: failed.length,
          passedCriteria: passed,
          failedCriteria: failed,
          missingDocuments: missingDocRequirements,
          primaryAction: {
            text: 'View Roadmap',
            url: '/student/eligibility-roadmap/' + s.id,
          },
        });
      } else {
        futureOpportunities.push({
          id: s.id,
          title: s.title,
          provider: s.provider.organizationName,
          benefit: s.benefit,
          benefitFormatted: s.benefitDescription || ('₹' + s.benefit.toLocaleString('en-IN')),
          deadline: s.deadline,
          expectedStage: 'Senior Academic Session',
          progressionStage: 'NEXT ACADEMIC STAGE',
          progressionOrder: 2,
          readinessPercent,
          currentPreparation: passed.map((p) => ({
            label: p.description,
            status: 'READY',
            detail: p.studentValue + ' verified',
          })),
          whatToPrepareNow: failed.map((f) => f.actionRequired || f.description).join('. '),
          primaryAction: {
            text: 'Track Opportunity',
            url: '/student/eligibility-roadmap/' + s.id,
          },
        });
      }
    }

    if (!nextStepsMap.has('INSTITUTION_VERIFY') && student.enrolledInstitution) {
      nextStepsMap.set('INSTITUTION_VERIFY', {
        id: 'step-inst-verify',
        title: 'Verify Enrolled Institution Details',
        impact: student.enrolledInstitution.name + ' (' + student.enrolledInstitution.aisheCode + ')',
        description: 'Institutional AISHE verification links enrollment for instant approval.',
        category: 'PROFILE',
        actionText: 'View in Passport',
        actionUrl: '/student/passport',
        urgency: 'LOW',
      });
    }

    const nextSteps = Array.from(nextStepsMap.values()).sort((a, b) => {
      const p = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return p[a.urgency] - p[b.urgency];
    });

    const journeyStages = [
      {
        stageKey: 'TODAY',
        stageLabel: 'TODAY',
        title: 'Eligible Right Now',
        subtitle: 'Schemes where your profile matches 100% of published criteria',
        items: eligibleNow.map((item) => ({
          id: item.id,
          title: item.title,
          benefitFormatted: item.benefitFormatted,
          badge: 'Eligible Now',
          badgeType: 'SUCCESS',
          ctaText: item.actionText,
          ctaUrl: item.actionUrl,
        })),
      },
      {
        stageKey: 'NEXT_ACADEMIC_YEAR',
        stageLabel: 'NEXT ACADEMIC YEAR',
        title: 'Almost Eligible & Progression',
        subtitle: '1-2 requirements remaining; achievable within current degree progression',
        items: almostEligible.map((item) => ({
          id: item.id,
          title: item.title,
          benefitFormatted: item.benefitFormatted,
          badge: item.readinessPercent + '% Ready • ' + item.remainingRequirementsCount + ' remaining',
          badgeType: 'WARNING',
          ctaText: 'View Roadmap',
          ctaUrl: item.primaryAction.url,
        })),
      },
      {
        stageKey: 'AFTER_GRADUATION',
        stageLabel: 'AFTER GRADUATION',
        title: 'Future Fellowships & Overseas Study',
        subtitle: 'Postgraduate, doctoral, and international opportunities to prepare for now',
        items: futureOpportunities.map((item) => ({
          id: item.id,
          title: item.title,
          benefitFormatted: item.benefitFormatted,
          badge: item.expectedStage,
          badgeType: 'INFO',
          ctaText: 'Track Opportunity',
          ctaUrl: item.primaryAction.url,
        })),
      },
    ];

    return {
      summary: {
        eligibleCount: eligibleNow.length,
        almostCount: almostEligible.length,
        futureCount: futureOpportunities.length,
        totalEvaluated: scholarships.length,
      },
      eligibleNow,
      almostEligible,
      futureOpportunities,
      nextSteps,
      journeyStages,
    };
  },

  async getScholarshipDetailRoadmap(userId: string, scholarshipId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        enrolledInstitution: true,
        documents: true,
        applications: {
          where: { scholarshipId },
          include: { statusHistory: { orderBy: { createdAt: 'desc' } } },
        },
      },
    });

    if (!student) throw new Error('Student profile not found');

    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
      include: {
        provider: true,
        eligibilityRules: true,
        documentRequirements: true,
      },
    });

    if (!scholarship) throw new Error('Scholarship not found');

    const now = new Date();
    const passedCriteria: RoadmapCriterion[] = [];
    const gapCriteria: RoadmapCriterion[] = [];
    const futureCriteria: RoadmapCriterion[] = [];
    const howToBecomeEligible: { stepNumber: number; title: string; description: string; status: 'COMPLETED' | 'ACTION_REQUIRED' | 'FUTURE' }[] = [];

    for (const rule of scholarship.eligibilityRules) {
      const studentVal = (student as any)[rule.field];
      let ruleVal: any;
      try {
        ruleVal = JSON.parse(rule.value);
      } catch {
        ruleVal = rule.value;
      }

      let pass = false;
      if (studentVal !== null && studentVal !== undefined && studentVal !== '') {
        switch (rule.operator) {
          case 'EQ':
            pass = String(studentVal).toLowerCase() === String(ruleVal).toLowerCase();
            break;
          case 'IN':
            pass = Array.isArray(ruleVal) && ruleVal.map((x: any) => String(x).toLowerCase()).includes(String(studentVal).toLowerCase());
            break;
          case 'LTE':
            pass = Number(studentVal) <= Number(ruleVal);
            break;
          case 'GTE':
            pass = Number(studentVal) >= Number(ruleVal);
            break;
          case 'LT':
            pass = Number(studentVal) < Number(ruleVal);
            break;
          case 'GT':
            pass = Number(studentVal) > Number(ruleVal);
            break;
          default:
            pass = String(studentVal) === String(ruleVal);
        }
      }

      if (pass) {
        passedCriteria.push({
          field: rule.field,
          description: rule.description,
          studentValue: String(studentVal),
          requiredValue: String(ruleVal),
          status: 'MET',
          explanation: 'Requirement satisfied (Current: ' + studentVal + ').',
        });
      } else if (rule.field === 'educationLevel' && (String(ruleVal).includes('PG') || String(ruleVal).includes('PHD')) && student.educationLevel === 'UG') {
        futureCriteria.push({
          field: rule.field,
          description: rule.description,
          studentValue: studentVal ?? 'Undergraduate',
          requiredValue: String(ruleVal),
          status: 'FUTURE',
          explanation: 'Requires graduation completion and enrolment in Master\'s or Doctoral research.',
          timeEstimate: 'After Graduation',
        });
      } else {
        gapCriteria.push({
          field: rule.field,
          description: rule.description,
          studentValue: studentVal !== null && studentVal !== undefined ? String(studentVal) : 'Not provided',
          requiredValue: rule.operator + ' ' + ruleVal,
          status: 'GAP',
          explanation: studentVal !== null && studentVal !== undefined
            ? 'Current value (' + studentVal + ') does not meet threshold (' + rule.operator + ' ' + ruleVal + ').'
            : 'Profile field \'' + rule.field + '\' needs completion.',
          actionRequired: rule.field === 'academicPercentage'
            ? 'Attain >= ' + ruleVal + '% in semester evaluations'
            : rule.field === 'yearOfStudy'
            ? 'Advance to Year ' + ruleVal + ' of course'
            : 'Update ' + rule.description,
          timeEstimate: rule.field === 'academicPercentage' ? 'Next Semester' : 'Upcoming Academic Session',
        });
      }
    }

    let stepCount = 1;
    for (const p of passedCriteria) {
      howToBecomeEligible.push({
        stepNumber: stepCount++,
        title: p.description,
        description: 'Verified: ' + p.studentValue,
        status: 'COMPLETED',
      });
    }

    for (const g of gapCriteria) {
      howToBecomeEligible.push({
        stepNumber: stepCount++,
        title: g.actionRequired || g.description,
        description: g.explanation,
        status: 'ACTION_REQUIRED',
      });
    }

    for (const f of futureCriteria) {
      howToBecomeEligible.push({
        stepNumber: stepCount++,
        title: f.description,
        description: f.explanation,
        status: 'FUTURE',
      });
    }

    const documentHealth = scholarship.documentRequirements.map((req) => {
      const userDoc = student.documents.find((d) => d.documentType === req.documentType);
      let status = 'MISSING';
      let daysLeft: number | null = null;
      let notes = 'Document not uploaded in wallet yet.';

      if (userDoc) {
        status = userDoc.verificationState || 'UPLOADED';
        if (userDoc.expiryDate) {
          daysLeft = Math.ceil((new Date(userDoc.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysLeft <= 0) {
            status = 'EXPIRED';
            notes = 'Certificate expired. Upload latest version.';
          } else if (daysLeft <= 30) {
            status = 'EXPIRING_SOON';
            notes = 'Expires in ' + daysLeft + ' days. Renewal recommended.';
          } else {
            status = 'VALID';
            notes = 'Valid (' + daysLeft + ' days remaining).';
          }
        } else {
          status = 'VALID';
          notes = userDoc.notes || 'Verified document on file.';
        }
      }

      return {
        documentType: req.documentType,
        description: req.description || req.documentType,
        status,
        daysLeft,
        notes,
        docId: userDoc?.id || null,
      };
    });

    const totalCriteria = scholarship.eligibilityRules.length;
    const readinessPercent = totalCriteria > 0 ? Math.round((passedCriteria.length / totalCriteria) * 100) : 100;

    const existingApplication = student.applications.length > 0 ? student.applications[0] : null;

    return {
      scholarship: {
        id: scholarship.id,
        title: scholarship.title,
        description: scholarship.description,
        benefit: scholarship.benefit,
        benefitFormatted: scholarship.benefitDescription || ('₹' + scholarship.benefit.toLocaleString('en-IN')),
        provider: scholarship.provider.organizationName,
        deadline: scholarship.deadline,
        targetGroup: scholarship.targetGroup,
      },
      readinessPercent,
      criteriaSummary: {
        total: totalCriteria,
        metCount: passedCriteria.length,
        gapCount: gapCriteria.length,
        futureCount: futureCriteria.length,
      },
      criteria: {
        met: passedCriteria,
        gap: gapCriteria,
        future: futureCriteria,
      },
      howToBecomeEligible,
      documentHealth,
      existingApplication: existingApplication
        ? {
            id: existingApplication.id,
            status: existingApplication.status,
            submittedAt: existingApplication.submittedAt,
            correctionNote: existingApplication.correctionNote,
          }
        : null,
      suggestedJagoQuestions: [
        'Why am I not eligible yet for ' + scholarship.title + '?',
        'What exact action do I need to take to qualify?',
        'Which document is missing or expiring for this scheme?',
        'When does the application cycle open for me?',
      ],
    };
  },
};
