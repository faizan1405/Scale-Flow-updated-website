/**
 * Structured Data (JSON-LD) Schemas for Scale Flow (https://joinscaleflow.in)
 * Optimized for Indian Startups, Small Businesses, and Local Search Signals.
 */

export const BASE_URL = "https://joinscaleflow.in";

export const AGENCY_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${BASE_URL}/#organization`,
  name: "Scale Flow",
  alternateName: ["Scale Flow Web Studio", "ScaleFlow India"],
  url: BASE_URL,
  logo: `${BASE_URL}/brand/scaleflow-social-card.png`,
  image: `${BASE_URL}/brand/scaleflow-social-card.png`,
  description:
    "Scale Flow is a leading web design and development studio in India. We craft high-performance, modern websites, 3D interactive experiences, and e-commerce stores for Indian startups and businesses.",
  telephone: "+919873721207",
  email: "contact@joinscaleflow.com",
  priceRange: "₹15,000 - ₹1,50,000+",
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, Credit Card, Bank Transfer, UPI, Net Banking",
  address: {
    "@type": "PostalAddress",
    streetAddress: "3rd Floor, 44, Regal Building, 69, Connaught Cir, Hanuman Road Area, Connaught Place",
    addressLocality: "New Delhi",
    addressRegion: "Delhi",
    postalCode: "110001",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 28.6315,
    longitude: 77.2167,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:30",
      closes: "20:00",
    },
  ],
  areaServed: [
    { "@type": "Country", name: "India" },
    { "@type": "City", name: "New Delhi" },
    { "@type": "City", name: "Delhi NCR" },
    { "@type": "City", name: "Mumbai" },
    { "@type": "City", name: "Bangalore" },
    { "@type": "City", name: "Hyderabad" },
    { "@type": "City", name: "Pune" },
    { "@type": "City", name: "Gurugram" },
    { "@type": "City", name: "Noida" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Web Development Services for Indian Businesses",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Basic Website Development",
          description: "A fast, clean digital presence for Indian small businesses and startups.",
        },
        price: "15000",
        priceCurrency: "INR",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Business Website Development",
          description: "Multi-page website engineered to generate high-intent customer inquiries via WhatsApp and forms.",
        },
        price: "30000",
        priceCurrency: "INR",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Premium Brand Website",
          description: "Art-directed bespoke design with smooth motion, CMS, and high-end brand perception.",
        },
        price: "45000",
        priceCurrency: "INR",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "E-Commerce Website Development",
          description: "Custom online storefronts with payment gateway integrations (Razorpay/Stripe), product catalog, and WhatsApp order flow.",
        },
        priceCurrency: "INR",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "3D Interactive Web Experiences",
          description: "Real-time 3D product showcases and scroll-driven interactive storytelling.",
        },
        priceCurrency: "INR",
      },
    ],
  },
  sameAs: [
    "https://joinscaleflow.in",
  ],
};

export const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  url: BASE_URL,
  name: "Scale Flow",
  alternateName: "Scale Flow Web Studio",
  publisher: {
    "@id": `${BASE_URL}/#organization`,
  },
  inLanguage: "en-IN",
};

export const CALCULATOR_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Scale Flow Website Cost Calculator India",
  url: `${BASE_URL}/build-your-website`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "All modern web browsers",
  browserRequirements: "Requires JavaScript",
  inLanguage: "en-IN",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
  description:
    "Interactive website cost calculator for Indian businesses, startups, and founders. Calculate transparent website design and development prices in INR (₹) in under 2 minutes.",
};

export function getBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path.startsWith("http") ? item.path : `${BASE_URL}${item.path}`,
    })),
  };
}

export function getFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export function getProjectSchema(project: {
  title: string;
  summary: string;
  slug: string;
  coverImage?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.title,
    description: project.summary,
    url: `${BASE_URL}/work/${project.slug}`,
    image: project.coverImage ? (project.coverImage.startsWith("http") ? project.coverImage : `${BASE_URL}${project.coverImage}`) : `${BASE_URL}/brand/scaleflow-social-card.png`,
    creator: {
      "@type": "Organization",
      name: "Scale Flow",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Scale Flow",
      url: BASE_URL,
    },
    inLanguage: "en-IN",
  };
}
