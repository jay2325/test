// Utilities
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

// Theme toggle
const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');
if(savedTheme === 'light') root.classList.add('light');
$('#themeToggle').addEventListener('click',()=>{
  root.classList.toggle('light');
  localStorage.setItem('theme', root.classList.contains('light')?'light':'dark');
});

// Year
$('#year').textContent = new Date().getFullYear();

// Load projects
const state = { projects: [], allTags: new Set(['all']) };

async function init(){
  try{
    const res = await fetch('data/projects.json');
    const json = await res.json();
    state.projects = json.projects || [];
    buildFilters();
    render('all','');
  }catch(e){
    console.error('Failed to load projects:', e);
    $('#grid').innerHTML = '<div class="sub">Could not load projects.json</div>';
  }
}

function buildFilters(){
  state.allTags = new Set(['all']);
  state.projects.forEach(p=> (p.tags||[]).forEach(t => state.allTags.add(t)));
  const sel = $('#filter'); sel.innerHTML='';
  [...state.allTags].forEach(tag=>{
    const opt = document.createElement('option');
    opt.value = tag; opt.textContent = tag.charAt(0).toUpperCase()+tag.slice(1);
    sel.appendChild(opt);
  });
  sel.addEventListener('change',()=>render(sel.value, $('#search').value.trim().toLowerCase()));
  $('#search').addEventListener('input', (e)=> render(sel.value, e.target.value.trim().toLowerCase()));
}

function render(tag, q){
  const grid = $('#grid'); grid.innerHTML='';
  const list = state.projects.filter(p=>{
    const tagOk = tag==='all' || (p.tags||[]).includes(tag);
    const qOk = !q || [p.title,p.brand,p.campaign,p.summary,(p.channels||[]).join(' ')].join(' ').toLowerCase().includes(q);
    return tagOk && qOk;
  });
  if(!list.length){ grid.innerHTML = `<div class="sub">No projects yet. Add them in data/projects.json.</div>`; return; }
  list.forEach(p=> grid.appendChild(card(p)));
}

function card(p){
  const el = document.createElement('article');
  el.className='card'; el.tabIndex=0; el.setAttribute('role','button');
  el.addEventListener('click',()=>openModal(p));
  el.addEventListener('keypress',e=>{ if(e.key==='Enter') openModal(p) });

  const t = document.createElement('div'); t.className='thumb';
  if(p.cover){ const img = document.createElement('img'); img.src=p.cover; img.alt=p.title+" cover"; img.loading='lazy'; t.appendChild(img); }
  else { t.textContent = p.brand || p.title; }

  const body = document.createElement('div'); body.className='card-body';
  const title = document.createElement('div'); title.className='title'; title.textContent=p.title;
  const sub = document.createElement('div'); sub.className='sub'; sub.textContent=[p.brand,p.year].filter(Boolean).join(' • ');
  const badges=document.createElement('div'); badges.className='badges';
  (p.badges||[]).forEach(b=>{ const span=document.createElement('span'); span.className='badge'; span.textContent=b; badges.appendChild(span); });

  body.appendChild(title); body.appendChild(sub); body.appendChild(badges);
  el.appendChild(t); el.appendChild(body);
  return el;
}

// Modal
const dlg = $('#projectModal');
dlg.querySelector('.close').addEventListener('click',()=>dlg.close());

function openModal(p){
  const media = $('#modalMedia'); media.innerHTML='';
  if(p.video){ const ifr = document.createElement('iframe'); ifr.src=p.video; ifr.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'; ifr.allowFullscreen=true; media.appendChild(ifr); }
  else if(p.image){ const img=document.createElement('img'); img.src=p.image; img.alt=p.title; media.appendChild(img); }
  else { media.innerHTML = '<div class="thumb">No media</div>'; }

  $('#modalTitle').textContent = p.title || '';
  $('#modalSubtitle').textContent = [p.brand,p.campaign].filter(Boolean).join(' • ');
  $('#modalSummary').textContent = p.summary || '';
  $('#modalRole').textContent = p.role || '';
  $('#modalYear').textContent = p.year || '';
  $('#modalChannels').textContent = (p.channels||[]).join(', ');

  const ul = $('#modalMetrics'); ul.innerHTML='';
  (p.metrics||[]).forEach(m=>{ const li=document.createElement('li'); li.textContent=m; ul.appendChild(li); });

  const ev = $('#modalEvidence'); ev.innerHTML='';
  if(p.evidence && p.evidence.url){ ev.innerHTML = `Evidence: <a target="_blank" rel="noopener" href="${p.evidence.url}">${p.evidence.label||'View report'}</a>`; }

  const tags = $('#modalTags'); tags.innerHTML='';
  (p.tags||[]).forEach(t=>{ const s=document.createElement('span'); s.className='tag'; s.textContent=t; tags.appendChild(s); });

  dlg.showModal();
}

init();
