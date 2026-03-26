// PWA INSTALL LOGIC
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

if (installBtn) installBtn.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  if (installBtn) installBtn.style.display = 'block';
});

installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;

  if (choice.outcome === 'accepted') {
    console.log('App installed');
  }

  deferredPrompt = null;
  installBtn.style.display = 'none';
});

window.addEventListener('appinstalled', () => {
  console.log('PWA installed');
});