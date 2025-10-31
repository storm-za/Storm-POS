// SEO helper functions to update page meta tags dynamically

export function updatePageSEO(params: {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
}) {
  const { title, description, ogImage, canonical } = params;
  
  // Update document title
  document.title = title;
  
  // Update meta description
  updateMetaTag('name', 'description', description);
  
  // Update Open Graph tags
  updateMetaTag('property', 'og:title', title);
  updateMetaTag('property', 'og:description', description);
  if (ogImage) {
    updateMetaTag('property', 'og:image', ogImage);
  }
  
  // Update Twitter Card tags
  updateMetaTag('name', 'twitter:title', title);
  updateMetaTag('name', 'twitter:description', description);
  if (ogImage) {
    updateMetaTag('name', 'twitter:image', ogImage);
  }
  
  // Update canonical URL
  if (canonical) {
    updateCanonicalURL(canonical);
  }
}

function updateMetaTag(attribute: string, attributeValue: string, content: string) {
  let tag = document.querySelector(`meta[${attribute}="${attributeValue}"]`);
  
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, attributeValue);
    document.head.appendChild(tag);
  }
  
  tag.setAttribute('content', content);
}

function updateCanonicalURL(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  
  link.href = url;
}
