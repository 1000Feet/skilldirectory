/**
 * Dynamic SEO Script for Skill Directory
 * This script updates meta tags based on the current route
 */

(function() {
  // SEO configurations for different routes
  const seoConfigs = {
    // Home page (default)
    '/': {
      title: 'Skill Directory - Connect with Top Educators & Learn New Skills',
      description: 'Discover the best educational resources and connect with top-rated educators. Skill Directory brings students and teachers together in one collaborative platform.',
      keywords: 'skill directory, online learning, educational platform, find educators, student-teacher matching'
    },
    // Listings page
    '/listings': {
      title: 'Browse Educators - Find the Perfect Teacher for Your Needs',
      description: 'Explore our comprehensive directory of qualified educators, tutors, and mentors. Filter by category, rating, and availability to find your perfect match.',
      keywords: 'find educators, online tutors, educational listings, teacher directory, skill matching, learning mentors'
    },
    // About page
    '/about': {
      title: 'About Skill Directory - Our Mission and Vision',
      description: 'Learn about Skill Directory\'s mission to transform educational collaboration and make quality learning accessible to everyone. Meet our team and discover our story.',
      keywords: 'about skill directory, educational mission, learning platform history, online education vision, edtech platform'
    },
    // Pricing page
    '/pricing': {
      title: 'Membership Plans - Basic, Standard & Premium Options',
      description: 'Explore our flexible membership options with plans starting from free. Unlock premium features to enhance your educational experience.',
      keywords: 'skill directory pricing, educational membership plans, learning platform subscription, educator pricing, student plans'
    },
    // Support page
    '/support': {
      title: 'Customer Support - Get Help with Skill Directory',
      description: 'Need assistance? Our dedicated support team is here to help you navigate Skill Directory and resolve any issues you might encounter.',
      keywords: 'skill directory support, educational platform help, learning assistance, technical support, customer service education'
    },
    // Terms page
    '/terms': {
      title: 'Terms of Service - Rules and Guidelines',
      description: 'Read our terms of service to understand the rules and guidelines for using Skill Directory as a student or educator.',
      keywords: 'terms of service, user agreement, platform rules, educational guidelines, skill directory terms'
    },
    // Privacy Policy page
    '/privacy-policy': {
      title: 'Privacy Policy - How We Protect Your Data',
      description: 'Review our comprehensive privacy policy to understand how we collect, use, and protect your personal information on Skill Directory.',
      keywords: 'privacy policy, data protection, educational platform security, personal information handling, student data privacy'
    },
    // 404 Not Found page
    '/404': {
      title: 'Page Not Found - Skill Directory',
      description: 'The page you\'re looking for doesn\'t exist. Navigate back to our homepage to find the educational resources you need.',
      keywords: 'page not found, 404 error, missing page, navigation error'
    }
  };

  // Function to update meta tags
  function updateMetaTags() {
    // Get current path and remove base URL if present
    let path = window.location.pathname;
    const baseTag = document.querySelector('base');
    const baseUrl = baseTag ? baseTag.getAttribute('href') : '/';
    
    if (baseUrl !== '/' && path.startsWith(baseUrl)) {
      path = path.slice(baseUrl.length - 1);
    }
    
    // Find the matching SEO config or use default
    const config = seoConfigs[path] || seoConfigs['/'];
    
    // Update title
    document.title = config.title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', config.description);
    }
    
    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', config.keywords);
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    
    if (ogTitle) ogTitle.setAttribute('content', config.title);
    if (ogDescription) ogDescription.setAttribute('content', config.description);
    if (ogUrl) ogUrl.setAttribute('content', 'https://skilldirectory.com' + path);
    
    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    const twitterUrl = document.querySelector('meta[name="twitter:url"]');
    
    if (twitterTitle) twitterTitle.setAttribute('content', config.title);
    if (twitterDescription) twitterDescription.setAttribute('content', config.description);
    if (twitterUrl) twitterUrl.setAttribute('content', 'https://skilldirectory.com' + path);
    
    // Update canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', 'https://skilldirectory.com' + path);
    }
  }

  // Run on page load
  updateMetaTags();
  
  // Listen for route changes (for single-page applications)
  let lastPath = window.location.pathname;
  
  // Check for route changes every 300ms
  setInterval(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      updateMetaTags();
    }
  }, 300);
})();
