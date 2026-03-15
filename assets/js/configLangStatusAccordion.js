/**
 * SDK Language Implementation Status Accordion
 * Collapsible list view for browsing language support with filtering and search
 *
 * @module ConfigLangStatusAccordion
 */

(function () {
  'use strict';

  // Constants
  const DEBOUNCE_DELAY = 300; // milliseconds
  const LOCAL_STORAGE_KEY = 'config-lang-status-preferences';
  const URL_PARAM_SEARCH = 'search';
  const URL_PARAM_FILTER = 'filter';

  // I18n strings (can be overridden)
  const i18nStrings = {
    searchPlaceholder: 'Filter by type name...',
    allTypes: 'All types',
    stableOnly: 'Stable only',
    experimentalOnly: 'Experimental only',
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
    showingText: 'Showing',
    ofText: 'of',
    typesText: 'types',
    noDataAvailable: 'No data available',
    notes: 'Notes:',
    properties: 'Properties:',
    version: 'version:'
  };

  /**
   * Status data structure containing languages and types
   * @type {Object}
   */
  const statusData = {
    languages: {},
    types: [],
    languageOrder: [] // Order in which languages appear
  };

  /**
   * Event listeners array for cleanup
   * @type {Array<{element: HTMLElement, event: string, handler: Function}>}
   */
  const eventListeners = [];

  /**
   * Escapes HTML to prevent XSS attacks
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Sanitizes HTML content by parsing and reconstructing it safely
   * @param {string} html - HTML content to sanitize
   * @returns {string} Sanitized HTML
   */
  function sanitizeHtml(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Only allow specific tags and attributes
    const allowedTags = ['br', 'strong', 'em', 'code', 'ul', 'li'];
    const cleanHtml = Array.from(temp.childNodes)
      .map(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          return escapeHtml(node.textContent);
        }
        if (node.nodeType === Node.ELEMENT_NODE && allowedTags.includes(node.tagName.toLowerCase())) {
          return node.outerHTML;
        }
        return escapeHtml(node.textContent);
      })
      .join('');

    return cleanHtml;
  }

  /**
   * Adds an event listener and tracks it for cleanup
   * @param {HTMLElement} element - Element to attach listener to
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  function addTrackedEventListener(element, event, handler) {
    if (!element) {
      console.error(`Cannot add event listener: element is null for event "${event}"`);
      return;
    }
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
  }

  /**
   * Removes all tracked event listeners
   */
  function removeAllEventListeners() {
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
  function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Parses existing markdown-rendered content to populate data structure
   * Dynamically discovers languages from the content
   */
  function parseExistingContent() {
    const content = document.querySelector('.language-implementation-status-content');
    if (!content) {
      console.error('Could not find .language-implementation-status-content element');
      return false;
    }

    const sections = content.querySelectorAll('h3');

    if (sections.length === 0) {
      console.warn('No language sections found in content');
      return false;
    }

    // Dynamically parse languages from content
    sections.forEach(section => {
      const langId = section.id;
      if (!langId) {
        console.warn('Section found without ID', section);
        return;
      }

      // Get language name from section content
      const langName = section.textContent.trim();

      // Initialize language in statusData
      if (!statusData.languages[langId]) {
        statusData.languages[langId] = {
          name: langName,
          version: '',
          types: {}
        };
        statusData.languageOrder.push(langId);
      }

      // Find version and table
      let currentElement = section.nextElementSibling;
      let table = null;

      while (currentElement) {
        // Match version string more robustly
        if (currentElement.textContent) {
          const versionMatch = currentElement.textContent.match(/Latest supported file format:\s*`?([^`\n]+)`?/);
          if (versionMatch) {
            statusData.languages[langId].version = versionMatch[1].trim();
          }
        }

        if (currentElement.tagName === 'TABLE') {
          table = currentElement;
          break;
        }

        // Stop if we hit another h3 (next language section)
        if (currentElement.tagName === 'H3') {
          break;
        }

        currentElement = currentElement.nextElementSibling;
      }

      if (table) {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 2) {
            const typeLink = cells[0].querySelector('a');
            const typeName = (typeLink?.textContent || cells[0].textContent).trim();
            const status = cells[1].textContent.trim();
            const notes = cells[2]?.textContent.trim() || '';
            // Use textContent instead of innerHTML to prevent XSS
            const detailsText = cells[3]?.textContent.trim() || '';
            // If we need HTML, sanitize it
            const detailsHtml = cells[3]?.innerHTML ? sanitizeHtml(cells[3].innerHTML) : '';

            if (!statusData.types.includes(typeName)) {
              statusData.types.push(typeName);
            }

            statusData.languages[langId].types[typeName] = {
              status: status,
              notes: notes,
              detailsText: detailsText,
              detailsHtml: detailsHtml
            };
          }
        });
      } else {
        console.warn(`No table found for language: ${langId}`);
      }
    });

    statusData.types.sort();

    console.log(`Parsed ${statusData.languageOrder.length} languages and ${statusData.types.length} types`);
    return true;
  }

  /**
   * Creates a status badge element
   * @param {string} status - Status value
   * @returns {HTMLSpanElement} Badge element
   */
  function createStatusBadge(status) {
    const span = document.createElement('span');
    span.className = 'badge';

    const statusConfig = {
      supported: { class: 'bg-success', text: '✓ Supported' },
      not_implemented: { class: 'bg-danger', text: '✗ Not implemented' },
      unknown: { class: 'bg-warning text-dark', text: '? Unknown' },
      not_applicable: { class: 'bg-secondary', text: 'N/A' },
      ignored: { class: 'bg-info', text: '○ Ignored' }
    };

    const config = statusConfig[status] || { class: 'bg-light text-dark', text: status };
    span.className += ' ' + config.class;
    span.textContent = config.text;

    return span;
  }

  /**
   * Renders the accordion with all types
   */
  function renderAccordion() {
    const accordion = document.getElementById('statusAccordion');
    if (!accordion) {
      console.error('statusAccordion element not found');
      return false;
    }

    // Clear existing content
    accordion.innerHTML = '';

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    statusData.types.forEach((typeName, index) => {
      const item = document.createElement('div');
      item.className = 'accordion-item';
      item.dataset.typeName = typeName;
      item.dataset.experimental = typeName.startsWith('Experimental') ? 'true' : 'false';

      const headerId = `heading-${index}`;
      const collapseId = `collapse-${index}`;

      // Create accordion header
      const header = document.createElement('h2');
      header.className = 'accordion-header';
      header.id = headerId;

      const button = document.createElement('button');
      button.className = 'accordion-button collapsed';
      button.type = 'button';
      button.setAttribute('data-bs-toggle', 'collapse');
      button.setAttribute('data-bs-target', `#${collapseId}`);
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', collapseId);

      const buttonContent = document.createElement('div');
      buttonContent.className = 'd-flex w-100 justify-content-between align-items-center pe-3';

      // Type name with link
      const typeNameSpan = document.createElement('span');
      typeNameSpan.className = 'type-name';
      const typeLink = document.createElement('a');
      typeLink.href = `../types#${typeName.toLowerCase()}`;
      typeLink.textContent = typeName;
      typeLink.onclick = (e) => e.stopPropagation();
      typeNameSpan.appendChild(typeLink);

      // Language status summary with accessibility
      const statusSummary = document.createElement('span');
      statusSummary.className = 'lang-status-summary';
      statusSummary.setAttribute('role', 'list');
      statusSummary.setAttribute('aria-label', 'Language support status');

      statusData.languageOrder.forEach((langId, langIndex) => {
        const langName = statusData.languages[langId].name;
        const position = langIndex + 1;
        const typeData = statusData.languages[langId].types[typeName];

        const pill = document.createElement('span');
        pill.className = 'lang-status-pill';
        pill.setAttribute('role', 'listitem');
        pill.dataset.position = position;

        if (typeData) {
          const statusLabel = typeData.status.replace(/_/g, ' ');
          pill.classList.add(`status-${typeData.status}`);
          pill.title = `${langName}: ${statusLabel}`;
          pill.setAttribute('aria-label', `${langName}: ${statusLabel}`);
        } else {
          pill.classList.add('status-missing');
          pill.title = `${langName}: No data`;
          pill.setAttribute('aria-label', `${langName}: No data`);
        }

        pill.textContent = position;
        statusSummary.appendChild(pill);
      });

      buttonContent.appendChild(typeNameSpan);
      buttonContent.appendChild(statusSummary);
      button.appendChild(buttonContent);
      header.appendChild(button);

      // Create collapsible body
      const collapseDiv = document.createElement('div');
      collapseDiv.id = collapseId;
      collapseDiv.className = 'accordion-collapse collapse';
      collapseDiv.setAttribute('aria-labelledby', headerId);
      collapseDiv.setAttribute('data-bs-parent', '#statusAccordion');

      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'accordion-body';
      bodyDiv.appendChild(generateAccordionBody(typeName));

      collapseDiv.appendChild(bodyDiv);

      item.appendChild(header);
      item.appendChild(collapseDiv);
      fragment.appendChild(item);
    });

    accordion.appendChild(fragment);
    updateStats();
    return true;
  }

  /**
   * Generates the accordion body content for a type
   * @param {string} typeName - Type name
   * @returns {HTMLDivElement} Body content element
   */
  function generateAccordionBody(typeName) {
    const row = document.createElement('div');
    row.className = 'row g-3';

    statusData.languageOrder.forEach(langId => {
      const langData = statusData.languages[langId];
      const typeData = langData.types[typeName];

      const col = document.createElement('div');
      col.className = 'col-md-6';

      const card = document.createElement('div');
      card.className = 'lang-support-card';

      const heading = document.createElement('h6');
      heading.textContent = langData.name;

      if (langData.version) {
        const versionSmall = document.createElement('small');
        versionSmall.className = 'text-muted';
        versionSmall.textContent = ` (${i18nStrings.version} ${langData.version})`;
        heading.appendChild(versionSmall);
      }

      card.appendChild(heading);

      if (typeData) {
        const badgeDiv = document.createElement('div');
        badgeDiv.className = 'mb-2';
        badgeDiv.appendChild(createStatusBadge(typeData.status));
        card.appendChild(badgeDiv);

        if (typeData.notes) {
          const notesP = document.createElement('p');
          notesP.className = 'small';
          const notesStrong = document.createElement('strong');
          notesStrong.textContent = `${i18nStrings.notes} `;
          notesP.appendChild(notesStrong);
          notesP.appendChild(document.createTextNode(typeData.notes));
          card.appendChild(notesP);
        }

        if (typeData.detailsHtml) {
          const detailsDiv = document.createElement('div');
          detailsDiv.className = 'property-support';
          const detailsStrong = document.createElement('strong');
          detailsStrong.textContent = `${i18nStrings.properties}`;
          detailsDiv.appendChild(detailsStrong);
          detailsDiv.appendChild(document.createElement('br'));
          // Use sanitized HTML
          detailsDiv.innerHTML += typeData.detailsHtml;
          card.appendChild(detailsDiv);
        }
      } else {
        const noDataP = document.createElement('p');
        noDataP.className = 'text-muted';
        noDataP.textContent = i18nStrings.noDataAvailable;
        card.appendChild(noDataP);
      }

      col.appendChild(card);
      row.appendChild(col);
    });

    return row;
  }

  /**
   * Updates the visible/total stats display
   */
  function updateStats() {
    const items = document.querySelectorAll('.accordion-item');
    const visibleItems = Array.from(items).filter(item => !item.classList.contains('d-none'));

    const visibleCount = document.getElementById('accordion-visible-count');
    const totalCount = document.getElementById('accordion-total-count');

    if (visibleCount) visibleCount.textContent = visibleItems.length;
    if (totalCount) totalCount.textContent = items.length;
  }

  /**
   * Applies search and filter to accordion items
   */
  function applyFilters() {
    const searchInput = document.getElementById('accordion-search');
    const filterSelect = document.getElementById('accordion-type-filter');

    if (!searchInput || !filterSelect) {
      console.error('Filter controls not found');
      return;
    }

    const searchTerm = searchInput.value.toLowerCase();
    const typeFilter = filterSelect.value;

    const items = document.querySelectorAll('.accordion-item');

    items.forEach(item => {
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

    updateStats();
    savePreferences();
    updateUrlParams();
  }

  /**
   * Expands all accordion items
   */
  function expandAll() {
    const buttons = document.querySelectorAll('.accordion-button.collapsed');
    buttons.forEach(button => button.click());
  }

  /**
   * Collapses all accordion items
   */
  function collapseAll() {
    const buttons = document.querySelectorAll('.accordion-button:not(.collapsed)');
    buttons.forEach(button => button.click());
  }

  /**
   * Saves user preferences to localStorage
   */
  function savePreferences() {
    try {
      const searchInput = document.getElementById('accordion-search');
      const filterSelect = document.getElementById('accordion-type-filter');

      if (!searchInput || !filterSelect) return;

      const preferences = {
        search: searchInput.value,
        filter: filterSelect.value
      };

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.warn('Could not save preferences to localStorage:', e);
    }
  }

  /**
   * Loads user preferences from localStorage
   */
  function loadPreferences() {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
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
   */
  function updateUrlParams() {
    const searchInput = document.getElementById('accordion-search');
    const filterSelect = document.getElementById('accordion-type-filter');

    if (!searchInput || !filterSelect) return;

    const url = new URL(window.location);

    if (searchInput.value) {
      url.searchParams.set(URL_PARAM_SEARCH, searchInput.value);
    } else {
      url.searchParams.delete(URL_PARAM_SEARCH);
    }

    if (filterSelect.value && filterSelect.value !== 'all') {
      url.searchParams.set(URL_PARAM_FILTER, filterSelect.value);
    } else {
      url.searchParams.delete(URL_PARAM_FILTER);
    }

    // Update URL without reloading page
    window.history.replaceState({}, '', url);
  }

  /**
   * Loads filter state from URL parameters
   */
  function loadFromUrlParams() {
    const url = new URL(window.location);
    const searchParam = url.searchParams.get(URL_PARAM_SEARCH);
    const filterParam = url.searchParams.get(URL_PARAM_FILTER);

    return {
      search: searchParam || '',
      filter: filterParam || 'all'
    };
  }

  /**
   * Restores filter state from URL or localStorage
   */
  function restoreFilterState() {
    const searchInput = document.getElementById('accordion-search');
    const filterSelect = document.getElementById('accordion-type-filter');

    if (!searchInput || !filterSelect) return;

    // URL params take precedence over localStorage
    const urlState = loadFromUrlParams();
    const hasUrlState = urlState.search || urlState.filter !== 'all';

    const state = hasUrlState ? urlState : (loadPreferences() || urlState);

    searchInput.value = state.search || '';
    filterSelect.value = state.filter || 'all';

    applyFilters();
  }

  /**
   * Destroys the component and cleans up resources
   */
  function destroy() {
    removeAllEventListeners();
    console.log('ConfigLangStatusAccordion destroyed');
  }

  /**
   * Initializes the accordion component
   * @returns {boolean} Success status
   */
  function init() {
    const container = document.getElementById('config-lang-status-accordion-container');
    if (!container) {
      // Component not on this page, exit silently
      return false;
    }

    console.log('Initializing ConfigLangStatusAccordion...');

    // Parse content
    if (!parseExistingContent()) {
      console.error('Failed to parse content');
      return false;
    }

    // Render accordion
    if (!renderAccordion()) {
      console.error('Failed to render accordion');
      return false;
    }

    // Set up event listeners with debouncing for search
    const searchInput = document.getElementById('accordion-search');
    const filterSelect = document.getElementById('accordion-type-filter');
    const expandBtn = document.getElementById('expand-all');
    const collapseBtn = document.getElementById('collapse-all');

    if (searchInput) {
      addTrackedEventListener(searchInput, 'input', debounce(applyFilters, DEBOUNCE_DELAY));
    }

    if (filterSelect) {
      addTrackedEventListener(filterSelect, 'change', applyFilters);
    }

    if (expandBtn) {
      addTrackedEventListener(expandBtn, 'click', expandAll);
    }

    if (collapseBtn) {
      addTrackedEventListener(collapseBtn, 'click', collapseAll);
    }

    // Restore previous filter state
    restoreFilterState();

    // Clean up on page unload
    addTrackedEventListener(window, 'beforeunload', destroy);

    console.log('ConfigLangStatusAccordion initialized successfully');
    return true;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose destroy function for cleanup if needed
  window.ConfigLangStatusAccordion = {
    destroy: destroy
  };

})();