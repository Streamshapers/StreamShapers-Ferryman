export function register(config) {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('/service-worker.js')
                .then(registration => {
                    //console.log('✅ Service Worker registriert:', registration);
                    if (config?.onSuccess) config.onSuccess(registration);
                })
                .catch(error => {
                    console.error('❌ Service Worker Fehler:', error);
                });
        });
    }
}

export function unregister() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then(registration => {
                registration.unregister();
            })
            .catch(console.error);
    }
}
