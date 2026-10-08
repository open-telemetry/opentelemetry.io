// Opens the blog sidebar's year groups for the current and previous years, on
// the blog index's first page only.

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('/page/')) return;

  const currentYear = new Date().getFullYear();
  for (const year of [currentYear, currentYear - 1]) {
    const checkbox = document.getElementById(`m-blog${year}-check`);
    if (checkbox) checkbox.checked = true;
  }
});
