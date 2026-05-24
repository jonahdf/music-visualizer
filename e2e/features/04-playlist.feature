Feature: Playlist management
  The playlist controls auto-advance timing, mode (All Presets vs Favorites),
  manual navigation, and hold/resume. All settings persist across page reloads.

  Background:
    Given the app is initialized
    And the menu is open on the Playlist tab

  Scenario: Auto-advance defaults to Off
    Then the "Off" interval button should be active

  Scenario: Selecting the 15s interval activates its button
    When I click the "15s" interval button
    Then the "15s" interval button should be active
    And the "Off" interval button should not be active

  Scenario: Interval selection persists after page reload
    When I click the "30s" interval button
    And I reload the page
    And the menu is open on the Playlist tab
    Then the "30s" interval button should be active

  Scenario: Hold button is shown only when auto-advance is enabled
    Then the hold button should not be visible
    When I click the "15s" interval button
    Then the hold button should be visible
    And the hold button should display "Running"

  Scenario: Hold button pauses the auto-advance timer
    Given auto-advance is set to "15s"
    When I click the hold button
    Then the hold button should display "Held"

  Scenario: Clicking hold again resumes the auto-advance timer
    Given auto-advance is set to "15s"
    And auto-advance is held
    When I click the hold button
    Then the hold button should display "Running"

  Scenario: Playlist mode defaults to All Presets
    Then the "All Presets" mode button should be active

  Scenario: Switching to Favorites mode activates its button
    When I click the "Favorites" mode button
    Then the "Favorites" mode button should be active
    And the "All Presets" mode button should not be active

  Scenario: Playlist mode persists after page reload
    When I click the "Favorites" mode button
    And I reload the page
    And the menu is open on the Playlist tab
    Then the "Favorites" mode button should be active

  Scenario: Prev button navigates to a different preset
    Given a preset is active
    When I click the Prev button
    Then the active preset should have changed

  Scenario: Next button navigates to a different preset
    Given a preset is active
    When I click the Next button
    Then the active preset should have changed

  Scenario: Random button navigates to a different preset
    Given a preset is active
    When I click the Random button
    Then the active preset should have changed

  Scenario: Favoriting a preset adds it to the Favorites list
    Given I have favorited the first preset in the preset browser
    Then the favorites list should contain that preset

  Scenario: Unfavoriting removes the preset from the Favorites list
    Given I have favorited the first preset in the preset browser
    When I click the favorite button for that preset in the favorites list
    Then the favorites list should not contain that preset

  Scenario: Now Playing section shows the current preset name
    Then the Now Playing section should show a non-empty preset name

  Scenario: Favoriting from Now Playing row fills the heart
    When I click the heart button in the Now Playing row
    Then the Now Playing heart should appear filled
    When I click the heart button in the Now Playing row again
    Then the Now Playing heart should appear empty
