import { prisma } from '../../lib/prisma';
import { EligibilityService } from '../eligibility/eligibility.service';
import { config } from '../../config';
import { logger } from '../../lib/logger';

interface GroundedContext {
  studentName?: string;
  category?: string;
  state?: string;
  education?: string;
  scholarships: Array<{ id: string; title: string; benefit: number; deadline: string }>;
  applications: Array<{ scholarshipTitle: string; status: string; correctionNote?: string | null; submittedAt?: Date | null }>;
  documents: Array<{ type: string; state: string }>;
}

const SCHOLARSHIP_NAME_MAP: Record<string, Record<string, string>> = {
  hi: {
    s1: 'आदिवासी उच्च शिक्षा सहायता छात्रवृत्ति',
    s2: 'एसटी स्नातक शैक्षणिक सहायता योजना',
    s3: 'राष्ट्रीय उच्च शिक्षा मेधा संवर्धन योजना',
    s4: 'राष्ट्रीय प्रवासी छात्रवृत्ति योजना',
    s5: 'राष्ट्रीय फैलोशिप योजना',
    s6: 'प्री-मैट्रिक एसटी छात्रवृत्ति',
    s7: 'मुख्यमंत्री जनजातीय शिक्षा संबल योजना',
    s8: 'ई-कल्याण झारखंड पोस्ट-मैट्रिक छात्रवृत्ति',
  },
  sat: {
    s1: 'ᱟᱹᱫᱤᱵᱟᱹᱥᱤ ᱪᱮᱛᱟᱱ ᱥᱮᱪᱮᱫ ᱜᱚᱲᱚ ᱥᱠᱳᱞᱟᱨᱥᱤᱯ',
    s2: 'ᱮᱥ.ᱴᱤ ᱜᱨᱮᱡᱩᱣᱮᱴ ᱥᱮᱪᱮᱫ ᱜᱚᱲᱚ ᱡᱚᱡᱚᱱᱟ',
    s3: 'ᱡᱟᱹᱛᱤᱭᱟᱹᱨᱤ ᱪᱮᱛᱟᱱ ᱥᱮᱪᱮᱫ ᱢᱮᱨᱤᱴ ᱜᱚᱲᱚ ᱡᱚᱡᱚᱱᱟ',
    s4: 'ᱡᱟᱹᱛᱤᱭᱟᱹᱨᱤ ᱵᱤᱫᱮᱥ ᱥᱠᱳᱞᱟᱨᱥᱤᱯ ᱡᱚᱡᱚᱱᱟ',
    s5: 'ᱡᱟᱹᱛᱤᱭᱟᱹᱨᱤ ᱯᱷᱮᱞᱳᱥᱤᱯ ᱡᱚᱡᱚᱱᱟ',
    s6: 'ᱯᱨᱤ-ᱢᱮᱴᱨᱤᱠ ᱮᱥ.ᱴᱤ ᱥᱠᱳᱞᱟᱨᱥᱤᱯ',
    s7: 'ᱥᱤᱨᱟᱹ ᱢᱚᱱᱛᱨᱤ ᱟᱹᱫᱤᱵᱟᱹᱥᱤ ᱥᱮᱪᱮᱫ ᱜᱚᱲᱚ',
    s8: 'ᱤ-ᱠᱚᱞᱭᱟᱬ ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱯᱳᱥᱴ-ᱢᱮᱴᱨᱤᱠ ᱥᱠᱳᱞᱟᱨᱥᱤᱯ',
  },
  bh: {
    s1: 'आदिवासी ऊंची भणतर सहायता छात्रवृत्ति',
    s2: 'एसटी कॉलेज भणतर सहायता योजना',
    s3: 'राष्ट्रीय ऊंची भणतर मेरिट सहायता योजना',
    s4: 'राष्ट्रीय परदेश भणतर छात्रवृत्ति योजना',
    s5: 'राष्ट्रीय फेलोशिप योजना',
    s6: 'मैट्रिक पेहला एसटी छात्रवृत्ति',
    s7: 'मुख्यमंत्री आदिवासी भणतर सहायता',
    s8: 'ई-कल्याण झारखंड पोस्ट-मैट्रिक छात्रवृत्ति',
  },
  gon: {
    s1: 'कोयतुर उच्च भणतर मदत छात्रवृत्ति',
    s2: 'एसटी डिग्री भणतर मदत योजना',
    s3: 'राष्ट्रीय उच्च भणतर मेरिट मदत योजना',
    s4: 'राष्ट्रीय परदेस छात्रवृत्ति योजना',
    s5: 'राष्ट्रीय फेलोशिप योजना',
    s6: 'मैट्रिक मुन्ने एसटी छात्रवृत्ति',
    s7: 'मुख्यमंत्री कोयतुर भणतर संबल',
    s8: 'ई-कल्याण झारखंड पोस्ट-मैट्रिक छात्रवृत्ति',
  },
  kru: {
    s1: 'कुड़ुख़ उच्च पढ़ा सहायता छात्रवृत्ति',
    s2: 'एसटी डिग्री पढ़ा सहायता योजना',
    s3: 'राष्ट्रीय उच्च पढ़ा मेरिट सहायता योजना',
    s4: 'राष्ट्रीय विदेश छात्रवृत्ति योजना',
    s5: 'राष्ट्रीय फेलोशिप योजना',
    s6: 'मैट्रिक मुन्ने एसटी छात्रवृत्ति',
    s7: 'मुख्यमंत्री आदिवासी पढ़ा संबल योजना',
    s8: 'ई-कल्याण झारखंड पोस्ट-मैट्रिक छात्रवृत्ति',
  },
};

