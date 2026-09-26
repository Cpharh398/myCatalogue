import { CurrentState, type ElementAttr } from "~/util/types";

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

function makeElement(
  tag: ElementAttr["elementTag"], content: string, x: number, y: number, width: number, height: number,
  options: Partial<ElementAttr> & { fontSize?: number; color?: string; weight?: number; align?: string } = {},
): ElementAttr {
  const { fontSize = 16, color = "#282c25", weight = 400, align = "left", ...other } = options;
  return {
    elementTag: tag, content, position: { x, y }, size: { width, height },
    borderRadius: { radiusTL: 1, radiusTR: 1, radiusBL: 1, radiusBR: 1 },
    borderColor: "transparent", borderWidth: 0, borderStyle: "solid", backgroundColor: "transparent",
    useGradient: false, gradientStart: "#ffffff", gradientEnd: "#d5e5d6", gradientAngle: 120,
    currentState: CurrentState.IDLE, transformOrigin: "center", zIndex: 2, canvasChildren: {},
    currentStateInTree: { isChildElement: false, parentElementID: null },
    lgSreenStyle: {
      padding: tag === "img" ? 0 : 6, color, fontSize, fontWeight: weight,
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", textAlign: align as "left" | "center" | "right",
      lineHeight: 1.35, objectFit: tag === "img" ? "cover" : undefined,
      whiteSpace: content.includes("\n") ? "pre-line" : undefined,
    },
    ...other,
  };
}

function buildPage(name: string, templateId: StarterTemplateId, linkPages: { id: string; name: string }[], background: string, build: (add: (e: ElementAttr) => void) => void): SitePage {
  const elements: Record<string, ElementAttr> = {};
  const add = (element: ElementAttr) => { elements[makeId()] = element; };
  const bg = makeElement("div", "", 0, 0, 104, 112, { backgroundColor: background, zIndex: 0, lgSreenStyle: { pointerEvents: "none" } });
  add(bg);
  add(makeElement("h2", siteNameFor(templateId), 4, 2, 26, 3, { fontSize: 18, weight: 700, color: "#30382e" }));
  linkPages.forEach((page, index) => add(makeElement("a", page.name, 59 + index * 11, 2, 10, 3, {
    fontSize: 12, weight: 600, color: "#485348", linkTarget: page.id, align: "center",
  })));
  build(add);
  add(makeElement("p", "Made with myCatalogue  ·  Built for your next good thing.", 5, 101, 70, 3, { fontSize: 11, color: "#6d766a" }));
  return { id: pageId(templateId, name), name, elements };
}

function makeId() { return `element-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`; }
function pageId(templateId: StarterTemplateId, name: string) { return `${templateId}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`; }
function siteNameFor(templateId: StarterTemplateId) {
  return ({ "product-shop": "Good Things Studio", "booking-studio": "Stillwater Studio", cafe: "Corner Table", "creative-services": "Northline Studio" })[templateId];
}

const page = (templateId: StarterTemplateId, name: string) => ({ id: pageId(templateId, name), name });

