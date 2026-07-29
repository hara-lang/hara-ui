# Editor menubar

Use one compact `.hara-editor-menubar` row for commands that act on the
current editor. Do not add a second title, mode, or shortcut row.

```html
<div class="hara-editor-menubar">
  <div class="hara-editor-menubar__group">
    <button>Apply</button>
    <button>Eval</button>
    <button>Save</button>
    <button aria-pressed="false">Trace off</button>
  </div>
  <button class="hara-editor-menubar__help"
          aria-expanded="false"
          aria-controls="editor-help">?</button>
  <button class="hara-editor-menubar__close"
          aria-label="Close editor">×</button>
  <div class="hara-editor-menubar__popover" id="editor-help" hidden>
    <strong>Editor shortcuts</strong>
    <span><kbd>Ctrl/⌘ Enter</kbd> apply</span>
  </div>
</div>
```

## Rules

- Keep primary commands on one row, ordered by frequency.
- Keep structural editing enabled by default; do not spend toolbar space on a
  permanent “Paredit on” label.
- Use `aria-pressed` for optional modes such as tracing.
- Put shortcuts, explanations, and secondary status details behind the `?`
  popover.
- Put Close at the far right, after Help, and return focus to the control that
  opened the editor.
- Give the popover an accessible name and keep `aria-expanded` synchronized
  with its visible state.
- On narrow screens, retain Apply, Eval, Save, Trace, and Help; allow labels to
  compact before removing a command.
