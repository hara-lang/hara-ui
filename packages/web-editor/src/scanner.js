import { HARA_SPECIAL_FORMS } from "./completion.js";

const OPEN_TO_CLOSE = Object.freeze({ "(": ")", "[": "]", "{": "}" });
const CLOSE_TO_OPEN = Object.freeze(Object.fromEntries(Object.entries(OPEN_TO_CLOSE).map(([open, close]) => [close, open])));
const SPECIAL = new Set(HARA_SPECIAL_FORMS);
const LITERALS = new Set(["nil", "true", "false"]);
const WORD_CHARACTER = /[A-Za-z0-9_?!*+\-./:<>=]/;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function atomType(value) {
  if (value.startsWith(":")) return "keyword";
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(value)) return "number";
  if (SPECIAL.has(value)) return "special";
  if (LITERALS.has(value)) return "literal";
  return "symbol";
}

export function scanHara(source) {
  const text = String(source);
  const tokens = [];
  const stack = [];
  const pairs = new Map();
  const unmatched = new Set();
  let index = 0;

  while (index < text.length) {
    const character = text[index];
    if (/\s|,/.test(character)) { index += 1; continue; }
    if (character === ";") {
      const start = index;
      while (index < text.length && text[index] !== "\n") index += 1;
      tokens.push({ type: "comment", value: text.slice(start, index), start, end: index });
      continue;
    }
    if (character === '"') {
      const start = index;
      index += 1;
      let escaped = false;
      let closed = false;
      while (index < text.length) {
        const next = text[index++];
        if (escaped) escaped = false;
        else if (next === "\\") escaped = true;
        else if (next === '"') { closed = true; break; }
      }
      tokens.push({ type: "string", value: text.slice(start, index), start, end: index, closed });
      if (!closed) unmatched.add(start);
      continue;
    }
    if (OPEN_TO_CLOSE[character]) {
      const token = { type: "delimiter", role: "open", value: character, start: index, end: index + 1, depth: stack.length };
      tokens.push(token);
      stack.push(token);
      index += 1;
      continue;
    }
    if (CLOSE_TO_OPEN[character]) {
      const opening = stack.at(-1);
      const matched = opening?.value === CLOSE_TO_OPEN[character];
      if (matched) stack.pop();
      const token = {
        type: "delimiter", role: "close", value: character, start: index, end: index + 1,
        depth: matched ? opening.depth : Math.max(0, stack.length - 1)
      };
      tokens.push(token);
      if (matched) {
        pairs.set(opening.start, token.start);
        pairs.set(token.start, opening.start);
      } else unmatched.add(token.start);
      index += 1;
      continue;
    }
    const start = index;
    while (index < text.length && !/\s|,/.test(text[index]) && !OPEN_TO_CLOSE[text[index]] && !CLOSE_TO_OPEN[text[index]] && text[index] !== ";" && text[index] !== '"') index += 1;
    const value = text.slice(start, index);
    tokens.push({ type: atomType(value), value, start, end: index });
  }

  for (const opening of stack) unmatched.add(opening.start);
  return { tokens, pairs, unmatched };
}

export function contextAt(source, cursor) {
  const position = Math.max(0, Math.min(Number(cursor) || 0, String(source).length));
  const { tokens } = scanHara(source);
  return tokens.find((token) => token.start < position && position <= token.end)
    || tokens.find((token) => token.start === position)
    || null;
}

export function matchingDelimiterIndices(source, cursor) {
  const text = String(source);
  const position = Math.max(0, Math.min(Number(cursor) || 0, text.length));
  const scan = scanHara(text);
  const delimiter = scan.tokens.find((token) => token.type === "delimiter" && (token.start === position || token.start === position - 1));
  if (!delimiter || !scan.pairs.has(delimiter.start)) return new Set();
  return new Set([delimiter.start, scan.pairs.get(delimiter.start)]);
}

export function highlightHara(source, cursor = 0) {
  const text = String(source);
  const scan = scanHara(text);
  const matches = matchingDelimiterIndices(text, cursor);
  let output = "";
  let index = 0;
  for (const token of scan.tokens) {
    if (token.start > index) output += escapeHtml(text.slice(index, token.start));
    const raw = escapeHtml(text.slice(token.start, token.end));
    const classes = [`syntax-${token.type}`];
    if (token.type === "delimiter") {
      classes.push("syntax-paren", `paren-depth-${token.depth % 6}`);
      if (matches.has(token.start)) classes.push("paren-match");
      if (scan.unmatched.has(token.start)) classes.push("paren-error");
    } else if (scan.unmatched.has(token.start)) classes.push("syntax-error");
    output += `<span class="${classes.join(" ")}">${raw}</span>`;
    index = token.end;
  }
  if (index < text.length) output += escapeHtml(text.slice(index));
  if (text.endsWith("\n")) output += " ";
  return output;
}

export function completionPrefixAt(source, cursor) {
  const text = String(source);
  const end = Math.max(0, Math.min(Number(cursor) || 0, text.length));
  const context = contextAt(text, end);
  if (context?.type === "comment" || context?.type === "string") return null;
  let start = end;
  while (start > 0 && WORD_CHARACTER.test(text[start - 1])) start -= 1;
  const prefix = text.slice(start, end);
  return prefix ? { prefix, start, end } : null;
}

export { CLOSE_TO_OPEN, OPEN_TO_CLOSE };
