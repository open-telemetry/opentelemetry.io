/**
 * Configuration Types Accordion
 * Collapsible list view for browsing configuration types with filtering and search
 *
 * @module ConfigTypesAccordion
 */

import * as AccordionUtils from './shared/accordionUtils.js';

(function () {
  'use strict';

  const DEBOUNCE_DELAY = 300; // milliseconds
  const LOCAL_STORAGE_KEY = 'config-types-preferences';
  const URL_PARAM_SEARCH = 'search';
  const URL_PARAM_FILTER = 'filter';

  // I18n strings (defaults, overridden by data-i18n attribute)
  let i18nStrings = {
    searchPlaceholder: 'Filter by type name...',
    allTypes: 'All types',
    stableOnly: 'Stable only',
    experimentalOnly: 'Experimental only',
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
    showingText: 'Showing',
    ofText: 'of',
    typesText: 'types',
  };

  /**
   * Types data structure
   * @type {Object}
   */
  const typesData = {
    types: [],
  };

  /**
   * Event listeners array for cleanup
   * @type {Array<{element: HTMLElement, event: string, handler: Function}>}
   */
  const eventListeners = [];

  /**
   * Container element for the accordion
   * @type {HTMLElement|null}
   */
  let container = null;

  /**
   * Parses existing markdown-rendered content to populate data structure
   */
  function parseExistingContent() {
    const content = document.querySelector('.config-types-content');
    if (!content) {
      console.error('Could not find .config-types-content element');
      return false;
    }

    // Find all type sections (h3 headers with IDs)
    const typeHeaders = content.querySelectorAll('h3[id]');

    if (typeHeaders.length === 0) {
      console.warn('No type headers found in content');
      return false;
    }

    typeHeaders.forEach((header) => {
      const typeId = header.id;
      const typeName = header.textContent.trim();

      // Determine if experimental
      const isExperimental = typeName.toLowerCase().startsWith('experimental');

      // Find the next table or paragraph elements after this header
      let currentElement = header.nextElementSibling;
      let table = null;
      let description = '';
      let constraints = '';
      let hasNoProperties = false;

      while (currentElement) {
        // Stop if we hit another h3 (next type section)
        if (currentElement.tagName === 'H3') {
          break;
        }

        // Check for "No properties" text
        if (
          currentElement.tagName === 'P' &&
          currentElement.textContent.includes('No properties')
        ) {
          hasNoProperties = true;
        }

        // Look for table
        if (currentElement.tagName === 'TABLE' && !table) {
          table = currentElement;
        }

        // Look for constraints paragraph (usually after the table)
        if (
          currentElement.tagName === 'P' &&
          currentElement.textContent.includes('Constraints:')
        ) {
          const constraintsText = currentElement.textContent
            .replace('Constraints:', '')
            .trim();
          constraints = constraintsText;
          // Also check for following lines
          let nextEl = currentElement.nextElementSibling;
          while (
            nextEl &&
            nextEl.tagName !== 'H3' &&
            nextEl.tagName !== 'TABLE'
          ) {
            if (nextEl.textContent && nextEl.textContent.trim()) {
              constraints += ' ' + nextEl.textContent.trim();
            }
            nextEl = nextEl.nextElementSibling;
          }
        }

        currentElement = currentElement.nextElementSibling;
      }

      // Extract properties from table if exists
      const properties = [];
      if (table && !hasNoProperties) {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach((row) => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 1) {
            const propertyName = cells[0].textContent.trim();
            const propertyType = cells[1]?.textContent.trim() || '';
            const propertyDefault = cells[2]?.textContent.trim() || '';
            const propertyConstraints = cells[3]?.textContent.trim() || '';
            const propertyDescription =
              cells[4]?.textContent.trim() ||
              cells[3]?.textContent.trim() ||
              '';

            properties.push({
              name: propertyName,
              type: propertyType,
              default: propertyDefault,
              constraints: propertyConstraints,
              description: propertyDescription,
            });
          }
        });
      }

      // Check if this is an enum type
      const isEnum = hasNoProperties && table;

      typesData.types.push({
        id: typeId,
        name: typeName,
        isExperimental: isExperimental,
        properties: properties,
        constraints: constraints,
        hasNoProperties: hasNoProperties,
        isEnum: isEnum,
        tableHtml: table ? table.outerHTML : '',
      });
    });

    console.log(`Parsed ${typesData.types.length} types`);
    return true;
  }

  /**
   * Renders the accordion with all types
   */
  function renderAccordion() {
    if (!container) return false;

    const accordion = container.querySelector('.accordion-items-container');
    if (!accordion) {
      console.error('accordion-items-container element not found');
      return false;
    }

    // Clear existing content
    accordion.innerHTML = '';

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    typesData.types.forEach((type, index) => {
      const item = document.createElement('div');
      item.className = 'accordion-item';
      item.dataset.typeName = type.name.toLowerCase();
      item.dataset.experimental = type.isExperimental ? 'true' : 'false';

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
      buttonContent.className =
        'd-flex w-100 justify-content-between align-items-center pe-3';

      // Type name
      const typeNameSpan = document.createElement('span');
      typeNameSpan.className = 'type-name';
      typeNameSpan.textContent = type.name;

      // Badge for experimental
      if (type.isExperimental) {
        const badge = document.createElement('span');
        badge.className = 'badge bg-warning text-dark ms-2';
        badge.textContent = 'Experimental';
        typeNameSpan.appendChild(badge);
      }

      // Property count summary
      const propertySummary = document.createElement('span');
      propertySummary.className = 'property-summary text-muted';
      if (type.hasNoProperties) {
        propertySummary.textContent = type.isEnum
          ? 'Enum type'
          : 'No properties';
      } else {
        propertySummary.textContent = `${type.properties.length} ${type.properties.length === 1 ? 'property' : 'properties'}`;
      }

      buttonContent.appendChild(typeNameSpan);
      buttonContent.appendChild(propertySummary);
      button.appendChild(buttonContent);
      header.appendChild(button);

      // Create collapsible body
      const collapseDiv = document.createElement('div');
      collapseDiv.id = collapseId;
      collapseDiv.className = 'accordion-collapse collapse';
      collapseDiv.setAttribute('aria-labelledby', headerId);

      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'accordion-body';
      bodyDiv.appendChild(generateAccordionBody(type));

      collapseDiv.appendChild(bodyDiv);

      item.appendChild(header);
      item.appendChild(collapseDiv);
      fragment.appendChild(item);
    });

    accordion.appendChild(fragment);
    AccordionUtils.updateStats(container);
    return true;
  }

  /**
   * Generates the accordion body content for a type
   * @param {Object} type - Type data
   * @returns {HTMLDivElement} Body content element
   */
  function generateAccordionBody(type) {
    const container = document.createElement('div');

    // Add anchor link
    const anchorLink = document.createElement('a');
    anchorLink.href = `#${type.id}`;
    anchorLink.className = 'type-anchor-link td-heading-self-link';
    anchorLink.setAttribute(
      'aria-label',
      `Permalink to ${AccordionUtils.escapeHtml(type.name)}`,
    );
    anchorLink.textContent = '#';
    container.appendChild(anchorLink);

    // If has table HTML, insert it
    if (type.tableHtml) {
      const tableContainer = document.createElement('div');
      tableContainer.className = 'type-table-container';
      tableContainer.innerHTML = type.tableHtml;
      container.appendChild(tableContainer);
    }

    // Add constraints if present
    if (type.constraints) {
      const constraintsDiv = document.createElement('div');
      constraintsDiv.className = 'type-constraints mt-3';
      const constraintsTitle = document.createElement('strong');
      constraintsTitle.textContent = 'Constraints:';
      constraintsDiv.appendChild(constraintsTitle);
      constraintsDiv.appendChild(document.createElement('br'));
      constraintsDiv.appendChild(document.createTextNode(type.constraints));
      container.appendChild(constraintsDiv);
    }

    // Add link to language status
    const langStatusLink = document.createElement('div');
    langStatusLink.className = 'mt-3';
    const link = document.createElement('a');
    link.href = `language-status/?search=${encodeURIComponent(type.name)}`;
    link.className = 'btn btn-sm btn-outline-primary';
    link.textContent = 'View language support →';
    langStatusLink.appendChild(link);
    container.appendChild(langStatusLink);

    return container;
  }

  /**
   * Applies search and filter to accordion items
   */
  function applyFilters() {
    AccordionUtils.applyFilters(container, savePreferences, updateUrlParams);
  }

  /**
   * Expands all accordion items
   */
  function expandAll() {
    AccordionUtils.expandAll(container);
  }

  /**
   * Collapses all accordion items
   */
  function collapseAll() {
    AccordionUtils.collapseAll(container);
  }

  /**
   * Saves user preferences to localStorage
   */
  function savePreferences() {
    AccordionUtils.savePreferences(container, LOCAL_STORAGE_KEY);
  }

  /**
   * Loads user preferences from localStorage
   */
  function loadPreferences() {
    return AccordionUtils.loadPreferences(LOCAL_STORAGE_KEY);
  }

  /**
   * Updates URL parameters with current filter state
   */
  function updateUrlParams() {
    AccordionUtils.updateUrlParams(
      container,
      URL_PARAM_SEARCH,
      URL_PARAM_FILTER,
    );
  }

  /**
   * Loads filter state from URL parameters
   */
  function loadFromUrlParams() {
    return AccordionUtils.loadFromUrlParams(URL_PARAM_SEARCH, URL_PARAM_FILTER);
  }

  /**
   * Restores filter state from URL or localStorage
   */
  function restoreFilterState() {
    if (!container) return;

    const searchInput = container.querySelector('.accordion-search-input');
    const filterSelect = container.querySelector(
      '.accordion-type-filter-select',
    );

    if (!searchInput || !filterSelect) return;

    // URL params take precedence over localStorage
    const urlState = loadFromUrlParams();
    const hasUrlState = urlState.search || urlState.filter !== 'all';

    const state = hasUrlState ? urlState : loadPreferences() || urlState;

    searchInput.value = state.search || '';
    filterSelect.value = state.filter || 'all';

    applyFilters();
  }

  /**
   * Destroys the component and cleans up resources
   */
  function destroy() {
    AccordionUtils.removeAllEventListeners(eventListeners);
    console.log('ConfigTypesAccordion destroyed');
  }

  /**
   * Initializes the accordion component
   * @returns {boolean} Success status
   */
  function init() {
    container = document.querySelector('.config-types-accordion');
    if (!container) {
      container = document.getElementById('config-types-accordion-container');
    }
    if (!container) {
      // Component not on this page, exit silently
      return false;
    }

    console.log('Initializing ConfigTypesAccordion...');

    // Load i18n strings from data attribute
    try {
      const i18nData = container.dataset.i18n;
      if (i18nData) {
        const parsedData = JSON.parse(i18nData);
        i18nStrings = { ...i18nStrings, ...parsedData };
        console.log('Loaded i18n strings from data attribute');
      }
    } catch (e) {
      console.warn('Could not parse i18n data, using defaults:', e);
    }

    if (!parseExistingContent()) {
      console.error('Failed to parse content');
      return false;
    }

    if (!renderAccordion()) {
      console.error('Failed to render accordion');
      return false;
    }

    // Set up event listeners with debouncing for search
    const searchInput = container.querySelector('.accordion-search-input');
    const filterSelect = container.querySelector(
      '.accordion-type-filter-select',
    );
    const expandBtn = container.querySelector('.accordion-expand-all-btn');
    const collapseBtn = container.querySelector('.accordion-collapse-all-btn');

    if (searchInput) {
      AccordionUtils.addTrackedEventListener(
        eventListeners,
        searchInput,
        'input',
        AccordionUtils.debounce(applyFilters, DEBOUNCE_DELAY),
      );
    }

    if (filterSelect) {
      AccordionUtils.addTrackedEventListener(
        eventListeners,
        filterSelect,
        'change',
        applyFilters,
      );
    }

    if (expandBtn) {
      AccordionUtils.addTrackedEventListener(
        eventListeners,
        expandBtn,
        'click',
        expandAll,
      );
    }

    if (collapseBtn) {
      AccordionUtils.addTrackedEventListener(
        eventListeners,
        collapseBtn,
        'click',
        collapseAll,
      );
    }

    restoreFilterState();

    AccordionUtils.addTrackedEventListener(
      eventListeners,
      window,
      'beforeunload',
      destroy,
    );

    console.log('ConfigTypesAccordion initialized successfully');
    return true;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose destroy function for cleanup if needed
  window.ConfigTypesAccordion = {
    destroy: destroy,
  };
})();
