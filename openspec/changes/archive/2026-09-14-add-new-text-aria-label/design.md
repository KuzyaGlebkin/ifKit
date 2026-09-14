## Context
Currently, when new text is highlighted in the UI (by adding the 'paragraph--unseen' class), screen readers do not receive any indication that the text is new. This makes it difficult for users relying on assistive technology to detect new content. The project already has a localization system in place via the `u` function and UI keys.

## Goals / Non-Goals
**Goals:**
- Provide an accessible way for screen readers to announce when text is newly highlighted.
- Use the existing localization framework to support multiple languages.
- Make minimal changes to the existing highlighting logic.
- Ensure the solution does not interfere with visual design or existing functionality.

**Non-Goals:**
- Changing the visual appearance of the highlighted text (the highlight class remains).
- Removing the highlight functionality.
- Implementing a full ARIA live region solution (though that could be considered in the future).

## Decisions
### Decision 1: Use an img element with aria-label for screen reader announcement
- **Why**: The user explicitly requested to add an `<img aria-label=Новый>` before the highlighted text. An img element with an aria-label is a straightforward way to provide accessible text that screen readers will read.
- **Why not other options**: 
  - Using a span or div with aria-hidden=false and role="img" would be similar but less conventional.
  - Using ARIA live regions would be more complex and might cause verbose announcements.
  - Changing the existing highlight class to include aria-label is not possible because aria-label is not allowed on all elements (though it is allowed on any element in ARIA 1.1, but we stick to the user's request).
- **Implementation**: Insert an img element before the target element. The img will have an empty or decorative src (e.g., a 1x1 transparent pixel) and aria-label set to the localized string for "New". To avoid visual impact, we will apply inline styles to make it visually hidden (width:0, height:0, overflow:hidden) or use a CSS class if available.

### Decision 2: Reuse the existing `ui.settingsUnseenLabel` for the localized string
- **Why**: The label "New text" is already localized in the project (English: "New text", Russian: "Новый текст") and is semantically close to the requested "New". Creating a new key would duplicate effort.
- **Why not create a new key**: The existing label is already maintained and localized. Using it reduces the risk of missing translations.
- **Note**: If the product team prefers exactly "New" without "text", we can create a new key `ui.newTextLabel`. For this design, we propose reusing `ui.settingsUnseenLabel` to leverage existing work.

### Decision 3: Insert the img in the `processLeafBlocks` function when `addHighlight` is true
- **Why**: The `processLeafBlocks` function is where the 'paragraph--unseen' class is added. This is the exact point where we know an element is being newly highlighted.
- **Alternative**: Inserting the img elsewhere would require duplicating logic or observing DOM changes, which is more complex.

### Decision 4: Ensure the img is accessible and does not interfere with assistive technologies beyond the intended label
- **Why**: We must avoid making the img focusable or causing unexpected behavior.
- **Implementation**: Set `aria-hidden="false"` (default) and rely solely on aria-label for the accessible name. We will also set `role="img"` explicitly to ensure it is treated as an image. Provide an empty alt attribute? Actually, if we provide aria-label, the alt is ignored. We can set alt="" to avoid redundancy, but it's not necessary. We'll set alt="" and aria-label to the localized string.

## Risks / Trade-offs
- [Risk] Inserting DOM elements could potentially break layouts if the CSS is sensitive to unexpected elements. → Mitigation: Make the img visually hidden via inline styles (width:0, height:0, overflow:hidden, display:block) to minimize visual impact.
- [Risk] Performance impact from creating many img elements if many elements are highlighted at once. → Mitigation: The highlighting occurs only once per element when it is first seen, so the number of img elements is limited to the number of newly seen elements per session.
- [Risk] The img might be picked up by automated tools as a broken image if the src is invalid. → Mitigation: Use a data URL for a transparent 1x1 pixel (e.g., `src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"` ) or use an empty string? An empty src might cause a broken image icon in some browsers if the image is visible. Since we are hiding it visually, we can use a data URL or omit src? The img element requires a src attribute. We'll use a transparent data URL.
- [Risk] Reusing `ui.settingsUnseenLabel` may not exactly match the user's request for "Новый" (without "текст"). → Mitigation: Confirm with stakeholders; if needed, create a new key.

## Migration Plan
- No migration needed as this is an additive feature.
- Rollback: Simply revert the changes to seen-content.ts and remove the new UI key if added.

## Open Questions
- Should we use the exact string "Новый" or reuse "Новый текст"? 
- Is there an existing CSS class for visually hidden content in the project that we should use instead of inline styles?