import { Language } from './i18n';

/**
 * Bilingual copy for the public-facing shell (navigation, hero, primary calls
 * to action and footer). Deep editorial pages stay in English by design, with
 * an explicit notice when Hindi is selected — see <LanguageNotice />.
 */
export const PUBLIC_COPY = {
  en: {
    nav: {
      home: 'Home',
      howItWorks: 'How It Works',
      about: 'About the Project',
      privacy: 'Privacy & Data Use',
      help: 'Help & Contact',
    },
    signIn: 'Sign in',
    createAccount: 'Create account',
    judgeDemo: 'Judge Demo',
    brandTagline: 'Verified work & wage records',
    heroBadge: 'Senior Division Innovation · Indore, MP',
    heroTitleA: 'Every shift recorded.',
    heroTitleB: 'Every wage explained.',
    heroTitleC: 'Every change traceable.',
    heroBody:
      'Shram Setu gives informal and construction workers an unalterable digital work record: a reusable QR pass with zero personal data, a transparent wage ledger, and a cryptographic audit chain both sides can verify.',
    ctaPrimary: 'Create your account',
    ctaSecondary: 'See how it works',
    trustNoResale: 'No data resale, ever',
    trustAnyPhone: 'Works on any phone',
    trustBilingual: 'Hindi + English',
    judgePrompt: 'Evaluating for Senior Bal Vigyan?',
    judgeLink: 'Launch the isolated judge demo',
    mobileEvaluation: 'Senior Bal Vigyan evaluation',
    mobileEvaluationHint: 'Tour a pre-loaded Indore dataset',
    launch: 'Launch',
    helpline: 'Helpline',
    footerTagline:
      'A tamper-evident digital work record for India’s informal workforce. One permanent QR pass, a transparent wage ledger, and a cryptographic audit trail that both workers and contractors can trust.',
    footerPlatform: 'Platform',
    footerTrust: 'Trust & legal',
    footerReach: 'Reach the team',
    footerWorkerHelpline: 'Worker helpline',
    footerWhatsApp: 'WhatsApp support',
    footerWhatsAppCta: 'Chat with a coordinator',
    footerJudge: 'Judge demo & audit bench',
    footerCreateAccount: 'Create an account',
    footerRecovery: 'Password recovery',
    footerBackToTop: 'Back to top',
    footerRights: 'All rights reserved',
    englishOnlyNotice:
      'This page is currently available in English. The worker and contractor portals are fully bilingual.',
    homeDeeperNotice:
      'The detailed sections below are in English. The worker and contractor portals are fully bilingual.',
    ctaTitleA: 'Your next shift deserves a',
    ctaTitleB: 'receipt',
    ctaBody:
      'Create a free account, print one QR pass, and let every day of work speak for itself. No specialised hardware, no bank integration, no cost to workers.',
    ctaCreate: 'Create free account',
    ctaSignIn: 'Sign in to your portal',
    ctaWhatsApp: 'Or talk to us on WhatsApp',
  },
  hi: {
    nav: {
      home: 'मुख्य पृष्ठ',
      howItWorks: 'यह कैसे काम करता है',
      about: 'परियोजना के बारे में',
      privacy: 'गोपनीयता एवं डेटा उपयोग',
      help: 'सहायता एवं संपर्क',
    },
    signIn: 'साइन इन',
    createAccount: 'खाता बनाएं',
    judgeDemo: 'जज डेमो',
    brandTagline: 'सत्यापित कार्य एवं मजदूरी रिकॉर्ड',
    heroBadge: 'वरिष्ठ संभाग नवाचार · इंदौर, मध्य प्रदेश',
    heroTitleA: 'हर पाली दर्ज।',
    heroTitleB: 'हर मजदूरी स्पष्ट।',
    heroTitleC: 'हर बदलाव का प्रमाण।',
    heroBody:
      'श्रम सेतु असंगठित एवं निर्माण श्रमिकों को एक अपरिवर्तनीय डिजिटल कार्य रिकॉर्ड देता है: बिना किसी निजी जानकारी वाला पुनः प्रयोग योग्य क्यूआर पास, पारदर्शी मजदूरी खाता, और दोनों पक्षों द्वारा सत्यापित क्रिप्टोग्राफिक ऑडिट श्रृंखला।',
    ctaPrimary: 'अपना खाता बनाएं',
    ctaSecondary: 'कार्यप्रणाली देखें',
    trustNoResale: 'डेटा कभी नहीं बेचा जाता',
    trustAnyPhone: 'किसी भी फोन पर चलता है',
    trustBilingual: 'हिंदी + अंग्रेज़ी',
    judgePrompt: 'वरिष्ठ बाल विज्ञान मूल्यांकन के लिए?',
    judgeLink: 'पृथक जज डेमो शुरू करें',
    mobileEvaluation: 'वरिष्ठ बाल विज्ञान मूल्यांकन',
    mobileEvaluationHint: 'इंदौर का तैयार डेटा देखें',
    launch: 'शुरू करें',
    helpline: 'हेल्पलाइन',
    footerTagline:
      'भारत के असंगठित श्रमबल के लिए छेड़छाड़-रहित डिजिटल कार्य रिकॉर्ड। एक स्थायी क्यूआर पास, पारदर्शी मजदूरी खाता, और ऐसा क्रिप्टोग्राफिक ऑडिट ट्रेल जिस पर श्रमिक और ठेकेदार दोनों भरोसा कर सकें।',
    footerPlatform: 'प्लेटफ़ॉर्म',
    footerTrust: 'भरोसा एवं कानूनी',
    footerReach: 'टीम से संपर्क',
    footerWorkerHelpline: 'श्रमिक हेल्पलाइन',
    footerWhatsApp: 'व्हाट्सएप सहायता',
    footerWhatsAppCta: 'समन्वयक से बात करें',
    footerJudge: 'जज डेमो एवं ऑडिट बेंच',
    footerCreateAccount: 'खाता बनाएं',
    footerRecovery: 'पासवर्ड रिकवरी',
    footerBackToTop: 'ऊपर जाएं',
    footerRights: 'सर्वाधिकार सुरक्षित',
    englishOnlyNotice:
      'यह पृष्ठ अभी अंग्रेज़ी में उपलब्ध है। श्रमिक एवं ठेकेदार पोर्टल पूर्णतः द्विभाषी हैं।',
    homeDeeperNotice:
      'नीचे के विस्तृत अनुभाग अंग्रेज़ी में हैं। श्रमिक एवं ठेकेदार पोर्टल पूर्णतः द्विभाषी हैं।',
    ctaTitleA: 'आपकी अगली पाली को चाहिए एक',
    ctaTitleB: 'रसीद',
    ctaBody:
      'निःशुल्क खाता बनाएं, एक क्यूआर पास प्रिंट करें, और हर दिन का काम स्वयं बोलने दें। न विशेष हार्डवेयर, न बैंक एकीकरण, और श्रमिकों के लिए कोई शुल्क नहीं।',
    ctaCreate: 'निःशुल्क खाता बनाएं',
    ctaSignIn: 'अपने पोर्टल में साइन इन करें',
    ctaWhatsApp: 'या व्हाट्सएप पर बात करें',
  },
} as const;

export type PublicCopy = (typeof PUBLIC_COPY)['en'];

export const getPublicCopy = (lang: Language): PublicCopy =>
  (lang === 'hi' ? PUBLIC_COPY.hi : PUBLIC_COPY.en) as PublicCopy;
