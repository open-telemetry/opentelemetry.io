// Opens the blog sidebar's two newest year groups on the blog index's first
// page; pager pages (`/page/N/`) are skipped at runtime, Hugo rendering them
// from the same section page. Runs at body end, before Docsy's chrome-nav.js
// reveals the sidebar, so the groups are open when it appears. Expects Docsy's
// sidebar tree (sidebar-tree.html): `#td-section-nav` holding the section's
// root link `a.tree-root`, each year entry a checkbox toggled by a `<label>`
// wrapping the year's link. Groups are found through their links, not Docsy's
// checkbox IDs, which vary by language; missing markup is reported to the
// console, not skipped.

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

if (!/\/page\/\d+\/$/.test(location.pathname)) openNewestYearGroups();
