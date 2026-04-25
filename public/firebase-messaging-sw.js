importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

self.addEventListener('install', (event) => {
    console.log('FCM Service Worker Installed');
});

self.addEventListener('activate', (event) => {
    console.log('FCM Service Worker Activated');
});

// We expect the firebase config to be passed in the URL when registering the SW
// e.g. /firebase-messaging-sw.js?firebaseConfig={...}
const url = new URL(location);
const firebaseConfigStr = url.searchParams.get('firebaseConfig');

if (firebaseConfigStr) {
    try {
        const firebaseConfig = JSON.parse(decodeURIComponent(firebaseConfigStr));
        firebase.initializeApp(firebaseConfig);
        const messaging = firebase.messaging();
        
        messaging.onBackgroundMessage((payload) => {
            console.log('[firebase-messaging-sw.js] Received background message ', payload);
            
            const notificationTitle = payload.notification?.title || 'New Notification';
            const notificationOptions = {
                body: payload.notification?.body,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                data: payload.data
            };
        
            self.registration.showNotification(notificationTitle, notificationOptions);
        });
    } catch (err) {
        console.error('Failed to initialize Firebase in service worker', err);
    }
} else {
    console.warn('No firebaseConfig query param provided to service worker');
}
