// Calculate streams based on time elapsed * multiplier
function calculateStreams(song) {
  const now = Math.floor(Date.now() / 1000);
  const elapsed = now - song.created; // seconds since upload
  return Math.max(
    song.baseStreams + Math.floor(elapsed * song.streamMultiplier),
    0
  );
}

// Render song cards into a container
function renderSongs(containerId, list) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  list.forEach(song => {
    const artist = artists.find(a => a.id === song.artistId);
    const streams = calculateStreams(song).toLocaleString();
    container.innerHTML += `
      <div class="card">
        <img src="${song.cover}" alt="cover">
        <div class="info">
          <h3>${song.title}</h3>
          <a href="/artist.html?id=${artist.id}">${artist.name}</a>
          <div class="streams"><img src="/cdn/icon.png">${streams}</div>
        </div>
      </div>`;
  });
}

// Render newest songs for index
function renderNewestSongs() {
  const sorted = [...songs].sort((a, b) => b.created - a.created);
  renderSongs("newSongs", sorted.slice(0, 6));
}

// Render all/random songs for songs.html
function renderAllSongs() {
  const shuffled = [...songs].sort(() => 0.5 - Math.random());
  renderSongs("allSongs", shuffled);
}

// Setup search
function setupSearch(inputId, resultsId) {
  const input = document.getElementById(inputId);
  const results = document.getElementById(resultsId);
  if (!input || !results) return;

  input.addEventListener("input", () => {
    const query = input.value.toLowerCase();
    results.innerHTML = "";
    if (query.length < 2) return;

    // Songs
    songs.forEach(song => {
      const artist = artists.find(a => a.id === song.artistId);
      if (
        song.title.toLowerCase().includes(query) ||
        artist.name.toLowerCase().includes(query)
      ) {
        const streams = calculateStreams(song).toLocaleString();
        results.innerHTML += `
          <div class="card">
            <img src="${song.cover}" alt="cover">
            <div class="info">
              <h3>${song.title}</h3>
              <a href="/artist.html?id=${artist.id}">${artist.name}</a>
              <div class="streams"><img src="/cdn/icon.png">${streams}</div>
            </div>
          </div>`;
      }
    });

    // Artists
    artists.forEach(artist => {
      if (artist.name.toLowerCase().includes(query)) {
        const artistSongs = songs.filter(s => s.artistId === artist.id);
        let totalStreams = 0;
        artistSongs.forEach(song => (totalStreams += calculateStreams(song)));
        const listeners = Math.floor(totalStreams * 0.25);

        results.innerHTML += `
          <a href="/artist.html?id=${artist.id}">
            <div class="card">
              <img src="${artist.image}" alt="${artist.name}">
              <h3>${artist.name}</h3>
              <div class="listeners">${listeners.toLocaleString()} Listeners</div>
            </div>
          </a>`;
      }
    });
  });
}


  // total streams on site (sum of all songs)
  function getTotalStreams(){
    const all = window.songs || [];
    let t=0; all.forEach(s=> t += calculateStreams(s));
    return t;
  }

// Auto-detect which page we’re on
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("newSongs")) {
    renderNewestSongs();
    setupSearch("searchInput", "searchResults");
  }
  if (document.getElementById("allSongs")) {
    renderAllSongs();
  }
});
