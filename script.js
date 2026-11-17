
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const toast = document.querySelector('.toast');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 3200);
}

menuToggle?.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

mainNav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

document.querySelector('#gift-preview')?.addEventListener('click', () => {
  showToast('Колесо подарунків додамо на наступному етапі ✨');
});

// Smoothly reveal sections as they enter the viewport.
const revealTargets = document.querySelectorAll(
  '.service-card, .process-step, .portfolio-tile, .gift-banner, .about-card, .reviews-card'
);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(el => {
    el.classList.add('will-reveal');
    observer.observe(el);
  });
}


// Open vertical YouTube case videos only after a portfolio-card click.
const caseModal = document.querySelector('#case-video-modal');
const caseVideoFrame = document.querySelector('#case-video-frame');
const caseCards = document.querySelectorAll('.case-card[data-video]');
let previouslyFocusedCaseCard = null;

function closeCaseVideo() {
  if (!caseModal || !caseVideoFrame) return;
  caseModal.classList.remove('is-open');
  caseModal.setAttribute('aria-hidden', 'true');
  caseVideoFrame.replaceChildren();
  document.body.classList.remove('video-open');
  previouslyFocusedCaseCard?.focus();
}

caseCards.forEach(card => {
  card.addEventListener('click', () => {
    const videoId = card.dataset.video;
    if (!videoId || !caseModal || !caseVideoFrame) return;
    previouslyFocusedCaseCard = card;
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
    iframe.title = 'Відеоогляд кейсу';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.loading = 'eager';
    caseVideoFrame.replaceChildren(iframe);
    caseModal.classList.add('is-open');
    caseModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('video-open');
    caseModal.querySelector('.video-modal-close')?.focus();
  });
});

caseModal?.querySelectorAll('[data-close-video]').forEach(button => {
  button.addEventListener('click', closeCaseVideo);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && caseModal?.classList.contains('is-open')) closeCaseVideo();
});

// Portfolio carousel controls — move by one card plus its gap.
const portfolioTrack = document.querySelector('#portfolio-track');
const portfolioPrev = document.querySelector('.portfolio-arrow-prev');
const portfolioNext = document.querySelector('.portfolio-arrow-next');

function updatePortfolioArrows() {
  if (!portfolioTrack || !portfolioPrev || !portfolioNext) return;

  const maxScroll = Math.max(0, portfolioTrack.scrollWidth - portfolioTrack.clientWidth);
  const hasOverflow = maxScroll > 2;

  portfolioPrev.hidden = !hasOverflow;
  portfolioNext.hidden = !hasOverflow;
  portfolioPrev.disabled = !hasOverflow || portfolioTrack.scrollLeft <= 2;
  portfolioNext.disabled = !hasOverflow || portfolioTrack.scrollLeft >= maxScroll - 2;
}

function getPortfolioStep() {
  if (!portfolioTrack) return 0;

  const firstCard = portfolioTrack.querySelector('.case-card');
  if (!firstCard) return portfolioTrack.clientWidth;

  const trackStyles = window.getComputedStyle(portfolioTrack);
  const gap = parseFloat(trackStyles.columnGap || trackStyles.gap) || 0;
  return firstCard.getBoundingClientRect().width + gap;
}

function scrollPortfolio(direction) {
  if (!portfolioTrack) return;

  const step = getPortfolioStep();
  if (!step) return;

  portfolioTrack.scrollBy({
    left: direction * step,
    behavior: 'smooth'
  });
}

portfolioPrev?.addEventListener('click', () => scrollPortfolio(-1));
portfolioNext?.addEventListener('click', () => scrollPortfolio(1));

portfolioTrack?.addEventListener('scroll', updatePortfolioArrows, { passive: true });
window.addEventListener('resize', updatePortfolioArrows);

if (portfolioTrack) {
  const portfolioImages = portfolioTrack.querySelectorAll('img');
  portfolioImages.forEach(image => {
    if (!image.complete) {
      image.addEventListener('load', updatePortfolioArrows, { once: true });
      image.addEventListener('error', updatePortfolioArrows, { once: true });
    }
  });

  if ('ResizeObserver' in window) {
    const portfolioResizeObserver = new ResizeObserver(updatePortfolioArrows);
    portfolioResizeObserver.observe(portfolioTrack);
  }
}

window.addEventListener('load', updatePortfolioArrows);
requestAnimationFrame(updatePortfolioArrows);
