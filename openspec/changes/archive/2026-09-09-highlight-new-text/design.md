## Context

The game currently applies a uniform highlight to all text elements whenever they are rendered, regardless of whether the player has seen the scene before. This results in unnecessary visual emphasis on text in first-time scenes, where the player has no prior experience and highlighting does not add value.

## Goals / Non-Goals

**Goals:**
- Disable text highlight for scenes that are being shown for the first time.
- Preserve existing highlighting behavior for scenes that have been shown at least once (known scenes), allowing the existing highlight logic to operate unchanged.
- Keep the implementation simple and low-overhead by storing a single boolean per scene.
- Ensure the solution works across all UI zones and text rendering paths.

**Non-Goals:**
- Change the visual appearance or style of the highlight itself.
- Modify the underlying text content or layout.
- Introduce new UI dependencies or external libraries.
- Alter highlighting for non-text UI elements (icons, images).
- Implement per‑text novelty or obviousness tracking.

## Decisions

### Per‑Scene Visibility Flag
- **Decision:** Assign each scene a unique identifier (e.g., scene name or hash). Maintain a boolean flag `hasBeenShown` that is set to `true` after the scene has been fully rendered at least once. The flag persists for the duration of the game session (or until explicitly reset).
- **Rationale:** This directly addresses the user's request: no highlight in first-time scenes, normal highlight thereafter. Alternatives such as per‑text tracking were considered but deemed overly complex for the stated problem.

### Highlight Suppression Logic
- **Decision:** In the text rendering pipeline, before applying the highlight overlay, check the scene’s `hasBeenShown` flag. If `false`, skip the highlight; if `true`, proceed with the existing highlight logic (unchanged).
- **Rationale:** This adds minimal overhead—a single boolean lookup per text draw call—and keeps the existing highlight system intact for known scenes.

### Implementation Scope
- **Decision:** Integrate the flag check into the existing highlight function or shader conditional. The flag will be managed by the scene manager: when a scene is loaded, its flag is read from a persistent set (or default false); after the first frame where the scene is considered "shown", set the flag to true.
- **Rationale:** Centralizing the flag in the scene manager avoids scattering logic across UI components and ensures consistency. The UI rendering system only needs to query the flag.

## Risks / Trade-offs

- **[Risk] Incorrect scene identification:** If two different scenes share the same identifier, the flag could be incorrectly shared. → **Mitigation:** Use unique scene IDs (e.g., full path or GUID) guaranteed by the scene loading system.
- **[Risk] Flag persistence:** A scene that is shown, then hidden, and shown again later may still be considered "known" even if the player left for a long time. This matches the requirement (highlight only on first-ever show). If a different behavior is desired (e.g., reset after time), the flag can be cleared based on timeout or scene unload. → **Mitigation:** Provide an optional reset mechanism (e.g., on scene unload or after a configurable delay).
- **[Risk] Performance:** Negligible; one boolean check per text element.