export function createSiteTemplate(templateId: StarterTemplateId): { siteName: string; pages: SitePage[] } {
  if (templateId === "product-shop") {
    const links = [page(templateId, "Home"), page(templateId, "Shop"), page(templateId, "Our story"), page(templateId, "Contact")];
    const home = buildPage("Home", templateId, links.slice(1), "#fbf8f2", add => {
      add(makeElement("p", "SMALL BATCH · MADE WITH CARE", 6, 11, 44, 3, { fontSize: 11, weight: 700, color: "#9c6146" }));
      add(makeElement("h1", "Good things,\nmade to last.", 5, 15, 42, 15, { fontSize: 43, weight: 700, color: "#28362c" }));
      add(makeElement("p", "Thoughtful homewares and everyday objects from independent makers.", 6, 32, 37, 7, { fontSize: 17, color: "#687268" }));
      add(makeElement("button", "Shop the collection →", 6, 42, 24, 5, { fontSize: 14, weight: 700, color: "#fff", backgroundColor: "#315b45", borderRadius: { radiusTL: 20, radiusTR: 20, radiusBL: 20, radiusBR: 20 }, linkTarget: links[1].id }));
      add(makeElement("img", photos.pottery, 52, 9, 43, 39, { borderRadius: { radiusTL: 4, radiusTR: 4, radiusBL: 4, radiusBR: 4 } }));
      add(makeElement("h2", "A few favourites", 6, 55, 60, 6, { fontSize: 27, weight: 700 }));
      add(makeElement("p", "Useful, beautiful pieces for everyday rituals.", 6, 62, 60, 4, { fontSize: 14, color: "#6b746a" }));
      const cards = [[photos.candle, "Sunday candle", "R 350"], [photos.linen, "Everyday linen", "R 680"], [photos.skincare, "Botanical hand balm", "R 220"]];
      cards.forEach(([src, label, price], index) => {
        const x = 6 + index * 30;
        add(makeElement("img", src, x, 69, 26, 20, { borderRadius: { radiusTL: 3, radiusTR: 3, radiusBL: 3, radiusBR: 3 } }));
        add(makeElement("h3", label, x, 90, 26, 4, { fontSize: 14, weight: 700 }));
        add(makeElement("p", price, x, 94, 26, 3, { fontSize: 13, color: "#697267" }));
        add(makeElement("button", "View in shop →", x, 97, 23, 4, { fontSize: 11, weight: 700, color: "#315b45", linkTarget: links[1].id }));
      });
    });
    const shop = buildPage("Shop", templateId, [links[0], links[2], links[3]], "#fbf8f2", add => {
      add(makeElement("h1", "The collection", 6, 12, 75, 8, { fontSize: 37, weight: 700 }));
      add(makeElement("p", "A considered edit for home, gifting, and the everyday.", 6, 21, 70, 5, { fontSize: 16, color: "#6b746a" }));
      [[photos.pottery, "Hand-thrown stoneware", "R 420"], [photos.candle, "Sunday candle", "R 350"], [photos.linen, "Soft linen tote", "R 680"], [photos.skincare, "Botanical hand balm", "R 220"], [photos.pottery, "Morning cup set", "R 560"], [photos.candle, "Evening ritual set", "R 740"]].forEach(([src, label, price], index) => {
        const x = 6 + (index % 3) * 30, y = 30 + Math.floor(index / 3) * 30;
        add(makeElement("img", src, x, y, 26, 19, { borderRadius: { radiusTL: 3, radiusTR: 3, radiusBL: 3, radiusBR: 3 } }));
        add(makeElement("h3", label, x, y + 19, 26, 4, { fontSize: 14, weight: 700 }));
        add(makeElement("p", price, x, y + 23, 26, 3, { fontSize: 13, color: "#697267" }));
        add(makeElement("button", "Ask about this →", x, y + 27, 24, 4, { fontSize: 11, weight: 700, color: "#315b45", linkTarget: links[3].id }));
      });
    });
    const story = buildPage("Our story", templateId, [links[0], links[1], links[3]], "#f3eee4", add => {
      add(makeElement("img", photos.pottery, 54, 12, 38, 44, { borderRadius: { radiusTL: 4, radiusTR: 4, radiusBL: 4, radiusBR: 4 } }));
      add(makeElement("p", "A NOTE FROM OUR WORKSHOP", 7, 17, 39, 3, { fontSize: 11, weight: 700, color: "#9c6146" }));
      add(makeElement("h1", "Made slowly.\nKept for years.", 6, 22, 45, 15, { fontSize: 36, weight: 700 }));
      add(makeElement("p", "We work with independent makers who believe useful objects should be made with care. Each piece is chosen for its materials, its maker, and the way it earns a place in your everyday life.", 7, 40, 40, 15, { fontSize: 15, color: "#657064" }));
      add(makeElement("h2", "Good design should feel good to live with.", 7, 67, 80, 8, { fontSize: 24, weight: 700 }));
    });
    const contact = buildPage("Contact", templateId, [links[0], links[1], links[2]], "#fbf8f2", add => addContactSection(add, "We'd love to hear from you", "Questions about an order, a gift, or a maker? Send us a note and we'll get back to you."));
    return { siteName: "Good Things Studio", pages: [home, shop, story, contact] };
  }

  if (templateId === "booking-studio") {
    const links = [page(templateId, "Home"), page(templateId, "Treatments"), page(templateId, "Book a visit")];
    const home = buildPage("Home", templateId, links.slice(1), "#f6f4ee", add => {
      add(makeElement("p", "A CALMER KIND OF SELF-CARE", 6, 12, 43, 3, { fontSize: 11, weight: 700, color: "#55785e" }));
      add(makeElement("h1", "Make a little\nroom for you.", 5, 16, 45, 16, { fontSize: 41, weight: 700, color: "#293b30" }));
      add(makeElement("p", "Restorative treatments in a quiet, welcoming studio. Come as you are; leave feeling more like yourself.", 6, 34, 39, 9, { fontSize: 16, color: "#697569" }));
      add(makeElement("button", "Explore treatments →", 6, 46, 25, 5, { fontSize: 14, weight: 700, color: "#fff", backgroundColor: "#55785e", borderRadius: { radiusTL: 20, radiusTR: 20, radiusBL: 20, radiusBR: 20 }, linkTarget: links[1].id }));
      add(makeElement("img", photos.studio, 53, 9, 42, 43, { borderRadius: { radiusTL: 5, radiusTR: 5, radiusBL: 5, radiusBR: 5 } }));
      add(makeElement("h2", "Choose your moment", 6, 60, 70, 6, { fontSize: 27, weight: 700 }));
      [[photos.facial, "A fresh start", "60 minute facial"], [photos.massage, "Unwind", "Relaxation massage"], [photos.yoga, "Find your balance", "Private movement session"]].forEach(([src, name, desc], index) => {
        const x = 6 + index * 30;
        add(makeElement("img", src, x, 69, 26, 17, { borderRadius: { radiusTL: 3, radiusTR: 3, radiusBL: 3, radiusBR: 3 } }));
        add(makeElement("h3", name, x, 87, 26, 4, { fontSize: 15, weight: 700 }));
        add(makeElement("p", desc, x, 91, 26, 4, { fontSize: 12, color: "#697569" }));
      });
    });
    const treatments = buildPage("Treatments", templateId, [links[0], links[2]], "#f6f4ee", add => {
      add(makeElement("h1", "Treatments & sessions", 6, 12, 78, 8, { fontSize: 36, weight: 700 }));
      add(makeElement("p", "A few thoughtful ways to slow down. Every visit includes time to settle in and a plan shaped around you.", 6, 21, 77, 7, { fontSize: 15, color: "#697569" }));
      [["Restore facial", "A gentle, replenishing facial for tired skin.", "60 min · R 850"], ["Deep rest massage", "Unhurried bodywork to release tension.", "75 min · R 980"], ["Private movement", "One-on-one movement and breath session.", "50 min · R 720"]].forEach(([name, desc, price], index) => {
        const y = 33 + index * 18;
        add(makeElement("div", "", 6, y, 82, 15, { backgroundColor: "#fff", borderRadius: { radiusTL: 3, radiusTR: 3, radiusBL: 3, radiusBR: 3 }, lgSreenStyle: { padding: 8, border: "1px solid #e6e7dd", boxShadow: "0 5px 18px rgba(32,48,36,.04)" } }));
        add(makeElement("h2", name, 9, y + 1, 42, 5, { fontSize: 19, weight: 700 }));
        add(makeElement("p", desc, 9, y + 6, 51, 5, { fontSize: 13, color: "#697569" }));
        add(makeElement("p", price, 65, y + 5, 22, 4, { fontSize: 13, weight: 700, color: "#55785e", align: "right" }));
      });
      add(makeElement("button", "Request a time", 6, 90, 24, 5, { fontSize: 14, weight: 700, color: "#fff", backgroundColor: "#55785e", linkTarget: links[2].id, borderRadius: { radiusTL: 20, radiusTR: 20, radiusBL: 20, radiusBR: 20 } }));
    });
    const booking = buildPage("Book a visit", templateId, [links[0], links[1]], "#f4f3ed", add => addContactSection(add, "Let's find a time", "Tell us which treatment you're interested in and when you are usually available. We'll confirm your appointment by email."));
    return { siteName: "Stillwater Studio", pages: [home, treatments, booking] };
  }

  if (templateId === "cafe") {
    const links = [page(templateId, "Home"), page(templateId, "Menu"), page(templateId, "Find us")];
    const home = buildPage("Home", templateId, links.slice(1), "#f8f4eb", add => {
      add(makeElement("p", "COFFEE · BAKING · GOOD COMPANY", 6, 11, 52, 3, { fontSize: 11, weight: 700, color: "#a46636" }));
      add(makeElement("h1", "A table for\nevery kind of day.", 5, 15, 47, 16, { fontSize: 39, weight: 700, color: "#453322" }));
      add(makeElement("p", "A neighborhood cafe for slow mornings, warm bread, and one more cup.", 6, 33, 40, 7, { fontSize: 16, color: "#796c5a" }));
      add(makeElement("button", "See what's on the menu →", 6, 44, 29, 5, { fontSize: 13, weight: 700, color: "#fff", backgroundColor: "#80522f", linkTarget: links[1].id, borderRadius: { radiusTL: 20, radiusTR: 20, radiusBL: 20, radiusBR: 20 } }));
      add(makeElement("img", photos.cafe, 54, 9, 41, 43, { borderRadius: { radiusTL: 5, radiusTR: 5, radiusBL: 5, radiusBR: 5 } }));
      add(makeElement("h2", "From our counter", 6, 60, 70, 6, { fontSize: 26, weight: 700 }));
      [[photos.coffee, "House coffee", "From R 34"], [photos.pastry, "Morning pastry", "From R 28"], [photos.food, "Seasonal lunch", "From R 95"]].forEach(([src, name, desc], index) => {
        const x = 6 + index * 30;
        add(makeElement("img", src, x, 69, 26, 17, { borderRadius: { radiusTL: 3, radiusTR: 3, radiusBL: 3, radiusBR: 3 } }));
        add(makeElement("h3", name, x, 87, 26, 4, { fontSize: 15, weight: 700 }));
        add(makeElement("p", desc, x, 91, 26, 4, { fontSize: 12, color: "#796c5a" }));
      });
    });
    const menu = buildPage("Menu", templateId, [links[0], links[2]], "#f8f4eb", add => {
      add(makeElement("h1", "Good food, no rush.", 6, 12, 78, 8, { fontSize: 37, weight: 700 }));
      add(makeElement("p", "Our menu changes with the season. Everything is made fresh in our kitchen.", 6, 21, 73, 5, { fontSize: 15, color: "#796c5a" }));
      [["Coffee & tea", "Espresso · R 34\nFlat white · R 39\nBatch brew · R 32"], ["From the oven", "Butter croissant · R 42\nOrange loaf · R 38\nSourdough toast · R 54"], ["Lunch plates", "Garden bowl · R 105\nRoasted tomato toast · R 88\nSoup of the day · R 79"]].forEach(([title, items], index) => {
        const x = 6 + index * 30;
        add(makeElement("div", "", x, 32, 26, 37, { backgroundColor: "#fff", borderRadius: { radiusTL: 4, radiusTR: 4, radiusBL: 4, radiusBR: 4 }, lgSreenStyle: { padding: 10, boxShadow: "0 8px 24px rgba(69,51,34,.07)" } }));
        add(makeElement("h2", title, x + 1, 34, 23, 6, { fontSize: 18, weight: 700, color: "#80522f" }));
        add(makeElement("p", items, x + 1, 41, 23, 22, { fontSize: 13, color: "#62594e", lgSreenStyle: { padding: 6, whiteSpace: "pre-line", lineHeight: 2 } }));
      });
      add(makeElement("p", "Ask us about today's vegetarian, vegan, and gluten-free options.", 6, 75, 70, 5, { fontSize: 14, color: "#796c5a" }));
    });
    const visit = buildPage("Find us", templateId, [links[0], links[1]], "#f6f0e6", add => {
      add(makeElement("img", photos.cafe, 53, 14, 39, 41, { borderRadius: { radiusTL: 4, radiusTR: 4, radiusBL: 4, radiusBR: 4 } }));
      add(makeElement("p", "COME ON IN", 7, 18, 36, 3, { fontSize: 11, weight: 700, color: "#a46636" }));
      add(makeElement("h1", "Your new\nfavourite corner.", 6, 23, 43, 15, { fontSize: 35, weight: 700 }));
      add(makeElement("p", "18 Market Lane\nCape Town, South Africa\n\nMon–Fri  7:30–16:00\nSat–Sun  8:00–14:00", 7, 40, 39, 17, { fontSize: 15, color: "#796c5a", lgSreenStyle: { padding: 6, whiteSpace: "pre-line", lineHeight: 1.8 } }));
      add(makeElement("a", "Get directions ↗", 7, 61, 28, 5, { fontSize: 14, weight: 700, color: "#80522f", linkTarget: "https://maps.google.com/?q=18+Market+Lane+Cape+Town" }));
    });
    return { siteName: "Corner Table", pages: [home, menu, visit] };
  }

  const links = [page(templateId, "Home"), page(templateId, "Services"), page(templateId, "Contact")];
  const home = buildPage("Home", templateId, links.slice(1), "#f2f5f5", add => {
    add(makeElement("p", "INDEPENDENT CREATIVE PRACTICE", 6, 11, 50, 3, { fontSize: 11, weight: 700, color: "#466578" }));
    add(makeElement("h1", "We make brands\nfeel like you.", 5, 15, 47, 16, { fontSize: 39, weight: 700, color: "#283641" }));
    add(makeElement("p", "Strategy, identity, and digital experiences for people building something meaningful.", 6, 33, 41, 8, { fontSize: 16, color: "#65727a" }));
    add(makeElement("button", "See how we can help →", 6, 45, 28, 5, { fontSize: 13, weight: 700, color: "#fff", backgroundColor: "#466578", linkTarget: links[1].id, borderRadius: { radiusTL: 20, radiusTR: 20, radiusBL: 20, radiusBR: 20 } }));
    add(makeElement("img", photos.work, 53, 9, 42, 42, { borderRadius: { radiusTL: 5, radiusTR: 5, radiusBL: 5, radiusBR: 5 } }));
    add(makeElement("h2", "Selected work", 6, 59, 70, 6, { fontSize: 26, weight: 700 }));
    [[photos.brand, "Better together", "Identity · Strategy"], [photos.portrait, "People of the coast", "Art direction · Photo"], [photos.work, "A place to make", "Digital · Campaign"]].forEach(([src, name, desc], index) => {
      const x = 6 + index * 30;
      add(makeElement("img", src, x, 68, 26, 18, { borderRadius: { radiusTL: 3, radiusTR: 3, radiusBL: 3, radiusBR: 3 } }));
      add(makeElement("h3", name, x, 87, 26, 4, { fontSize: 14, weight: 700 }));
      add(makeElement("p", desc, x, 91, 26, 4, { fontSize: 12, color: "#65727a" }));
    });
  });
  const services = buildPage("Services", templateId, [links[0], links[2]], "#f2f5f5", add => {
    add(makeElement("h1", "Good work starts with a good conversation.", 6, 12, 80, 9, { fontSize: 34, weight: 700 }));
    add(makeElement("p", "Bring us a challenge, a half-formed idea, or a clear brief. We'll help you find the next right step.", 6, 22, 76, 6, { fontSize: 15, color: "#65727a" }));
    [["Brand foundations", "Positioning, naming, and a visual identity system built to grow with you."], ["Digital experiences", "Thoughtful websites and digital tools that make the next step easy."], ["Creative partnership", "Flexible creative support for teams who need a little extra momentum."]].forEach(([title, desc], index) => {
      const y = 34 + index * 17;
      add(makeElement("div", "", 6, y, 82, 14, { backgroundColor: "#fff", borderRadius: { radiusTL: 3, radiusTR: 3, radiusBL: 3, radiusBR: 3 }, lgSreenStyle: { padding: 8, border: "1px solid #dce4e5" } }));
      add(makeElement("h2", title, 9, y + 1, 34, 5, { fontSize: 18, weight: 700 }));
      add(makeElement("p", desc, 42, y + 1, 42, 7, { fontSize: 13, color: "#65727a" }));
    });
    add(makeElement("button", "Tell us about your project", 6, 89, 31, 5, { fontSize: 13, weight: 700, color: "#fff", backgroundColor: "#466578", linkTarget: links[2].id }));
  });
  const contact = buildPage("Contact", templateId, [links[0], links[1]], "#f2f5f5", add => addContactSection(add, "Let's make something matter", "Tell us a little about what you're building. We'll reply with a few questions and a good next step."));
  return { siteName: "Northline Studio", pages: [home, services, contact] };
}

