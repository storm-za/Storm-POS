import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import App from "./App";

const BASE_URL = "https://stormsoftware.co.za";
const LOGO_URL = `${BASE_URL}/storm-logo.png`;

interface PageMeta {
  title: string;
  description: string;
  canonical: string;
}

interface BlogPostMeta {
  title: string;
  description: string;
  date: string;
  image: string;
}

const staticPageMeta: Record<string, PageMeta> = {
  "/": {
    title: "Storm - Smart Software. Built for Growth.",
    description:
      "Professional websites and software solutions for South African businesses. Monthly packages starting from R799. Get a stunning website or powerful POS system today.",
    canonical: `${BASE_URL}/`,
  },
  "/pos": {
    title:
      "Storm POS - Cloud Point of Sale System | Starter R299, Growth R599, Scale R999 | 7-Day Free Trial",
    description:
      "The smartest POS system for South African retailers. Flat-rate plans from R299/month — no percentage cuts, no surprises. Starter, Growth & Scale. Try free for 7 days.",
    canonical: `${BASE_URL}/pos`,
  },
  "/web-development": {
    title: "Professional Web Development - Storm | Monthly Packages from R799",
    description:
      "Get a professional website for your South African business with monthly packages starting at R799. Custom design, mobile-optimized, SEO-ready. No large upfront costs.",
    canonical: `${BASE_URL}/web-development`,
  },
  "/blog": {
    title: "Blog - Storm Software | Tech Insights for SA Businesses",
    description:
      "Expert insights on POS systems, web development, and digital transformation for South African businesses. Stay ahead with Storm Software.",
    canonical: `${BASE_URL}/blog`,
  },
};

const blogPostMeta: Record<string, BlogPostMeta> = {
  "why-south-african-retailers-switching-cloud-pos": {
    title: "Why South African Retailers Are Switching to Cloud POS in 2025",
    description: "Discover why SA retailers are moving to cloud POS systems. Load shedding resilience, cost savings, and real-time insights driving the shift.",
    date: "December 15, 2025",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop",
  },
  "real-cost-not-having-website-2025": {
    title: "The Real Cost of Not Having a Website in 2025",
    description: "What's your business losing without a website? We break down the hidden costs SA businesses face without an online presence in 2025.",
    date: "December 12, 2025",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop",
  },
  "how-choose-right-pos-system-business": {
    title: "How to Choose the Right POS System for Your Business",
    description: "A no-nonsense guide to selecting a POS system for South African businesses. From offline mode to payment integrations-what actually matters.",
    date: "December 8, 2025",
    image: "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=1200&h=600&fit=crop",
  },
  "best-pos-system-small-business-south-africa": {
    title: "Best POS System for Small Business in South Africa (2025 Guide)",
    description: "Looking for the best POS system for your small business in South Africa? Compare features, pricing, and SA-specific factors to find the right fit in 2025.",
    date: "January 5, 2026",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
  },
  "free-pos-system-south-africa": {
    title: "Is There a Free POS System in South Africa? What You Need to Know",
    description: "Searching for a free POS system in South Africa? Understand what 'free' really means, what the hidden costs are, and which options offer the best value for SA businesses.",
    date: "January 8, 2026",
    image: "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&h=400&fit=crop",
  },
  "cloud-pos-vs-traditional-pos-south-africa": {
    title: "Cloud POS vs Traditional POS: What SA Retailers Need to Know in 2025",
    description: "Should your South African business use a cloud POS or a traditional POS system? Compare costs, load shedding resilience, features, and real-world performance in 2025.",
    date: "January 10, 2026",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop",
  },
  "afrikaanse-verkoopstelsel-pos-stelsel": {
    title: "Beste Afrikaanse Verkoopstelsel vir Suid-Afrikaanse Besighede",
    description: "Op soek na 'n verkoopstelsel in Afrikaans? Storm POS is die enigste wolkgebaseerde verkoopstelsel met volle Afrikaanse ondersteuning vir Suid-Afrikaanse kleinsakke.",
    date: "January 12, 2026",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
  },
  "inventory-management-small-business-south-africa": {
    title: "Inventory Management for South African Small Businesses: A Complete Guide",
    description: "Learn how to manage inventory effectively as a South African small business owner. Practical techniques, tools, and strategies to reduce stock loss and improve cash flow.",
    date: "January 15, 2026",
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=400&fit=crop",
  },
  "website-koste-suid-afrika-2025": {
    title: "How Much Does a Website Cost in South Africa? (2025 Pricing Guide)",
    description: "Wondering how much a website costs in South Africa in 2025? Get a clear, honest breakdown of website pricing - from R799/month packages to R50,000 custom builds.",
    date: "January 18, 2026",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
  },
  "load-shedding-pos-system-south-africa": {
    title: "Load Shedding Proof POS: How SA Retailers Stay Open During Outages",
    description: "Load shedding doesn't have to close your business. Learn how South African retailers use cloud POS systems, power banks, and mobile data to keep trading through any outage.",
    date: "January 20, 2026",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop",
  },
  "invoicing-software-south-africa": {
    title: "Best Invoicing Software for South African Small Businesses (Free & Paid)",
    description: "Compare the best invoicing software for South African small businesses in 2025. Find affordable options with Rand pricing, VAT support, and professional PDF invoices.",
    date: "January 22, 2026",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=400&fit=crop",
  },
};

