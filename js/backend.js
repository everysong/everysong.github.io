/* backend.js
   Single-file app logic used by all pages.
   Exposes `backend` global with helper functions.
*/
(function(){
  const toExport = {};

  // utility: format number with commas
  function formatNumber(n){
    // ensure integer
    n = Math.floor(Math.max(0, Number(n) || 0));
    // digit-by-digit formatting (explicit to avoid mistakes)
    const s = String(n);
    let out = '';
    let count = 0;
    for(let i=s.length-1;i>=0;i--){
      out = s[i] + out;
      count++;
      if(count%3===0 && i!==0) out = ',' + out;
    }
    return out;
  }

  // get current unix timestamp in seconds
  function nowUnix(){ return Math.floor(Date.now()/1000); }

  // compute streams for a song once per page load
  // formula: (now - uploadDate) * streamMultiplier
  // We compute and cache results so they won't change during the session
  const streamsCache = {};
  function computeStreams(song){
    if(!song || !song.uploadDate) return 0;
    if(streamsCache[song.irsc]) return streamsCache[song.irsc];
    const diff = Math.max(0, nowUnix() - Number(song.uploadDate));
    let val = Math.floor(diff * Number(song.streamMultiplier || 0));
    streamsCache[song.irsc] = val;
    return val;
  }

  // artist listeners: sum of artists songs streams, then remove 75% (so keep 25%)
  const artistListenersCache = {};
  function computeArtistListeners(artistID){
    if(artistListenersCache[artistID] !== undefined) return artistListenersCache[artistID];
    const songs = (window.SONGS || []).filter(s => s.artistID === artistID);
    let total = 0;
    songs.forEach(s => total += computeStreams(s));
    const listeners = Math.floor(total * 0.25); // remove 75%
    artistListenersCache[artistID] = listeners;
    return listeners;
  }

  // helper to get artist by ID
  function getArtistByID(id){
    if(!window.ARTISTS) return null;
    return window.ARTISTS.find(a => String(a.id) === String(id)) || null;
  }

  // get songs for artist
  function getSongsByArtist(artistID){
    return (window.SONGS || []).filter(s => s.artistID === artistID).sort((a,b)=> b.uploadDate - a.uploadDate);
  }

  // get latest songs by uploadDate (descending)
  function getLatestSongs(n=3){
    const arr = (window.SONGS||[]).slice();
    arr.sort((a,b)=> b.uploadDate - a.uploadDate);
    return arr.slice(0,n);
  }

  // random selection helper
  function shuffle(arr){ const a = arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } return a; }
  function getRandomArtists(n=8){ return shuffle(window.ARTISTS || []).slice(0,n); }
  function getRandomSongs(n=6){ return shuffle(window.SONGS || []).slice(0,n); }

  // total streams on site (sum of all songs)
  function getTotalStreams(){
    const all = window.SONGS || [];
    let t=0; all.forEach(s=> t += computeStreams(s));
    return t;
  }

  // search songs by song title or artist name (case-insensitive)
  function searchSongs(query){
    const q = String(query||'').toLowerCase();
    if(!q) return [];
    return (window.SONGS||[]).filter(s=>{
      return (s.title||'').toLowerCase().includes(q) || (s.artistName||'').toLowerCase().includes(q);
    }).sort((a,b)=> b.uploadDate - a.uploadDate);
  }

  /* --- DOM helpers to create song card elements (used across pages) ---
     Song card includes clickable artist name that links to /artist.html?ID=ARTIST_ID
     The displayed stream count uses computed streams (with commas).
     The function returns a DOM element ready to insert.
     Optionally, a compact flag for grid/list tiny cards.
  */
  function songCardElement(song, compact=false){
    const e = document.createElement('div');
    e.className = 'song-card';
    const coverUrl = song.cover || '/cdn/icon.png';
    const streams = computeStreams(song);
    e.innerHTML = `
      <div class="cover" style="background-image:url('${coverUrl}');background-size:cover;"></div>
      <div class="song-info">
        <div class="song-title">${escapeHTML(song.title || 'Untitled')}</div>
        <a class="song-artist" href="/artist.html?ID=${encodeURIComponent(song.artistID)}">${escapeHTML(song.artistName || 'Unknown')}</a>
        <div class="song-meta"><span class="logo-small"></span> ${formatNumber(streams)}</div>
      </div>
    `;
    // prevent default link coloring after click by ensuring anchor styles are controlled by CSS (pages have that)
    // add hover grow for buttons (CSS across pages handles .song-card:hover)
    return e;
  }

  /* small HTML escape to keep inserted text safe */
  function escapeHTML(s){
    return String(s||'').replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  // exports
  toExport.formatNumber = formatNumber;
  toExport.getArtistByID = getArtistByID;
  toExport.getSongsByArtist = getSongsByArtist;
  toExport.getLatestSongs = getLatestSongs;
  toExport.getRandomArtists = getRandomArtists;
  toExport.getRandomSongs = getRandomSongs;
  toExport.getTotalStreams = getTotalStreams;
  toExport.searchSongs = searchSongs;
  toExport.songCardElement = songCardElement;
  toExport.computeStreams = computeStreams;
  toExport.getArtistListeners = computeArtistListeners;

  window.backend = toExport;
})();
