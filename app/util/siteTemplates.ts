import type { ElementAttr, ResponsiveDevice } from "~/util/types";
import {
  TEMPLATE_WIDTHS,
  createCartComponent,
  createCheckoutComponent,
  createContactFormComponent,
  createFooterComponent,
  createHeroComponent,
  createNavigationComponent,
  createProductGridComponent,
  createTestimonialComponent,
  normalizeTemplateElementTree,
  responsiveHeight,
  templateElement,
  type TemplatePageLink,
  type TemplateProduct,
  type TemplateTheme,
} from "./templateComponents";

export type StarterTemplateId = "product-shop" | "booking-studio" | "cafe" | "creative-services";
export type SitePage = { id: string; name: string; elements: Record<string, ElementAttr> };
export type SiteStarter = {
  id: StarterTemplateId;
  name: string;
  category: string;
  description: string;
  audience: string;
  accent: string;
  cover: string;
};

export const siteStarters: SiteStarter[] = [
  {
    id: "product-shop", name: "Product shop", category: "Online store",
    description: "A ready-to-shape storefront with product photography, featured picks, a shop page, and a contact section.",
    audience: "For makers, boutiques, and independent product brands.", accent: "#b75c3d",
    cover: "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "booking-studio", name: "Booking website", category: "Appointments",
    description: "Introduce your services, show session options, and guide visitors to request a booking.",
    audience: "For salons, wellness studios, coaches, and local professionals.", accent: "#55785e",
    cover: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "cafe", name: "Cafe & restaurant", category: "Food and drink",
    description: "Set the scene with a welcoming home page, menu highlights, opening details, and a visit page.",
    audience: "For cafes, bakeries, caterers, and neighborhood restaurants.", accent: "#bd7a3a",
    cover: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "creative-services", name: "Creative studio", category: "Services & portfolio",
    description: "Present your work, explain your packages, and give potential clients a clear way to get in touch.",
    audience: "For designers, photographers, consultants, and small agencies.", accent: "#466578",
    cover: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85",
  },
];

const photos = {
  pottery: "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1200&q=85",
  candle: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85",
  linen: "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=900&q=85",
  skincare: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85",
  studio: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85",
  facial: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85",
  massage: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=900&q=85",
  yoga: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=85",
  cafe: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85",
  food: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=85",
  pastry: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85",
  coffee: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=900&q=85",
  work: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
  portrait: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85",
  brand: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=85",
};

const themes: Record<StarterTemplateId, TemplateTheme> = {
  "product-shop": { background: "#fbf8f2", surface: "#fffdf9", ink: "#28362c", muted: "#687268", accent: "#315b45", line: "#e8e2d6", soft: "#f0ede3" },
  "booking-studio": { background: "#f6f4ee", surface: "#fffefa", ink: "#293b30", muted: "#697569", accent: "#55785e", line: "#e5e5da", soft: "#e9ede4" },
  cafe: { background: "#f8f4eb", surface: "#fffdf8", ink: "#453322", muted: "#796c5a", accent: "#80522f", line: "#e9dfcf", soft: "#f1e8d8" },
  "creative-services": { background: "#f2f5f5", surface: "#ffffff", ink: "#283641", muted: "#65727a", accent: "#466578", line: "#dce4e5", soft: "#e5eef0" },
};

