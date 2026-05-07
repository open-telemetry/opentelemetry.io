/**
 * Shared utilities for config documentation accordions.
 * Used by configTypesAccordion.js and (in PR D) configLangStatusAccordion.js.
 */

export function expandAll(container) {
  container.querySelectorAll('.accordion-collapse').forEach((el) => {
    el.classList.add('show');
    const btn = el
      .closest('.accordion-item')
      ?.querySelector('.accordion-button');
    if (btn) {
      btn.classList.remove('collapsed');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
}

export function collapseAll(container) {
  container.querySelectorAll('.accordion-collapse').forEach((el) => {
    el.classList.remove('show');
    const btn = el
      .closest('.accordion-item')
      ?.querySelector('.accordion-button');
    if (btn) {
      btn.classList.add('collapsed');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Show or hide accordion items based on a predicate.
 * @param {Element} container
 * @param {function(Element): boolean} predicate
 */
export function filterItems(container, predicate) {
  container.querySelectorAll('.accordion-item').forEach((item) => {
    item.classList.toggle('d-none', !predicate(item));
  });
}

export function normalizeForSearch(str) {
  return str.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Check if a type object matches a search query.
 * Searches type name, property names, and property types.
 * Descriptions are not searched because they contain pre-rendered HTML.
 * @param {{ name: string, properties?: Array<{name: string, type: string}> }} typeObj
 * @param {string} normalizedQuery - result of normalizeForSearch()
 */
export function typeMatchesSearch(typeObj, normalizedQuery) {
  if (!normalizedQuery) return true;
  if (normalizeForSearch(typeObj.name).includes(normalizedQuery)) return true;
  for (const prop of typeObj.properties ?? []) {
    if (normalizeForSearch(prop.name).includes(normalizedQuery)) return true;
    if (normalizeForSearch(prop.type).includes(normalizedQuery)) return true;
  }
  return false;
}
