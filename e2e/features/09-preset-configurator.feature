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

  Scenario: Zoom slider has a restricted range
    When I open the drawer on the Presets tab
    And I switch to the Create tab
    Then the "Zoom" slider min should be "0.9"
    And the "Zoom" slider max should be "1.1"

  Scenario: Wave Opacity slider uses a 0 to 1 scale
    When I open the drawer on the Presets tab
    And I switch to the Create tab
    And I navigate to the Wave subtab
    Then the "Wave Opacity" slider max should be "1"

  Scenario: Typing a value outside the slider range is accepted without clamping
    When I open the drawer on the Presets tab
    And I switch to the Create tab
    And I click the "Trail Length (Decay)" param value
    And I type "0.001" into the param value input and confirm
    Then the "Trail Length (Decay)" displayed value should be "0.001"

  Scenario: Slider overrides do not clobber user per-frame equations that use the same variable
    When I open the drawer on the Presets tab
    And I type "Contortion" in the search box
    And I click the first preset in the list
    And I switch to the Create tab
    And I click Load Current
    Then the combined per-frame equations should not contain static overrides for variables already in user equations

  Scenario: Create mode slider changes remain effective after loading a bundled preset
    When I open the drawer on the Presets tab
    And I select a preset that has equations
    And I switch to the Create tab
    And I click Load Current
    And I set the "Zoom" slider to its minimum value
    Then the "Zoom" displayed value should be "0.900"
