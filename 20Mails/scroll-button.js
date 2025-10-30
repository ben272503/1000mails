function scrollToSection() {
    const target = document.getElementById("cible");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

window.addEventListener("scroll", () => {
    const btn = document.getElementById("scrollBtn");
    const target = document.getElementById("cible");

    if (!btn || !target) return;

    const rect = target.getBoundingClientRect();
    
    // Si le haut de la section est visible ou dépassé
    if (rect.top <= 0) {
      btn.classList.add("hidden");
    } else {
      btn.classList.remove("hidden");
    }
  });

const scrollTopBtn = document.getElementById("scrollTopBtn");
const footer = document.getElementById('footer');

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) { 
      scrollTopBtn.classList.add("visible");
    } else {
      scrollTopBtn.classList.remove("visible");
    }

    const footerRect = footer.getBoundingClientRect();
    const footerVisible = footerRect.top < window.innerHeight;

    if (footerVisible) {
      // Calcule la distance entre bas de l'écran et le haut du footer
      const overlap = window.innerHeight - footerRect.top;
      scrollTopBtn.style.bottom = `${overlap}px`;
    } else {
      scrollTopBtn.style.bottom = '20px';
    }
  });

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });