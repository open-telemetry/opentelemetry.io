// Opens the blog sidebar's two newest year groups. Loaded at body end on blog
// index first pages only (hooks/body-end.html): the sidebar is parsed by then,
// and Docsy's chrome-nav.js reveals it later, groups already open. Groups are
// found through their links, not Docsy's checkbox IDs, which are
// language-prefixed.

const nav = document.getElementById('td-section-nav');
const root = nav?.querySelector('a.tree-root');
if (root) {
  let opened = 0;
  for (const link of nav.querySelectorAll('label > a')) {
    const subpath = link.pathname.startsWith(root.pathname)
      ? link.pathname.slice(root.pathname.length)
      : '';
    if (!/^\d{4}\/$/.test(subpath)) continue;
    const checkbox = link.closest('label').control;
    if (!checkbox) continue;
    checkbox.checked = true;
    if (++opened === 2) break;
  }
}
