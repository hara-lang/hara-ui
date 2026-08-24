const HEADER_SELECTOR = "[data-hara-shell-header]";
const MENU_SELECTOR = "[data-hara-header-menu]";
const NAVIGATION_SELECTOR = "[data-hara-mobile-navigation]";
const DEFAULT_COMPACT_QUERY = "(max-width: 820px)";

const isElement = (value) => typeof HTMLElement !== "undefined" && value instanceof HTMLElement;

function headerCandidates(root) {
  if (!root || typeof root.querySelectorAll !== "function") return [];
  const headers = [...root.querySelectorAll(HEADER_SELECTOR)];
  if (typeof root.matches === "function" && root.matches(HEADER_SELECTOR)) headers.unshift(root);
  return headers;
}

/**
 * Attach the shared Hara header interaction contract to one header.
 *
 * Desktop applications may listen for `hara:header-menu-request` to provide a
 * product-owned drawer. The package-owned navigation panel is intentionally
 * compact-only and follows the Figma mobile shell states.
 */
export function initialiseHaraHeader(header) {
  if (!isElement(header) || header.dataset.haraHeaderReady === "true") return false;

  const menu = header.querySelector(MENU_SELECTOR);
  const navigation = header.querySelector(NAVIGATION_SELECTOR);
  if (!(menu instanceof HTMLButtonElement) || !isElement(navigation)) return false;

  const openLabel = menu.dataset.openLabel || "Open navigation";
  const closeLabel = menu.dataset.closeLabel || "Close navigation";
  const compactQuery = header.dataset.haraCompactQuery || DEFAULT_COMPACT_QUERY;
  const compact = window.matchMedia(compactQuery);

  const setOpen = (requestedOpen, { restoreFocus = false } = {}) => {
    const open = Boolean(requestedOpen && compact.matches);
    header.dataset.navigationOpen = String(open);
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? closeLabel : openLabel);
    menu.title = open ? closeLabel : openLabel;
    navigation.hidden = !open;
    navigation.setAttribute("aria-hidden", String(!open));

    header.dispatchEvent(new CustomEvent("hara:header-navigation", {
      bubbles: true,
      detail: { open, compact: compact.matches }
    }));

    if (!open && restoreFocus) menu.focus();
    return open;
  };

  menu.addEventListener("click", () => {
    if (!compact.matches) {
      header.dispatchEvent(new CustomEvent("hara:header-menu-request", {
        bubbles: true,
        cancelable: true,
        detail: { compact: false }
      }));
      return;
    }
    setOpen(header.dataset.navigationOpen !== "true");
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  header.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.dataset.navigationOpen === "true") {
      event.preventDefault();
      setOpen(false, { restoreFocus: true });
    }
  });

  const onViewportChange = (event) => {
    if (!event.matches) setOpen(false);
  };
  if (typeof compact.addEventListener === "function") compact.addEventListener("change", onViewportChange);
  else if (typeof compact.addListener === "function") compact.addListener(onViewportChange);

  header.dataset.haraHeaderReady = "true";
  setOpen(false);
  return true;
}

export function initialiseHaraHeaders(root = document) {
  return headerCandidates(root).reduce(
    (count, header) => count + (initialiseHaraHeader(header) ? 1 : 0),
    0
  );
}
