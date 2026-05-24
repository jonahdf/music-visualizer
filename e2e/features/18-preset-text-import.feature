Feature: Preset text import
  The Create tab import panel accepts both full butterchurn preset JSON
  and AI diff JSON, and gives live feedback on which format was detected.

  Background:
    Given the app is initialized

  Scenario: Hint text invites both full preset and AI diff JSON
    When I open the drawer on the Presets tab
    And I switch to the Create tab
    And I open the import panel
    Then the import hint should mention "full preset"
    And the import hint should mention "AI"

  Scenario: Pasting a full butterchurn JSON shows "Full preset detected"
    When I open the drawer on the Presets tab
    And I switch to the Create tab
    And I open the import panel
    And I paste a full butterchurn preset JSON into the import textarea
    Then the import panel should show "Full preset detected"
    And the "Replace entirely" checkbox should not be visible

  Scenario: Pasting an AI diff JSON shows recognized parameter count
    When I open the drawer on the Presets tab
    And I switch to the Create tab
    And I open the import panel
    And I paste an AI diff JSON with zoom into the import textarea
    Then the import panel should show "1 parameter"
    And the "Replace entirely" checkbox should be visible

  Scenario: Applying a full butterchurn JSON loads the preset into the editor
    When I open the drawer on the Presets tab
    And I switch to the Create tab
    And I open the import panel
    And I paste a full butterchurn preset JSON with zoom 1.09 into the import textarea
    And I click Apply in the import panel
    Then the "Zoom" displayed value should be "1.090"

  Scenario: Applying an AI diff JSON updates only the specified parameters
    When I open the drawer on the Presets tab
    And I switch to the Create tab
    And I open the import panel
    And I paste an AI diff JSON with zoom 1.07 into the import textarea
    And I click Apply in the import panel
    Then the "Zoom" displayed value should be "1.070"