function getTranslatedTitle(rawTitle: string, lang: string): string {
  if (!rawTitle || lang === 'en') return rawTitle;
  const map = SCHOLARSHIP_NAME_MAP[lang];
  if (!map) return rawTitle;
  const lower = rawTitle.toLowerCase();
  if (lower.includes('higher education support') || lower.includes('tribal higher')) return map.s1 || rawTitle;
  if (lower.includes('undergraduate academic assistance') || lower.includes('st undergraduate')) return map.s2 || rawTitle;
  if (lower.includes('merit support') || lower.includes('higher education merit')) return map.s3 || rawTitle;
  if (lower.includes('overseas') || lower.includes('nos')) return map.s4 || rawTitle;
  if (lower.includes('fellowship') || lower.includes('nfst')) return map.s5 || rawTitle;
  if (lower.includes('pre-matric') || lower.includes('class ix')) return map.s6 || rawTitle;
  if (lower.includes('chief minister') || lower.includes('education grant')) return map.s7 || rawTitle;
  if (lower.includes('e-kalyan') || lower.includes('post-matric')) return map.s8 || rawTitle;
  if (lower.includes('birsa')) return map.s5 || rawTitle;
  return rawTitle;
}

function getTranslatedStatus(status: string, lang: string): string {
  const map: Record<string, Record<string, string>> = {
    hi: {
      DRAFT: 'प्रारूप',
      SUBMITTED: 'जमा किया गया',
      UNDER_VERIFICATION: 'सत्यापन प्रक्रियाधीन',
      DOCUMENT_DEFICIENCY: 'दस्तावेज़ की कमी',
      CORRECTION_REQUIRED: 'सुधार आवश्यक',
      VERIFIED: 'सत्यापित',
      APPROVED: 'स्वीकृत',
      REJECTED: 'अस्वीकृत',
      DISBURSEMENT_PENDING: 'भुगतान लंबित',
      DISBURSED: 'भुगतान संपन्न',
    },
    sat: {
      DRAFT: 'ᱰᱨᱟᱯᱷᱴ',
      SUBMITTED: 'ᱡᱚᱢᱟ ᱟᱠᱟᱱᱟ',
      UNDER_VERIFICATION: 'ᱡᱟᱸᱪ ᱪᱟᱞᱟᱜ ᱠᱟᱱᱟ',
      DOCUMENT_DEFICIENCY: 'ᱠᱟᱜᱚᱡᱽ ᱠᱚᱢ',
      CORRECTION_REQUIRED: 'ᱥᱩᱫᱷᱨᱟᱹᱣ ᱞᱟᱹᱠᱛᱤ',
      VERIFIED: 'ᱯᱚᱨᱚᱠ ᱟᱠᱟᱱᱟ',
      APPROVED: 'ᱢᱟᱹᱧᱡᱩᱨ ᱟᱠᱟᱱᱟ',
      REJECTED: 'ᱵᱟᱹᱛᱤᱞ ᱟᱠᱟᱱᱟ',
      DISBURSEMENT_PENDING: 'ᱠᱟᱹᱣᱰᱤ ᱵᱟᱠᱤ',
      DISBURSED: 'ᱠᱟᱹᱣᱰᱤ ᱮᱢ ᱮᱱᱟ',
    },
    bh: {
      DRAFT: 'ड्राफ्ट',
      SUBMITTED: 'जमा थयुं',
      UNDER_VERIFICATION: 'जांच मां छे',
      DOCUMENT_DEFICIENCY: 'कागदिया खूटे छे',
      CORRECTION_REQUIRED: 'सुधारो जरूरी',
      VERIFIED: 'सत्यापित',
      APPROVED: 'मंजूर',
      REJECTED: 'रद्द',
      DISBURSEMENT_PENDING: 'पैसा बाकी',
      DISBURSED: 'पैसा चुकाया',
    },
    gon: {
      DRAFT: 'ड्राफ्ट',
      SUBMITTED: 'जमा आता',
      UNDER_VERIFICATION: 'जांच ते मंता',
      DOCUMENT_DEFICIENCY: 'कागद घट्टे मंता',
      CORRECTION_REQUIRED: 'सुधार जरूरी',
      VERIFIED: 'सत्यापित',
      APPROVED: 'मंजूर',
      REJECTED: 'रद्द',
      DISBURSEMENT_PENDING: 'रुपया बाकी',
      DISBURSED: 'रुपया पुट्टा',
    },
    kru: {
      DRAFT: 'ड्राफ्ट',
      SUBMITTED: 'जमा मंजरा',
      UNDER_VERIFICATION: 'जांच नू रही',
      DOCUMENT_DEFICIENCY: 'कागद कमती',
      CORRECTION_REQUIRED: 'सुधार चाही',
      VERIFIED: 'सत्यापित',
      APPROVED: 'मंजूर',
      REJECTED: 'रद्द',
      DISBURSEMENT_PENDING: 'टाका बाकी',
      DISBURSED: 'टाका मंजरा',
    },
  };

  return map[lang]?.[status] || status;
}

