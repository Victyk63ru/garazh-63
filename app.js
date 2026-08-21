const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const APP = $('#app');

const DEFAULT_STATE = {
  session: null,
  profiles: [],
  role: 'child',
  child: { name:'Миша', age:12, group:'Группа 2', level:3, xp:420, xpNext:600 },
  project: { title:'Кормушка для птиц', progress:70, status:'В процессе', likes:24, comments:6 },
  steps: [
    {id:'s1', title:'Чертёж и разметка', status:'done'},
    {id:'s2', title:'Резка деталей', status:'done'},
    {id:'s3', title:'Сборка', status:'current'},
    {id:'s4', title:'Шлифовка', status:'todo'},
    {id:'s5', title:'Покраска', status:'todo'}
  ],
  tasks: [
    {id:'t1', title:'Проверь инструменты перед началом', desc:'Убедись, что пила, шуруповёрт и рулетка на месте и исправны.', done:true},
    {id:'t2', title:'Собери каркас кормушки', desc:'Скрути четыре стойки саморезами по чертежу. Проверяй уголником прямые углы.', done:false},
    {id:'t3', title:'Убери рабочее место после занятия', desc:'Верни инструменты в ящик, смети опилки со стола.', done:false}
  ],
  achievements: [
    {id:'a1', name:'Первый проект', icon:'project', earned:true, date:'2 апр'},
    {id:'a2', name:'Первый инструмент', icon:'tool', earned:true, date:'5 апр'},
    {id:'a3', name:'Сделал самостоятельно', icon:'star', earned:true, date:'20 апр'},
    {id:'a4', name:'10 занятий', icon:'calendar', earned:true, date:'5 мая'},
    {id:'a5', name:'Хозяин рабочего места', icon:'broom', earned:false, date:null},
    {id:'a6', name:'Столяр', icon:'hammer', earned:false, date:null}
  ],
  customTasks: []
};

const STORAGE_KEY='garazh2-state-v1';
function loadState(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    return saved ? deepMerge(structuredClone(DEFAULT_STATE), saved) : structuredClone(DEFAULT_STATE);
  }catch(e){ console.warn(e); return structuredClone(DEFAULT_STATE); }
}
function deepMerge(base, patch){
  if(!patch || typeof patch!=='object') return base;
  for(const [k,v] of Object.entries(patch)){
    if(Array.isArray(v)) base[k]=v;
    else if(v && typeof v==='object' && base[k] && typeof base[k]==='object') base[k]=deepMerge(base[k],v);
    else base[k]=v;
  }
  return base;
}
let state=loadState();
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function setState(fn){ fn(state); save(); render(); }
function toast(msg){ const el=$('#toast'); el.textContent=msg; el.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove('show'),2200); }

const ICONS={
  home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V21h14V10.5"/><path d="M9 21v-6h6v6"/>',
  project:'<path d="M4 20V8l8-5 8 5v12"/><path d="M7 20v-8h10v8M4 20h16M9 12h6"/>',
  book:'<path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22z"/><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22z"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
  trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M12 13v4M8 21h8M9 17h6"/><path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  chevron:'<path d="m9 18 6-6-6-6"/>',
  back:'<path d="m15 18-6-6 6-6"/>',
  more:'<circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/>',
  hammer:'<path d="m14 5 5 5M12 7l5-5 5 5-5 5M3 21l10-10 3 3L6 24z"/>',
  saw:'<path d="M3 18 15 6l6 6-12 9z"/><path d="m8 17 1 2m2-5 1 2m2-5 1 2"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
  camera:'<rect x="3" y="7" width="18" height="13" rx="3"/><path d="m8 7 1.5-3h5L16 7"/><circle cx="12" cy="13" r="3"/>',
  clipboard:'<path d="M9 5h6M9 3h6v4H9z"/><rect x="5" y="5" width="14" height="17" rx="2"/><path d="M8 11h8M8 15h8M8 19h5"/>',
  chart:'<path d="M4 20V10M10 20V5M16 20v-8M22 20H2"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.5 4a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.38.3.73.66 1 1 .24.31.47.67.6 1.1H21v4h-.1a1.7 1.7 0 0 0-1.5 1.1z"/>',
  people:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0M14 15a5 5 0 0 1 7 5"/>',
  message:'<path d="M4 4h16v12H9l-5 4z"/>',
  qr:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 19v2M19 14h2v2"/>',
  lightbulb:'<path d="M9 18h6M10 22h4"/><path d="M8.5 15.5A6 6 0 1 1 15.5 15.5c-.9.7-1.5 1.4-1.5 2.5h-4c0-1.1-.6-1.8-1.5-2.5z"/>',
  star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"/>',
  broom:'<path d="m15 3-5 11M8 13l7 3-4 5-8-3z"/>',
  tool:'<path d="M14 6a4 4 0 0 0-5 5L3 17l4 4 6-6a4 4 0 0 0 5-5l-3 3-4-4z"/>',
  logout:'<path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9"/>'
};
function icon(name, cls=''){ return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||ICONS.tool}</svg>`; }

const CHILD_NAV=[
  {route:'#/child/home',label:'Главная',icon:'home'},
  {route:'#/child/projects',label:'Проекты',icon:'project'},
  {route:'#/child/create',label:'',icon:'plus',plus:true},
  {route:'#/child/lessons',label:'Уроки',icon:'book'},
  {route:'#/child/profile',label:'Профиль',icon:'user'}
];
const PARENT_NAV=[
  {route:'#/parent/home',label:'Главная',icon:'home'},
  {route:'#/parent/projects',label:'Проекты',icon:'project'},
  {route:'#/parent/messages',label:'Сообщения',icon:'message'},
  {route:'#/parent/settings',label:'Настройки',icon:'gear'}
];
const MASTER_NAV=[
  {route:'#/master/home',label:'Группа',icon:'people'},
  {route:'#/master/projects',label:'Проекты',icon:'project'},
  {route:'#/master/messages',label:'Сообщения',icon:'message'},
  {route:'#/master/more',label:'Ещё',icon:'more'}
];

function route(){ return location.hash || (state.session ? `#/${state.session.role}/home` : '#/welcome'); }
function go(r){ location.hash=r; }
function roleFromRoute(r){ return r.split('/')[1] || state.session?.role || 'child'; }
function navForRole(role){ return role==='parent'?PARENT_NAV:role==='master'?MASTER_NAV:CHILD_NAV; }
function isActiveRoute(current,item){
  if(item.plus) return false;
  if(item.route.includes('/projects')) return current.includes('/project') || current.includes('/portfolio');
  if(item.route.includes('/lessons')) return current.includes('/lesson');
  return current===item.route;
}

