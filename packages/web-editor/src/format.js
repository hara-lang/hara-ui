import { CLOSE_TO_OPEN, OPEN_TO_CLOSE } from "./scanner.js";

function balanceLine(line, state) {
  let delta = 0;
  let leadingClosers = 0;
  let seenContent = false;
  let inString = state.inString;
  let escaped = state.escaped;
  let inComment = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (inComment) break;
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === ";") {
      inComment = true;
      continue;
    }
    if (character === '"') {
      inString = true;
      continue;
    }
    if (/\s|,/.test(character)) continue;
    if (!seenContent && CLOSE_TO_OPEN[character]) leadingClosers += 1;
    seenContent = true;
    if (OPEN_TO_CLOSE[character]) delta += 1;
    else if (CLOSE_TO_OPEN[character]) delta -= 1;
  }
  return { delta, leadingClosers, inString, escaped };
}

export function formatHara(source, indentWidth = 2) {
  const lines = String(source).split("\n");
  let depth = 0;
  let state = { inString: false, escaped: false };
  return lines.map((line) => {
    if (!line.trim()) return "";
    const content = line.trimStart();
    const balance = balanceLine(content, state);
    const indentDepth = Math.max(0, depth - balance.leadingClosers);
    depth = Math.max(0, depth + balance.delta);
    state = { inString: balance.inString, escaped: balance.escaped };
    return `${" ".repeat(indentDepth * indentWidth)}${content.trimEnd()}`;
  }).join("\n");
}
