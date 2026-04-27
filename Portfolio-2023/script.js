const themeToggle = document.querySelector("[data-theme-toggle]");
const root = document.documentElement;
let theme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";
const moon = "🌙";
const sun = "☀️";

function setTheme(value) {
  root.setAttribute("data-theme", value);
  themeToggle.textContent = value === "dark" ? sun : moon;
}

setTheme(theme);

themeToggle.addEventListener("click", function () {
  theme = theme === "dark" ? "light" : "dark";
  setTheme(theme);
});

// Simple reveal on scroll (basic alternative to IntersectionObserver)
var reveals = document.querySelectorAll(".reveal");
function checkReveal() {
  for (var i = 0; i < reveals.length; i++) {
    var el = reveals[i];
    if (el.classList.contains("visible")) continue;
    var rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      el.classList.add("visible");
    }
  }
}
window.addEventListener("scroll", checkReveal);
window.addEventListener("resize", checkReveal);
checkReveal();

