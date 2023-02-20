// Check If an Element is Visible in the Viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

let ele = document.querySelector("#td-section-nav .td-sidebar-nav-active-item");

if (ele && !isInViewport(ele)) {
  ele.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
}
