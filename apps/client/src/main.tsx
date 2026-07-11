import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Material Symbols is an async icon font. Until it loads, the browser renders
// the raw ligature text (e.g. "progress_activity") instead of the glyph. Mark
// the document once the font is ready so CSS can keep icons hidden until then,
// avoiding a flash of unstyled text. A timeout ensures icons never stay hidden
// if font loading fails (e.g. offline).
const markSymbolsReady = () => document.documentElement.classList.add("symbols-ready");
if (document.fonts && document.fonts.load) {
  document.fonts
    .load("24px 'Material Symbols Outlined'")
    .then(markSymbolsReady)
    .catch(markSymbolsReady);
  setTimeout(markSymbolsReady, 3000);
} else {
  markSymbolsReady();
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
