// Content model for the Scale Flow showroom. Mirrors the future Hostinger/MySQL schema.

export type Palette = { bg: string; surface: string; fg: string; accent: string };

export type MockLayout = "editorial" | "shop" | "studio" | "app" | "catalogue" | "landing";

export type ProjectKind = "client" | "concept" | "demo" | "unverified";

export const KIND_LABEL: Record<ProjectKind, string> = { client: "Client work", concept: "Concept", demo: "Demo", unverified: "" };

export interface Category {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  order: number;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  client: string;
  categoryId: string;
  /** Secondary filters this project also appears under. */
  extraCategoryIds?: string[] | undefined;
  /** Client Work / Concept / Demo. "unverified" shows no public label until the owner confirms. */
  kind?: ProjectKind | undefined;
  summary: string;
  overview: string;
  context: string;
  goals: string;
  approach: string;
  capabilities: string[];
  deliverables: string[];
  tags: string[];
  palette: Palette;
  /** Ambient light colour behind this project in featured showcases (falls back to palette.accent). */
  ambient?: string | undefined;
  layout: MockLayout;
  coverImage?: string | undefined;
  screenshots: string[];
  mobileScreenshots: string[];
  videoUrl?: string | undefined;
  liveUrl?: string | undefined;
  featured: boolean;
  published: boolean;
  order: number;
  sample: boolean;
  updatedAt: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  projectId?: string | undefined;
  categoryId?: string | undefined;
  src?: string | undefined;
  thumbnail?: string | undefined;
  featured: boolean;
  published: boolean;
  order: number;
  sample: boolean;
  updatedAt: string;
}

export interface QuotePackage {
  id: string;
  name: string;
  tagline: string;
  /** null = custom quote */
  price: number | null;
  includedFeatureIds: string[];
  enabled: boolean;
  order: number;
}

export interface QuoteFeature {
  id: string;
  name: string;
  description: string;
  /** null = priced on request */
  price: number | null;
  /** empty = available for every package */
  availableFor: string[];
  enabled: boolean;
  order: number;
}

export interface Settings {
  whatsapp: string;
  brandName: string;
  email: string;
  location: string;
  heroHeadline: string;
  heroSub: string;
  showreelUrl: string;
  seoTitle: string;
  seoDescription: string;
}

export interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video";
  size: number;
  url: string;
  /** false = blob URL that only lives for this browser session */
  persisted: boolean;
  createdAt: string;
}

export interface DB {
  categories: Category[];
  projects: Project[];
  videos: Video[];
  packages: QuotePackage[];
  features: QuoteFeature[];
  settings: Settings;
  media: MediaItem[];
}
