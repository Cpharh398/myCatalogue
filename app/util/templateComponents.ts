import { CurrentState, type ElementAttr, type ResponsiveDevice, type ResponsiveElementStyle } from "~/util/types";

export type TemplateTheme = { background: string; surface: string; ink: string; muted: string; accent: string; line: string; soft: string };
export type TemplateProduct = { name: string; image: string; price: string; description: string };
export type TemplatePageLink = { label: string; target: string };

export const TEMPLATE_WIDTHS = { desktop: 58, tablet: 46, mobile: 23 } as const;
let sequence = 0;
const id = () => `template-component-${Date.now().toString(36)}-${(sequence++).toString(36)}`;

export function templateElement(
  tag: ElementAttr["elementTag"], content: string, x: number, y: number, width: number, height: number,
  options: Partial<ElementAttr> & { fontSize?: number; color?: string; weight?: number; textAlign?: "left" | "center" | "right" } = {},
): ElementAttr {
  const { fontSize = 14, color = "#28332b", weight = 400, textAlign = "left", ...other } = options;
  return {
    elementTag: tag, content, position: { x, y }, size: { width, height },
    borderRadius: { radiusTL: 1, radiusTR: 1, radiusBL: 1, radiusBR: 1 },
    borderColor: "transparent", borderWidth: 0, borderStyle: "solid", backgroundColor: "transparent",
    useGradient: false, gradientStart: "#ffffff", gradientEnd: "#d5e5d6", gradientAngle: 120,
    currentState: CurrentState.IDLE, transformOrigin: "center", zIndex: 2, canvasChildren: {},
    currentStateInTree: { isChildElement: false, parentElementID: null },
    lgSreenStyle: {
      padding: tag === "img" ? 0 : 2, color, fontSize, fontWeight: weight,
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", textAlign, lineHeight: 1.35,
      objectFit: tag === "img" ? "cover" : undefined,
      whiteSpace: content.includes("\n") ? "pre-line" : undefined,
    },
    ...other,
  };
}

function component(
  label: string, x: number, y: number, width: number, height: number, theme: TemplateTheme, children: ElementAttr[],
  options: Partial<ElementAttr> & { tablet?: ResponsiveElementStyle; mobile?: ResponsiveElementStyle } = {},
): ElementAttr {
  const { tablet, mobile, ...base } = options;
  const componentData = base.isComponentRoot ? {
    ...(base.componentData || {}),
    layoutSizes: {
      desktop: { width, height },
      tablet: { width: tablet?.size?.width ?? width, height: tablet?.size?.height ?? height },
      mobile: { width: mobile?.size?.width ?? width, height: mobile?.size?.height ?? height },
    },
  } : base.componentData;
  return templateElement("div", label, x, y, width, height, {
    canvasChildren: Object.fromEntries(children.map(child => [id(), child])),
    responsiveStyles: { ...(tablet ? { tablet } : {}), ...(mobile ? { mobile } : {}) },
    lgSreenStyle: { padding: 0, color: theme.ink, overflow: "visible" },
    ...base,
    ...(componentData ? { componentData } : {}),
  });
}

export function normalizeTemplateElementTree(elements: Record<string, ElementAttr>): Record<string, ElementAttr> {
  const normalize = (element: ElementAttr, elementId: string, parentId: string | null): ElementAttr => ({
    ...element,
    currentStateInTree: { isChildElement: parentId !== null, parentElementID: parentId },
    canvasChildren: Object.fromEntries(Object.entries(element.canvasChildren || {}).map(([childId, child]) => [
      childId,
      normalize(child, childId, elementId),
    ])),
  });

  return Object.fromEntries(Object.entries(elements).map(([elementId, element]) => [
    elementId,
    normalize(element, elementId, null),
  ]));
}

