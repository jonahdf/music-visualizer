Feature: Create mode: slider overrides and preset loading fixes

  Sliders in the Create tab must not inject per-frame overrides for variables
  that are already present in the user's per-frame equations, and the editor
  must remain functional after loading a preset via "Load Current".

  Background:
    Given the app is initialized

  Scenario: Adjusting a slider after Load Current is reflected in the editor
    When I open the drawer on the Presets tab
    And I select a preset that has equations
    And I switch to the Create tab
    And I click Load Current
    And I navigate to the Motion subtab
    And I move the Zoom slider to "1.050"
    Then the "Zoom" displayed value should be "1.050"
    And no error toast should be visible

  Scenario: Slider override is not injected for variables already in user equations
    When I open the drawer on the Presets tab
    And I switch to the Create tab
    And I navigate to the Code subtab
    And I enter per-frame equations "a.zoom = a.zoom + 0.001;"
    And I navigate to the Motion subtab
    And I move the Zoom slider to "1.050"
    Then the combined frame equations should not have a static "zoom" override

  Scenario: Importing a butterchurn preset preserves equations using a.q variables
    When I open the drawer on the Presets tab
    And I switch to the Create tab
    And I open the import panel
    And I paste a butterchurn preset JSON with a.q1 frame equations into the import textarea
    And I click Apply in the import panel
    And I navigate to the Code subtab
    Then the per-frame equations should contain "a.q1"
    And the per-frame equations should not contain "a.a.q1"
