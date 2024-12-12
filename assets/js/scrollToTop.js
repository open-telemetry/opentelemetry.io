document.addEventListener("DOMContentLoaded", function () {
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  const footer = document.querySelector(".td-footer");
  const scrollLabel = scrollToTopBtn?.querySelector(".scroll-label");
  let hideTimeout;

  // Check if the current page is the homepage
  if (window.location.pathname === "/") {
    if (scrollToTopBtn) scrollToTopBtn.style.display = "none";
    return; // Exit early to prevent further execution on the homepage
  }

  if (!scrollToTopBtn || !footer) return;

  // Function to adjust button position to avoid footer overlap
  function adjustButtonPosition() {
    const footerTop = footer.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (footerTop < windowHeight + 40) {
      scrollToTopBtn.style.bottom = `${windowHeight - footerTop + 40}px`;
    } else {
      scrollToTopBtn.style.bottom = "40px";
    }
  }

  // Show or hide the button with a fade effect and handle label transition
  function toggleButtonVisibility() {
    const scrollPosition =
      document.body.scrollTop || document.documentElement.scrollTop;

    if (scrollPosition > 200) {
      scrollToTopBtn.classList.add("visible");

      // Show the label after 3-4 page scrolls
      const pageHeight = window.innerHeight;
      if (scrollPosition > pageHeight * 3) {
        scrollToTopBtn.classList.add("show-label");
      } else {
        scrollToTopBtn.classList.remove("show-label");
      }

      // Clear any existing timeout for hiding the button
      if (hideTimeout) clearTimeout(hideTimeout);

      // Hide the button after 2-3 seconds of inactivity
      hideTimeout = setTimeout(() => {
        scrollToTopBtn.classList.remove("visible");
      }, 2500);
    } else {
      scrollToTopBtn.classList.remove("visible");
      scrollToTopBtn.classList.remove("show-label");
    }

    adjustButtonPosition();
  }

  scrollToTopBtn.onclick = function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.addEventListener("scroll", toggleButtonVisibility);
});
