import { useEffect, useState, type FormEvent } from "react";
import type { Route } from "./+types/myworkspace";
import { ArrowRight, Clock3, FilePlus2, FolderOpen, LayoutTemplate, Plus, Sparkles, Store } from "lucide-react";
import { createSiteTemplate, siteStarters, type SitePage, type StarterTemplateId } from "~/util/siteTemplates";
import { activateSiteProject, newSiteProject, readSiteProjects, saveSiteProject, type SiteProject } from "~/util/siteStorage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Workspace · myCatalogue" },
    { name: "description", content: "Start a website for your shop, service, or small business." },
  ];
}

export default function MyWorkspace() {
  const [sites, setSites] = useState<SiteProject[]>([]);
  const [filter, setFilter] = useState("All templates");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [websiteName, setWebsiteName] = useState("");
  const [pendingTemplateId, setPendingTemplateId] = useState<StarterTemplateId | null>(null);
  const hasSite = sites.length > 0;
  const categories = ["All templates", "Online store", "Appointments", "Food and drink", "Services & portfolio"];
  const visibleTemplates = siteStarters.filter(template => filter === "All templates" || template.category === filter);

  useEffect(() => { setSites(readSiteProjects()); }, []);

  const openEditor = (project: SiteProject) => { activateSiteProject(project); window.location.assign("/editor"); };
  const startTemplate = (id: StarterTemplateId) => {
    const siteTemplate = createSiteTemplate(id);
    setPendingTemplateId(id);
    setWebsiteName(siteTemplate.siteName);
    setCreateDialogOpen(true);
  };
  const startBlank = () => {
    setPendingTemplateId(null);
    setWebsiteName("");
    setCreateDialogOpen(true);
  };
  const createWebsite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = websiteName.trim();
    if (!name) return;
    let pages: SitePage[] = [{ id: "home", name: "Home", elements: {} }];
    if (pendingTemplateId) {
      const siteTemplate = createSiteTemplate(pendingTemplateId);
      const renameElements = (elements: SitePage["elements"]): SitePage["elements"] => Object.fromEntries(Object.entries(elements).map(([id, element]) => [id, {
        ...element,
        content: element.content === siteTemplate.siteName ? name : element.content,
        canvasChildren: renameElements(element.canvasChildren || {}),
      }]));
      pages = siteTemplate.pages.map(page => ({ ...page, elements: renameElements(page.elements) }));
    }
    const project = newSiteProject(name, pages, pendingTemplateId || undefined);
    saveSiteProject(project);
    activateSiteProject(project);
    window.location.assign("/editor");
  };

  return (
    <main className="min-h-screen bg-[#f5f6f4] text-[#243027]">
      <header className="sticky top-0 z-20 border-b border-[#e3e8e2] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center gap-3 px-5 md:px-9">
          <a href="/" className="flex items-center gap-2.5 font-semibold tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#315b45] text-white"><Store size={17}/></span><span className="text-lg">myCatalogue</span></a>
          <span className="h-6 w-px bg-[#e1e5df]" />
          <span className="text-sm font-medium text-[#647066]">Workspace</span>
          <div className="ml-auto flex items-center gap-2"><button onClick={startBlank} className="hidden rounded-lg border border-[#dce2db] px-3.5 py-2 text-sm font-medium text-[#415047] hover:bg-[#f5f7f4] sm:block"><FilePlus2 size={15} className="mr-2 inline"/>Blank website</button><button onClick={() => document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })} className="rounded-lg bg-[#315b45] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#254735]"><Plus size={15} className="mr-1.5 inline"/>Create a website</button></div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] md:grid-cols-[210px_1fr]">
        <aside className="hidden min-h-[calc(100vh-68px)] border-r border-[#e3e8e2] bg-[#f8f9f7] p-4 md:block">
          <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[.16em] text-[#829086]">Workspace</p>
          <a href="#my-sites" className="flex items-center gap-3 rounded-lg bg-[#e9f0e9] px-3 py-2.5 text-sm font-semibold text-[#315b45]"><FolderOpen size={16}/>My sites</a>
          <a href="#templates" className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#536158] hover:bg-[#edf1ec]"><LayoutTemplate size={16}/>Templates</a>
          <div className="mt-8 rounded-xl border border-[#e4e8e2] bg-white p-4"><Sparkles size={17} className="text-[#bc7146]"/><p className="mt-3 text-sm font-semibold">A good place to start</p><p className="mt-1 text-xs leading-5 text-[#748076]">Pick a business type and we'll give you a complete first draft to make your own.</p></div>
        </aside>

        <div className="min-w-0 px-5 pb-16 pt-8 md:px-10 md:pt-10">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-[22px] bg-[#e8efe6] px-6 py-7 md:flex md:items-end md:justify-between md:px-9 md:py-9">
              <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#627b63]">WORKSPACE / MY SITES</p><h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-.03em] md:text-[38px]">Let's get your business online.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#5d6b60] md:text-base">Start with a business-ready design, then shape it into a website that feels like yours.</p></div>
              <button onClick={() => document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#315b45] px-5 py-3 text-sm font-semibold text-white hover:bg-[#254735] md:mt-0">Choose a template <ArrowRight size={16}/></button>
            </div>

            <section id="my-sites" className="mt-9 scroll-mt-24">
              <div className="flex items-end justify-between gap-4"><div><h2 className="text-xl font-semibold">My sites</h2><p className="mt-1 text-sm text-[#748076]">Pick up where you left off.</p></div><button onClick={startBlank} className="text-sm font-medium text-[#315b45] hover:underline"><Plus size={14} className="mr-1 inline"/>New blank site</button></div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {hasSite ? sites.map(project=><button key={project.id} onClick={()=>openEditor(project)} className="group overflow-hidden rounded-xl border border-[#e0e5de] bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="relative h-36 overflow-hidden bg-[#e5e9e2]"><img src={siteStarters.find(item => item.id === project.templateId)?.cover || siteStarters[0].cover} alt={`${project.name} preview`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"/><span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#526157]">Draft</span></div>
                  <div className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{project.name}</h3><p className="mt-1 text-xs text-[#7b867d]">{project.pages.length} pages · Saved in this browser</p></div><ArrowRight size={17} className="mt-0.5 text-[#819086] transition group-hover:translate-x-1 group-hover:text-[#315b45]"/></div><p className="mt-3 text-xs text-[#778279]"><Clock3 size={13} className="mr-1 inline"/>{project.updatedAt ? `Last updated ${new Date(project.updatedAt).toLocaleDateString()}` : "Ready to continue"}</p></div>
                </button>) : <div className="flex min-h-[220px] flex-col justify-between rounded-xl border border-dashed border-[#cbd5ca] bg-white p-5 sm:col-span-2 lg:col-span-3 sm:flex-row sm:items-center"><div><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf2ec] text-[#55785e]"><FolderOpen size={18}/></div><h3 className="mt-4 font-semibold">Your websites will appear here</h3><p className="mt-1 max-w-lg text-sm leading-6 text-[#748076]">Choose one of the business templates below to create your first site. You can keep editing it whenever you come back.</p></div><button onClick={() => document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })} className="mt-5 w-fit rounded-lg bg-[#315b45] px-4 py-2.5 text-sm font-semibold text-white sm:mt-0">Browse templates</button></div>}
              </div>
            </section>

            <section id="templates" className="mt-11 scroll-mt-24">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-[#7c897e]">START WITH A TEMPLATE</p><h2 className="mt-2 text-xl font-semibold">What are you building?</h2><p className="mt-1 text-sm text-[#748076]">Each starter includes pages, sections, photos, and example content you can edit.</p></div><span className="text-xs text-[#89938a]">4 business starters</span></div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">{categories.map(category => <button key={category} onClick={() => setFilter(category)} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium transition ${filter === category ? "bg-[#315b45] text-white" : "border border-[#dfe5dd] bg-white text-[#58655b] hover:bg-[#f1f4f0]"}`}>{category}</button>)}</div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{visibleTemplates.map(template => <article key={template.id} className="group overflow-hidden rounded-xl border border-[#e0e5de] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="relative h-48 overflow-hidden bg-[#e6e9e4]"><img src={template.cover} alt={`${template.name} template preview`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"/><span className="absolute left-3 top-3 rounded-md bg-white/92 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#4e5b51]">{template.category}</span><span style={{ backgroundColor: template.accent }} className="absolute bottom-3 right-3 rounded-md px-2.5 py-1.5 text-[10px] font-semibold text-white">Ready to customize</span></div>
                <div className="p-5"><h3 className="text-base font-semibold">{template.name}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-[#6e796f]">{template.description}</p><div className="mt-3 rounded-lg bg-[#f5f7f4] px-3 py-2.5 text-xs leading-5 text-[#677268]"><b className="font-semibold text-[#47544a]">Good for:</b> {template.audience}</div><button onClick={() => startTemplate(template.id)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[#d9e2d8] py-2.5 text-sm font-semibold text-[#315b45] transition hover:border-[#315b45] hover:bg-[#f0f5ef]">Use this template <ArrowRight size={15}/></button></div>
              </article>)}</div>
            </section>
          </div>
        </div>
      </div>
      {createDialogOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-[#16231a]/45 p-4" onMouseDown={event => { if (event.target === event.currentTarget) setCreateDialogOpen(false); }}>
        <form onSubmit={createWebsite} className="w-full max-w-md rounded-2xl border border-[#e1e7df] bg-white p-6 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[.15em] text-[#758276]">New website</p>
          <h2 className="mt-2 text-2xl font-semibold">What should we call it?</h2>
          <p className="mt-2 text-sm leading-6 text-[#748076]">This name appears in My Sites and helps create your local published address.</p>
          <label htmlFor="website-name" className="mt-5 block text-sm font-medium text-[#465349]">Website name</label>
          <input id="website-name" required autoFocus maxLength={80} value={websiteName} onChange={event => setWebsiteName(event.target.value)} placeholder="e.g. Fern & Field" className="mt-1.5 w-full rounded-lg border border-[#dce3da] px-3.5 py-3 text-sm outline-none focus:border-[#55785e] focus:ring-2 focus:ring-[#55785e]/15" />
          <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setCreateDialogOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-[#647066] hover:bg-[#f4f6f3]">Cancel</button><button type="submit" disabled={!websiteName.trim()} className="rounded-lg bg-[#315b45] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#254735] disabled:opacity-50">Create website</button></div>
        </form>
      </div>}
    </main>
  );
}
