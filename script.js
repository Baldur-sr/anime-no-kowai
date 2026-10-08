const ANIME_IDS = [11111, 7724, 934, 22535, 22319, 226];
const API_BASE = 'https://api.jikan.moe/v4/anime';
const CACHE_KEY = 'animeNoKowaiCacheV1';
let animeCatalog = [];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function truncate(text, length = 150) {
  if (!text) return 'Sinopsis no disponible en la respuesta de la API.';
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > length ? `${clean.slice(0, length).trim()}…` : clean;
}

function saveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
  } catch (_) {}
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const freshForMs = 12 * 60 * 60 * 1000;
    return Date.now() - parsed.savedAt < freshForMs ? parsed.data : null;
  } catch (_) { return null; }
}

async function fetchAnime(id) {
  const response = await fetch(`${API_BASE}/${id}/full`);
  if (!response.ok) throw new Error(`Jikan devolvió ${response.status}`);
  const json = await response.json();
  return json.data;
}

async function loadCatalog() {
  const cached = readCache();
  if (cached?.length === ANIME_IDS.length) {
    animeCatalog = cached;
    updateApiStatus('Catálogo en caché local', 'ok');
    return;
  }

  const loaded = [];
  for (const id of ANIME_IDS) {
    try {
      loaded.push(await fetchAnime(id));
      await sleep(450);
    } catch (error) {
      console.warn(`No fue posible cargar ${id}:`, error);
    }
  }

  animeCatalog = loaded;
  if (loaded.length) {
    saveCache(loaded);
    updateApiStatus(`Jikan conectado · ${loaded.length}/6 títulos`, 'ok');
  } else {
    updateApiStatus('No se pudo conectar con Jikan', 'error');
  }
}

function updateApiStatus(text, type = 'ok') {
  const box = document.getElementById('apiStatus');
  box.className = `status-box w-100 ${type === 'error' ? 'text-danger' : ''}`;
  box.innerHTML = `<i class="bi bi-circle-fill"></i> ${escapeHtml(text)}`;
}

function cardTemplate(anime) {
  const id = anime.mal_id;
  const image = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
  const title = anime.title || 'Título no disponible';
  const score = anime.score ?? 'N/D';
  const year = anime.year || anime.aired?.prop?.from?.year || 'N/D';
  const genres = (anime.genres || []).slice(0, 2).map(g => g.name).join(' · ');
  return `
    <div class="col-12 col-md-6 col-xl-4 anime-card-wrap" data-title="${escapeHtml(title.toLowerCase())}">
      <article class="anime-card">
        <img class="anime-cover" src="${escapeHtml(image)}" alt="Portada de ${escapeHtml(title)}" loading="lazy">
        <div class="anime-body">
          <h3 class="anime-title">${escapeHtml(title)}</h3>
          <div class="d-flex flex-wrap gap-2 mb-2">
            <span class="badge badge-nk">Score: ${escapeHtml(score)}</span>
            <span class="badge badge-nk">${escapeHtml(year)}</span>
            ${genres ? `<span class="badge badge-nk">${escapeHtml(genres)}</span>` : ''}
          </div>
          <p class="anime-copy">${escapeHtml(truncate(anime.synopsis))}</p>
          <div class="card-actions">
            <button class="btn btn-sm btn-danger" type="button" data-anime-id="${id}"><i class="bi bi-eye"></i> Ver ficha</button>
            ${anime.trailer?.url ? `<a class="btn btn-sm btn-outline-light" href="${escapeHtml(anime.trailer.url)}" target="_blank" rel="noopener"><i class="bi bi-youtube"></i> YouTube</a>` : ''}
          </div>
        </div>
      </article>
    </div>`;
}

