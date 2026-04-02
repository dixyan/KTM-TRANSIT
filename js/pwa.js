if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = '/sw.js';

    navigator.serviceWorker.register(swPath)
      .then(reg => {
        console.log(`SW registered (scope: ${reg.scope})`);

        if (reg.waiting) showUpdateBanner(reg.waiting);

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateBanner(newWorker);
            }
          });
        });
      })
      .catch(err => console.warn('SW registration failed:', err));

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) { refreshing = true; window.location.reload(); }
    });
  });
}

function showUpdateBanner(worker) {
  if (document.getElementById('pwa-update-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'pwa-update-banner';
  banner.innerHTML = `
    <span>🔄 A new version of KTM Transit is available.</span>
    <button id="pwa-update-btn">Update now</button>
    <button id="pwa-dismiss-btn">Later</button>
  `;
  banner.style.cssText = `
    position:fixed;bottom:0;left:0;right:0;z-index:99999;
    background:#1e293b;border-top:1px solid rgba(56,189,248,0.3);
    color:#f1f5f9;font-family:'Sora',sans-serif;font-size:13px;
    display:flex;align-items:center;justify-content:center;gap:12px;
    padding:12px 16px;box-shadow:0 -4px 24px rgba(0,0,0,0.4);
  `;
  document.body.appendChild(banner);

  const styleBtn = (el, primary) => {
    el.style.cssText = `
      padding:7px 16px;border-radius:8px;border:none;cursor:pointer;
      font-family:'Sora',sans-serif;font-size:12px;font-weight:600;
      background:${primary ? '#38bdf8' : 'transparent'};
      color:${primary ? '#0f172a' : '#64748b'};
    `;
  };
  styleBtn(document.getElementById('pwa-update-btn'),   true);
  styleBtn(document.getElementById('pwa-dismiss-btn'), false);

  document.getElementById('pwa-update-btn').addEventListener('click', () => {
    worker.postMessage({ type: 'SKIP_WAITING' });
    banner.remove();
  });
  document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
    banner.remove();
  });
}

let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  showInstallButton();
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  hideInstallButton();
  console.log('KTM Transit installed as PWA');
});

function showInstallButton() {
  if (!document.getElementById('map')) return;
  if (document.getElementById('pwa-install-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'pwa-install-btn';
  btn.title = 'Install KTM Transit app';
  btn.innerHTML = `
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" style="flex-shrink:0">
      <path d="M12 2v13M7 11l5 5 5-5M2 17v2a2 2 0 002 2h16a2 2 0 002-2v-2"/>
    </svg>
    Install app
  `;
  btn.style.cssText = `
    position:fixed;bottom:80px;right:16px;z-index:1000;
    background:#1e293b;border:1px solid rgba(56,189,248,0.3);
    color:#38bdf8;font-family:'Sora',sans-serif;font-size:12px;font-weight:600;
    padding:9px 14px;border-radius:12px;cursor:pointer;
    display:flex;align-items:center;gap:7px;
    box-shadow:0 4px 20px rgba(0,0,0,0.4);
    transition:background 0.2s;
  `;
  btn.addEventListener('mouseenter', () => { btn.style.background = '#273449'; });
  btn.addEventListener('mouseleave', () => { btn.style.background = '#1e293b'; });
  btn.addEventListener('click', triggerInstall);
  document.body.appendChild(btn);
}

function hideInstallButton() {
  document.getElementById('pwa-install-btn')?.remove();
}

async function triggerInstall() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  console.log(`Install prompt outcome: ${outcome}`);
  deferredInstallPrompt = null;
  hideInstallButton();
}

function updateOnlineStatus() {
  const online = navigator.onLine;
  let indicator = document.getElementById('pwa-offline-indicator');

  if (!online) {
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'pwa-offline-indicator';
      indicator.textContent = '⚡ Offline — showing cached data';
      indicator.style.cssText = `
        position:fixed;top:0;left:0;right:0;z-index:99998;
        background:#fbbf24;color:#0f172a;
        text-align:center;font-size:12px;font-weight:600;
        font-family:'Sora',sans-serif;padding:6px;
      `;
      document.body.appendChild(indicator);
    }
  } else {
    indicator?.remove();
  }
}

window.addEventListener('online',  updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus(); 