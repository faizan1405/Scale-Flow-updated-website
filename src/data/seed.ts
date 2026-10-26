import type { DB } from "./types";
import { portfolio } from "./portfolio";

const now = "2026-10-25T00:00:00.000Z";


export const seed: DB = {
  categories: [
    { id: "c-3d", name: "3D Interactive", slug: "3d-interactive", enabled: true, order: 1 },
    { id: "c-ecommerce", name: "E-commerce", slug: "e-commerce", enabled: true, order: 2 },
    { id: "c-business", name: "Business", slug: "business", enabled: true, order: 3 },
    { id: "c-fashion", name: "Fashion", slug: "fashion", enabled: true, order: 4 },
    { id: "c-travel", name: "Travel", slug: "travel", enabled: true, order: 5 },
    { id: "c-realestate", name: "Real Estate & Interiors", slug: "real-estate-interiors", enabled: true, order: 6 },
    { id: "c-creative", name: "Creative", slug: "creative", enabled: true, order: 7 },
    { id: "c-catalogue", name: "Product Catalogue", slug: "catalogue", enabled: true, order: 8 },
  ],
  projects: portfolio,
  // Walkthrough videos have not been supplied yet; these placeholder cards say "Video not uploaded".
  videos: [
    { id: "v1", title: "BMW Interactive Experience — walkthrough", description: "Upload the real walkthrough in Admin → Media.", projectId: "pf-bmw", categoryId: "c-3d", featured: true, published: true, order: 1, sample: true, updatedAt: now },
    { id: "v2", title: "VELORA Serum — 3D product story", description: "Upload the real walkthrough in Admin → Media.", projectId: "pf-velora", categoryId: "c-3d", featured: true, published: true, order: 2, sample: true, updatedAt: now },
    { id: "v3", title: "A & I Realty — 3D architecture tour", description: "Upload the real walkthrough in Admin → Media.", projectId: "pf-ai-realty", categoryId: "c-3d", featured: false, published: true, order: 3, sample: true, updatedAt: now },
    { id: "v4", title: "Noctra Mattress — storefront tour", description: "Upload the real walkthrough in Admin → Media.", projectId: "pf-noctra", categoryId: "c-ecommerce", featured: false, published: true, order: 4, sample: true, updatedAt: now },
  ],
  packages: [
    { id: "basic", name: "Basic Website", tagline: "A clean, fast presence for getting started.", price: 15000, includedFeatureIds: ["whatsapp"], enabled: true, order: 1 },
    { id: "business", name: "Business Website", tagline: "Multi-page site built to generate enquiries.", price: 30000, includedFeatureIds: ["whatsapp", "forms"], enabled: true, order: 2 },
    { id: "premium", name: "Premium Brand Website", tagline: "Art-directed design with motion and a CMS.", price: 45000, includedFeatureIds: ["whatsapp", "forms", "animations", "blog", "admin"], enabled: true, order: 3 },
    { id: "ecommerce", name: "E-commerce Website", tagline: "A storefront with products, cart and payments.", price: null, includedFeatureIds: ["whatsapp", "ecommerce", "products", "admin"], enabled: true, order: 4 },
    { id: "3d", name: "3D Interactive Website", tagline: "Real-time 3D storytelling in the browser.", price: null, includedFeatureIds: ["whatsapp", "animations", "three"], enabled: true, order: 5 },
    { id: "catalogue", name: "Product Catalogue Website", tagline: "A searchable catalogue that replaces PDFs and drives enquiries.", price: null, includedFeatureIds: ["whatsapp", "products"], enabled: true, order: 6 },
    { id: "app", name: "Custom Web Application", tagline: "Dashboards, accounts and custom logic.", price: null, includedFeatureIds: ["accounts", "dashboard", "admin"], enabled: true, order: 7 },
  ],
  features: [
    { id: "admin", name: "Admin panel", description: "Update your website independently without contacting your developer for every small change.", price: 8000, availableFor: [], enabled: true, order: 1 },
    { id: "ecommerce", name: "E-commerce functionality", description: "Show products, manage orders and enable online purchases.", price: null, availableFor: ["ecommerce", "app"], enabled: true, order: 2 },
    { id: "payments", name: "Payment gateway integration", description: "Allow customers to pay online, securely and instantly.", price: 5000, availableFor: ["business", "premium", "ecommerce", "app"], enabled: true, order: 3 },
    { id: "products", name: "Product management", description: "Add, price and organise products yourself as your range grows.", price: 6000, availableFor: ["business", "premium", "ecommerce", "catalogue", "app"], enabled: true, order: 4 },
    { id: "booking", name: "Booking / appointments", description: "Let visitors request or book appointments easily.", price: 7000, availableFor: [], enabled: true, order: 5 },
    { id: "blog", name: "Blog / content management", description: "Publish and update content without editing code.", price: 5000, availableFor: [], enabled: true, order: 6 },
    { id: "forms", name: "Advanced inquiry system", description: "Collect structured customer requirements so sales conversations become more productive.", price: 3000, availableFor: [], enabled: true, order: 7 },
    { id: "whatsapp", name: "WhatsApp integration", description: "Turn visitors into conversations with one-tap, prefilled WhatsApp chats.", price: 2000, availableFor: [], enabled: true, order: 8 },
    { id: "animations", name: "Smooth animations", description: "Refined motion that makes your brand feel considered and premium.", price: 5000, availableFor: [], enabled: true, order: 9 },
    { id: "three", name: "3D interactive experience", description: "Create visually memorable and immersive product presentations.", price: null, availableFor: ["premium", "3d", "app"], enabled: true, order: 10 },
    { id: "accounts", name: "User login / accounts", description: "Give customers their own account for orders, history and saved details.", price: 10000, availableFor: ["business", "premium", "ecommerce", "app"], enabled: true, order: 11 },
    { id: "dashboard", name: "Custom dashboard", description: "See the numbers and tools that matter to your business in one place.", price: null, availableFor: ["premium", "ecommerce", "app"], enabled: true, order: 12 },
  ],
  settings: {
    whatsapp: "919873721207",
    brandName: "Scale Flow",
    email: "contact@joinscaleflow.com",
    location: "3rd Floor, 44, Regal Building, 69, Connaught Cir, Hanuman Road Area, Connaught Place, New Delhi, Delhi 110001",
    heroHeadline: "We Build Digital Experiences Worth Exploring.",
    heroSub: "An immersive showcase of websites, digital experiences and ambitious ideas brought to life by Scale Flow.",
    showreelUrl: "",
    seoTitle: "Scale Flow — The Digital Showroom",
    seoDescription: "Explore websites and digital experiences crafted by Scale Flow, then build your own website estimate in minutes.",
  },
  media: [],
};
