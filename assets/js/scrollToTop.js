document.addEventListener("DOMContentLoaded", function () {
    let scrollToTopBtn = document.getElementById("scrollToTopBtn");
    let footer = document.querySelector(".td-footer");
  
    if (!scrollToTopBtn || !footer) return;
  
    function adjustButtonPosition() {
      let footerTop = footer.getBoundingClientRect().top;
      let windowHeight = window.innerHeight;
  
      if (footerTop < windowHeight + 40) {
        scrollToTopBtn.style.bottom = windowHeight - footerTop + 40 + "px";
      } else {
        scrollToTopBtn.style.bottom = "40px";
      }
    }
  
    window.onscroll = function () {
      if (
        document.body.scrollTop > 200 ||
        document.documentElement.scrollTop > 200
      ) {
        scrollToTopBtn.style.display = "block";
      } else {
        scrollToTopBtn.style.display = "none";
      }
  
      adjustButtonPosition();
    };
  
    scrollToTopBtn.onclick = function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  });
  