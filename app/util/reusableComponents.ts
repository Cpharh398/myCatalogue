import { CurrentState, type ElementAttr } from "~/util/types";

export type ReusablePresetId = "product-grid" | "contact-form" | "booking-card" | "testimonial" | "service-list";
export const reusablePresets: { id: ReusablePresetId; name: string; description: string; icon: string }[] = [
  { id: "product-grid", name: "Product cards", description: "A three item product row with photos, prices, and buttons.", icon: "▦" },
  { id: "contact-form", name: "Get in touch form", description: "Name, email, message fields, and a send button.", icon: "✉" },
  { id: "booking-card", name: "Booking callout", description: "A compact service card with duration, price, and booking action.", icon: "◷" },
  { id: "testimonial", name: "Customer quote", description: "A styled review with a short attribution.", icon: "❝" },
  { id: "service-list", name: "Service list", description: "Three clear service and price rows.", icon: "☰" },
];

const images = [
  "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=800&q=80",
];

function item(tag: ElementAttr["elementTag"], content: string, x: number, y: number, width: number, height: number, options: Partial<ElementAttr> & { sizePx?: number; color?: string; bold?: boolean } = {}): ElementAttr {
  const { sizePx = 14, color = "#28332b", bold = false, ...props } = options;
  return {
    elementTag: tag, content, position: { x, y }, size: { width, height },
    borderRadius: { radiusTL: 2, radiusTR: 2, radiusBL: 2, radiusBR: 2 }, borderColor: "transparent", borderWidth: 0, borderStyle: "solid",
    backgroundColor: "transparent", useGradient: false, gradientStart: "#fff", gradientEnd: "#e5eee4", gradientAngle: 0,
    currentState: CurrentState.IDLE, transformOrigin: "center", zIndex: 2, canvasChildren: {},
    currentStateInTree: { isChildElement: false, parentElementID: null },
    lgSreenStyle: { padding: tag === "img" ? 0 : 5, fontSize: sizePx, color, fontWeight: bold ? 700 : 400, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", lineHeight: 1.35 },
    ...props,
  };
}

export function createReusableComponent(preset: ReusablePresetId, top: number): Record<string, ElementAttr> {
  const result: Record<string, ElementAttr> = {};
  const add = (element: ElementAttr) => { result[`component-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`] = element; };
  const card = (x: number, y: number, width: number, height: number, backgroundColor = "#fff") => item("div", "", x, y, width, height, { backgroundColor, borderColor: "#e3e8e1", borderWidth: 1, borderStyle: "solid", borderRadius: { radiusTL: 3, radiusTR: 3, radiusBL: 3, radiusBR: 3 } });

  if (preset === "product-grid") {
    add(item("h2", "Featured products", 5, top, 60, 6, { sizePx: 25, bold: true }));
    ["Handmade ceramic", "Sunday candle", "Linen everyday bag"].forEach((name, index) => {
      const x = 5 + index * 30;
      add(card(x, top + 7, 26, 33));
      add(item("img", images[index], x, top + 7, 26, 19, { borderRadius: { radiusTL: 3, radiusTR: 3, radiusBL: 0, radiusBR: 0 } }));
      add(item("h3", name, x + 1, top + 27, 24, 4, { sizePx: 14, bold: true }));
      add(item("p", ["R 420", "R 350", "R 680"][index], x + 1, top + 31, 12, 4, { sizePx: 13, color: "#69756a" }));
      add(item("button", "View item", x + 13, top + 31, 11, 4, { sizePx: 11, color: "#fff", bold: true, backgroundColor: "#315b45", linkTarget: "mailto:hello@example.com?subject=Product%20enquiry" }));
    });
  }

  if (preset === "contact-form") {
    add(card(5, top, 54, 38, "#f5f7f3"));
    add(item("h2", "Get in touch", 7, top + 2, 46, 6, { sizePx: 24, bold: true }));
    add(item("p", "We usually reply within one business day.", 7, top + 8, 48, 4, { sizePx: 12, color: "#6b776d" }));
    [["Your name", top + 14], ["Email address", top + 21], ["How can we help?", top + 28]].forEach(([label, y]) => {
      const row = Number(y);
      add(item("p", String(label), 7, row - 2, 45, 2.5, { sizePx: 11, bold: true, color: "#56645a" }));
      const placeholder = label === "Your name" ? "Enter your name" : label === "Email address" ? "you@example.com" : "Write a short message";
      const fieldTag = label === "How can we help?" ? "textarea" : "input";
      add(item(fieldTag, placeholder, 7, row, 48, label === "How can we help?" ? 5 : 4, { inputType: label === "Email address" ? "email" : "text", backgroundColor: "#fff", borderColor: "#dce3da", borderWidth: 1, borderStyle: "solid" }));
    });
    add(item("button", "Send message", 7, top + 35, 21, 4.5, { sizePx: 12, color: "#fff", bold: true, backgroundColor: "#315b45", linkTarget: "mailto:hello@example.com?subject=Website%20enquiry" }));
  }

  if (preset === "booking-card") {
    add(card(5, top, 42, 28, "#f6f4ec"));
    add(item("p", "POPULAR SERVICE", 7, top + 2, 34, 3, { sizePx: 10, bold: true, color: "#55785e" }));
    add(item("h2", "A moment to reset", 7, top + 6, 36, 5, { sizePx: 19, bold: true }));
    add(item("p", "A restorative session tailored to you.", 7, top + 12, 36, 5, { sizePx: 12, color: "#6b776d" }));
    add(item("p", "60 min · R 850", 7, top + 19, 19, 4, { sizePx: 13, bold: true }));
    add(item("button", "Request a time →", 27, top + 19, 17, 5, { sizePx: 11, bold: true, color: "#fff", backgroundColor: "#55785e", linkTarget: "mailto:hello@example.com?subject=Booking%20request" }));
  }

  if (preset === "testimonial") {
    add(card(5, top, 68, 23, "#edf2e9"));
    add(item("p", "“The whole experience felt thoughtful, easy, and completely us. Our customers noticed the difference straight away.”", 8, top + 3, 62, 10, { sizePx: 17, color: "#33443a" }));
    add(item("p", "★★★★★", 8, top + 14, 20, 3, { sizePx: 12, color: "#c18648", bold: true }));
    add(item("p", "Jamie M. · Happy customer", 8, top + 18, 40, 3, { sizePx: 11, color: "#68756b" }));
  }

  if (preset === "service-list") {
    add(item("h2", "Our services", 5, top, 60, 6, { sizePx: 25, bold: true }));
    [["Brand consultation", "From R 950"], ["One-on-one session", "R 720 / hour"], ["Complete package", "Let's talk"]].forEach(([name, price], index) => {
      const y = top + 8 + index * 8;
      add(card(5, y, 67, 7));
      add(item("h3", name, 7, y + 1, 42, 5, { sizePx: 14, bold: true }));
      add(item("p", price, 50, y + 1, 20, 5, { sizePx: 12, bold: true, color: "#55785e" }));
    });
  }

  return result;
}
