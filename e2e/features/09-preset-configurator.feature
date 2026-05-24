Feature: Preset configurator
  The Create tab in the drawer lets users build and modify presets.

  Background:
    Given the app is initialized

  Scenario: Load Current formats equation strings with line breaks after semicolons
    When I open the drawer on the Presets tab
    And I select a preset that has equations
    And I switch to the Create tab
    And I click Load Current
    And I navigate to the Code subtab
    Then the per-frame equations textarea should have line breaks after each semicolon
