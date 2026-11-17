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

\n// Open vertical YouTube case videos only after a portfolio-card click.
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

// Portfolio carousel controls — scroll exactly one card at a time.
const portfolioTrack = document.querySelector('#portfolio-track');
const portfolioPrev = document.querySelector('.portfolio-arrow-prev');
const portfolioNext = document.querySelector('.portfolio-arrow-next');

function portfolioMaxScroll() {
  if (!portfolioTrack) return 0;
  return Math.max(0, portfolioTrack.scrollWidth - portfolioTrack.clientWidth);
}

function updatePortfolioArrows() {
  if (!portfolioTrack || !portfolioPrev || !portfolioNext) return;
  const maxScroll = portfolioMaxScroll();
  const hasOverflow = maxScroll > 3;
  portfolioPrev.hidden = !hasOverflow;
  portfolioNext.hidden = !hasOverflow;
  portfolioPrev.disabled = !hasOverflow || portfolioTrack.scrollLeft <= 3;
  portfolioNext.disabled = !hasOverflow || portfolioTrack.scrollLeft >= maxScroll - 3;
}

function scrollPortfolio(direction) {
  if (!portfolioTrack) return;
  const cards = Array.from(portfolioTrack.querySelectorAll('.case-card'));
  if (!cards.length) return;

  const trackRect = portfolioTrack.getBoundingClientRect();
  const currentLeft = portfolioTrack.scrollLeft;
  const gap = parseFloat(getComputedStyle(portfolioTrack).columnGap || getComputedStyle(portfolioTrack).gap) || 0;

  // Use the actual card width, then clamp to the final scroll position.
  const step = cards[0].getBoundingClientRect().width + gap;
  const target = Math.max(0, Math.min(portfolioMaxScroll(), currentLeft + direction * step));
  portfolioTrack.scrollTo({ left: target, behavior: 'smooth' });
  window.setTimeout(updatePortfolioArrows, 350);
}

portfolioPrev?.addEventListener('click', () => scrollPortfolio(-1));
portfolioNext?.addEventListener('click', () => scrollPortfolio(1));
portfolioTrack?.addEventListener('scroll', updatePortfolioArrows, { passive: true });
window.addEventListener('resize', updatePortfolioArrows);
portfolioTrack?.querySelectorAll('img').forEach(img => {
  if (!img.complete) img.addEventListener('load', updatePortfolioArrows, { once: true });
});
window.addEventListener('load', updatePortfolioArrows);
requestAnimationFrame(updatePortfolioArrows);
