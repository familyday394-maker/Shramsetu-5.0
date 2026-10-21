/**
 * Centralized application configuration for Shram Setu 2.0
 * Preserves consistent project contact details, helpline numbers, and legal references.
 */

export const APP_CONFIG = {
  PROJECT_NAME: 'Shram Setu 2.0',
  PROJECT_NAME_HI: 'श्रम सेतु 2.0',
  VERSION: '2.0.0',
  
  // Project Designated Contact Phone Number (Updated as per requirement)
  CONTACT_PHONE: '7909348017',
  CONTACT_PHONE_DISPLAY: '+91 79093 48017',
  
  // WhatsApp International Format for India (91 + 10-digit number)
  WHATSAPP_NUMBER: '917909348017',
  WHATSAPP_LINK: 'https://wa.me/917909348017',

  // Project Support and Civic Lab details
  SUPPORT_EMAIL: 'support@shramsetu.in',
  LAB_LOCATION: 'Indore, Madhya Pradesh',
  INNOVATION_EVENT: 'Senior Bal Vigyan Gold Innovation Exhibit, Indore (MP)',

  // Government & Legal authorities
  DLO_OFFICE_NAME_EN: 'Office of the District Labour Officer, Indore Division, MP',
  DLO_OFFICE_NAME_HI: 'कार्यालय जिला श्रम पदाधिकारी, इंदौर संभाग, मध्य प्रदेश',
  DLO_ADDRESS: 'Labour Welfare Complex, Sanyogitaganj, Indore, Madhya Pradesh 452001',
  
  // Statutory Minimum Wage rates in Madhya Pradesh (Ref: Labour Commissioner MP Gazette 2024-2026)
  MIN_WAGE_RATES: {
    unskilled: 412,
    semi_skilled: 465,
    skilled: 530,
    highly_skilled: 620,
  },
} as const;
