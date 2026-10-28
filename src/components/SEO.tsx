import { Helmet } from 'react-helmet';
import { PageSEOConfig } from '@/config/seoConfig';

interface SEOProps extends Partial<PageSEOConfig> {
  url?: string;
  canonical?: string;
}

export function SEO({
  title = 'Skill Directory - Connect with Top Educators & Learn New Skills',
  description = 'Skill Directory is a leading educational collaboration platform connecting students with expert educators. Find virtual classrooms, mentoring services, and online learning communities.',
  keywords = 'student-teacher platform, educational collaboration tools, online learning communities, teacher-student matching service, educational networking site',
  image = '/skilldirectory/og-image.png',
  url = 'https://skilldirectory.com',
  type = 'website',
  canonical = url
}: SEOProps) {
  const siteTitle = title.includes('Skill Directory') ? title : `${title} | Skill Directory`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO Meta Tags */}
      <link rel="canonical" href={canonical || url} />
      
      {/* Structured Data for better search indexing */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === 'profile' ? "Person" : "WebSite",
          "name": siteTitle,
          "description": description,
          "url": url
        })}
      </script>
    </Helmet>
  );
}
