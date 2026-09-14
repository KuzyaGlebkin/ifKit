## Why

Screen readers currently do not announce when new text is highlighted in the UI, making it difficult for users relying on assistive technology to detect new content. Adding an accessible label (via `aria-label` on an image) before highlighted text will allow screen readers to announce "New" when encountering newly highlighted content, improving accessibility.

## What Changes

- Modify `src/ifKit/seen-content.ts` to insert an `<img>` element with `aria-label` set to the localized string for "New" before each element that receives the 'paragraph--unseen' class (i.e., newly highlighted text).
- Use the localization function `u` to retrieve the translated string for the "New" label from UI keys.
- Add a new UI key for the "New" label (e.g., `ui.newTextLabel`) and provide translations in the respective locale files.
- Ensure the inserted image is accessible (e.g., using `role="img"` and `aria-label`; the image source can be a transparent or placeholder image since we only need the label).
- The image will be removed later? (Note: The original description mentioned removing the tag later; however, for this change, we focus on adding it. Removal may be handled in a separate change if needed.)

## Capabilities

### New Capabilities
- `new-text-label`: Introduces the capability to announce new text to screen readers via an accessible image label.

### Modified Capabilities
- None (we are not changing existing requirements, just adding an enhancement)

## Impact

- Files: `src/ifKit/seen-content.ts`, `src/ifKit/ui-keys.ts`, `src/locales/en.ui.json`, `src/locales/ru.ui.json`, `src/ifKit/builtin-ui.ts` (for Russian fallback).
- No breaking changes; this is an additive accessibility improvement.