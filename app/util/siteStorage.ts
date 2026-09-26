import type { SitePage, StarterTemplateId } from "~/util/siteTemplates";

export type SiteProject = {
  id: string;
  name: string;
  pages: SitePage[];
  activePageId: string;
  updatedAt: string;
  templateId?: StarterTemplateId;
};

const PROJECTS_KEY = "mycatalogue-sites";
const CURRENT_SITE_KEY = "mycatalogue-current-site";

export function readSiteProjects(): SiteProject[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(PROJECTS_KEY);
    if (saved !== null) {
      const projects = JSON.parse(saved);
      if (Array.isArray(projects)) return projects as SiteProject[];
    }
    const pages = JSON.parse(localStorage.getItem("mycatalogue-pages") || "[]") as SitePage[];
    const name = localStorage.getItem("mycatalogue-site-name") || "";
    if (name && Array.isArray(pages) && pages.length) return [{
      id: localStorage.getItem(CURRENT_SITE_KEY) || "site-existing",
      name, pages, activePageId: localStorage.getItem("mycatalogue-active") || pages[0].id,
      updatedAt: localStorage.getItem("mycatalogue-updated") || new Date().toISOString(),
      templateId: (localStorage.getItem("mycatalogue-site-template") || undefined) as StarterTemplateId | undefined,
    }];
    return [];
  } catch { return []; }
}

export function saveSiteProject(project: SiteProject) {
  if (typeof window === "undefined") return;
  const projects = readSiteProjects();
  const exists = projects.some(item => item.id === project.id);
  const next = exists ? projects.map(item => item.id === project.id ? project : item) : [project, ...projects];
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(next));
}

export function removeSiteProject(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(readSiteProjects().filter(project => project.id !== id)));
}

export function activateSiteProject(project: SiteProject) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENT_SITE_KEY, project.id);
  localStorage.setItem("mycatalogue-site-name", project.name);
  localStorage.setItem("mycatalogue-pages", JSON.stringify(project.pages));
  localStorage.setItem("mycatalogue-active", project.activePageId || project.pages[0]?.id || "home");
  const activePage = project.pages.find(page => page.id === project.activePageId) || project.pages[0];
  localStorage.setItem("mycatalogue-elements", JSON.stringify(activePage?.elements || {}));
  localStorage.setItem("mycatalogue-updated", project.updatedAt || new Date().toISOString());
  if (project.templateId) localStorage.setItem("mycatalogue-site-template", project.templateId);
  else localStorage.removeItem("mycatalogue-site-template");
}

export function newSiteProject(name: string, pages: SitePage[], templateId?: StarterTemplateId): SiteProject {
  return {
    id: `site-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name, pages, activePageId: pages[0]?.id || "home", updatedAt: new Date().toISOString(), templateId,
  };
}
