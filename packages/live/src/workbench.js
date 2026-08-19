import { mountLiveCard } from "./live-card.js";

export const LIVE_WORKBENCH_SECTIONS = Object.freeze([
  Object.freeze({ id: "nav", label: "Nav" }),
  Object.freeze({ id: "frontmatter", label: "Frontmatter" }),
  Object.freeze({ id: "graphics", label: "Graphics" }),
  Object.freeze({ id: "code", label: "Code" })
]);

export const LIVE_CONTROL_GROUPS = Object.freeze([
  Object.freeze({ id: "sessions", label: "Sessions" }),
  Object.freeze({ id: "files", label: "Files" }),
  Object.freeze({ id: "canvas", label: "Canvas" }),
  Object.freeze({ id: "three-d", label: "3D" })
]);

const text = (value, fallback = "") => String(value ?? fallback).trim();
const slug = (value, fallback) => text(value, fallback)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "") || fallback;

const normalizeSections = (sections) => {
  const requested = Array.isArray(sections) && sections.length
    ? sections
    : LIVE_WORKBENCH_SECTIONS;
  const seen = new Set();
  return requested.flatMap((entry, index) => {
    const source = typeof entry === "string" ? { id: entry, label: entry } : entry ?? {};
    const id = slug(source.id ?? source.label, `section-${index + 1}`);
    if (seen.has(id)) return [];
    seen.add(id);
    return [{
      id,
      label: text(source.label, id),
      description: text(source.description),
      kind: text(source.kind, id)
    }];
  });
};

const normalizeEntries = (entries) => (Array.isArray(entries) ? entries : []).map((entry, index) => {
  if (typeof entry === "string") return { id: slug(entry, `item-${index + 1}`), label: entry, value: "" };
  return {
    ...entry,
    id: slug(entry?.id ?? entry?.label, `item-${index + 1}`),
    label: text(entry?.label, `Item ${index + 1}`),
    value: text(entry?.value ?? entry?.detail),
    status: text(entry?.status),
    href: text(entry?.href)
  };
});

const normalizeControls = (controls) => (Array.isArray(controls) ? controls : []).map((control, index) => ({
  ...control,
  id: slug(control?.id ?? control?.label, `control-${index + 1}`),
  label: text(control?.label, `Control ${index + 1}`),
  type: ["action", "toggle", "range", "select"].includes(control?.type) ? control.type : "action"
}));

export function normalizeLiveWorkbenchOptions(options = {}) {
  const sections = normalizeSections(options.sections);
  const requestedSection = slug(options.activeSection, sections.at(-1)?.id ?? "code");
  const activeSection = sections.some(({ id }) => id === requestedSection)
    ? requestedSection
    : sections.at(-1)?.id ?? "code";
  const rawPane = options.controlPane === true ? {} : options.controlPane || null;
  const paneGroups = rawPane
    ? LIVE_CONTROL_GROUPS.filter(({ id }) => {
        if (id === "sessions") return rawPane.sessions !== false;
        if (id === "files") return rawPane.files !== false;
        if (id === "canvas") return rawPane.canvas !== false;
        return rawPane.threeD !== false && rawPane["three-d"] !== false;
      })
    : [];
  const requestedGroup = slug(rawPane?.activeGroup, paneGroups[0]?.id ?? "sessions");
  const activeGroup = paneGroups.some(({ id }) => id === requestedGroup)
    ? requestedGroup
    : paneGroups[0]?.id ?? "sessions";

  return {
    sections,
    activeSection,
    navigation: normalizeEntries(options.navigation),
    frontmatter: normalizeEntries(options.frontmatter),
    graphicsSnippet: text(options.graphicsSnippet),
    onSectionChange: typeof options.onSectionChange === "function" ? options.onSectionChange : null,
    controlPane: rawPane ? {
      open: rawPane.open === true,
      label: text(rawPane.label, "Live controls"),
      groups: paneGroups,
      activeGroup,
      sessions: normalizeEntries(rawPane.sessions === false ? [] : rawPane.sessions),
      files: normalizeEntries(rawPane.files === false ? [] : rawPane.files),
      canvas: normalizeControls(rawPane.canvas === false ? [] : rawPane.canvas),
      threeD: normalizeControls(rawPane.threeD === false ? [] : rawPane.threeD ?? rawPane["three-d"]),
      onControl: typeof rawPane.onControl === "function" ? rawPane.onControl : null
    } : null
  };
}

