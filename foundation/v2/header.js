const HEADER_SELECTOR = "[data-hara-shell-header]";
const MENU_SELECTOR = "[data-hara-header-menu]";
const NAVIGATION_SELECTOR = "[data-hara-mobile-navigation]";
const SIGN_IN_TRIGGER_SELECTOR = "[data-hara-sign-in-trigger]";
const DEFAULT_COMPACT_QUERY = "(max-width: 820px)";

const isElement = (value) => typeof HTMLElement !== "undefined" && value instanceof HTMLElement;
const isInteractiveElement = (value) => Boolean(
  value
  && typeof value.addEventListener === "function"
  && typeof value.querySelector === "function"
);

function headerCandidates(root) {
  if (!root || typeof root.querySelectorAll !== "function") return [];
  const headers = [...root.querySelectorAll(HEADER_SELECTOR)];
  if (typeof root.matches === "function" && root.matches(HEADER_SELECTOR)) headers.unshift(root);
  return headers;
}

function compactState(header) {
  const query = header.dataset.haraCompactQuery || DEFAULT_COMPACT_QUERY;
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(query).matches
    : false;
}

/**
 * Synchronize the shared hamburger's visible and accessible state.
 *
 * Product-owned drawers call this after opening or closing their own target.
 * Package-owned compact navigation uses the same helper internally.
 */
export function setHaraHeaderMenuState(header, requestedOpen, options = {}) {
  if (!isElement(header)) return false;
  const menu = header.querySelector(MENU_SELECTOR);
  if (!(menu instanceof HTMLButtonElement)) return false;

  const navigation = header.querySelector(NAVIGATION_SELECTOR);
  const open = Boolean(requestedOpen);
  const openLabel = menu.dataset.openLabel || "Open navigation";
  const closeLabel = menu.dataset.closeLabel || "Close navigation";
  const compact = options.compact ?? compactState(header);

  header.dataset.navigationOpen = String(open);
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? closeLabel : openLabel);
  menu.title = open ? closeLabel : openLabel;

  if (isElement(navigation) && options.syncNavigation !== false) {
    navigation.hidden = !open;
    navigation.setAttribute("aria-hidden", String(!open));
  }

  header.dispatchEvent(new CustomEvent("hara:header-navigation", {
    bubbles: true,
    detail: { open, compact, mode: header.dataset.haraMenuMode || "navigation" }
  }));

  if (!open && options.restoreFocus) menu.focus();
  return open;
}

function requestProductMenu(header, open, compact, reason, restoreFocus = false) {
  return header.dispatchEvent(new CustomEvent("hara:header-menu-request", {
    bubbles: true,
    cancelable: true,
    detail: { open, compact, reason, restoreFocus }
  }));
}

/**
 * Attach the shared Hara header interaction contract to one header.
 *
 * `navigation` mode owns the compact three-link panel. `product` mode keeps the
 * same hamburger and state contract but delegates all drawer content and
 * lifecycle to the application through `hara:header-menu-request`.
 */
export function initialiseHaraHeader(header) {
  if (!isElement(header) || header.dataset.haraHeaderReady === "true") return false;

  const menu = header.querySelector(MENU_SELECTOR);
  const navigation = header.querySelector(NAVIGATION_SELECTOR);
  const menuMode = header.dataset.haraMenuMode === "product" ? "product" : "navigation";
  if (!(menu instanceof HTMLButtonElement)) return false;
  if (menuMode === "navigation" && !isElement(navigation)) return false;

  const compactQuery = header.dataset.haraCompactQuery || DEFAULT_COMPACT_QUERY;
  const compact = window.matchMedia(compactQuery);

  const setOpen = (requestedOpen, { restoreFocus = false } = {}) => setHaraHeaderMenuState(
    header,
    Boolean(requestedOpen && compact.matches),
    { restoreFocus, compact: compact.matches, syncNavigation: true }
  );

  menu.addEventListener("click", () => {
    const requestedOpen = header.dataset.navigationOpen !== "true";
    if (menuMode === "product") {
      requestProductMenu(header, requestedOpen, compact.matches, "trigger");
      return;
    }
    if (!compact.matches) {
      requestProductMenu(header, true, false, "desktop-trigger");
      return;
    }
    setOpen(requestedOpen);
  });

  if (isElement(navigation)) {
    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });
  }

  header.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || header.dataset.navigationOpen !== "true") return;
    event.preventDefault();
    if (menuMode === "product") {
      requestProductMenu(header, false, compact.matches, "escape", true);
    } else {
      setOpen(false, { restoreFocus: true });
    }
  });

  const onViewportChange = (event) => {
    if (event.matches || header.dataset.navigationOpen !== "true") return;
    if (menuMode === "product") {
      requestProductMenu(header, false, false, "viewport");
    } else {
      setOpen(false);
    }
  };
  if (typeof compact.addEventListener === "function") compact.addEventListener("change", onViewportChange);
  else if (typeof compact.addListener === "function") compact.addListener(onViewportChange);

  header.dataset.haraHeaderReady = "true";
  setHaraHeaderMenuState(header, false, {
    compact: compact.matches,
    syncNavigation: menuMode === "navigation"
  });
  return true;
}

export function initialiseHaraHeaders(root = document) {
  return headerCandidates(root).reduce(
    (count, header) => count + (initialiseHaraHeader(header) ? 1 : 0),
    0
  );
}

function signInTriggerCandidates(root) {
  if (!root || typeof root.querySelectorAll !== "function") return [];
  const triggers = [...root.querySelectorAll(SIGN_IN_TRIGGER_SELECTOR)];
  if (typeof root.matches === "function" && root.matches(SIGN_IN_TRIGGER_SELECTOR)) triggers.unshift(root);
  return triggers;
}

/**
 * Mount the shared logged-out account action as a centered modal.
 *
 * The provider link remains in the dialog so the visual package owns the
 * interaction boundary without owning identity, session, or OAuth state.
 */
export function initialiseHaraSignIn(trigger) {
  if (!isInteractiveElement(trigger) || trigger.dataset.haraSignInReady === "true") return false;

  const modalId = trigger.getAttribute("aria-controls");
  const modal = modalId ? document.getElementById(modalId) : null;
  if (!isInteractiveElement(modal)) return false;

  const closeButton = modal.querySelector("[data-hara-sign-in-close]");
  trigger.dataset.haraSignInReady = "true";

  const syncState = (open, restoreFocus = false) => {
    modal.hidden = !open;
    modal.setAttribute("aria-hidden", String(!open));
    trigger.setAttribute("aria-expanded", String(open));
    document.documentElement.dataset.haraSignInOpen = String(open);
    if (open) {
      const firstControl = modal.querySelector("a, button, [tabindex]:not([tabindex='-1'])");
      if (isInteractiveElement(firstControl)) requestAnimationFrame(() => firstControl.focus());
    } else if (restoreFocus) trigger.focus();
  };

  const close = (restoreFocus = true) => {
    syncState(false, restoreFocus);
  };

  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    syncState(true);
  });
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });
  modal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  });
  if (isInteractiveElement(closeButton)) closeButton.addEventListener("click", () => close());
  syncState(false, false);
  return true;
}

export function initialiseHaraSignIns(root = document) {
  return signInTriggerCandidates(root).reduce(
    (count, trigger) => count + (initialiseHaraSignIn(trigger) ? 1 : 0),
    0
  );
}
