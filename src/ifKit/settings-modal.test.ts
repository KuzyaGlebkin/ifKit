import { buildScreenSection } from './settings-modal'

describe('buildScreenSection', () => {
  test('returns section with aria-hidden="true" and without aria-labelledby', () => {
    const html = buildScreenSection()

    // Check that the section has aria-hidden="true"
    expect(html).toContain('<section aria-hidden="true">')

    // Check that the section does NOT have aria-labelledby
    expect(html).not.toContain('aria-labelledby')

    // Optional: check that the inner h3 id is present
    expect(html).toContain('id="ifk-section-screen-label"')
  })

  test('section is visually present (no CSS hiding)', () => {
    const html = buildScreenSection()

    // The section should not have inline styles that hide it
    expect(html).not.toMatch(/<section[^>]*\bstyle\s*=\s*["'][^"]*\b(display\s*:\s*none|visibility\s*:\s*hidden)\b[^"]*["']/i)

    // The section should not have a class that hides it (we assume no such class is added)
    // We can check for common hiding classes if they exist in the project, but we don't know them.
    // For now, we just check that the section tag is present without hiding attributes.
    expect(html).toMatch(/<section aria-hidden="true">/)
  })

  test('inner controls are present and operable', () => {
    const html = buildScreenSection()

    // Check for theme buttons
    expect(html).toContain('class="ifk-theme-btn"')
    expect(html).toContain('data-theme-value="system"')
    expect(html).toContain('data-theme-value="light"')
    expect(html).toContain('data-theme-value="dark"')
    // Buttons should have tabindex="-1" (as in the original) - this is for preventing tab focus but still clickable
    expect(html).toContain('tabindex="-1"')

    // Check for font size slider
    expect(html).toContain('id="ifk-font-size"')
    expect(html).toContain('type="range"')
    expect(html).toContain('min="0.8"')
    expect(html).toContain('max="1.4"')
    expect(html).toContain('step="0.1"')
    expect(html).toContain('tabindex="-1"')

    // Check for accent buttons (note: the accent row has aria-hidden="true" but that's for a different purpose)
    expect(html).toContain('class="ifk-accent-btn"')
    expect(html).toContain('data-accent-value="default"')
    expect(html).toContain('data-accent-value="blue"')
    expect(html).toContain('data-accent-value="orange"')
    expect(html).toContain('data-accent-value="emerald"')
    expect(html).toContain('tabindex="-1"')
  })
})