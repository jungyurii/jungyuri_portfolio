const menuBtn = document.querySelector('.menu-btn');
const gnb = document.querySelector('.gnb');

if (menuBtn && gnb) {
  menuBtn.addEventListener('click', () => {
    gnb.classList.toggle('open');
  });

  gnb.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => gnb.classList.remove('open'));
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('show');
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

const galleryModal = document.getElementById('projectGalleryModal');
const galleryImage = document.getElementById('galleryImage');
const galleryPagination = document.getElementById('galleryPagination');
const galleryOpenButtons = document.querySelectorAll('.gallery-open-btn');
const galleryPrevBtn = document.getElementById('galleryPrevBtn');
const galleryNextBtn = document.getElementById('galleryNextBtn');

let currentGalleryImages = [];
let currentGalleryAlts = [];
let currentGalleryIndex = 0;

function getGalleryElements() {
  const track = galleryPagination?.querySelector('.project-gallery-page-track');
  const indicator = galleryPagination?.querySelector('.project-gallery-page-indicator');
  const buttons = galleryPagination ? Array.from(galleryPagination.querySelectorAll('.project-gallery-page-btn')) : [];
  return { track, indicator, buttons };
}

function movePaginationIndicator() {
  const track = galleryPagination?.querySelector('.project-gallery-page-track');
  const indicator = galleryPagination?.querySelector('.project-gallery-page-indicator');
  const activeButton = galleryPagination?.querySelector('.project-gallery-page-btn.active');

  if (!track || !indicator || !activeButton) return;

  const trackRect = track.getBoundingClientRect();
  const activeRect = activeButton.getBoundingClientRect();

  const indicatorSize = indicator.offsetWidth;
  const buttonCenter = (activeRect.left - trackRect.left) + (activeRect.width / 2);
  const offsetX = buttonCenter - (indicatorSize / 2);

  indicator.style.left = '0px';
  indicator.style.transform = `translate3d(${offsetX}px, -50%, 0)`;
}

function buildGalleryPagination() {
  if (!galleryPagination) return;

  galleryPagination.innerHTML = '';

  const total = currentGalleryImages.length;
  if (!total) return;

  const track = document.createElement('div');
  track.className = 'project-gallery-page-track';

  const indicator = document.createElement('div');
  indicator.className = 'project-gallery-page-indicator';
  track.appendChild(indicator);

  currentGalleryImages.forEach((_, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'project-gallery-page-btn';
    button.textContent = String(index + 1);
    button.setAttribute('aria-label', `${index + 1}번 이미지 보기`);
    button.dataset.index = String(index);

    button.addEventListener('click', () => {
      if (currentGalleryIndex === index) return;
      currentGalleryIndex = index;
      updateGallery(true);
    });

    track.appendChild(button);
  });

  galleryPagination.appendChild(track);
}

function syncActivePageState() {
  const { buttons } = getGalleryElements();
  buttons.forEach((button, index) => {
    const isActive = index === currentGalleryIndex;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

function updateGallery(animateImage = false) {
  if (!galleryModal || !galleryImage) return;

  const currentSrc = currentGalleryImages[currentGalleryIndex] || '';
  const currentAlt = currentGalleryAlts[currentGalleryIndex] || `프로젝트 이미지 ${currentGalleryIndex + 1}`;

  if (animateImage && galleryImage.animate) {
    galleryImage.animate(
      [
        { opacity: 0.82, transform: 'scale(0.992)' },
        { opacity: 1, transform: 'scale(1)' }
      ],
      {
        duration: 420,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
      }
    );
  }

  galleryImage.src = currentSrc;
  galleryImage.alt = currentAlt;

  syncActivePageState();
  requestAnimationFrame(() => movePaginationIndicator(animateImage));
}

function openGallery(button) {
  currentGalleryImages = (button.dataset.galleryImages || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  currentGalleryAlts = (button.dataset.galleryAlts || '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);

  if (!currentGalleryImages.length) return;

  currentGalleryIndex = 0;
  buildGalleryPagination();
  galleryModal.classList.add('open');
  galleryModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  requestAnimationFrame(() => {
    updateGallery(false);
    setTimeout(() => movePaginationIndicator(false), 30);
  });
}

function closeGallery() {
  if (!galleryModal) return;

  galleryModal.classList.remove('open');
  galleryModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function moveGallery(step) {
  if (currentGalleryImages.length <= 1) return;

  currentGalleryIndex =
    (currentGalleryIndex + step + currentGalleryImages.length) % currentGalleryImages.length;

  updateGallery(true);
}

if (galleryOpenButtons.length && galleryModal) {
  galleryOpenButtons.forEach((button) => {
    button.addEventListener('click', () => openGallery(button));
  });

  galleryModal.querySelectorAll('[data-gallery-close]').forEach((element) => {
    element.addEventListener('click', closeGallery);
  });

  if (galleryPrevBtn) {
    galleryPrevBtn.addEventListener('click', () => moveGallery(-1));
  }

  if (galleryNextBtn) {
    galleryNextBtn.addEventListener('click', () => moveGallery(1));
  }

  document.addEventListener('keydown', (event) => {
    if (!galleryModal.classList.contains('open')) return;

    if (event.key === 'Escape') closeGallery();
    if (event.key === 'ArrowLeft') moveGallery(-1);
    if (event.key === 'ArrowRight') moveGallery(1);
  });

  window.addEventListener('resize', () => {
    if (galleryModal.classList.contains('open')) {
      movePaginationIndicator(false);
    }
  });
}
