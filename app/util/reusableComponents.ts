import type { ElementAttr } from "~/util/types";
import {
  createContactFormComponent,
  createNavigationComponent,
  createProductGridComponent,
  createTestimonialComponent,
  normalizeTemplateElementTree,
  type TemplateProduct,
  type TemplateTheme,
} from "./templateComponents";

export type ReusablePresetId = "navigation" | "product-grid" | "contact-form" | "booking-card" | "testimonial" | "service-list";
export const reusablePresets: { id: ReusablePresetId; name: string; description: string; icon: string }[] = [
  { id: "navigation", name: "Site navigation", description: "A brand mark, page links, and a cart shortcut. Edit each link from the control panel.", icon: "⌂" },
  { id: "product-grid", name: "Product cards", description: "Responsive product cards with stock photos, descriptions, prices, and bag links.", icon: "▦" },
  { id: "contact-form", name: "Get in touch form", description: "A responsive contact section with name, email, message fields, and a send action.", icon: "✉" },
  { id: "booking-card", name: "Booking options", description: "A compact set of service cards with session details and booking prices.", icon: "◷" },
  { id: "testimonial", name: "Customer quote", description: "A styled review panel with a short attribution.", icon: "❝" },
  { id: "service-list", name: "Service list", description: "Responsive service cards with descriptions, prices, and clear actions.", icon: "☰" },
];

const theme: TemplateTheme = {
  background: "#fbf8f2", surface: "#fffdf9", ink: "#28362c", muted: "#687268",
  accent: "#315b45", line: "#e8e2d6", soft: "#f0ede3",
};
const photos = [
  "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=800&q=80",
];

const sampleProducts: TemplateProduct[] = [
  { name: "Handmade ceramic", image: photos[0], price: "R 420", description: "Made by hand in small batches." },
  { name: "Sunday candle", image: photos[1], price: "R 350", description: "A soft, warm everyday scent." },
  { name: "Linen everyday bag", image: photos[2], price: "R 680", description: "A useful companion for every day." },
];

function positionAtTop(element: ElementAttr, top: number): ElementAttr {
  const offset = top - (element.position.y || 0);
  const shiftDevice = (device: "tablet" | "mobile") => {
    const override = element.responsiveStyles?.[device];
    return override ? { ...override, position: { ...override.position, y: (override.position?.y || 0) + offset } } : undefined;
  };
  return {
    ...element,
    position: { ...element.position, y: top },
    responsiveStyles: {
      ...element.responsiveStyles,
      tablet: shiftDevice("tablet"),
      mobile: shiftDevice("mobile"),
    },
  };
}

export function createReusableComponent(preset: ReusablePresetId, top: number): Record<string, ElementAttr> {
  let element: ElementAttr;
  if (preset === "navigation") {
    element = createNavigationComponent({
      siteName: "Your brand",
      homeTarget: "",
      links: [{ label: "Shop", target: "" }, { label: "About", target: "" }, { label: "Contact", target: "" }],
      cartTarget: "",
      theme,
    });
  } else if (preset === "contact-form") {
    element = createContactFormComponent({
      title: "Get in touch",
      description: "Tell us what you have in mind. We usually reply within one business day.",
      email: "hello@example.com",
      theme,
      y: { desktop: top, tablet: top, mobile: top },
    });
  } else if (preset === "testimonial") {
    element = createTestimonialComponent({
      quote: "The whole experience felt thoughtful, easy, and completely us.",
      author: "Jamie M. · Happy customer",
      theme,
      y: { desktop: top, tablet: top, mobile: top },
    });
  } else {
    const products = preset === "booking-card"
      ? sampleProducts.slice(0, 1).map((product, index) => ({ ...product, name: ["A moment to reset"][index], price: "60 min · R 850", description: "A restorative session tailored to you." }))
      : preset === "service-list"
        ? sampleProducts.map((product, index) => ({ ...product, name: ["Brand consultation", "One-on-one session", "Complete package"][index], price: ["From R 950", "R 720 / hour", "Let's talk"][index], description: ["Find your focus and next steps.", "Thoughtful support for your goals.", "A clear plan, shaped around you."][index] }))
        : sampleProducts;
    element = createProductGridComponent({
      title: preset === "booking-card" ? "Booking options" : preset === "service-list" ? "Our services" : "Featured products",
      subtitle: preset === "booking-card" ? "Choose the time that works for you." : "Good things, chosen with care.",
      products,
      cartTarget: "mailto:hello@example.com?subject=Website%20enquiry",
      theme,
      y: { desktop: top, tablet: top, mobile: top },
    });
  }
  const moved = positionAtTop(element, top);
  return normalizeTemplateElementTree({ [`component-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`]: moved });
}
