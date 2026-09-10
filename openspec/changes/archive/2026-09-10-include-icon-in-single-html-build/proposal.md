## Why

Currently, when building the application into a single HTML file for easy sharing, an icon resource is not embedded into the resulting HTML file. Instead, it remains as a separate file alongside the HTML. This defeats the primary goal of a single-file build, which is to produce one self-contained file that can be easily shared without missing dependencies.

## What Changes

- Modify the build process to embed the icon (likely as a base64-encoded data URL) directly into the single HTML output file.
- Ensure that the icon is correctly referenced and displayed when the HTML file is viewed.

## Capabilities

### New Capabilities
- `icon-in-single-html-build`: Ensures that the icon resource is embedded within the single HTML file during the build process, resulting in a truly self-contained single-file output.

### Modified Capabilities
<!-- No existing capabilities are being modified at the requirements level. -->

## Impact

- Build configuration files (e.g., webpack, rollup, or custom build scripts) will need to be updated to include the icon embedding step.
- The resulting single HTML file will increase in size by the icon's data URL representation, but this is acceptable for shareability.
- No changes to runtime behavior or public APIs are expected.