import { OPEN_TO_CLOSE } from "./scanner.js";

export function insertBalanced(source, selectionStart, selectionEnd, open) {
  const text = String(source);
  const start = Math.max(0, Math.min(selectionStart, text.length));
  const end = Math.max(start, Math.min(selectionEnd, text.length));
  const close = open === '"' ? '"' : OPEN_TO_CLOSE[open];
  if (!close) return null;
  const selected = text.slice(start, end);
  return {
    source: `${text.slice(0, start)}${open}${selected}${close}${text.slice(end)}`,
    selectionStart: start + 1,
    selectionEnd: selected ? end + 1 : start + 1
  };
}

export function skipClosing(source, selectionStart, selectionEnd, close) {
  const text = String(source);
  if (selectionStart !== selectionEnd || text[selectionEnd] !== close) return null;
  return { source: text, selectionStart: selectionEnd + 1, selectionEnd: selectionEnd + 1 };
}

export function backspaceBalanced(source, selectionStart, selectionEnd) {
  const text = String(source);
  if (selectionStart !== selectionEnd || selectionStart <= 0 || selectionStart >= text.length) return null;
  const open = text[selectionStart - 1];
  const close = text[selectionStart];
  if ((open === '"' && close === '"') || OPEN_TO_CLOSE[open] === close) {
    return {
      source: `${text.slice(0, selectionStart - 1)}${text.slice(selectionStart + 1)}`,
      selectionStart: selectionStart - 1,
      selectionEnd: selectionStart - 1
    };
  }
  return null;
}
