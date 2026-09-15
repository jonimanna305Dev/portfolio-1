/**
 * Initializes animated counter elements inside a container.
 */
function initCounters(container = document) {
  const counters = container.querySelectorAll('.counter, [data-count]');
  if (!counters.length) return;

  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const goal = parseInt(el.dataset.count, 10);
      if (isNaN(goal)) return;

      let start = null;
      const duration = 2000;

      const run = (time) => {
        if (!start) start = time;
        const progress = Math.min((time - start) / duration, 1);

        el.innerText = Math.floor(progress * goal) + "+";

        if (progress < 1) {
          requestAnimationFrame(run);
        } else {
          el.innerText = goal + "+";
        }
      };

      requestAnimationFrame(run);
      observer.unobserve(el);
    });
  }, { threshold: 0.1 });

  counters.forEach(c => obs.observe(c));
}

/**
 * Fetches HTML components into a target container.
 */
async function loadComponent(filePath, containerId = 'content') {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`${response.status}`);
    
    // Inject HTML
    container.innerHTML = await response.text();
    
    // Fire the counter script right after injecting new elements
    initCounters(container);

  } catch {
    container.innerHTML = `
      <section class="container py-5 text-center">
        <div class="alert alert-danger d-inline-block px-4 py-3" role="alert">
          <h4 class="alert-heading fw-bold mb-1"><i class="bi bi-exclamation-triangle-fill me-2"></i>404 - Page Not Found</h4>
          <p class="mb-0 text-body-secondary">Unable to load path: <code>${filePath}</code></p>
        </div>
      </section>`;
  }
}

/**
 * Handles query-parameter routing (?page=name) and active link states.
 */
function handleRoute() {
  const page = new URLSearchParams(location.search).get('page') || 'home';
  loadComponent(`components/${page}.html`);

  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href')?.includes(`page=${page}`));
  });
}

/**
 * Event Listeners & Router Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
  handleRoute();
  window.addEventListener('popstate', handleRoute);

  // Global link interception for SPA routing
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="?page="]');
    if (link) {
      e.preventDefault();
      history.pushState({}, '', link.getAttribute('href'));
      handleRoute();
    }
  });

  // Dark/Light Theme Toggle
  document.getElementById('themeToggle')?.addEventListener('click', function() {
    const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    this.querySelector('i')?.setAttribute('class', `bi bi-${newTheme === 'dark' ? 'moon-stars' : 'sun'}-fill`);
  });
});