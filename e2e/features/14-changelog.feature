Feature: Changelog modal
  Users can view a "What's New" changelog by clicking the sparkle button in the bottom bar.

  Background:
    Given the app is initialized

  Scenario: Changelog button is visible in the bottom bar
    Then the changelog button should be visible

  Scenario: Clicking the changelog button opens the modal
    When I click the changelog button
    Then the changelog modal should be visible

  Scenario: The changelog modal contains release entries
    When I click the changelog button
    Then the changelog modal should contain at least one release entry

  Scenario: The changelog modal can be closed with the close button
    When I click the changelog button
    And I close the changelog modal
    Then the changelog modal should not be visible
