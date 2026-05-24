Feature: Block preset from auto-advance
  Users can block the current preset from appearing in auto-advance rotation.
  The block button lives in the bottom bar next to the favorite heart.
  Excluded presets can be managed in the Presets tab.

  Background:
    Given the app is initialized

  Scenario: Block button is present in the bottom bar
    Then the block button should be present in the bottom bar

  Scenario: Clicking the block button excludes the current preset
    When I click the block button
    Then the block button should appear active

  Scenario: Clicking the block button again unblocks the preset
    Given the current preset is blocked
    When I click the block button
    Then the block button should not appear active

  Scenario: Excluded presets are marked in the Presets tab
    Given the current preset is blocked
    When the menu is open on the Presets tab
    Then the active preset should be marked as excluded in the list
