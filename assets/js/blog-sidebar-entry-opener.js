// Opens the two newest year groups in the blog sidebar on the blog index's
// first page. Loaded on every blog list page; pager pages are skipped here
// (why: https://opentelemetry.io/site/implementation/scripts/).
//
// This script runs at body end, when the sidebar is in the HTML but still
// hidden: Docsy's chrome-nav.js unhides it at DOMContentLoaded, so the year
// groups are already open when the sidebar appears.
//
// Expects Docsy's sidebar tree (sidebar-tree.html):
// - `#td-section-nav` holds the section's root link, `a.tree-root`;
// - each year entry is a checkbox toggled by a `<label>` wrapping the year's
//   link, found through the link because checkbox IDs vary by language.
// Missing markup is reported to the console, not skipped.

function openNewestYearGroups() {
  const nav = document.getElementById('td-section-nav');
  const root = nav?.querySelector('a.tree-root');
  if (!root) {
    console.error('blog-sidebar-entry-opener: sidebar tree root not found');
    return;
  }
  let opened = 0;
  for (const link of nav.querySelectorAll('a')) {
    const subpath = link.pathname.startsWith(root.pathname)
      ? link.pathname.slice(root.pathname.length)
      : '';
    if (!/^\d{4}\/$/.test(subpath)) continue;
    const checkbox = link.closest('label')?.control;
    if (!checkbox) {
      console.error(
        `blog-sidebar-entry-opener: no checkbox for ${link.pathname}`,
      );
      return;
    }
    checkbox.checked = true;
    if (++opened === 2) return;
  }
}

if (!location.pathname.includes('/page/')) openNewestYearGroups();
