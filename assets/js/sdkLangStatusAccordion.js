/**
 * SDK Language Implementation Status Accordion
 * Collapsible list view for browsing language support
 */

let statusData = {
  languages: {
    cpp: { name: 'C++', version: '', types: {} },
    go: { name: 'Go', version: '', types: {} },
    java: { name: 'Java', version: '', types: {} },
    js: { name: 'JavaScript', version: '', types: {} }
  },
  types: []
};

/**
 * Parses the existing markdown rendered content to populate our data structure
 */
function parseExistingContent() {
  const content = document.querySelector('.language-implementation-status-content');
  if (!content) {
    console.error('Could not find language implementation status content');
    return;
  }

  const sections = content.querySelectorAll('h3');

  sections.forEach(section => {
    const langId = section.id;
    if (!statusData.languages[langId]) return;

    // Version is in a <p> after the heading
    let currentElement = section.nextElementSibling;
    let table = null;

    while (currentElement) {
      const versionMatch = currentElement.textContent?.match(/Latest supported file format:\s*([^`]+)/);
      if (versionMatch) {
        statusData.languages[langId].version = versionMatch[1];
      }

      if (currentElement.tagName === 'TABLE') {
        table = currentElement;
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
          const typeName = typeLink?.textContent.trim() || cells[0].textContent.trim();
          const status = cells[1].textContent.trim();
          const notes = cells[2]?.textContent.trim() || '';
          const details = cells[3]?.innerHTML || '';

          if (!statusData.types.includes(typeName)) {
            statusData.types.push(typeName);
          }

          statusData.languages[langId].types[typeName] = {
            status: status,
            notes: notes,
            details: details
          };
        }
      });
    }
  });

  statusData.types.sort();
}

function getStatusBadge(status) {
  const badges = {
    supported: '<span class="badge bg-success">✓ Supported</span>',
    not_implemented: '<span class="badge bg-danger">✗ Not implemented</span>',
    unknown: '<span class="badge bg-warning text-dark">? Unknown</span>',
    not_applicable: '<span class="badge bg-secondary">N/A</span>',
    ignored: '<span class="badge bg-info">○ Ignored</span>'
  };
  return badges[status] || `<span class="badge bg-light text-dark">${status}</span>`;
}

function renderAccordion() {
  const accordion = document.getElementById('statusAccordion');
  if (!accordion) return;

  accordion.innerHTML = '';

  statusData.types.forEach((typeName, index) => {
    const item = document.createElement('div');
    item.className = 'accordion-item';
    item.dataset.typeName = typeName;
    item.dataset.experimental = typeName.startsWith('Experimental') ? 'true' : 'false';

    const headerId = `heading-${index}`;
    const collapseId = `collapse-${index}`;

    // Build language status summary for header
    const statusSummary = ['cpp', 'go', 'java', 'js'].map(langId => {
      const typeData = statusData.languages[langId].types[typeName];
      if (typeData) {
        return `<span class="lang-status-pill status-${typeData.status}" title="${statusData.languages[langId].name}: ${typeData.status}"></span>`;
      }
      return '<span class="lang-status-pill status-missing" title="No data"></span>';
    }).join('');

    item.innerHTML = `
      <h2 class="accordion-header" id="${headerId}">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
          <div class="d-flex w-100 justify-content-between align-items-center pe-3">
            <span class="type-name">
              <a href="../types#${typeName.toLowerCase()}" onclick="event.stopPropagation();">${typeName}</a>
            </span>
            <span class="lang-status-summary">${statusSummary}</span>
          </div>
        </button>
      </h2>
      <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headerId}" data-bs-parent="#statusAccordion">
        <div class="accordion-body">
          ${generateAccordionBody(typeName)}
        </div>
      </div>
    `;

    accordion.appendChild(item);
  });

  updateStats();
}

function generateAccordionBody(typeName) {
  let html = '<div class="row g-3">';

  ['cpp', 'go', 'java', 'js'].forEach(langId => {
    const langData = statusData.languages[langId];
    const typeData = langData.types[typeName];

    html += '<div class="col-md-6">';
    html += `<div class="lang-support-card">`;
    html += `<h6>${langData.name} <small class="text-muted"> (version: ${langData.version})</small></h6>`;

    if (typeData) {
      html += `<div class="mb-2">${getStatusBadge(typeData.status)}</div>`;

      if (typeData.notes) {
        html += `<p class="small"><strong>Notes:</strong> ${typeData.notes}</p>`;
      }

      if (typeData.details) {
        html += `<div class="property-support"><strong>Properties:</strong><br />${typeData.details}</div>`;
      }
    } else {
      html += '<p class="text-muted">No data available</p>';
    }

    html += '</div></div>';
  });

  html += '</div>';
  return html;
}

function updateStats() {
  const items = document.querySelectorAll('.accordion-item');
  const visibleItems = Array.from(items).filter(item => !item.classList.contains('d-none'));

  document.getElementById('accordion-visible-count').textContent = visibleItems.length;
  document.getElementById('accordion-total-count').textContent = items.length;
}

function applyFilters() {
  const searchTerm = document.getElementById('accordion-search').value.toLowerCase();
  const typeFilter = document.getElementById('accordion-type-filter').value;

  const items = document.querySelectorAll('.accordion-item');

  items.forEach(item => {
    const typeName = item.dataset.typeName.toLowerCase();
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
}

function expandAll() {
  const buttons = document.querySelectorAll('.accordion-button.collapsed');
  buttons.forEach(button => button.click());
}

function collapseAll() {
  const buttons = document.querySelectorAll('.accordion-button:not(.collapsed)');
  buttons.forEach(button => button.click());
}

// Initialize
function init() {
  if (!document.getElementById('sdk-lang-status-accordion-container')) {
    return;
  }

  parseExistingContent();
  renderAccordion();

  document.getElementById('accordion-search').addEventListener('input', applyFilters);
  document.getElementById('accordion-type-filter').addEventListener('change', applyFilters);
  document.getElementById('expand-all').addEventListener('click', expandAll);
  document.getElementById('collapse-all').addEventListener('click', collapseAll);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
