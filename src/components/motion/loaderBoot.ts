// Shared by the server layout and client motion code — keep this file free of "use client".

/** <html data-loading> is set before paint while the site loader runs. */
export const LOADER_ATTR = "data-loading";
/** Fired on window as the loader bursts. */
export const LOADER_DONE = "site-loader:done";
/** sessionStorage key: the loader plays once per visit. */
export const LOADER_SEEN_KEY = "as-loader-seen";

/**
 * Inline in <head>, runs before paint: marks <html data-loading> when the loader should play,
 * so the overlay shows from the first frame and stays hidden for repeat visits / reduced motion.
 * Safety: after 12s the flag clears itself and the done event fires, so the page always
 * shows (e.g. scripts failed, or the tab sat in the background and animation paused).
 */
export const LOADER_BOOT_SCRIPT = `try{if(!sessionStorage.getItem("${LOADER_SEEN_KEY}")&&matchMedia("(prefers-reduced-motion: no-preference)").matches){var d=document.documentElement;d.setAttribute("${LOADER_ATTR}","");setTimeout(function(){if(d.hasAttribute("${LOADER_ATTR}")){d.removeAttribute("${LOADER_ATTR}");window.dispatchEvent(new Event("${LOADER_DONE}"))}},12000)}}catch(e){}`;
