document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const FORM_VIEW_URL =
    'https://docs.google.com/forms/d/e/1FAIpQLSdKXcS-ZJsqI3zZDKX2lWY57VwTAPHm8VFN29jApeRFs53Xhw/viewform';
  const INVITE_ENTRY = 'entry.152318546';

  function buildFormUrl(token, embedded) {
    const u = new URL(FORM_VIEW_URL);
    u.searchParams.set('embedded', embedded ? 'true' : 'false');
    u.searchParams.set('usp', 'pp_url');
    u.searchParams.set(INVITE_ENTRY, (token || '').trim());
    return u.toString();
  }

  function applyToken(token) {
    const frame = document.getElementById('rsvpFrame');
    const openTab = document.getElementById('openFormTab');
    const status = document.getElementById('rsvpStatus');

    if (!frame) return;

    const embedUrl = buildFormUrl(token, true);
    const normalUrl = buildFormUrl(token, false);

    frame.src = embedUrl;
    if (openTab) openTab.href = normalUrl;

    if (status) {
      status.textContent = token
        ? 'Kod zaproszenia wykryty — formularz poniżej powinien być uzupełniony.'
        : 'Zeskanuj QR z zaproszenia, aby kod uzupełnił się automatycznie (albo wklej kod ręcznie).';
    }
  }

  const token = (
    new URLSearchParams(window.location.search).get('t') || ''
  ).trim();

  const manual = document.getElementById('manualRsvp');
  if (!token && manual) manual.style.display = 'block';

  applyToken(token);

  const applyBtn = document.getElementById('applyCode');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const val = (document.getElementById('inviteCode')?.value || '').trim();
      if (!val) return;
      applyToken(val);
    });
  }
});

function initCountdown(el) {
  const raw = el.dataset.target;
  if (!raw) return;

  const [datePart, timePart = '00:00:00'] = raw.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm, ss] = timePart.split(':').map(Number);

  const targetDate = new Date(y, m - 1, d, hh || 0, mm || 0, ss || 0);

  function update() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      el.textContent = 'Czas minął!';
      el.classList.remove('is-urgent');
      el.classList.add('is-done');
      return true;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    el.textContent = `Zostało: ${days}d ${hours}h ${minutes}m ${seconds}s`;

    if (days < 7) el.classList.add('is-urgent');
    else el.classList.remove('is-urgent');

    el.classList.remove('is-done');
    return false;
  }

  if (update()) return;
  const timerId = setInterval(() => {
    if (update()) clearInterval(timerId);
  }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.countdown').forEach(initCountdown);
});
