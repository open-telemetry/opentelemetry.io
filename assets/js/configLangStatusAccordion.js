/**
 * SDK Language Implementation Status Accordion
 * Collapsible list view for browsing language support with filtering and search
 *
 * @module ConfigLangStatusAccordion
 */

import * as AccordionUtils from './shared/accordionUtils.js';

const DEBOUNCE_DELAY = 300;
const LOCAL_STORAGE_KEY = 'config-lang-status-preferences';
const URL_PARAM_SEARCH = 'search';
const URL_PARAM_FILTER = 'filter';

const LANGUAGE_LOGOS = {
  cpp: '/img/logos/32x32/C++_SDK.svg',
  dotnet: '/img/logos/32x32/Csharp_SDK.svg',
  go: '/img/logos/32x32/Golang_SDK.svg',
  java: '/img/logos/32x32/Java_SDK.svg',
  js: '/img/logos/32x32/JS_SDK.svg',
  php: '/img/logos/32x32/PHP.svg',
  python: '/img/logos/32x32/Python_SDK.svg',
  ruby: '/img/logos/32x32/Ruby_SDK.svg',
  rust: '/img/logos/32x32/Rust.svg',
  swift: '/img/logos/32x32/Swift.svg',
};

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
  noDataAvailable: 'No data available',
  notes: 'Notes:',
  properties: 'Properties:',
  version: 'version:',
};

const statusData = {
  languages: {},
  types: [],
  languageOrder: [],
};

let container = null;

