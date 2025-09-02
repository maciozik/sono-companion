// Run the service worker.
if ('serviceWorker' in navigator && !ENV.DEV_MODE) {
    navigator.serviceWorker.register('js/core/service-worker.js')
        .then(registration => console.debug("Service Worker registered:", registration))
        .catch(error => console.error("Service Worker not registered:", error));
}

// Lock the portrait orientation on PWA or fullscreen mode.
if (screen.orientation) {
    screen.orientation.lock("portrait")
        .catch(error => console.warn(error.message));
}

// Disable the context menu.
if (!ENV.DEV_MODE) {
    document.addEventListener("contextmenu", event => event.preventDefault());
}

// Get the current version from GitHub tags and display it.
window.fetch(`https://api.github.com/repos/${ENV.GITHUB}/tags`)
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error ${response.status}.`);
        return response.json();
    })
    .then(tags => {
        const $version = document.querySelector('.setting[data-name=version] .setting-info');
        const $credits = document.querySelector('.app-credits .app-version');
        let version = tags?.[0]?.name?.replace(/^v/, "");

        $version.textContent = version + ENV.APP.VERSION_SUFFIX;
        $credits.textContent = "v" + version;
        ENV.APP.VERSION = version;
    })
    .catch(error => console.error(error));

// Indicate if the app is running as a PWA.
ENV.APP.PWA_MODE = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