const setButtonState = (button, selected) => {
  button.setAttribute("aria-selected", String(selected));
  button.tabIndex = selected ? 0 : -1;
};

const appendEntry = (list, entry) => {
  const item = document.createElement("li");
  item.className = "hara-live-workbench-entry";
  item.dataset.entryId = entry.id;
  const content = entry.href ? document.createElement("a") : document.createElement("div");
  if (entry.href) content.href = entry.href;
  const label = document.createElement("strong");
  label.textContent = entry.label;
  content.append(label);
  if (entry.value) {
    const value = document.createElement("span");
    value.textContent = entry.value;
    content.append(value);
  }
  if (entry.status) {
    const status = document.createElement("small");
    status.textContent = entry.status;
    status.dataset.state = entry.status.toLowerCase();
    content.append(status);
  }
  item.append(content);
  list.append(item);
};

const createContextView = (label) => {
  const view = document.createElement("section");
  view.className = "hara-live-workbench-context";
  view.setAttribute("aria-label", label);
  const list = document.createElement("ul");
  list.className = "hara-live-workbench-entry-list";
  view.append(list);
  return { view, list };
};

const createControl = (group, descriptor, onControl) => {
  const row = document.createElement("label");
  row.className = "hara-live-control";
  row.dataset.controlId = descriptor.id;
  const caption = document.createElement("span");
  caption.textContent = descriptor.label;
  row.append(caption);

  const notify = (value, event) => onControl?.({
    group,
    id: descriptor.id,
    value,
    control: descriptor,
    event
  });

  if (descriptor.type === "toggle") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hara-live-control-toggle";
    button.setAttribute("aria-pressed", String(Boolean(descriptor.value)));
    button.textContent = descriptor.value ? text(descriptor.onLabel, "On") : text(descriptor.offLabel, "Off");
    button.addEventListener("click", (event) => {
      const next = button.getAttribute("aria-pressed") !== "true";
      button.setAttribute("aria-pressed", String(next));
      button.textContent = next ? text(descriptor.onLabel, "On") : text(descriptor.offLabel, "Off");
      notify(next, event);
    });
    row.append(button);
    return row;
  }

  if (descriptor.type === "range") {
    const wrap = document.createElement("span");
    wrap.className = "hara-live-control-range";
    const input = document.createElement("input");
    input.type = "range";
    input.min = String(descriptor.min ?? 0);
    input.max = String(descriptor.max ?? 100);
    input.step = String(descriptor.step ?? 1);
    input.value = String(descriptor.value ?? descriptor.min ?? 0);
    const output = document.createElement("output");
    output.textContent = `${input.value}${text(descriptor.unit)}`;
    input.addEventListener("input", (event) => {
      output.textContent = `${input.value}${text(descriptor.unit)}`;
      notify(Number(input.value), event);
    });
    wrap.append(input, output);
    row.append(wrap);
    return row;
  }

  if (descriptor.type === "select") {
    const select = document.createElement("select");
    for (const option of Array.isArray(descriptor.options) ? descriptor.options : []) {
      const source = typeof option === "string" ? { label: option, value: option } : option;
      const element = document.createElement("option");
      element.value = text(source.value, source.label);
      element.textContent = text(source.label, element.value);
      element.selected = element.value === String(descriptor.value ?? "");
      select.append(element);
    }
    select.addEventListener("change", (event) => notify(select.value, event));
    row.append(select);
    return row;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "hara-live-control-action";
  button.textContent = text(descriptor.actionLabel, descriptor.label);
  button.addEventListener("click", (event) => notify(true, event));
  row.append(button);
  return row;
};

/**
 * Mount the shared live card inside a calm workbench shell.
 *
 * Wrapper options (`sections`, `navigation`, `frontmatter`, `controlPane`) are
 * consumed here. Every other option is forwarded to mountLiveCard, so existing
 * snippet, kernel, runtime and playground options remain valid.
 */
