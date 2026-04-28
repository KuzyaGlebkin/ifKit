## 1. Markup (done)

- [x] 1.1 `aria-hidden="true"` on `#ifk-settings-accent-row`
- [x] 1.2 `tabindex="-1"` on all `.ifk-accent-btn` (as `.ifk-theme-btn` in `#ifk-settings-theme-font`)

## 2. Verification

- [x] 2.1 `modal-focus-lock` + `getTabbableIn` must ignore `tabindex="-1"`: accent **not** in Tab cycle
- [x] 2.2 (optional) Screen reader: accent row is **not** announced like separate controls (same as Theme+Font) — policy matches Theme+Font block
