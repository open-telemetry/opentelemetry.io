import {
  expandAll,
  collapseAll,
  filterItems,
  normalizeForSearch,
  typeMatchesSearch,
} from './shared/accordionUtils.js';

const CONTAINER_SEL = '.config-types-accordion';
const ACCORDION_ID = 'ct-accordion';
const NO_RESULTS_ID = 'ct-no-results';
const COUNT_ID = 'ct-count';

// ── i18n ──────────────────────────────────────────────────────────────────────

function readI18n(container) {
  const d = container.dataset;
  return {
    search: d.i18nSearch,
    filterAll: d.i18nFilterAll,
    filterStable: d.i18nFilterStable,
    filterExperimental: d.i18nFilterExperimental,
    expandAll: d.i18nExpandAll,
    collapseAll: d.i18nCollapseAll,
    noResults: d.i18nNoResults,
    loading: d.i18nLoading,
    colType: d.i18nColType,
    colConstraints: d.i18nColConstraints,
    colDescription: d.i18nColDescription,
  };
}

// ── Rendering ─────────────────────────────────────────────────────────────────

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderControls(types, i18n) {
  const stableCount = types.filter((t) => !t.isExperimental).length;
  const expCount = types.filter((t) => t.isExperimental).length;
  const total = types.length;

  return `
<div class="config-types-controls mb-3">
  <div class="row g-2 align-items-center">
    <div class="col-md-5">
      <input type="search"
             id="ct-search"
             class="form-control"
             placeholder="${escapeAttr(i18n.search)}"
             aria-label="${escapeAttr(i18n.search)}">
    </div>
    <div class="col-md-4">
      <div class="btn-group" role="group" aria-label="Filter by stability">
        <button type="button" class="btn btn-outline-primary active"
                data-ct-filter="all">${escapeHtml(i18n.filterAll)} (${total})</button>
        <button type="button" class="btn btn-outline-primary"
                data-ct-filter="stable">${escapeHtml(i18n.filterStable)} (${stableCount})</button>
        <button type="button" class="btn btn-outline-primary"
                data-ct-filter="experimental">${escapeHtml(i18n.filterExperimental)} (${expCount})</button>
      </div>
    </div>
    <div class="col-md-3 text-end">
      <button type="button" class="btn btn-sm btn-outline-primary me-1"
              id="ct-expand-all">${escapeHtml(i18n.expandAll)}</button>
      <button type="button" class="btn btn-sm btn-outline-primary"
              id="ct-collapse-all">${escapeHtml(i18n.collapseAll)}</button>
    </div>
  </div>
  <div id="${COUNT_ID}" class="text-body-secondary small mt-1"
       aria-live="polite" aria-atomic="true">
    Showing ${total} of ${total} types
  </div>
</div>`;
}

function renderPropertiesTable(type, i18n) {
  if (type.hasNoProperties) {
    return `<p class="fst-italic text-body-secondary mb-0">No configurable properties.</p>`;
  }

  const hasConstraints = type.properties.some((p) => p.constraints);

  const rows = type.properties
    .map(
      (prop) => `
      <tr>
        <td><code>${escapeHtml(prop.name)}</code></td>
        <td><code class="ct-prop-type">${escapeHtml(prop.type)}</code></td>
        ${hasConstraints ? `<td class="ct-prop-constraints">${escapeHtml(prop.constraints)}</td>` : ''}
        <td data-prop-desc="${escapeAttr(prop.name)}"></td>
      </tr>`,
    )
    .join('');

  return `
<table class="table table-sm table-bordered ct-props-table">
  <thead>
    <tr>
      <th>Name</th>
      <th>${escapeHtml(i18n.colType)}</th>
      ${hasConstraints ? `<th>${escapeHtml(i18n.colConstraints)}</th>` : ''}
      <th>${escapeHtml(i18n.colDescription)}</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>`;
}

