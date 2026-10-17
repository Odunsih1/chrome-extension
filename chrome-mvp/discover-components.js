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
  for (const candidate of strategies.discover(document)) {
    try {
      targets.push({
        component: candidate.component,
        label: candidate.label,
        selector: selector.uniqueElementSelector(candidate.element),
        tag: candidate.element.localName,
        id: candidate.element.id || null,
        role: candidate.element.getAttribute("role")
      });
    } catch (error) {
      errors.push({ component: candidate.component, label: candidate.label, message: error.message });
    }
  }

  chrome.runtime.sendMessage({ type: "aria-ease-discovery", discovery: { targets, errors } });
  delete globalThis.ariaEaseComponentStrategies;
  delete globalThis.ariaEaseSelector;
})();
