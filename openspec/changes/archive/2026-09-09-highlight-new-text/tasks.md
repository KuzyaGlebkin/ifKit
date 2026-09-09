## 1. Scene Flag Management

- [x] 1.1 Define a unique scene identifier (e.g., scene name, path, or GUID)
- [x] 1.2 Add a boolean flag `hasBeenShown` per scene in the scene manager
- [x] 1.3 Initialize the flag to `false` when a scene is loaded
- [x] 1.4 Set the flag to `true` after the scene has been fully rendered for the first time (e.g., after first frame or after scene init completes)
- [x] 1.5 Provide an optional reset mechanism (e.g., on scene unload or after a timeout) to set flag back to `false`

## 2. Highlight Suppression Integration

- [x] 2.1 Locate the highlight application point in the text rendering pipeline (shader or overlay function)
- [x] 2.2 Add a conditional check: if current scene’s `hasBeenShown` flag is false, skip highlight overlay
- [x] 2.3 If flag is true, call the existing highlight logic unchanged
- [x] 2.4 Ensure the check incurs minimal overhead (single boolean lookup per text draw call)
- [x] 2.5 Verify that the highlight suppression works across all UI zones and text rendering paths


## 3. Testing Scenarios

- [x] 4.1 Test first‑time load of a scene – verify that no text highlight is applied
- [x] 4.2 Test a second load of the same scene (without reset) – verify that highlight is applied as per existing logic
- [x] 4.3 Test scene hide/show cycle – highlight should remain enabled after first show
