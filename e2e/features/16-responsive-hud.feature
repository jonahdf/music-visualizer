Feature: Responsive HUD
  The bottom bar and now-playing HUD stay within the visible canvas area
  and are not obscured by the drawer sidebar.

  Background:
    Given the app is initialized

  Scenario: Bottom bar stays within the canvas area when the drawer is open
    When the menu is open
    Then the bottom bar left edge should align with the drawer right edge

  Scenario: Bottom bar spans full viewport when the drawer is closed
    Given the menu is open
    When I close the menu
    Then the bottom bar left edge should be at the viewport left