export function createNavigationComponent({ siteName, homeTarget, links, cartTarget, theme }: {
  siteName: string; homeTarget: string; links: TemplatePageLink[]; cartTarget: string; theme: TemplateTheme;
}): ElementAttr {
  const children: ElementAttr[] = [templateElement("a", siteName, 2, 1, 19, 4, {
    linkTarget: homeTarget, fontSize: 17, weight: 750, color: theme.ink,
    lgSreenStyle: { padding: 2, fontSize: 17, fontWeight: 750, color: theme.ink, whiteSpace: "nowrap" },
    responsiveStyles: {
      tablet: { position: { x: 1, y: 1 }, size: { width: 13, height: 4 }, lgSreenStyle: { fontSize: 14 } },
      mobile: { position: { x: 0.7, y: 1 }, size: { width: 7.2, height: 4 }, lgSreenStyle: { fontSize: 10, whiteSpace: "nowrap" } },
    },
  })];
  links.slice(0, 3).forEach((link, index) => children.push(templateElement("a", link.label, 31 + index * 6.6, 1, 6.2, 4, {
    linkTarget: link.target, fontSize: 12, weight: 600, color: theme.muted, textAlign: "center",
    lgSreenStyle: { padding: 2, fontSize: 12, fontWeight: 600, color: theme.muted, textAlign: "center", whiteSpace: "nowrap" },
    responsiveStyles: {
      tablet: { position: { x: 16 + index * 6.5, y: 1 }, size: { width: 6.2, height: 4 }, lgSreenStyle: { fontSize: 10 } },
      mobile: { position: { x: 8 + index * 3.5, y: 1 }, size: { width: 3.4, height: 4 }, lgSreenStyle: { fontSize: 8, whiteSpace: "nowrap" } },
    },
  })));
  children.push(templateElement("button", "Bag", 51.5, 1, 4.5, 4, {
    linkTarget: cartTarget, backgroundColor: theme.accent, fontSize: 11, weight: 700, color: "#ffffff", textAlign: "center",
    borderRadius: { radiusTL: 3, radiusTR: 3, radiusBL: 3, radiusBR: 3 },
    lgSreenStyle: { padding: 2, fontSize: 11, fontWeight: 700, color: "#ffffff", textAlign: "center", borderRadius: 8 },
    responsiveStyles: {
      tablet: { position: { x: 41, y: 1 }, size: { width: 4, height: 4 }, lgSreenStyle: { fontSize: 10 } },
      mobile: { position: { x: 19.3, y: 1 }, size: { width: 3, height: 4 }, lgSreenStyle: { fontSize: 8 } },
    },
  }));
  return component("Site navigation", 0, 0, 58, 6, theme, children, {
    isComponentRoot: true, componentKind: "navigation",
    backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 0, borderStyle: "solid", zIndex: 10,
    tablet: { position: { x: 0, y: 0 }, size: { width: 46, height: 6 } },
    mobile: { position: { x: 0, y: 0 }, size: { width: 23, height: 6 } },
    lgSreenStyle: { padding: 0, color: theme.ink, borderBottom: `1px solid ${theme.line}` },
  });
}

export function createHeroComponent({ eyebrow, title, description, image, action, actionTarget, theme }: {
  eyebrow: string; title: string; description: string; image: string; action: string; actionTarget: string; theme: TemplateTheme;
}): ElementAttr {
  const children = [
    templateElement("p", eyebrow.toUpperCase(), 0, 1, 24, 3, { fontSize: 10, weight: 700, color: theme.accent, responsiveStyles: { tablet: { size: { width: 19, height: 3 }, lgSreenStyle: { fontSize: 9 } }, mobile: { position: { x: 0, y: 0 }, size: { width: 22, height: 3 }, lgSreenStyle: { fontSize: 9 } } } }),
    templateElement("h1", title, 0, 5, 24, 12, { fontSize: 37, weight: 750, color: theme.ink, lgSreenStyle: { padding: 2, fontSize: 37, fontWeight: 750, color: theme.ink, lineHeight: 1.08, whiteSpace: "pre-line" }, responsiveStyles: { tablet: { position: { x: 0, y: 5 }, size: { width: 19, height: 11 }, lgSreenStyle: { fontSize: 30 } }, mobile: { position: { x: 0, y: 4 }, size: { width: 22, height: 10 }, lgSreenStyle: { fontSize: 29 } } } }),
    templateElement("p", description, 0, 18, 23, 8, { fontSize: 15, color: theme.muted, responsiveStyles: { tablet: { position: { x: 0, y: 17 }, size: { width: 19, height: 8 }, lgSreenStyle: { fontSize: 13 } }, mobile: { position: { x: 0, y: 15 }, size: { width: 22, height: 8 }, lgSreenStyle: { fontSize: 13 } } } }),
    templateElement("button", action, 0, 28, 20, 5, { linkTarget: actionTarget, fontSize: 12, weight: 700, color: "#ffffff", backgroundColor: theme.accent, borderRadius: { radiusTL: 3, radiusTR: 3, radiusBL: 3, radiusBR: 3 }, lgSreenStyle: { padding: 2, fontSize: 12, fontWeight: 700, color: "#ffffff", borderRadius: 9 }, responsiveStyles: { tablet: { position: { x: 0, y: 27 }, size: { width: 18, height: 5 } }, mobile: { position: { x: 0, y: 24 }, size: { width: 18, height: 5 } } } }),
    templateElement("img", image, 27, 1, 25, 33, { borderRadius: { radiusTL: 3, radiusTR: 3, radiusBL: 3, radiusBR: 3 }, lgSreenStyle: { padding: 0, objectFit: "cover", borderRadius: 18 }, responsiveStyles: { tablet: { position: { x: 21, y: 1 }, size: { width: 21, height: 37 } }, mobile: { position: { x: 0, y: 31 }, size: { width: 22, height: 22 } } } }),
  ];
  return component("Hero", 3, 8, 52, 38, theme, children, {
    isComponentRoot: true, componentKind: "hero",
    tablet: { position: { x: 2, y: 8 }, size: { width: 42, height: 40 } },
    mobile: { position: { x: 1, y: 8 }, size: { width: 22, height: 55 } },
  });
}

