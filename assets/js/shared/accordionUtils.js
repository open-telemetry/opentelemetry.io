/**
 * Shared Accordion Utilities
 * Common functionality used by both config types and language status accordions
 *
 * @module AccordionUtils
 */

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

export function expandAll(container) {
  if (!container) return;

  const buttons = container.querySelectorAll('.accordion-button.collapsed');
  buttons.forEach((button) => button.click());
}

export function collapseAll(container) {
  if (!container) return;

  const buttons = container.querySelectorAll(
    '.accordion-button:not(.collapsed)',
  );
  buttons.forEach((button) => button.click());
}

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

export function loadFromUrlParams(searchParamName, filterParamName) {
  const url = new URL(window.location);
  const searchParam = url.searchParams.get(searchParamName);
  const filterParam = url.searchParams.get(filterParamName);

  return {
    search: searchParam || '',
    filter: filterParam || 'all',
  };
}
