/**
 * Shared Accordion Utilities
 * Common functionality used by both config types and language status accordions
 *
 * @module AccordionUtils
 */

/**
 * Escapes HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitizes HTML content by parsing and reconstructing it safely
 * @param {string} html - HTML content to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Only allow specific tags and no attributes (to prevent XSS via event handlers)
  const allowedTags = ['br', 'strong', 'em', 'code', 'ul', 'li'];

  function sanitizeNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeHtml(node.textContent);
    }
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      allowedTags.includes(node.tagName.toLowerCase())
    ) {
      // Create a clean element without any attributes
      const tagName = node.tagName.toLowerCase();
      const children = Array.from(node.childNodes).map(sanitizeNode).join('');
      return `<${tagName}>${children}</${tagName}>`;
    }
    return escapeHtml(node.textContent);
  }

  const cleanHtml = Array.from(temp.childNodes).map(sanitizeNode).join('');

  return cleanHtml;
}

/**
 * Adds an event listener and tracks it for cleanup
 * @param {Array} eventListeners - Array to store event listener references
 * @param {HTMLElement} element - Element to attach listener to
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 */
export function addTrackedEventListener(
  eventListeners,
  element,
  event,
  handler,
) {
  if (!element) {
    console.error(
      `Cannot add event listener: element is null for event "${event}"`,
    );
    return;
  }
  element.addEventListener(event, handler);
  eventListeners.push({ element, event, handler });
}

/**
 * Removes all tracked event listeners
 * @param {Array} eventListeners - Array containing event listener references
 */
export function removeAllEventListeners(eventListeners) {
  eventListeners.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler);
  });
  eventListeners.length = 0;
}

/**
 * Debounces a function call
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Updates the visible/total stats display
 * @param {HTMLElement} container - Container element with accordion items
 */
export function updateStats(container) {
  if (!container) return;

  const items = container.querySelectorAll('.accordion-item');
  const visibleItems = Array.from(items).filter(
    (item) => !item.classList.contains('d-none'),
  );

  const visibleCount = container.querySelector('.accordion-visible-count');
  const totalCount = container.querySelector('.accordion-total-count');

  if (visibleCount) visibleCount.textContent = visibleItems.length;
  if (totalCount) totalCount.textContent = items.length;
}

/**
 * Applies search and filter to accordion items
 * @param {HTMLElement} container - Container element with accordion items
 * @param {Function} savePreferencesCallback - Callback to save preferences
 * @param {Function} updateUrlParamsCallback - Callback to update URL params
 */
export function applyFilters(
  container,
  savePreferencesCallback,
  updateUrlParamsCallback,
) {
  if (!container) return;

  const searchInput = container.querySelector('.accordion-search-input');
  const filterSelect = container.querySelector('.accordion-type-filter-select');

  if (!searchInput || !filterSelect) {
    console.error('Filter controls not found');
    return;
  }

  const searchTerm = searchInput.value.toLowerCase();
  const typeFilter = filterSelect.value;

  const items = container.querySelectorAll('.accordion-item');

  items.forEach((item) => {
    const typeName = (item.dataset.typeName || '').toLowerCase();
    const isExperimental = item.dataset.experimental === 'true';

    const matchesSearch = typeName.includes(searchTerm);

    let matchesTypeFilter = true;
    if (typeFilter === 'stable') {
      matchesTypeFilter = !isExperimental;
    } else if (typeFilter === 'experimental') {
      matchesTypeFilter = isExperimental;
    }

    if (matchesSearch && matchesTypeFilter) {
      item.classList.remove('d-none');
    } else {
      item.classList.add('d-none');
    }
  });

  updateStats(container);

  if (savePreferencesCallback) {
    savePreferencesCallback();
  }

  if (updateUrlParamsCallback) {
    updateUrlParamsCallback();
  }
}

/**
 * Expands all accordion items
 * @param {HTMLElement} container - Container element with accordion items
 */
export function expandAll(container) {
  if (!container) return;

  const buttons = container.querySelectorAll('.accordion-button.collapsed');
  buttons.forEach((button) => button.click());
}

/**
 * Collapses all accordion items
 * @param {HTMLElement} container - Container element with accordion items
 */
export function collapseAll(container) {
  if (!container) return;

  const buttons = container.querySelectorAll(
    '.accordion-button:not(.collapsed)',
  );
  buttons.forEach((button) => button.click());
}

/**
 * Saves user preferences to localStorage
 * @param {HTMLElement} container - Container element with filter controls
 * @param {string} localStorageKey - Key to use for localStorage
 */
export function savePreferences(container, localStorageKey) {
  if (!container) return;

  try {
    const searchInput = container.querySelector('.accordion-search-input');
    const filterSelect = container.querySelector(
      '.accordion-type-filter-select',
    );

    if (!searchInput || !filterSelect) return;

    const preferences = {
      search: searchInput.value,
      filter: filterSelect.value,
    };

    localStorage.setItem(localStorageKey, JSON.stringify(preferences));
  } catch (e) {
    console.warn('Could not save preferences to localStorage:', e);
  }
}

/**
 * Loads user preferences from localStorage
 * @param {string} localStorageKey - Key to use for localStorage
 * @returns {Object|null} Preferences object or null
 */
export function loadPreferences(localStorageKey) {
  try {
    const stored = localStorage.getItem(localStorageKey);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Could not load preferences from localStorage:', e);
  }
  return null;
}

/**
 * Updates URL parameters with current filter state
 * @param {HTMLElement} container - Container element with filter controls
 * @param {string} searchParamName - URL parameter name for search
 * @param {string} filterParamName - URL parameter name for filter
 */
export function updateUrlParams(container, searchParamName, filterParamName) {
  if (!container) return;

  const searchInput = container.querySelector('.accordion-search-input');
  const filterSelect = container.querySelector('.accordion-type-filter-select');

  if (!searchInput || !filterSelect) return;

  const url = new URL(window.location);

  if (searchInput.value) {
    url.searchParams.set(searchParamName, searchInput.value);
  } else {
    url.searchParams.delete(searchParamName);
  }

  if (filterSelect.value && filterSelect.value !== 'all') {
    url.searchParams.set(filterParamName, filterSelect.value);
  } else {
    url.searchParams.delete(filterParamName);
  }

  // Update URL without reloading page
  window.history.replaceState({}, '', url);
}

/**
 * Loads filter state from URL parameters
 * @param {string} searchParamName - URL parameter name for search
 * @param {string} filterParamName - URL parameter name for filter
 * @returns {Object} State object with search and filter values
 */
export function loadFromUrlParams(searchParamName, filterParamName) {
  const url = new URL(window.location);
  const searchParam = url.searchParams.get(searchParamName);
  const filterParam = url.searchParams.get(filterParamName);

  return {
    search: searchParam || '',
    filter: filterParam || 'all',
  };
}