function createProductCard(product: TemplateProduct, cartTarget: string, theme: TemplateTheme, index: number): ElementAttr {
  const x = (index % 3) * 18;
  const y = 9 + Math.floor(index / 3) * 30;
  const children = [
    templateElement("img", product.image, 0, 0, 16, 12, { lgSreenStyle: { padding: 0, objectFit: "cover" }, responsiveStyles: { tablet: { size: { width: 21, height: 14 } }, mobile: { size: { width: 22, height: 14 } } } }),
    templateElement("h3", product.name, 0, 13, 16, 4, { fontSize: 13, weight: 700, color: theme.ink, responsiveStyles: { tablet: { size: { width: 21, height: 4 } }, mobile: { position: { x: 0, y: 15 }, size: { width: 22, height: 4 } } } }),
    templateElement("p", product.description, 0, 17, 16, 3, { fontSize: 10, color: theme.muted, responsiveStyles: { tablet: { position: { x: 0, y: 18 }, size: { width: 21, height: 3 } }, mobile: { position: { x: 0, y: 19 }, size: { width: 22, height: 3 } } } }),
    templateElement("p", product.price, 0, 21, 6, 4, { fontSize: 12, weight: 700, color: theme.ink, responsiveStyles: { tablet: { position: { x: 0, y: 22 }, size: { width: 8, height: 4 } }, mobile: { position: { x: 0, y: 23 }, size: { width: 9, height: 4 } } } }),
    templateElement("button", "Add to bag", 7, 21, 9, 4, { linkTarget: cartTarget, fontSize: 9, weight: 700, color: "#ffffff", backgroundColor: theme.accent, borderRadius: { radiusTL: 2, radiusTR: 2, radiusBL: 2, radiusBR: 2 }, lgSreenStyle: { padding: 1, fontSize: 9, fontWeight: 700, color: "#ffffff", borderRadius: 6, textAlign: "center" }, responsiveStyles: { tablet: { position: { x: 11, y: 22 }, size: { width: 10, height: 4 } }, mobile: { position: { x: 12, y: 23 }, size: { width: 10, height: 4 } } } }),
  ];
  return component(product.name, x, y, 16, 27, theme, children, {
    componentKind: "product-card",
    backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1, borderStyle: "solid",
    borderRadius: { radiusTL: 2, radiusTR: 2, radiusBL: 2, radiusBR: 2 },
    lgSreenStyle: { padding: 0, color: theme.ink, overflow: "hidden", borderRadius: 14, border: `1px solid ${theme.line}`, boxShadow: "0 8px 24px rgba(39,46,35,.06)" },
    tablet: { position: { x: (index % 2) * 22, y: 9 + Math.floor(index / 2) * 30 }, size: { width: 21, height: 28 } },
    mobile: { position: { x: 0, y: 9 + index * 29 }, size: { width: 22, height: 28 } },
  });
}

export function createProductGridComponent({ title, subtitle, products, cartTarget, theme, y }: {
  title: string; subtitle: string; products: TemplateProduct[]; cartTarget: string; theme: TemplateTheme;
  y: { desktop: number; tablet: number; mobile: number };
}): ElementAttr {
  const children = [
    templateElement("h2", title, 0, 0, 52, 5, { fontSize: 25, weight: 750, color: theme.ink, responsiveStyles: { tablet: { size: { width: 44, height: 5 }, lgSreenStyle: { fontSize: 23 } }, mobile: { size: { width: 22, height: 5 }, lgSreenStyle: { fontSize: 21 } } } }),
    templateElement("p", subtitle, 0, 5, 52, 3, { fontSize: 12, color: theme.muted, responsiveStyles: { tablet: { size: { width: 44, height: 3 } }, mobile: { position: { x: 0, y: 5 }, size: { width: 22, height: 3 }, lgSreenStyle: { fontSize: 10 } } } }),
    ...products.map((product, index) => createProductCard(product, cartTarget, theme, index)),
  ];
  return component(title, 3, y.desktop, 52, 9 + Math.ceil(products.length / 3) * 30, theme, children, {
    isComponentRoot: true,
    componentKind: "featured-products",
    componentData: { title, subtitle, products, cartTarget, theme },
    tablet: { position: { x: 1, y: y.tablet }, size: { width: 44, height: 9 + Math.ceil(products.length / 2) * 31 } },
    mobile: { position: { x: 1, y: y.mobile }, size: { width: 22, height: 9 + products.length * 30 } },
  });
}

