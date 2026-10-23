const img = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=700&q=80`;
const I = ['1542291026-7eec264c27ff','1549298916-b41d501d3772','1460353581641-37baddab0fa2','1595950653106-6c9ebd614d3a','1606107557195-0e29a4b5b4aa','1491553895911-0055eca6402d','1600185365926-3a2ce3cdb9eb','1608231387042-66d1773070a5','1514989940723-e8e51635b782','1552346154-21d32810aba3'];
// n=nombre, p=precio, o=precio anterior (oferta), c=categoría, s=deporte, nw=novedad, i=imagen
const P = [
 {n:'Veloz Air Pro',p:549,c:'hombre',s:'Running',nw:1,i:0},{n:'Veloz Flex 3',p:329,o:399,c:'hombre',s:'Entrenamiento',i:1},
 {n:'Street Classic',p:289,c:'mujer',s:'Urbano',nw:1,i:2},{n:'Goal Elite',p:399,c:'hombre',s:'Fútbol',i:3},
 {n:'Trail Max',p:459,o:549,c:'hombre',s:'Montaña',i:4},{n:'Cloud Run W',p:429,c:'mujer',s:'Running',nw:1,i:5},
 {n:'Studio Lift',p:319,o:399,c:'mujer',s:'Gimnasio',i:6},{n:'Pulse Low',p:269,c:'mujer',s:'Urbano',i:7},
 {n:'Mini Racer',p:199,c:'ninos',s:'Running',nw:1,i:8},{n:'Kids Goal',p:179,o:229,c:'ninos',s:'Fútbol',i:9},
 {n:'Junior Street',p:189,c:'ninos',s:'Urbano',i:0},{n:'Tempo Elite',p:499,c:'hombre',s:'Running',nw:1,i:2},
 {n:'Breeze W',p:349,o:429,c:'mujer',s:'Running',i:1},{n:'Hoop High',p:379,c:'hombre',s:'Baloncesto',i:6},
 {n:'Mini Flex',p:159,o:199,c:'ninos',s:'Entrenamiento',i:5},{n:'Aura Platform',p:339,c:'mujer',s:'Urbano',nw:1,i:3}
].map((x, k) => ({...x, id: k}));
const TITLES = {todos:'Todo el calzado',novedades:'Novedades',hombre:'Hombre',mujer:'Mujer',ninos:'Niños',ofertas:'Ofertas'};
const $ = s => document.querySelector(s);
let filter = 'todos', cart = [];
try { cart = JSON.parse(localStorage.getItem('veloz-cart')) || []; } catch (e) {}

function render() {
  const q = $('#search').value.trim().toLowerCase();
  const list = P.filter(x => (filter === 'todos' || (filter === 'novedades' ? x.nw : filter === 'ofertas' ? x.o : x.c === filter))
    && (x.n + ' ' + x.s).toLowerCase().includes(q));
  $('#shopTitle').textContent = TITLES[filter];
  $('#count').textContent = list.length + ' productos';
  $('#grid').classList.toggle('grid--featured', filter === 'todos' && !q);
  $('#grid').innerHTML = list.length ? list.map(x => `
    <article class="card">
      <div class="card__img"><img src="${img(I[x.i])}" alt="${x.n}" loading="lazy">
        ${x.nw ? '<span class="tag">Nuevo</span>' : ''}${x.o ? `<span class="tag tag--sale">-${Math.round(100 - x.p / x.o * 100)}%</span>` : ''}
        <button class="card__add" data-id="${x.id}">Agregar al carrito</button></div>
      <div class="card__info"><h3>${x.n}</h3><p>${x.s} · ${x.c === 'ninos' ? 'Niños' : x.c[0].toUpperCase() + x.c.slice(1)}</p>
        <strong>S/ ${x.p} ${x.o ? `<s>S/ ${x.o}</s>` : ''}</strong></div>
    </article>`).join('') : '<p class="empty">No encontramos productos. Prueba con otra búsqueda.</p>';
  document.querySelectorAll('.card__img img').forEach(im => im.addEventListener('error', () => { im.parentElement.classList.add('noimg'); im.remove(); }));
  document.querySelectorAll('#chips button').forEach(b => b.classList.toggle('is-on', b.dataset.f === filter));
}
function applyHash() {
  const h = location.hash.slice(1);
  if (TITLES[h]) { filter = h; render(); $('#tienda').scrollIntoView({behavior: 'smooth'}); }
  $('#menu-toggle').checked = false;
}
function saveCart() {
  try { localStorage.setItem('veloz-cart', JSON.stringify(cart)); } catch (e) {}
  const n = cart.reduce((a, x) => a + x.q, 0), total = cart.reduce((a, x) => a + x.q * P[x.id].p, 0);
  const badge = $('#cartCount'); badge.textContent = n; badge.classList.remove('pop'); void badge.offsetWidth; badge.classList.add('pop');
  $('#cartTotal').textContent = 'S/ ' + total;
  $('#cartItems').innerHTML = cart.length ? cart.map(x => `
    <div class="line"><img src="${img(I[P[x.id].i])}" alt="" onerror="this.style.visibility='hidden'">
      <div><h4>${P[x.id].n}</h4><p>S/ ${P[x.id].p}</p>
        <div class="qty"><button data-d="-1" data-id="${x.id}">−</button><span>${x.q}</span><button data-d="1" data-id="${x.id}">+</button></div></div>
      <button class="icon-btn" data-rm="${x.id}" aria-label="Quitar">🗑</button></div>`).join('') : '<p class="empty">Tu carrito está vacío.</p>';
}
const toggleCart = open => { $('#drawer').classList.toggle('is-open', open); $('#overlay').classList.toggle('is-open', open); };

$('#grid').addEventListener('click', e => {
  const b = e.target.closest('.card__add'); if (!b) return;
  const id = +b.dataset.id, it = cart.find(x => x.id === id);
  it ? it.q++ : cart.push({id, q: 1}); saveCart(); toggleCart(true);
});
$('#cartItems').addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.rm) cart = cart.filter(x => x.id != t.dataset.rm);
  if (t.dataset.d) { const it = cart.find(x => x.id == t.dataset.id); it.q += +t.dataset.d; cart = cart.filter(x => x.q > 0); }
  saveCart();
});
$('#chips').addEventListener('click', e => { if (e.target.dataset.f) location.hash = e.target.dataset.f; });
$('#search').addEventListener('input', render);
$('#searchBtn').addEventListener('click', () => { $('#tienda').scrollIntoView({behavior: 'smooth'}); setTimeout(() => $('#search').focus(), 400); });
$('#cartBtn').addEventListener('click', () => toggleCart(true));
$('#closeCart').addEventListener('click', () => toggleCart(false));
$('#overlay').addEventListener('click', () => toggleCart(false));
$('#checkout').addEventListener('click', () => { if (cart.length) { alert('¡Gracias por tu compra! (demo académica)'); cart = []; saveCart(); toggleCart(false); } });
window.addEventListener('hashchange', applyHash);
render(); saveCart(); if (location.hash) applyHash();

// ===== Carrusel del hero =====
(() => {
  const slides = [...document.querySelectorAll('.slide')], dots = $('#dots');
  let cur = 0, timer;
  dots.innerHTML = slides.map((_, k) => `<button aria-label="Ir a la diapositiva ${k + 1}"></button>`).join('');
  const go = n => {
    cur = (n + slides.length) % slides.length;
    slides.forEach((s, k) => {
      s.classList.toggle('is-active', k === cur);
      const v = s.querySelector('video');
      if (v) { k === cur ? v.play().catch(() => {}) : v.pause(); }
    });
    [...dots.children].forEach((d, k) => d.classList.toggle('is-on', k === cur));
  };
  const stop = () => clearInterval(timer);
  const start = () => { stop(); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => go(cur + 1), 6000); };
  const move = n => { go(n); start(); };
  // Si no existe video/hero.mp4 se muestra solo la imagen de fondo
  document.querySelectorAll('.slide video').forEach(v => {
    const drop = () => v.remove();
    v.querySelector('source').addEventListener('error', drop);
    if (v.networkState === 3) drop();
  });
  dots.addEventListener('click', e => { const k = [...dots.children].indexOf(e.target); if (k > -1) move(k); });
  $('#prev').addEventListener('click', () => move(cur - 1));
  $('#next').addEventListener('click', () => move(cur + 1));
  const hero = $('.hero'); let x0 = 0;
  hero.addEventListener('mouseenter', stop); hero.addEventListener('mouseleave', start);
  hero.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; stop(); }, {passive: true});
  hero.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - x0; Math.abs(dx) > 50 ? move(cur + (dx < 0 ? 1 : -1)) : start(); });
  go(0); start();
})();