function shell(content,{title='',back=null,role=null,avatar=true}={}){
  role=role||roleFromRoute(route());
  const nav=navForRole(role);
  return `<div class="app-shell with-rail">
    ${rail(nav)}
    <header class="topbar">
      <div class="topbar-title">
        ${back?`<button class="icon-btn" data-go="${back}" aria-label="Назад">${icon('back')}</button>`:avatar?`<div class="avatar" aria-hidden="true"></div>`:''}
        <strong>${title}</strong>
      </div>
      <button class="icon-btn" data-action="notifications" aria-label="Уведомления">${icon('bell')}</button>
    </header>
    <main><div class="content">${content}</div></main>
    ${bottomNav(nav)}
  </div>`;
}
function rail(nav){ return `<aside class="rail"><img src="./logo.svg" class="rail-logo" alt="Гараж"/>${nav.map(n=>navButton(n,true)).join('')}<div class="rail-spacer"></div><button class="nav-item" data-action="logout">${icon('logout')}<span>Выйти</span></button></aside>`; }
function bottomNav(nav){
  const current=route();
  let html=`<nav class="bottom-nav" aria-label="Основная навигация" style="grid-template-columns:repeat(${nav.length},1fr)">`;
  html+=nav.map(n=>{
    if(n.plus) return `<button class="nav-item" data-action="quick-add" aria-label="Добавить"><span class="nav-plus">${icon('plus')}</span></button>`;
    return `<button class="nav-item ${isActiveRoute(current,n)?'active':''}" data-go="${n.route}">${icon(n.icon)}<span>${n.label}</span></button>`;
  }).join('');
  // 4-item adult/master need balanced nav, not forced 5
  html+='</nav>';
  return html;
}
function navButton(n,railMode=false){
  if(n.plus) return `<button class="nav-item" data-action="quick-add">${icon('plus')}<span>Добавить</span></button>`;
  return `<button class="nav-item ${isActiveRoute(route(),n)?'active':''}" data-go="${n.route}">${icon(n.icon)}<span>${n.label}</span></button>`;
}

function render(){
  const r=route();
  document.documentElement.dataset.route=r;
  if(!state.session && !['#/welcome','#/login','#/register','#/qr'].includes(r)) return go('#/welcome');
  const pages={
    '#/welcome':welcomePage,
    '#/login':loginPage,
    '#/register':registerPage,
    '#/qr':qrPage,
    '#/child/home':childHome,
    '#/child/projects':childProjects,
    '#/child/project':childProject,
    '#/child/lessons':childLessons,
    '#/child/lesson':childLesson,
    '#/child/achievements':childAchievements,
    '#/child/portfolio':childPortfolio,
    '#/child/profile':childProfile,
    '#/child/day':childDay,
    '#/child/create':childCreate,
    '#/parent/home':parentHome,
    '#/parent/projects':parentProjects,
    '#/parent/messages':parentMessages,
    '#/parent/settings':parentSettings,
    '#/master/home':masterHome,
    '#/master/projects':masterProjects,
    '#/master/messages':masterMessages,
    '#/master/more':masterMore
  };
  const fn=pages[r]||notFound;
  APP.innerHTML=fn();
  bindPage();
}

