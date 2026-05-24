Feature: Quality and graphics settings
  Four quality presets provide quick-select configurations.
  Individual sliders allow fine-grained control. All settings persist across reloads.

  Background:
    Given the app is initialized
    And the menu is open on the Settings tab

  Scenario: Default quality level is Medium
    Then the "Medium" quality button should be active

  Scenario: Selecting Low quality activates that button
    When I click the "Low" quality button
    Then the "Low" quality button should be active
    And the "Medium" quality button should not be active

  Scenario: Selecting High quality activates that button
    When I click the "High" quality button
    Then the "High" quality button should be active

  Scenario: Quality selection persists after page reload
    When I click the "High" quality button
    And I reload the page
    And the menu is open on the Settings tab
    Then the "High" quality button should be active

  Scenario: The Performance subtab is shown by default
    Then the Performance subtab content should be visible

  Scenario: FPS display is visible in the Performance subtab
    Then the FPS display should be visible

  Scenario: Clicking the Visual subtab shows visual settings
    When I click the "Visual" subtab
    Then the Visual subtab content should be visible

  Scenario: Blend time buttons are present in the Visual subtab
    When I click the "Visual" subtab
    Then blend time buttons should be visible

  Scenario: Default blend time is 2.7s
    When I click the "Visual" subtab
    Then the "2.7s" blend time button should be active

  Scenario: Selecting a different blend time activates its button
    When I click the "Visual" subtab
    And I click the "Instant" blend time button
    Then the "Instant" blend time button should be active
    And the "2.7s" blend time button should not be active

  Scenario: Blend time selection persists after page reload
    When I click the "Visual" subtab
    And I click the "Instant" blend time button
    And I reload the page
    And the menu is open on the Settings tab
    And I click the "Visual" subtab
    Then the "Instant" blend time button should be active

  Scenario: Individual settings are accessible in the Performance subtab
    Then the Resolution Scale slider should be visible

  Scenario: Clicking a description toggle reveals setting details
    When I click the description toggle for "Resolution Scale"
    Then the description for "Resolution Scale" should be visible
