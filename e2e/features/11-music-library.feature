Feature: Sample music library
  The Audio tab includes a built-in sample library with tracks users can play directly.
  When a track plays, a Now Playing HUD appears with transport controls.

  Background:
    Given the app is initialized
    And the menu is open on the Audio tab

  Scenario: Sample library section is visible in the Audio tab
    Then the sample library should be visible

  Scenario: Sample library has at least one track
    Then the sample library should have at least one track

  Scenario: Clicking a track starts it as the audio source
    When I click the first sample track
    Then the source pill should show "library"

  Scenario: Clicking a track shows the Now Playing HUD
    When I click the first sample track
    And I close the menu
    Then the now playing HUD should be visible
