
let currentFilter = "Alle";
let CARS = [];
let favorites = new Set(JSON.parse(localStorage.getItem("lemansFavorites") || "[]"));

const grid = document.getElementById("grid");
const search = document.getElementById("search");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const classesModal = document.getElementById("classesModal");

function esc(s){
  return String(s ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

function saveFavorites(){
  localStorage.setItem("lemansFavorites", JSON.stringify([...favorites]));
}

function toggleFavorite(no, ev){
  if(ev) ev.stopPropagation();
  if(favorites.has(no)){
    favorites.delete(no);
  }else{
    favorites.add(no);
  }
  saveFavorites();
  render();
}

function favoriteButton(c){
  const active = favorites.has(c.no);
  return `<button class="favBtn ${active ? "favActive" : ""}" onclick="toggleFavorite('${esc(c.no)}', event)" title="Favorit">${active ? "★" : "☆"}</button>`;
}

function driverSearchName(name){
  return String(name || "")
    .replace("🇩🇰", "")
    .replace(/[^\p{L}\p{N}\s.'-]/gu, "")
    .trim();
}

function driverLink(name){
  const clean = driverSearchName(name);
  const url = "https://en.wikipedia.org/w/index.php?search=" + encodeURIComponent(clean);
  return `<a class="driver driverLink" href="${url}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${esc(name)}</a>`;
}

function detectDelimiter(headerLine){
  const semis = (headerLine.match(/;/g) || []).length;
  const commas = (headerLine.match(/,/g) || []).length;
  return semis >= commas ? ";" : ",";
}

function parseCSVLine(line, delimiter){
  const result = [];
  let cur = "";
  let inQuotes = false;
  for(let i=0;i<line.length;i++){
    const ch = line[i];
    const next = line[i+1];
    if(ch === '"' && inQuotes && next === '"'){
      cur += '"';
      i++;
    }else if(ch === '"'){
      inQuotes = !inQuotes;
    }else if(ch === delimiter && !inQuotes){
      result.push(cur);
      cur = "";
    }else{
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function parseCSV(text){
  text = String(text || "").replace(/^\uFEFF/, "").trim();
  if(!text) return [];
  const lines = text.split(/\r?\n/).filter(line => line.trim().length);
  if(!lines.length) return [];
  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCSVLine(lines.shift(), delimiter).map(h => h.trim());
  return lines.map(line => {
    const values = parseCSVLine(line, delimiter);
    const row = {};
    headers.forEach((h, i) => row[h] = values[i] ?? "");
    return row;
  });
}

function imagePath(fileName){
  fileName = String(fileName || "").trim();
  if(!fileName) return "";
  if(fileName.startsWith("http://") || fileName.startsWith("https://")) return fileName;
  if(fileName.startsWith("images/")) return fileName;
  return `images/${fileName}`;
}

function rowToCar(r){
  const images = [
    r["Billede1"], r["Billede2"], r["Billede3"], r["Billede4"]
  ].map(imagePath).filter(Boolean);

  return {
    no: String(r["Startnr"] || "").trim(),
    cls: r["Klasse"] || "",
    car: r["Bil"] || "",
    team: r["Team"] || "",
    drivers: [r["Kører 1"], r["Kører 2"], r["Kører 3"]].filter(Boolean),
    danish: (r["Dansk"] || "").toLowerCase().startsWith("j"),
    images: images.length ? images : ["images/placeholder.svg"],
    onboard: r["Onboard"] || "",
    note: r["Note"] || ""
  };
}

async function loadData(){
  const res = await fetch("data.csv?cache=" + Date.now());
  if(!res.ok) throw new Error(`data.csv blev ikke fundet (${res.status})`);
  const text = await res.text();
  CARS = parseCSV(text).map(rowToCar).filter(c => c.no);
  if(!CARS.length) throw new Error("data.csv blev læst, men der blev ikke fundet nogen biler");
  render();
}

function onboardButton(c, stopClick = true){
  const hasLink = c.onboard && c.onboard.trim();
  if(hasLink){
    return `<a class="camBtn camYes" href="${esc(c.onboard)}" target="_blank" rel="noopener" ${stopClick ? 'onclick="event.stopPropagation()"' : ""}>▶ Onboard</a>`;
  }
  return `<span class="camBtn camNo">Ingen onboard</span>`;
}

function lmuButton(stopClick = true){
  return `<a class="camBtn gameBtn" href="https://lemansultimate.com/cars/" target="_blank" rel="noopener" ${stopClick ? 'onclick="event.stopPropagation()"' : ""}>🎮 Le Mans Ultimate</a>`;
}

function card(c){
  return `<article class="card ${c.danish ? "danish" : ""}" data-no="${esc(c.no)}">
    <div class="photo">
      <img src="${esc(c.images[0])}" alt="#${esc(c.no)} ${esc(c.car)}" onerror="this.src='images/placeholder.svg'">
      <div class="badges">
        <span class="badge">${esc(c.cls)}</span>
        ${c.danish ? '<span class="badge dk">🇩🇰 Dansk</span>' : '<span></span>'}
      </div>
      ${favoriteButton(c)}
      <div class="no">#${esc(c.no)}</div>
      ${c.images.length > 1 ? `<div class="imageCount">${c.images.length} billeder</div>` : ""}
    </div>
    <div class="body">
      <h2 class="car">${esc(c.car)}</h2>
      <div class="team">${esc(c.team)}</div>
      <div class="drivers">${c.drivers.map(d=>driverLink(d)).join("")}</div>
      <div class="cardActions">
        ${onboardButton(c, true)}
      </div>
    </div>
  </article>`;
}

function thumbnails(c){
  if(!c.images || c.images.length <= 1) return "";
  return `<div class="thumbs">
    ${c.images.map((img, i) => `
      <button class="thumb ${i === 0 ? "activeThumb" : ""}" onclick="setMainImage('${esc(img)}', this)">
        <img src="${esc(img)}" alt="Billede ${i+1}" onerror="this.src='images/placeholder.svg'">
      </button>
    `).join("")}
  </div>`;
}

function setMainImage(src, btn){
  const main = document.getElementById("modalMainImage");
  if(main) main.src = src;
  document.querySelectorAll(".thumb").forEach(t => t.classList.remove("activeThumb"));
  if(btn) btn.classList.add("activeThumb");
}

function modalHtml(c){
  const fav = favorites.has(c.no);
  return `<img id="modalMainImage" class="modalImg" src="${esc(c.images[0])}" alt="#${esc(c.no)} ${esc(c.car)}" onerror="this.src='images/placeholder.svg'">
  ${thumbnails(c)}
  <div class="modalText">
    <div class="modalTitleRow">
      <h2>#${esc(c.no)} · ${esc(c.car)}</h2>
      <button class="favBtn modalFav ${fav ? "favActive" : ""}" onclick="toggleFavorite('${esc(c.no)}', event); modalContent.innerHTML = modalHtml(CARS.find(x=>x.no==='${esc(c.no)}'))">${fav ? "★" : "☆"}</button>
    </div>
    <p><strong>Klasse:</strong> ${esc(c.cls)}</p>
    <p><strong>Team:</strong> ${esc(c.team)}</p>
    <p><strong>Kørere:</strong></p>
    <div class="drivers modalDrivers">${c.drivers.map(d=>driverLink(d)).join("")}</div>
    ${c.note ? `<p><strong>Note:</strong> ${esc(c.note)}</p>` : ""}
    <div class="actionRow">
      ${onboardButton(c, false)}
      ${lmuButton(false)}
      <a class="camBtn listBtn" href="https://www.motorsport.com/wec/news/the-2026-le-mans-24-hours-entry-list-in-full/10798927/" target="_blank" rel="noopener">Entry list</a>
    </div>
    <section class="fileInfo">
      <p class="muted">Klik på et kørernavn for at åbne en Wikipedia-søgning i ny fane.</p>
    </section>
  </div>`;
}

function render(){
  const q = (search.value || "").toLowerCase().trim();
  const list = CARS.filter(c => {
    const text = [c.no, c.cls, c.car, c.team, c.onboard, c.note, ...(c.images || []), ...(c.drivers || [])].join(" ").toLowerCase();
    const filterOk =
      currentFilter === "Alle" ||
      c.cls === currentFilter ||
      (currentFilter === "Danskere" && c.danish) ||
      (currentFilter === "Favoritter" && favorites.has(c.no));
    return filterOk && text.includes(q);
  });

  if(!list.length){
    grid.innerHTML = `<div class="emptyState">Ingen biler matcher filteret.</div>`;
    return;
  }

  grid.innerHTML = list.map(card).join("");
  document.querySelectorAll(".card").forEach(el => {
    el.addEventListener("click", () => {
      const c = CARS.find(x => x.no === el.dataset.no);
      modalContent.innerHTML = modalHtml(c);
      modal.classList.add("show");
    });
  });
}

document.querySelectorAll(".toolbar button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".toolbar button").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

search.addEventListener("input", render);

document.getElementById("closeModal").addEventListener("click", () => modal.classList.remove("show"));
modal.addEventListener("click", e => { if(e.target === modal) modal.classList.remove("show"); });

document.getElementById("classesBtn").addEventListener("click", () => classesModal.classList.add("show"));
document.getElementById("closeClassesModal").addEventListener("click", () => classesModal.classList.remove("show"));
classesModal.addEventListener("click", e => { if(e.target === classesModal) classesModal.classList.remove("show"); });

document.addEventListener("keydown", e => {
  if(e.key === "Escape"){
    modal.classList.remove("show");
    classesModal.classList.remove("show");
  }
});

loadData().catch(err => {
  grid.innerHTML = `<div class="error">Kunne ikke læse data.csv: ${esc(err.message)}</div>`;
});
