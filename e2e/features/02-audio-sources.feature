Feature: Audio sources
  Users can connect audio from a microphone, a browser tab, or a local audio file.
  Each source type has different browser support and permission requirements.

  Scenario: All three source cards are displayed
    Given the app is initialized
    And the menu is open on the Audio tab
    Then I should see a source card for "Microphone"
    And I should see a source card for "Tab Audio"
    And I should see a source card for "Audio File"

  Scenario: Microphone card is enabled in Chromium
    Given the app is initialized
    And the menu is open on the Audio tab
    Then the "Microphone" source card should not be disabled

  Scenario: Tab Audio card is enabled in Chromium
    Given the app is initialized
    And the menu is open on the Audio tab
    Then the "Tab Audio" source card should not be disabled

  Scenario: Connecting microphone marks it as the active source
    Given the app is initialized
    And the menu is open on the Audio tab
    When I click the "Microphone" source card
    Then the "Microphone" source card should be active
    And the HUD source label should show "mic"

  Scenario: Connecting tab audio marks it as the active source
    Given the app is initialized
    And the menu is open on the Audio tab
    When I click the "Tab Audio" source card
    Then the "Tab Audio" source card should be active
    And the HUD source label should show "tab"

  Scenario: Connecting an audio file marks it as the active source
    Given the app is initialized
    And the menu is open on the Audio tab
    When I upload the test audio file
    Then the HUD source label should show "file"

  Scenario: Switching from mic to file updates the active source
    Given the app is initialized
    And the menu is open on the Audio tab
    When I click the "Microphone" source card
    And I upload the test audio file
    Then the HUD source label should show "file"
    And the "Microphone" source card should not be active

  Scenario: Tab Audio card is disabled when running as Firefox
    Given the page is running as Firefox
    Then the "Tab Audio" source card should be disabled on Firefox
    And the "Tab Audio" source card should show a Firefox badge on Firefox
