import { useEffect, useRef, useState } from "react";
import type React from "react";
import { BookOpen, LayoutDashboard, Plus, Rocket, Store, WandSparkles, ShoppingBag, Trash2, Package, History, Component, Save } from "lucide-react";
import { Toolbar } from "~/components/appToolBar";
import { CanvasElement } from "~/components/CanvasElement";
import { ControlPanel } from "~/components/controlUnit";
import { AlignmentGuidesOverlay } from "~/components/guidLines";
import { HandleControlPanelPointerDown, HandleControlPanelPointerUp, HandlePointerMove } from "~/features/controlPanel/service";
import { handlePointerMove, handlePointerDownContainer, handlePointerUp, removeElement, } from "~/features/pageEditing/service"
import { findInTree, getContainerRelativePosition, removeElementFromTree, updateElementStyle } from "~/features/util";
import { useCanvasKeybindings } from "~/hooks/useCanvasKeyBindings";
import { type ActiveToolType, type AlignmentGuide, type ElementAttr, type HoveredElementType, type Position, type ResponsiveDevice, CurrentState, Modes } from "~/util/types"
import { createSiteTemplate, siteStarters, type StarterTemplateId } from "~/util/siteTemplates";
import { createReusableComponent, reusablePresets, type ReusablePresetId } from "~/util/reusableComponents";
import { readSiteProjects, saveSiteProject } from "~/util/siteStorage";

const responsiveFields = ["position", "size", "lgSreenStyle", "backgroundColor", "borderRadius", "borderColor", "borderWidth", "borderStyle", "useGradient", "gradientStart", "gradientEnd", "gradientAngle", "hidden"] as const;

function applyResponsiveStyles(elements: Record<string, ElementAttr>, device: ResponsiveDevice): Record<string, ElementAttr> {
  return Object.fromEntries(Object.entries(elements).map(([id, element]) => {
    const style = element.responsiveStyles?.[device] || {};
    const { hidden, ...override } = style;
    return [id, { ...element, ...override, hidden: hidden ?? element.hidden, canvasChildren: element.canvasChildren ? applyResponsiveStyles(element.canvasChildren, device) : {} }];
  }));
}

function persistResponsiveStyles(
  base: Record<string, ElementAttr>, previous: Record<string, ElementAttr>, next: Record<string, ElementAttr>, device: ResponsiveDevice,
): Record<string, ElementAttr> {
  const result: Record<string, ElementAttr> = {};
  for (const [id, edited] of Object.entries(next)) {
    const original = base[id];
    const prior = previous[id];
    if (!original || !prior) { result[id] = edited; continue; }
    const updated = { ...original } as ElementAttr;
    for (const key of Object.keys(edited) as (keyof ElementAttr)[]) {
      if ((responsiveFields as readonly string[]).includes(key) || key === "responsiveStyles" || key === "canvasChildren") continue;
      if (JSON.stringify(edited[key]) !== JSON.stringify(prior[key])) (updated as any)[key] = edited[key];
    }
    const deviceStyle: Record<string, unknown> = { ...(original.responsiveStyles?.[device] || {}) };
    for (const key of responsiveFields) {
      if (JSON.stringify(edited[key]) !== JSON.stringify(prior[key])) deviceStyle[key] = edited[key];
    }
    updated.responsiveStyles = { ...original.responsiveStyles, [device]: deviceStyle };
    updated.canvasChildren = persistResponsiveStyles(original.canvasChildren || {}, prior.canvasChildren || {}, edited.canvasChildren || {}, device);
    result[id] = updated;
  }
  return result;
}



