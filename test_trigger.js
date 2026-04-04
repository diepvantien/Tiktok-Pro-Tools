const pipHandler = () => {
    let btn = document.querySelector('[data-e2e="more-menu-popover_mini-player"]');
    if (!btn) {
        // try right click on active video
        const v = document.querySelector('video');
        if (!v) return;
        v.dispatchEvent(new MouseEvent('contextmenu', {bubbles: true, cancelable: true, view: window, button: 2}));
        setTimeout(() => {
            btn = document.querySelector('[data-e2e="more-menu-popover_mini-player"]');
            if (btn) btn.click();
            document.body.click(); // close menu
        }, 50);
    } else {
        btn.click();
    }
}
