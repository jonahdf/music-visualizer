Feature: Error handling
  Permission denials and unsupported browser features are surfaced as dismissible
  error toasts. The app remains functional after an error is dismissed.

  Scenario: Mic permission denial shows a dismissible error toast
    Given the app is initialized
    And microphone permission will be denied
    And the menu is open on the Audio tab
    When I click the "Microphone" source card
    Then an error toast should be visible
    And the error toast should mention "permission" or "denied"

  Scenario: Error toast is dismissed by clicking it
    Given the app is initialized
    And microphone permission will be denied
    And the menu is open on the Audio tab
    When I click the "Microphone" source card
    And I click the error toast
    Then no error toast should be visible

  Scenario: Tab Audio with no audio tracks shows a helpful error
    Given the app is initialized
    And getDisplayMedia returns no audio tracks
    And the menu is open on the Audio tab
    When I click the "Tab Audio" source card
    Then an error toast should be visible
    And the error toast should mention "audio"

  Scenario: App remains usable after dismissing a mic error
    Given the app is initialized
    And microphone permission will be denied
    And the menu is open on the Audio tab
    When I click the "Microphone" source card
    And I click the error toast
    Then no error toast should be visible
    And the menu toggle button should be visible and clickable
    And I should be able to open the menu again
