## Context

The Settings UI contains a Volume section with a control labeled "Громкость" in Russian and "Volume" in English. This label is confusing because it matches the section title and does not clearly indicate that it controls the overall (master) volume level.

## Goals / Non-Goals

**Goals:**
- Rename the overall volume control label to "Общая" (Russian) and "Master" (English).
- Ensure both localization files are updated consistently.
- Keep the change minimal and free of functional side effects.

**Non-Goals:**
- Changing any volume logic, slider behavior, data model, or API.
- Adding new settings or controls.
- Updating other languages (outside of Russian and English).

## Decisions

- Update Russian locale string: change the key/value pair that maps the overall volume label to "Общая".
- Update English locale string: change the key/value pair that maps the overall volume label to "Master".
- Locate strings via the existing settings / UI localization keys rather than hard-coded text in components.

## Risks / Trade-offs

- [Risk] Other languages still say "Volume" (or equivalent). → Mitigation: This is acceptable per non-goals; translators can update independently.
- [Risk] The key name in code might still say `volumeLabel` which could confuse future developers. → Mitigation: If the key is descriptive enough (e.g., `settings.volume.master`), no code rename is needed.
