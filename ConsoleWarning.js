(function() {
    const message = `
        STOP!

        This is a browser feature intended for developers. If someone told you to copy and paste something here to enable a feature or "hack" someone's account, it is a scam and will give them access to your account.
    `;

    document.addEventListener('paste', (event) => {
        if (!sessionStorage.getItem('consolePasteWarningDisplayed')) {
            alert(message);
            sessionStorage.setItem('consolePasteWarningDisplayed', 'true');
        }
    });
})();