export function appendFeaturedProduct(element: ElementAttr, elementId: string, device: "desktop" | "tablet" | "mobile" = "desktop"): ElementAttr {
  if (element.componentKind !== "featured-products" || !element.componentData) return element;
  const data = element.componentData as { title: string; subtitle: string; products: TemplateProduct[]; cartTarget: string; theme: TemplateTheme };
  const index = data.products.length;
  const product: TemplateProduct = {
    name: `New product ${index + 1}`,
    image: ["https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=900&q=80"][index % 3],
    price: "Add price",
    description: "Add a short description.",
  };
  const nextProducts = [...data.products, product];
  const tablet = element.responsiveStyles?.tablet || {};
  const mobile = element.responsiveStyles?.mobile || {};
  const desktopHeight = 9 + Math.ceil(nextProducts.length / 3) * 30;
  const tabletHeight = 9 + Math.ceil(nextProducts.length / 2) * 31;
  const mobileHeight = 9 + nextProducts.length * 30;
  const layoutSizes = element.componentData.layoutSizes as Record<string, { width: number; height: number }> | undefined;
  const activeHeight = device === "tablet" ? tabletHeight : device === "mobile" ? mobileHeight : desktopHeight;
  const next = {
    ...element,
    size: { width: element.size?.width ?? layoutSizes?.[device]?.width ?? 52, height: activeHeight },
    responsiveStyles: {
      ...element.responsiveStyles,
      tablet: { ...tablet, size: { width: tablet.size?.width ?? layoutSizes?.tablet?.width ?? element.size?.width ?? 44, height: tabletHeight } },
      mobile: { ...mobile, size: { width: mobile.size?.width ?? layoutSizes?.mobile?.width ?? element.size?.width ?? 22, height: mobileHeight } },
    },
    componentData: {
      ...element.componentData,
      products: nextProducts,
      layoutSizes: {
        ...layoutSizes,
        desktop: { width: layoutSizes?.desktop?.width ?? element.size?.width ?? 52, height: desktopHeight },
        tablet: { width: layoutSizes?.tablet?.width ?? tablet.size?.width ?? 44, height: tabletHeight },
        mobile: { width: layoutSizes?.mobile?.width ?? mobile.size?.width ?? 22, height: mobileHeight },
      },
    },
    canvasChildren: { ...(element.canvasChildren || {}), [id()]: createProductCard(product, data.cartTarget, data.theme, index) },
  };
  return normalizeTemplateElementTree({ [elementId]: next })[elementId];
}