export function Canvas() {
  type CatalogueEntry = { id: string; name: string; kind: "Product" | "Service"; price: string; description: string };
  type CustomComponent = { id: string; name: string; elements: Record<string, ElementAttr> };
  type SavedVersion = { id: string; name: string; pageId: string; createdAt: number; elements: Record<string, ElementAttr> };

  const [elements, setElements] = useState<Record<string, ElementAttr>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("mycatalogue-elements") || "{}"); } catch { return {}; }
  });
  const [pages, setPages] = useState<{id:string;name:string;elements:Record<string,ElementAttr>}[]>(() => {
    if (typeof window === "undefined") return [{id:"home",name:"Home",elements:{}}];
    try { return JSON.parse(localStorage.getItem("mycatalogue-pages") || "null") || [{id:"home",name:"Home",elements:{}}]; } catch { return [{id:"home",name:"Home",elements:{}}]; }
  });
  const [activePage, setActivePage] = useState(() => typeof window === "undefined" ? "home" : localStorage.getItem("mycatalogue-active") || "home");
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [siteName, setSiteName] = useState(() => typeof window === "undefined" ? "Untitled site" : localStorage.getItem("mycatalogue-site-name") || "Untitled site");
  const [pageHeight, setPageHeight] = useState(100);
  const [isPreview, setIsPreview] = useState(false);
  const [catalogue, setCatalogue] = useState<CatalogueEntry[]>(() => { if (typeof window === "undefined") return []; try { return JSON.parse(localStorage.getItem("mycatalogue-catalogue") || "[]"); } catch { return []; } });
  const [activeSidebar, setActiveSidebar] = useState<"pages" | "catalogue" | "library" | null>(null);
  const [showCatalogueForm, setShowCatalogueForm] = useState(false);
  const [editingCatalogueId, setEditingCatalogueId] = useState<string | null>(null);
  const [catalogueDraft, setCatalogueDraft] = useState({ name: "", kind: "Product" as "Product" | "Service", price: "", description: "" });
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [responsiveEditDevice, setResponsiveEditDevice] = useState<ResponsiveDevice | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedIdsRef = useRef<string[]>([]);
  selectedIdsRef.current = selectedIds;
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);
  const undoStack = useRef<Record<string, ElementAttr>[]>([]);
  const redoStack = useRef<Record<string, ElementAttr>[]>([]);
  const lastElements = useRef(elements);
  const pendingHistory = useRef<Record<string, ElementAttr> | null>(null);
  const historyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipHistory = useRef(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versions, setVersions] = useState<SavedVersion[]>(() => { if (typeof window === "undefined") return []; try { return JSON.parse(localStorage.getItem("mycatalogue-versions") || "[]"); } catch { return []; } });
  const [customComponents, setCustomComponents] = useState<CustomComponent[]>(() => { if (typeof window === "undefined") return []; try { return JSON.parse(localStorage.getItem("mycatalogue-components") || "[]"); } catch { return []; } });
  const [componentName, setComponentName] = useState("");
  useEffect(() => {
    localStorage.setItem("mycatalogue-elements", JSON.stringify(elements));
    localStorage.setItem("mycatalogue-site-name", siteName);
    localStorage.setItem("mycatalogue-updated", new Date().toISOString());
    setPages(old => old.map(page => page.id === activePage ? { ...page, elements } : page));
  }, [elements, activePage, siteName]);
  useEffect(() => { localStorage.setItem("mycatalogue-pages", JSON.stringify(pages)); localStorage.setItem("mycatalogue-active", activePage); }, [pages, activePage]);
  useEffect(() => {
    const currentPages = pages.map(page => page.id === activePage ? { ...page, elements } : page);
    const currentSiteId = localStorage.getItem("mycatalogue-current-site") || readSiteProjects()[0]?.id || "site-browser";
    localStorage.setItem("mycatalogue-current-site", currentSiteId);
    saveSiteProject({
      id: currentSiteId,
      name: siteName,
      pages: currentPages,
      activePageId: activePage,
      updatedAt: new Date().toISOString(),
      templateId: (localStorage.getItem("mycatalogue-site-template") || undefined) as StarterTemplateId | undefined,
    });
  }, [pages, elements, activePage, siteName]);
  useEffect(() => { localStorage.setItem("mycatalogue-catalogue", JSON.stringify(catalogue)); }, [catalogue]);
  useEffect(() => { localStorage.setItem("mycatalogue-versions", JSON.stringify(versions)); }, [versions]);
  useEffect(() => { localStorage.setItem("mycatalogue-components", JSON.stringify(customComponents)); }, [customComponents]);
  const displayElements = responsiveEditDevice ? applyResponsiveStyles(elements, responsiveEditDevice) : elements;
  const setCanvasElements: React.Dispatch<React.SetStateAction<Record<string, ElementAttr>>> = action => {
    if (!responsiveEditDevice) { setElements(action); return; }
    setElements(base => {
      const previous = applyResponsiveStyles(base, responsiveEditDevice);
      const next = typeof action === "function" ? action(previous) : action;
      return persistResponsiveStyles(base, previous, next, responsiveEditDevice);
    });
  };
  useEffect(() => {
    if (skipHistory.current) { skipHistory.current = false; lastElements.current = elements; return; }
    if (JSON.stringify(lastElements.current) === JSON.stringify(elements)) return;
    if (!pendingHistory.current) pendingHistory.current = lastElements.current;
    lastElements.current = elements;
    if (historyTimer.current) clearTimeout(historyTimer.current);
    historyTimer.current = setTimeout(() => {
      if (pendingHistory.current) undoStack.current = [...undoStack.current.slice(-59), pendingHistory.current];
      pendingHistory.current = null; redoStack.current = []; setUndoCount(undoStack.current.length); setRedoCount(0);
    }, 350);
  }, [elements]);
  const commitPendingHistory = () => {
    if (historyTimer.current) clearTimeout(historyTimer.current);
    if (pendingHistory.current) undoStack.current = [...undoStack.current.slice(-59), pendingHistory.current];
    pendingHistory.current = null; setUndoCount(undoStack.current.length);
  };
  const undo = () => { commitPendingHistory(); const previous = undoStack.current.pop(); if (!previous) return; redoStack.current.push(elements); skipHistory.current = true; lastElements.current = previous; setElements(previous); setUndoCount(undoStack.current.length); setRedoCount(redoStack.current.length); };
  const redo = () => { const next = redoStack.current.pop(); if (!next) return; undoStack.current.push(elements); skipHistory.current = true; lastElements.current = next; setElements(next); setUndoCount(undoStack.current.length); setRedoCount(redoStack.current.length); };
  const saveVersion = () => { const version: SavedVersion = { id: crypto.randomUUID(), name: "Version " + new Date().toLocaleString(), pageId: activePage, createdAt: Date.now(), elements: structuredClone(elements) }; setVersions(old => [version, ...old].slice(0, 30)); };
  const restoreVersion = (version: SavedVersion) => { commitPendingHistory(); const targetPage = pages.some(page => page.id === version.pageId) ? version.pageId : activePage; setPages(old => old.map(page => page.id === activePage ? { ...page, elements } : page)); setActivePage(targetPage); setElements(structuredClone(version.elements)); setHistoryOpen(false); };
  const saveSelectionAsComponent = () => {
    const chosen = Object.entries(elements).filter(([id]) => selectedIds.includes(id));
    if (!componentName.trim() || chosen.length === 0) return;
    const minX = Math.min(...chosen.map(([, element]) => element.position.x || 0));
    const minY = Math.min(...chosen.map(([, element]) => element.position.y || 0));
    const stored: Record<string, ElementAttr> = {};
    for (const [id, element] of chosen) stored[id] = { ...structuredClone(element), position: { x: (element.position.x || 0) - minX, y: (element.position.y || 0) - minY }, currentState: CurrentState.IDLE, showToolBox: false };
    setCustomComponents(old => [{ id: crypto.randomUUID(), name: componentName.trim(), elements: stored }, ...old]);
    setComponentName("");
  };
  const addCustomComponentToPage = (component: CustomComponent) => {
    const maxY = Math.max(4, ...Object.values(elements).map(element => (element.position.y || 0) + (element.size?.height || 0) + 2));
    const additions: Record<string, ElementAttr> = {};
    Object.values(component.elements).forEach(element => { const id = crypto.randomUUID(); additions[id] = { ...structuredClone(element), position: { x: (element.position.x || 0) + 4, y: (element.position.y || 0) + maxY }, currentState: CurrentState.IDLE, showToolBox: false }; });
    setCanvasElements(old => ({ ...old, ...additions }));
  };
  const addReusableComponentToPage = (preset: ReusablePresetId) => {
    const top = Math.max(5, ...Object.values(displayElements).map(element => (element.position.y || 0) + (element.size?.height || 0) + 3));
    const additions = createReusableComponent(preset, top);
    setCanvasElements(old => ({ ...old, ...additions }));
    setActiveSidebar(null);
  };
  const selectElement = (id: string, additive: boolean) => {
    if (additive) setSelectedIds(old => old.includes(id) ? old.filter(item => item !== id) : [...old, id]);
    else setSelectedIds([id]);
    selectedTarget.current = id; lastSelected.current = id;
  };
  const switchPage = (id:string) => {
    setPages(old => old.map(page => page.id === activePage ? {...page,elements} : page));
    const target = pages.find(page => page.id === id); setElements(target?.elements || {}); setActivePage(id);
    selectedTarget.current = null; lastSelected.current = null;
  };
  const addPage = (name:string, content:Record<string,ElementAttr> = {}) => {
    const id = "page-" + Date.now(); setPages(old => [...old.map(page => page.id === activePage ? {...page,elements} : page), {id,name,elements:content}]);
    setElements(content); setActivePage(id); setShowTemplates(false);
  };
  const addCatalogueEntryToPage = (entry: CatalogueEntry) => {
    const id = crypto.randomUUID();
    const top = Math.max(12, ...Object.values(elements).map(element => (element.position.y || 0) + (element.size?.height || 0) + 2));
    const next: ElementAttr = {
      elementTag: "p", content: entry.name + "\n" + entry.kind + " · " + entry.price + "\n" + entry.description,
      position: { x: 8 + (Object.keys(elements).length % 3) * 29, y: top }, size: { width: 26, height: 14 },
      borderRadius: { radiusTL: 8, radiusTR: 8, radiusBL: 8, radiusBR: 8 }, borderColor: "#e2e8f0", borderWidth: 1, borderStyle: "solid",
      backgroundColor: "#ffffff", useGradient: false, gradientStart: "#fff", gradientEnd: "#fff", gradientAngle: 0,
      currentState: CurrentState.IDLE, transformOrigin: "center", zIndex: 1, canvasChildren: {}, sectionName: entry.name, sectionId: "section-" + id,
      lgSreenStyle: { padding: 14, textAlign: "left", fontSize: 16, color: "#252820", whiteSpace: "pre-line", boxShadow: "0 6px 18px rgba(15,23,42,.08)" },
    };
    setElements(previous => ({ ...previous, [id]: next }));
  };
  const navigateTo = (target: string) => {
    if (/^(https?:|mailto:|tel:)/i.test(target)) { window.location.assign(target); return; }
    if (target.startsWith("#")) {
      const anchor = document.getElementById(target.slice(1));
      anchor?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    switchPage(target);
  };
  const chooseTemplate = (templateId: StarterTemplateId) => {
    const starter = siteStarters.find(item => item.id === templateId)!;
    const generated = createSiteTemplate(templateId);
    const isBlank = pages.length === 1 && Object.keys(elements).length === 0 && Object.keys(pages[0]?.elements || {}).length === 0;
    if (isBlank) {
      setPages(generated.pages);
      setActivePage(generated.pages[0].id);
      setElements(generated.pages[0].elements);
      setSiteName(generated.siteName);
    } else {
      const ids = Object.fromEntries(generated.pages.map(page => [page.id, `${page.id}-${Date.now().toString(36)}`]));
      const addedPages = generated.pages.map(page => ({ ...page, id: ids[page.id], elements: Object.fromEntries(Object.entries(page.elements).map(([id, element]) => [id, { ...element, linkTarget: element.linkTarget ? (ids[element.linkTarget] || element.linkTarget) : undefined }])) }));
      setPages(old => [...old, ...addedPages]);
      setActivePage(addedPages[0].id);
      setElements(addedPages[0].elements);
      setSiteName(generated.siteName);
    }
    localStorage.setItem("mycatalogue-site-template", starter.id);
    setShowTemplates(false);
  };
  const [elementState, setElementState] = useState<CurrentState>(CurrentState.DRAG);
  const [guide, setGuide] = useState<AlignmentGuide[]>([]);
  const [activeTool, setActiveTool] = useState<ActiveToolType>({tool:Modes.GRAB});
  const selectedMode = useRef<Modes>(Modes.GRAB);
  const selectedTarget = useRef<string | null>(null);
  const lastSelected = useRef<string | null>(null);
  const pointerOffset = useRef<Position>({ x: 0, y: 0 });
  const selectedResizeBorder = useRef<string | null>(null);
  const cursorStyle = useRef<"cursor-ns-resize" | "cursor-ew-resize" | "cursor-nwse-resize" | "cursor-nesw-resize" | null>(null);
  const currentHovered = useRef<HoveredElementType | null>(null);
  const currentDragged = useRef<string | null>(null);
  const zIndexUpdated = useRef<boolean>(false);
  
  const [controlPanelPosition, setControlPanelPosition] = useState<Position>({ x:0, y:0 }) 
  const [iscontrolPanelVisible, setIscontrolPanelVisible] = useState<Boolean>(true) 
  const isControlPanelSelected = useRef<boolean>(false);
  
  useCanvasKeybindings({
    selectedTarget: lastSelected,
    setElements,
    selectedTargets: selectedIdsRef,
    onUndo: undo,
    onRedo: redo,
    clearSelection: () => { setSelectedIds([]); selectedTarget.current = null; lastSelected.current = null; },
  });


  const handleDelinkeElement = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();

    setElements((prev)=>{
       
      if(!lastSelected.current) return prev;
      let nextState: Record<string, ElementAttr>;

      let currentElement = findInTree(prev, lastSelected.current!);
      const updatedElements = removeElementFromTree({ elements: prev, targetId:lastSelected.current! });

      if(!updatedElements || !currentElement)return prev;
      const absoluteCanvasPosition = getCanvasRelativePosition(elements, currentElement);

      currentElement = {
        ...currentElement,
        position: absoluteCanvasPosition,
        currentStateInTree:{
          isChildElement:false,
          parentElementID:null
        }
      }

      nextState = { ...updatedElements, [lastSelected.current!]: currentElement  };
      return nextState;    
    });
  }


 function getCanvasRelativePosition(
  elements: Record<string, ElementAttr>,
  currentElement:ElementAttr | null

): { x: number; y: number } {
  if(!currentElement)return { x:0, y:0 }

  const currentX = currentElement.position?.x ?? 0;
  const currentY = currentElement.position?.y ?? 0;

  const isChild = currentElement.currentStateInTree?.isChildElement;
  const parentId = currentElement.currentStateInTree?.parentElementID;

  if (isChild && parentId) {
    const parentElement = findInTree(elements, parentId) ?? null;
    const parentOffset = getCanvasRelativePosition(elements, parentElement);
    return {
      x: parentXToCanvas(currentX, parentOffset.x),
      y: parentYToCanvas(currentY, parentOffset.y),
    };
  }

  return { x: currentX, y: currentY };
}