function addContactSection(add: (element: ElementAttr) => void, title: string, description: string) {
  add(makeElement("p", "WE'RE HERE TO HELP", 7, 13, 40, 3, { fontSize: 11, weight: 700, color: "#55785e" }));
  add(makeElement("h1", title, 6, 18, 43, 12, { fontSize: 35, weight: 700 }));
  add(makeElement("p", description, 7, 32, 40, 11, { fontSize: 15, color: "#697569" }));
  add(makeElement("h2", "Send us a note", 54, 13, 38, 6, { fontSize: 23, weight: 700 }));
  add(makeElement("p", "Your name", 54, 22, 36, 3, { fontSize: 12, weight: 600, color: "#697569" }));
  add(makeElement("input", "Enter your name", 53, 25, 39, 5, { inputType: "text", backgroundColor: "#fff", borderColor: "#dfe4dc", borderWidth: 1, borderStyle: "solid", borderRadius: { radiusTL: 2, radiusTR: 2, radiusBL: 2, radiusBR: 2 } }));
  add(makeElement("p", "Email address", 54, 32, 36, 3, { fontSize: 12, weight: 600, color: "#697569" }));
  add(makeElement("input", "you@example.com", 53, 35, 39, 5, { inputType: "email", backgroundColor: "#fff", borderColor: "#dfe4dc", borderWidth: 1, borderStyle: "solid", borderRadius: { radiusTL: 2, radiusTR: 2, radiusBL: 2, radiusBR: 2 } }));
  add(makeElement("p", "How can we help?", 54, 42, 36, 3, { fontSize: 12, weight: 600, color: "#697569" }));
  add(makeElement("textarea", "Write your message here", 53, 45, 39, 12, { backgroundColor: "#fff", borderColor: "#dfe4dc", borderWidth: 1, borderStyle: "solid", borderRadius: { radiusTL: 2, radiusTR: 2, radiusBL: 2, radiusBR: 2 } }));
  add(makeElement("button", "Send message", 53, 60, 23, 5, { fontSize: 13, weight: 700, color: "#fff", backgroundColor: "#315b45", borderRadius: { radiusTL: 2, radiusTR: 2, radiusBL: 2, radiusBR: 2 }, linkTarget: "mailto:hello@example.com?subject=Website%20enquiry" }));
  add(makeElement("p", "Prefer email? hello@example.com", 7, 51, 42, 4, { fontSize: 13, color: "#697569" }));
}