export function createContactFormComponent({ title, description, email, theme, y }: {
  title: string; description: string; email: string; theme: TemplateTheme;
  y: { desktop: number; tablet: number; mobile: number };
}): ElementAttr {
  const children: ElementAttr[] = [
    templateElement("p", "WE'D LOVE TO HEAR FROM YOU", 0, 0, 20, 3, { fontSize: 9, weight: 700, color: theme.accent, responsiveStyles: { tablet: { size: { width: 15, height: 3 } }, mobile: { size: { width: 22, height: 3 } } } }),
    templateElement("h1", title, 0, 4, 20, 9, { fontSize: 29, weight: 750, color: theme.ink, lgSreenStyle: { padding: 2, fontSize: 29, fontWeight: 750, color: theme.ink, lineHeight: 1.1 }, responsiveStyles: { tablet: { size: { width: 15, height: 9 }, lgSreenStyle: { fontSize: 24 } }, mobile: { position: { x: 0, y: 4 }, size: { width: 22, height: 7 }, lgSreenStyle: { fontSize: 23 } } } }),
    templateElement("p", description, 0, 14, 19, 11, { fontSize: 13, color: theme.muted, responsiveStyles: { tablet: { size: { width: 15, height: 12 }, lgSreenStyle: { fontSize: 11 } }, mobile: { position: { x: 0, y: 12 }, size: { width: 22, height: 7 }, lgSreenStyle: { fontSize: 12 } } } }),
    templateElement("p", email, 0, 28, 19, 4, { fontSize: 12, weight: 600, color: theme.accent, responsiveStyles: { tablet: { size: { width: 15, height: 4 } }, mobile: { position: { x: 0, y: 20 }, size: { width: 22, height: 4 }, lgSreenStyle: { fontSize: 11 } } } }),
    templateElement("h2", "Send a message", 22, 0, 30, 5, { fontSize: 19, weight: 700, color: theme.ink, responsiveStyles: { tablet: { position: { x: 17, y: 0 }, size: { width: 27, height: 5 } }, mobile: { position: { x: 0, y: 26 }, size: { width: 22, height: 5 }, lgSreenStyle: { fontSize: 18 } } } }),
  ];
  const fields = [
    { label: "Your name", placeholder: "Enter your name", type: "text", y: 7, mobileY: 32 },
    { label: "Email address", placeholder: "you@example.com", type: "email", y: 16, mobileY: 42 },
    { label: "How can we help?", placeholder: "Write your message here", type: "textarea", y: 25, mobileY: 52 },
  ];
  fields.forEach(({ label, placeholder, type, y: fieldY, mobileY }) => {
    children.push(templateElement("p", label, 22, fieldY, 28, 3, { fontSize: 10, weight: 650, color: theme.muted, responsiveStyles: { tablet: { position: { x: 17, y: fieldY }, size: { width: 27, height: 3 } }, mobile: { position: { x: 0, y: mobileY }, size: { width: 22, height: 3 } } } }));
    children.push(templateElement(type === "textarea" ? "textarea" : "input", placeholder, 22, fieldY + 3, 29, type === "textarea" ? 8 : 5, {
      inputType: type === "email" ? "email" : "text", backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1, borderStyle: "solid",
      responsiveStyles: { tablet: { position: { x: 17, y: fieldY + 3 }, size: { width: 27, height: type === "textarea" ? 8 : 5 } }, mobile: { position: { x: 0, y: mobileY + 3 }, size: { width: 22, height: type === "textarea" ? 9 : 5 } } },
    }));
  });
  children.push(templateElement("button", "Send message", 22, 40, 17, 5, { linkTarget: `mailto:${email}?subject=Website%20enquiry`, fontSize: 11, weight: 700, color: "#fff", backgroundColor: theme.accent, borderRadius: { radiusTL: 2, radiusTR: 2, radiusBL: 2, radiusBR: 2 }, responsiveStyles: { tablet: { position: { x: 17, y: 42 }, size: { width: 17, height: 5 } }, mobile: { position: { x: 0, y: 67 }, size: { width: 22, height: 5 } } } }));
  return component("Contact form", 3, y.desktop, 52, 48, theme, children, {
    isComponentRoot: true, componentKind: "contact-form",
    tablet: { position: { x: 1, y: y.tablet }, size: { width: 44, height: 51 } },
    mobile: { position: { x: 1, y: y.mobile }, size: { width: 22, height: 74 } },
  });
}

export function createFooterComponent({ siteName, homeTarget, contactTarget, cartTarget, theme, y }: {
  siteName: string; homeTarget: string; contactTarget: string; cartTarget: string; theme: TemplateTheme;
  y: { desktop: number; tablet: number; mobile: number };
}): ElementAttr {
  const children = [
    templateElement("a", siteName, 0, 2, 23, 4, { linkTarget: homeTarget, fontSize: 14, weight: 700, color: theme.ink, responsiveStyles: { tablet: { size: { width: 42, height: 4 } }, mobile: { position: { x: 0, y: 1 }, size: { width: 22, height: 4 }, lgSreenStyle: { fontSize: 12 } } } }),
    templateElement("p", "Thoughtfully made for real life.", 25, 2, 18, 4, { fontSize: 10, color: theme.muted, textAlign: "center", responsiveStyles: { tablet: { position: { x: 0, y: 7 }, size: { width: 42, height: 4 } }, mobile: { position: { x: 0, y: 5 }, size: { width: 22, height: 3 }, lgSreenStyle: { fontSize: 9, textAlign: "left" } } }}),
    templateElement("a", "Contact", 43, 2, 4, 4, { linkTarget: contactTarget, fontSize: 10, weight: 600, color: theme.muted, textAlign: "right", responsiveStyles: { tablet: { position: { x: 0, y: 12 }, size: { width: 20, height: 4 } }, mobile: { position: { x: 0, y: 9 }, size: { width: 9, height: 4 }, lgSreenStyle: { textAlign: "left" } } }}),
    templateElement("a", "Bag", 49, 2, 3, 4, { linkTarget: cartTarget, fontSize: 10, weight: 600, color: theme.accent, textAlign: "right", responsiveStyles: { tablet: { position: { x: 22, y: 12 }, size: { width: 20, height: 4 } }, mobile: { position: { x: 12, y: 9 }, size: { width: 10, height: 4 }, lgSreenStyle: { textAlign: "left" } } }}),
  ];
  return component("Footer", 3, y.desktop, 52, 8, theme, children, {
    isComponentRoot: true, componentKind: "footer",
    backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 0, borderStyle: "solid",
    lgSreenStyle: { padding: 0, color: theme.ink, borderTop: `1px solid ${theme.line}` },
    tablet: { position: { x: 2, y: y.tablet }, size: { width: 42, height: 18 } },
    mobile: { position: { x: 1, y: y.mobile }, size: { width: 22, height: 15 } },
  });
}

