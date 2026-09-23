/**
 * Inline script to avoid flash of wrong theme (FOUC).
 * Runs before React hydrates: reads localStorage "sanoori-theme" (light|dark)
 * and falls back to prefers-color-scheme, then applies .dark / color-scheme immediately.
 */
export const themeScript = `(() => {
  try {
    const key = "sanoori-theme";
    const stored = localStorage.getItem(key);
    let theme = stored === "light" || stored === "dark" ? stored : null;
    if (!theme) {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}
})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
