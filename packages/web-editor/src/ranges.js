import { CLOSE_TO_OPEN, OPEN_TO_CLOSE, scanHara } from "./scanner.js";

export function collectionRanges(source) {
  const text = String(source);
  const scan = scanHara(text);
  const byStart = new Map(
    scan.tokens
      .filter((token) => token.type === "delimiter" && token.role === "open")
      .map((token) => [token.start, token])
  );
  const ranges = [];
  for (const [start, endStart] of scan.pairs.entries()) {
    if (start > endStart || !byStart.has(start)) continue;
    const opening = byStart.get(start);
    ranges.push({
      start,
      end: endStart + 1,
      open: opening.value,
      close: OPEN_TO_CLOSE[opening.value],
      depth: opening.depth
    });
  }
  return ranges.sort((left, right) => left.start - right.start || right.end - left.end);
}

export function innermostCollection(source, start, end = start) {
  return collectionRanges(source)
    .filter((range) => range.start < start && end < range.end)
    .sort((left, right) => (left.end - left.start) - (right.end - right.start))[0] || null;
}

function skipTrivia(text, index, limit = text.length) {
  let cursor = index;
  while (cursor < limit) {
    if (/\s|,/.test(text[cursor])) {
      cursor += 1;
      continue;
    }
    if (text[cursor] === ";") {
      while (cursor < limit && text[cursor] !== "\n") cursor += 1;
      continue;
    }
    break;
  }
  return cursor;
}

export function formRangeAt(source, start, limit = String(source).length) {
  const text = String(source);
  let cursor = skipTrivia(text, start, limit);
  if (cursor >= limit) return null;
  const quoted = text[cursor] === "'";
  const formStart = cursor;
  if (quoted) cursor = skipTrivia(text, cursor + 1, limit);

  if (OPEN_TO_CLOSE[text[cursor]]) {
    const range = collectionRanges(text).find((candidate) => candidate.start === cursor);
    return range ? { start: formStart, end: range.end } : null;
  }

  if (text[cursor] === '"') {
    const token = scanHara(text).tokens.find(
      (candidate) => candidate.type === "string" && candidate.start === cursor
    );
    return token ? { start: formStart, end: token.end } : null;
  }

  let end = cursor;
  while (
    end < limit
    && !/\s|,/.test(text[end])
    && !OPEN_TO_CLOSE[text[end]]
    && !CLOSE_TO_OPEN[text[end]]
    && text[end] !== ";"
  ) end += 1;
  return end > cursor ? { start: formStart, end } : null;
}

export function childForms(source, range) {
  const forms = [];
  let cursor = range.start + 1;
  const limit = range.end - 1;
  while (cursor < limit) {
    const form = formRangeAt(source, cursor, limit);
    if (!form) break;
    forms.push(form);
    cursor = form.end;
  }
  return forms;
}
