---
slug: "restructure-settings-into-sections"
createdAt: "2026-08-21T12:16:38.827Z"
---

# Proposal: Restructure Settings Modal into Sections

## Problem
The current settings modal presents all settings as a flat list of 9 rows. This creates cognitive overhead for users trying to find related settings (e.g., all volume controls are scattered). The proposal reorganizes settings into 4 semantic sections.

## Solution
Restructure the settings modal DOM to use `<section>` elements with `<h3>` headings and `aria-labelledby` for accessibility. Sections are always expanded (no collapsible behavior), separated by horizontal rules.

### Section Structure
| Section | Heading | Contents | Conditional |
|---------|---------|----------|-------------|
| Screen | Экран | Theme, Font Size, Accent | Always shown |
| Volume | Громкость | Master Volume (on/off + slider), Music Volume (on/off + slider), Sound Volume (on/off + slider) | Always shown |
| Language | Язык | Language selector buttons | Only if ≥2 languages available |
| Text Highlight | Подсветка текста | Unseen highlight toggle, Reset seen history button | Always shown |

### Order
Screen → Volume → Language → Text Highlight

### Accessibility
- Each `<section>` has `aria-labelledby` pointing to its `<h3>`
- Headings use `<h3>` for proper heading hierarchy (modal title is `<h2>`)
- No collapsible sections = simpler focus management, always accessible

### Visual
- Horizontal rule (`<hr>`) between sections
- Existing CSS classes for rows/controls preserved where possible

## Non-Goals
- No changes to `Settings` data model (`settings.ts`)
- No changes to storage, defaults, import/export
- No changes to `applySettings()` or audio sync logic
- Language conditional display logic unchanged

## Acceptance Criteria
1. Modal renders 4 sections in correct order
2. Each section has `<h3>` with `id` and section has `aria-labelledby`
3. Screen section contains: Theme buttons, Font slider, Accent buttons
4. Volume section contains: Master/Music/Sound each with checkbox + slider
5. Language section only renders when ≥2 languages; hidden otherwise
6. Text Highlight section contains: Unseen toggle + Reset history button
7. Horizontal rules between sections
8. All existing functionality works (immediate apply, reset, export/import)
9. Keyboard navigation and focus lock unchanged
10. i18n refresh updates section headings