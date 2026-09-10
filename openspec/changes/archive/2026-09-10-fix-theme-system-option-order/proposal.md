## Why
The Theme setting in the UI has the System option listed last, while Accent and Language have their default options first. This inconsistency confuses users and breaks the expected pattern where the default option should be first.

## What Changes
- Change the order of options in the Theme setting group so that the System option appears first, followed by Light and Dark.
- This matches the pattern of Accent and Language where the default option is first.

## Capabilities
### Modified Capabilities
- `settings-modal`: Modify the order of theme options in the settings modal to place the system option first.

### New Capabilities
*(None)*

## Impact
- UI of the settings modal: the order of buttons in the theme switcher group will be changed.
- No changes to APIs, data structures, or storage format.
- The change is purely presentational and does not affect functionality.