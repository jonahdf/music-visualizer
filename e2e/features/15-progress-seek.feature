Feature: Song progress seek
  When a library track is playing, the user can click or drag the progress
  bar in the Now Playing HUD to seek to any position in the song.
  Hovering over the bar provides a visual cue that it is interactive.

  Background:
    Given the app is initialized
    And a library track is loaded and playing

  Scenario: Progress bar is present in the Now Playing HUD
    Then the progress bar should be visible in the Now Playing HUD

  Scenario: The progress bar shows a pointer cursor
    Then the progress bar should have a pointer cursor

  Scenario: Dragging the progress bar shows the seek position visually
    When I drag the progress bar to 75 percent
    Then the progress fill should show approximately 75 percent width