export function createTestimonialComponent({ quote, author, theme, y }: {
  quote: string; author: string; theme: TemplateTheme; y: { desktop: number; tablet: number; mobile: number };
}): ElementAttr {
  const children = [
    templateElement("p", "A NOTE FROM OUR CUSTOMERS", 2, 2, 48, 3, { fontSize: 9, weight: 700, color: theme.accent, responsiveStyles: { tablet: { size: { width: 38, height: 3 } }, mobile: { position: { x: 1, y: 2 }, size: { width: 20, height: 3 } } } }),
    templateElement("h2", `“${quote}”`, 2, 6, 48, 9, { fontSize: 20, weight: 650, color: theme.ink, lgSreenStyle: { padding: 2, fontSize: 20, fontWeight: 650, color: theme.ink, lineHeight: 1.35 }, responsiveStyles: { tablet: { size: { width: 40, height: 10 }, lgSreenStyle: { fontSize: 18 } }, mobile: { position: { x: 1, y: 6 }, size: { width: 20, height: 10 }, lgSreenStyle: { fontSize: 16 } } } }),
    templateElement("p", author, 2, 16, 48, 3, { fontSize: 10, weight: 650, color: theme.muted, responsiveStyles: { tablet: { size: { width: 38, height: 3 } }, mobile: { position: { x: 1, y: 17 }, size: { width: 20, height: 3 } } } }),
  ];
  return component("Customer note", 3, y.desktop, 52, 21, theme, children, {
    isComponentRoot: true, componentKind: "testimonial",
    backgroundColor: theme.soft, borderRadius: { radiusTL: 2, radiusTR: 2, radiusBL: 2, radiusBR: 2 }, lgSreenStyle: { padding: 0, borderRadius: 16 },
    tablet: { position: { x: 2, y: y.tablet }, size: { width: 42, height: 22 } },
    mobile: { position: { x: 1, y: y.mobile }, size: { width: 22, height: 22 } },
  });
}

