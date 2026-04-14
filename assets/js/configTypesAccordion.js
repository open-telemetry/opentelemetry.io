/**
 * Configuration Types Accordion
 * Collapsible list view for browsing configuration types with filtering and search
 *
 * @module ConfigTypesAccordion
 */

import * as AccordionUtils from './shared/accordionUtils.js';
import { transformSchema } from './configSchemaTransform.mjs';

const DEBOUNCE_DELAY = 300;
const LOCAL_STORAGE_KEY = 'config-types-preferences';
const URL_PARAM_SEARCH = 'search';
const URL_PARAM_FILTER = 'filter';
const SCHEMA_URL = '/schemas/opentelemetry_configuration.json';

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

const typesData = {
  types: [],
};

let container = null;

/**
 * Show loading indicator in the accordion container
 */
function showLoading() {
  const accordionContainer = container.querySelector('.accordion-items-container');
  if (!accordionContainer) return;

  accordionContainer.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading configuration types...</span>
      </div>
      <p class="mt-3">Loading configuration types...</p>
    </div>
  `;
}

/**
 * Show error message in the accordion container
 * @param {string} message - Error message to display
 */
function showError(message) {
  const accordionContainer = container.querySelector('.accordion-items-container');
  if (!accordionContainer) return;

  accordionContainer.innerHTML = `
    <div class="alert alert-danger" role="alert">
      <strong>Error:</strong> ${message}
    </div>
  `;
}

/**
 * Load types data from server
 * Fetches raw schema from static mount and transforms it client-side
 * @returns {Promise<boolean>} True if successfully loaded
 */
async function loadTypesData() {
  try {
    // Fetch raw schema from static asset (served from submodule)
    const response = await fetch(SCHEMA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch schema: ${response.status} ${response.statusText}`);
    }

    const rawSchema = await response.json();

    // Transform using client-side logic
    const transformedData = transformSchema(rawSchema);

    if (!transformedData.types || !Array.isArray(transformedData.types)) {
      throw new Error('Invalid transformed data structure');
    }

    typesData.types = transformedData.types;

    return true;
  } catch (error) {
    console.error('Error loading configuration types:', error);
    showError(`Failed to load configuration types: ${error.message}`);
    return false;
  }
}

