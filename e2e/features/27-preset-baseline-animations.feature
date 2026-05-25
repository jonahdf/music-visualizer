Feature: Preset baseline reset and animation controls
  The Create tab provides a Baseline reset to strip all effects,
  initial animations visible in the Animate tab, and a toggle to pause animations.

  Background:
    Given the app is initialized

  Scenario: Default Create preset shows Zoom animated in the Animate tab
    When I open the drawer on the Presets tab
    And I switch to the Create tab
    And I navigate to the Animate subtab
    Then the "Zoom" animation row should be active

  Scenario: Default Create preset shows Warp animated in the Animate tab
    When I open the drawer on the Presets tab
    And I switch to the Create tab
    And I navigate to the Animate subtab
    Then the "Warp Amount" animation row should be active

  Scenario: Baseline button is present in the configurator toolbar
    When I open the drawer on the Presets tab
    And I switch to the Create tab
    Then the configurator "Baseline" button should be visible

  Scenario: Clicking Baseline removes all active animations
    When I open the drawer on the Presets tab
    And I switch to the Create tab
    And I navigate to the Animate subtab
    And I click the configurator "Baseline" button
    Then no animation rows should be active

  Scenario: Animate tab has an animations on/off toggle
    When I open the drawer on the Presets tab
    And I switch to the Create tab
    And I navigate to the Animate subtab
    Then the animations enabled toggle should be visible

  Scenario: Animations toggle can be turned off
    When I open the drawer on the Presets tab
    And I switch to the Create tab
    And I navigate to the Animate subtab
    And I click the animations enabled toggle
    Then the animations enabled toggle should show as off
