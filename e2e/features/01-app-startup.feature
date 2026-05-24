Feature: App startup
  The start overlay gates AudioContext and renderer initialization.
  Users must explicitly click before audio processing begins — this is a
  browser requirement (autoplay policy) and a deliberate UX decision.

  Background:
    Given the app is open

  Scenario: Start overlay is shown before any interaction
    Then the start overlay should be visible
    And the visualizer canvas should be present

  Scenario: HUD is hidden before initialization
    Then the HUD fps counter should not be visible

  Scenario: Clicking the start overlay initializes the app
    When I click the start overlay
    Then the start overlay should disappear
    And the HUD should be visible
    And the HUD fps counter should be visible

  Scenario: Clicking the canvas also initializes the app
    When I click the visualizer canvas
    Then the start overlay should disappear

  Scenario: Clicking the menu toggle button also initializes the app
    When I click the menu toggle button
    Then the start overlay should disappear
    And the menu should be open

  Scenario: Preset name is shown in HUD after initialization
    When I click the start overlay
    Then the HUD preset name should be visible and non-empty
