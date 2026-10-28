import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbsProps {
  customItems?: Array<{
    label: string;
    path: string;
  }>;
}

export function Breadcrumbs({ customItems }: BreadcrumbsProps) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Generate breadcrumb items
  const breadcrumbItems = customItems || pathnames.map((value, index) => {
    const path = `/${pathnames.slice(0, index + 1).join('/')}`;
    const label = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
    return { label, path };
  });

  // Generate JSON-LD schema for breadcrumbs
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://skilldirectory.com'
      },
      ...breadcrumbItems.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        item: `https://skilldirectory.com${item.path}`
      }))
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      
      <nav aria-label="Breadcrumb" className="py-3 px-4 bg-gray-50">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link to="/" className="text-gray-600 hover:text-primary">
              Home
            </Link>
          </li>
          
          {breadcrumbItems.map((item, index) => (
            <li key={item.path} className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              {index === breadcrumbItems.length - 1 ? (
                <span className="text-primary" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.path} className="text-gray-600 hover:text-primary">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
