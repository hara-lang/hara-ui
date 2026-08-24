import test from "node:test";
import assert from "node:assert/strict";

class FakeElement extends EventTarget {
  constructor() {
    super();
    this.dataset = {};
    this.attributes = new Map();
    this.hidden = false;
    this.focused = false;
    this.menu = null;
    this.navigation = null;
  }

  querySelector(selector) {
    if (selector === "[data-hara-header-menu]") return this.menu;
    if (selector === "[data-hara-mobile-navigation]") return this.navigation;
    return null;
  }

  querySelectorAll() {
    return [];
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  focus() {
    this.focused = true;
  }
}

class FakeButton extends FakeElement {}

const previous = {
  HTMLElement: globalThis.HTMLElement,
  HTMLButtonElement: globalThis.HTMLButtonElement,
  CustomEvent: globalThis.CustomEvent,
  window: globalThis.window
};

globalThis.HTMLElement = FakeElement;
globalThis.HTMLButtonElement = FakeButton;
globalThis.CustomEvent = class extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.detail = options.detail;
  }
};
globalThis.window = {
  matchMedia() {
    return {
      matches: true,
      addEventListener() {},
      addListener() {}
    };
  }
};

const {
  initialiseHaraHeader,
  setHaraHeaderMenuState
} = await import("../foundation/v2/header.js");

test.after(() => {
  globalThis.HTMLElement = previous.HTMLElement;
  globalThis.HTMLButtonElement = previous.HTMLButtonElement;
  globalThis.CustomEvent = previous.CustomEvent;
  globalThis.window = previous.window;
});

function productHeader() {
  const header = new FakeElement();
  const menu = new FakeButton();
  header.menu = menu;
  header.dataset.haraMenuMode = "product";
  header.dataset.navigationOpen = "false";
  menu.dataset.openLabel = "Open catalogue";
  menu.dataset.closeLabel = "Close catalogue";
  menu.setAttribute("aria-controls", "product-catalogue");
  return { header, menu };
}

test("product mode initializes without a package-owned compact navigation", () => {
  const { header, menu } = productHeader();
  let request;
  header.addEventListener("hara:header-menu-request", (event) => {
    request = event.detail;
  });

  assert.equal(initialiseHaraHeader(header), true);
  menu.dispatchEvent(new Event("click"));

  assert.deepEqual(request, {
    open: true,
    compact: true,
    reason: "trigger",
    restoreFocus: false
  });
  assert.equal(header.dataset.navigationOpen, "false", "the product acknowledges its own drawer state");
});

test("the public helper synchronizes a product-owned drawer button", () => {
  const { header, menu } = productHeader();

  assert.equal(setHaraHeaderMenuState(header, true, {
    compact: true,
    syncNavigation: false
  }), true);
  assert.equal(header.dataset.navigationOpen, "true");
  assert.equal(menu.getAttribute("aria-expanded"), "true");
  assert.equal(menu.getAttribute("aria-label"), "Close catalogue");

  assert.equal(setHaraHeaderMenuState(header, false, {
    compact: true,
    syncNavigation: false,
    restoreFocus: true
  }), false);
  assert.equal(menu.getAttribute("aria-expanded"), "false");
  assert.equal(menu.getAttribute("aria-label"), "Open catalogue");
  assert.equal(menu.focused, true);
});

test("navigation mode retains ownership of its compact link panel", () => {
  const header = new FakeElement();
  const menu = new FakeButton();
  const navigation = new FakeElement();
  header.menu = menu;
  header.navigation = navigation;
  header.dataset.haraMenuMode = "navigation";
  menu.setAttribute("aria-controls", "shared-navigation");

  assert.equal(setHaraHeaderMenuState(header, true, { compact: true }), true);
  assert.equal(navigation.hidden, false);
  assert.equal(navigation.getAttribute("aria-hidden"), "false");

  assert.equal(setHaraHeaderMenuState(header, false, { compact: true }), false);
  assert.equal(navigation.hidden, true);
  assert.equal(navigation.getAttribute("aria-hidden"), "true");
});