function welcomePage(){
  return `<main class="auth-page"><section class="auth-card page">
    <img src="./logo.svg" class="auth-logo" alt="Гараж — мастерская"/>
    <div class="auth-intro"><div class="eyebrow">Вход в приложение</div><h1 class="h2" style="margin-top:5px">Делаем руками. Учимся. Исправляем.</h1><p class="body">Проекты, реальные навыки и история роста в мастерской.</p></div>
    <div class="stack">
      <button class="btn primary" data-go="#/qr">${icon('qr')} Войти по QR-коду</button>
      <button class="btn secondary" data-go="#/login">Войти по коду</button>
    </div>
    <div class="eyebrow" style="text-align:center;margin-top:20px;color:#77716b">Выберите роль для демо</div>
    <div class="roles" id="demoRoles">
      ${roleCard('child','Ребёнок',true)}${roleCard('parent','Родитель')}${roleCard('master','Мастер')}
    </div>
    <button class="btn ghost" style="width:100%;margin-top:10px" data-action="demo-enter">Открыть демо</button>
    <div class="auth-links"><button class="link-btn" data-go="#/register">Создать профиль</button><button class="link-btn" data-action="install-help">Как установить</button></div>
  </section></main>`;
}
function roleCard(role,label,selected=false){ return `<button class="role-card ${selected?'selected':''}" data-role="${role}"><span class="role-face"></span><strong>${label}</strong></button>`; }
function loginPage(){
  return `<main class="auth-page"><section class="auth-card page"><button class="icon-btn" data-go="#/welcome">${icon('back')}</button>
    <div class="auth-intro"><div class="eyebrow">Вход по коду</div><h1 class="h2" style="margin-top:5px">Введите код мастерской</h1><p class="body">Для теста подойдёт код <b>1234</b>.</p></div>
    <form id="loginForm" class="stack">
      <div class="field"><label for="code">Код</label><input id="code" class="input" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="Например, 1234" required></div>
      <div class="field"><label>Роль</label><select id="loginRole" class="input"><option value="child">Ребёнок</option><option value="parent">Родитель</option><option value="master">Мастер</option></select></div>
      <button class="btn primary" type="submit">Войти</button>
    </form>
    <div class="auth-links"><button class="link-btn" data-go="#/register">Нет профиля? Создать</button></div>
  </section></main>`;
}
function registerPage(){
  return `<main class="auth-page"><section class="auth-card page"><button class="icon-btn" data-go="#/welcome">${icon('back')}</button>
    <div class="auth-intro"><div class="eyebrow">Локальная регистрация</div><h1 class="h2" style="margin-top:5px">Создать профиль</h1><p class="body">Пока профиль хранится только на этом устройстве. Синхронизацию подключим через сервер.</p></div>
    <form id="registerForm" class="stack">
      <div class="field"><label for="regName">Имя</label><input id="regName" class="input" placeholder="Имя" required></div>
      <div class="field"><label for="regRole">Роль</label><select id="regRole" class="input"><option value="child">Ребёнок</option><option value="parent">Родитель</option><option value="master">Мастер</option></select></div>
      <div class="field"><label for="regCode">Код входа</label><input id="regCode" class="input" inputmode="numeric" maxlength="8" placeholder="4–8 цифр" required></div>
      <button class="btn primary" type="submit">Создать и войти</button>
    </form>
  </section></main>`;
}
function qrPage(){
  return `<main class="auth-page"><section class="auth-card page"><button class="icon-btn" data-go="#/welcome">${icon('back')}</button>
    <div class="auth-intro"><div class="eyebrow">QR-вход</div><h1 class="h2" style="margin-top:5px">Наведите камеру на код</h1><p class="body">Работает в браузерах с поддержкой распознавания QR. Если камера недоступна — используйте код.</p></div>
    <div class="qr-frame"><video id="qrVideo" muted playsinline></video><div class="qr-scanline"></div></div>
    <div id="qrStatus" class="small muted" style="text-align:center;margin:10px 0 14px">Камера ещё не запущена.</div>
    <div class="stack"><button class="btn primary" data-action="start-qr">Включить камеру</button><button class="btn secondary" data-go="#/login">Войти по коду</button></div>
  </section></main>`;
}

function childHome(){
  const p=state.project,c=state.child;
  return shell(`<div class="page">
    <div class="hello"><div class="hello-left"><div class="avatar"></div><div><div class="small muted">Привет,</div><div class="h2">${escapeHtml(c.name)}!</div></div></div><div class="notification"><button class="icon-btn" data-action="notifications">${icon('bell')}</button><span class="notification-dot"></span></div></div>
    <div class="home-layout">
      <section>
        <article class="card current-project clickable" data-go="#/child/project">
          <div class="project-copy"><div class="eyebrow">Текущий проект</div><h2 class="h2" style="margin-top:4px">${p.title}</h2><div class="progress-row"><div class="progress-track"><div class="progress-fill" style="width:${p.progress}%"></div></div><div class="progress-value">${p.progress}%</div></div></div>
          <div class="project-art"><img src="./birdhouse-sketch.svg" alt="Эскиз кормушки для птиц"></div>
          <div class="card-footer"><span class="badge">В процессе</span><b class="small" style="color:var(--orange)">Продолжить →</b></div>
        </article>
      </section>
      <section class="section">
        <div class="section-head"><h2 class="h3">Мастерская</h2><button class="link-btn" data-go="#/child/portfolio">Портфолио</button></div>
        <div class="quick-grid">
          ${quick('project','Проекты','#/child/projects','square')}
          ${quick('hammer','Навыки','#/child/achievements','hex')}
          ${quick('trophy','Достижения','#/child/achievements','hex')}
          ${quick('clipboard','Задания','#/child/project','square')}
          ${quick('book','Уроки','#/child/lessons','square')}
          ${quick('calendar','Мой день','#/child/day','square')}
        </div>
        <div class="section"><div class="card flat"><div class="section-head"><div><div class="eyebrow">Уровень ${c.level}</div><div class="h3" style="margin-top:2px">Столяр — ученик</div></div><strong>${c.xp}/${c.xpNext} XP</strong></div><div class="progress-track"><div class="progress-fill" style="width:${Math.round(c.xp/c.xpNext*100)}%"></div></div></div></div>
      </section>
    </div>
  </div>`,{title:'Гараж',role:'child'});
}
function quick(ic,label,to,shape='square'){ return `<button class="quick-card" data-go="${to}"><span class="shape ${shape}">${icon(ic)}</span><span>${label}</span></button>`; }