function renderCatalog(list = animeCatalog) {
  const grid = document.getElementById('animeGrid');
  const loading = document.getElementById('loading');
  const empty = document.getElementById('emptyState');
  loading.classList.add('d-none');
  grid.innerHTML = list.map(cardTemplate).join('');
  empty.classList.toggle('d-none', list.length !== 0);
}

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  grid.innerHTML = animeCatalog.map(anime => {
    const image = anime.images?.jpg?.image_url || '';
    return `<div class="col-12 col-lg-6">
      <article class="gallery-card">
        <img class="gallery-thumb" src="${escapeHtml(image)}" alt="${escapeHtml(anime.title)}" loading="lazy">
        <div>
          <h3>${escapeHtml(anime.title)}</h3>
          <p>${escapeHtml(truncate(anime.synopsis, 120))}</p>
          <button class="btn btn-outline-light btn-sm" data-anime-id="${anime.mal_id}"><i class="bi bi-play-circle"></i> Abrir ficha</button>
        </div>
      </article>
    </div>`;
  }).join('');
}

function openAnimeModal(id) {
  const anime = animeCatalog.find(item => Number(item.mal_id) === Number(id));
  if (!anime) return;
  const modal = new bootstrap.Modal('#animeModal');
  document.getElementById('modalTitle').textContent = anime.title || 'Anime';
  const modalImage = document.getElementById('modalImage');
  modalImage.src = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
  modalImage.alt = `Portada de ${anime.title || 'anime'}`;
  document.getElementById('modalSynopsis').textContent = anime.synopsis || 'Sinopsis no disponible.';
  document.getElementById('modalBadges').innerHTML = `
    <span class="badge badge-nk me-1">Score: ${escapeHtml(anime.score ?? 'N/D')}</span>
    <span class="badge badge-nk me-1">${escapeHtml(anime.status || 'N/D')}</span>
    <span class="badge badge-nk">${escapeHtml(anime.rating || 'N/D')}</span>`;
  const from = anime.aired?.from ? new Date(anime.aired.from).getFullYear() : 'N/D';
  document.getElementById('modalMeta').innerHTML = [
    ['Año', from],
    ['Episodios', anime.episodes ?? 'N/D'],
    ['Tipo', anime.type || 'N/D'],
    ['Estudio', anime.studios?.[0]?.name || 'N/D'],
    ['Géneros', (anime.genres || []).map(g => g.name).join(', ') || 'N/D'],
    ['Duración', anime.duration || 'N/D']
  ].map(([label, value]) => `<div class="col-12 col-sm-6"><div class="meta-item"><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></div></div>`).join('');

  const frame = document.getElementById('trailerFrame');
  const wrap = document.getElementById('trailerWrap');
  const noTrailer = document.getElementById('trailerUnavailable');
  const embed = anime.trailer?.embed_url || null;
  if (embed) {
    frame.src = embed;
    wrap.classList.remove('d-none');
    noTrailer.classList.add('d-none');
  } else {
    frame.src = '';
    wrap.classList.add('d-none');
    noTrailer.classList.remove('d-none');
  }
  modal.show();
}

function setupEvents() {
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-anime-id]');
    if (button) openAnimeModal(button.dataset.animeId);
  });

  document.getElementById('searchInput').addEventListener('input', event => {
    const term = event.target.value.trim().toLowerCase();
    const filtered = animeCatalog.filter(anime => `${anime.title} ${anime.title_english || ''}`.toLowerCase().includes(term));
    renderCatalog(filtered);
  });

  document.getElementById('contactForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    const feedback = document.getElementById('formFeedback');
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      feedback.className = 'form-feedback mt-3 error';
      feedback.textContent = 'Revisa los campos obligatorios antes de enviar.';
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    const messages = JSON.parse(localStorage.getItem('animeNoKowaiMessages') || '[]');
    messages.push({ ...data, createdAt: new Date().toISOString() });
    localStorage.setItem('animeNoKowaiMessages', JSON.stringify(messages));
    form.reset();
    form.classList.remove('was-validated');
    feedback.className = 'form-feedback mt-3';
    feedback.textContent = 'Opinión guardada en la demostración local. ¡Gracias por escribir!';
  });
}

async function init() {
  setupEvents();
  await loadCatalog();
  renderCatalog();
  renderGallery();
}

document.addEventListener('DOMContentLoaded', init);
