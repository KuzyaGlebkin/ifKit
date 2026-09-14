## Why

The scale setting (fontSize) currently only affects text size via the CSS variable `--ifk-font-size-base`. Users expect changing the scale to proportionally adjust the entire UI, including modal windows, main game area, and main menu, for better accessibility and consistency, especially at higher scales where fixed pixel widths can cause UI elements to appear too small or overflow.

## What Changes

- Modify the `applySettings` function to also influence widths of modal windows, main game container, and main menu based on the fontSize setting.
- Audit existing UI components for hard-coded pixel widths and convert them to relative units (rem) that scale with the base font size, ensuring proportional scaling.
- Update relevant CSS or styling rules to use rem units for widths where appropriate.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `user-settings`: The `fontSize` setting now also affects UI element widths (modal windows, main game, main menu) in addition to font size, changing the requirement from solely text scaling to overall UI scaling.

## Impact

- **Code**: Updates to `openspec/specs/user-settings/spec.md` (to reflect changed requirements) and implementation in settings application logic (likely in `applySettings` or related styling functions).
- **APIs**: No changes to public APIs.
- **Dependencies**: None.
- **Systems**: UI rendering and settings subsystem.
