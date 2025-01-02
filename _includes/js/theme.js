document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("pref-theme") === "dark") {
    document.body.classList.add('dark');
  } else if (localStorage.getItem("pref-theme") === "light") {
    document.body.classList.remove('dark')
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark');
  }

  document.getElementById("theme-toggle").addEventListener("click", () => {
    if (document.body.className.includes("dark")) {
      document.body.classList.remove('dark');
      localStorage.setItem("pref-theme", 'light');
    } else {
      document.body.classList.add('dark');
      localStorage.setItem("pref-theme", 'dark');
    }
  })
});
