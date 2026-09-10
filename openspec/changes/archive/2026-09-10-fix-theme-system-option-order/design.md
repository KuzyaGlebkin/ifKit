## Context
Currently, in the settings modal, the Theme section presents three options: Light, Dark, and System (in that order, with System last). In contrast, the Accent section presents the default option ('default') first, and the Language section presents the default option ('Авто' for auto-detection) first. This inconsistency violates the expected pattern where the default option should appear first in each section.

## Goals / Non-Goals
**Goals:**
- Change the order of options in the Theme setting group so that the System option appears first.
- Achieve visual consistency with the Accent and Language sections where the default option is first.
- Improve user experience by making the default option immediately visible in each section.

**Non-Goals:**
- Altering the functionality of the theme switcher (e.g., how themes are applied or stored).
- Changing the underlying settings model or the definition of the 'system' theme value.
- Modifying the order of options in the Accent or Language sections.
- Changing any other sections of the settings modal.

## Decisions
**Decision: Reorder theme buttons to place System first.**
- **Rationale:** The system theme is the default value for the theme setting (as defined in `engineDefaults.theme: 'system'` in user-settings spec). Placing it first aligns with the pattern observed in Accent (default 'default' first) and Language (default 'Авто' first). This reduces cognitive load for users who expect the default option to be first.
- **Alternative considered:** Keeping the current order (Light, Dark, System). Rejected because it does not resolve the inconsistency.
- **Alternative considered:** Ordering as System, Dark, Light. Rejected because it does not follow the logical grouping of light-to-dark progression and still places System first but disrupts the expected sequence.

## Risks / Trade-offs
**Risk:** Users accustomed to the current order may experience a brief adjustment period.
**Mitigation:** The change improves overall consistency and follows established patterns, reducing long-term confusion.
**Trade-off:** None significant; the change is purely presentational with no functional impact.

## Migration Plan
Not applicable. This is a client-side UI change that does not affect data storage, APIs, or require schema migrations. The updated order will be effective upon deployment.

## Open Questions
None.