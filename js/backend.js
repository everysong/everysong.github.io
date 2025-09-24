// Utility: add commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Calculate streams from timestamp + multiplier
function calculateStreams(song) {
  let now = Math.floor(Date.now() / 1000);
  let diff = now - song.uploadDate;
  let streams = diff * song.streamMultiplyer;
  return Math.max(0, Math.floor(streams));
}

// Render a song card
function renderSongCard(song) {
  let streams = formatNumber(calculateStreams(song));
  return `
    <div class="card">
      <img src="${song.cover}" alt="Cover">
      <div class="info">
        <h3>${song.title}</h3>
        <a href="/artist?ID=${song.artistID}">${song.artist}</a>
        <div class="streams">
          <img src="/cdn/icon.png" alt="icon">${streams}
        </div>
      </div>
    </div>
  `;
}

// Load newest 3 songs
function loadNewestSongs() {
  let sorted = songs.sort((a, b) => b.uploadDate - a.uploadDate);
  let newest = sorted.slice(0, 3);
  document.getElementById("newSongs").innerHTML = newest.map(renderSongCard).join("");
}

// Search songs by title or artist
function setupSearch() {
  let input = document.getElementById("searchInput");
  input.addEventListener("input", () => {
    let query = input.value.trim().toLowerCase();
    let container = document.getElementById("searchResults");

    if (!query) {
      container.innerHTML = "";
      return;
    }

    let results = songs.filter(s =>
      s.title.toLowerCase().includes(query) ||
      s.artist.toLowerCase().includes(query)
    );

    container.innerHTML = results.map(renderSongCard).join("");
  });
}

// Init
window.addEventListener("DOMContentLoaded", () => {
  loadNewestSongs();
  setupSearch();
});
