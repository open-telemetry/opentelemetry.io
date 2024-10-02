const { validateAdditionalItems } = require("ajv/dist/vocabularies/applicator/additionalItems");

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

let ele = document.querySelector('#td-section-nav .td-sidebar-nav-active-item');

if (ele && !isInViewport(ele)) {
  ele.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
}


let _activeVar = '';

document.querySelectorAll('option[data-bs-toggle="tab"]').forEach(function (tab) {
  tab.addEventListener('show.bs.tab', function (event) {
    let _newVar = event.target.textContent.toLowerCase();
    if (_activeVar != _newVar) {
      console.log('activate')
      _activeVar = _newVar;
      document.querySelectorAll(`.code-vars`).forEach(function (v) {
        v.style.display = 'none';
      });
      document.querySelectorAll(`.code-vars-${_activeVar}`).forEach(function (v) {
        v.style.display = 'inline';
      });
    }
  })

  tab.addEventListener('shown.bs.tab', function (event) {
    if(event.target.classList.contains('active')) {
      event.target.selected = true;
    }
  })
});