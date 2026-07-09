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
    examples: d.i18nExamples,
    copy: d.i18nCopy,
    copied: d.i18nCopied,
    source: d.i18nSource,
    viewSchema: d.i18nViewSchema,
    schemaVersion: d.i18nSchemaVersion,
  };
}

// ── JSON path computation ───────────────────────────────────────────────────────

// BFS from the root type to compute the JSON path chain for each usage edge.
// Uses per-type expansion (each type expanded once, at its shortest path) so
// cycles in the schema (e.g. Sampler ↔ ParentBasedSampler) cannot loop.
//
// Returns a Map keyed by "childTypeName|parentTypeName|propertyName" whose
// value is a chain array of { text, typeId } segments, e.g.
//   "SpanProcessor|TracerProvider|processors" →
//     [ {text:'$', typeId:'opentelemetryconfiguration'},
//       {text:'tracer_provider', typeId:'tracerprovider'},
//       {text:'processors[*]', typeId:'spanprocessor'} ]
//
// Each segment's typeId is the type *referenced by* that segment, so links
// navigate to the type a user would expect to land on when clicking that step.
function computeUsageJsonPaths(types) {
  const typesByName = new Map(types.map((t) => [t.name, t]));
  const rootType = types.find((t) => t.isRoot);
  if (!rootType) return new Map();

  const usagePathMap = new Map();
  const expandedTypes = new Set();
  const rootChain = [{ text: '$', typeId: rootType.id }];
  const queue = [[rootType.name, rootChain]];

  while (queue.length > 0) {
    const [typeName, chain] = queue.shift();
    if (expandedTypes.has(typeName)) continue;
    expandedTypes.add(typeName);

    const type = typesByName.get(typeName);
    if (!type) continue;

    for (const prop of type.properties ?? []) {
      if (!prop.typeRef) continue;
      const childType = typesByName.get(prop.typeRef);
      const childTypeId = childType?.id ?? prop.typeRef.toLowerCase();
      const isArray = prop.type === 'array';
      const segmentText = isArray ? `${prop.name}[*]` : prop.name;
      const childChain = [...chain, { text: segmentText, typeId: childTypeId }];

      usagePathMap.set(`${prop.typeRef}|${typeName}|${prop.name}`, childChain);

      if (!expandedTypes.has(prop.typeRef)) {
        queue.push([prop.typeRef, childChain]);
      }
    }
  }

  return usagePathMap;
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

function renderControls(types, i18n, schemaVersion, schemaSourceUrl) {
  const stableCount = types.filter((t) => !t.isExperimental).length;
  const expCount = types.filter((t) => t.isExperimental).length;
  const total = types.length;
  const rootType = types.find((t) => t.isRoot);
  const rootLinkHtml = rootType
    ? `<p>The root schema type is <a href="#type-${escapeAttr(rootType.id)}" data-ct-type-link="${escapeAttr(rootType.id)}">${escapeHtml(rootType.name)}</a>.</p>`
    : '';
  const versionHtml =
    schemaVersion && schemaSourceUrl
      ? `<p>${escapeHtml(i18n.schemaVersion)}: <a href="${escapeAttr(schemaSourceUrl)}" target="_blank" rel="noopener">${escapeHtml(schemaVersion)}</a></p>`
      : '';

  return `
${rootLinkHtml}${versionHtml}<div class="config-types-controls mb-3">
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

function renderTypeCell(prop, knownTypeIds) {
  if (!prop.typeRef || !knownTypeIds.has(prop.typeRef.toLowerCase())) {
    return `<code class="ct-prop-type">${escapeHtml(prop.type)}</code>`;
  }
  const refId = escapeAttr(prop.typeRef.toLowerCase());
  const linkHtml = `<a href="#type-${refId}" data-ct-type-link="${refId}">${escapeHtml(prop.typeRef)}</a>`;
  if (prop.type === prop.typeRef) {
    return `<code class="ct-prop-type">${linkHtml}</code>`;
  }
  // array items case: prop.type is "array"
  return `<code class="ct-prop-type">${escapeHtml(prop.type)} of ${linkHtml}</code>`;
}

function renderPropertiesTable(type, i18n, knownTypeIds) {
  if (type.hasNoProperties) {
    return `<p class="fst-italic text-body-secondary mb-0">No configurable properties.</p>`;
  }

  const hasConstraints = type.properties.some((p) => p.constraints);

  const rows = type.properties
    .map(
      (prop) => `
      <tr>
        <td><code>${escapeHtml(prop.name)}</code></td>
        <td>${renderTypeCell(prop, knownTypeIds)}</td>
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

// Build the <code> body, wrapping the type-relevant portion (from the snippet's
// demarcation point onward) in a highlight band. A block-level <span> after the
// context naturally starts on its own line, so no separator newline is added.
function renderSnippetCode(snippet) {
  const lines = snippet.content.split('\n');
  const start = snippet.highlightStart;

  if (start == null || start >= lines.length) {
    return escapeHtml(snippet.content);
  }
  const highlight = `<span class="ct-snippet-highlight">${escapeHtml(
    lines.slice(start).join('\n'),
  )}</span>`;
  if (start <= 0) {
    return highlight;
  }

  return escapeHtml(lines.slice(0, start).join('\n')) + highlight;
}

function renderCodeBlock(snippet, i18n) {
  const sourceLink = snippet.sourceUrl
    ? `<a class="ct-snippet-source" href="${escapeAttr(snippet.sourceUrl)}"
          target="_blank" rel="noopener">${escapeHtml(i18n.source)}</a>`
    : '';
  return `
<div class="ct-snippet">
  <div class="ct-snippet-toolbar">
    ${sourceLink}
    <button type="button" class="btn btn-sm btn-outline-secondary ct-snippet-copy"
            data-snippet-copy
            aria-label="${escapeAttr(i18n.copy)}">${escapeHtml(i18n.copy)}</button>
  </div>
  <pre class="ct-snippet-pre"><code>${renderSnippetCode(snippet)}</code></pre>
</div>`;
}

function renderSnippets(type, i18n) {
  const snippets = type.snippets ?? [];
  if (snippets.length === 0) return '';

  const heading = `<p class="ct-examples-heading"><strong>${escapeHtml(i18n.examples)}</strong></p>`;

  // Single snippet: no tab chrome, but keep the snippet's name as a caption so
  // the context the tab label would have provided isn't lost.
  if (snippets.length === 1) {
    const caption = snippets[0].description
      ? `<p class="ct-snippet-caption">${escapeHtml(snippets[0].description)}</p>`
      : '';
    return `<div class="ct-examples">${heading}${caption}${renderCodeBlock(snippets[0], i18n)}</div>`;
  }

  // Multiple snippets: Bootstrap tabs.
  const tabs = snippets
    .map((snippet, i) => {
      const tabId = `ct-snip-${escapeAttr(type.id)}-${i}`;
      const active = i === 0 ? ' active' : '';
      const selected = i === 0 ? 'true' : 'false';
      return `
    <li class="nav-item" role="presentation">
      <button class="nav-link${active}" id="${tabId}-tab" data-bs-toggle="tab"
              type="button" role="tab" data-bs-target="#${tabId}"
              aria-controls="${tabId}" aria-selected="${selected}">${escapeHtml(snippet.description)}</button>
    </li>`;
    })
    .join('');

  const panes = snippets
    .map((snippet, i) => {
      const tabId = `ct-snip-${escapeAttr(type.id)}-${i}`;
      const active = i === 0 ? ' show active' : '';
      return `
    <div class="tab-pane fade${active}" id="${tabId}" role="tabpanel"
         aria-labelledby="${tabId}-tab">${renderCodeBlock(snippet, i18n)}</div>`;
    })
    .join('');

  return `
<div class="ct-examples">
  ${heading}
  <ul class="nav nav-tabs ct-snippet-tabs" role="tablist">${tabs}</ul>
  <div class="tab-content">${panes}</div>
</div>`;
}

function renderUsages(type, i18n, usagePathMap) {
  if (!type.usages?.length) return '';
  const items = type.usages
    .map((u) => {
      const chain = usagePathMap?.get(
        `${type.name}|${u.typeName}|${u.propertyName}`,
      );
      if (!chain) return ''; // guarded at build time; should never happen

      // Plain string for the copy button (standard JSONPath).
      const plainPath = chain
        .map((s, i) => (i === 0 ? s.text : `.${s.text}`))
        .join('');

      // Each segment is a link to the type it references.
      const pathHtml = chain
        .map((s, i) => {
          const dot = i === 0 ? '' : '.';
          return `${dot}<a href="#type-${escapeAttr(s.typeId)}" data-ct-type-link="${escapeAttr(s.typeId)}">${escapeHtml(s.text)}</a>`;
        })
        .join('');

      return `<li class="ct-usage-item">
        <code class="ct-usage-path">${pathHtml}</code>
        <button type="button"
                class="ct-usage-copy"
                data-usage-copy="${escapeAttr(plainPath)}"
                aria-label="${escapeAttr(i18n.copy)} ${escapeAttr(plainPath)}">${escapeHtml(i18n.copy)}</button>
      </li>`;
    })
    .join('');
  return `
<div class="ct-usages mt-3">
  <strong class="text-body-secondary">Used by:</strong>
  <ul class="list-unstyled ms-2 mb-0">${items}</ul>
</div>`;
}

function renderRawSchema(type, i18n) {
  if (!type.rawDef) return '';
  const json = JSON.stringify(type.rawDef, null, 2);
  const sourceLink = type.sourceUrl
    ? `<a class="ct-snippet-source" href="${escapeAttr(type.sourceUrl)}"
          target="_blank" rel="noopener">${escapeHtml(i18n.source)}</a>`
    : '';
  return `
<details class="ct-schema-details mt-3">
  <summary class="ct-schema-summary">${escapeHtml(i18n.viewSchema)}</summary>
  <div class="ct-snippet mt-1">
    ${sourceLink ? `<div class="ct-snippet-toolbar">${sourceLink}</div>` : ''}
    <pre class="ct-snippet-pre"><code>${escapeHtml(json)}</code></pre>
  </div>
</details>`;
}

function renderTypeItem(type, i18n, knownTypeIds, usagePathMap) {
  const propCount = type.hasNoProperties ? 0 : (type.properties?.length ?? 0);
  const countText = propCount === 1 ? '1 property' : `${propCount} properties`;
  const constraintsHtml = type.constraints
    ? `<p class="ct-type-constraints"><strong>Type constraints:</strong> ${escapeHtml(type.constraints)}</p>`
    : '';

  return `
<div class="accordion-item"
     id="type-${escapeAttr(type.id)}"
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
      ${renderPropertiesTable(type, i18n, knownTypeIds)}
      ${renderSnippets(type, i18n)}
      ${constraintsHtml}
      ${renderUsages(type, i18n, usagePathMap)}
      ${renderRawSchema(type, i18n)}
    </div>
  </div>
</div>`;
}

function renderAccordion(types, i18n, knownTypeIds, usagePathMap) {
  const items = types
    .map((t) => renderTypeItem(t, i18n, knownTypeIds, usagePathMap))
    .join('');
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

function wireControls(container, types, i18n) {
  const accordion = container.querySelector(`#${ACCORDION_ID}`);
  const state = { query: '', filter: 'all' };
  let debounceTimer;

  // Copy buttons (delegated, since the accordion is built in one innerHTML pass).
  // Handles both snippet copy buttons and inline usage-path copy buttons.
  // WeakMap so rapid re-clicks don't capture a stale "Copied!" as the original
  // label, which would leave the button stuck in the copied state.
  const copyTimers = new WeakMap();
  function flashCopied(btn) {
    if (!copyTimers.has(btn)) {
      copyTimers.set(btn, { original: btn.textContent.trim(), timer: null });
    }
    const state = copyTimers.get(btn);
    clearTimeout(state.timer);
    btn.textContent = i18n.copied;
    state.timer = setTimeout(() => {
      btn.textContent = state.original;
      copyTimers.delete(btn);
    }, 2000);
  }

  container.addEventListener('click', (e) => {
    const usageBtn = e.target.closest('[data-usage-copy]');
    if (usageBtn) {
      navigator.clipboard
        .writeText(usageBtn.dataset.usageCopy)
        .then(() => flashCopied(usageBtn));
      return;
    }

    const snippetBtn = e.target.closest('[data-snippet-copy]');
    if (snippetBtn) {
      const code = snippetBtn.closest('.ct-snippet')?.querySelector('pre code');
      if (!code) return;
      navigator.clipboard
        .writeText(code.textContent)
        .then(() => flashCopied(snippetBtn));
    }
  });

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

  // Update URL hash when an accordion item is expanded.
  accordion.addEventListener('show.bs.collapse', (e) => {
    const item = e.target.closest('.accordion-item');
    if (!item?.dataset.typeId) return;
    const newHash = `#type-${item.dataset.typeId}`;
    if (location.hash === newHash) return;
    history.pushState(null, '', newHash);
  });

  // Expand / collapse all
  const expandBtn = container.querySelector('#ct-expand-all');
  const collapseBtn = container.querySelector('#ct-collapse-all');
  if (expandBtn)
    expandBtn.addEventListener('click', () => expandAll(accordion));
  if (collapseBtn)
    collapseBtn.addEventListener('click', () => collapseAll(accordion));

  return function reset() {
    clearTimeout(debounceTimer);
    if (searchInput) searchInput.value = '';
    state.query = '';
    container
      .querySelectorAll('[data-ct-filter]')
      .forEach((b) => b.classList.remove('active'));
    const allBtn = container.querySelector('[data-ct-filter="all"]');
    if (allBtn) allBtn.classList.add('active');
    state.filter = 'all';
    applyFilters(container, types, state);
  };
}

// ── Type link navigation ──────────────────────────────────────────────────────

function expandItem(item) {
  const collapseEl = item.querySelector('.accordion-collapse');
  if (!collapseEl || collapseEl.classList.contains('show')) return;
  collapseEl.classList.add('show');
  const btn = item.querySelector('.accordion-button');
  if (btn) {
    btn.classList.remove('collapsed');
    btn.setAttribute('aria-expanded', 'true');
  }
}

function wireTypeLinks(container, resetControls) {
  window.addEventListener('popstate', () => {
    if (!location.hash) return;
    let item;
    try {
      item = container.querySelector(location.hash);
    } catch {
      return;
    }
    if (!item || !item.classList.contains('accordion-item')) return;
    expandItem(item);
    item.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  container.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-ct-type-link]');
    if (!link) return;
    e.preventDefault();
    resetControls();
    const typeId = link.dataset.ctTypeLink;
    const item = container.querySelector(
      `[data-type-id="${CSS.escape(typeId)}"]`,
    );
    if (item) {
      const href = link.getAttribute('href');
      expandItem(item);
      // show.bs.collapse also pushes when the item wasn't already open; both
      // sites dedupe on location.hash so we won't get a double entry.
      if (location.hash !== href) history.pushState(null, '', href);
      item.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

function handleInitialHash(container) {
  if (!location.hash) return;
  let item;
  try {
    item = container.querySelector(location.hash);
  } catch {
    return;
  }
  if (!item || !item.classList.contains('accordion-item')) return;
  expandItem(item);
  setTimeout(
    () => item.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    50,
  );
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
    const { types, schemaVersion, schemaSourceUrl } = data;
    const knownTypeIds = new Set(types.map((t) => t.id));
    const usagePathMap = computeUsageJsonPaths(types);

    container.innerHTML =
      renderControls(types, i18n, schemaVersion, schemaSourceUrl) +
      renderAccordion(types, i18n, knownTypeIds, usagePathMap);
    injectDescriptions(container, types);
    const resetControls = wireControls(container, types, i18n);
    wireTypeLinks(container, resetControls);
    handleInitialHash(container);
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
