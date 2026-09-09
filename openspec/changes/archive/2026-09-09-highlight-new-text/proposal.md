## Why

Currently the game highlights all text whenever it appears, even in scenes shown to the player for the first time. This unnecessary emphasis distracts the player and reduces clarity, as there is no need to accentuate that the text is new when the player has not seen it before.

## What Changes

- Add a flag per scene indicating whether the scene has been shown before.
- Skip applying text highlight for any text rendered in scenes whose shown‑flag is false (i.e., first‑time scenes).
- Keep the existing highlighting behavior for scenes that have been shown at least once (i.e., treat them as “known” contexts where new text may need emphasis).
- Optionally reset the flag when returning to a scene after a long time, if needed.

## Capabilities

### New Capabilities
- `scene-based-highlight-control`: Enable/disable text highlight based on whether a scene has been previously displayed.

### Modified Capabilities
<!-- No existing spec-level behavior changes; the new capability works alongside the existing highlight system. -->

## Impact

- UI text rendering systems that apply the highlight overlay.
- Scene manager or loading system to set/get the per‑scene shown flag.
- Minimal storage: one boolean per scene.
- No breaking changes to existing APIs; the change wraps the existing highlight call with a condition.