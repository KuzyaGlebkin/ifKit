## Context

**Current state** (`settings-modal.ts`):
- `buildModal()` generates a flat HTML string with 9 `.ifk-settings-row` divs
- `syncToDOM()` updates controls by querying flat selectors (`#ifk-font-size`, `.ifk-theme-btn`, etc.)
- `initSettingsModal()` attaches listeners to flat selectors
- CSS assumes flat structure (`.ifk-settings-row`, `.ifk-settings-row--volume`, `.ifk-settings-row--segment`)
- `refreshSettingsModalI18n()` updates text content via `[data-ifk-ui]` attributes

**Constraints**:
- Must preserve all existing functionality (immediate apply, reset, export/import, focus lock)
- No changes to `settings.ts` data model or storage
- Language section conditional (hidden if < 2 languages) unchanged
- i18n keys for section headings need to be added

## Goals / Non-Goals

**Goals:**
- Restructure modal DOM into 4 semantic `<section>` elements with `<h3>` headings
- Add `aria-labelledby` for accessibility
- Horizontal rules between sections
- Preserve all existing behavior and event handlers
- Minimize CSS changes (reuse existing row/control classes)
- Add i18n keys for 4 section headings

**Non-Goals:**
- No collapsible/expandable sections
- No changes to `Settings` type, defaults, load/save, apply logic
- No changes to audio sync or theme/font/accent application
- No new settings or features

## Decisions

### 1. DOM Structure: `<section>` + `<h3>` + `aria-labelledby`

```html
<section aria-labelledby="ifk-section-screen-label">
  <h3 id="ifk-section-screen-label" data-ifk-ui="settingsSectionScreen">Экран</h3>
  <!-- existing rows: theme, font, accent -->
</section>
<hr>
<section aria-labelledby="ifk-section-volume-label">
  <h3 id="ifk-section-volume-label" data-ifk-ui="settingsSectionVolume">Громкость</h3>
  <!-- existing rows: master, music, sound -->
</section>
<hr>
<!-- conditional -->
<section aria-labelledby="ifk-section-lang-label">
  <h3 id="ifk-section-lang-label" data-ifk-ui="settingsSectionLang">Язык</h3>
  <!-- existing lang row -->
</section>
<hr>
<section aria-labelledby="ifk-section-highlight-label">
  <h3 id="ifk-section-highlight-label" data-ifk-ui="settingsSectionHighlight">Подсветка текста</h3>
  <!-- existing rows: unseen toggle, reset seen -->
</section>
```

**Rationale**: Semantic HTML, proper heading hierarchy (modal title = `<h2>`, sections = `<h3>`), screen readers announce sections. `aria-labelledby` ties section to heading without duplicating text.

**Alternative considered**: `<fieldset>` + `<legend>` — rejected because these are not form fields groups but semantic content sections; `<section>` + `<h3>` is more appropriate.

### 2. Horizontal Rules: `<hr>` Between Sections

- Insert `<hr class="ifk-settings-divider">` between adjacent sections
- No divider before first or after last
- CSS: `border: none; border-top: 1px solid var(--ifk-border); margin: 1rem 0;`

**Rationale**: Simple, semantic, styleable. No JavaScript logic needed.

### 3. `buildModal()` Refactor Strategy

**Approach**: Build sections as separate template functions, compose in order.

```ts
function buildScreenSection(): string { ... }
function buildVolumeSection(): string { ... }
function buildLangSection(): string { ... }  // returns '' if < 2 langs
function buildHighlightSection(): string { ... }

function buildModal(): HTMLElement {
  const sections = [
    buildScreenSection(),
    buildVolumeSection(),
    buildLangSection(),
    buildHighlightSection(),
  ].filter(Boolean)
  
  const body = sections.join('<hr class="ifk-settings-divider">')
  // ... wrap in dialog markup
}
```

**Rationale**: Keeps `buildModal()` readable, each section isolated, easy to test/maintain. `filter(Boolean)` handles conditional language section cleanly.

### 4. `syncToDOM()` — No Structural Changes Needed

Existing `syncToDOM()` queries by stable IDs (`#ifk-font-size`, `#ifk-master-vol`, `.ifk-theme-btn`, etc.) which remain unchanged. Section wrappers don't affect descendant queries.

**Risk**: None — selectors are ID/class-based, not structure-dependent.

### 5. `refreshSettingsModalI18n()` — Add Section Heading Updates

Current implementation updates `[data-ifk-ui]` and `[data-ifk-ui-aria]`. Section `<h3>` elements will have `data-ifk-ui` with new keys:
- `settingsSectionScreen`
- `settingsSectionVolume`
- `settingsSectionLang`
- `settingsSectionHighlight`

No code change needed beyond adding keys to UI strings.

### 6. CSS Changes

**New**:
```css
.ifk-settings-divider {
  border: none;
  border-top: 1px solid var(--ifk-border);
  margin: 1rem 0;
}
```

**Existing classes preserved**: `.ifk-settings-row`, `.ifk-settings-row--volume`, `.ifk-settings-row--segment`, `.ifk-segment-group`, `.ifk-range-wrap`, etc.

**Potential tweak**: Add `padding-bottom: 0.5rem` to last row in each section if visual spacing feels off — decide during implementation.

### 7. i18n Keys Required

Add to UI strings (likely in `ui-keys.ts` or equivalent):
- `settingsSectionScreen`: "Экран" / "Screen"
- `settingsSectionVolume`: "Громкость" / "Volume"
- `settingsSectionLang`: "Язык" / "Language"
- `settingsSectionHighlight`: "Подсветка текста" / "Text Highlight"

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| CSS regression on existing row styles | Test all 9 controls visually; existing classes unchanged |
| Focus order broken | Sections are static, no collapsible — tab order follows DOM order naturally |
| Language section conditional logic broken | `buildLangSection()` returns `''` when `< 2` langs; `filter(Boolean)` removes it; divider logic handles adjacency |
| i18n keys missing | Add 4 keys to translation files; `refreshSettingsModalI18n()` already handles `[data-ifk-ui]` generically |
| Horizontal rule styling inconsistent | Use CSS variable `--ifk-border` for theme consistency |

## Affected Files

1. **`src/ifKit/settings-modal.ts`** — Primary changes:
   - `buildModal()` → section-based composition
   - `buildLangRow()` → `buildLangSection()` (wraps in section)
   - New: `buildScreenSection()`, `buildVolumeSection()`, `buildHighlightSection()`
   - `refreshSettingsModalI18n()` — no change needed (generic)

2. **`src/ifKit/style.css`** (or wherever modal styles live) — Add `.ifk-settings-divider`

3. **Translation files** — Add 4 section heading keys

## Testing Checklist

- [ ] Modal opens with 4 sections in correct order
- [ ] Language section hidden when 1 language
- [ ] Language section shown when ≥2 languages
- [ ] All 9 controls functional (immediate apply)
- [ ] Reset button works
- [ ] Export/Import works
- [ ] Keyboard navigation: Tab through all controls in order
- [ ] Focus lock works
- [ ] Escape closes modal
- [ ] i18n refresh updates section headings
- [ ] Screen reader: sections announced with headings