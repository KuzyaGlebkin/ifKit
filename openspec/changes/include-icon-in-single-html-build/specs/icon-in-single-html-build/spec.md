## ADDED Requirements

### Requirement: Icon embedded in single HTML build
The single HTML build SHALL embed the icon resource as a base64-encoded data URL within the HTML file, ensuring no separate icon file is emitted.

#### Scenario: Icon is embedded as data URL
- **WHEN** the single HTML build process is executed
- **THEN** the generated HTML file contains a `<link rel="icon">` tag (or equivalent) with an `href` attribute set to a base64-encoded data URL representing the icon
- **AND** no separate icon file is emitted in the build output directory

#### Scenario: Icon displays correctly
- **WHEN** the generated single HTML file is opened in a web browser
- **THEN** the icon is displayed correctly as the page's favicon (or wherever the icon is used)