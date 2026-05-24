Feature: GitHub issues link in settings
  A link to the GitHub issues page should be accessible from the Settings tab,
  allowing users to report bugs or request features without cluttering the HUD.

  Background:
    Given the app is initialized
    And the menu is open on the Settings tab

  Scenario: GitHub issues link is visible in the Settings tab
    Then the GitHub issues link should be visible

  Scenario: GitHub issues link points to the correct URL
    Then the GitHub issues link should have the correct href
