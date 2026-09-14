## 1. Audit and Update Settings Modal Width

- [x] 1.1 Locate width definition for settings modal (in src/ifKit/settings-modal.ts or associated CSS)
- [x] 1.2 Convert pixel width to rem (e.g., if 400px at base, use 25rem assuming 16px base)
- [x] 1.3 Verify modal width scales correctly when fontSize setting changes

## 2. Audit and Update Main Game Container Width

- [x] 2.1 Locate width definition for main game container (in src/ifKit/game.ts or scene setup)
- [x] 2.2 Convert pixel width to rem
- [x] 2.3 Verify game container width scales with fontSize setting

## 3. Audit and Update Main Menu Width

- [x] 3.1 Locate width definition for main menu (in src/ifKit/session-main-menu.ts or similar)
- [x] 3.2 Convert pixel width to rem
- [x] 3.3 Verify main menu width scales with fontSize setting

## 4. Verify and Test Scaling Behavior

- [x] 4.1 Test at minimum fontSize (0.8) - ensure UI elements scale down appropriately
- [x] 4.2 Test at maximum fontSize (1.4) - ensure UI elements scale up without overflow
- [x] 4.3 Test at default fontSize (1.0) - ensure widths match original design
- [x] 4.4 Verify other UI elements (text, buttons) continue to scale as expected
- [x] 4.5 Check for any layout issues (e.g., horizontal scrollbars) at extreme scales

## 5. Update Documentation (if needed)

- [x] 5.1 Ensure the spec delta in specs/user-settings/spec.md accurately reflects the behavior
- [x] 5.2 Confirm proposal and design match implementation
