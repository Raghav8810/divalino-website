/**
 * splitLines — DOM-based line splitter (no GSAP SplitText plugin needed).
 *
 * Measures the rendered text of an element after its CSS line-breaks are
 * computed, then re-renders the same content with each *visual* line wrapped
 * in two spans:
 *
 *   <span class="line-mask">          // overflow:hidden  (the clip mask)
 *     <span class="line-inner">       // the element GSAP animates
 *       …line text…
 *     </span>
 *   </span>
 *
 * Why this approach
 * -----------------
 * GSAP's official `SplitText` plugin is a Club (paid) plugin. The visual
 * outcome of "line reveal on scroll" — a clip-mask that lifts each line up
 * from beneath the next — is purely a function of (a) wrapping each rendered
 * line in an overflow-hidden parent, and (b) translating an inner span
 * yPercent: 100 → 0. Both of which are trivial to do without the plugin.
 *
 * The trick is finding where the lines break. We do that by walking each
 * word, recording the inferred line whenever a word's `offsetTop` differs
 * from the previous word's, then grouping words back into per-line strings.
 *
 * Returns the array of inner spans so callers can hand them straight to GSAP.
 *
 * The function is safe to call multiple times — it always restores the
 * original text first (we cache it on a `data-original-text` attribute).
 */

export type SplitLinesResult = {
  /** The mask wrapper spans (overflow:hidden). */
  masks: HTMLElement[];
  /** The inner spans GSAP should animate. */
  inners: HTMLElement[];
  /** Restore the element to its un-split state. Idempotent. */
  revert: () => void;
};

export function splitLines(el: HTMLElement): SplitLinesResult {
  // Cache the original text so re-splits (e.g. after resize) start clean.
  if (!el.dataset.originalText) {
    el.dataset.originalText = el.textContent ?? "";
  }
  const original = el.dataset.originalText;

  // Reset to plain text — we're about to re-measure from scratch.
  el.textContent = original;

  // 1) Wrap every word in a measurable span (preserve whitespace as text nodes).
  const words = original.split(/(\s+)/); // keep the whitespace tokens
  const wordSpans: HTMLSpanElement[] = [];
  el.textContent = "";
  for (const token of words) {
    if (token.trim() === "") {
      el.appendChild(document.createTextNode(token));
      continue;
    }
    const span = document.createElement("span");
    span.textContent = token;
    span.style.display = "inline-block";
    el.appendChild(span);
    wordSpans.push(span);
  }

  // 2) Group words by their offsetTop — same `top` ⇒ same visual line.
  const lines: string[][] = [];
  let lastTop = -Infinity;
  for (const w of wordSpans) {
    const top = w.offsetTop;
    if (top !== lastTop) {
      lines.push([]);
      lastTop = top;
    }
    lines[lines.length - 1].push(w.textContent ?? "");
  }

  // 3) Re-render: each line wrapped in mask + inner.
  el.textContent = "";
  const masks: HTMLElement[] = [];
  const inners: HTMLElement[] = [];
  lines.forEach((lineWords, idx) => {
    const mask = document.createElement("span");
    mask.className = "line-mask";
    mask.style.display = "block";
    mask.style.overflow = "hidden";
    // A small bottom-padding prevents descenders (g, y, p) from being clipped
    // when the mask is exactly the line-height tall.
    mask.style.paddingBottom = "0.12em";

    const inner = document.createElement("span");
    inner.className = "line-inner";
    inner.style.display = "block";
    inner.style.willChange = "transform";
    inner.textContent = lineWords.join(" ");

    mask.appendChild(inner);
    el.appendChild(mask);
    if (idx < lines.length - 1) {
      // No raw text node between masks — block layout handles spacing.
    }
    masks.push(mask);
    inners.push(inner);
  });

  const revert = () => {
    el.textContent = el.dataset.originalText ?? "";
  };

  return { masks, inners, revert };
}
