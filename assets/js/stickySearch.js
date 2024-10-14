// Get the search form element and the alert box
var searchForm = document.getElementById('searchForm');
var alertBox = document.querySelector('.alert.alert-info');
var scrollThreshold = 150;
var stickyOffset = 100;

// Add the sticky class to the search form when you reach its scroll position.
function handleStickySearch() {
  if (!searchForm) return;
  var rect = searchForm.getBoundingClientRect();
  var alertRect = alertBox ? alertBox.getBoundingClientRect() : { bottom: 0 };

  // Check if the user has scrolled down past the threshold and the form is within the offset range
  if (window.pageYOffset > scrollThreshold && rect.top <= stickyOffset) {
    searchForm.classList.add('sticky');
  }

  // Remove the sticky class when the user is scrolling back up
  if (
    window.pageYOffset < scrollThreshold ||
    (rect.top > stickyOffset + searchForm.offsetHeight && alertRect.bottom > 0)
  ) {
    searchForm.classList.remove('sticky');
  }
}

// Attach scroll event listener for sticky search
window.addEventListener('scroll', handleStickySearch);
