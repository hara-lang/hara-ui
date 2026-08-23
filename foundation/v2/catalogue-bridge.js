const worldLinks = [
  ["Overview", "/v2/world/"],
  ["Discussion", "/v2/world/discussion/"],
  ["Around Hara", "/v2/world/around/"]
];

const learnLinks = [
  ["Overview", "/v2/learn/"],
  ["Agent-first", "/v2/start/"],
  ["Community study", "/v2/world/community/"],
  ["Onboarding study", "/v2/world/onboarding/"]
];

const routeDetails = (pathname) => {
  if (pathname.includes("/v2/world/discussion/")) return { label: "World / Discussion", parentLabel: "World", parentPath: "/v2/world/", links: worldLinks, current: "Discussion", status: "Active study" };
  if (pathname.includes("/v2/world/around/")) return { label: "World / Around Hara", parentLabel: "World", parentPath: "/v2/world/", links: worldLinks, current: "Around Hara", status: "Active study" };
  if (pathname.includes("/v2/world/community/")) return { label: "Learn / Community study", parentLabel: "Learn", parentPath: "/v2/learn/", links: learnLinks, current: "Community study", status: "Historical study" };
  if (pathname.includes("/v2/world/onboarding/")) return { label: "Learn / Onboarding study", parentLabel: "Learn", parentPath: "/v2/learn/", links: learnLinks, current: "Onboarding study", status: "Historical study" };
  if (pathname.includes("/v2/world/")) return { label: "World / Overview", parentLabel: "Applications", parentPath: "/v2/#catalogue-applications", links: worldLinks, current: "Overview", status: "Active study" };
  return { label: "Application study", parentLabel: "Catalogue", parentPath: "/v2/", links: [], current: "", status: "Active study" };
};

const launcherGroups = [
  {
    label: "Foundations",
    links: [["Design system", "/v2/foundations/"], ["Graphics", "/v2/graphics/"], ["Front matter", "/v2/frontmatter/"]]
  },
  {
    label: "Library",
    links: [["Components", "/v2/components/"], ["UI patterns", "/v2/ui/"], ["Tool workbenches", "/v2/tool/"]]
  },
  {
    label: "Applications",
    links: [["WWW", "/v2/www/"], ["Playground", "/v2/playground/"], ["Specs", "https://github.com/hara-lang/visual-language/issues/40"], ["Packages", "https://github.com/hara-lang/visual-language/issues/41"], ["World", "/v2/world/"], ["Learn", "/v2/learn/"]]
  }
];

const catalogueBase = (pathname) => {
  const marker = "/v2/";
  const index = pathname.indexOf(marker);
  return index >= 0 ? `${pathname.slice(0, index)}/` : "/";
};

const withBase = (base, path) => path.startsWith("http") ? path : `${base}${path.replace(/^\/+/, "")}`;

const createLauncher = (base) => {
  const trigger = document.createElement("button");
  trigger.className = "v2-legacy-launcher-trigger";
  trigger.type = "button";
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", "v2-legacy-launcher");
  trigger.innerHTML = '<span aria-hidden="true" class="v2-legacy-launcher-icon"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><span>Browse</span><small>Applications</small>';

  const backdrop = document.createElement("div");
  backdrop.className = "v2-legacy-launcher-backdrop";
  backdrop.hidden = true;

  const launcher = document.createElement("section");
  launcher.className = "v2-legacy-launcher";
  launcher.id = "v2-legacy-launcher";
  launcher.hidden = true;
  launcher.setAttribute("aria-label", "Visual language app launcher");

  const launcherHeader = document.createElement("header");
  launcherHeader.innerHTML = '<div><small>App launcher</small><strong>Visual language catalogue</strong></div>';
  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "Close";
  launcherHeader.append(close);
  launcher.append(launcherHeader);

  const grid = document.createElement("div");
  grid.className = "v2-legacy-launcher-grid";
  launcherGroups.forEach((group) => {
    const section = document.createElement("section");
    const title = document.createElement("h2");
    title.textContent = group.label;
    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", `${group.label} routes`);
    group.links.forEach(([label, path]) => {
      const link = document.createElement("a");
      link.href = withBase(base, path);
      link.textContent = label;
      if (path.startsWith("http")) {
        link.target = "_blank";
        link.rel = "noreferrer";
      }
      nav.append(link);
    });
    section.append(title, nav);
    grid.append(section);
  });
  launcher.append(grid);

  const setOpen = (open, restoreFocus = false) => {
    launcher.hidden = !open;
    backdrop.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
    document.documentElement.dataset.catalogueLauncherOpen = String(open);
    if (open) launcher.querySelector("a")?.focus();
    else if (restoreFocus) trigger.focus();
  };

  trigger.addEventListener("click", () => setOpen(launcher.hidden));
  close.addEventListener("click", () => setOpen(false, true));
  backdrop.addEventListener("click", () => setOpen(false, true));
  launcher.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !launcher.hidden) setOpen(false, true);
  });

  return { trigger, backdrop, launcher };
};

export function initialiseCatalogueBridges() {
  document.querySelectorAll("body.hara-v2 > header.v2-lab-header").forEach((header) => {
    if (!(header instanceof HTMLElement) || header.dataset.catalogueBridgeReady === "true") return;
    header.dataset.catalogueBridgeReady = "true";

    const pathname = window.location.pathname;
    const base = catalogueBase(pathname);
    const home = withBase(base, "/v2/");
    const details = routeDetails(pathname);
    const brand = header.querySelector(":scope > .v2-lab-brand");
    const sectionNav = header.querySelector(":scope > nav");
    const theme = header.querySelector(":scope > [data-hara-theme-toggle]");

    if (brand instanceof HTMLAnchorElement) {
      brand.href = home;
      brand.setAttribute("aria-label", "Back to the Hara visual-language catalogue");
    }

    const { trigger, backdrop, launcher } = createLauncher(base);
    header.insertBefore(trigger, theme ?? null);
    header.append(backdrop, launcher);

    const routeBar = document.createElement("section");
    routeBar.className = "v2-legacy-route-bar";
    routeBar.setAttribute("aria-label", "Current catalogue location");

    const back = document.createElement("a");
    back.className = "v2-legacy-parent-link";
    back.href = withBase(base, details.parentPath);
    back.textContent = `← ${details.parentLabel}`;

    const location = document.createElement("strong");
    location.className = "v2-legacy-route-label";
    location.textContent = details.label;

    const family = document.createElement("nav");
    family.className = "v2-legacy-family-tabs";
    family.setAttribute("aria-label", `${details.parentLabel} routes`);
    details.links.forEach(([label, path]) => {
      const link = document.createElement("a");
      link.href = withBase(base, path);
      link.textContent = label;
      if (label === details.current) link.setAttribute("aria-current", "page");
      family.append(link);
    });

    const status = document.createElement("span");
    status.className = "v2-legacy-route-status";
    status.textContent = details.status;

    routeBar.append(back, location, family, status);

    if (sectionNav instanceof HTMLElement) {
      sectionNav.dataset.legacySectionNav = "true";
      sectionNav.classList.add("v2-legacy-section-nav");
      header.after(routeBar, sectionNav);
    } else {
      header.after(routeBar);
    }
  });
}
