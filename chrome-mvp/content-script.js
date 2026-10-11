(() => {
  if (window.__ariaEaseSelectionActive) return;
  window.__ariaEaseSelectionActive = true;
  const overlay = document.createElement("div");
  overlay.setAttribute("data-aria-ease-selector-overlay", "true");
  Object.assign(overlay.style, {
    position: "fixed",
    zIndex: "2147483647",
    pointerEvents: "none",
    border: "2px solid #2563eb",
    background: "rgba(37, 99, 235, 0.12)",
    display: "none"
  });
  document.documentElement.appendChild(overlay);

  const describe = (element) => {
    const selector = window.ariaEaseSelector.uniqueSelector(element);
    return window.ariaEaseSelector.selectedMetadata(element, selector);
  };

  const move = (event) => {
    const element = event.target instanceof Element ? event.target : null;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    Object.assign(overlay.style, {
      display: "block",
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`
    });
  };

  const click = (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    try {
      const element = event.target instanceof Element
        ? event.target.closest('[role="combobox"]')
        : null;
      if (!element || element.getAttribute("role") !== "combobox") {
        throw new Error("Select a combobox (an element with role=\"combobox\").");
      }
      const selector = window.ariaEaseSelector.uniqueSelector(element);
      chrome.runtime.sendMessage({ type: "aria-ease-selection", selection: window.ariaEaseSelector.selectedMetadata(element, selector) }).catch(() => {});
      cleanup();
    } catch (error) {
      chrome.runtime.sendMessage({ type: "aria-ease-selection-error", message: error instanceof Error ? error.message : String(error) }).catch(() => {});
    }
  };

  const keydown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopImmediatePropagation();
      chrome.runtime.sendMessage({ type: "aria-ease-selection-cancelled" }).catch(() => {});
      cleanup();
    }
  };

  const cleanup = () => {
    document.removeEventListener("mousemove", move, true);
    document.removeEventListener("click", click, true);
    document.removeEventListener("keydown", keydown, true);
    overlay.remove();
    delete window.ariaEaseSelector;
    window.__ariaEaseSelectionActive = false;
  };

  window.ariaEaseSelector = {
    uniqueSelector: (element) => {
      if (!(element instanceof Element) || element.getAttribute("role") !== "combobox") throw new Error("Select a combobox.");
      if (element.id && /^[A-Za-z_][A-Za-z0-9_-]*$/.test(element.id) && document.querySelectorAll(`#${element.id}`).length === 1) return `#${element.id}`;
      const parts = [];
      let current = element;
      while (current && current !== document.documentElement) {
        let part = current.localName;
        if (current.getAttribute("role") === "combobox") part += '[role="combobox"]';
        const siblings = current.parentElement ? [...current.parentElement.children].filter((candidate) => candidate.localName === current.localName) : [];
        if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
        parts.unshift(part);
        const candidate = parts.join(" > ");
        if (document.querySelectorAll(candidate).length === 1) return candidate;
        current = current.parentElement;
      }
      throw new Error("Could not generate a unique selector for this combobox.");
    },
    selectedMetadata: (element, selector) => ({
      selector,
      tag: element.localName,
      id: element.id || null,
      role: element.getAttribute("role"),
      accessibleNameAttributes: {
        ariaLabel: element.getAttribute("aria-label"),
        ariaLabelledby: element.getAttribute("aria-labelledby"),
        title: element.getAttribute("title")
      },
      aria: Object.fromEntries([...element.attributes].filter((attribute) => attribute.name === "role" || attribute.name.startsWith("aria-")).map((attribute) => [attribute.name, attribute.value]))
    })
  };
  document.addEventListener("mousemove", move, true);
  document.addEventListener("click", click, true);
  document.addEventListener("keydown", keydown, true);
  chrome.runtime.sendMessage({ type: "aria-ease-selection-ready" }).catch(() => {});
})();
