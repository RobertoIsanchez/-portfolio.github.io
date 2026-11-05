/* Portafolio dinámico. Todo el contenido vive en projects.json.
   Cada campo y cada bloque es opcional: si lo borras, simplemente no se muestra. */
(() => {
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const list = x => Array.isArray(x) ? x : [];
  const has = x => typeof x === "string" && x.trim() !== "";
  const safe = (name, fn) => { try { return fn() || ""; } catch (e) { console.warn("Bloque omitido:", name, e); return ""; } };
  let DATA = {}, lastFocus;

  const ICONS = {
    video:'<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M10 9.5v5l4.5-2.5z"/>',
    motion:'<circle cx="6" cy="17" r="2.5"/><circle cx="18" cy="7" r="2.5"/><path d="M8.5 17c6 0 3-10 7-10"/>',
    design:'<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
    retouch:'<rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="9" cy="10" r="2"/><path d="M3 17l5-4 4 3 3-3 6 5"/>',
    ar:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12L4 7.5M12 12v9"/>',
    cube:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12L4 7.5M12 12v9"/>',
    audio:'<path d="M4 11v2M8 8v8M12 4v16M16 8v8M20 11v2"/>',
    spark:'<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.3"/><path d="M17 14c2.5 0 4 2 4 4.5"/>',
    check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    bolt:'<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',
    layers:'<path d="M12 4l9 5-9 5-9-5z"/><path d="M3 14l9 5 9-5"/>',
    chat:'<path d="M4 5h16v11H9l-5 4z"/>'
  };
  /* Un ícono puede ser un nombre integrado (video, motion...) o la ruta a tu propio archivo (.svg/.png) */
  const iconHTML = ic => /[\/.]/.test(ic || "")
    ? `<img src="${esc(ic)}" alt="">`
    : `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[ic] || ICONS.design}</svg>`;

  /* ---------- Links de video: Dropbox, YouTube, Vimeo o archivo directo ---------- */
  function media(raw){
    try{
      const u = new URL(raw), h = u.hostname.replace(/^www\./,"");
      if (h.includes("dropbox.com")){ u.searchParams.delete("dl"); u.searchParams.set("raw","1"); return {type:"file", src:u.href}; }
      if (h === "youtu.be" || h.includes("youtube.com")){
        const id = h === "youtu.be" ? u.pathname.slice(1) : (u.searchParams.get("v") || u.pathname.split("/").pop());
        return {type:"embed", src:`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`, poster:`https://img.youtube.com/vi/${id}/hqdefault.jpg`};
      }
      if (h.includes("vimeo.com")){
        const id = u.pathname.split("/").filter(Boolean).pop();
        return {type:"embed", src:`https://player.vimeo.com/video/${id}?autoplay=1`};
      }
    }catch(e){}
    return {type:"file", src:raw};
  }

  /* ---------- Pestañas ---------- */
  function renderTabs(){
    const items = [{id:"inicio", label:"Inicio"}, ...list(DATA.sections).filter(s => s && s.id)];
    $("#tabs").innerHTML = items.map(s => `<button class="tab" data-id="${esc(s.id)}">${esc(s.label || s.id)}${s.status==="soon"?"<small>pronto</small>":""}</button>`).join("");
    $("#tabs").onclick = e => { const b = e.target.closest(".tab"); if (b) location.hash = b.dataset.id; };
  }

  /* ---------- Inicio (cada bloque es independiente) ---------- */
  const firstReady = () => list(DATA.sections).find(s => s.status === "ready") || list(DATA.sections)[0];

  function blkHero(){
    const p = DATA.profile; if (!p) return "";
    const f = firstReady();
    return `<div class="hero grain"><div class="hero-g">
      <div class="hero-txt">
        ${has(p.role) ? `<p class="hero-role">${esc(p.role)}</p>` : ""}
        <h1>${has(p.firstName) ? `<span>${esc(p.firstName)}</span>` : ""}${has(p.lastName) ? `<span class="l2">${esc(p.lastName)}.</span>` : ""}</h1>
        ${has(p.tagline) ? `<div class="bar">${esc(p.tagline)}</div>` : ""}
        ${has(p.intro) ? `<p>${esc(p.intro)}</p>` : ""}
        ${f ? `<a class="btn" href="#${esc(f.id)}">Ver mi trabajo</a>` : ""}
      </div>
      <div class="hero-art">${has(p.heroImage) ? `<div class="photo"><img src="${esc(p.heroImage)}" alt="Retrato">${safe("badge",blkBadge)}${safe("burbujas",blkBubbles)}</div>` : ""}${has(p.location) ? `<span class="city">${esc(p.location)}</span>` : ""}</div>
    </div></div>`;
  }

  /* Badge "Open to work" sobre la foto */
 function blkBadge(){
  const p = DATA.profile || {}; if (!has(p.badge)) return "";
  return `<a class="badge" href="#contacto" data-go="contacto">${esc(p.badge)}</a>`;
}

  /* Burbujas de skills que aparecen una por una alrededor de la foto */
  const SLOTS = [["right",2,38],["left",2,48],["right",0,56],["left",0,64],["right",4,74],["left",4,82]];
  function blkBubbles(){
    const items = list(DATA.heroBubbles && DATA.heroBubbles.items); if (!items.length) return "";
    return `<div class="bubbles">${items.map((it, i) => {
      const o = typeof it === "string" ? {text: it} : (it || {});
      const sl = SLOTS[i % SLOTS.length];
      const side = o.side === "left" || o.side === "right" ? o.side : sl[0];
      const x = Number.isFinite(o.x) ? o.x : sl[1], y = Number.isFinite(o.y) ? o.y : sl[2];
      return `<div class="bub" style="${side}:${x}%;top:${y}%"><span style="--d:${(i * 0.7).toFixed(1)}s">${iconHTML(o.icon || "spark")}${esc(o.text)}</span></div>`;
    }).join("")}</div>`;
  }

  let bubTimers = [];
  function runBubbles(){
    bubTimers.forEach(clearTimeout); bubTimers = [];
    const els = [...document.querySelectorAll(".bub")]; if (!els.length) return;
    const hb = DATA.heroBubbles || {};
    const delay = Number.isFinite(hb.delay) ? hb.delay : 1200, gap = Number.isFinite(hb.interval) ? hb.interval : 900;
    const calm = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    els.forEach(b => b.classList.remove("show"));
    els.forEach((b, i) => calm ? b.classList.add("show") : bubTimers.push(setTimeout(() => b.classList.add("show"), delay + i * gap)));
  }

  function blkBrands(){
    const b = list(DATA.brands); if (!b.length) return "";
    const logos = b.map(x => `<li>${has(x.logo) ? `<img src="${esc(x.logo)}" alt="${esc(x.name)}" loading="lazy">` : `<span class="nm">${esc(x.name)}</span>`}</li>`).join("");
    return `<div class="brands">${has(DATA.brandsTitle) ? `<h2>${esc(DATA.brandsTitle)}</h2>` : ""}<ul class="track" style="padding:0">${logos}${logos}</ul></div>`;
  }

  function blkAbout(){
    const a = DATA.about; if (!a) return "";
    const head = list(a.headline), txt = list(a.text), st = list(a.stats);
    if (!head.length && !txt.length && !st.length) return "";
    return `<div class="about grain">
      <div class="about-l">${head.length ? `<h2>${head.map(h=>`<span>${esc(h)}</span>`).join("")}</h2>` : ""}<div>${txt.map(t=>`<p>${esc(t)}</p>`).join("")}</div></div>
      ${st.length ? `<div class="about-r">${st.map(s=>`<div><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join("")}</div>` : ""}
    </div>`;
  }

  function blkExpertise(){
    const ex = list(DATA.expertise), cv = list(DATA.experience);
    if (!ex.length && !cv.length) return "";
    return `<div class="exp grain"><div class="in">
      ${ex.length ? `${has(DATA.expertiseTitle) ? `<h2>${esc(DATA.expertiseTitle)}</h2>` : ""}
      <div class="exp-g">${ex.map(x=>`<article><div class="ico">${iconHTML(x.icon)}</div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article>`).join("")}</div>` : ""}
      ${cv.length ? `<div class="cv">${cv.map(x=>`<div><time>${esc(x.year)}</time><h3>${esc(x.role)}</h3><p>${esc(x.place)}</p></div>`).join("")}</div>` : ""}
    </div></div>`;
  }

  function blkTools(){
    const t = DATA.tools, items = list(t && t.items); if (!items.length) return "";
    return `<div class="tools"><div class="in">
      ${has(t.title) ? `<h2>${esc(t.title)}</h2>` : ""}
      <div class="tools-g">${items.map(x => `<div class="tool">${has(x.icon)
        ? `<div class="tile img"><img src="${esc(x.icon)}" alt="" loading="lazy"></div>`
        : `<div class="tile">${esc(x.short || String(x.name || "").slice(0,2))}</div>`}<span>${esc(x.name)}</span></div>`).join("")}</div>
    </div></div>`;
  }

  function blkCta(){
    const c = DATA.cta; if (!c || !has(c.title)) return "";
    return `<div class="band"><div class="in"><h2>${esc(c.title)}</h2><a class="btn" href="#contacto" data-go="contacto">${esc(c.button || "Contáctame")}</a></div></div>`;
  }

  /* Orden del inicio: se controla con "homeOrder" en projects.json.
     Los bloques que no aparezcan en la lista no se muestran. */
  const BLOCKS = {hero:blkHero, brands:blkBrands, about:blkAbout, expertise:blkExpertise, tools:blkTools, cta:blkCta};
  const DEFAULT_ORDER = ["hero","brands","about","expertise","tools","cta"];
  const homeView = () => {
    const order = list(DATA.homeOrder).length ? DATA.homeOrder : DEFAULT_ORDER;
    return `<section class="view" id="v-inicio" hidden>${order.filter(k => BLOCKS[k]).map(k => safe(k, BLOCKS[k])).join("")}</section>`;
  };

  /* ---------- Secciones de trabajo ---------- */
  function sectionView(s){
    if (!s || !s.id) return "";
    const items = list(DATA.projects).filter(p => p.section === s.id);
    const f = list(DATA.sections).find(x => x.status === "ready" && x.id !== s.id);
    let body;
    if (s.status === "soon" && !items.length){
      body = `<div class="soon"><i></i><h3>En desarrollo</h3><p>Pronto estarán listas.${f ? ` Mientras tanto, mira mi trabajo de ${esc((f.label||"").toLowerCase())}.` : ""}</p>${f ? `<a class="btn" href="#${esc(f.id)}">Ir a ${esc(f.label)}</a>` : ""}</div>`;
    } else if (!items.length){
      body = `<p class="empty">Aún no hay proyectos en esta sección. Agrégalos en projects.json.</p>`;
    } else {
      body = `<div class="grid">${items.map(p => {
        const m = media(p.url || "");
        const t = has(p.thumb) ? `<img src="${esc(p.thumb)}" alt="" loading="lazy">` : m.poster ? `<img src="${esc(m.poster)}" alt="" loading="lazy">` : `<video src="${esc(m.src)}#t=0.5" preload="metadata" muted playsinline tabindex="-1"></video>`;
        return `<button class="card${p.vertical?" v":""}" data-i="${DATA.projects.indexOf(p)}"><div class="thumb">${t}<div class="play"><span></span></div></div><h3>${esc(p.title)}</h3>${has(p.description)?`<p>${esc(p.description)}</p>`:""}${has(p.year)?`<span class="yr">${esc(p.year)}</span>`:""}</button>`;
      }).join("")}</div>`;
    }
    return `<section class="view" id="v-${esc(s.id)}" hidden><div class="sec-head grain"><div class="in"><h2>${esc(s.label || s.id)}</h2>${has(s.description)?`<p>${esc(s.description)}</p>`:""}</div></div>${body}</section>`;
  }

  /* ---------- Navegación por hash ---------- */
  function route(){
    const id = location.hash.slice(1) || "inicio";
    if (id === "contacto") return;
    const ok = document.getElementById("v-" + id) ? id : "inicio";
    document.querySelectorAll(".view").forEach(v => v.hidden = v.id !== "v-" + ok);
    if (ok === "inicio") runBubbles();
    document.querySelectorAll(".tab").forEach(t => t.dataset.id === ok ? t.setAttribute("aria-current","page") : t.removeAttribute("aria-current"));
    const act = document.querySelector(".tab[aria-current]"); if (act) act.scrollIntoView({inline:"center", block:"nearest"});
    window.scrollTo({top:0});
  }

  /* ---------- Menú burger y footer (solo muestran lo que exista) ---------- */
  const drawer = $("#drawer"), burger = $("#burger");
  function menu(open){
    drawer.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.body.style.overflow = open ? "hidden" : "";
  }
  const toContact = e => { e.preventDefault(); menu(false); $("#contacto").scrollIntoView({behavior:"smooth"}); };

  function renderLinks(){
    const p = DATA.profile || {};
    const ext = [["Behance",p.behance],["Instagram",p.instagram]].filter(([,u]) => has(u));
    $("#drawer-nav").innerHTML = ext.map(([n,u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${n}</a>`).join("") + `<a href="#contacto" data-go="contacto">Contacto</a>`;
    const foot = [];
    if (has(p.email)) foot.push([p.email, "mailto:" + p.email]);
    if (has(p.phone)) foot.push([p.phone, "tel:+52" + p.phone.replace(/\D/g,"")]);
    ext.forEach(([n,u]) => foot.push([n,u,true]));
    $("#f-links").innerHTML = foot.map(([t,u,blank]) => `<li><a href="${esc(u)}"${blank?' target="_blank" rel="noopener"':""}>${esc(t)}</a></li>`).join("");
    $("#f-title").innerHTML = `${esc(has(p.footerTitle) ? p.footerTitle : "¿Tienes un proyecto?")}${has(p.footerAccent) ? ` <span>${esc(p.footerAccent)}</span>` : ""}`;
    $("#copy").textContent = `© ${new Date().getFullYear()} ${[p.firstName,p.lastName].filter(has).join(" ")}`.trim();
  }
  burger.onclick = () => menu(!drawer.classList.contains("open"));
  drawer.onclick = e => { if (e.target.closest("[data-go=contacto]")) return toContact(e); if (e.target === drawer || e.target.closest("a")) menu(false); };

  /* ---------- Reproductor ---------- */
  const modal = $("#modal"), stage = $("#stage");
  function openPlayer(i){
    const p = DATA.projects[i]; if (!p) return;
    const m = media(p.url || "");
    lastFocus = document.activeElement;
    stage.innerHTML = m.type === "embed"
      ? `<iframe src="${esc(m.src)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="${esc(p.title)}"></iframe>`
      : `<video src="${esc(m.src)}" controls autoplay playsinline controlsList="nodownload"></video>`;
    modal.classList.toggle("v", !!p.vertical && m.type === "file");
    $("#m-title").textContent = p.title || ""; $("#m-desc").textContent = p.description || "";
    modal.classList.add("open"); document.body.style.overflow = "hidden"; $("#close").focus();
  }
  function closePlayer(){
    modal.classList.remove("open"); stage.innerHTML = ""; document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  $("#close").onclick = closePlayer;
  modal.onclick = e => { if (e.target === modal) closePlayer(); };
  document.addEventListener("keydown", e => { if (e.key === "Escape"){ closePlayer(); menu(false); } });
  $("#main").addEventListener("click", e => {
    if (e.target.closest("[data-go=contacto]")) return toContact(e);
    const c = e.target.closest(".card"); if (c) openPlayer(+c.dataset.i);
  });

  /* ---------- Carga ---------- */
  fetch("projects.json", {cache:"no-cache"})
    .then(r => { if (!r.ok) throw new Error("No se encontró projects.json"); return r.json(); })
    .then(d => {
      DATA = d || {};
      const p = DATA.profile || {};
      const nm = [p.firstName, p.lastName].filter(has).join(" ");
      if (nm) document.title = `${nm} | Edición de video, motion y diseño`;
      $("#main").innerHTML = homeView() + list(DATA.sections).map(s => safe("sección " + (s && s.id), () => sectionView(s))).join("");
      const lg = $(".logo");
      if (has(p.logo)){
        const img = new Image();
        img.alt = nm || "Logo";
        img.onload = () => { lg.textContent = ""; lg.classList.add("has-img"); lg.appendChild(img); };
        img.src = p.logo; /* si el archivo no existe, se queda el placeholder */
      }
      renderTabs(); renderLinks(); route();
      window.addEventListener("hashchange", route);
    })
    .catch(err => {
      console.error(err);
      $("#main").innerHTML = `<p class="empty">No se pudo cargar projects.json (${esc(err.message)}). Revisa que el JSON no tenga comas de más o de menos (puedes validarlo en jsonlint.com). Si abriste index.html con doble clic, usa un servidor local como Live Server de VS Code, o súbelo a GitHub Pages.</p>`;
    });
})();
