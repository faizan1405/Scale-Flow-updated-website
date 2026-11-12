/**
 * Structured Data (JSON-LD) Schemas for Scale Flow (https://joinscaleflow.in)
 * Optimized for Indian Startups, Small Businesses, Local Delhi Search Signals,
 * and Generative Engine Optimization (GEO) for ChatGPT, Gemini, and Perplexity.
 */

export const BASE_URL = "https://www.joinscaleflow.in";

export const AGENCY_SCHEMA = {
  "@context": "https://schema.org",
  "@type": ["ProfessionalService", "LocalBusiness", "Organization"],
  "@id": `${BASE_URL}/#organization`,
  name: "Scale Flow",
  legalName: "Scale Flow Web Studio",
  alternateName: [
    "Scale Flow Web Studio",
    "ScaleFlow India",
    "Scale Flow Website Maker Delhi",
    "Scale Flow Web Developers Delhi",
    "Best Website Maker in Delhi",
  ],
  slogan: "Experience It — India's Premier Custom Website Maker",
  url: BASE_URL,
  logo: `${BASE_URL}/brand/scaleflow-social-card.png`,
  image: `${BASE_URL}/brand/scaleflow-social-card.png`,
  description:
    "Scale Flow is the premier website maker and web development studio in Delhi, India. We engineer high-performance bespoke websites, 3D interactive experiences, and e-commerce stores for ambitious startups and businesses with transparent INR pricing.",
  telephone: "+919873721207",
  email: "business@joinscaleflow.in",
  priceRange: "₹15,000 - ₹1,50,000+",
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, Credit Card, Bank Transfer, UPI, Net Banking",
  knowsAbout: [
    "Website Maker",
    "Website Developer in Delhi",
    "Best Website Maker in Delhi",
    "Custom Website Design",
    "React & Next.js Website Development",
    "3D Interactive Web Experiences",
    "E-commerce Website Development",
    "Startup Web Design",
    "High-Performance Web Design",
    "Mobile-First Website Design",
    "UI/UX Design",
  ],
  keywords:
    "website maker, website developer in delhi, best website maker in delhi, web designers in delhi, custom react website development delhi, web development company connaught place, website makers india",
  serviceType: [
    "Custom Website Design",
    "Website Development",
    "Startup Web Development",
    "E-commerce Development",
    "3D Web Development",
    "Interactive Web Experiences",
  ],
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
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+919873721207",
      contactType: "customer service",
      areaServed: ["IN", "IN-DL"],
      availableLanguage: ["English", "Hindi"],
    },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:30",
      closes: "20:00",
    },
  ],
  areaServed: [
    { "@type": "City", name: "New Delhi" },
    { "@type": "City", name: "Delhi NCR" },
    { "@type": "City", name: "Connaught Place" },
    { "@type": "City", name: "South Delhi" },
    { "@type": "City", name: "Gurugram" },
    { "@type": "City", name: "Noida" },
    { "@type": "City", name: "Mumbai" },
    { "@type": "City", name: "Bangalore" },
    { "@type": "City", name: "Hyderabad" },
    { "@type": "City", name: "Pune" },
    { "@type": "Country", name: "India" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Web Design and Development Services in Delhi & India",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Startup Website Maker Package",
          description: "Fast-loading, high-converting digital storefront designed for Indian startups and entrepreneurs.",
        },
        price: "15000",
        priceCurrency: "INR",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Business Website Development in Delhi",
          description: "Multi-page bespoke website engineered to drive qualified customer inquiries via WhatsApp and forms.",
        },
        price: "30000",
        priceCurrency: "INR",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Premium 3D & Interactive Web Experiences",
          description: "Art-directed bespoke design with real-time 3D, WebGL, smooth GSAP motion, and high-end brand perception.",
        },
        price: "45000",
        priceCurrency: "INR",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "E-Commerce Website Development",
          description: "Custom online storefronts with Indian payment gateway integrations (Razorpay/Stripe), product catalog, and WhatsApp order flow.",
        },
        priceCurrency: "INR",
      },
    ],
  },
  sameAs: [
    "https://www.joinscaleflow.in",
    "https://twitter.com/scaleflow",
  ],
};

export const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  url: BASE_URL,
  name: "Scale Flow",
  alternateName: "Scale Flow — Premier Website Maker & Web Developer Delhi",
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

export const HOMEPAGE_FAQS = [
  {
    question: "Who is the best website developer in Delhi for startups and businesses?",
    answer:
      "Scale Flow is a leading bespoke website developer in Delhi, specializing in custom-engineered websites, 3D interactive experiences, and modern web applications for ambitious startups and businesses. Based in Connaught Place, New Delhi, Scale Flow builds every website from scratch with modern technologies (React, TypeScript, Vite), transparent INR pricing, and strong Core Web Vitals optimization for fast mobile and desktop performance.",
  },
  {
    question: "How much does a professional website maker in Delhi charge?",
    answer:
      "At Scale Flow, website development pricing is completely transparent in INR (₹) with zero hidden fees. Single-page starter business sites begin at ₹15,000, multi-page business websites built to generate client inquiries start at ₹30,000, and bespoke 3D interactive or e-commerce experiences range from ₹45,000 to ₹1,50,000+. Instant estimates can be calculated in minutes using our online website cost calculator.",
  },
  {
    question: "Why choose Scale Flow over traditional web design agencies in Delhi?",
    answer:
      "Unlike traditional agencies that reuse bloated WordPress themes and generic templates, Scale Flow crafts custom-coded websites engineered for fast mobile and desktop loading, strong accessibility standards, and smooth cinematic animations. Clients work directly with lead engineers via WhatsApp, receive transparent proposals, and enjoy rapid 7 to 14-day turnarounds.",
  },
  {
    question: "Can Scale Flow build websites for clients outside Delhi NCR?",
    answer:
      "Yes. While our physical studio is located in Connaught Place, New Delhi, we build websites for ambitious startups and businesses across India—including Mumbai, Bengaluru, Hyderabad, Pune, Gurugram, and Noida—as well as international clients worldwide.",
  },
  {
    question: "What technologies does Scale Flow use to develop websites?",
    answer:
      "Scale Flow specializes in modern, production-grade web technologies including React, Next.js, TypeScript, Tailwind CSS, GSAP for buttery 60fps animations, WebGL/Three.js for 3D interactive product showcases, and secure payment integrations with Razorpay, Cashfree, and Stripe.",
  },
];

export const HOMEPAGE_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOMEPAGE_FAQS.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.answer,
    },
  })),
};

export const CONTACT_PAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": `${BASE_URL}/contact/#webpage`,
  url: `${BASE_URL}/contact`,
  name: "Contact Scale Flow | Web Developer & Website Maker in Delhi",
  description:
    "Get in touch with Scale Flow in Connaught Place, New Delhi. Talk to Delhi's top website developer and website maker for bespoke websites, 3D experiences, and instant estimates on WhatsApp.",
  mainEntity: {
    "@id": `${BASE_URL}/#organization`,
  },
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
    image: project.coverImage
      ? project.coverImage.startsWith("http")
        ? project.coverImage
        : `${BASE_URL}${project.coverImage}`
      : `${BASE_URL}/brand/scaleflow-social-card.png`,
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