function getPageMeta(urlPath: string): PageMeta {
  if (staticPageMeta[urlPath]) return staticPageMeta[urlPath];

  const blogMatch = urlPath.match(/^\/blog\/(.+)$/);
  if (blogMatch) {
    const slug = blogMatch[1];
    const post = blogPostMeta[slug];
    if (post) {
      return {
        title: post.title + " | Storm Blog",
        description: post.description,
        canonical: `${BASE_URL}/blog/${slug}`,
      };
    }
  }

  return staticPageMeta["/"];
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function jsonLdScript(data: object): string {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function buildStructuredData(urlPath: string): string {
  const blogMatch = urlPath.match(/^\/blog\/(.+)$/);

  if (urlPath === "/") {
    return [
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "How much does Storm POS cost?", "acceptedAnswer": { "@type": "Answer", "text": "Storm POS has no monthly fees or setup costs. You only pay 0.5% per sale plus R0.50 per invoice generated. You only pay when you make money." } },
          { "@type": "Question", "name": "Does Storm POS work in Afrikaans?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, Storm POS has full Afrikaans language support. You can switch between English and Afrikaans at any time." } },
          { "@type": "Question", "name": "Is there a free trial for Storm POS?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, Storm POS offers a 7-day free trial with full access to all features. No credit card required to get started." } },
          { "@type": "Question", "name": "How much does a website cost in South Africa?", "acceptedAnswer": { "@type": "Answer", "text": "Storm offers professional website packages starting from R799 per month. This includes custom design, mobile optimization, hosting, and SEO setup - with no large upfront cost." } },
          { "@type": "Question", "name": "Does Storm Software serve South African businesses only?", "acceptedAnswer": { "@type": "Answer", "text": "Storm Software is based in South Africa and is specifically built for SA businesses, with Rand pricing, Afrikaans support, and an understanding of local market conditions like load shedding." } }
        ]
      }),
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` }
        ]
      })
    ].join("\n    ");
  }

  if (urlPath === "/pos") {
    return [
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Storm POS", "item": `${BASE_URL}/pos` }
        ]
      }),
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "How much does Storm POS cost?", "acceptedAnswer": { "@type": "Answer", "text": "Storm POS offers three flat-rate plans: Starter (R299/month, 50 invoices included), Growth (R599/month, 200 invoices included, R0.50 per extra), and Scale (R999/month, unlimited invoices, multi-location, dedicated priority support). All plans include a 7-day free trial with no setup fees." } },
          { "@type": "Question", "name": "Is there a free trial for Storm POS?", "acceptedAnswer": { "@type": "Answer", "text": "Yes! Storm POS offers a 7-day free trial with full access to all features. No credit card required to start." } },
          { "@type": "Question", "name": "Does Storm POS work offline?", "acceptedAnswer": { "@type": "Answer", "text": "Storm POS is a cloud-based system that works on any device with an internet connection. It automatically syncs your data across all your devices in real-time." } },
          { "@type": "Question", "name": "Can I use Storm POS in Afrikaans?", "acceptedAnswer": { "@type": "Answer", "text": "Yes! Storm POS offers full Afrikaans language support. You can switch between English and Afrikaans at any time in your settings." } },
          { "@type": "Question", "name": "What devices can I use with Storm POS?", "acceptedAnswer": { "@type": "Answer", "text": "Storm POS works on any device with a web browser - tablets, smartphones, laptops, or desktop computers. No special hardware required." } },
          { "@type": "Question", "name": "Can Storm POS generate invoices and quotes?", "acceptedAnswer": { "@type": "Answer", "text": "Yes! Storm POS includes a full invoicing and quoting system. Generate professional PDF invoices and quotes with your business branding, then email them directly to customers." } }
        ]
      }),
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Storm POS",
        "description": "Cloud-based Point of Sale system for South African retailers. Real-time sales tracking, inventory management, invoicing, and comprehensive analytics.",
        "brand": { "@type": "Brand", "name": "Storm Software" },
        "offers": { "@type": "AggregateOffer", "priceCurrency": "ZAR", "lowPrice": "299", "highPrice": "999", "priceValidUntil": "2027-12-31", "availability": "https://schema.org/InStock", "description": "Starter: R299/month (50 invoices included). Growth: R599/month (200 invoices included, R0.50 extra). Scale: R999/month (unlimited invoices, multi-location). 7-day free trial." },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "127", "bestRating": "5", "worstRating": "1" }
      })
    ].join("\n    ");
  }

  if (urlPath === "/web-development") {
    return [
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": "Web Development",
        "provider": {
          "@type": "Organization",
          "name": "Storm",
          "url": BASE_URL,
          "areaServed": "ZA",
          "address": { "@type": "PostalAddress", "addressCountry": "ZA" }
        },
        "offers": [
          { "@type": "Offer", "name": "Starter Package", "price": "799", "priceCurrency": "ZAR", "priceSpecification": { "@type": "UnitPriceSpecification", "price": "799", "priceCurrency": "ZAR", "unitText": "MONTH" } },
          { "@type": "Offer", "name": "Growth Package", "price": "1499", "priceCurrency": "ZAR", "priceSpecification": { "@type": "UnitPriceSpecification", "price": "1499", "priceCurrency": "ZAR", "unitText": "MONTH" } },
          { "@type": "Offer", "name": "Pro Package", "price": "2499", "priceCurrency": "ZAR", "priceSpecification": { "@type": "UnitPriceSpecification", "price": "2499", "priceCurrency": "ZAR", "unitText": "MONTH" } }
        ]
      }),
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Storm",
        "description": "Professional web development and software solutions for South African businesses",
        "url": BASE_URL,
        "priceRange": "R799-R2499",
        "areaServed": { "@type": "Country", "name": "South Africa" },
        "address": { "@type": "PostalAddress", "addressCountry": "ZA" },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Web Development Services",
          "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Starter Website Package", "description": "5-page responsive website with mobile optimization and basic SEO" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Growth Website Package", "description": "10-page responsive website with e-commerce and advanced SEO" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Pro Website Package", "description": "Unlimited pages with advanced integrations and dedicated support" } }
          ]
        }
      }),
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "How much does a website cost in South Africa?", "acceptedAnswer": { "@type": "Answer", "text": "Storm's professional website packages start from R799 per month. This includes custom design, mobile optimization, hosting, SSL certificate, and SEO setup. There is no large upfront cost." } },
          { "@type": "Question", "name": "Do I own my website?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, you own your website and all its content. Storm builds and hosts it on your behalf, but you retain full ownership of your domain and content." } },
          { "@type": "Question", "name": "How long does it take to build a website?", "acceptedAnswer": { "@type": "Answer", "text": "Most websites are completed within 2 to 4 weeks, depending on the package and how quickly you provide your content. We follow a clear 4-step process: Discovery, Design, Development, and Launch." } },
          { "@type": "Question", "name": "Is SEO included in the website packages?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, all Storm website packages include basic SEO setup - including meta tags, Google Search Console submission, sitemap generation, and mobile-first optimization to help your site rank on Google." } },
          { "@type": "Question", "name": "What happens if I want to cancel?", "acceptedAnswer": { "@type": "Answer", "text": "You can cancel your package at any time. Storm has no lock-in contracts. Simply give 30 days notice and we will handle the transition." } }
        ]
      }),
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
          { "@type": "ListItem", "position": 2, "name": "Web Development", "item": `${BASE_URL}/web-development` }
        ]
      })
    ].join("\n    ");
  }

  if (urlPath === "/blog") {
    return jsonLdScript({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${BASE_URL}/blog` }
      ]
    });
  }

  if (blogMatch) {
    const slug = blogMatch[1];
    const post = blogPostMeta[slug];
    if (post) {
      const canonicalUrl = `${BASE_URL}/blog/${slug}`;
      return [
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": post.title,
          "description": post.description,
          "image": post.image,
          "datePublished": post.date,
          "dateModified": post.date,
          "author": { "@type": "Organization", "name": "Storm Software", "url": BASE_URL },
          "publisher": { "@type": "Organization", "name": "Storm Software", "logo": { "@type": "ImageObject", "url": LOGO_URL } },
          "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
          "url": canonicalUrl
        }),
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${BASE_URL}/blog` },
            { "@type": "ListItem", "position": 3, "name": post.title, "item": canonicalUrl }
          ]
        })
      ].join("\n    ");
    }
  }

  return "";
}

function buildHeadHtml(urlPath: string): string {
  const meta = getPageMeta(urlPath);
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const canonical = escapeHtml(meta.canonical);

  const structuredData = buildStructuredData(urlPath);

  return `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="${LOGO_URL}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${LOGO_URL}" />
    <meta name="twitter:card" content="summary_large_image" />
    ${structuredData}`;
}

function createStaticLocationHook(path: string) {
  return function useStaticLocation(): [string, (to: string) => void] {
    return [path, () => {}];
  };
}

export function render(urlPath: string): { html: string; headHtml: string } {
  const hook = createStaticLocationHook(urlPath);

  let html = "";
  try {
    html = renderToString(
      <Router hook={hook}>
        <App />
      </Router>
    );
  } catch (err) {
    console.error("[SSR] renderToString error:", err);
    html = "";
  }

  const headHtml = buildHeadHtml(urlPath);
  return { html, headHtml };
}