function renderTypeItem(type, i18n) {
  const propCount = type.hasNoProperties ? 0 : (type.properties?.length ?? 0);
  const countText = propCount === 1 ? '1 property' : `${propCount} properties`;
  const constraintsHtml = type.constraints
    ? `<p class="ct-type-constraints"><strong>Type constraints:</strong> ${escapeHtml(type.constraints)}</p>`
    : '';

  return `
<div class="accordion-item"
     data-type-id="${escapeAttr(type.id)}"
     data-is-experimental="${type.isExperimental}">
  <h3 class="accordion-header">
    <button class="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#ct-${escapeAttr(type.id)}"
            aria-expanded="false"
            aria-controls="ct-${escapeAttr(type.id)}">
      ${escapeHtml(type.name)}
      <small class="ms-2 fw-normal text-body-secondary ct-prop-count">${escapeHtml(countText)}</small>
    </button>
  </h3>
  <div id="ct-${escapeAttr(type.id)}" class="accordion-collapse collapse">
    <div class="accordion-body">
      ${renderPropertiesTable(type, i18n)}
      ${constraintsHtml}
    </div>
  </div>
</div>`;
}

function renderAccordion(types, i18n) {
  const items = types.map((t) => renderTypeItem(t, i18n)).join('');
  return `
<div id="${ACCORDION_ID}" class="accordion">
  ${items}
</div>
<p id="${NO_RESULTS_ID}" class="d-none text-body-secondary mt-3">${escapeHtml(i18n.noResults)}</p>`;
}

// ── Description injection ─────────────────────────────────────────────────────

// Descriptions are pre-rendered safe HTML (ul/ol/li/a only, per configSchemaTransform.mjs).
// They are injected via innerHTML after the DOM is built to avoid double-escaping.
function injectDescriptions(container, types) {
  for (const type of types) {
    for (const prop of type.properties ?? []) {
      if (!prop.description) continue;
      const cell = container.querySelector(
        `[data-type-id="${CSS.escape(type.id)}"] [data-prop-desc="${CSS.escape(prop.name)}"]`,
      );
      if (cell) cell.innerHTML = prop.description;
    }
  }
}

// ── Filter / search ───────────────────────────────────────────────────────────

function applyFilters(container, types, state) {
  const accordion = container.querySelector(`#${ACCORDION_ID}`);
  const countEl = container.querySelector(`#${COUNT_ID}`);
  const noResults = container.querySelector(`#${NO_RESULTS_ID}`);

  const q = normalizeForSearch(state.query);
  let count = 0;

  filterItems(accordion, (item) => {
    const isExp = item.dataset.isExperimental === 'true';
    const typeObj = types.find((t) => t.id === item.dataset.typeId);
    const filterMatch =
      state.filter === 'all' ||
      (state.filter === 'stable' && !isExp) ||
      (state.filter === 'experimental' && isExp);
    const searchMatch = typeMatchesSearch(typeObj, q);
    if (filterMatch && searchMatch) count++;
    return filterMatch && searchMatch;
  });

  if (countEl)
    countEl.textContent = `Showing ${count} of ${types.length} types`;
  if (noResults) noResults.classList.toggle('d-none', count > 0);
}

// ── Event wiring ──────────────────────────────────────────────────────────────

function wireControls(container, types) {
  const accordion = container.querySelector(`#${ACCORDION_ID}`);
  const state = { query: '', filter: 'all' };
  let debounceTimer;

  // Search
  const searchInput = container.querySelector('#ct-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.query = searchInput.value;
        applyFilters(container, types, state);
      }, 300);
    });
  }

  // Filter buttons
  container.querySelectorAll('[data-ct-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      container
        .querySelectorAll('[data-ct-filter]')
        .forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.filter = btn.dataset.ctFilter;
      applyFilters(container, types, state);
    });
  });

  // Expand / collapse all
  const expandBtn = container.querySelector('#ct-expand-all');
  const collapseBtn = container.querySelector('#ct-collapse-all');
  if (expandBtn)
    expandBtn.addEventListener('click', () => expandAll(accordion));
  if (collapseBtn)
    collapseBtn.addEventListener('click', () => collapseAll(accordion));
}

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  const container = document.querySelector(CONTAINER_SEL);
  if (!container) return;

  const schemaUrl = container.dataset.schemaUrl;
  const i18n = readI18n(container);

  container.innerHTML = `<p class="text-body-secondary">${escapeHtml(i18n.loading)}</p>`;

  try {
    const res = await fetch(schemaUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const types = data.types;

    container.innerHTML =
      renderControls(types, i18n) + renderAccordion(types, i18n);
    injectDescriptions(container, types);
    wireControls(container, types);
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Failed to load configuration types.</div>`;
    console.error('config-types-accordion:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
