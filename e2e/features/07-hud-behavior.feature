Feature: HUD behavior
  The heads-up display auto-hides after 3 seconds of mouse inactivity and
  reappears when the user moves the mouse. It stays visible while the menu is open.
  Contextual elements (mute, hold) appear only when relevant.

  Background:
    Given the app is initialized

  Scenario: HUD is visible immediately after initialization
    Then the HUD should be visible

  Scenario: HUD hides after 3 seconds of mouse inactivity
    When mouse activity stops for 3.5 seconds
    Then the HUD should be hidden

  Scenario: Moving the mouse makes the HUD reappear
    Given the HUD is hidden due to inactivity
    When I move the mouse
    Then the HUD should be visible

  Scenario: HUD stays visible while the menu is open
    Given the menu is open
    When mouse activity stops for 3.5 seconds
    Then the HUD should be visible

  Scenario: Mute button is absent before any audio source is connected
    Then the HUD mute button should not be present

  Scenario: Mute button appears once an audio source is connected
    When I connect microphone as the audio source
    Then the HUD mute button should be present

  Scenario: Hold button is absent before auto-advance is enabled
    Then the HUD hold button should not be present

  Scenario: Hold button appears when auto-advance is enabled
    When I enable auto-advance at "15s"
    Then the HUD hold button should be present

  Scenario: HUD displays the current preset name
    Then the HUD preset name should be visible and non-empty

  Scenario: Favoriting from the HUD fills the heart
    When I click the HUD heart button
    Then the HUD heart button should appear filled

  Scenario: Unfavoriting from the HUD empties the heart
    Given the current preset is favorited from the HUD
    When I click the HUD heart button
    Then the HUD heart button should appear empty