export function createCartComponent({ products, checkoutTarget, shopTarget, theme, y }: {
  products: TemplateProduct[]; checkoutTarget: string; shopTarget: string; theme: TemplateTheme;
  y: { desktop: number; tablet: number; mobile: number };
}): ElementAttr {
  const children: ElementAttr[] = [
    templateElement("h1", "Your bag", 0, 0, 52, 6, { fontSize: 30, weight: 750, color: theme.ink, responsiveStyles: { tablet: { size: { width: 44, height: 6 } }, mobile: { size: { width: 22, height: 6 }, lgSreenStyle: { fontSize: 24 } } } }),
    templateElement("p", "A few thoughtful picks, ready when you are.", 0, 6, 52, 4, { fontSize: 12, color: theme.muted, responsiveStyles: { tablet: { size: { width: 44, height: 4 } }, mobile: { size: { width: 22, height: 4 }, lgSreenStyle: { fontSize: 10 } } } }),
  ];
  products.slice(0, 3).forEach((product, index) => {
    const desktopY = 13 + index * 14;
    const row = component(product.name, 0, desktopY, 32, 12, theme, [
      templateElement("img", product.image, 0, 0, 10, 12, { lgSreenStyle: { padding: 0, objectFit: "cover", borderRadius: 8 }, responsiveStyles: { tablet: { size: { width: 9, height: 12 } }, mobile: { size: { width: 7, height: 13 } } } }),
      templateElement("h3", product.name, 11, 1, 12, 4, { fontSize: 12, weight: 700, color: theme.ink, responsiveStyles: { tablet: { position: { x: 10, y: 1 }, size: { width: 17, height: 4 } }, mobile: { position: { x: 8, y: 1 }, size: { width: 13, height: 4 } } } }),
      templateElement("p", "Qty 1 · Edit", 11, 6, 13, 3, { fontSize: 9, color: theme.muted, responsiveStyles: { tablet: { position: { x: 10, y: 6 }, size: { width: 10, height: 3 } }, mobile: { position: { x: 8, y: 6 }, size: { width: 13, height: 3 } } } }),
      templateElement("p", product.price, 24, 1, 7, 4, { fontSize: 11, weight: 700, color: theme.ink, textAlign: "right", responsiveStyles: { tablet: { position: { x: 21, y: 6 }, size: { width: 6, height: 4 } }, mobile: { position: { x: 8, y: 10 }, size: { width: 13, height: 3 }, lgSreenStyle: { textAlign: "left" } } } }),
    ], {
      backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1, borderStyle: "solid",
      lgSreenStyle: { padding: 0, borderRadius: 12, border: `1px solid ${theme.line}`, overflow: "hidden" },
      tablet: { position: { x: 0, y: desktopY }, size: { width: 27, height: 12 } },
      mobile: { position: { x: 0, y: 13 + index * 15 }, size: { width: 22, height: 14 } },
    });
    children.push(row);
  });
  children.push(component("Order summary", 34, 13, 18, 34, theme, [
    templateElement("h2", "Order summary", 1, 1, 16, 4, { fontSize: 15, weight: 700, color: theme.ink, responsiveStyles: { tablet: { size: { width: 13, height: 4 } }, mobile: { size: { width: 20, height: 4 } } } }),
    templateElement("p", "Subtotal", 1, 8, 10, 4, { fontSize: 10, color: theme.muted, responsiveStyles: { tablet: { size: { width: 6, height: 4 } }, mobile: { size: { width: 10, height: 4 } } } }),
    templateElement("p", "R 1,030", 11, 8, 6, 4, { fontSize: 10, weight: 700, color: theme.ink, textAlign: "right", responsiveStyles: { tablet: { position: { x: 8, y: 8 }, size: { width: 6, height: 4 } }, mobile: { position: { x: 14, y: 8 }, size: { width: 7, height: 4 } } } }),
    templateElement("p", "Delivery calculated at checkout", 1, 14, 16, 6, { fontSize: 9, color: theme.muted, responsiveStyles: { tablet: { size: { width: 13, height: 6 } }, mobile: { size: { width: 20, height: 4 } } } }),
    templateElement("button", "Continue to checkout", 1, 23, 16, 5, { linkTarget: checkoutTarget, fontSize: 10, weight: 700, color: "#fff", backgroundColor: theme.accent, borderRadius: { radiusTL: 2, radiusTR: 2, radiusBL: 2, radiusBR: 2 }, responsiveStyles: { tablet: { size: { width: 13, height: 5 } }, mobile: { position: { x: 1, y: 15 }, size: { width: 20, height: 5 } } } }),
    templateElement("a", "Continue shopping", 1, 29, 16, 4, { linkTarget: shopTarget, fontSize: 9, weight: 600, color: theme.accent, textAlign: "center", responsiveStyles: { tablet: { size: { width: 13, height: 4 } }, mobile: { position: { x: 1, y: 21 }, size: { width: 20, height: 4 } } } }),
  ], {
    backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1, borderStyle: "solid",
    lgSreenStyle: { padding: 0, borderRadius: 14, border: `1px solid ${theme.line}` },
    tablet: { position: { x: 29, y: 13 }, size: { width: 15, height: 34 } },
    mobile: { position: { x: 0, y: 16 + Math.min(products.length, 3) * 15 }, size: { width: 22, height: 28 } },
  }));
  children.push(templateElement("p", "Secure checkout · Easy returns · Friendly support", 0, 51, 32, 4, { fontSize: 10, color: theme.muted, responsiveStyles: { mobile: { position: { x: 0, y: 47 + Math.min(products.length, 3) * 15 }, size: { width: 22, height: 5 }, lgSreenStyle: { fontSize: 9 } } } }));
  const mobileHeight = 54 + Math.min(products.length, 3) * 15;
  return component("Cart", 3, y.desktop, 52, 57, theme, children, {
    isComponentRoot: true, componentKind: "cart",
    tablet: { position: { x: 1, y: y.tablet }, size: { width: 44, height: 58 } },
    mobile: { position: { x: 1, y: y.mobile }, size: { width: 22, height: mobileHeight } },
  });
}