function parseExistingContent() {
  const content = document.querySelector(
    '.language-implementation-status-content',
  );
  if (!content) {
    console.error(
      'Could not find .language-implementation-status-content element',
    );
    return false;
  }

  const sections = content.querySelectorAll('h2');

  if (sections.length === 0) {
    console.warn('No language sections found in content');
    return false;
  }

  // Dynamically parse languages from content
  sections.forEach((section) => {
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
        types: {},
      };
      statusData.languageOrder.push(langId);
    }

    // Find version and table
    let currentElement = section.nextElementSibling;
    let table = null;

    while (currentElement) {
      // Match version string more robustly
      if (currentElement.textContent) {
        const versionMatch = currentElement.textContent.match(
          /Latest supported file format:\s*`?([^`\n]+)`?/,
        );
        if (versionMatch) {
          statusData.languages[langId].version = versionMatch[1].trim();
        }
      }

      if (currentElement.tagName === 'TABLE') {
        table = currentElement;
        break;
      }

      // Stop if we hit another h2 (next language section)
      if (currentElement.tagName === 'H2') {
        break;
      }

      currentElement = currentElement.nextElementSibling;
    }

    if (table) {
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          const typeLink = cells[0].querySelector('a');
          const typeName = (
            typeLink?.textContent || cells[0].textContent
          ).trim();
          const status = cells[1].textContent.trim();
          const notes = cells[2]?.textContent.trim() || '';
          // Use textContent instead of innerHTML to prevent XSS
          const detailsText = cells[3]?.textContent.trim() || '';
          // If we need HTML, sanitize it
          const detailsHtml = cells[3]?.innerHTML ? cells[3].innerHTML : '';

          if (!statusData.types.includes(typeName)) {
            statusData.types.push(typeName);
          }

          statusData.languages[langId].types[typeName] = {
            status: status,
            notes: notes,
            detailsText: detailsText,
            detailsHtml: detailsHtml,
          };
        }
      });
    } else {
      console.warn(`No table found for language: ${langId}`);
    }
  });

  // Sort types: stable types first, then experimental types
  // Within each group, sort alphabetically
  statusData.types.sort((a, b) => {
    const aIsExperimental = a.toLowerCase().startsWith('experimental');
    const bIsExperimental = b.toLowerCase().startsWith('experimental');

    if (aIsExperimental && !bIsExperimental) {
      return 1; // a comes after b
    }
    if (!aIsExperimental && bIsExperimental) {
      return -1; // a comes before b
    }
    // Both are the same category (both experimental or both stable)
    return a.localeCompare(b);
  });

  console.log(
    `Parsed ${statusData.languageOrder.length} languages and ${statusData.types.length} types`,
  );
  return true;
}

function createStatusBadge(status) {
  const span = document.createElement('span');
  span.className = 'badge';

  const statusConfig = {
    supported: { class: 'bg-success', text: '✓ Supported' },
    not_implemented: { class: 'bg-danger', text: '✗ Not implemented' },
    unknown: { class: 'bg-warning text-dark', text: '? Unknown' },
    not_applicable: { class: 'bg-secondary', text: 'N/A' },
    ignored: { class: 'bg-info', text: '○ Ignored' },
  };

  const config = statusConfig[status] || {
    class: 'bg-light text-dark',
    text: status,
  };
  span.className += ' ' + config.class;
  span.textContent = config.text;

  return span;
}

function renderLanguageLegend() {
  if (!container) return;

  const legendContainer = container.querySelector('.legend-languages-items');
  if (!legendContainer) {
    console.warn('Language legend container not found');
    return;
  }

  // Clear existing content
  legendContainer.innerHTML = '';

  // Render legend items for each language
  statusData.languageOrder.forEach((langId) => {
    const langName = statusData.languages[langId].name;
    const logo = LANGUAGE_LOGOS[langId] || '/img/logos/32x32/SDK.svg';

    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';
    legendItem.setAttribute('role', 'listitem');

    const logoImg = document.createElement('img');
    logoImg.src = logo;
    logoImg.alt = langName;
    logoImg.className = 'legend-lang-logo';
    logoImg.width = 24;
    logoImg.height = 24;

    const label = document.createElement('span');
    label.className = 'legend-label';
    label.textContent = langName;

    legendItem.appendChild(logoImg);
    legendItem.appendChild(label);
    legendContainer.appendChild(legendItem);
  });
}

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

  statusData.types.forEach((typeName, index) => {
    const item = document.createElement('div');
    item.className = 'accordion-item';
    item.dataset.typeName = typeName;
    item.dataset.experimental = typeName.startsWith('Experimental')
      ? 'true'
      : 'false';

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

    // Type name with link
    const typeNameSpan = document.createElement('span');
    typeNameSpan.className = 'type-name';
    const typeLink = document.createElement('a');
    typeLink.href = `../#${typeName.toLowerCase()}`;
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
      pill.dataset.language = langId;

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

      // Use language logo instead of number
      const logo = LANGUAGE_LOGOS[langId] || '/img/logos/32x32/SDK.svg';
      const img = document.createElement('img');
      img.src = logo;
      img.alt = langName;
      img.className = 'language-logo';
      // Width and height controlled by CSS for responsive sizing

      pill.appendChild(img);
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

    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'accordion-body';
    bodyDiv.appendChild(generateAccordionBody(typeName));

    collapseDiv.appendChild(bodyDiv);

    item.appendChild(header);
    item.appendChild(collapseDiv);
    fragment.appendChild(item);
  });

  accordion.appendChild(fragment);
  AccordionUtils.updateStats(container);
  return true;
}

function generateAccordionBody(typeName) {
  const container = document.createElement('div');

  // Add "View type definition" link at top
  const typeDefLink = document.createElement('div');
  typeDefLink.className = 'type-definition-link mb-3';
  const link = document.createElement('a');
  link.href = `../#${typeName.toLowerCase()}`;
  link.className = 'btn btn-sm btn-outline-secondary';
  link.innerHTML = 'View type definition →';
  typeDefLink.appendChild(link);
  container.appendChild(typeDefLink);

  const row = document.createElement('div');
  row.className = 'row g-3';

  statusData.languageOrder.forEach((langId) => {
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

  container.appendChild(row);
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

function init() {
  container = document.querySelector('.config-lang-status-accordion');
  if (!container) {
    container = document.getElementById(
      'config-lang-status-accordion-container',
    );
  }
  if (!container) {
    return false;
  }

  console.log('Initializing ConfigLangStatusAccordion...');

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

  renderLanguageLegend();

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

  console.log('ConfigLangStatusAccordion initialized successfully');
  return true;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