function renderAccordion() {
  if (!container) return false;

  const accordion = container.querySelector('.accordion-items-container');
  if (!accordion) {
    console.error('accordion-items-container element not found');
    return false;
  }

  accordion.innerHTML = '';

  const fragment = document.createDocumentFragment();

  typesData.types.forEach((type, index) => {
    const item = document.createElement('div');
    item.className = 'accordion-item';
    item.dataset.typeName = type.name.toLowerCase();
    item.dataset.experimental = type.isExperimental ? 'true' : 'false';

    const headerId = `heading-${index}`;
    const collapseId = `collapse-${index}`;

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

    const typeNameSpan = document.createElement('span');
    typeNameSpan.className = 'type-name';
    typeNameSpan.textContent = type.name;

    if (type.isExperimental) {
      const badge = document.createElement('span');
      badge.className = 'badge bg-warning text-dark ms-2';
      badge.textContent = 'Experimental';
      typeNameSpan.appendChild(badge);
    }

    const propertySummary = document.createElement('span');
    propertySummary.className = 'property-summary text-muted';
    if (type.hasNoProperties) {
      propertySummary.textContent = type.isEnum ? 'Enum type' : 'No properties';
    } else {
      propertySummary.textContent = `${type.properties.length} ${type.properties.length === 1 ? 'property' : 'properties'}`;
    }

    buttonContent.appendChild(typeNameSpan);
    buttonContent.appendChild(propertySummary);
    button.appendChild(buttonContent);
    header.appendChild(button);

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
 * Generate a property table from properties array
 * @param {Array} properties - Array of property objects
 * @returns {HTMLTableElement|null} Generated table or null if no properties
 */
function generatePropertyTable(properties) {
  if (!properties || properties.length === 0) return null;

  const table = document.createElement('table');
  table.className = 'table table-striped';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const headers = [
    'Property',
    'Type',
    'Constraints',
    'Description',
  ];

  // Check if any property has constraints to decide whether to show that column
  const hasConstraints = properties.some(
    (prop) => prop.constraints && prop.constraints.length > 0,
  );

  headers.forEach((headerText, index) => {
    // Skip Constraints column if no properties have constraints
    if (headerText === 'Constraints' && !hasConstraints) return;

    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  properties.forEach((prop) => {
    const row = document.createElement('tr');

    // Property name
    const nameCell = document.createElement('td');
    nameCell.textContent = prop.name || '';
    row.appendChild(nameCell);

    // Type
    const typeCell = document.createElement('td');
    typeCell.textContent = prop.type || '';
    row.appendChild(typeCell);

    // Constraints (only if column is shown)
    if (hasConstraints) {
      const constraintsCell = document.createElement('td');
      constraintsCell.textContent = prop.constraints || '';
      row.appendChild(constraintsCell);
    }

    // Description
    const descCell = document.createElement('td');
    descCell.innerHTML = prop.description || '';
    row.appendChild(descCell);

    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  return table;
}

function generateAccordionBody(type) {
  const container = document.createElement('div');

  // Add anchor link
  const anchorLink = document.createElement('a');
  anchorLink.href = `#${type.id}`;
  anchorLink.className = 'type-anchor-link td-heading-self-link';
  anchorLink.setAttribute('aria-label', `Permalink to ${type.name}`);
  anchorLink.textContent = '#';
  container.appendChild(anchorLink);

  // Generate table from properties
  if (type.properties && type.properties.length > 0) {
    const table = generatePropertyTable(type.properties);
    if (table) {
      const tableContainer = document.createElement('div');
      tableContainer.className = 'type-table-container';
      tableContainer.appendChild(table);
      container.appendChild(tableContainer);
    }
  } else if (type.hasNoProperties) {
    // Show "No properties" message
    const noPropsP = document.createElement('p');
    noPropsP.textContent = 'No properties.';
    noPropsP.className = 'text-muted';
    container.appendChild(noPropsP);
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

function applyFilters() {
  AccordionUtils.applyFilters(
    container,
    () => AccordionUtils.savePreferences(container, LOCAL_STORAGE_KEY),
    () =>
      AccordionUtils.updateUrlParams(
        container,
        URL_PARAM_SEARCH,
        URL_PARAM_FILTER,
      ),
  );
}

function restoreFilterState() {
  if (!container) return;

  const searchInput = container.querySelector('.accordion-search-input');
  const filterSelect = container.querySelector('.accordion-type-filter-select');

  if (!searchInput || !filterSelect) return;

  const urlState = AccordionUtils.loadFromUrlParams(
    URL_PARAM_SEARCH,
    URL_PARAM_FILTER,
  );
  const hasUrlState = urlState.search || urlState.filter !== 'all';

  const state = hasUrlState
    ? urlState
    : AccordionUtils.loadPreferences(LOCAL_STORAGE_KEY) || urlState;

  searchInput.value = state.search || '';
  filterSelect.value = state.filter || 'all';

  applyFilters();
}

async function init() {
  container = document.querySelector('.config-types-accordion');
  if (!container) {
    container = document.getElementById('config-types-accordion-container');
  }
  if (!container) {
    return false;
  }

  try {
    const i18nData = container.dataset.i18n;
    if (i18nData) {
      const parsedData = JSON.parse(i18nData);
      i18nStrings = { ...i18nStrings, ...parsedData };
    }
  } catch (e) {
    console.warn('Could not parse i18n data, using defaults:', e);
  }

  // Show loading indicator
  showLoading();

  // Load types data (async - fetches and transforms schema)
  const loaded = await loadTypesData();
  if (!loaded) {
    console.error('Failed to load types data');
    return false;
  }

  if (!renderAccordion()) {
    console.error('Failed to render accordion');
    return false;
  }

  const searchInput = container.querySelector('.accordion-search-input');
  const filterSelect = container.querySelector('.accordion-type-filter-select');
  const expandBtn = container.querySelector('.accordion-expand-all-btn');
  const collapseBtn = container.querySelector('.accordion-collapse-all-btn');

  if (searchInput) {
    searchInput.addEventListener(
      'input',
      AccordionUtils.debounce(applyFilters, DEBOUNCE_DELAY),
    );
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', applyFilters);
  }

  if (expandBtn) {
    expandBtn.addEventListener('click', () =>
      AccordionUtils.expandAll(container),
    );
  }

  if (collapseBtn) {
    collapseBtn.addEventListener('click', () =>
      AccordionUtils.collapseAll(container),
    );
  }

  restoreFilterState();

  return true;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
