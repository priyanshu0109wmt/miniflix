function getMovieFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  return movies.find((movie) => movie.id === id) || movies[0];
}

function getMyListIds() {
  return JSON.parse(localStorage.getItem("myList") || "[]");
}

function saveMyListIds(ids) {
  localStorage.setItem("myList", JSON.stringify(ids));
}

function toggleMyList(id) {
  const ids = getMyListIds();
  const nextIds = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
  saveMyListIds(nextIds);
  return nextIds.includes(id);
}

function renderMovieCard(movie) {
  return `
    <article class="movie-card">
      <a href="movie.html?id=${movie.id}" aria-label="View ${movie.title}">
        <img src="${movie.poster}" alt="${movie.title} poster" />
      </a>
      <div class="movie-card-body">
        <h3>${movie.title}</h3>
        <p>${movie.genre}</p>
      </div>
    </article>
  `;
}

function renderMovieRow(elementId, items) {
  const row = document.getElementById(elementId);
  if (!row) return;
  row.innerHTML = items.map(renderMovieCard).join("");
}

function renderDetails() {
  const container = document.getElementById("movie-details");
  if (!container) return;

  const movie = getMovieFromUrl();
  const isSaved = getMyListIds().includes(movie.id);

  container.innerHTML = `
    <section class="details-hero" style="background-image: linear-gradient(90deg, rgba(0,0,0,0.9), rgba(0,0,0,0.18)), url('${movie.backdrop}')">
      <div class="details-copy">
        <h1>${movie.title}</h1>
        <p class="meta">${movie.year} | ${movie.rating} | ${movie.runtime} | ${movie.genre}</p>
        <p>${movie.description}</p>
        <div class="actions">
          <a class="button primary" href="watch.html?id=${movie.id}">Play</a>
          <button class="button secondary" id="list-toggle">${isSaved ? "Remove From List" : "Add To List"}</button>
        </div>
      </div>
    </section>
  `;

  document.getElementById("list-toggle").addEventListener("click", (event) => {
    const saved = toggleMyList(movie.id);
    event.currentTarget.textContent = saved ? "Remove From List" : "Add To List";
  });
}

function renderWatchPage() {
  const title = document.getElementById("watch-title");
  if (!title) return;
  title.textContent = getMovieFromUrl().title;
}

function renderMyList() {
  const container = document.getElementById("my-list");
  if (!container) return;

  const ids = getMyListIds();
  const savedMovies = movies.filter((movie) => ids.includes(movie.id));
  container.innerHTML = savedMovies.length
    ? savedMovies.map(renderMovieCard).join("")
    : '<p class="empty-state">Your list is empty. Add a movie from its detail page.</p>';
}

document.addEventListener("DOMContentLoaded", () => {
  renderDetails();
  renderWatchPage();
  renderMyList();
});
