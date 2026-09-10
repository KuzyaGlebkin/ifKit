## Context

The application is built into a single HTML file for distribution. Currently, during this build process, an icon file (likely a favicon or similar) is not included in the HTML output. Instead, it is emitted as a separate file. This means the single HTML file is not truly self-contained; the icon must be present alongside it for the application to display correctly. The goal of a single-file build is to have one file that can be shared and run independently.

## Goals / Non-Goals

**Goals:**
- Ensure the icon is embedded within the single HTML file during the build process.
- Maintain the correct display of the icon when the HTML file is viewed.
- Keep the build process change minimal and focused.

**Non-Goals:**
- Changing the icon itself or its design.
- Modifying how the icon is used in other build targets (e.g., non-single-file builds).
- Optimizing the icon size beyond the base64 encoding (though we note the size increase is acceptable).

## Decisions

**Icon Embedding Method:** Use a base64-encoded data URL to embed the icon directly into the HTML file.
  - *Rationale:* This is a standard way to embed small binary files (like icons) into HTML/CSS. It avoids external dependencies and keeps the file self-contained.
  - *Alternatives considered:* 
    - Inlining the icon as a separate `<link>` tag with `rel="icon"` and `href` as data URL (chosen).
    - Using JavaScript to dynamically set the icon after page load (rejected because it would delay icon display and complicate the build).
    - Leaving the icon as a separate file and documenting that it must be shipped together (rejected because it violates the single-file goal).

**Build Process Integration:** Modify the existing single-file build step to process the icon file and inject the appropriate HTML tag.
  - *Rationale:* The build process already handles other assets for inlining; extending it to handle the icon is consistent.
  - *Alternatives considered:* 
    - Adding a post-build script that modifies the HTML (rejected because it adds complexity and another step).
    - Changing the HTML template to include a placeholder that is replaced during build (chosen as part of the build process modification).

## Risks / Trade-offs

[Risk] The single HTML file size will increase by the base64 size of the icon (approximately 33% larger than the binary icon).
  → Mitigation: The icon is typically small (a few KB), so the increase is acceptable for the benefit of a truly self-contained file.

[Risk] If the icon file is missing during the build, the build may fail or produce an incorrect HTML file.
  → Mitigation: Ensure the build process checks for the icon's existence and fails with a clear error message.

[Risk] The base64 encoding step might be overlooked if the build process is changed in the future.
  → Mitigation: Document the change in the build configuration and add a comment in the build script about the icon embedding.