function childProjects(){
  return shell(`<div class="page"><div class="section-head"><div><div class="eyebrow">Мои проекты</div><h1 class="h1">Портфолио мастерской</h1></div></div>
    <div class="chips"><button class="chip active" data-project-filter="all">Все</button><button class="chip" data-project-filter="work">В работе</button><button class="chip" data-project-filter="done">Готово</button><button class="chip" data-project-filter="lessons">Ошибки → уроки</button></div>
    <div class="portfolio-grid section" id="projectGrid">
      <div data-project-kind="work">${portfolioCard('Кормушка для птиц','12 мая 2025','./birdhouse-sketch.svg','В процессе',true)}</div>
      <div data-project-kind="done">${portfolioCard('Скворечник','20 апр 2025','./tools-sketch.svg','Готово',false)}</div>
      <div data-project-kind="done">${portfolioCard('Подставка','5 апр 2025','./wood-joint.svg','Готово',false)}</div>
      <div data-project-kind="lessons">${portfolioCard('Трещина в детали','10 мая 2025','./wood-joint.svg','Исправлено',false,'#/child/lesson')}</div>
    </div>
  </div>`,{title:'Проекты',role:'child'});
}
function portfolioCard(title,date,img,status,current,to=undefined){ const link=to===undefined ? (current?'#/child/project':'#/child/portfolio') : to; return `<article class="card portfolio-card ${link?'clickable':''}" ${link?`data-go="${link}"`:''}><div class="portfolio-date">${date}</div><div class="portfolio-art"><img src="${img}" alt="${title}"></div><div class="portfolio-body"><div class="h3">${title}</div><div class="meta-row"><span>♡ ${current?24:18}</span><span>◯ ${current?6:3}</span><span class="badge ${current?'orange':''}">${status}</span></div></div></article>`; }

function childProject(){
  const p=state.project;
  return shell(`<div class="page project-layout"><section><div class="eyebrow">Проект</div><h1 class="h1" style="margin-top:4px">${p.title}</h1><div class="hero-sketch"><img src="./birdhouse-sketch.svg" alt="Эскиз кормушки"></div><div class="progress-row"><div class="progress-track"><div class="progress-fill" style="width:${p.progress}%"></div></div><div class="progress-value">${p.progress}%</div></div></section>
    <section><div class="card flat"><div class="section-head"><h2 class="h3">Этапы работы</h2><span class="badge orange">${p.status}</span></div><div class="steps">${state.steps.map((s,i)=>stepRow(s,i)).join('')}</div></div>
      <div class="section card flat"><div class="eyebrow">Мастер</div><div class="body" style="margin-top:5px">Отличная работа. Обработай края наждачкой перед следующим этапом.</div></div>
      <div class="project-actions"><button class="btn primary" style="width:100%" data-action="continue-project">Продолжить работу</button></div></section></div>`,{title:'Проект',back:'#/child/projects',role:'child',avatar:false});
}
function stepRow(s,i){ return `<div class="step ${s.status}"><div class="step-dot">${s.status==='done'?icon('check'):i+1}</div><div><strong>${s.title}</strong><br><small>${s.status==='done'?'Готово':s.status==='current'?'Сейчас в работе':'Следующий этап'}</small></div>${s.status==='current'?`<span class="badge orange">Сейчас</span>`:''}</div>`; }

function childLessons(){
  return shell(`<div class="page"><div class="section-head"><div><div class="eyebrow">Уроки</div><h1 class="h1">Учимся на работе</h1></div></div><div class="lessons-grid section">
    ${lessonCard('Косяк → Урок','Трещина в детали','./wood-joint.svg','#/child/lesson','Исправлено')}
    ${lessonCard('Безопасность','Как проверить инструмент','./tools-sketch.svg','#/child/lesson','5 мин')}
    ${lessonCard('Столярка','Разметка без спешки','./birdhouse-sketch.svg','#/child/lesson','7 мин')}
    ${lessonCard('Мастерская','Порядок после работы','./tools-sketch.svg','#/child/lesson','4 мин')}
  </div></div>`,{title:'Уроки',role:'child'});
}
function lessonCard(kicker,title,img,to,badge){ return `<article class="card lesson-card clickable" data-go="${to}"><div class="lesson-thumb"><img src="${img}" alt=""></div><div class="lesson-body"><div class="eyebrow">${kicker}</div><div class="h3" style="margin-top:3px">${title}</div><p>Короткий практический разбор из реальной работы.</p><span class="badge orange" style="display:inline-block;margin-top:7px">${badge}</span></div></article>`; }
function childLesson(){
  return shell(`<div class="page"><div class="hero-sketch"><img src="./wood-joint.svg" alt="Трещина в деревянной детали"></div><div class="section-head"><div><div class="eyebrow">Косяк → Урок</div><h1 class="h1">Трещина в детали</h1></div><span class="badge red">Исправлено</span></div>
    <div class="card reflection section"><div class="reflection-block"><strong>Что случилось?</strong><div class="body muted">Слишком сильно затянул струбцину.</div></div><div class="reflection-block"><strong>Как исправил?</strong><div class="body muted">Заменил деталь. Теперь затягиваю постепенно и проверяю усилие.</div></div><div class="reflection-block"><strong>Что запомнил?</strong><div class="body muted">Проверяю усилие — прежде чем закручивать до конца.</div></div></div>
    <div class="note-box section">${icon('lightbulb')}<div><strong>Ошибка — это часть пути</strong><div class="small">Мы учимся не прятать косяки, а понимать причину и исправлять её.</div></div></div>
  </div>`,{title:'Урок',back:'#/child/lessons',role:'child',avatar:false});
}

