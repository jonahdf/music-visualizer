Feature: Keyboard shortcuts
  All documented keyboard shortcuts work as described. Shortcuts that modify state
  must not fire when the user is typing in a text input.

  Background:
    Given the app is initialized

  Scenario: P key opens the menu
    When I press "p"
    Then the menu should be open

  Scenario: P key closes an open menu
    Given the menu is open
    When I press "p"
    Then the menu should be closed

  Scenario: Escape closes an open menu
    Given the menu is open
    When I press "Escape"
    Then the menu should be closed

  Scenario: Space navigates to a random preset
    Given a preset is active
    When I press "Space"
    Then the active preset should have changed

  Scenario: Space does not navigate when typing in the search box
    Given the menu is open on the Presets tab
    When I focus the search input and press "Space"
    Then the menu should still be open
    And the search input should contain a space

  Scenario: Arrow Right advances to the next preset
    Given a preset is active
    When I press "ArrowRight"
    Then the active preset should have changed

  Scenario: Arrow Left goes to the previous preset
    Given a preset is active
    When I press "ArrowLeft"
    Then the active preset should have changed

  Scenario: R key loads a random preset
    Given a preset is active
    When I press "r"
    Then the active preset should have changed

  Scenario: H key holds auto-advance when it is running
    Given auto-advance is set to "15s"
    When I press "h"
    Then the HUD hold button should be active

  Scenario: H key resumes auto-advance when it is held
    Given auto-advance is set to "15s"
    And auto-advance is held
    When I press "h"
    Then the HUD hold button should not be active

  Scenario: M key mutes audio when a source is connected
    Given microphone is connected as the audio source
    When I press "m"
    Then the HUD mute button should be active

  Scenario: M key unmutes when audio is already muted
    Given microphone is connected as the audio source
    And audio is muted
    When I press "m"
    Then the HUD mute button should not be active

  Scenario: 1 key sets quality to Low
    When I press "1"
    Then the quality pill should show "low"

  Scenario: 2 key sets quality to Medium
    When I press "2"
    Then the quality pill should show "medium"

  Scenario: 3 key sets quality to High
    When I press "3"
    Then the quality pill should show "high"

  Scenario: 4 key sets quality to Ultra
    When I press "4"
    Then the quality pill should show "ultra"

  Scenario: Arrow keys do nothing before initialization
    Given the app is open but not yet initialized
    When I press "ArrowRight"
    Then no error toast should be visible