function parentXToCanvas(childX: number, parentX: number): number {
  return parentX + childX;
}

function parentYToCanvas(childY: number, parentY: number): number {
  return parentY + childY;
}
  
  
  const toolbarSectionPanel = activeSidebar ? (
    <div className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between px-2"><div className="text-[11px] uppercase tracking-widest text-slate-400">{activeSidebar === "pages" ? "Pages" : activeSidebar === "catalogue" ? "Shop catalogue" : "Component library"}</div><button onClick={()=>setActiveSidebar(null)} className="text-slate-400 hover:text-slate-900">×</button></div>
        {activeSidebar === "catalogue" ? <><div className="flex items-center justify-between px-2 mt-2"><div className="text-[11px] uppercase tracking-widest text-slate-400">Products & services</div><button onClick={()=>{setEditingCatalogueId(null);setCatalogueDraft({name:"",kind:"Product",price:"",description:""});setShowCatalogueForm(true)}} title="Add catalogue item" className="rounded-md p-1 hover:bg-slate-100"><Plus size={16}/></button></div><p className="px-2 text-[11px] text-slate-400">Add an item here, then place it on a page.</p>{catalogue.map(item=><div key={item.id} className="rounded-lg border border-slate-200 p-2.5"><div className="flex gap-2 items-start"><Package size={15} className="text-slate-400 mt-0.5"/><div className="min-w-0 flex-1"><div className="text-xs font-medium truncate">{item.name}</div><div className="text-[10px] text-slate-500">{item.kind} · {item.price}</div></div><button onClick={()=>{setEditingCatalogueId(item.id);setCatalogueDraft({name:item.name,kind:item.kind,price:item.price,description:item.description});setShowCatalogueForm(true)}} title="Edit item" className="text-xs text-slate-400 hover:text-slate-900">Edit</button><button onClick={()=>setCatalogue(old=>old.filter(entry=>entry.id!==item.id))} title="Delete item" className="text-slate-400 hover:text-red-500"><Trash2 size={13}/></button></div><button onClick={()=>addCatalogueEntryToPage(item)} className="w-full mt-2 rounded-md bg-slate-100 py-1.5 text-[11px] hover:bg-slate-200">Add to page</button></div>)}{catalogue.length===0&&<div className="px-2 py-4 text-xs text-slate-400">Your catalogue is empty. Add your first product or service.</div>}<button onClick={()=>{setEditingCatalogueId(null);setCatalogueDraft({name:"",kind:"Product",price:"",description:""});setShowCatalogueForm(true)}} className="rounded-lg border border-dashed border-slate-300 py-2 text-xs text-slate-600"><Plus size={14} className="inline mr-1"/>New catalogue item</button></> : activeSidebar === "library" ? <><div className="px-2 mt-2"><div className="text-[11px] uppercase tracking-widest text-slate-400">My components</div><p className="text-[11px] text-slate-400 mt-1">Select several canvas elements with Shift-click, then save them as a reusable component.</p></div><input value={componentName} onChange={e=>setComponentName(e.target.value)} placeholder="Component name" className="border rounded-lg px-2.5 py-2 text-xs"/><button disabled={!componentName.trim()||selectedIds.length===0} onClick={saveSelectionAsComponent} className="rounded-lg bg-slate-900 text-white py-2 text-xs disabled:opacity-40"><Save size={13} className="inline mr-1"/>Save {selectedIds.length || "selected"} as component</button><div className="text-[11px] uppercase tracking-widest text-slate-400 px-2 mt-2">Reusable blocks</div>{reusablePresets.map(preset=><div key={preset.id} className="rounded-lg border border-[#e0e5de] bg-[#fbfcfa] p-2.5"><div className="flex items-start gap-2"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#eaf0e8] text-sm text-[#42634b]">{preset.icon}</span><div><div className="text-xs font-semibold">{preset.name}</div><div className="mt-1 text-[10px] leading-4 text-slate-500">{preset.description}</div></div></div><button onClick={()=>addReusableComponentToPage(preset.id)} className="mt-2 w-full rounded-md bg-[#edf2eb] py-1.5 text-[11px] font-medium text-[#365741] hover:bg-[#e2ebe0]">Add to page</button></div>)}<div className="text-[11px] uppercase tracking-widest text-slate-400 px-2 mt-2">Saved library</div>{customComponents.map(component=><div key={component.id} className="rounded-lg border border-slate-200 p-2.5"><div className="flex items-center gap-2"><Component size={15} className="text-slate-400"/><span className="text-xs font-medium flex-1 truncate">{component.name}</span><button onClick={()=>setCustomComponents(old=>old.filter(item=>item.id!==component.id))} title="Delete component" className="text-slate-400 hover:text-red-500"><Trash2 size={13}/></button></div><div className="text-[10px] text-slate-500 mt-1">{Object.keys(component.elements).length} elements</div><button onClick={()=>addCustomComponentToPage(component)} className="w-full mt-2 rounded-md bg-slate-100 py-1.5 text-[11px] hover:bg-slate-200">Add to page</button></div>)}{customComponents.length===0&&<p className="px-2 py-3 text-xs text-slate-400">Saved components will appear here when you create one from your selected elements.</p>}</> : <>
        <div className="text-[11px] uppercase tracking-widest text-slate-400 px-2 mt-2">Pages</div>
        {pages.map(page=><div key={page.id} className="flex items-center gap-1"><button onClick={()=>switchPage(page.id)} className={`text-left flex-1 px-3 py-2 rounded-lg text-sm ${page.id===activePage?"bg-slate-100 font-medium":"hover:bg-slate-50"}`}>▤ &nbsp;{page.name}</button>{pages.length>1&&<button title="Delete page" onClick={()=>{if(page.id===activePage){const fallback=pages.find(item=>item.id!==page.id)!;setElements(fallback.elements);setActivePage(fallback.id)}setPages(old=>old.filter(item=>item.id!==page.id))}} className="px-2 text-slate-400 hover:text-red-500">×</button>}</div>)}
        <button onClick={()=>addPage("Page "+(pages.length+1))} className="px-3 py-2 text-sm text-slate-500 text-left hover:text-slate-900"><Plus size={15} className="inline mr-2"/>Add blank page</button><button onClick={()=>setShowTemplates(true)} className="rounded-lg border border-dashed border-slate-300 py-2 text-xs text-slate-600"><WandSparkles size={14} className="inline mr-1"/>Add page from template</button>
        <div className="mt-5 border-t pt-4"><label className="text-xs text-slate-500 flex justify-between">Page length <span>{pageHeight}vh</span></label><input type="range" min="100" max="300" step="25" value={pageHeight} onChange={e=>setPageHeight(+e.target.value)} className="w-full mt-2"/><p className="text-[11px] text-slate-400">Add scrollable room for more sections.</p><button onClick={()=>setHistoryOpen(true)} className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-xs hover:bg-slate-50"><History size={14} className="inline mr-2"/>Version history</button></div>
        <button onClick={()=>window.location.assign("/myworkspace")} className="mt-auto text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-sm"><LayoutDashboard size={15} className="inline mr-2"/>My workspace</button>
        </>}

    </div>
  ) : null;

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f5f3ed]">

      <div className="relative h-full w-full pl-[68px] flex min-w-0 overflow-hidden">
      <div
      id="canvas-container"
      onPointerDown={event => {
        if (isPreview) return;
        const target = event.target as HTMLElement;
        const elementNode = target.closest("[data-element-id]");
        if (elementNode && !event.shiftKey && !event.metaKey && !event.ctrlKey) {
          const id = elementNode.getAttribute("data-element-id");
          if (id) selectElement(id, false);
        } else if (!elementNode && target.id === "canvas-container") {
          setSelectedIds([]);
        }
        if (!target.dataset.resizepoint) {
          try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Pointer may already be captured by a resize handle. */ }
        }
        handlePointerDownContainer({ event, lastSelected, elements: displayElements, cursorStyle, setElements: setCanvasElements, selectedMode, selectedTarget, pointerOffset, activeTool, setActiveTool, setElementState, selectedResizeBorder });
      }}
      onPointerMove={event => !isPreview && handlePointerMove({ event, pointerOffset, selectedMode, elements: displayElements, selectedTarget, setElements: setCanvasElements, elementState, selectedResizeBorder, currentHovered, setGuide, zIndexUpdated, currentDragged })}
      onPointerUp={event => !isPreview && handlePointerUp({ event, setGuide, selectedMode, selectedTarget, setElementState, cursorStyle, selectedResizeBorder, setElements: setCanvasElements, currentHovered, elements: displayElements, currentDragged })}
      onPointerCancel={event => { if (isPreview) return; currentHovered.current = null; currentDragged.current = null; handlePointerUp({ event, setGuide, selectedMode, selectedTarget, setElementState, cursorStyle, selectedResizeBorder, setElements: setCanvasElements, currentHovered, elements: displayElements, currentDragged }); }}
      style={{ width: (isPreview || responsiveEditDevice) && previewDevice !== "desktop" ? (previewDevice === "tablet" ? "768px" : "390px") : "100%", maxWidth: "100%", marginInline: "auto", borderLeft: (isPreview || responsiveEditDevice) && previewDevice !== "desktop" ? "1px solid #cbd5e1" : undefined, borderRight: (isPreview || responsiveEditDevice) && previewDevice !== "desktop" ? "1px solid #cbd5e1" : undefined }}
      className={`bg-slate-100 w-full h-full relative overflow-auto select-none  ${cursorStyle.current !== null ? cursorStyle.current : activeTool.tool != Modes.GRAB ? "cursor-crosshair" : ""}`}
    >

      <div className="bg-slate-300/35 pointer-events-none inset-0 absolute" />
      <AlignmentGuidesOverlay guides={guide} />
      {
        !isPreview && lastSelected.current &&
        <ControlPanel
          contolPanelPosition={controlPanelPosition}
          iscontrolPanelVisible={iscontrolPanelVisible}
          onUpdateMinimized={(value)=> setIscontrolPanelVisible(value)}
          onPointerDown={(event)=> HandleControlPanelPointerDown({event, isControlPanelSelected, pointerOffset, setControlPanelPosition, elements: displayElements, lastSelected, setElements: setCanvasElements })}
          onPointerUp={(event)=> HandleControlPanelPointerUp({event, isControlPanelSelected,pointerOffset, setControlPanelPosition,  elements: displayElements, lastSelected})}
          onSetControlPanelPosition={(event)=> HandlePointerMove({event,isControlPanelSelected, pointerOffset, setControlPanelPosition, lastSelected, elements: displayElements, setElements: setCanvasElements})}
          currentElement={lastSelected.current}
          elements={displayElements}
          onUpdateStyle={setCanvasElements}
          onDeleteElement={() => setElements((prev) => removeElementFromTree({ elements: prev, targetId:lastSelected.current! }))}
          onDelinkElement={handleDelinkeElement} />
      }

      <Toolbar
        activeTool={activeTool}
        onSelectTool={(tool) => setActiveTool(tool)
}
        selectedSection={activeSidebar}
        onSelectSection={(section) => setActiveSidebar(current => current === section ? null : section)}
        sectionPanel={toolbarSectionPanel}
        onPublish={() => setShowPublish(true)}
        onDashboard={() => { window.location.assign("/myworkspace"); }}
        onPreview={() => { setIsPreview(current => !current); setResponsiveEditDevice(null); }}
        onTutorial={() => setShowTutorial(true)}
        isPreview={isPreview}
        previewDevice={previewDevice}
        onSetPreviewDevice={device => { setPreviewDevice(device); if (responsiveEditDevice) setResponsiveEditDevice(device === "desktop" ? null : device); }}
        responsiveEditDevice={responsiveEditDevice}
        onEnterResponsiveEdit={() => { if (previewDevice !== "desktop") { setResponsiveEditDevice(previewDevice); setIsPreview(false); } }}
        onExitResponsiveEdit={() => { setResponsiveEditDevice(null); setPreviewDevice("desktop"); }}
      />

      {Object.entries(displayElements).map(([id, element]) => (
        <CanvasElement
          selectedTarget={selectedTarget}
          key={id}
          guide={guide}
          setGuide={setGuide}
          id={id}
          elements={displayElements}
          selectedElement={selectedTarget.current!}
          element={element}
          setElements={setCanvasElements}
          isPreview={isPreview}
          onNavigate={navigateTo}
          selectedIds={selectedIds}
          onSelect={selectElement}
        />
      ))}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-5 z-10 bg-white/90 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-500">{pages.find(page=>page.id===activePage)?.name || "Home"} · {isPreview?(previewDevice+" preview"):responsiveEditDevice?("Editing "+responsiveEditDevice+" layout · changes are device-specific"):selectedIds.length>1?(selectedIds.length+" selected · drag any to move as a group"):"Editing · Shift-click to select multiple"}</div>
      <div className="pointer-events-none" style={{height:Math.max(pageHeight*(typeof window!=="undefined"?window.innerHeight:900)/100,typeof window!=="undefined"?window.innerHeight:900)}}/>
      </div>
      {!isPreview && lastSelected.current && findInTree(elements,lastSelected.current) && <aside className="w-60 border-l border-slate-200 bg-white p-4 z-40 overflow-auto"><div className="font-medium text-sm">{findInTree(elements,lastSelected.current)?.elementTag === "button" ? "Button & section links" : "Section settings"}</div><p className="text-xs text-slate-500 mt-1">Name a section to create a link target.</p><label className="block text-xs text-slate-500 mt-4 mb-1">Section name</label><input placeholder="e.g. About, Contact" value={findInTree(elements,lastSelected.current)?.sectionName || ""} onChange={e=>{const id=lastSelected.current!;setElements(prev=>({...prev,[id]:{...prev[id],sectionName:e.target.value,sectionId:e.target.value?"section-"+id:undefined}}))}} className="w-full border rounded-lg px-2 py-2 text-sm"/>{findInTree(elements,lastSelected.current)?.elementTag === "button" && <><label className="block text-xs text-slate-500 mt-4 mb-1">Button label</label><input value={findInTree(elements,lastSelected.current)?.content || ""} onChange={e=>{const id=lastSelected.current!;setElements(prev=>({...prev,[id]:{...prev[id],content:e.target.value}}))}} className="w-full border rounded-lg px-2 py-2 text-sm"/><label className="block text-xs text-slate-500 mt-4 mb-1">Destination</label><select value={findInTree(elements,lastSelected.current)?.linkTarget || ""} onChange={e=>{const id=lastSelected.current!;setElements(prev=>({...prev,[id]:{...prev[id],linkTarget:e.target.value}}))}} className="w-full border rounded-lg px-2 py-2 text-sm bg-white"><option value="">No navigation</option><optgroup label="Pages">{pages.filter(page=>page.id!==activePage).map(page=><option key={page.id} value={page.id}>{page.name}</option>)}</optgroup><optgroup label="Sections on this page">{Object.entries(elements).filter(([id,item])=>id!==lastSelected.current&&item.sectionId).map(([id,item])=><option key={id} value={"#"+item.sectionId}>{item.sectionName || item.content || "Section"}</option>)}</optgroup></select></>}</aside>}
      </div>
      {showTemplates && <div className="fixed inset-0 z-[100] bg-slate-950/40 grid place-items-center p-4" onClick={()=>setShowTemplates(false)}><div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6" onClick={e=>e.stopPropagation()}><div className="flex justify-between"><div><p className="text-xs uppercase tracking-widest text-slate-400">Get a head start</p><h2 className="text-2xl font-semibold mt-1">Choose a business starter</h2><p className="mt-1 text-sm text-slate-500">Each one includes linked pages, stock photography, and ready-to-edit sections.</p></div><button onClick={()=>setShowTemplates(false)} className="text-xl text-slate-400">×</button></div><div className="grid gap-4 mt-6 sm:grid-cols-2">{siteStarters.map(template=><button key={template.id} onClick={()=>chooseTemplate(template.id)} className="text-left border border-slate-200 rounded-xl overflow-hidden hover:border-[#315b45] hover:shadow-md"><img src={template.cover} alt="" className="h-32 w-full object-cover"/><div className="p-4"><span className="text-[10px] uppercase tracking-widest text-slate-400">{template.category}</span><div className="font-semibold mt-1">{template.name}</div><p className="text-xs text-slate-500 mt-1">{template.description}</p></div></button>)}</div><button onClick={()=>addPage("Page "+(pages.length+1))} className="mt-5 text-sm text-slate-600"><Plus size={15} className="inline mr-1"/>Start with a blank page</button></div></div>}
      {historyOpen && <div className="fixed inset-0 z-[110] bg-slate-950/40 grid place-items-center p-4" onClick={()=>setHistoryOpen(false)}><div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e=>e.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-widest text-slate-400">Restore point</p><h2 className="text-2xl font-semibold mt-1">Version history</h2><p className="text-sm text-slate-500 mt-1">Save a named snapshot of this page, then restore it later.</p></div><button onClick={()=>setHistoryOpen(false)} className="text-xl text-slate-400">×</button></div><button onClick={saveVersion} className="mt-5 w-full rounded-xl bg-slate-900 text-white py-3"><Save size={15} className="inline mr-2"/>Save current version</button><div className="mt-5 max-h-80 overflow-auto space-y-2">{versions.filter(version=>version.pageId===activePage).map(version=><div key={version.id} className="flex items-center gap-3 rounded-xl border p-3"><History size={16} className="text-slate-400"/><div className="flex-1"><div className="text-sm font-medium">{version.name}</div><div className="text-xs text-slate-500">{new Date(version.createdAt).toLocaleString()} · {Object.keys(version.elements).length} elements</div></div><button onClick={()=>restoreVersion(version)} className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50">Restore</button></div>)}{versions.filter(version=>version.pageId===activePage).length===0&&<p className="py-6 text-center text-sm text-slate-400">No saved versions for this page yet.</p>}</div></div></div>}
      {showCatalogueForm && <div className="fixed inset-0 z-[110] bg-slate-950/40 grid place-items-center p-4" onClick={()=>setShowCatalogueForm(false)}><form className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e=>e.stopPropagation()} onSubmit={e=>{e.preventDefault();if(!catalogueDraft.name.trim())return;if(editingCatalogueId){setCatalogue(old=>old.map(item=>item.id===editingCatalogueId?{...item,...catalogueDraft,name:catalogueDraft.name.trim()}:item))}else{setCatalogue(old=>[...old,{...catalogueDraft,id:crypto.randomUUID(),name:catalogueDraft.name.trim()}])}setEditingCatalogueId(null);setCatalogueDraft({name:"",kind:"Product",price:"",description:""});setShowCatalogueForm(false);setActiveSidebar("catalogue")}}><div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-widest text-slate-400">Catalogue</p><h2 className="text-2xl font-semibold mt-1">{editingCatalogueId?"Edit catalogue item":"Add a product or service"}</h2></div><button type="button" onClick={()=>setShowCatalogueForm(false)} className="text-xl text-slate-400">×</button></div><label className="block text-xs text-slate-500 mt-5 mb-1">Item name</label><input required autoFocus value={catalogueDraft.name} onChange={e=>setCatalogueDraft(old=>({...old,name:e.target.value}))} placeholder="e.g. Handmade ceramic mug" className="w-full border rounded-lg px-3 py-2 text-sm"/><div className="grid grid-cols-2 gap-3 mt-4"><div><label className="block text-xs text-slate-500 mb-1">Type</label><select value={catalogueDraft.kind} onChange={e=>setCatalogueDraft(old=>({...old,kind:e.target.value as "Product"|"Service"}))} className="w-full border rounded-lg px-3 py-2 text-sm bg-white"><option>Product</option><option>Service</option></select></div><div><label className="block text-xs text-slate-500 mb-1">Price</label><input value={catalogueDraft.price} onChange={e=>setCatalogueDraft(old=>({...old,price:e.target.value}))} placeholder="e.g. R420" className="w-full border rounded-lg px-3 py-2 text-sm"/></div></div><label className="block text-xs text-slate-500 mt-4 mb-1">Description</label><textarea value={catalogueDraft.description} onChange={e=>setCatalogueDraft(old=>({...old,description:e.target.value}))} placeholder="Describe what customers get" rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-y"/><button type="submit" className="mt-5 w-full rounded-xl bg-slate-900 text-white py-3">{editingCatalogueId?"Save changes":"Save catalogue item"}</button></form></div>}
      {showPublish && <div className="fixed inset-0 z-[100] bg-slate-950/40 grid place-items-center p-4" onClick={()=>setShowPublish(false)}><div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7" onClick={e=>e.stopPropagation()}><div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 grid place-items-center"><Rocket/></div><h2 className="text-2xl font-semibold mt-4">Your site is saved</h2><p className="text-sm text-slate-500 mt-2">This builder currently saves your work in this browser. Add a hosting connection to publish a live website.</p><div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm"><b>Before publishing</b><p className="text-slate-500 mt-1">Preview every page, connect your buttons, and add your products or service details.</p></div><button onClick={()=>{setShowPublish(false);setIsPreview(true)}} className="mt-6 w-full rounded-xl bg-slate-900 text-white py-3">Preview my site</button><button onClick={()=>setShowPublish(false)} className="mt-3 w-full py-2 text-sm text-slate-500">Back to editor</button></div></div>}
      {showTutorial && <div className="fixed inset-0 z-[100] bg-slate-950/40 grid place-items-center p-4" onClick={()=>setShowTutorial(false)}><div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-7" onClick={e=>e.stopPropagation()}><div className="w-12 h-12 rounded-2xl bg-[#edf2e8] text-[#315b45] grid place-items-center"><BookOpen/></div><h2 className="text-2xl font-semibold mt-4">Your first storefront</h2><p className="text-sm text-slate-500 mt-2">A quick tour to get your site ready for customers.</p><ol className="mt-6 space-y-4 text-sm"><li><b>1. Pick a starting point.</b><p className="text-slate-500">Choose a template or create a blank page.</p></li><li><b>2. Add and arrange content.</b><p className="text-slate-500">Choose a tool, then drag and resize items on the canvas.</p></li><li><b>3. Build multiple pages.</b><p className="text-slate-500">Open Pages from the app toolbar and connect buttons to pages or sections.</p></li><li><b>4. Make room to scroll.</b><p className="text-slate-500">Increase page length to add more sections below the fold.</p></li></ol><button onClick={()=>{setShowTutorial(false);setShowTemplates(true)}} className="mt-7 w-full rounded-xl bg-[#315b45] text-white py-3">Choose a template</button></div></div>}
      </div>
  );
}