function childAchievements(){
  const earned=state.achievements.filter(a=>a.earned).length;
  return shell(`<div class="page"><div class="segmented"><button class="active">Шевроны</button><button data-action="achievement-stats">Статистика</button></div><div class="achievement-main"><div class="big-hex"><div class="big-hex-inner">${icon('hammer')}</div></div><div class="h2">Столяр</div><div class="small muted" style="margin-top:5px">Собрал 5 проектов из дерева</div><div class="progress-row" style="max-width:280px;margin:12px auto 0"><div class="progress-track"><div class="progress-fill" style="width:60%"></div></div><b>3 / 5</b></div></div>
    <div class="section-head"><h2 class="h3">Мои шевроны</h2><span class="small muted">${earned}/${state.achievements.length}</span></div><div class="badge-grid">${state.achievements.map(a=>`<div class="badge-item ${a.earned?'':'locked'}"><div class="shape hex">${icon(a.icon)}</div><div>${a.name}</div><div class="muted">${a.date||'ещё впереди'}</div></div>`).join('')}</div>
  </div>`,{title:'Достижения',back:'#/child/home',role:'child',avatar:false});
}
function childPortfolio(){
  return shell(`<div class="page"><div class="section-head"><div><div class="eyebrow">История работ</div><h1 class="h1">Портфолио</h1></div></div><div class="portfolio-grid section">${portfolioCard('Кормушка для птиц','12 мая 2025','./birdhouse-sketch.svg','В процессе',true)}${portfolioCard('Скворечник','20 апр 2025','./tools-sketch.svg','Готово',false)}${portfolioCard('Подставка','5 апр 2025','./wood-joint.svg','Готово',false)}</div></div>`,{title:'Портфолио',back:'#/child/home',role:'child',avatar:false});
}
function childProfile(){
  const c=state.child;
  return shell(`<div class="page"><div class="card" style="text-align:center"><div class="avatar" style="width:74px;height:74px;margin:0 auto 10px"></div><div class="h2">${escapeHtml(c.name)}</div><div class="small muted">${c.age} лет · ${c.group}</div><div class="metric-row section"><div class="metric"><strong>${c.level}</strong><span>уровень</span></div><div class="metric"><strong>3</strong><span>проекта</span></div><div class="metric"><strong>${state.achievements.filter(a=>a.earned).length}</strong><span>шеврона</span></div></div></div>
    <div class="section stack"><button class="btn secondary" data-go="#/child/portfolio">Моё портфолио</button><button class="btn secondary" data-go="#/child/achievements">Достижения и навыки</button><button class="btn ghost" data-action="logout">Выйти из профиля</button></div></div>`,{title:'Профиль',role:'child'});
}
function childDay(){
  const rows=[['Сегодня','16:00–17:30','Сборка кормушки'],['Четверг','17:00–18:30','Шлифовка и подготовка'],['Суббота','12:00–13:30','Покраска']];
  return shell(`<div class="page"><div class="eyebrow">Расписание</div><h1 class="h1" style="margin-top:4px">Мой день</h1><div class="card flat section">${rows.map((r,i)=>`<div class="event"><div class="shape square" style="width:40px;height:40px">${icon('calendar')}</div><div><strong>${r[0]} · ${r[1]}</strong><div class="small muted">${r[2]}</div></div>${i===0?'<span class="badge orange">Сегодня</span>':''}</div>`).join('')}</div></div>`,{title:'Мой день',back:'#/child/home',role:'child',avatar:false});
}

function childCreate(){
  return shell(`<div class="page"><div class="eyebrow">Новое</div><h1 class="h1" style="margin-top:4px">Добавить в мастерскую</h1><div class="grid section"><button class="card clickable" data-action="photo-add"><div class="shape square">${icon('camera')}</div><div class="h3" style="margin-top:10px">Фото работы</div><div class="small muted">Добавить этап проекта в портфолио</div></button><button class="card clickable" data-action="quick-note"><div class="shape square">${icon('clipboard')}</div><div class="h3" style="margin-top:10px">Заметка</div><div class="small muted">Записать, что получилось и что исправить</div></button></div></div>`,{title:'Добавить',back:'#/child/home',role:'child',avatar:false});
}

