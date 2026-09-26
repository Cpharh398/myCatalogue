import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useParams } from "react-router";
import type { ElementAttr, ResponsiveDevice } from "~/util/types";
import { CurrentState } from "~/util/types";
import { CanvasElement } from "~/components/CanvasElement";
import { CANVAS_GRID_WIDTHS } from "~/util/layoutUnits";
import type { SitePage } from "~/util/siteTemplates";

type PublishedSiteData = { name: string; slug: string; pages: SitePage[] };
const ignoreElementUpdates: Dispatch<SetStateAction<Record<string, ElementAttr>>> = () => {};

function withDeviceStyles(elements: Record<string, ElementAttr>, device: ResponsiveDevice | null): Record<string, ElementAttr> {
  return Object.fromEntries(Object.entries(elements).map(([id, element]) => {
    const style = device ? element.responsiveStyles?.[device] || {} : {};
    const { hidden, lgSreenStyle, ...overrides } = style;
    return [id, {
      ...element,
      ...overrides,
      lgSreenStyle: { ...element.lgSreenStyle, ...lgSreenStyle },
      hidden: hidden ?? element.hidden,
      currentState: CurrentState.IDLE,
      showToolBox: false,
      canvasChildren: withDeviceStyles(element.canvasChildren || {}, device),
    }];
  }));
}

export function meta() {
  return [{ title: "Published website · myCatalogue" }];
}

export default function PublishedSite() {
  const { siteSlug = "" } = useParams();
  const [site, setSite] = useState<PublishedSiteData | null>(null);
  const [error, setError] = useState("");
  const [activePageId, setActivePageId] = useState("");
  const [viewportWidth, setViewportWidth] = useState(0);
  const selectedTarget = useRef<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/sites/${encodeURIComponent(siteSlug)}`)
      .then(async response => {
        if (!response.ok) throw new Error("This published site could not be found. Publish it from the editor first.");
        return response.json() as Promise<PublishedSiteData>;
      })
      .then(data => { if (alive) { setSite(data); setActivePageId(data.pages[0]?.id || ""); document.title = `${data.name} · myCatalogue`; } })
      .catch(reason => { if (alive) setError(reason instanceof Error ? reason.message : "Unable to load this site."); });
    return () => { alive = false; };
  }, [siteSlug]);

  useEffect(() => {
    const measure = () => setViewportWidth(window.innerWidth);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const device: ResponsiveDevice | null = viewportWidth > 0 && viewportWidth <= 640 ? "mobile" : viewportWidth > 0 && viewportWidth <= 1024 ? "tablet" : null;
  const page = site?.pages.find(item => item.id === activePageId) || site?.pages[0];
  const elements = useMemo(() => withDeviceStyles(page?.elements || {}, device), [page, device]);
  const gridWidth = CANVAS_GRID_WIDTHS[device || "desktop"];
  const width = stageRef.current?.clientWidth || viewportWidth || 960;
  const scale = width / gridWidth;
  const bottom = Math.max(0, ...Object.values(elements).map(element => (element.position.y || 0) + (element.size?.height || 0)));
  const stageHeight = Math.max(typeof window !== "undefined" ? window.innerHeight : 800, (bottom + 4) * scale);
  const gridHeight = stageHeight / scale;

  const navigate = (target: string) => {
    if (/^(https?:|mailto:|tel:)/i.test(target)) { window.location.assign(target); return; }
    if (target.startsWith("#")) { document.getElementById(target.slice(1))?.scrollIntoView({ behavior: "smooth" }); return; }
    if (site?.pages.some(item => item.id === target)) {
      setActivePageId(target);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (error) return <main className="grid min-h-screen place-items-center bg-[#f5f6f4] px-6 text-[#243027]"><div className="max-w-md rounded-2xl border border-[#e0e5de] bg-white p-7 shadow-sm"><p className="text-xs font-semibold uppercase tracking-widest text-[#718074]">myCatalogue</p><h1 className="mt-3 text-2xl font-semibold">Site unavailable</h1><p className="mt-2 text-sm leading-6 text-[#68746a]">{error}</p><a href="/myworkspace" className="mt-5 inline-flex rounded-lg bg-[#315b45] px-4 py-2.5 text-sm font-semibold text-white">Back to workspace</a></div></main>;
  if (!site || !page) return <main className="grid min-h-screen place-items-center bg-[#f5f6f4] text-sm text-[#68746a]">Loading website…</main>;

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#243027]">
      <div ref={stageRef} className="relative mx-auto w-full max-w-[1440px]" data-grid-width={gridWidth} style={{ height: stageHeight }}>
        {Object.entries(elements).map(([id, element]) => (
          <CanvasElement
            key={id}
            id={id}
            element={element}
            elements={elements}
            setElements={ignoreElementUpdates}
            selectedTarget={selectedTarget}
            selectedElement=""
            guide={[]}
            setGuide={() => {}}
            isPreview
            onNavigate={navigate}
            canvasGridWidth={gridWidth}
            canvasGridHeight={gridHeight}
            responsiveDevice={device || "desktop"}
          />
        ))}
      </div>
    </main>
  );
}
