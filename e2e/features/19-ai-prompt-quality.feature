Feature: AI prompt quality
  The "Copy AI Prompt" button produces a comprehensive prompt that teaches
  an AI assistant how to author Butterchurn presets, including the
  Butterchurn-vs-Milkdrop JS differences and advanced pattern examples.

  Background:
    Given the app is initialized

  Scenario: AI prompt contains butterchurn-vs-milkdrop syntax warning
    When I open the drawer on the Create tab
    And I copy the AI prompt
    Then the AI prompt should mention "butterchurn" or "Butterchurn"
    And the AI prompt should mention EEL syntax differences

  Scenario: AI prompt contains advanced pattern examples
    When I open the drawer on the Create tab
    And I copy the AI prompt
    Then the AI prompt should contain a beat-detection or audio-reactive example
    And the AI prompt should contain a per-vertex or per-pixel example

  Scenario: AI prompt explains q-variable persistence
    When I open the drawer on the Create tab
    And I copy the AI prompt
    Then the AI prompt should explain q-variable accumulation across frames
