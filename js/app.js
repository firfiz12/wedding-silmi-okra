/**
 * SILMI & OKRA WEDDING INVITATION - JAVASCRIPT
 * Audio controller, dynamic particles generator, guest personalization,
 * live countdown, Google Calendar export, clipboard copy, refined RSVP & wishes feed
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 0. BACKEND CONFIGURATION (Google Apps Script Web App URL)
  //    After deploying appscript.gs, paste its Web App URL here.
  //    Leave empty to fall back to local-only wishes.
  // =========================================================================
  const RSVP_API_URL = "https://script.google.com/macros/s/AKfycbz9l4Fm1sjz8jmLpAr6PGbp6XonRhBYApuha3denNCsGZ3U9zuFrb710g9rxUT3DA0WKg/exec";

  function apiConfigured() {
    return typeof RSVP_API_URL === 'string' && RSVP_API_URL.trim() !== '';
  }

  async function fetchFromApi(fallback) {
    if (!apiConfigured()) return fallback();
    try {
      const res = await fetch(RSVP_API_URL);
      if (!res.ok) throw new Error('bad status');
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.wishes)) {
        return data.wishes;
      }
      return fallback();
    } catch (err) {
      return fallback();
    }
  }

  // =========================================================================
  // 1. Dynamic Floating Romantic Hearts & Sparkles Particles Generator
  // =========================================================================
  const particlesContainer = document.getElementById('particlesContainer');
  if (particlesContainer) {
    const particleIcons = ['❤️', '✨', '🌸', '💖', '🕊️', '💫'];
    const totalParticles = 14;

    for (let i = 0; i < totalParticles; i++) {
      const p = document.createElement('div');
      p.className = 'floating-particle';
      p.textContent = particleIcons[Math.floor(Math.random() * particleIcons.length)];

      const leftPos = Math.random() * 100;
      const duration = 9 + Math.random() * 8; // 9s to 17s
      const delay = Math.random() * 10;
      const size = 0.8 + Math.random() * 0.7; // 0.8rem to 1.5rem

      p.style.left = `${leftPos}%`;
      p.style.animationDuration = `${duration}s`;
      p.style.animationDelay = `${delay}s`;
      p.style.fontSize = `${size}rem`;

      particlesContainer.appendChild(p);
    }
  }

  // =========================================================================
  // 2. Dynamic Guest Name Personalization from URL
  // Supports: ?to=Nama+Tamu or ?u=Nama or ?guest=Nama
  // =========================================================================
  const urlParams = new URLSearchParams(window.location.search);
  const guestParam = urlParams.get('to') || urlParams.get('u') || urlParams.get('guest') || urlParams.get('nama');

  const guestNameEl = document.getElementById('guestName');
  const rsvpNameInput = document.getElementById('rsvpName');

  if (guestParam) {
    const cleanName = decodeURIComponent(guestParam.replace(/\+/g, ' ')).trim();
    if (cleanName) {
      if (guestNameEl) guestNameEl.textContent = cleanName;
      if (rsvpNameInput) rsvpNameInput.value = cleanName;
    }
  } else {
    if (guestNameEl) guestNameEl.textContent = 'Tamu Undangan';
  }

  // =========================================================================
  // 3. Background Audio Controller
  // =========================================================================
  const bgAudio = document.getElementById('bgAudio');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  let isMusicPlaying = false;

  function playMusic() {
    if (!bgAudio) return;
    bgAudio.play().then(() => {
      isMusicPlaying = true;
      if (musicToggleBtn) musicToggleBtn.classList.add('playing');
    }).catch(err => {
      console.log('Audio autoplay prevented:', err);
    });
  }

  function pauseMusic() {
    if (!bgAudio) return;
    bgAudio.pause();
    isMusicPlaying = false;
    if (musicToggleBtn) musicToggleBtn.classList.remove('playing');
  }

  function toggleMusic() {
    if (isMusicPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', toggleMusic);
  }

  // =========================================================================
  // 4. Open Invitation Button Hotspot + Smart Auto-Hide Bottom Nav
  // =========================================================================
  const openInvBtn = document.getElementById('openInvitationBtn');
  const bottomNav = document.getElementById('bottomNav');
  const profileSection = document.getElementById('profile');

  // === Smart Auto-Hide Navigation Logic ===
  // Nav appears on activity, hides 3s after last interaction
  let navHideTimer = null;
  let navUnlocked = false; // stays false until cover is passed

  function showNav() {
    if (!bottomNav || !navUnlocked) return;
    bottomNav.classList.add('visible');
    clearTimeout(navHideTimer);
    navHideTimer = setTimeout(hideNav, 3000);
  }

  function hideNav() {
    if (!bottomNav) return;
    bottomNav.classList.remove('visible');
  }

  // Unlock nav (first time only) when user scrolls past cover
  function unlockNav() {
    if (navUnlocked) return;
    navUnlocked = true;
    showNav();
  }

  // Listen for any user interaction to show nav
  ['scroll', 'touchstart', 'touchmove', 'mousedown', 'keydown'].forEach(evt => {
    window.addEventListener(evt, () => {
      if (window.pageYOffset > 150) unlockNav();
      if (navUnlocked) showNav();
    }, { passive: true });
  });

  // Also show when clicking any nav item itself
  if (bottomNav) {
    bottomNav.addEventListener('mouseenter', () => {
      clearTimeout(navHideTimer); // prevent hiding while hovering
    });
    bottomNav.addEventListener('mouseleave', () => {
      navHideTimer = setTimeout(hideNav, 2000);
    });
    bottomNav.addEventListener('touchstart', () => {
      clearTimeout(navHideTimer);
      navHideTimer = setTimeout(hideNav, 3000);
    }, { passive: true });
  }

  if (openInvBtn) {
    openInvBtn.addEventListener('click', () => {
      playMusic();
      navUnlocked = true;

      // Smooth scroll to profile section
      if (profileSection) {
        profileSection.scrollIntoView({ behavior: 'smooth' });
      }

      // Show nav briefly then let auto-hide take over
      setTimeout(showNav, 600);
    });
  }

  // =========================================================================
  // 5. Live Real-Time Countdown Timer (Target: 11 October 2026, 09:00:00 WIB)
  // =========================================================================
  const weddingDate = new Date('2026-10-11T09:00:00+07:00').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    const daysEl = document.getElementById('countDays');
    const hoursEl = document.getElementById('countHours');
    const minsEl = document.getElementById('countMinutes');
    const secsEl = document.getElementById('countSeconds');

    if (distance < 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      if (secsEl) secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');

    if (daysEl) daysEl.textContent = pad(days);
    if (hoursEl) hoursEl.textContent = pad(hours);
    if (minsEl) minsEl.textContent = pad(minutes);
    if (secsEl) secsEl.textContent = pad(seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // =========================================================================
  // 6. Add to Google Calendar Action
  // =========================================================================
  const btnAddToCalendar = document.getElementById('btnAddToCalendar');
  if (btnAddToCalendar) {
    btnAddToCalendar.addEventListener('click', (e) => {
      e.preventDefault();
      const title = encodeURIComponent('The Wedding of Silmi & Okra (#berhaSILdiOKtober)');
      const details = encodeURIComponent('Akad Nikah: 09.00 - 10.00 WIB | Resepsi: 11.00 - 13.30 WIB.\nLokasi: Kampung Makan Joglo, Jakarta Barat.');
      const location = encodeURIComponent('Kampung Makan Joglo, Jl. Joglo Raya No.21, Kembangan, Jakarta Barat');
      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20261011T020000Z/20261011T063000Z&details=${details}&location=${location}`;
      window.open(gcalUrl, '_blank');
    });
  }

  // =========================================================================
  // 7. Toast Notification Helper
  // =========================================================================
  const toastEl = document.getElementById('toast');
  let toastTimeout;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3200);
  }

  // =========================================================================
  // 8. Copy to Clipboard Hotspots (BCA & BSI)
  // =========================================================================
  document.querySelectorAll('.copy-hotspot').forEach(btn => {
    btn.addEventListener('click', () => {
      const bank = btn.getAttribute('data-bank') || 'Bank';
      const account = btn.getAttribute('data-account') || '';
      const acName = btn.getAttribute('data-name') || '';

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(account).then(() => {
          showToast(`✓ No. Rekening ${bank} (${account}${acName ? ' a.n. ' + acName : ''}) disalin!`);
        }).catch(() => fallbackCopy(account, bank, acName));
      } else {
        fallbackCopy(account, bank, acName);
      }
    });
  });

  function fallbackCopy(text, bank, acName) {
    const input = document.createElement('input');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.position = 'absolute';
    input.style.left = '-9999px';
    document.body.appendChild(input);
    input.select();
    input.setSelectionRange(0, 99999); // for iOS
    try {
      document.execCommand('copy');
      showToast(`✓ No. Rekening ${bank} (${text}${acName ? ' a.n. ' + acName : ''}) disalin!`);
    } catch (err) {
      showToast(`No. Rekening ${bank}: ${text}`);
    }
    document.body.removeChild(input);
  }

  // =========================================================================
  // 9. Refined RSVP Attendance Selection & Form Handling
  // =========================================================================
  let selectedStatus = 'Hadir';
  const pillHadir = document.getElementById('pillHadir');
  const pillTidak = document.getElementById('pillTidak');
  const rsvpPills = document.querySelectorAll('.rsvp-pill');

  rsvpPills.forEach(pill => {
    pill.addEventListener('click', () => {
      rsvpPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedStatus = pill.getAttribute('data-status') || 'Hadir';
    });
  });

  const DEFAULT_WISHES = [
    {
      name: 'Nadia & Keluarga',
      status: 'Hadir',
      message: 'MasyaAllah barakallahu lakuma Silmi & Okra! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah selamanya.',
      time: '1 jam yang lalu'
    },
    {
      name: 'Dimas Prasetyo',
      status: 'Hadir',
      message: 'Congrats bro Okra & Silmi! Finally the day has come #berhaSILdiOKtober. Lancar-lancar sampai hari H!',
      time: '3 jam yang lalu'
    },
    {
      name: 'Aulia Rahma',
      status: 'Hadir',
      message: 'Terharu banget lihat love story kalian dari awal. Happy wedding Silmi cantik & Okra!',
      time: '5 jam yang lalu'
    }
  ];

  function getWishes() {
    const stored = localStorage.getItem('silmi_okra_wedding_wishes');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return DEFAULT_WISHES;
      }
    }
    return DEFAULT_WISHES;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderWishes() {
    const wishesList = document.getElementById('wishesList');
    if (!wishesList) return;

    const wishes = getWishes();
    wishesList.innerHTML = '';

    if (!wishes || wishes.length === 0) {
      wishesList.innerHTML = '<div class="wish-item"><div class="wish-msg" style="text-align:center;color:#6B494D;">Belum ada ucapan. Jadilah yang pertama!</div></div>';
      return;
    }

    wishes.forEach(item => {
      const isAttending = item.status === 'Hadir';
      const card = document.createElement('div');
      card.className = 'wish-item';
      card.innerHTML = `
        <div class="wish-header">
          <span class="wish-name">${escapeHtml(item.name)}</span>
          <span class="wish-status ${isAttending ? 'hadir' : 'tidak'}">
            ${isAttending ? '✓ Hadir' : '✕ Berhalangan'}
          </span>
        </div>
        <div class="wish-msg">${escapeHtml(item.message)}</div>
        <div class="wish-time">${escapeHtml(item.time || 'Baru saja')}</div>
      `;
      wishesList.appendChild(card);
    });
  }

  renderWishes();

  // If backend configured, override with live server data
  if (apiConfigured()) {
    fetchFromApi(() => getWishes()).then(serverWishes => {
      if (serverWishes && serverWishes.length > 0) {
        localStorage.setItem('silmi_okra_wedding_wishes', JSON.stringify(serverWishes));
        renderWishes();
      }
    });
  }


  const rsvpForm = document.getElementById('rsvpForm');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (document.getElementById('rsvpName').value || '').trim();
      const message = (document.getElementById('rsvpMessage').value || '').trim();

      if (!name) {
        showToast('Silakan masukkan nama Anda!');
        return;
      }
      if (!message) {
        showToast('Silakan tulis doa atau ucapan Anda!');
        return;
      }

      const newWish = {
        name: name,
        status: selectedStatus,
        message: message,
        time: 'Baru saja'
      };

      // Disable submit button while sending
      const submitBtn = document.getElementById('btnRsvpSubmit');
      if (submitBtn) submitBtn.disabled = true;

      const finalize = (wishToAdd, successMessage) => {
        const wishes = getWishes();
        wishes.unshift(wishToAdd);
        localStorage.setItem('silmi_okra_wedding_wishes', JSON.stringify(wishes));

        renderWishes();
        document.getElementById('rsvpMessage').value = '';
        showToast(successMessage);

        if (submitBtn) submitBtn.disabled = false;

        // Smooth scroll slightly down to show the new wish
        const wishesTitle = document.querySelector('.wishes-title');
        if (wishesTitle) {
          wishesTitle.scrollIntoView({ behavior: 'smooth' });
        }
      };

      if (apiConfigured()) {
        fetch(RSVP_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ name: name, status: selectedStatus, message: message })
        })
          .then(res => res.text().then(t => ({ res: res, text: t })))
          .then(({ res, text }) => {
            let ok = false;
            try { ok = !!JSON.parse(text).ok; } catch (e) { ok = res.ok; }
            finalize(newWish, ok
              ? 'Terima kasih atas doa restu & konfirmasi RSVP Anda! ❤️'
              : 'Ucapan tersimpan, namun server belum menyimpannya. ❤️');
            fetchFromApi(() => getWishes()).then(serverWishes => {
              if (serverWishes && serverWishes.length > 0) {
                localStorage.setItem('silmi_okra_wedding_wishes', JSON.stringify(serverWishes));
                renderWishes();
              }
            });
          })
          .catch(() => {
            finalize(newWish, 'Ucapan tersimpan di perangkat Anda. ❤️');
          });
      } else {
        finalize(newWish, 'Terima kasih atas doa restu & konfirmasi RSVP Anda! ❤️');
      }
    });
  }

  // =========================================================================
  // 10. Active Navigation Scroll Spy
  // =========================================================================
  const sections = document.querySelectorAll('section.page-section');
  const navItems = document.querySelectorAll('.nav-item');

  window.addEventListener('scroll', () => {
    let currentId = 'cover';
    const scrollPos = window.pageYOffset + 300;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${currentId}`) {
        item.classList.add('active');
      }
    });
  }, { passive: true });
});
