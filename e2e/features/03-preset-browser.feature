Feature: Preset browser
  Users can browse, search, select, favorite, exclude, upload, and delete presets.
  Builtin presets (~1700+) are always present; user-uploaded presets are stored in IndexedDB.

  Background:
    Given the app is initialized
    And the menu is open on the Presets tab

  Scenario: Builtin presets are loaded and visible
    Then the preset list should be visible
    And the preset list should contain more than 100 presets

  Scenario: Search filters the preset list by name
    When I type "flexi" in the search box
    Then all visible presets should contain "flexi" in their name
    And the preset list should not be empty

  Scenario: Clearing the search restores the full list
    Given I have typed "flexi" in the search box
    When I clear the search box
    Then the preset list should contain more than 100 presets

  Scenario: Search with no results shows an empty state message
    When I type "zzz_no_preset_matches_this_string" in the search box
    Then the preset list should be empty
    And I should see the no-results message

  Scenario: Clicking a preset highlights it as active
    When I click the first preset in the list
    Then the first preset should be marked active

  Scenario: Active preset name appears in the HUD after closing the menu
    When I click the first preset in the list
    And I close the menu
    Then the HUD preset name should match the preset I selected

  Scenario: Favoriting a preset fills the heart icon
    When I click the favorite button on the first preset
    Then the first preset's favorite button should appear filled

  Scenario: Unfavoriting a preset empties the heart icon
    Given the first preset is favorited
    When I click the favorite button on the first preset
    Then the first preset's favorite button should appear empty

  Scenario: Excluding a preset applies the excluded style
    When I click the exclude button on the first preset
    Then the first preset should be marked as excluded

  Scenario: Favoriting an excluded preset removes its exclusion
    Given the first preset is excluded
    When I click the favorite button on the first preset
    Then the first preset should not be marked as excluded

  Scenario: Uploading a .milk file adds it to the preset list
    When I upload the test preset file
    Then the preset list should contain a preset named "test-preset"

  Scenario: An uploaded preset shows a user badge
    When I upload the test preset file
    Then the "test-preset" preset should have a user badge

  Scenario: An uploaded preset can be removed
    Given I have uploaded the test preset file
    When I click the remove button for "test-preset"
    Then the preset list should not contain "test-preset"

  Scenario: Builtin presets do not have a remove button
    Then the first preset in the list should not have a remove button