const makePageId = (templateId: StarterTemplateId, name: string) => `${templateId}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
const page = (templateId: StarterTemplateId, name: string) => ({ id: makePageId(templateId, name), name });

function buildPage(templateId: StarterTemplateId, name: string, theme: TemplateTheme, components: ElementAttr[]): SitePage {
  const elements: Record<string, ElementAttr> = {};
  const add = (element: ElementAttr) => { elements[`site-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`] = element; };
  components.forEach(add);
  const pageHeight = responsiveHeight(elements);
  const tabletHeight = responsiveHeight(elements, "tablet" satisfies ResponsiveDevice);
  const mobileHeight = responsiveHeight(elements, "mobile" satisfies ResponsiveDevice);
  const background = templateElement("div", "", 0, 0, TEMPLATE_WIDTHS.desktop, pageHeight, {
    backgroundColor: theme.background,
    zIndex: 0,
    lgSreenStyle: { padding: 0, pointerEvents: "none" },
    responsiveStyles: {
      tablet: { size: { width: TEMPLATE_WIDTHS.tablet, height: tabletHeight } },
      mobile: { size: { width: TEMPLATE_WIDTHS.mobile, height: mobileHeight } },
    },
  });
  elements[`site-background-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`] = background;
  return { id: makePageId(templateId, name), name, elements: normalizeTemplateElementTree(elements) };
}

function standardNavigation(templateId: StarterTemplateId, name: string, siteName: string, cartId: string, candidates: { name: string; id: string }[], theme: TemplateTheme) {
  const homeId = makePageId(templateId, "Home");
  const links: TemplatePageLink[] = candidates
    .filter(candidate => candidate.name !== name && candidate.id !== cartId && candidate.name !== "Checkout" && candidate.name !== "Home")
    .slice(0, 3)
    .map(candidate => ({ label: candidate.name === "Our story" ? "About" : candidate.name === "Book a visit" ? "Book" : candidate.name === "Find us" ? "Visit" : candidate.name, target: candidate.id }));
  return createNavigationComponent({ siteName, homeTarget: homeId, links, cartTarget: cartId, theme });
}

function standardFooter(templateId: StarterTemplateId, siteName: string, contactId: string, cartId: string, y: { desktop: number; tablet: number; mobile: number }, theme: TemplateTheme) {
  return createFooterComponent({ siteName, homeTarget: makePageId(templateId, "Home"), contactTarget: contactId, cartTarget: cartId, theme, y });
}

function makeCommercePages(templateId: StarterTemplateId, siteName: string, theme: TemplateTheme, productList: TemplateProduct[], pages: { name: string; id: string }[]): SitePage[] {
  const cartId = makePageId(templateId, "Cart");
  const checkoutId = makePageId(templateId, "Checkout");
  const shopId = pages.find(item => ["Shop", "Treatments", "Menu", "Services", "Work"].includes(item.name))?.id || makePageId(templateId, "Home");
  const contactId = pages.find(item => item.name === "Contact" || item.name === "Book a visit")?.id || shopId;
  const cartProducts = productList.slice(0, 2);
  const cart = buildPage(templateId, "Cart", theme, [
    standardNavigation(templateId, "Cart", siteName, cartId, pages, theme),
    createCartComponent({ products: cartProducts, checkoutTarget: checkoutId, shopTarget: shopId, theme, y: { desktop: 9, tablet: 9, mobile: 9 } }),
    standardFooter(templateId, siteName, contactId, cartId, { desktop: 74, tablet: 75, mobile: 105 }, theme),
  ]);
  const checkout = buildPage(templateId, "Checkout", theme, [
    standardNavigation(templateId, "Checkout", siteName, cartId, pages, theme),
    createCheckoutComponent({ products: cartProducts, theme, y: { desktop: 9, tablet: 9, mobile: 9 } }),
    standardFooter(templateId, siteName, contactId, cartId, { desktop: 80, tablet: 80, mobile: 118 }, theme),
  ]);
  return [cart, checkout];
}

function createProductShop(): { siteName: string; pages: SitePage[] } {
  const templateId = "product-shop";
  const siteName = "Good Things Studio";
  const theme = themes[templateId];
  const pageList = ["Home", "Shop", "Our story", "Contact", "Cart", "Checkout"].map(name => page(templateId, name));
  const ids = Object.fromEntries(pageList.map(item => [item.name, item.id]));
  const products: TemplateProduct[] = [
    { name: "Hand-thrown stoneware", image: photos.pottery, price: "R 420", description: "Made slowly in small batches." },
    { name: "Sunday candle", image: photos.candle, price: "R 350", description: "A warm, gentle everyday scent." },
    { name: "Everyday linen", image: photos.linen, price: "R 680", description: "Soft natural linen that lasts." },
    { name: "Botanical hand balm", image: photos.skincare, price: "R 220", description: "A little care for busy hands." },
    { name: "Morning cup set", image: photos.pottery, price: "R 560", description: "Two useful cups for your table." },
    { name: "Evening ritual set", image: photos.candle, price: "R 740", description: "Thoughtful gifts, ready to give." },
  ];
  const home = buildPage(templateId, "Home", theme, [
    standardNavigation(templateId, "Home", siteName, ids.Cart, pageList, theme),
    createHeroComponent({ eyebrow: "Small batch · made with care", title: "Good things,\nmade to last.", description: "Useful, beautiful pieces for everyday rituals, chosen from independent makers.", image: photos.pottery, action: "Shop the collection", actionTarget: ids.Shop, theme }),
    createProductGridComponent({ title: "A few favourites", subtitle: "The pieces our customers come back for.", products: products.slice(0, 3), cartTarget: ids.Cart, theme, y: { desktop: 51, tablet: 52, mobile: 68 } }),
    createTestimonialComponent({ quote: "The pieces feel special without being precious. They have become part of our everyday.", author: "Talia · Good Things customer", theme, y: { desktop: 95, tablet: 127, mobile: 170 } }),
    standardFooter(templateId, siteName, ids.Contact, ids.Cart, { desktop: 121, tablet: 155, mobile: 199 }, theme),
  ]);
  const shop = buildPage(templateId, "Shop", theme, [
    standardNavigation(templateId, "Shop", siteName, ids.Cart, pageList, theme),
    createProductGridComponent({ title: "The collection", subtitle: "Considered homewares for gifting, gathering, and the everyday.", products, cartTarget: ids.Cart, theme, y: { desktop: 9, tablet: 9, mobile: 9 } }),
    standardFooter(templateId, siteName, ids.Contact, ids.Cart, { desktop: 83, tablet: 113, mobile: 203 }, theme),
  ]);
  const story = buildPage(templateId, "Our story", theme, [
    standardNavigation(templateId, "Our story", siteName, ids.Cart, pageList, theme),
    createHeroComponent({ eyebrow: "A note from our workshop", title: "Made slowly.\nKept for years.", description: "We work with independent makers who believe useful objects should be made with care. Each piece earns its place in your everyday life.", image: photos.linen, action: "Meet the collection", actionTarget: ids.Shop, theme }),
    createTestimonialComponent({ quote: "Good design should feel good to live with, and good to pass along.", author: "Our studio promise", theme, y: { desktop: 51, tablet: 53, mobile: 68 } }),
    standardFooter(templateId, siteName, ids.Contact, ids.Cart, { desktop: 77, tablet: 81, mobile: 98 }, theme),
  ]);
  const contact = buildPage(templateId, "Contact", theme, [
    standardNavigation(templateId, "Contact", siteName, ids.Cart, pageList, theme),
    createContactFormComponent({ title: "We'd love to hear from you", description: "Questions about an order, a gift, or a maker? Send us a note and we'll get back to you soon.", email: "hello@goodthings.example", theme, y: { desktop: 9, tablet: 9, mobile: 9 } }),
    standardFooter(templateId, siteName, ids.Contact, ids.Cart, { desktop: 65, tablet: 68, mobile: 102 }, theme),
  ]);
  return { siteName, pages: [...pageList.slice(0, 4).map(item => item.name === "Home" ? home : item.name === "Shop" ? shop : item.name === "Our story" ? story : contact), ...makeCommercePages(templateId, siteName, theme, products, pageList)] };
}

function createBookingStudio(): { siteName: string; pages: SitePage[] } {
  const templateId = "booking-studio";
  const siteName = "Stillwater Studio";
  const theme = themes[templateId];
  const pageList = ["Home", "Treatments", "Book a visit", "Contact", "Cart", "Checkout"].map(name => page(templateId, name));
  const ids = Object.fromEntries(pageList.map(item => [item.name, item.id]));
  const offers: TemplateProduct[] = [
    { name: "Restore facial", image: photos.facial, price: "R 850", description: "A gentle reset for tired skin · 60 min." },
    { name: "Deep rest massage", image: photos.massage, price: "R 980", description: "Unhurried bodywork · 75 min." },
    { name: "Private movement", image: photos.yoga, price: "R 720", description: "A one-to-one breath session · 50 min." },
  ];
  const home = buildPage(templateId, "Home", theme, [
    standardNavigation(templateId, "Home", siteName, ids.Cart, pageList, theme),
    createHeroComponent({ eyebrow: "A calmer kind of self-care", title: "Make a little\nroom for you.", description: "Restorative treatments in a quiet, welcoming studio. Come as you are; leave feeling more like yourself.", image: photos.studio, action: "Explore treatments", actionTarget: ids.Treatments, theme }),
    createProductGridComponent({ title: "Choose your moment", subtitle: "Thoughtful care, with space to settle in.", products: offers, cartTarget: ids.Cart, theme, y: { desktop: 51, tablet: 52, mobile: 68 } }),
    createTestimonialComponent({ quote: "I walked out lighter, calmer, and already looking forward to my next visit.", author: "Nandi · Studio guest", theme, y: { desktop: 95, tablet: 127, mobile: 170 } }),
    standardFooter(templateId, siteName, ids.Contact, ids.Cart, { desktop: 121, tablet: 155, mobile: 199 }, theme),
  ]);
  const treatments = buildPage(templateId, "Treatments", theme, [
    standardNavigation(templateId, "Treatments", siteName, ids.Cart, pageList, theme),
    createProductGridComponent({ title: "Treatments & sessions", subtitle: "Every visit includes time to settle in and a plan shaped around you.", products: offers, cartTarget: ids.Cart, theme, y: { desktop: 9, tablet: 9, mobile: 9 } }),
    standardFooter(templateId, siteName, ids.Contact, ids.Cart, { desktop: 52, tablet: 82, mobile: 112 }, theme),
  ]);
  const booking = buildPage(templateId, "Book a visit", theme, [
    standardNavigation(templateId, "Book a visit", siteName, ids.Cart, pageList, theme),
    createContactFormComponent({ title: "Let's find a time", description: "Tell us which treatment you're interested in and when you are usually available. We'll confirm your appointment by email.", email: "hello@stillwater.example", theme, y: { desktop: 9, tablet: 9, mobile: 9 } }),
    standardFooter(templateId, siteName, ids.Contact, ids.Cart, { desktop: 65, tablet: 68, mobile: 102 }, theme),
  ]);
  const contact = buildPage(templateId, "Contact", theme, [
    standardNavigation(templateId, "Contact", siteName, ids.Cart, pageList, theme),
    createContactFormComponent({ title: "A little more ease starts here", description: "Ask us about access, treatments, gift cards, or finding the right first appointment.", email: "hello@stillwater.example", theme, y: { desktop: 9, tablet: 9, mobile: 9 } }),
    standardFooter(templateId, siteName, ids.Contact, ids.Cart, { desktop: 65, tablet: 68, mobile: 102 }, theme),
  ]);
  return { siteName, pages: [home, treatments, booking, contact, ...makeCommercePages(templateId, siteName, theme, offers, pageList)] };
}

function createCafe(): { siteName: string; pages: SitePage[] } {
  const templateId = "cafe";
  const siteName = "Corner Table";
  const theme = themes[templateId];
  const pageList = ["Home", "Menu", "Find us", "Contact", "Cart", "Checkout"].map(name => page(templateId, name));
  const ids = Object.fromEntries(pageList.map(item => [item.name, item.id]));
  const menuItems: TemplateProduct[] = [
    { name: "House coffee", image: photos.coffee, price: "R 34", description: "Espresso, batch brew, or flat white." },
    { name: "Morning pastry", image: photos.pastry, price: "R 42", description: "Baked fresh in our kitchen each morning." },
    { name: "Seasonal lunch", image: photos.food, price: "R 105", description: "A generous plate from the market." },
  ];
  const home = buildPage(templateId, "Home", theme, [
    standardNavigation(templateId, "Home", siteName, ids.Cart, pageList, theme),
    createHeroComponent({ eyebrow: "Coffee · baking · good company", title: "A table for\nevery kind of day.", description: "Slow mornings, warm bread, and one more cup. Find a seat and stay a little.", image: photos.cafe, action: "See what's on the menu", actionTarget: ids.Menu, theme }),
    createProductGridComponent({ title: "From our counter", subtitle: "A small taste of what is fresh today.", products: menuItems, cartTarget: ids.Cart, theme, y: { desktop: 51, tablet: 52, mobile: 68 } }),
    createTestimonialComponent({ quote: "The kind of neighborhood place where the coffee is lovely and they remember your name.", author: "Alex · regular at Corner Table", theme, y: { desktop: 95, tablet: 127, mobile: 170 } }),
    standardFooter(templateId, siteName, ids.Contact, ids.Cart, { desktop: 121, tablet: 155, mobile: 199 }, theme),
  ]);
  const menu = buildPage(templateId, "Menu", theme, [
    standardNavigation(templateId, "Menu", siteName, ids.Cart, pageList, theme),
    createProductGridComponent({ title: "Good food, no rush", subtitle: "Seasonal plates, fresh baking, and coffee from people who care.", products: [...menuItems, { name: "Garden bowl", image: photos.food, price: "R 105", description: "Greens, grains, and bright dressing." }, { name: "Orange loaf", image: photos.pastry, price: "R 38", description: "A slice of something sunny." }, { name: "Afternoon coffee", image: photos.coffee, price: "R 39", description: "Made just the way you like it." }], cartTarget: ids.Cart, theme, y: { desktop: 9, tablet: 9, mobile: 9 } }),
    standardFooter(templateId, siteName, ids.Contact, ids.Cart, { desktop: 83, tablet: 113, mobile: 203 }, theme),
  ]);
  const visit = buildPage(templateId, "Find us", theme, [
    standardNavigation(templateId, "Find us", siteName, ids.Cart, pageList, theme),
    createHeroComponent({ eyebrow: "Come on in", title: "Your new\nfavourite corner.", description: "18 Market Lane, Cape Town\nMonday–Friday · 7:30–16:00\nWeekends · 8:00–14:00", image: photos.cafe, action: "Get directions", actionTarget: "https://maps.google.com/?q=18+Market+Lane+Cape+Town", theme }),
    createTestimonialComponent({ quote: "A lovely place to settle in, share something warm, and let the day slow down.", author: "Corner Table · Cape Town", theme, y: { desktop: 51, tablet: 53, mobile: 68 } }),
    standardFooter(templateId, siteName, ids.Contact, ids.Cart, { desktop: 77, tablet: 81, mobile: 98 }, theme),
  ]);
  const contact = buildPage(templateId, "Contact", theme, [
    standardNavigation(templateId, "Contact", siteName, ids.Cart, pageList, theme),
    createContactFormComponent({ title: "Say hello", description: "Ask about catering, a private table, or what is coming out of the oven today.", email: "hello@cornertable.example", theme, y: { desktop: 9, tablet: 9, mobile: 9 } }),
    standardFooter(templateId, siteName, ids.Contact, ids.Cart, { desktop: 65, tablet: 68, mobile: 102 }, theme),
  ]);
  return { siteName, pages: [home, menu, visit, contact, ...makeCommercePages(templateId, siteName, theme, menuItems, pageList)] };
}

function createCreativeStudio(): { siteName: string; pages: SitePage[] } {
  const templateId = "creative-services";
  const siteName = "Northline Studio";
  const theme = themes[templateId];
  const pageList = ["Home", "Work", "Services", "Contact", "Cart", "Checkout"].map(name => page(templateId, name));
  const ids = Object.fromEntries(pageList.map(item => [item.name, item.id]));
  const offers: TemplateProduct[] = [
    { name: "Brand foundations", image: photos.brand, price: "R 9,500", description: "Positioning, naming, and a visual identity." },
    { name: "Digital experiences", image: photos.work, price: "R 14,000", description: "Thoughtful websites and digital tools." },
    { name: "Creative partnership", image: photos.portrait, price: "Let's talk", description: "Flexible support for your growing team." },
  ];
  const home = buildPage(templateId, "Home", theme, [
    standardNavigation(templateId, "Home", siteName, ids.Cart, pageList, theme),
    createHeroComponent({ eyebrow: "Independent creative practice", title: "We make brands\nfeel like you.", description: "Strategy, identity, and digital experiences for people building something meaningful.", image: photos.work, action: "See how we can help", actionTarget: ids.Services, theme }),
    createProductGridComponent({ title: "Selected work", subtitle: "A few recent collaborations, built with care.", products: offers, cartTarget: ids.Cart, theme, y: { desktop: 51, tablet: 52, mobile: 68 } }),
    createTestimonialComponent({ quote: "They understood what made us different and turned it into a brand we are proud to share.", author: "Mika · Northline client", theme, y: { desktop: 95, tablet: 127, mobile: 170 } }),
    standardFooter(templateId, siteName, ids.Contact, ids.Cart, { desktop: 121, tablet: 155, mobile: 199 }, theme),
  ]);
  const work = buildPage(templateId, "Work", theme, [
    standardNavigation(templateId, "Work", siteName, ids.Cart, pageList, theme),
    createProductGridComponent({ title: "Selected projects", subtitle: "Good work starts with listening, then making something useful.", products: [...offers, { name: "People of the coast", image: photos.portrait, price: "Art direction", description: "Portraits and stories from the shoreline." }, { name: "A place to make", image: photos.work, price: "Digital · Campaign", description: "A digital home for a local maker." }, { name: "Better together", image: photos.brand, price: "Strategy · Identity", description: "A clear voice for a new chapter." }], cartTarget: ids.Contact, theme, y: { desktop: 9, tablet: 9, mobile: 9 } }),
    standardFooter(templateId, siteName, ids.Contact, ids.Cart, { desktop: 83, tablet: 113, mobile: 203 }, theme),
  ]);
  const services = buildPage(templateId, "Services", theme, [
    standardNavigation(templateId, "Services", siteName, ids.Cart, pageList, theme),
    createProductGridComponent({ title: "Good work starts with a conversation", subtitle: "Bring us a challenge, a half-formed idea, or a clear brief.", products: offers, cartTarget: ids.Cart, theme, y: { desktop: 9, tablet: 9, mobile: 9 } }),
    standardFooter(templateId, siteName, ids.Contact, ids.Cart, { desktop: 52, tablet: 82, mobile: 112 }, theme),
  ]);
  const contact = buildPage(templateId, "Contact", theme, [
    standardNavigation(templateId, "Contact", siteName, ids.Cart, pageList, theme),
    createContactFormComponent({ title: "Let's make something matter", description: "Tell us a little about what you're building. We'll reply with a few questions and a good next step.", email: "hello@northline.example", theme, y: { desktop: 9, tablet: 9, mobile: 9 } }),
    standardFooter(templateId, siteName, ids.Contact, ids.Cart, { desktop: 65, tablet: 68, mobile: 102 }, theme),
  ]);
  return { siteName, pages: [home, work, services, contact, ...makeCommercePages(templateId, siteName, theme, offers, pageList)] };
}

export function createSiteTemplate(templateId: StarterTemplateId): { siteName: string; pages: SitePage[] } {
  switch (templateId) {
    case "product-shop": return createProductShop();
    case "booking-studio": return createBookingStudio();
    case "cafe": return createCafe();
    case "creative-services": return createCreativeStudio();
  }
}
