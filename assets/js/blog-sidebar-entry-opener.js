// Opens the blog sidebar's two newest year groups. Runs at body end, before
// Docsy's chrome-nav.js reveals the sidebar, so the groups are open when it
// appears. Groups are found through their links, not Docsy's checkbox IDs,
// which vary by language.

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
