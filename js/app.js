/**
 * SILMI & OKRA WEDDING INVITATION - JAVASCRIPT
 * Audio controller, dynamic guest personalization, live countdown,
 * calendar export, clipboard copy, RSVP manager, and scroll navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. Dynamic Guest Name Personalization from URL
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
  // 2. Background Audio Controller
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
  // 3. Open Invitation Button Hotspot
  // =========================================================================
  const openInvBtn = document.getElementById('openInvitationBtn');
  const bottomNav = document.getElementById('bottomNav');
  const profileSection = document.getElementById('profile');

  if (openInvBtn) {
    openInvBtn.addEventListener('click', () => {
      playMusic();

      // Reveal bottom nav
      if (bottomNav) {
        bottomNav.classList.add('visible');
      }

      // Smooth scroll to profile section
      if (profileSection) {
        profileSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Also reveal bottom nav when user scrolls past cover
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 150) {
      if (bottomNav) bottomNav.classList.add('visible');
    }
  });

  // =========================================================================
  // 4. Live Real-Time Countdown Timer (Target: 11 October 2026, 09:00:00 WIB)
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
  // 5. Add to Google Calendar Action
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
  // 6. Toast Notification Helper
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
  // 7. Copy to Clipboard Hotspots (BCA & Mandiri)
  // =========================================================================
  document.querySelectorAll('.copy-hotspot').forEach(btn => {
    btn.addEventListener('click', () => {
      const bank = btn.getAttribute('data-bank') || 'Bank';
      const account = btn.getAttribute('data-account') || '11223344';
      
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(account).then(() => {
          showToast(`✓ No. Rekening ${bank} (${account}) berhasil disalin!`);
        }).catch(() => fallbackCopy(account, bank));
      } else {
        fallbackCopy(account, bank);
      }
    });
  });

  function fallbackCopy(text, bank) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      showToast(`✓ No. Rekening ${bank} (${text}) berhasil disalin!`);
    } catch(err) {
      showToast(`No. Rekening: ${text}`);
    }
    document.body.removeChild(input);
  }

  // =========================================================================
  // 8. RSVP Attendance Selection & Form Handling
  // =========================================================================
  let selectedStatus = 'Hadir';
  const choiceBtns = document.querySelectorAll('.rsvp-choice-hotspot');

  choiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      choiceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedStatus = btn.getAttribute('data-status') || 'Hadir';
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

      const wishes = getWishes();
      wishes.unshift(newWish);
      localStorage.setItem('silmi_okra_wedding_wishes', JSON.stringify(wishes));

      renderWishes();
      document.getElementById('rsvpMessage').value = '';
      showToast('Terima kasih atas doa restu & konfirmasi RSVP Anda! ❤️');
    });
  }

  // =========================================================================
  // 9. Active Navigation Scroll Spy
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
  });
});
