export interface Hotspot {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  label: string;
  note: string;
  productSlug: string;
}

export interface FestivalMomentItem {
  name: string;
  nepali: string;
  tag: string;
  iconKey: string;
}

export const siteConfig = {
  name: "LoveKod",
  nepaliName: "लभकोण",
  tagline: "Festive Kurtha Sets for Tihar 2083",
  description: "Handcrafted festive kurtha sets in pure georgette and rich silk blends. Delivering across all 77 districts of Nepal.",
  whatsappNumber: "+977 9719567133",
  whatsappRaw: "9779719567133",
  freeDeliveryThreshold: 3000,
  orderByDate: "Kartik 15",
  activeOffer: {
    code: "TIHAR2083",
    description: "Flat 10% festive privilege on your first order"
  },
  
  // Hero Section Config
  hero: {
    headline: "Kurtha sets for Bhai Tika",
    subtext: "Georgette and silk, hand-embroidered. Delivering across all 77 districts.",
    ctaText: "Shop the Tihar edit",
    ctaLink: "#collection",
    image: "/images/kurtha-charcoal.jpg",
    alt: "LoveKod Charcoal Embroidered Georgette Festive 3-Piece Kurtha Set",
    hotspots: [
      {
        id: "neckline",
        x: 50,
        y: 26,
        label: "Neckline Zari Work",
        note: "Hand-embossed silver needlework framed along an artisanal split collar.",
        productSlug: "lk-001"
      },
      {
        id: "dupatta",
        x: 66,
        y: 42,
        label: "Dupatta Edge",
        note: "Gossamer georgette with scalloped silver embroidery edging.",
        productSlug: "lk-001"
      },
      {
        id: "hemline",
        x: 50,
        y: 65,
        label: "Embroidered Hem Band",
        note: "Handcrafted kurtha border with fine floral needlework.",
        productSlug: "lk-001"
      }
    ] as Hotspot[]
  },

  // Festival Moments Ticker
  festivalMoments: [
    { name: "Kukur Tihar", nepali: "कुकुर तिहार", tag: "Loyalty & Devotion", iconKey: "kukur" },
    { name: "Laxmi Puja", nepali: "लक्ष्मी पूजा", tag: "Welcoming Light & Prosperity", iconKey: "laxmi" },
    { name: "Mha Puja", nepali: "म्ह: पूजा", tag: "Soul Reverence • Nepal Sambat", iconKey: "mha" },
    { name: "Bhai Tika", nepali: "भाइटीका", tag: "Seven-Color Blessings", iconKey: "bhaitika" },
    { name: "Gai Tihar", nepali: "गाई तिहार", tag: "Sacred Harmony", iconKey: "gai" }
  ] as FestivalMomentItem[],

  // Navigation Links
  navLinks: [
    { label: "Collection", href: "/#collection" },
    { label: "Occasions", href: "/#occasions" },
    { label: "Reviews", href: "/#reviews" }
  ]
};
