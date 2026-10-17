(() => {
  const strategies = globalThis.ariaEaseComponentStrategies;
  const selector = globalThis.ariaEaseSelector;
  if (!strategies || !selector) {
    chrome.runtime.sendMessage({
      type: "aria-ease-discovery-error",
      message: "The component discovery helpers could not be loaded."
    });
    return;
  }

  const targets = [];
  const errors = [];
  const highlightClass = "aria-ease-discovered-component";
  const styleId = "aria-ease-discovery-highlight-style";
  document.querySelectorAll(`.${highlightClass}`).forEach((element) => {
    element.classList.remove(highlightClass);
    element.removeAttribute("data-aria-ease-discovered-type");
  });
  document.getElementById(styleId)?.remove();

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .${highlightClass} {
      outline: 3px solid #2563eb !important;
      outline-offset: 3px !important;
      box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.22) !important;
    }
  `;
  (document.head || document.documentElement).append(style);

  for (const candidate of strategies.discover(document)) {
    try {
      const uniqueSelector = selector.uniqueElementSelector(candidate.element);
      candidate.element.classList.add(highlightClass);
      candidate.element.setAttribute("data-aria-ease-discovered-type", candidate.component);
      targets.push({
        component: candidate.component,
        label: candidate.label,
        selector: uniqueSelector,
        tag: candidate.element.localName,
        id: candidate.element.id || null,
        role: candidate.element.getAttribute("role")
      });
    } catch (error) {
      errors.push({ component: candidate.component, label: candidate.label, message: error.message });
    }
  }

  if (!targets.length) style.remove();

  chrome.runtime.sendMessage({ type: "aria-ease-discovery", discovery: { targets, errors } });
  delete globalThis.ariaEaseComponentStrategies;
  delete globalThis.ariaEaseSelector;
})();
