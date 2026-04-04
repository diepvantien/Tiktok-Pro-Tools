function triggerNativePiP(video) {
  let pipBtn = document.querySelector('[data-e2e="more-menu-popover_mini-player"]');
  if (pipBtn) {
    pipBtn.click();
    return;
  }
  // Try to open context menu on the video
  const event = new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    view: window,
    button: 2
  });
  video.dispatchEvent(event);
  
  setTimeout(() => {
    pipBtn = document.querySelector('[data-e2e="more-menu-popover_mini-player"]');
    if (pipBtn) pipBtn.click();
    // Close context menu
    document.body.click();
  }, 50);
}