function parentHome(){
  const p=state.project;
  return shell(`<div class="page"><div class="hello"><div class="hello-left"><div class="avatar"></div><div><div class="small muted">Ребёнок</div><div class="h2">${state.child.name}</div><div class="small muted">${state.child.age} лет · ${state.child.group}</div></div></div></div>
    <div class="dashboard-grid"><section><div class="card"><div class="section-head"><div><div class="eyebrow">Прогресс за месяц</div><div class="h2">+24%</div></div><span class="badge">Растёт</span></div><div class="bar-chart">${[26,34,42,48,63,78].map(h=>`<div class="bar" style="height:${h}%"></div>`).join('')}</div></div>
      <div class="section"><div class="section-head"><h2 class="h3">Последние события</h2></div><div class="card flat">${eventRow('project','Завершил проект','Кормушка для птиц','12 мая')}${eventRow('trophy','Получил шеврон','«Столяр»','10 мая')}${eventRow('tool','Исправил косяк','«Трещина в детали»','8 мая')}</div></div></section>
      <section><div class="card"><div class="eyebrow">Текущий проект</div><h2 class="h2" style="margin-top:4px">${p.title}</h2><div class="hero-sketch"><img src="./birdhouse-sketch.svg" alt=""></div><div class="progress-row"><div class="progress-track"><div class="progress-fill" style="width:${p.progress}%"></div></div><b>${p.progress}%</b></div></div><div class="section metric-row"><div class="metric"><strong>8</strong><span>занятий</span></div><div class="metric"><strong>3</strong><span>работы</span></div><div class="metric"><strong>4</strong><span>шеврона</span></div></div></section></div>
  </div>`,{title:'Вид родителя',role:'parent'});
}
function eventRow(ic,title,sub,date){ return `<div class="event"><div class="shape square" style="width:40px;height:40px">${icon(ic)}</div><div><strong>${title}</strong><div class="small muted">${sub}</div></div><div class="event-date">${date}</div></div>`; }
function parentProjects(){ return shell(`<div class="page"><div class="eyebrow">Работы ребёнка</div><h1 class="h1" style="margin-top:4px">Проекты Миши</h1><div class="portfolio-grid section">${portfolioCard('Кормушка для птиц','12 мая 2025','./birdhouse-sketch.svg','70%',false,null)}${portfolioCard('Скворечник','20 апр 2025','./tools-sketch.svg','Готово',false,null)}</div></div>`,{title:'Проекты',role:'parent'}); }
function parentMessages(){ return genericMessages('parent'); }
function parentSettings(){ return shell(`<div class="page"><h1 class="h1">Настройки</h1><div class="stack section"><div class="card"><div class="h3">Уведомления</div><div class="small muted">Прогресс, новые работы и сообщения мастера.</div></div><button class="btn ghost" data-action="logout">Выйти</button></div></div>`,{title:'Настройки',role:'parent'}); }

