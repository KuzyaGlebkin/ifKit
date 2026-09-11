## 1. Modify Screen Section Rendering

- [x] 1.1 Locate the component or template responsible for rendering the Screen section in the settings modal.
- [x] 1.2 Modify the rendering logic to always apply `aria-hidden="true"` to the Screen section's root `<section>` element and ensure `aria-labelledby` is omitted.
- [x] 1.3 Verify that the Screen section's visual appearance and functionality remain unchanged for sighted users (no CSS changes, no behavioral changes).
- [x] 1.4 Update any existing tests that relied on conditional accessibility attributes to reflect the new unconditional behavior.

## 2. Testing and Validation

- [x] 2.1 Create integration tests for the settings modal that assert the Screen section has `aria-hidden="true"` and does not have `aria-labelledby`.
- [x] 2.2 Test that the Screen section remains visually present and operable via mouse, touch, and keyboard.
- [x] 2.3 Run automated accessibility tests (e.g., axe, Lighthouse) to ensure no new violations are introduced.
- [x] 2.4 Perform manual testing with screenreaders to confirm the section is not announced or navigable.

## 3. Deployment and Documentation

- [x] 3.1 Review the change for any potential impact on other parts of the application.
- [x] 3.2 Prepare a brief description of the change for release notes, highlighting the improved accessibility for screenreader users.
- [x] 3.3 Merge the changes into the main branch after approval.