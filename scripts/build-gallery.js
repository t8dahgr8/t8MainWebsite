// scripts/build-gallery.js
// Build static gallery pages from folders in Images/Gallery/*

const fs = require('fs');
const path = require('path');

// ---- Config: album source folder and output paths ----
const SRC_ROOT = path.join(process.cwd(), 'Images', 'Gallery'); // Images/Gallery/*
const OUT_DIR  = path.join(process.cwd(), 'gallery');           // /gallery/*.html
const LANDING  = path.join(process.cwd(), 'gallery.html');      // gallery landing page

// Which folders get albums? Any subfolder under Images/Gallery
const albums = fs.readdirSync(SRC_ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name); // e.g. ['Carnegie','Korea']

// allowed image extensions
const exts = new Set(['.jpg','.jpeg','.png','.webp','.gif','.bmp','.svg']);

function pretty(name){
  return name.replace(/[-_]+/g,' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ---------------- Album page template ----------------
// ---------------- Album page template (now accepts "cover") ----------------
function albumHTML({ albumName, images, cover }) {
  // album page sits in /gallery/, so path to images is ../Images/Gallery/<Album>/<file>
  const grid = images.map(fn =>
    `<img class="thumb object-center"
          src="../Images/Gallery/${albumName}/${fn}"
          alt="${fn}">`).join('\n      ');

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${pretty(albumName)} – Gallery – Tayte Choudhury</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root{ --page-bg:#0B1D16; --surface:#0F241C; --ink:#E6EEE9; --muted:#CBE7DD; --border:#1E4033; }
    .theme-light{ --page-bg:#F7F8F3; --surface:#FFFFFF; --ink:#0B1D16; --muted:#364A43; --border:#D9E6E1; }
    .theme-tamu{ --page-bg:#FAF7F2; --surface:#FFFFFF; --ink:#2B1A1D; --muted:#6C4A4A; --border:#E7D9CF; }
    body{ background:var(--page-bg); color:var(--ink); font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif; }
    .thumb{ border:1px solid var(--border); border-radius:.75rem; width:100%; aspect-ratio: 4 / 3; object-fit:cover; cursor:zoom-in; }
    #lightbox{ backdrop-filter:saturate(120%) blur(2px); }
  </style>
</head>
<body>
  <main class="max-w-7xl mx-auto px-6 pt-28 pb-16">
    <div class="flex items-center justify-between mb-6">
      <a href="../gallery.html" class="text-[color:var(--muted)] hover:text-white">
        <i class="fa-solid fa-arrow-left mr-2"></i> Back to Gallery
      </a>
      <div class="space-x-2 text-sm">
        <button class="px-3 py-1 rounded border border-[color:var(--border)]" data-theme="dark">Dark</button>
        <button class="px-3 py-1 rounded border border-[color:var(--border)]" data-theme="light">Light</button>
        <button class="px-3 py-1 rounded border border-[color:var(--border)]" data-theme="tamu">TAMU</button>
      </div>
    </div>

    <h1 class="text-3xl font-bold">${pretty(albumName)}</h1>

    ${cover ? `<img src="${cover}" alt="${pretty(albumName)} cover"
           class="mt-6 w-full rounded-lg border border-[color:var(--border)] object-cover" />` : ''}

    <div id="grid" class="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      ${grid}
    </div>

    <!-- Lightbox overlay -->
    <div id="lightbox" class="fixed inset-0 z-[100] hidden flex items-center justify-center bg-black/80 p-4">
      <img id="lb-img" class="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl border border-white/10 block" alt="preview">
      <button id="lb-close" class="absolute top-4 right-4 text-white/90 text-3xl leading-none px-2">×</button>
      <button id="lb-prev"  class="absolute left-4  top-1/2 -translate-y-1/2 text-white/90 text-4xl px-2">‹</button>
      <button id="lb-next"  class="absolute right-4 top-1/2 -translate-y-1/2 text-white/90 text-4xl px-2">›</button>
    </div>
  </main>

  <script>
    // theme inherit
    (function(){
      const mode = localStorage.getItem('theme') || 'dark';
      document.documentElement.classList.remove('theme-light','theme-tamu');
      if(mode==='light') document.documentElement.classList.add('theme-light');
      if(mode==='tamu')  document.documentElement.classList.add('theme-tamu');
      document.querySelectorAll('[data-theme]').forEach(b=>b.addEventListener('click',()=>{
        localStorage.setItem('theme', b.dataset.theme); location.reload();
      }));
    })();

    // lightbox
    (function(){
      const thumbs = Array.from(document.querySelectorAll('.thumb'));
      const overlay = document.getElementById('lightbox');
      const imgEl   = document.getElementById('lb-img');
      const prev    = document.getElementById('lb-prev');
      const next    = document.getElementById('lb-next');
      const close   = document.getElementById('lb-close');
      let i = 0;

      function openAt(n){
        i = (n + thumbs.length) % thumbs.length;
        imgEl.src = thumbs[i].dataset.full || thumbs[i].src;
        imgEl.alt = thumbs[i].alt || 'preview';
        overlay.classList.remove('hidden'); document.body.style.overflow='hidden';
      }
      function closeLB(){ overlay.classList.add('hidden'); imgEl.src=''; document.body.style.overflow=''; }
      function go(d){ openAt(i + d); }

      thumbs.forEach((t,idx)=> t.addEventListener('click',()=>openAt(idx)));
      close.addEventListener('click', closeLB);
      next.addEventListener('click',()=>go(+1));
      prev.addEventListener('click',()=>go(-1));
      overlay.addEventListener('click',e=>{ if(e.target===overlay) closeLB(); });
      window.addEventListener('keydown',e=>{
        if(overlay.classList.contains('hidden')) return;
        if(e.key==='Escape') closeLB();
        if(e.key==='ArrowRight') go(+1);
        if(e.key==='ArrowLeft')  go(-1);
      });
    })();
  </script>
</body>
</html>`;
}


// ------------- Landing page template -------------
function landingHTML(cards) {
  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Gallery – Tayte Choudhury</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root{ --page-bg:#0B1D16; --surface:#0F241C; --ink:#E6EEE9; --muted:#CBE7DD; --border:#1E4033; }
    .theme-light{ --page-bg:#F7F8F3; --surface:#FFFFFF; --ink:#0B1D16; --muted:#364A43; --border:#D9E6E1; }
    body{ background:var(--page-bg); color:var(--ink); font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif; }
    .card{background:var(--surface); border:1px solid var(--border); border-radius:1rem; overflow:hidden; transition:transform .2s ease,border-color .2s ease;}
    .card:hover{transform:translateY(-4px); border-color:#D4AF37;}
    .btn{background:linear-gradient(90deg,#10936B,#D4AF37);color:#0A1512;padding:.5rem .9rem;border-radius:9999px;font-weight:600;display:inline-flex;align-items:center;gap:.45rem}
  </style>
</head>
<body>
  <main class="max-w-7xl mx-auto px-6 pt-28 pb-20">
    <header class="mb-10">
      <a href="index.html#home" class="text-[color:var(--muted)] hover:text-white">
        <i class="fa-solid fa-arrow-left mr-2"></i> Back to Home
      </a>
      <h1 class="text-4xl font-bold mt-4">Gallery</h1>
      <p class="text-[color:var(--muted)] mt-2">Collections from performances and travels.</p>
    </header>
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      ${cards}
    </section>
  </main>
  <script>
    const mode = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.remove('theme-light','theme-tamu');
    if(mode==='light') document.documentElement.classList.add('theme-light');
    if(mode==='tamu')  document.documentElement.classList.add('theme-tamu');
  </script>
</body>
</html>`;
}

// ---------------- Build process ----------------
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ---------------- Build each album + landing card (with preferred cover) ----------------
const albumCards = [];

albums.forEach(album => {
  const albumDir = path.join(SRC_ROOT, album);

  const files = fs.readdirSync(albumDir)
    .filter(f => exts.has(path.extname(f).toLowerCase()))
    .sort((a,b)=> a.localeCompare(b, undefined, { numeric:true }));

  // Prefer explicit cover files:
  //  - Global: Images/Gallery/<Album>-cover.(jpg|jpeg|png)
  //  - Inside: Images/Gallery/<Album>/cover.(jpg|jpeg|png)
  const coverCandidates = [
    path.join(SRC_ROOT, `${album}-cover.jpg`),
    path.join(SRC_ROOT, `${album}-cover.jpeg`),
    path.join(SRC_ROOT, `${album}-cover.png`),
    path.join(albumDir,  'cover.jpg'),
    path.join(albumDir,  'cover.jpeg'),
    path.join(albumDir,  'cover.png'),
  ];

  let coverAbs = coverCandidates.find(p => fs.existsSync(p));
  if (!coverAbs && files[0]) coverAbs = path.join(albumDir, files[0]); // fallback to first file

  // convert absolute path -> web path
  const toWeb = abs => abs.replace(process.cwd() + path.sep, '').replace(/\\/g,'/');
  const coverWeb = coverAbs ? toWeb(coverAbs) : 'https://via.placeholder.com/800x600?text=No+Images';

  // write album page
  const outPath = path.join(OUT_DIR, `${album.toLowerCase().replace(/\s+/g,'-')}.html`);
  fs.writeFileSync(outPath, albumHTML({ albumName: album, images: files, cover: coverWeb }), 'utf8');

  // landing card
  const link = `gallery/${album.toLowerCase().replace(/\s+/g,'-')}.html`;
  albumCards.push(`
  <a href="${link}" class="card block">
    <div class="aspect-[4/3] overflow-hidden">
      <img src="${coverWeb}" alt="${album} cover" class="w-full h-full object-cover">
    </div>
    <div class="p-5">
      <h3 class="text-xl font-semibold">${pretty(album)}</h3>
      <div class="mt-4"><span class="btn text-sm">View Album</span></div>
    </div>
  </a>`);
});

// (your code that writes gallery.html using albumCards stays the same)



// write/overwrite gallery.html landing
fs.writeFileSync(LANDING, landingHTML(albumCards.join('\n')), 'utf8');

console.log(`Built ${albums.length} album(s).`);