export function mountLiveWorkbench(root, options = {}) {
  const {
    sections: _sections,
    activeSection: _activeSection,
    navigation: _navigation,
    frontmatter: _frontmatter,
    graphicsSnippet: _graphicsSnippet,
    onSectionChange: _onSectionChange,
    controlPane: _controlPane,
    liveCard: liveCardOverrides,
    ...liveCardOptions
  } = options;
  const config = normalizeLiveWorkbenchOptions(options);
  const forwarded = { ...liveCardOptions, ...(liveCardOverrides ?? {}) };

  const shell = document.createElement("section");
  shell.className = "hara-live-workbench";
  shell.dataset.section = config.activeSection;
  shell.dataset.controlPane = config.controlPane?.open ? "open" : "closed";

  const top = document.createElement("header");
  top.className = "hara-live-workbench-top";
  const sectionNav = document.createElement("nav");
  sectionNav.className = "hara-live-workbench-sections";
  sectionNav.setAttribute("role", "tablist");
  sectionNav.setAttribute("aria-label", "Live environment sections");
  top.append(sectionNav);

  const body = document.createElement("div");
  body.className = "hara-live-workbench-body";
  const main = document.createElement("main");
  main.className = "hara-live-workbench-main";
  const liveMount = document.createElement("div");
  liveMount.className = "hara-live-workbench-live";
  main.append(liveMount);
  body.append(main);

  const navContext = createContextView("Navigation");
  navContext.view.dataset.contextSection = "nav";
  for (const entry of config.navigation) appendEntry(navContext.list, entry);
  main.prepend(navContext.view);

  const metaContext = createContextView("Frontmatter");
  metaContext.view.dataset.contextSection = "frontmatter";
  for (const entry of config.frontmatter) appendEntry(metaContext.list, entry);
  main.insertBefore(metaContext.view, liveMount);

  let pane = null;
  let paneTabs = null;
  let paneContent = null;
  let paneToggle = null;
  let activeGroup = config.controlPane?.activeGroup ?? "sessions";
  let sessionEntries = config.controlPane?.sessions ?? [];
  let fileEntries = config.controlPane?.files ?? [];

  if (config.controlPane) {
    paneToggle = document.createElement("button");
    paneToggle.type = "button";
    paneToggle.className = "hara-live-workbench-pane-toggle";
    paneToggle.setAttribute("aria-expanded", String(config.controlPane.open));
    paneToggle.textContent = "Controls";
    top.append(paneToggle);

    pane = document.createElement("aside");
    pane.className = "hara-live-workbench-pane";
    pane.setAttribute("aria-label", config.controlPane.label);
    paneTabs = document.createElement("div");
    paneTabs.className = "hara-live-workbench-pane-tabs";
    paneTabs.setAttribute("role", "tablist");
    paneTabs.setAttribute("aria-label", config.controlPane.label);
    paneContent = document.createElement("div");
    paneContent.className = "hara-live-workbench-pane-content";
    pane.append(paneTabs, paneContent);
    body.append(pane);
  }

  root.append(shell);
  shell.append(top, body);
  const live = mountLiveCard(liveMount, forwarded);
  const card = liveMount.querySelector(".hara-live-card");

  const sectionButtons = new Map();
  const sectionById = new Map(config.sections.map((section) => [section.id, section]));

  const selectSection = (id, { focus = false, notify = true } = {}) => {
    if (!sectionById.has(id)) return false;
    shell.dataset.section = id;
    for (const [sectionId, button] of sectionButtons) {
      const selected = sectionId === id;
      setButtonState(button, selected);
      if (selected && focus) button.focus();
    }
    if (id === "code") card?.querySelector("textarea")?.focus({ preventScroll: true });
    if (id === "graphics") {
      const requested = config.graphicsSnippet && card?.querySelector(`[data-snippet-id="${CSS.escape(config.graphicsSnippet)}"]`);
      const canvasTab = requested ?? [...(card?.querySelectorAll("[data-snippet-id]") ?? [])]
        .find((button) => button.dataset.snippetId && forwarded.snippets?.find?.((snippet) => snippet.id === button.dataset.snippetId)?.kind === "canvas");
      canvasTab?.click();
    }
    if (notify) config.onSectionChange?.({ id, section: sectionById.get(id), shell, live });
    shell.dispatchEvent(new CustomEvent("hara:live-section-change", {
      bubbles: true,
      detail: { id, section: sectionById.get(id) }
    }));
    return true;
  };

  for (const section of config.sections) {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("role", "tab");
    button.dataset.sectionId = section.id;
    button.textContent = section.label;
    button.title = section.description;
    setButtonState(button, section.id === config.activeSection);
    button.addEventListener("click", () => selectSection(section.id));
    sectionButtons.set(section.id, button);
    sectionNav.append(button);
  }

  sectionNav.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const buttons = [...sectionButtons.values()];
    if (!buttons.length) return;
    event.preventDefault();
    const current = Math.max(0, buttons.indexOf(document.activeElement));
    const next = event.key === "Home" ? 0
      : event.key === "End" ? buttons.length - 1
      : (current + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
    selectSection(buttons[next].dataset.sectionId, { focus: true });
  });

  const liveSessionEntry = () => ({
    id: "current-live-session",
    label: "Live kernel",
    value: card?.querySelector("[data-live-connection-label]")?.textContent ?? "Idle",
    status: card?.dataset.connectionState ?? "idle"
  });

  const renderPane = () => {
    if (!paneTabs || !paneContent || !config.controlPane) return;
    paneTabs.replaceChildren();
    for (const group of config.controlPane.groups) {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "tab");
      button.dataset.controlGroup = group.id;
      button.textContent = group.label;
      setButtonState(button, group.id === activeGroup);
      button.addEventListener("click", () => selectControlGroup(group.id));
      paneTabs.append(button);
    }

    paneContent.replaceChildren();
    paneContent.dataset.controlGroup = activeGroup;
    if (activeGroup === "sessions" || activeGroup === "files") {
      const list = document.createElement("ul");
      list.className = "hara-live-workbench-entry-list";
      const entries = activeGroup === "sessions"
        ? [liveSessionEntry(), ...sessionEntries]
        : fileEntries;
      for (const entry of entries) appendEntry(list, entry);
      if (!entries.length) {
        const empty = document.createElement("p");
        empty.className = "hara-live-workbench-empty";
        empty.textContent = activeGroup === "files" ? "No files exposed by this embed." : "No session information available.";
        paneContent.append(empty);
      } else paneContent.append(list);
      return;
    }

    const controls = activeGroup === "canvas" ? config.controlPane.canvas : config.controlPane.threeD;
    if (!controls.length) {
      const empty = document.createElement("p");
      empty.className = "hara-live-workbench-empty";
      empty.textContent = activeGroup === "canvas"
        ? "This embed has no additional canvas controls."
        : "This embed has no 3D provider attached.";
      paneContent.append(empty);
      return;
    }
    const group = document.createElement("div");
    group.className = "hara-live-control-list";
    for (const control of controls) group.append(createControl(activeGroup, control, config.controlPane.onControl));
    paneContent.append(group);
  };

  function selectControlGroup(id, { focus = false } = {}) {
    if (!config.controlPane?.groups.some((group) => group.id === id)) return false;
    activeGroup = id;
    renderPane();
    if (focus) paneTabs?.querySelector(`[data-control-group="${CSS.escape(id)}"]`)?.focus();
    return true;
  }

  const setPaneOpen = (open) => {
    const value = Boolean(open);
    shell.dataset.controlPane = value ? "open" : "closed";
    paneToggle?.setAttribute("aria-expanded", String(value));
    return value;
  };

  paneToggle?.addEventListener("click", () => setPaneOpen(shell.dataset.controlPane !== "open"));
  paneTabs?.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const groups = config.controlPane?.groups ?? [];
    if (!groups.length) return;
    event.preventDefault();
    const current = Math.max(0, groups.findIndex(({ id }) => id === activeGroup));
    const next = event.key === "Home" ? 0
      : event.key === "End" ? groups.length - 1
      : (current + (event.key === "ArrowRight" ? 1 : -1) + groups.length) % groups.length;
    selectControlGroup(groups[next].id, { focus: true });
  });

  const observer = card && typeof MutationObserver === "function"
    ? new MutationObserver(() => {
        if (activeGroup === "sessions") renderPane();
      })
    : null;
  observer?.observe(card, { attributes: true, childList: true, subtree: true, characterData: true });

  renderPane();
  selectSection(config.activeSection, { notify: false });

  return {
    ...live,
    shell,
    card,
    selectSection,
    selectControlGroup,
    setPaneOpen,
    setSessions(entries) {
      sessionEntries = normalizeEntries(entries);
      if (activeGroup === "sessions") renderPane();
    },
    setFiles(entries) {
      fileEntries = normalizeEntries(entries);
      if (activeGroup === "files") renderPane();
    },
    destroy() {
      observer?.disconnect();
      live.destroy();
      shell.remove();
    }
  };
}
