Feature: Keyboard shortcut guide overlay
  The key guide overlay displays all keyboard shortcuts.
  It can be opened and closed without affecting the visualizer.

  Background:
    Given the app is initialized

  Scenario: Question mark key opens the key guide
    When I press "?"
    Then the key guide should be visible

  Scenario: Question mark key closes the key guide
    Given the key guide is open
    When I press "?"
    Then the key guide should not be visible

  Scenario: Escape closes the key guide
    Given the key guide is open
    When I press "Escape"
    Then the key guide should not be visible

  Scenario: The close button dismisses the key guide
    Given the key guide is open
    When I click the key guide close button
    Then the key guide should not be visible

  Scenario: Key guide lists the arrow key shortcuts
    Given the key guide is open
    Then the key guide should mention "← →"

  Scenario: Key guide stays visible while showing
    Given the key guide is open
    When mouse activity stops for 3.5 seconds
    Then the key guide should be visible
