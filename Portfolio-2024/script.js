(function () {
  // Download CV button simulation (alert + trigger resume data)
  const downloadBtn = document.getElementById("downloadCvBtn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Provide user with a friendly download simulation, actual CV can be requested
      alert(
        "📄 CV preview: Kashish Thakur — Frontend Developer. \nExperience: Data Management @ Cogneesol, MCA candidate. \nSkills: HTML, CSS, JavaScript, React.js, Corporate adaptability. \nContact: 9781149520 / abhimanhas@2132gmail.com \n(Full PDF CV available upon request — let's connect!)",
      );
      // optional: could simulate download by creating temporary link but keeping simple per requirements
    });
  }

  // Add any dynamic year (already static but ensure consistency)
  const footerYear = document.querySelector("footer p:first-child");
  if (footerYear && !footerYear.innerHTML.includes("2025")) {
    const year = new Date().getFullYear();
    footerYear.innerHTML = `© ${year} Kashish Thakur — All rights reserved. Built with <i class="fas fa-heart" style="color:#ef4444;"></i> for modern web.`;
  }

  // smooth scroll for nav links
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId && targetId.startsWith("#")) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });

  // project links placeholder message (optional interactive)
  const projectLinks = document.querySelectorAll(".project-link");
  projectLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      alert(
        "✨ Project showcase is under active deployment. Contact me for live demo / GitHub repository!",
      );
    });
  });

  // simple console greeting
  console.log(
    "Kashish Thakur Portfolio — Elegant digital solutions crafted with passion.",
  );
})();
