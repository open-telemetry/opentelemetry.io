// Opens the two newest year groups in the blog sidebar on the blog index's
// first page. Loaded on the blog index and its pager pages; pager pages are
// skipped here (why: https://opentelemetry.io/site/implementation/scripts-and-plugins/).
//
// This script runs at body end, when the sidebar is in the HTML but still
// hidden: Docsy's chrome-nav.js unhides it at DOMContentLoaded, so the year
// groups are already open when the sidebar appears.
//
// Expects Docsy's sidebar tree (sidebar-tree.html):
// - `#td-section-nav` holds the section's root link, `a.tree-root`;
// - year links are the root link's path plus `YYYY/`;
// - each is wrapped in a `<label>` that toggles the year's checkbox (found
//   through the link because checkbox IDs vary by language).
// A missing tree root or year checkbox is reported to the console.

function openNewestYearGroups() {
  if (location.pathname.includes('/page/')) return;
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

openNewestYearGroups();
