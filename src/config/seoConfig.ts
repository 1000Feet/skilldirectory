/**
 * SEO Configuration for all pages in the Skill Directory platform
 * This file contains specific SEO metadata for each route
 */

export interface PageSEOConfig {
  title: string;
  description: string;
  keywords: string;
  type?: string;
  image?: string;
}

// Define site-wide default values
const defaultConfig: PageSEOConfig = {
  title: 'Skill Directory - Connect with Top Educators & Learn New Skills',
  description: 'Skill Directory is a leading educational collaboration platform connecting students with expert educators. Find virtual classrooms, mentoring services, and online learning communities.',
  keywords: 'student-teacher platform, educational collaboration tools, online learning communities, teacher-student matching service, educational networking site',
  type: 'website',
  image: '/skilldirectory/og-image.png'
};

// Define page-specific SEO configurations
export const seoConfig: Record<string, PageSEOConfig> = {
  // Home page
  home: {
    ...defaultConfig,
    title: 'Skill Directory - Connect with Top Educators & Learn New Skills',
    description: 'Discover the best educational resources and connect with top-rated educators. Skill Directory brings students and teachers together in one collaborative platform.',
    keywords: 'skill directory, online learning, educational platform, find educators, student-teacher matching',
  },

  // Listings page
  listings: {
    ...defaultConfig,
    title: 'Browse Educators - Find the Perfect Teacher for Your Needs',
    description: 'Explore our comprehensive directory of qualified educators, tutors, and mentors. Filter by category, rating, and availability to find your perfect match.',
    keywords: 'find educators, online tutors, educational listings, teacher directory, skill matching, learning mentors',
  },

  // About page
  about: {
    ...defaultConfig,
    title: 'About Skill Directory - Our Mission and Vision',
    description: 'Learn about Skill Directory\'s mission to transform educational collaboration and make quality learning accessible to everyone. Meet our team and discover our story.',
    keywords: 'about skill directory, educational mission, learning platform history, online education vision, edtech platform',
  },

  // Pricing page
  pricing: {
    ...defaultConfig,
    title: 'Membership Plans - Basic, Standard & Premium Options',
    description: 'Explore our flexible membership options with plans starting from free. Unlock premium features to enhance your educational experience.',
    keywords: 'skill directory pricing, educational membership plans, learning platform subscription, educator pricing, student plans',
  },

  // Support page
  support: {
    ...defaultConfig,
    title: 'Customer Support - Get Help with Skill Directory',
    description: 'Need assistance? Our dedicated support team is here to help you navigate Skill Directory and resolve any issues you might encounter.',
    keywords: 'skill directory support, educational platform help, learning assistance, technical support, customer service education',
  },

  // Privacy Policy page
  privacyPolicy: {
    ...defaultConfig,
    title: 'Privacy Policy - How We Protect Your Data',
    description: 'Review our comprehensive privacy policy to understand how we collect, use, and protect your personal information on Skill Directory.',
    keywords: 'privacy policy, data protection, educational platform security, personal information handling, student data privacy',
  },

  // Terms page
  terms: {
    ...defaultConfig,
    title: 'Terms of Service - Rules and Guidelines',
    description: 'Read our terms of service to understand the rules and guidelines for using Skill Directory as a student or educator.',
    keywords: 'terms of service, user agreement, platform rules, educational guidelines, skill directory terms',
  },

  // Educator Dashboard
  educatorDashboard: {
    ...defaultConfig,
    title: 'Educator Dashboard - Manage Your Teaching Profile',
    description: 'Access your educator dashboard to manage your profile, respond to student inquiries, and track your performance metrics.',
    keywords: 'educator dashboard, teaching profile management, online teaching tools, educator analytics, student management',
  },

  // Student Dashboard
  studentDashboard: {
    ...defaultConfig,
    title: 'Student Dashboard - Track Your Learning Journey',
    description: 'Access your personalized student dashboard to track your learning journey, manage educator connections, and discover new learning opportunities.',
    keywords: 'student dashboard, learning management, education tracking, skill development, student profile',
  },

  // Generic educator profile page (specific educator data should be injected)
  educatorProfile: {
    ...defaultConfig,
    title: 'Educator Profile | Skill Directory',
    description: 'Learn more about this educator\'s background, teaching methods, and available services. Connect directly to start your learning journey.',
    keywords: 'educator profile, teacher biography, learning services, educational skills, professional tutor',
    type: 'profile',
  },

  // Payment page
  payment: {
    ...defaultConfig,
    title: 'Secure Payment - Upgrade Your Membership',
    description: 'Complete your secure payment to upgrade your Skill Directory membership and unlock premium features.',
    keywords: 'secure payment, membership upgrade, subscription processing, educational platform payment, billing',
  },

  // 404 Not Found page
  notFound: {
    ...defaultConfig,
    title: 'Page Not Found - Skill Directory',
    description: 'The page you\'re looking for doesn\'t exist. Navigate back to our homepage to find the educational resources you need.',
    keywords: 'page not found, 404 error, missing page, navigation error',
  },
};

/**
 * Get SEO config for a specific page
 * @param page The page key to get SEO config for
 * @param customData Optional custom data to override default values (useful for dynamic pages)
 * @returns The SEO configuration for the specified page
 */
export const getPageSEO = (page: string, customData?: Partial<PageSEOConfig>): PageSEOConfig => {
  const pageConfig = seoConfig[page] || defaultConfig;
  
  if (customData) {
    return {
      ...pageConfig,
      ...customData,
    };
  }
  
  return pageConfig;
};
