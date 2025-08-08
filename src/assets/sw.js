// Service Worker pour les notifications push
const CACHE_NAME = 'blog-collaboratif-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

const STATIC_FILES = [
  '/',
  '/index.html',
  '/assets/icons/icon-192x192.svg',
  '/assets/icons/icon-512x512.svg'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installation...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Cache statique ouvert');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker installé avec succès');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Erreur lors de l\'installation du Service Worker:', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activation...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Suppression de l\'ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activé');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('❌ Erreur lors de l\'activation du Service Worker:', error);
      })
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Gestion des requêtes d'API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Mise en cache des réponses d'API réussies
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Retourner la réponse en cache si la requête réseau échoue
          return caches.match(request);
        })
    );
    return;
  }

  // Gestion des ressources statiques
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(request)
          .then((response) => {
            // Mise en cache des ressources statiques
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return response;
          });
      })
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('📨 Service Worker: Notification push reçue');
  
  let notificationData = {
    title: 'Nouvelle notification',
    body: 'Vous avez reçu une nouvelle notification',
    icon: '/assets/icons/icon-192x192.svg',
    badge: '/assets/icons/icon-192x192.svg',
    tag: 'blog-notification',
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  // Récupérer les données de la notification
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData
      };
    } catch (error) {
      console.error('❌ Erreur lors du parsing des données de notification:', error);
    }
  }

  // Afficher la notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Ouvrir',
          icon: '/assets/icons/icon-192x192.svg'
        },
        {
          action: 'close',
          title: 'Fermer'
        }
      ]
    })
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Service Worker: Clic sur notification');
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Ouvrir l'application
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then((clients) => {
        // Si une fenêtre est déjà ouverte, la focaliser
        for (const client of clients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Sinon, ouvrir une nouvelle fenêtre
        if (self.clients.openWindow) {
          const url = event.notification.data?.url || '/';
          return self.clients.openWindow(url);
        }
      })
  );
});

// Gestion de la fermeture des notifications
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Service Worker: Notification fermée');
  
  // Ici vous pouvez envoyer des analytics ou d'autres données
  const notificationData = {
    type: 'notification_closed',
    notificationId: event.notification.tag,
    timestamp: Date.now()
  };
  
  // Envoyer les données au serveur si nécessaire
  // self.registration.pushManager.getSubscription()
  //   .then(subscription => {
  //     if (subscription) {
  //       return fetch('/api/notifications/analytics', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify(notificationData)
  //       });
  //     }
  //   });
});

// Gestion des messages du client
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker: Message reçu:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Gestion des erreurs
self.addEventListener('error', (event) => {
  console.error('❌ Service Worker: Erreur:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Service Worker: Promesse rejetée:', event.reason);
}); 