const STUDENTS=[{name:'Миша',project:'Кормушка для птиц',progress:70},{name:'Варя',project:'Полка',progress:40},{name:'Артём',project:'Ящик',progress:100},{name:'Саша',project:'Подставка',progress:66}];
function masterHome(){
  return shell(`<div class="page"><div class="section-head"><div><div class="eyebrow">Мастер</div><h1 class="h1">Группа 2</h1></div><button class="btn primary small-btn" data-action="new-task">+ Новое задание</button></div><div class="card flat section">${STUDENTS.map(s=>`<div class="student-row"><div class="avatar"></div><div><strong>${s.name}</strong><div class="small muted">${s.project}</div></div><div class="student-progress"><div class="small" style="text-align:right;font-weight:800">${s.progress}%</div><div class="progress-track"><div class="progress-fill" style="width:${s.progress}%;background:${s.progress===100?'var(--green)':'var(--orange)'}"></div></div></div></div>`).join('')}</div>
    ${state.customTasks.length?`<div class="section"><div class="section-head"><h2 class="h3">Созданные задания</h2></div><div class="card flat">${state.customTasks.map(t=>eventRow('clipboard',t.title,t.group,'сейчас')).join('')}</div></div>`:''}
  </div>`,{title:'Вид мастера',role:'master'});
}
function masterProjects(){ return shell(`<div class="page"><div class="eyebrow">Проекты группы</div><h1 class="h1" style="margin-top:4px">В работе</h1><div class="portfolio-grid section">${portfolioCard('Кормушка для птиц','Миша · 70%','./birdhouse-sketch.svg','В процессе',false,null)}${portfolioCard('Полка','Варя · 40%','./wood-joint.svg','В процессе',false,null)}</div></div>`,{title:'Проекты',role:'master'}); }
function masterMessages(){ return genericMessages('master'); }
function masterMore(){ return shell(`<div class="page"><h1 class="h1">Ещё</h1><div class="stack section"><button class="btn secondary" data-action="new-task">Создать задание</button><button class="btn secondary" data-action="export-demo">Экспорт демо-данных</button><button class="btn ghost" data-action="logout">Выйти</button></div></div>`,{title:'Ещё',role:'master'}); }
function genericMessages(role){ return shell(`<div class="page"><div class="eyebrow">Сообщения</div><h1 class="h1" style="margin-top:4px">Мастерская на связи</h1><div class="card section"><div class="event"><div class="avatar"></div><div><strong>${role==='master'?'Родители группы 2':'Мастер Алексей'}</strong><div class="small muted">Завтра занятие по расписанию, 16:00.</div></div><div class="event-date">17:42</div></div></div><div class="note-box section">${icon('message')}<div><strong>Демо-раздел</strong><div class="small">Реальные сообщения подключаются вместе с серверной частью.</div></div></div></div>`,{title:'Сообщения',role}); }
function notFound(){ return `<main class="auth-page"><section class="auth-card"><h1 class="h2">Страница не найдена</h1><button class="btn primary" style="margin-top:15px;width:100%" data-go="${state.session?`#/${state.session.role}/home`:'#/welcome'}">На главную</button></section></main>`; }

function bindPage(){
  $$('[data-go]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.go)));
  $$('[data-role]').forEach(el=>el.addEventListener('click',()=>{ $$('[data-role]').forEach(x=>x.classList.remove('selected')); el.classList.add('selected'); state.role=el.dataset.role; save(); }));
  $$('[data-action]').forEach(el=>el.addEventListener('click',()=>handleAction(el.dataset.action,el)));
  $$('[data-project-filter]').forEach(el=>el.addEventListener('click',()=>filterProjects(el.dataset.projectFilter,el)));
  $('#loginForm')?.addEventListener('submit',onLogin);
  $('#registerForm')?.addEventListener('submit',onRegister);
}

function filterProjects(kind,button){
  $$('[data-project-filter]').forEach(x=>x.classList.toggle('active',x===button));
  $$('[data-project-kind]').forEach(x=>x.classList.toggle('hidden',kind!=='all' && x.dataset.projectKind!==kind));
}

function onLogin(e){
  e.preventDefault(); const code=$('#code').value.trim(), role=$('#loginRole').value;
  const profile=state.profiles.find(p=>p.code===code && p.role===role);
  if(code!=='1234' && !profile){ toast('Код не найден. Для демо используйте 1234.'); return; }
  state.session={role,name:profile?.name || (role==='child'?'Миша':role==='parent'?'Родитель':'Мастер')}; state.role=role; save(); go(`#/${role}/home`);
}
function onRegister(e){
  e.preventDefault(); const name=$('#regName').value.trim(),role=$('#regRole').value,code=$('#regCode').value.trim();
  if(!/^\d{4,8}$/.test(code)){ toast('Код должен содержать 4–8 цифр'); return; }
  const p={id:crypto.randomUUID?.()||Date.now().toString(36),name,role,code}; state.profiles.push(p); state.session={role,name}; state.role=role; if(role==='child') state.child.name=name; save(); go(`#/${role}/home`);
}
async function handleAction(action,el){
  if(action==='demo-enter'){
    const role=$('[data-role].selected')?.dataset.role||'child'; state.session={role,name:role==='child'?'Миша':role==='parent'?'Родитель':'Мастер'}; state.role=role; save(); go(`#/${role}/home`); return;
  }
  if(action==='logout'){ state.session=null; save(); go('#/welcome'); return; }
  if(action==='notifications'){ toast('Новых уведомлений: 1'); return; }
  if(action==='install-help'){ showInstallModal(); return; }
  if(action==='quick-add'){ if(state.session?.role==='master') showNewTaskModal(); else go('#/child/create'); return; }
  if(action==='start-qr'){ startQR(); return; }
  if(action==='continue-project'){ completeCurrentStep(); return; }
  if(action==='new-task'){ showNewTaskModal(); return; }
  if(action==='photo-add'){ chooseLocalPhoto(); return; }
  if(action==='quick-note'){ showNoteModal(); return; }
  if(action==='export-demo'){ exportData(); return; }
  if(action==='achievement-stats'){ showAchievementStats(); return; }
}
function completeCurrentStep(){
  const idx=state.steps.findIndex(s=>s.status==='current'); if(idx<0){toast('Проект уже завершён');return;}
  setState(s=>{
    s.steps[idx].status='done';
    if(s.steps[idx+1]) s.steps[idx+1].status='current';
    const done=s.steps.filter(x=>x.status==='done').length;
    s.project.progress = done===s.steps.length ? 100 : Math.min(95, Math.max(s.project.progress + 10, 70));
    if(done===s.steps.length){ s.project.status='Готово'; s.child.xp=Math.min(s.child.xpNext,s.child.xp+100); }
  });
  toast('Этап отмечен выполненным');
}

function modal(html){
  const wrap=document.createElement('div'); wrap.className='modal-backdrop'; wrap.innerHTML=`<section class="modal"><div class="modal-handle"></div>${html}</section>`; document.body.appendChild(wrap); wrap.addEventListener('click',e=>{ if(e.target===wrap || e.target.closest('[data-close-modal]')) wrap.remove(); }); return wrap;
}
function showInstallModal(){
  const isiOS=/iphone|ipad|ipod/i.test(navigator.userAgent); const isAndroid=/android/i.test(navigator.userAgent);
  modal(`<button class="icon-btn modal-close" data-close-modal>${icon('plus').replace('5v14M5 12h14','12 5v14M5 12h14')}</button><div class="eyebrow">Установка</div><h2 class="h2">Добавить «Гараж» как приложение</h2><div class="body muted" style="margin-top:10px">${isiOS?'На iPhone/iPad: откройте сайт в Safari → «Поделиться» → «На экран Домой» → «Добавить».':isAndroid?'На Android: откройте сайт в Chrome → меню ⋮ → «Установить приложение» или «Добавить на главный экран».':'На телефоне откройте сайт в Safari (iPhone/iPad) или Chrome (Android) и выберите добавление на главный экран.'}</div>`);
}
function showNewTaskModal(){
  const m=modal(`<div class="eyebrow">Мастер</div><h2 class="h2">Новое задание</h2><form id="newTaskForm" class="stack" style="margin-top:14px"><div class="field"><label>Название</label><input class="input" id="taskTitle" placeholder="Например: отшлифовать кромки" required></div><div class="field"><label>Группа</label><select class="input" id="taskGroup"><option>Группа 2</option><option>Группа 1</option></select></div><button class="btn primary" type="submit">Создать задание</button><button class="btn secondary" type="button" data-close-modal>Отмена</button></form>`);
  $('#newTaskForm',m).addEventListener('submit',e=>{e.preventDefault(); const title=$('#taskTitle',m).value.trim(); state.customTasks.unshift({id:Date.now(),title,group:$('#taskGroup',m).value}); save(); m.remove(); render(); toast('Задание создано');});
}
function showNoteModal(){
  const m=modal(`<div class="eyebrow">Заметка</div><h2 class="h2">Что получилось сегодня?</h2><div class="field" style="margin-top:14px"><textarea class="input" id="noteText" rows="5" placeholder="Напиши коротко своими словами"></textarea></div><button class="btn primary" style="width:100%;margin-top:12px" id="saveNote">Сохранить</button>`);
  $('#saveNote',m).addEventListener('click',()=>{ localStorage.setItem('garazh2-last-note',$('#noteText',m).value); m.remove(); toast('Заметка сохранена на устройстве'); });
}
async function startQR(){
  const status=$('#qrStatus'),video=$('#qrVideo'); if(!status||!video)return;
  if(!navigator.mediaDevices?.getUserMedia){status.textContent='Камера недоступна в этом браузере.';return;}
  try{
    const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}); video.srcObject=stream; await video.play(); status.textContent='Камера включена. Ищу QR-код…';
    if(!('BarcodeDetector' in window)){ status.textContent='Камера работает, но распознавание QR здесь не поддерживается. Используйте вход по коду.'; return; }
    const detector=new BarcodeDetector({formats:['qr_code']});
    const timer=setInterval(async()=>{ if(!document.body.contains(video)){clearInterval(timer);stream.getTracks().forEach(t=>t.stop());return;} try{ const codes=await detector.detect(video); if(codes[0]){ const raw=codes[0].rawValue||''; const m=raw.match(/role=(child|parent|master)/); const role=m?.[1]||'child'; state.session={role,name:role==='child'?'Миша':role==='parent'?'Родитель':'Мастер'}; state.role=role; save(); clearInterval(timer); stream.getTracks().forEach(t=>t.stop()); go(`#/${role}/home`); } }catch{} },700);
  }catch(e){ status.textContent='Не удалось включить камеру. Разрешите доступ или используйте вход по коду.'; }
}
function showAchievementStats(){
  const earned=state.achievements.filter(a=>a.earned).length;
  modal(`<div class="eyebrow">Статистика</div><h2 class="h2">Рост мастерства</h2><div class="metric-row section"><div class="metric"><strong>${earned}</strong><span>шеврона</span></div><div class="metric"><strong>3</strong><span>проекта</span></div><div class="metric"><strong>${state.project.progress}%</strong><span>текущий</span></div></div><div class="body muted section">Следующий шеврон «Столяр» — после завершения ещё двух деревянных проектов.</div><button class="btn secondary" style="width:100%;margin-top:14px" data-close-modal>Закрыть</button>`);
}
function chooseLocalPhoto(){
  const input=document.createElement('input'); input.type='file'; input.accept='image/*'; input.setAttribute('capture','environment');
  input.addEventListener('change',()=>{ const file=input.files?.[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{ try{ state.lastPhoto=reader.result; save(); showPhotoPreview(reader.result); }catch(e){toast('Фото слишком большое для локального хранения');} }; reader.readAsDataURL(file); }); input.click();
}
function showPhotoPreview(src){
  const m=modal(`<div class="eyebrow">Фото работы</div><h2 class="h2">Добавлено на устройство</h2><div class="hero-sketch"><img src="${src}" alt="Новое фото работы" style="width:100%;max-height:360px;object-fit:cover"></div><button class="btn primary" style="width:100%" data-close-modal>Готово</button>`); toast('Фото сохранено локально');
}

function exportData(){ const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='garazh-demo-data.json'; a.click(); URL.revokeObjectURL(a.href); toast('Данные экспортированы'); }
function escapeHtml(s=''){ return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

window.addEventListener('hashchange',render);
window.addEventListener('online',()=>{ $('#offlineBanner')?.remove(); toast('Связь восстановлена'); });
window.addEventListener('offline',showOffline);
function showOffline(){ if($('#offlineBanner'))return; const e=document.createElement('div');e.id='offlineBanner';e.className='offline';e.textContent='Нет сети · приложение работает офлайн';document.body.appendChild(e); }
if(!navigator.onLine) showOffline();

if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('SW:',err))); }

if(!location.hash) location.hash=state.session?`#/${state.session.role}/home`:'#/welcome'; else render();
