export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function saveTheme(theme: "dark" | "light"): void {
  localStorage.setItem("theme", theme);
  document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "dark");
}

export function getSavedTheme(): "dark" | "light" {
  const t = localStorage.getItem("theme");
  return t === "light" || t === "dark" ? t : "dark";
}

export async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
