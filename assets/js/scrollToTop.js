let scrollToTopBtn = document.getElementById('scrollToTopBtn');
let footer = document.querySelector('.td-footer');

// Function to check if the button is about to overlap the footer
function adjustButtonPosition() {
  let footerTop = footer.getBoundingClientRect().top;
  let windowHeight = window.innerHeight;

  // Calculate when the button would overlap the footer
  if (footerTop < windowHeight + 40) {
    // Stop the button above the footer
    scrollToTopBtn.style.bottom = windowHeight - footerTop + 40 + 'px';
  } else {
    // Reset the button's position if no overlap
    scrollToTopBtn.style.bottom = '40px';
  }
}

// Show or hide the button based on scroll position
window.onscroll = function () {
  if (
    document.body.scrollTop > 200 ||
    document.documentElement.scrollTop > 200
  ) {
    scrollToTopBtn.style.display = 'block';
  } else {
    scrollToTopBtn.style.display = 'none';
  }

  // Check button position on scroll
  adjustButtonPosition();
};

// Scroll to the top when the button is clicked
scrollToTopBtn.onclick = function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
