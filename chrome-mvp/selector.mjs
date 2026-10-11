export function isComboboxElement(element) {
  return element instanceof Element && element.getAttribute("role") === "combobox";
}

function cssIdentifier(value) {
  return /^[A-Za-z_][A-Za-z0-9_-]*$/.test(value);
}

function simpleSelector(element) {
  if (element.id && cssIdentifier(element.id)) return `#${element.id}`;
  const tag = element.localName;
  const classes = [...element.classList].filter(cssIdentifier).slice(0, 2);
  return `${tag}${classes.length ? `.${classes.join(".")}` : ""}`;
}

export function uniqueSelector(element, documentRef = element.ownerDocument) {
  if (!isComboboxElement(element)) {
    throw new Error("Select an element with role=\"combobox\".");
  }

  if (element.id && cssIdentifier(element.id)) {
    const idSelector = `#${element.id}`;
    if (documentRef.querySelectorAll(idSelector).length === 1) return idSelector;
  }

  const parts = [];
  let current = element;
  while (current && current.nodeType === Node.ELEMENT_NODE && current !== documentRef.documentElement) {
    const base = simpleSelector(current);
    const siblings = current.parentElement
      ? [...current.parentElement.children].filter((candidate) => candidate.matches(base))
      : [];
    const part = siblings.length > 1 ? `${base}:nth-of-type(${[...current.parentElement.children].indexOf(current) + 1})` : base;
    parts.unshift(part);
    const candidate = parts.join(" > ");
    if (documentRef.querySelectorAll(candidate).length === 1) return candidate;
    current = current.parentElement;
  }
  throw new Error("Could not generate a unique CSS selector for this combobox. Add a unique ID and retry.");
}

export function selectedMetadata(element, selector) {
  const attributes = {};
  for (const attribute of element.attributes) {
    if (attribute.name === "role" || attribute.name.startsWith("aria-") || ["id", "name", "title"].includes(attribute.name)) {
      attributes[attribute.name] = attribute.value;
    }
  }
  return {
    selector,
    tag: element.localName,
    id: element.id || null,
    role: element.getAttribute("role"),
    accessibleNameAttributes: {
      ariaLabel: element.getAttribute("aria-label"),
      ariaLabelledby: element.getAttribute("aria-labelledby"),
      title: element.getAttribute("title")
    },
    aria: attributes
  };
}