export const JagoService = {
  async getStudentData(userId: string): Promise<GroundedContext> {
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        documents: true,
        applications: {
          include: { scholarship: true },
        },
      },
    });

    const scholarships = await prisma.scholarship.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, title: true, benefit: true, deadline: true },
    });

    return {
      studentName: student?.fullName,
      category: student?.category || undefined,
      state: student?.state || undefined,
      education: student?.educationLevel ? `${student.educationLevel} (${student.course || ''})` : undefined,
      scholarships: scholarships.map(s => ({
        id: s.id,
        title: s.title,
        benefit: s.benefit,
        deadline: s.deadline.toLocaleDateString('en-IN'),
      })),
      applications: (student?.applications || []).map(a => ({
        scholarshipTitle: a.scholarship.title,
        status: a.status,
        correctionNote: a.correctionNote,
        submittedAt: a.submittedAt,
      })),
      documents: (student?.documents || []).map(d => ({
        type: d.documentType,
        state: d.verificationState,
      })),
    };
  },

  async generateResponse(userMessage: string, context: GroundedContext, language: string): Promise<string> {
    const lang = (language || 'en').toLowerCase();
    const isHindi = lang === 'hi';
    const isSantali = lang === 'sat';
    const isBhili = lang === 'bh';
    const isGondi = lang === 'gon';
    const isKurukh = lang === 'kru';
    const lower = userMessage.toLowerCase();

    // Check if external LLM configured
    if (config.jagoApiKey) {
      try {
        let langInstruction = 'English';
        if (isHindi) langInstruction = 'Hindi (Devanagari script)';
        else if (isSantali) langInstruction = 'Santali (Ol Chiki script ONLY, never use English in brackets)';
        else if (isBhili) langInstruction = 'Bhili dialect (Devanagari script)';
        else if (isGondi) langInstruction = 'Gondi language (Devanagari script)';
        else if (isKurukh) langInstruction = 'Kurukh language (Devanagari script)';

        const prompt = `You are JAGO, the official scholarship guidance assistant on the ShikshaSaarthi platform for tribal students under the Ministry of Tribal Affairs.
You must respond strictly in ${langInstruction}.

CRITICAL RULES:
1. Ground every answer strictly in the provided DATA CONTEXT below.
2. Never invent scholarships, deadlines, amounts, or eligibility criteria.
3. If information is not in the context, say so clearly.
4. Keep answers supportive, concise, clear, and structured.

DATA CONTEXT:
<DATA>
Student: ${context.studentName || 'Student'} (Category: ${context.category || 'Not specified'}, State: ${context.state || 'Not specified'})
Available Scholarships:
${context.scholarships.map(s => `- ${s.title}: ₹${s.benefit}/year, Deadline: ${s.deadline}`).join('\n')}

Active Applications:
${context.applications.length > 0 ? context.applications.map(a => `- ${a.scholarshipTitle}: Status=${a.status}${a.correctionNote ? ` (Correction required: ${a.correctionNote})` : ''}`).join('\n') : 'No active applications'}

Uploaded Documents:
${context.documents.length > 0 ? context.documents.map(d => `- ${d.type}: ${d.state}`).join('\n') : 'No documents uploaded yet'}
</DATA>

User Question: ${userMessage}
`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.jagoModel}:generateContent?key=${config.jagoApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 600 },
          }),
        });

        if (res.ok) {
          const data: any = await res.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) return reply.trim();
        }
      } catch (err) {
        logger.warn('JAGO LLM call failed, using deterministic grounded fallback', err);
      }
    }

    // Deterministic grounded response engine across 6 languages
    if (lower.includes('status') || lower.includes('स्थिति') || lower.includes('pending') || lower.includes('हालत') || lower.includes('ᱦᱟᱞᱚᱛ') || lower.includes('आवेदन') || lower.includes('अरजी')) {
      if (context.applications.length === 0) {
        if (isSantali) return `ᱡᱚᱦᱟᱨ ${context.studentName || ''}! ᱟᱢᱟᱜ ᱪᱮᱫ ᱦᱚᱸ ᱪᱟᱹᱞᱩ ᱟᱨᱫᱟᱥ ᱵᱟᱹᱱᱩᱜ-ᱟ᱾ ᱫᱟᱭᱟᱠᱟᱛᱮ ᱥᱠᱳᱞᱟᱨᱥᱤᱯ ᱴᱮᱵᱽ ᱨᱮ ᱥᱮᱱ ᱠᱟᱛᱮ ᱟᱨᱫᱟᱥ ᱢᱮ᱾`;
        if (isBhili) return `राम राम ${context.studentName || ''}! तमारे पासे हमणा कोई चालू अरजी नथी। छात्रवृत्ति पेज पर जईने अरजी करो।`;
        if (isGondi) return `सेवा जोहार ${context.studentName || ''}! नावा कोई चालू दरखास्त सिल्लो। छात्रवृत्ति पेज ते दरखास्त कीम।`;
        if (isKurukh) return `जय धरमे ${context.studentName || ''}! निंग्हय कोई चालू अरजी मल्ला। छात्रवृत्ति पन्ना नू अरजी ननके।`;
        if (isHindi) return `नमस्ते ${context.studentName || ''}! आपके पास अभी कोई सक्रिय छात्रवृत्ति आवेदन नहीं है। आप छात्रवृत्ति अनुभाग में जाकर अपनी पात्रता के अनुसार छात्रवृत्ति के लिए आवेदन कर सकते हैं।`;
        return `Hello ${context.studentName || ''}! You do not have any active scholarship applications right now. Please explore the Scholarships section to apply for schemes matching your profile.`;
      }
      const app = context.applications[0];
      if (isSantali) {
        return `ᱟᱢᱟᱜ ᱟᱨᱫᱟᱥ ᱨᱮᱱᱟᱜ ᱦᱟᱞᱚᱛ:
📋 ᱥᱠᱳᱞᱟᱨᱥᱤᱯ: **${getTranslatedTitle(app.scholarshipTitle, lang)}**
📊 ᱦᱟᱞᱚᱛ: **${getTranslatedStatus(app.status, 'sat')}**
${app.correctionNote ? `⚠️ ᱫᱤᱥᱟᱹ: "${app.correctionNote}"` : ''}

ᱟᱢᱟᱜ ᱠᱟᱜᱚᱡᱽ ᱠᱚ ᱡᱟᱸᱪᱚᱜ ᱠᱟᱱᱟ᱾`;
      }
      if (isBhili) {
        return `तमारी अरजीनी हालत:
📋 छात्रवृत्ति: **${getTranslatedTitle(app.scholarshipTitle, lang)}**
📊 हालत: **${getTranslatedStatus(app.status, 'bh')}**
${app.correctionNote ? `⚠️ नोट: "${app.correctionNote}"` : ''}

अधिकारी तमारो कागदियो तपासी रह्या छे।`;
      }
      if (isGondi) {
        return `नावा दरखास्त हालत:
📋 छात्रवृत्ति: **${getTranslatedTitle(app.scholarshipTitle, lang)}**
📊 हालत: **${getTranslatedStatus(app.status, 'gon')}**
${app.correctionNote ? `⚠️ नोट: "${app.correctionNote}"` : ''}

अधिकारी कागद जांच कीसोर मंतुर।`;
      }
      if (isKurukh) {
        return `एंहय अरजी हालत:
📋 छात्रवृत्ति: **${getTranslatedTitle(app.scholarshipTitle, lang)}**
📊 हालत: **${getTranslatedStatus(app.status, 'kru')}**
${app.correctionNote ? `⚠️ सुझव: "${app.correctionNote}"` : ''}

अधिकारी कागद एरते रअनर।`;
      }
      if (isHindi) {
        return `आपके आवेदन की वर्तमान स्थिति:
📋 छात्रवृत्ति: **${getTranslatedTitle(app.scholarshipTitle, lang)}**
📊 स्थिति: **${getTranslatedStatus(app.status, 'hi')}**
${app.correctionNote ? `⚠️ प्रदाता की टिप्पणी: "${app.correctionNote}"` : ''}

सत्यापन अधिकारी आपके दस्तावेजों की समीक्षा कर रहे हैं। कोई कमी होने पर आपको सूचना दी जाएगी।`;
      }
      return `Here is your current application status:
• Scholarship: **${app.scholarshipTitle}**
• Status: **${app.status}**
${app.correctionNote ? `• Note from Verifier: "${app.correctionNote}"` : ''}

Your submitted documents are currently being reviewed by the institutional verification officer. You will receive an immediate notification if any action is needed.`;
    }

    if (lower.includes('eligible') || lower.includes('पात्र') || lower.includes('scholarship') || lower.includes('छात्रवृत्ति') || lower.includes('ᱥᱠᱳᱞᱟᱨᱥᱤᱯ') || lower.includes('पुट्टा') || lower.includes('लायक')) {
      if (isSantali) {
        return `ᱡᱚᱦᱟᱨ ${context.studentName || ''}! ᱟᱢᱟᱜ ᱩᱯᱨᱩᱢ ᱞᱮᱠᱟᱛᱮ ᱱᱚᱶᱟ ᱥᱠᱳᱞᱟᱨᱥᱤᱯ ᱠᱚ ᱢᱮᱱᱟᱜ-ᱟ:

${context.scholarships.map(s => `• **${getTranslatedTitle(s.title, lang)}**\n  - ᱥᱮᱨᱢᱟᱠᱤᱭᱟᱹ ᱜᱚᱲᱚ: ₹${s.benefit.toLocaleString('en-IN')}\n  - ᱢᱩᱪᱟᱹᱫ ᱢᱟᱦᱟᱸ: ${s.deadline}`).join('\n\n')}

ᱵᱟᱹᱲᱛᱤ ᱵᱟᱰᱟᱭ ᱞᱟᱹᱜᱤᱫ 'ᱥᱠᱳᱞᱟᱨᱥᱤᱯ' ᱴᱮᱵᱽ ᱧᱮᱞ ᱢᱮ᱾`;
      }
      if (isBhili) {
        return `राम राम ${context.studentName || ''}! तमारी प्रोफाइल मुजब आ छात्रवृत्तिओ उपलब्ध छे:

${context.scholarships.map(s => `• **${getTranslatedTitle(s.title, lang)}**\n  - वरसनो फायदो: ₹${s.benefit.toLocaleString('en-IN')}\n  - छेल्ली तारीख: ${s.deadline}`).join('\n\n')}

वधारे विगत माटे 'छात्रवृत्ति' पेज जुओ।`;
      }
      if (isGondi) {
        return `सेवा जोहार ${context.studentName || ''}! नावा प्रोफाइल आधार ते इव छात्रवृत्ति मंता:

${context.scholarships.map(s => `• **${getTranslatedTitle(s.title, lang)}**\n  - सालना लाभ: ₹${s.benefit.toLocaleString('en-IN')}\n  - अंतिम तारीख: ${s.deadline}`).join('\n\n')}

विस्तार चूड़ेले 'छात्रवृत्ति' पेज ते हाना।`;
      }
      if (isKurukh) {
        return `जय धरमे ${context.studentName || ''}! निंग्हय प्रोफ़ाइल मुजब ई छात्रवृत्ति रही:

${context.scholarships.map(s => `• **${getTranslatedTitle(s.title, lang)}**\n  - बछर फायदा: ₹${s.benefit.toLocaleString('en-IN')}\n  - अंतिम बेड़ा: ${s.deadline}`).join('\n\n')}

बढ़िया एरने बर 'छात्रवृत्ति' पन्ना नू काला।`;
      }
      if (isHindi) {
        return `नमस्ते ${context.studentName || ''}! आपके प्रोफ़ाइल (श्रेणी: ${context.category || 'ST'}, राज्य: ${context.state || 'झारखंड'}) के आधार पर निम्नलिखित छात्रवृत्तियां उपलब्ध हैं:

${context.scholarships.map(s => `• **${getTranslatedTitle(s.title, lang)}**\n  - वार्षिक लाभ: ₹${s.benefit.toLocaleString('en-IN')}\n  - अंतिम तिथि: ${s.deadline}`).join('\n\n')}

विस्तृत पात्रता विवरण और आवश्यक दस्तावेजों की सूची देखने के लिए 'छात्रवृत्ति' पृष्ठ पर जाएं।`;
      }
      return `Hello ${context.studentName || ''}! Based on your profile (Category: ${context.category || 'ST'}, State: ${context.state || 'Jharkhand'}), here are the matching scholarships on ShikshaSaarthi:

${context.scholarships.map(s => `• **${s.title}**\n  - Annual Benefit: ₹${s.benefit.toLocaleString('en-IN')}\n  - Application Deadline: ${s.deadline}`).join('\n\n')}

You can inspect the criterion-by-criterion eligibility checklist on each scholarship detail page.`;
    }

    if (lower.includes('document') || lower.includes('दस्तावेज़') || lower.includes('कागजात') || lower.includes('कागद') || lower.includes('ᱥᱟᱠᱟᱢ') || lower.includes('need') || lower.includes('चाहिए') || lower.includes('ᱞᱟᱹᱠᱛᱤ')) {
      if (isSantali) {
        return `ᱟᱹᱫᱤᱵᱟᱹᱥᱤ ᱥᱠᱳᱞᱟᱨᱥᱤᱯ ᱞᱟᱹᱜᱤᱫ ᱞᱟᱹᱠᱛᱤᱭᱟᱱ ᱠᱟᱜᱚᱡᱽ ᱠᱚ:
1. **ᱟᱹᱫᱤᱵᱟᱹᱥᱤ ᱡᱟᱹᱛᱤ ᱥᱟᱠᱟᱢ**
2. **ᱥᱮᱨᱢᱟᱠᱤᱭᱟᱹ ᱟᱨᱡᱟᱣ ᱥᱟᱠᱟᱢ**
3. **ᱥᱮᱪᱮᱫ ᱢᱟᱨᱠᱥᱤᱴ ᱥᱟᱠᱟᱢ**
4. **ᱤᱱᱥᱴᱤᱴᱤᱭᱩᱴ ᱵᱳᱱᱟᱯᱷᱟᱭᱤᱰ ᱥᱟᱠᱟᱢ**
5. **ᱟᱫᱷᱟᱨ ᱡᱚᱲᱟᱣ ᱵᱮᱸᱠ ᱯᱟᱥᱵᱩᱠ**

ᱣᱟᱞᱮᱴ ᱨᱮ ᱱᱤᱛᱚᱜ ${context.documents.length} ᱜᱚᱴᱟᱝ ᱠᱟᱜᱚᱡᱽ ᱢᱮᱱᱟᱜ-ᱟ᱾`;
      }
      if (isBhili) {
        return `आदिवासी छात्रवृत्ति माटे जरूरी कागदिया:
1. **एसटी जाति प्रमाण पत्र**
2. **वरसनी कमाई प्रमाण पत्र**
3. **भणतरनी मार्कशीट**
4. **कॉलेजनो बोनाफाइड कागद**
5. **आधार बैंक पासबुक**

तमारा वॉलेट मां हमणा ${context.documents.length} कागद छे।`;
      }
      if (isGondi) {
        return `कोयतुर छात्रवृत्ति बर जरूरी कागद:
1. **कोयतुर जात प्रमाण पत्र**
2. **सालना आमदनी कागद**
3. **भणतर मार्कशीट कागद**
4. **कॉलेज बोनाफाइड कागद**
5. **आधार बैंक पासबुक**

नावा वॉलेट ते ${context.documents.length} कागद मंता।`;
      }
      if (isKurukh) {
        return `कुड़ुख़ छात्रवृत्ति खातिर जरूरी कागद:
1. **कुड़ुख़ जात कागद**
2. **बछर कमाई कागद**
3. **पढ़ा मार्कशीट**
4. **कॉलेज बोनाफाइड कागद**
5. **आधार बैंक पासबुक**

निंग्हय वॉलेट नू ${context.documents.length} कागद रही।`;
      }
      if (isHindi) {
        return `आदिवासी छात्रवृत्ति आवेदनों के लिए सामान्यतः आवश्यक दस्तावेज़:
1. **सक्षम प्राधिकारी द्वारा जारी जाति प्रमाण पत्र**
2. **वार्षिक पारिवारिक आय प्रमाण पत्र**
3. **पिछली कक्षा की अंकतालिका**
4. **संस्थान से बोनाफाइड प्रमाण पत्र**
5. **आधार से जुड़ा सक्रिय बैंक खाता विवरण**

आपके दस्तावेज़ वॉलेट में वर्तमान में ${context.documents.length} दस्तावेज़ अपलोड हैं। आप 'दस्तावेज़ वॉलेट' में जाकर नए दस्तावेज़ अपलोड कर सकते हैं।`;
      }
      return `Key documents typically required for tribal scholarship schemes:
1. **Community / Caste Certificate (ST Category)**
2. **Annual Family Income Certificate**
3. **Previous Academic Marksheet / Grade Card**
4. **Institutional Bonafide Certificate**
5. **Aadhaar-seeded Bank Account Passbook / Document**

You currently have ${context.documents.length} document(s) uploaded in your Document Wallet. You can manage and reuse them anytime.`;
    }

    if (lower.includes('deadline') || lower.includes('तारीख') || lower.includes('अंतिम') || lower.includes('ᱢᱩᱪᱟᱹᱫ') || lower.includes('last date')) {
      if (isSantali) {
        return `ᱥᱠᱳᱞᱟᱨᱥᱤᱯ ᱢᱩᱪᱟᱹᱫ ᱢᱟᱦᱟᱸ ᱠᱚ:
${context.scholarships.map(s => `• **${getTranslatedTitle(s.title, lang)}**: ${s.deadline}`).join('\n')}

ᱫᱟᱭᱟᱠᱟᱛᱮ ᱚᱠᱛᱚ ᱛᱮ ᱟᱨᱫᱟᱥ ᱡᱚᱢᱟᱭ ᱢᱮ᱾`;
      }
      if (isBhili) {
        return `छात्रवृत्तिनी छेल्ली तारीखो:
${context.scholarships.map(s => `• **${getTranslatedTitle(s.title, lang)}**: ${s.deadline}`).join('\n')}

महेरबानी करीने वखत पर अरजी जमा करो।`;
      }
      if (isGondi) {
        return `छात्रवृत्ति अंतिम तारीख:
${context.scholarships.map(s => `• **${getTranslatedTitle(s.title, lang)}**: ${s.deadline}`).join('\n')}

वेळा मुन्ने दरखास्त जमा कीम।`;
      }
      if (isKurukh) {
        return `छात्रवृत्ति अंतिम बेड़ा:
${context.scholarships.map(s => `• **${getTranslatedTitle(s.title, lang)}**: ${s.deadline}`).join('\n')}

बेड़ा मुन्ने अरजी जमा ननके।`;
      }
      if (isHindi) {
        return `आगामी छात्रवृत्ति समय-सीमाएं:
${context.scholarships.map(s => `• **${getTranslatedTitle(s.title, lang)}**: ${s.deadline}`).join('\n')}

कृपया समय-सीमा से पूर्व अपने आवश्यक दस्तावेज़ संलग्न करके आवेदन जमा करें।`;
      }
      return `Upcoming scholarship deadlines:
${context.scholarships.map(s => `• **${s.title}**: ${s.deadline}`).join('\n')}

We recommend uploading your documents early to allow time for institutional verification.`;
    }

    // Default polite grounded response
    if (isSantali) {
      return `ᱡᱚᱦᱟᱨ ${context.studentName || ''}! ᱤᱧ ᱫᱚ JAGO, ᱟᱢᱟᱜ ᱥᱠᱳᱞᱟᱨᱥᱤᱯ ᱜᱚᱲᱚ ᱜᱟᱛᱮ᱾ ᱟᱢ ᱠᱩᱞᱤ ᱫᱟᱲᱮᱭᱟᱜ-ᱟᱢ:
• "ᱤᱧ ᱚᱠᱟ ᱥᱠᱳᱞᱟᱨᱥᱤᱯ ᱧᱟᱢ ᱫᱟᱲᱮᱭᱟᱜ-ᱟᱹᱧ?"
• "ᱤᱧᱟᱜ ᱟᱨᱫᱟᱥ ᱦᱟᱞᱚᱛ ᱪᱮᱫ ᱠᱟᱱᱟ?"
• "ᱚᱠᱟ ᱚᱠᱟ ᱠᱟᱜᱚᱡᱽ ᱠᱚ ᱞᱟᱹᱠᱛᱤᱜ-ᱟ?"`;
    }
    if (isBhili) {
      return `राम राम ${context.studentName || ''}! हुं JAGO छुं, तमारो छात्रवृत्ति मार्गदर्शक। तमने वधु माहिती माटे पूछो:
• "हुं कइ छात्रवृत्ति माटे पात्र छुं?"
• "म्हारी अरजीनी शु हालत छे?"
• "का का कागदिया जोईशे?"`;
    }
    if (isGondi) {
      return `सेवा जोहार ${context.studentName || ''}! नन्ना JAGO आंदोन, नावा छात्रवृत्ति सहायक। इव सवाल पूछना:
• "नन्ना बोत छात्रवृत्ति बर पात्र आंदोन?"
• "नावा दरखास्त हालत बत मंता?"
• "बोत कागद पाहि?"`;
    }
    if (isKurukh) {
      return `जय धरमे ${context.studentName || ''}! एन JAGO तलन, निंग्हय छात्रवृत्ति सहायक। नीम मेना:
• "एन एका छात्रवृत्ति पाइएगे लायक तलन?"
• "एंहय अरजी एका हालत नू रही?"
• "एका कागद चाही?"`;
    }
    if (isHindi) {
      return `नमस्ते ${context.studentName || ''}! मैं JAGO हूँ, आपका छात्रवृत्ति मार्गदर्शन सहायक।
मैं आपकी छात्रवृत्ति खोजने, पात्रता समझने, आवश्यक दस्तावेज़ जाँचने और आवेदन की स्थिति ट्रैक करने में सहायता कर सकता हूँ।

आप मुझसे पूछ सकते हैं:
• "मैं किन छात्रवृत्तियों के लिए पात्र हूँ?"
• "मेरे आवेदन की वर्तमान स्थिति क्या है?"
• "आवेदन के लिए कौन से दस्तावेज़ चाहिए?"`;
    }
    return `Hello ${context.studentName || ''}! I am JAGO, your dedicated scholarship guidance assistant.
I can help you discover available scholarships, verify eligibility criteria, check required documents, and track your application status.

Feel free to ask:
• "Which scholarships match my profile?"
• "What is the status of my application?"
• "What documents do I need to prepare?"`;
  },

  async handleChat(userId: string, userMessage: string, conversationId?: string, clientLang?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferredLanguage: true },
    });
    const lang = clientLang || (user?.preferredLanguage === 'HI' ? 'hi' : 'en');

    let conversation = conversationId
      ? await prisma.jagoConversation.findFirst({ where: { id: conversationId, userId } })
      : null;

    if (!conversation) {
      conversation = await prisma.jagoConversation.create({
        data: {
          userId,
          title: userMessage.slice(0, 40) + '...',
        },
      });
    }

    // Save user message
    await prisma.jagoMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: userMessage,
      },
    });

    // Gather grounded context
    const context = await this.getStudentData(userId);

    // Generate grounded response
    const reply = await this.generateResponse(userMessage, context, lang);

    // Save assistant message
    const assistantMessage = await prisma.jagoMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: reply,
      },
    });

    return {
      conversationId: conversation.id,
      reply,
      messageId: assistantMessage.id,
      language: lang,
    };
  },

  async getConversations(userId: string) {
    return prisma.jagoConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
        },
      },
    });
  },

  async getConversation(conversationId: string, userId: string) {
    return prisma.jagoConversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  },
};
