import { insertBalanced } from "./balanced.js";
import {
  childForms,
  collectionRanges,
  formRangeAt,
  innermostCollection
} from "./ranges.js";

export function expandStructuralSelection(source, selectionStart, selectionEnd) {
  const text = String(source);
  const start = Math.max(0, Math.min(selectionStart, text.length));
  const end = Math.max(start, Math.min(selectionEnd, text.length));
  const candidates = collectionRanges(text)
    .filter((range) => range.start <= start && end <= range.end && (range.start < start || end < range.end))
    .sort((left, right) => (left.end - left.start) - (right.end - right.start));
  const range = candidates[0];
  if (range) return { source: text, selectionStart: range.start, selectionEnd: range.end };
  const form = formRangeAt(text, start);
  return form ? { source: text, selectionStart: form.start, selectionEnd: form.end } : null;
}

export function wrapStructural(source, selectionStart, selectionEnd, open = "(") {
  let start = selectionStart;
  let end = selectionEnd;
  if (start === end) {
    const expanded = expandStructuralSelection(source, start, end);
    if (expanded) {
      start = expanded.selectionStart;
      end = expanded.selectionEnd;
    }
  }
  return insertBalanced(source, start, end, open);
}

export function forwardSlurp(source, cursor) {
  const text = String(source);
  const range = innermostCollection(text, cursor);
  if (!range) return null;
  const next = formRangeAt(text, range.end);
  if (!next) return null;
  const withoutClose = `${text.slice(0, range.end - 1)}${text.slice(range.end)}`;
  const insertion = next.end - 1;
  return {
    source: `${withoutClose.slice(0, insertion)}${range.close}${withoutClose.slice(insertion)}`,
    selectionStart: cursor,
    selectionEnd: cursor
  };
}

export function forwardBarf(source, cursor) {
  const text = String(source);
  const range = innermostCollection(text, cursor);
  if (!range) return null;
  const forms = childForms(text, range);
  const last = forms.at(-1);
  if (!last) return null;
  let insertion = last.start;
  while (insertion > range.start + 1 && /\s|,/.test(text[insertion - 1])) insertion -= 1;
  const withoutClose = `${text.slice(0, range.end - 1)}${text.slice(range.end)}`;
  return {
    source: `${withoutClose.slice(0, insertion)}${range.close}${withoutClose.slice(insertion)}`,
    selectionStart: Math.min(cursor, insertion),
    selectionEnd: Math.min(cursor, insertion)
  };
}
