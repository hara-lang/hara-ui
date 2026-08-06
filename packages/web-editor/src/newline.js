import { OPEN_TO_CLOSE, scanHara } from "./scanner.js";

function delimiterDepthAt(source, offset) {
  const text = String(source).slice(0, offset);
  const { tokens } = scanHara(text);
  let depth = 0;
  for (const token of tokens) {
    if (token.type !== "delimiter") continue;
    if (token.role === "open") depth += 1;
    else depth = Math.max(0, depth - 1);
  }
  return depth;
}

export function smartNewline(source, selectionStart, selectionEnd, indentWidth = 2) {
  const text = String(source);
  const start = Math.max(0, Math.min(selectionStart, text.length));
  const end = Math.max(start, Math.min(selectionEnd, text.length));
  const depth = delimiterDepthAt(`${text.slice(0, start)}${text.slice(end)}`, start);
  const before = text[start - 1];
  const after = text[end];
  const parentDepth = OPEN_TO_CLOSE[before] === after ? Math.max(0, depth - 1) : depth;
  const indent = " ".repeat(depth * indentWidth);
  const parentIndent = " ".repeat(parentDepth * indentWidth);

  if (OPEN_TO_CLOSE[before] === after) {
    const insertion = `\n${indent}\n${parentIndent}`;
    return {
      source: `${text.slice(0, start)}${insertion}${text.slice(end)}`,
      selectionStart: start + 1 + indent.length,
      selectionEnd: start + 1 + indent.length
    };
  }
  const insertion = `\n${indent}`;
  return {
    source: `${text.slice(0, start)}${insertion}${text.slice(end)}`,
    selectionStart: start + insertion.length,
    selectionEnd: start + insertion.length
  };
}
