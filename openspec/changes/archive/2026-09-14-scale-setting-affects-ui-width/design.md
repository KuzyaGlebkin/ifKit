## Context

The current `applySettings` function in `src/ifKit/settings.ts` only sets the CSS variable `--ifk-font-size-base` based on the `fontSize` setting. This variable controls the root font size, which scales text via `rem` units elsewhere. However, specific UI elements—modal windows (e.g., settings modal), the main game container, and the main menu—have widths defined in fixed pixel units (`px`) that do not scale when the font size changes. This results in inconsistent UI scaling at non-default font sizes, particularly making modals and menus appear too small or large relative to text.

## Goals / Non-Goals

**Goals:**
- Ensure that adjusting the `fontSize` setting proportionally scales the widths of modal windows, main game container, and main menu.
- Leverage the existing `rem` unit system so that width scaling occurs automatically when the root font size changes.
- Maintain the existing range and behavior of the `fontSize` setting (0.8–1.4).

**Non-Goals:**
- Modify heights or other dimensions (e.g., padding, margins) unless they are part of the width specification.
- Scale other UI elements beyond the specified containers (buttons, text, etc.)—these already scale via `rem`-based fonts or are intentionally fixed.
- Change the storage format or default values of the `fontSize` setting.

## Decisions

### Use `rem` units for width scaling
**Decision:** Convert pixel widths of the target containers to `rem` units, calculated relative to the root font size (which is controlled by `--ifk-font-size-base`).  
**Rationale:**  
- The root font size is already updated via `applySettings`; using `rem` ensures widths scale automatically without additional JavaScript.  
- Simpler than introducing a new CSS variable or recalculating widths in JavaScript on every setting change.  
- Consistent with existing text scaling approach.  
**Alternative considered:** Introduce a separate CSS variable (e.g., `--ifk-ui-scale`) bound to `fontSize` and use it in `calc()` expressions for widths (e.g., `width: calc(20rem * var(--ifk-ui-scale))`). This would allow independent control of UI scale vs. text scale but adds complexity. Rejected because the requirement is for proportional scaling tied to the font size setting, and the existing `rem` approach suffices.

### Target specific components for width audit
**Decision:** Audit and modify widths in the following components:  
1. **Settings modal** (likely in `src/ifKit/settings-modal.ts` or associated CSS).  
2. **Main game container** (possibly in `src/ifKit/game.ts` or scene root).  
3. **Main menu** (possibly in `src/ifKit/main-menu.ts` or similar).  
**Rationale:** These are explicitly mentioned in the user request. Focusing on them limits scope and reduces risk. Widths will be changed from `px` to `rem` by dividing the pixel value by the base font size (assuming 16px base, but we will derive appropriate `rem` values to match the intended design at `fontSize: 1.0`).

### No changes to `applySettings` beyond existing
**Decision:** Do not modify the `applySettings` function; rely solely on CSS `rem` units for width scaling.  
**Rationale:** The width scaling will occur automatically as the root font size changes. No additional logic is needed in `applySettings`. If future requirements need non-proportional scaling, this decision can be revisited.

## Risks / Trade-offs

**[Risk]** Converting to `rem` may cause widths to become too small or too large at the extremes of the `fontSize` range (0.8–1.4).  
→ **Mitigation:** The existing range is modest (±20%), and designs should tolerate this variation. If specific containers require clamping, we can add `min-width`/`max-width` in `rem` later.

**[Risk]** Manual conversion of pixel values to `rem` may introduce rounding errors or mismatched designs.  
→ **Mitigation:** Calculate `rem` values as `pxValue / 16` (assuming browser default 16px base) and verify visually at `fontSize: 1.0` to match original pixel width. Adjust as needed.

**[Risk]** Some widths may be defined in inline styles or dynamic JavaScript, making them harder to audit.  
→ **Mitigation:** Search for width-related styles in the identified components; if found in JS, consider moving to CSS or setting via `rem` strings.

## Migration Plan

No data migration is required. The change is purely presentational and takes effect immediately when the `fontSize` setting is adjusted. Existing user settings will continue to work, and the UI will scale widths according to the new `fontSize` value upon next render.

## Open Questions

- Are there any internal borders, shadows, or other effects within the target containers that should also scale to maintain visual consistency? (Likely not, as they are not width-related.)
- Should the main game container's width be constrained to the viewport, or is it already flexible? (We will audit existing behavior.)
- Are there any breakpoints or media queries that override widths and need updated? (We will check during implementation.)