export function createCheckoutComponent({ products, theme, y }: {
  products: TemplateProduct[]; theme: TemplateTheme; y: { desktop: number; tablet: number; mobile: number };
}): ElementAttr {
  const children: ElementAttr[] = [
    templateElement("h1", "Checkout", 0, 0, 52, 6, { fontSize: 30, weight: 750, color: theme.ink, responsiveStyles: { tablet: { size: { width: 44, height: 6 } }, mobile: { size: { width: 22, height: 6 }, lgSreenStyle: { fontSize: 24 } } } }),
    templateElement("p", "Your details stay with this business. We’ll confirm your order by email.", 0, 6, 52, 4, { fontSize: 12, color: theme.muted, responsiveStyles: { tablet: { size: { width: 44, height: 4 } }, mobile: { size: { width: 22, height: 5 }, lgSreenStyle: { fontSize: 10 } } } }),
  ];
  const input = (label: string, placeholder: string, y: number, type: "text" | "email" = "text") => [
    templateElement("p", label, 0, y, 30, 3, { fontSize: 10, weight: 650, color: theme.muted, responsiveStyles: { tablet: { size: { width: 26, height: 3 } }, mobile: { size: { width: 22, height: 3 } } } }),
    templateElement("input", placeholder, 0, y + 3, 30, 5, { inputType: type, backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1, borderStyle: "solid", responsiveStyles: { tablet: { size: { width: 26, height: 5 } }, mobile: { size: { width: 22, height: 5 } } } }),
  ];
  children.push(...input("Email address", "you@example.com", 13, "email"), ...input("Full name", "Your name", 22), ...input("Delivery address", "Street and number", 31), ...input("City and postal code", "Cape Town · 8001", 40));
  children.push(component("Payment summary", 33, 13, 19, 35, theme, [
    templateElement("h2", "Your order", 1, 1, 17, 4, { fontSize: 15, weight: 700, color: theme.ink, responsiveStyles: { tablet: { size: { width: 14, height: 4 } }, mobile: { size: { width: 20, height: 4 } } } }),
    ...products.slice(0, 3).map((product, index) => templateElement("p", `${product.name} · ${product.price}`, 1, 7 + index * 5, 17, 4, { fontSize: 9, color: theme.muted, responsiveStyles: { tablet: { size: { width: 14, height: 4 } }, mobile: { size: { width: 20, height: 4 } } } })),
    templateElement("p", "Total · R 1,030", 1, 25, 17, 4, { fontSize: 11, weight: 700, color: theme.ink, responsiveStyles: { tablet: { size: { width: 14, height: 4 } }, mobile: { position: { x: 1, y: 21 }, size: { width: 20, height: 4 } } } }),
    templateElement("button", "Place demo order", 1, 29, 17, 5, { linkTarget: "mailto:orders@example.com?subject=New%20website%20order", fontSize: 10, weight: 700, color: "#fff", backgroundColor: theme.accent, borderRadius: { radiusTL: 2, radiusTR: 2, radiusBL: 2, radiusBR: 2 }, responsiveStyles: { tablet: { size: { width: 14, height: 5 } }, mobile: { position: { x: 1, y: 27 }, size: { width: 20, height: 5 } } } }),
  ], {
    backgroundColor: theme.surface, borderColor: theme.line, borderWidth: 1, borderStyle: "solid",
    lgSreenStyle: { padding: 0, borderRadius: 14, border: `1px solid ${theme.line}` },
    tablet: { position: { x: 28, y: 13 }, size: { width: 16, height: 35 } },
    mobile: { position: { x: 0, y: 51 }, size: { width: 22, height: 34 } },
  }));
  children.push(templateElement("p", "This starter includes a sample checkout. Connect a payment provider before accepting live payments.", 0, 51, 30, 7, { fontSize: 9, color: theme.muted, responsiveStyles: { tablet: { position: { x: 0, y: 51 }, size: { width: 26, height: 7 } }, mobile: { position: { x: 0, y: 88 }, size: { width: 22, height: 7 } } } }));
  return component("Checkout details", 3, y.desktop, 52, 62, theme, children, {
    isComponentRoot: true, componentKind: "checkout",
    tablet: { position: { x: 1, y: y.tablet }, size: { width: 44, height: 62 } },
    mobile: { position: { x: 1, y: y.mobile }, size: { width: 22, height: 98 } },
  });
}

export function responsiveHeight(elements: Record<string, ElementAttr>, device?: ResponsiveDevice): number {
  return Math.max(70, ...Object.values(elements).map(element => {
    const override = device ? element.responsiveStyles?.[device] : undefined;
    const position = override?.position || element.position;
    const size = override?.size || element.size;
    return (position.y || 0) + (size?.height || 0);
  })) + 10;
}
