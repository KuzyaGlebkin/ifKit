## 1. Preparation

- [x] 1.1 Import the `u` function from './ifKit' in src/ifKit/seen-content.ts
- [x] 1.2 Verify that the existing UI key `ui.settingsUnseenLabel` provides the localized string for "New text" (English: "New", Russian: "Новый")

## 2. Core Implementation

- [x] 2.1 Modify the `processLeafBlocks` function to create an img tag with the following attributes:
      - `aria-label` set to the result of `u(UI.newTextLabel)`
- [x] 2.2 Insert the img element immediately before the target element (`el`) when `addHighlight` is true, using `el.parentNode.insertBefore(imgEl, el)`
- [x] 2.3 Ensure the img element is created only once per highlight event (i.e., each time we highlight an element, we create a new img)

## 3. Testing and Validation

- [x] 3.1 Verify that the img element is inserted in the DOM when new text is highlighted
- [x] 3.2 Use a screen reader tool (e.g., NVDA, VoiceOver) to confirm that "New text" is announced when encountering newly highlighted text
- [x] 3.3 Ensure that the visual appearance of the highlighted text remains unchanged (only the hidden img is added)
- [x] 3.4 Test that the functionality works for both static and scene-scoped content
- [x] 3.5 Run existing tests to ensure no regressions

## 4. Localization (if needed)

- [x] 4.1 If the product team decides to use a separate key for "New" (without "text"), add the new UI key `ui.newTextLabel` to src/ifKit/ui-keys.ts
- [x] 4.2 Add translations for the new key in src/locales/en.ui.json and src/locales/ru.ui.json
- [x] 4.3 Add the new key to the builtin UI for Russian fallback in src/ifKit/builtin-ui.ts
- [x] 4.4 Update the implementation to use the new key instead of `ui.settingsUnseenLabel`
