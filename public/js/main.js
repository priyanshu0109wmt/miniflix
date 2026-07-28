document.addEventListener("DOMContentLoaded", () => {
  const featured = movies[0];
  const hero = document.getElementById("hero");
  const title = document.getElementById("hero-title");
  const description = document.getElementById("hero-description");
  const play = document.getElementById("hero-play");
  const info = document.getElementById("hero-info");

  if (hero && featured) {
    hero.style.backgroundImage = `linear-gradient(90deg, rgba(0,0,0,0.86), rgba(0,0,0,0.22)), url("${featured.backdrop}")`;
    title.textContent = featured.title;
    description.textContent = featured.description;
    play.href = `watch.html?id=${featured.id}`;
    info.href = `movie.html?id=${featured.id}`;
  }

  renderMovieRow("trending-row", movies.filter((movie) => movie.category === "trending"));
  renderMovieRow("popular-row", movies.filter((movie) => movie.category === "popular"));
});
