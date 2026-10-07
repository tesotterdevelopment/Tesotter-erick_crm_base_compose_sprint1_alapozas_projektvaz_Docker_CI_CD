export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "tcrm-theme";

/** Runs before first paint (inlined in layout.tsx) so a stored theme never flashes. */
export const themeInitScript = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
