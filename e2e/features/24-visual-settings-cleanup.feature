Feature: Visual settings cleanup — remove non-functional sliders
  The Visual subtab in the Graphics panel previously showed waveform, reactivity,
  and particle sliders that had no effect on the Butterchurn renderer. These
  settings have no backing API and must be removed. Only the preset transition
  (blend time) controls, which do work, remain in the Visual subtab.

  Background:
    Given the app is initialized
    And the menu is open on the Settings tab

  Scenario: Visual subtab does not contain waveform intensity slider
    When I click the "Visual" subtab
    Then the "Waveform Intensity" slider should not be visible

  Scenario: Visual subtab does not contain waveform scale slider
    When I click the "Visual" subtab
    Then the "Waveform Scale" slider should not be visible

  Scenario: Visual subtab does not contain reactivity response speed slider
    When I click the "Visual" subtab
    Then the "Response Speed" slider should not be visible

  Scenario: Visual subtab does not contain reactivity decay speed slider
    When I click the "Visual" subtab
    Then the "Decay Speed" slider should not be visible

  Scenario: Visual subtab does not contain bass boost slider
    When I click the "Visual" subtab
    Then the "Bass Boost" slider should not be visible

  Scenario: Visual subtab does not contain particle life slider
    When I click the "Visual" subtab
    Then the "Particle Life" slider should not be visible

  Scenario: Visual subtab does not contain particle emission slider
    When I click the "Visual" subtab
    Then the "Particle Emission" slider should not be visible

  Scenario: Visual subtab still shows preset transition controls
    When I click the "Visual" subtab
    Then blend time buttons should be visible
