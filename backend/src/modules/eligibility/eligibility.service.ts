import { prisma } from '../../lib/prisma';
import { EligibilityResult, CriterionResult } from './eligibility.types';
import { MatchingService, MatchProfile } from '../matching/matching.service';

export interface ComprehensiveEligibilityResult extends EligibilityResult {
  matchProfile: MatchProfile;
}

export const EligibilityService = {
  async evaluateEligibility(studentIdOrUserId: string, scholarshipId: string): Promise<ComprehensiveEligibilityResult> {
    const student = await prisma.studentProfile.findFirst({
      where: { OR: [{ userId: studentIdOrUserId }, { id: studentIdOrUserId }] },
      include: { documents: true }
    });
    if (!student) throw new Error('Student profile not found');

    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
      include: { eligibilityRules: true, documentRequirements: true }
    });
    if (!scholarship) throw new Error('Scholarship not found');

    const passedCriteria: CriterionResult[] = [];
    const failedCriteria: CriterionResult[] = [];
    const missingCriteria: CriterionResult[] = [];

    for (const rule of scholarship.eligibilityRules) {
      const val = (student as any)[rule.field];
      if (val === null || val === undefined || val === '') {
        missingCriteria.push({
          field: rule.field,
          description: rule.description,
          status: 'MISSING',
          studentValue: null,
          requiredValue: rule.value,
          explanation: `Profile field '${rule.field}' is not filled in.`
        });
        continue;
      }
      
      let pass = false;
      let ruleVal: any;
      try {
        ruleVal = JSON.parse(rule.value);
      } catch {
        ruleVal = rule.value;
      }
      
      switch (rule.operator) {
        case 'EQ': pass = String(val).toLowerCase() === String(ruleVal).toLowerCase(); break;
        case 'IN': pass = Array.isArray(ruleVal) && ruleVal.map((x: any) => String(x).toLowerCase()).includes(String(val).toLowerCase()); break;
        case 'LTE': pass = Number(val) <= Number(ruleVal); break;
        case 'GTE': pass = Number(val) >= Number(ruleVal); break;
        case 'LT': pass = Number(val) < Number(ruleVal); break;
        case 'GT': pass = Number(val) > Number(ruleVal); break;
        default: pass = String(val) === String(ruleVal);
      }

      const res: CriterionResult = {
        field: rule.field,
        description: rule.description,
        status: pass ? 'PASS' : 'FAIL',
        studentValue: String(val),
        requiredValue: rule.value,
        explanation: pass
          ? `Criterion met (${val} satisfies requirement).`
          : `Criterion not met (${val} does not satisfy requirement ${rule.operator} ${rule.value}).`
      };

      if (pass) passedCriteria.push(res);
      else failedCriteria.push(res);
    }

    let status: EligibilityResult['status'] = 'ELIGIBLE';
    if (failedCriteria.length > 0) status = 'NOT_ELIGIBLE';
    else if (missingCriteria.length > 0) status = 'NEEDS_INFORMATION';

    let summary = 'You meet all the required criteria for this scholarship.';
    if (status === 'NOT_ELIGIBLE') summary = 'You currently do not meet one or more criteria for this scholarship.';
    else if (status === 'NEEDS_INFORMATION') summary = 'Please complete your profile details to evaluate eligibility.';

    const baseResult: EligibilityResult = { status, passedCriteria, failedCriteria, missingCriteria, summary };
    const matchProfile = MatchingService.computeMatchProfile(baseResult, student, scholarship, student.documents?.length || 0);

    return {
      ...baseResult,
      matchProfile
    };
  }
};
