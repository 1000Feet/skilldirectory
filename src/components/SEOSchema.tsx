interface SEOSchemaProps {
  type: 'Organization' | 'Website' | 'EducationalOrganization' | 'Course' | 'ProfessionalService';
  name?: string;
  description?: string;
  url?: string;
  image?: string;
  additionalData?: Record<string, any>;
}

export function SEOSchema({ type, name, description, url, image, additionalData }: SEOSchemaProps) {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': type,
    name: name || 'Skill Directory',
    description: description || 'Find and connect with expert educators, tutors, and instructors. Learn new skills, advance your career, or explore your passions with qualified professionals.',
    url: url || 'https://skilldirectory.com',
    image: image || 'https://skilldirectory.com/og-image.jpg',
  };

  const organizationSchema = {
    ...baseSchema,
    '@type': 'Organization',
    legalName: 'Woodshed Schoolhouse LLC',
    foundingDate: '2024',
    founders: [{
      '@type': 'Person',
      name: 'Skill Directory Team'
    }],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Wisconsin',
      addressCountry: 'US'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'info@skilldirectory.com'
    },
    sameAs: [
      'https://twitter.com/skilldirectory',
      'https://facebook.com/skilldirectory',
      'https://linkedin.com/company/skilldirectory'
    ]
  };

  const websiteSchema = {
    ...baseSchema,
    '@type': 'WebSite',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://skilldirectory.com/listings?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };

  const educationalOrgSchema = {
    ...baseSchema,
    '@type': 'EducationalOrganization',
    educationalLevel: 'all',
    teaches: [
      'Professional Development',
      'Skill Enhancement',
      'Career Advancement',
      'Personal Growth'
    ]
  };

  const courseSchema = {
    ...baseSchema,
    '@type': 'Course',
    provider: {
      '@type': 'Organization',
      name: 'Skill Directory',
      sameAs: 'https://skilldirectory.com'
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD'
    }
  };

  const professionalServiceSchema = {
    ...baseSchema,
    '@type': 'ProfessionalService',
    serviceType: 'Education and Training',
    areaServed: {
      '@type': 'Country',
      name: 'United States'
    },
    availableLanguage: ['English'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Educational Services'
    }
  };

  const schemaMap = {
    Organization: organizationSchema,
    Website: websiteSchema,
    EducationalOrganization: educationalOrgSchema,
    Course: courseSchema,
    ProfessionalService: professionalServiceSchema
  };

  const finalSchema = {
    ...schemaMap[type],
    ...additionalData
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(finalSchema)
      }}
    />
  );
}
