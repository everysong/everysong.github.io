// Calculate streams based on baseStreams + some time factor
function calculateStreams(song) {
  const now = Math.floor(Date.now() / 1000);
  const timeFactor = Math.floor((now - song.created) / 86400); // per day growth
  return song.baseStreams + (timeFactor * 100); // 100 streams/day growth
}

// Search function (works on both songs and artists)
function setupSearch(inputId, resultsId) {
  const input = document.getElementById(inputId);
  const results = document.getElementById(resultsId);

  if (!input || !results) return;

  input.addEventListener("input", () => {
    const query = input.value.toLowerCase();
    results.innerHTML = "";

    if (query.length < 2) return;

    // Search songs
    songs.forEach(song => {
      if (song.title.toLowerCase().includes(query)) {
        const artist = artists.find(a => a.id === song.artistId);
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

    // Search artists
    artists.forEach(artist => {
      if (artist.name.toLowerCase().includes(query)) {
        const artistSongs = songs.filter(s => s.artistId === artist.id);
        let totalStreams = 0;
        artistSongs.forEach(song => totalStreams += calculateStreams(song));
        const listeners = Math.floor(totalStreams * 0.25);

        results.innerHTML += `
          <a href="/artist.html?id=${artist.id}">
            <div class="card">
              <img src="${artist.image}" alt="${artist.name}">
              <h3>${artist.name}</h3>
              <div class="listeners"><img src="/cdn/icon.png">${listeners.toLocaleString()}</div>
            </div>
          </a>`;
      }
    });
  });
}
