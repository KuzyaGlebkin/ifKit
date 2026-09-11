## Why

The Screen section (Экран) in the settings modal contains visual settings (theme, font size, accent) that are irrelevant to screenreader users. When a screenreader is enabled, navigating to this section creates unnecessary tab stops and confusion, as blind users cannot perceive the visual changes these settings control. Currently, after the restructure-settings-into-sections refactor, the Screen section is fully accessible to assistive technologies, which defeats the purpose of hiding visual settings from non-sighted users. This change reinstates the intended inaccessibility of the Screen section by hiding it from assistive technologies unconditionally.

## What Changes

- Modify the Screen section rendering logic to always apply `aria-hidden="true"` to its root `<section>` element and ensure `aria-labelledby` is omitted.
- This change affects only the accessibility properties of the Screen section; all visual and functional behavior for sighted users remains unchanged (the section remains visible and operable via mouse, touch, and keyboard).

## Capabilities

### New Capabilities
None

### Modified Capabilities
- `restructure-settings-into-sections`: Modify the Screen section requirement to include unconditional hiding from assistive technologies via `aria-hidden="true"`.

## Impact

- Code: Changes to the settings modal UI rendering logic, likely in the section structure implementation.
- APIs: No new utilities needed; the change uses standard ARIA attributes.
- Dependencies: None expected.
- Systems: Affects the accessibility of the settings modal for screenreader users by removing the Screen section from the accessibility tree.