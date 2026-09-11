## Context

The settings modal was restructured into four semantic sections (Screen, Volume, Language, Text Highlight) via the `restructure-settings-into-sections` spec. The Screen section contains visual settings: theme, font size, and accent color. These settings are irrelevant to users who rely on screenreaders, as they cannot perceive visual changes. Currently, the Screen section is fully accessible to assistive technologies, allowing screenreader users to navigate into it and encounter controls that are meaningless to them. This creates unnecessary navigation overhead and confusion.

## Goals / Non-Goals

**Goals:**
- Hide the Screen section from screenreader navigation by always applying `aria-hidden="true"` to its root `<section>` element.
- Preserve all visual and interactive functionality of the Screen section for sighted users (the section remains visible and operable via mouse, touch, and keyboard).
- Ensure the change does not interfere with other assistive technologies or accessibility features beyond hiding the Screen section from screenreaders.

**Non-Goals:**
- Do not remove the Screen section from the DOM or alter its visual layout.
- Do not change the behavior of the Screen section for sighted users (e.g., theme, font, accent controls remain fully functional).
- Do not address accessibility of other sections (Volume, Language, Text Highlight) unless they exhibit similar issues.

## Decisions

### Hiding Technique
**Decision:** Always apply `aria-hidden="true"` to the Screen section's root `<section>` element.
**Rationale:** 
- `aria-hidden="true"` removes the element and its children from the accessibility tree, preventing screenreader announcement and navigation.
- It does not affect visual rendering; the section remains visible on screen.
- It does not remove the element from the tab order; sighted users can still navigate to focusable elements inside the section via Tab (though screenreaders will not announce them). This is acceptable because sighted users do not rely on screenreaders and can still interact with the controls visually or via keyboard if needed.
- Alternative considered: Using `role="presentation"` or `aria-hidden` on inner elements. Rejected because it would require more granular changes and might not hide the section heading.
- Alternative considered: CSS `visibility: hidden` or `display: none`. Rejected because it hides the section visually for all users, which is not desired.
- Alternative considered: The `inert` attribute. Rejected due to limited browser support and potential over-hiding.

### Screenreader Detection
**Decision:** No screenreader detection is needed. The `aria-hidden="true"` attribute is applied unconditionally.
**Rationale:**
- The requirement is to hide the Screen section from screenreader users. Applying `aria-hidden="true"` unconditionally achieves this for all users who rely on screenreaders, regardless of detection.
- Sighted users are unaffected because `aria-hidden` only impacts the accessibility API; visual presentation and direct interaction remain unchanged.
- This approach eliminates the complexity and unreliability of screenreader detection heuristics.
- If future requirements change to hide the section only when a screenreader is detected, the implementation can be revisited, but the current specification calls for unconditional hiding.

## Risks / Trade-offs

[Risk] Sighted users who rely on screenreaders (e.g., low-vision users who use both magnification and screenreader) may not perceive the Screen section.
[Mitigation] This is acceptable per the requirement: screenreader users are assumed to be blind and do not need visual settings. If a sighted user uses a screenreader, they are still a screenreader user and thus the target of the hiding.

[Risk] The Screen section remains in the tab order for keyboard navigation, which might confuse sighted users who tab into it and hear nothing (if they happen to be using a screenreader).
[Mitigation] Sighted users not using a screenreader will not hear anything regardless. Sighted users using a screenreader are screenreader users and thus the target of hiding. For sighted users not using assistive technology, tabindex behavior is irrelevant as they rely on visual focus.

[Risk] Automated accessibility tools might flag the presence of `aria-hidden` on a focusable element.
[Mitigation] The Screen section itself is not focusable; only its inner elements may be. This is a known limitation but acceptable per the requirement. We can ensure that the section does not contain any focusable elements that are critical for sighted users without alternative access (all critical settings have redundant visual controls).

## Migration Plan

1. Modify the Screen section rendering to always apply `aria-hidden="true"` to its root `<section>` element and ensure `aria-labelledby` is omitted (or not set).
2. Remove any existing screenreader detection logic if it was previously added for this purpose.
3. Update any tests that expected conditional behavior to reflect the new unconditional behavior.
4. Deploy the change directly to all users.
5. Rollback: Revert the changes to the section rendering, restoring the previous accessibility attributes.

## Open Questions

- Should we consider also hiding the Screen section from other assistive technologies (e.g., voice control) beyond screenreaders? The current change hides it from all assistive technologies that respect `aria-hidden`.
- How will this change interact with automated accessibility testing tools (e.g., axe, Lighthouse)? We will ensure that the use of `aria-hidden` is documented and does not cause false positives for critical content.
- Are there any sighted users who rely on screenreaders for accessing visual settings (e.g., to configure them via voice commands)? If so, this change may impede them; however, the requirement assumes screenreader users are blind and do not need visual settings.