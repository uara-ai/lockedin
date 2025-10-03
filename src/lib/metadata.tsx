import { Twitter, Linkedin, Mail } from "lucide-react";

export const DATA = {
  // Brand & positioning
  name: "Uara.co - Proof of Work & Public Accountability Platform",
  initials: "UA",
  url: "https://uara.co",
  location: "Remote • Europe (CET)",
  locationLink: "https://www.google.com/maps/place/Europe",
  description:
    "Uara is where builders, founders, and professionals showcase proof of work, set public commitments, and build credibility through real achievements.",
  summary:
    "Showcase proof of work. Set public commitments. Build credibility with skin in the game.",

  avatarUrl: "/logo.svg",

  // 🔎 Primary keywords / services (used across pages & schema)
  skills: [
    "proof of work platform",
    "public accountability app",
    "commitment tracking for founders",
    "startup goal accountability",
    "professional proof of work profile",
    "skin in the game challenges",
    "public commitment tracker",
    "accountability partner online",
    "goal setting with accountability",
  ],

  contact: {
    email: "fed@uara.ai",
    tel: "",
    social: {
      Twitter: {
        name: "Twitter / X",
        url: "https://x.com/FedericoFan",
        icon: Twitter,
        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/federico-fanini/",
        icon: Linkedin,
        navbar: true,
      },
      Email: {
        name: "Email",
        url: "mailto:fed@uara.ai",
        icon: Mail,
        navbar: false,
      },
    },
  },

  // Optional: audiences/use-cases you target (helps long-tail)
  industries: [
    "Builders",
    "Founders",
    "Professionals",
    "Entrepreneurs",
    "Startup Founders",
  ],

  // 🔎 Long-tail keywords you want to rank for
  keywords: [
    "proof of work platform",
    "public accountability app",
    "commitment tracking for founders",
    "startup goal accountability",
    "professional proof of work profile",
    "skin in the game challenges",
    "public commitment tracker",
    "accountability partner online",
    "goal setting with accountability",
  ],

  // 🌐 Per-page SEO metadata (titles, descriptions, og)
  meta: {
    home: {
      title: "Uara.co - Proof of Work & Public Accountability Platform",
      description:
        "Showcase proof of work. Set public commitments. Build credibility with skin in the game.",
      ogImage: "/og/opengraph-image.png",
    },
    pricing: {
      title: "Pricing — Uara.co Proof of Work & Public Accountability Platform",
      description: "Simple plans for proof of work and public accountability. ",
      ogImage: "/og/opengraph-image.png",
    },
  },

  // ⚙️ JSON-LD (inject via Next metadata API)
  schemaOrg: {
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Uara.co",
      url: "https://uara.co",
      logo: "https://uara.co/logo-uara.png",
      sameAs: [
        "https://x.com/FedericoFan",
        "https://www.linkedin.com/in/federico-fanini/",
        "https://uara.co",
      ],
    },
    // Represent the app itself
    app: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Uara.co — Proof of Work & Public Accountability Platform",
      applicationCategory: "Accountability Application",
      operatingSystem: "Web",
      description:
        "A proof of work and public accountability platform that allows you to showcase your work and build credibility with skin in the game.",
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        // Use a placeholder or bind to your actual plan later
        price: "0.00",
        availability: "https://schema.org/PreOrder",
        url: "https://uara.co/",
      },
      publisher: { "@type": "Organization", name: "Uara.co" },
    },
  },
} as const;
