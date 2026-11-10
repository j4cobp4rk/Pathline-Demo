import { DEMO_STORY, PROOF_TEMPLATES, PROOF_EXAMPLES, JOBS, freshState } from './data.js';
import { inferSkills, evaluate, sortJobs, escapeHtml as esc, shortText, allSelectedSkills } from './engine.js';

const KEY = 'pathline-prototype-v2'; // Keep existing progress across this feature update
const appEl = document.querySelector('#app');
let state = load();
let typingMessage = '';

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && typeof saved === 'object' && Array.isArray(saved.proofs) && saved.applications && saved.draft) {
      return { ...freshState(), ...saved, toast: '', sidebarMobile: false };
    }
  } catch (_) { /* corrupted local storage: start over */ }
  return freshState();
}
function persist() {
  const { toast, sidebarMobile, ...saveable } = state;
  try { localStorage.setItem(KEY, JSON.stringify(saveable)); } catch (_) { /* still works without persistence */ }
}
function icon(name, size=20, extra='') {
  const paths = {
    arrowRight:'<path d="M5 12h14m-6-6 6 6-6 6"/>', arrowLeft:'<path d="M19 12H5m6 6-6-6 6-6"/>',
    arrowUpRight:'<path d="M7 17 17 7M8 7h9v9"/>', check:'<path d="m5 12 4 4L19 6"/>',
    checkCircle:'<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
    circle:'<circle cx="12" cy="12" r="8"/>', close:'<path d="M18 6 6 18M6 6l12 12"/>',
    sparkles:'<path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3ZM19 17l.7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17Z"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-3 6-5 2 2-5 6-3Z"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    briefcase:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13c5 3 13 3 18 0"/>',
    file:'<path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10l-7-7Z"/><path d="M13 3v7h7M8 15h8M8 18h5"/>',
    message:'<path d="M20 11.5a8 8 0 0 1-8 8 9 9 0 0 1-4-.9L3 20l1.4-4.7A8 8 0 1 1 20 11.5Z"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1"/>',
    eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    lock:'<rect x="4" y="10" width="16" height="12" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/>',
    edit:'<path d="m14 5 5 5M4 20l5-.8L20 8a2 2 0 0 0-4-4L5 15l-1 5Z"/>',
    plus:'<path d="M12 5v14M5 12h14"/>', search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    filter:'<path d="M3 5h18M6 12h12M9 19h6"/>', mapPin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    alert:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 17h.01"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    layers:'<path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>',
    chevron:'<path d="m9 18 6-6-6-6"/>', chevronDown:'<path d="m6 9 6 6 6-6"/>',
    send:'<path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/>',
    rotate:'<path d="M3 12a9 9 0 1 0 3-7M3 3v5h5"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    lightbulb:'<path d="M9 18h6M10 21h4M9 14a6 6 0 1 1 6 0c-.7.7-1 1.3-1 3h-4c0-1.7-.4-2.4-1-3Z"/>',
    handshake:'<path d="m2 12 5-5 4 2 4-2 7 5-5 7-5-3-4 3-6-7Z"/><path d="m7 7 3-2 3 2 2 0M9 15l3 2"/>',
  };
  return `<svg class="icon ${extra}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.circle}</svg>`;
}

function proofType(proof) { return PROOF_TEMPLATES[proof?.type] ? proof.type : 'problem'; }
function proofTemplate(proof) { return PROOF_TEMPLATES[proofType(proof)]; }
function evidenceSummary(proof) { return proof.action || proof.problem || proof.outcome || ''; }
function proofDetails(proof) {
  const template = proofTemplate(proof);
  return [proof.problem, proof.action, proof.outcome].map((value,i) => value?.trim() ? `<div><span>${esc(template.labels[i])}</span><p>${esc(value)}</p></div>` : '').join('');
}

function button(text, action, css='btn-primary', attrs='') { return `<button class="btn ${css}" data-action="${action}" ${attrs}>${text}</button>`; }
function tag(text, kind='muted') { return `<span class="pill pill-${kind}">${text}</span>`; }
function wordmark() { return `<div class="brand-symbol"><span class="brand-line"></span></div><span class="brand-word">pathline<span class="brand-period">.</span></span>`; }
function jobById(id) { return JOBS.find(j=>j.id===id) || JOBS[0]; }
function activeJob() { return jobById(state.activeJobId); }
function completionPercent() { return state.proofs.length ? 100 : state.view==='skills' ? 66 : state.view==='story' ? 33 : 0; }
function eligibleForNav() { return state.proofs.length > 0; }
function go(view) { state.view = view; state.toast = ''; state.sidebarMobile = false; render(); window.scrollTo({top:0,behavior:'instant'}); }
function changeJob(id, view='job') { state.activeJobId = id; go(view); }
function toast(text) { state.toast = text; render(); }

function header() {
  const ready = eligibleForNav();
  const connections = Object.values(state.applications).filter(a=>a.status==='connected').length;
  return `<header class="site-header">
    <div class="header-inner">
      <button class="logo-button" data-action="nav" data-view="${ready?'home':'welcome'}" aria-label="Pathline home">${wordmark()}</button>
      <nav class="top-nav" aria-label="Main navigation">
        <button class="nav-link ${state.view==='home'?'active':''}" data-action="nav" data-view="home" ${ready?'':'disabled'}>Overview</button>
        <button class="nav-link ${['discover','job','interest','pending'].includes(state.view)?'active':''}" data-action="nav" data-view="discover" ${ready?'':'disabled'}>Explore roles</button>
        <button class="nav-link ${state.view==='profile'?'active':''}" data-action="nav" data-view="profile" ${ready?'':'disabled'}>My proof</button>
        <button class="nav-link ${state.view==='connections'?'active':''}" data-action="nav" data-view="connections" ${ready?'':'disabled'}>Connections ${connections?`<span class="nav-count">${connections}</span>`:''}</button>
      </nav>
      <div class="header-actions">
        <span class="header-demo">${icon('circle',8)} DEMO MARKETPLACE</span>
        <button class="header-avatar" data-action="nav" data-view="${ready?'profile':'welcome'}" aria-label="My profile">MC</button>
        <button class="mobile-menu" data-action="mobile-menu" aria-label="Open navigation">${icon('menu',23)}</button>
      </div>
    </div>
    ${state.sidebarMobile?`<div class="mobile-nav">
      ${['home','discover','profile','connections','recruiter'].map(v=>`<button data-action="nav" data-view="${v}" ${ready?'':'disabled'}>${v==='home'?'Overview':v==='discover'?'Explore roles':v==='profile'?'My proof':v==='connections'?'Connections':'Recruiter demo'}</button>`).join('')}
      <button data-action="reset">Reset demo</button>
    </div>`:''}
  </header>`;
}
function footer() {
  return `<footer class="site-footer"><div><span class="footer-brand">pathline.</span> <span>For the work you've done. And what's next.</span></div><div><span>Illustrative people, companies & roles</span><span class="footer-dot">·</span><button data-action="nav" data-view="recruiter" ${eligibleForNav()?'':'disabled'}>Recruiter demo ${icon('arrowUpRight',13)}</button><span class="footer-dot">·</span><button data-action="reset">Reset experience ${icon('rotate',13)}</button></div></footer>`;
}
function stepper(current) {
  const steps=['Your direction','Your work','Your skills'];
  return `<div class="stepper">${steps.map((s,i)=>`<div class="stepper-item ${current===i+1?'current':''} ${current>i+1?'done':''}"><span class="step-num">${current>i+1?icon('check',14):String(i+1).padStart(2,'0')}</span><span>${s}</span></div>`).join('<span class="step-divider"></span>')}</div>`;
}
function welcome() {
  return `<main class="welcome-page">
    <div class="welcome-graphic one"></div><div class="welcome-graphic two"></div>
    <div class="welcome-inner">
      <section class="hero-copy">
        <div class="eyebrow"><span class="gold-line"></span> A NEW PATH TO YOUR NEXT ROLE</div>
        <h1>Your experience is <span class="serif-emphasis">more</span><br />than your title.</h1>
        <p class="hero-subtitle">Changing careers shouldn't mean starting from zero. Pathline shows employers what you can do—through the work you've already done.</p>
        <div class="hero-attributes">
          <div>${icon('checkCircle',18)} Make transferable skills visible</div>
          <div>${icon('checkCircle',18)} See the evidence behind every match</div>
          <div>${icon('checkCircle',18)} Connect with employers intentionally</div>
        </div>
        <div class="social-proof"><div class="overlap-circles"><span>MC</span><span>JE</span><span>AB</span></div><p><strong>A guided concept demo</strong><br/>Built for career switchers, not résumé keywords.</p></div>
      </section>
      <section class="welcome-panel" aria-label="Career transition onboarding">
        <div class="panel-top"><span>GET STARTED</span><span>01 / 03</span></div>
        <h2>Let's talk about where you're headed.</h2>
        <p>Start with your career direction. We'll build the evidence together.</p>
        <label for="current-role">Your current role</label>
        <div class="input-shell">${icon('briefcase',18)}<input id="current-role" data-model="currentRole" value="${esc(state.currentRole)}" placeholder="e.g. Customer Success Manager" /></div>
        <label for="target-role">Your next role</label>
        <div class="input-shell">${icon('target',18)}<input id="target-role" data-model="targetRole" value="${esc(state.targetRole)}" placeholder="e.g. Product Manager" /></div>
        <label for="experience">Your experience</label>
        <div class="select-shell"><select id="experience" data-model="experience">${['1 year','2 years','3 years','4 years','5+ years'].map(x=>`<option ${state.experience===x?'selected':''}>${x}</option>`).join('')}</select>${icon('chevronDown',17)}</div>
        <button class="btn btn-primary btn-full" data-action="start">Build my proof ${icon('arrowRight',18)}</button>
        <div class="panel-foot">${icon('shield',16)} No account required · No real applications sent</div>
      </section>
    </div>
    <div class="welcome-bottom"><div>NOT A BETTER RÉSUMÉ.</div><div>A BETTER WAY TO BE UNDERSTOOD.</div></div>
  </main>`;
}
function story() {
  const editing = !!state.editingProofId;
  const template = proofTemplate(state.draft);
  const type = proofType(state.draft);
  return `<main class="page page-onboard">
    <div class="page-container">
      ${stepper(2)}
      <div class="onboard-layout">
        <section>
          <div class="eyebrow section-eyebrow"><span class="gold-line"></span> ${editing?'EDIT YOUR WORK':'ONE EXPERIENCE IS ENOUGH TO START'}</div>
          <h1 class="page-display">Your experience has<br/><span class="serif-emphasis">more than one shape.</span></h1>
          <p class="lead-copy">You shouldn't need a perfect project metric to show your strengths. Pick a way to describe your work that feels natural.</p>
          <div class="story-guidance"><div class="guidance-icon">${icon('lightbulb',20)}</div><div><strong>What counts as proof?</strong><p>A project, a person you supported, an ongoing responsibility, or an achievement. Recruiters will see the context, your contribution, and the evidence.</p></div></div>
          <div class="reflection-quote"><span class="quote-mark">“</span><p>The best evidence isn't always a KPI. Sometimes it's the people you supported or the responsibility you consistently carried.</p><span class="quote-author">PATHLINE · A BROADER VIEW OF EXPERIENCE</span></div>
        </section>
        <section class="form-panel">
          <div class="form-panel-header"><div><span class="mini-label">PROOF OF CAPABILITY</span><h2>${editing?'Refine your experience':'Choose your experience type'}</h2></div>${tag('Editable example','gold')}</div>
          <div class="form-panel-body">
            <div class="proof-type-grid" role="group" aria-label="Type of work experience">
              ${Object.entries(PROOF_TEMPLATES).map(([key,t])=>`<button type="button" class="proof-type-option ${type===key?'active':''}" data-action="choose-proof-type" data-type="${key}" aria-pressed="${type===key}"><span class="proof-type-check">${type===key?icon('check',14):icon('circle',14)}</span><strong>${esc(t.name)}</strong><small>${esc(t.subtitle)}</small></button>`).join('')}
            </div>
            <div class="proof-type-description"><strong>${esc(template.heading)}</strong><span>${esc(template.description)}</span></div>
            <label for="proof-title">Give your experience a title <span>(optional)</span></label>
            <input id="proof-title" class="field" data-story="title" value="${esc(state.draft.title||'')}" placeholder="A meaningful contribution"/>
            ${['problem','action','outcome'].map((field,i)=>`<label for="proof-${field}">0${i+1} &nbsp; ${esc(template.labels[i])}</label><textarea id="proof-${field}" class="field field-textarea" data-story="${field}" rows="${i===1?4:3}" placeholder="${esc(template.placeholders[i])}">${esc(state.draft[field]||'')}</textarea>`).join('')}
            <div class="form-helper">${icon('info',16)} The final evidence field is optional. Don't invent outcomes or metrics.</div>
            <div class="form-actions"><button class="btn btn-text" data-action="sample-story">${icon('rotate',16)} Use ${esc(template.name.toLowerCase())} example</button><button class="btn btn-primary" data-action="analyze-story">Find transferable skills ${icon('arrowRight',17)}</button></div>
          </div>
        </section>
      </div>
    </div>
  </main>`;
}
function skillsView() {
  const suggestions=state.suggestedSkills;
  const selected=state.selectedSkills;
  return `<main class="page page-onboard">
    <div class="page-container">
      ${stepper(3)}
      <div class="skills-layout">
        <section>
          <div class="eyebrow section-eyebrow"><span class="gold-line"></span> YOUR EXPERIENCE, REFRAMED</div>
          <h1 class="page-display">Here's what your work<br/><span class="serif-emphasis">can show.</span></h1>
          <p class="lead-copy">We found capabilities your work story may demonstrate. Review them before saving—they're suggestions, not verified credentials.</p>
          <div class="translation-graphic">
            <div class="translation-box"><span>WHERE YOU'VE BEEN</span><strong>${esc(state.currentRole)}</strong></div>
            <div class="translation-arrow">${icon('arrowRight',22)}</div>
            <div class="translation-box highlight"><span>WHERE YOU'RE GOING</span><strong>${esc(state.targetRole)}</strong></div>
          </div>
          <div class="subtle-note">${icon('shield',18)} You choose which skills to associate with this work. No automatic verification or credentials are claimed.</div>
        </section>
        <section class="skills-right">
          <div class="proof-feature"><div class="proof-feature-top"><span>YOUR PROOF-OF-WORK CARD</span><span>01</span></div><h3>${esc(state.draft.title||'A meaningful work accomplishment')}</h3><div class="proof-feature-grid"><div><span>YOUR CONTRIBUTION</span><p>${esc(shortText(state.draft.action,210))}</p></div><div><span>SUPPORTING EVIDENCE</span><p>${esc(shortText(state.draft.outcome||state.draft.problem,160))}</p></div></div></div>
          <div class="skills-header"><div><h2>Suggested transferable skills</h2><p>Select the skills your story genuinely supports.</p></div><span class="small-count">${selected.length} selected</span></div>
          ${suggestions.length ? `<div class="skill-list">${suggestions.map((s,i)=>`<button class="skill-card ${selected.includes(s.name)?'chosen':''}" data-action="toggle-skill" data-skill="${esc(s.name)}" aria-pressed="${selected.includes(s.name)}"><span class="skill-check">${selected.includes(s.name)?icon('check',16):''}</span><span class="skill-content"><strong>${esc(s.name)}</strong><span>${esc(s.why)}</span></span><span class="skill-index">0${i+1}</span></button>`).join('')}</div>` : `<div class="empty-state compact">We couldn't find a clear skills suggestion in this story. Add more detail about what you personally did, then try again.</div>`}
          <div class="skills-footer"><button class="btn btn-outline" data-action="edit-story">${icon('arrowLeft',16)} Edit story</button><button class="btn btn-primary" data-action="confirm-skills" ${selected.length?'':'disabled'}>Save my proof ${icon('arrowRight',17)}</button></div>
        </section>
      </div>
    </div>
  </main>`;
}
function sidebar(active='') {
  const connected=Object.values(state.applications).filter(a=>a.status==='connected').length;
  return `<aside class="dashboard-sidebar"><div class="sidebar-group"><span class="side-overline">WORKSPACE</span>
      ${[
        ['home','grid','Overview'],['discover','compass','Explore roles'],['profile','file','My proof'],['connections','message',`Connections ${connected?`<b class="side-counter">${connected}</b>`:''}`]
      ].map(([v,ic,label])=>`<button class="side-link ${active===v?'selected':''}" data-action="nav" data-view="${v}">${icon(ic,18)}<span>${label}</span>${v===active?icon('chevron',15):''}</button>`).join('')}
      </div><div class="sidebar-group"><span class="side-overline">EXPLORE</span><button class="side-link ${active==='recruiter'?'selected':''}" data-action="nav" data-view="recruiter">${icon('users',18)}<span>Recruiter demo</span></button></div>
      <div class="sidebar-tip"><div class="sidebar-tip-icon">${icon('sparkles',19)}</div><strong>Your work is your advantage.</strong><p>What you've done can unlock a role you've never held.</p></div>
      <button class="sidebar-reset" data-action="reset">${icon('rotate',15)} Reset demo</button>
    </aside>`;
}
function dashboardShell(content, current) { return `<main class="dashboard-page"><div class="dashboard-layout">${sidebar(current)}<section class="dashboard-main">${content}</section></div></main>`; }
function companyMark(job, cls='') { return `<div class="company-mark tone-${job.tone} ${cls}">${esc(job.initials)}</div>`; }
function statusBadge(status) { return status==='connected'?tag('Connected','green'):status==='interested'?tag('Awaiting review','gold'):status==='declined'?tag('Not moving forward','muted'):tag('Open','muted'); }
function featuredJob(job, compact=false) {
  const evaled=evaluate(job,state.proofs);
  const application=state.applications[job.id];
  return `<article class="role-card ${compact?'role-card-small':''}">
    <div class="role-card-header">${companyMark(job)}<div class="role-brand"><strong>${esc(job.company)}</strong><span>${esc(job.location)} · ${esc(job.arrangement)}</span></div><span class="role-top-right">${application?statusBadge(application.status):tag('Sample role')}</span></div>
    <h3>${esc(job.title)}</h3><div class="role-pay">${esc(job.pay)} <span>/ year</span></div>
    <div class="role-divider"></div><p class="role-match-label">${icon('sparkles',15)} WHY YOUR WORK MAY BE RELEVANT</p>
    <div class="role-skill-list">${evaled.supported.slice(0,3).map(x=>`<span class="mini-skill">${icon('check',13)} ${esc(x.skill)}</span>`).join('')||'<span class="mini-skill muted">No direct evidence mapped yet</span>'}</div>
    <div class="role-card-footer"><span>${evaled.count} of ${job.requirements.length} requirements have supporting evidence</span><button data-action="open-job" data-job="${job.id}">View opportunity ${icon('arrowRight',17)}</button></div>
  </article>`;
}
function dashboard() {
  const jobs=sortJobs(state.proofs);
  const apps=Object.entries(state.applications).map(([id,ap])=>({job:jobById(id),ap}));
  return dashboardShell(`<div class="dash-topline"><div><span class="eyebrow-label">YOUR PATHLINE WORKSPACE</span><h1>Good to see you, ${esc(state.name.split(' ')[0])}<span class="gold-dot">.</span></h1><p>The right next step starts with work you've already done.</p></div><div class="dashboard-date">${icon('shield',17)} Private demo profile</div></div>
    <div class="dash-hero"><div class="dash-hero-copy"><span>YOUR CAREER TRANSITION</span><h2>${esc(state.currentRole)} <span>→</span><br/>${esc(state.targetRole)}</h2><p>We'll connect your proven experience to opportunities in your next field.</p><button data-action="nav" data-view="profile">Explore my proof ${icon('arrowUpRight',16)}</button></div><div class="dash-hero-art"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="orbit-center">${icon('sparkles',32)}</div><div class="orbit-tag top">YOUR WORK</div><div class="orbit-tag bottom">NEW POSSIBILITIES</div></div></div>
    <div class="stats-strip"><div><strong>${state.proofs.length.toString().padStart(2,'0')}</strong><span>Proof-of-Work ${state.proofs.length===1?'Card':'Cards'}</span></div><div><strong>${allSelectedSkills(state.proofs).length.toString().padStart(2,'0')}</strong><span>Skills you selected</span></div><div><strong>${jobs.length.toString().padStart(2,'0')}</strong><span>Curated sample roles</span></div><div><strong>${apps.length.toString().padStart(2,'0')}</strong><span>Expressions of interest</span></div></div>
    <div class="section-heading"><div><span class="eyebrow-label">THE OPPORTUNITY</span><h2>Roles worth a closer look</h2><p>Sorted by how many requirements connect to your saved work evidence.</p></div><button class="plain-link" data-action="nav" data-view="discover">View all roles ${icon('arrowRight',17)}</button></div>
    <div class="role-grid">${jobs.slice(0,2).map(j=>featuredJob(j)).join('')}</div>
    <div class="insight-banner"><span class="insight-star">${icon('sparkles',19)}</span><p><strong>A different starting point.</strong> Rather than rating you with a black-box match score, Pathline shows the specific experience behind each suggested connection.</p><button data-action="nav" data-view="profile">See your evidence ${icon('arrowRight',16)}</button></div>
    ${apps.length?`<div class="section-heading small"><div><h2>Your introductions</h2></div><button class="plain-link" data-action="nav" data-view="connections">See all ${icon('arrowRight',16)}</button></div><div class="app-rows">${apps.map(({job,ap})=>`<button class="app-row" data-action="open-job" data-job="${job.id}">${companyMark(job)}<span><strong>${esc(job.title)}</strong><small>${esc(job.company)}</small></span>${statusBadge(ap.status)}${icon('chevron',17)}</button>`).join('')}</div>`:''}
    `,'home');
}
function discover() {
  const jobs=sortJobs(state.proofs).filter(job=>{
    const needle=state.search.toLowerCase().trim();
    return (!needle || [job.title,job.company,job.category,job.location].join(' ').toLowerCase().includes(needle)) && (state.arrangement==='All'||job.arrangement===state.arrangement);
  });
  return dashboardShell(`<div class="dash-topline"><div><span class="eyebrow-label">EXPLORE NEW POSSIBILITIES</span><h1>Find roles beyond your title<span class="gold-dot">.</span></h1><p>These sample opportunities are curated to demonstrate cross-career matching.</p></div><div class="dashboard-date">${icon('compass',18)} ${jobs.length} roles shown</div></div>
    <div class="search-toolbar"><div class="search-control">${icon('search',20)}<input id="role-search" data-model="search" value="${esc(state.search)}" placeholder="Search roles, companies, or locations" aria-label="Search roles" /></div><div class="select-filter">${icon('filter',17)}<select data-model="arrangement" aria-label="Work arrangement">${['All','Remote','Hybrid','On-site'].map(a=>`<option ${state.arrangement===a?'selected':''}>${a}</option>`).join('')}</select>${icon('chevronDown',16)}</div></div>
    <div class="explain-note">${icon('info',17)} We're showing skills backed by your selected work stories—not claiming you meet every requirement. <span>All companies and jobs are fictional.</span></div>
    <div class="role-grid search-grid">${jobs.length?jobs.map(j=>featuredJob(j,true)).join(''):`<div class="empty-state"><div>${icon('search',26)}</div><h3>No sample roles match these filters.</h3><p>Try a different keyword or arrangement.</p><button class="btn btn-outline" data-action="clear-search">Clear filters</button></div>`}</div>
  `,'discover');
}
function profile() {
  const all=allSelectedSkills(state.proofs);
  return dashboardShell(`<div class="dash-topline"><div><span class="eyebrow-label">YOUR PROOF, YOUR STORY</span><h1>What you've done matters<span class="gold-dot">.</span></h1><p>Your evidence travels with you. You decide what to share with employers.</p></div>${button(`${icon('plus',17)} Add a work story`,'add-proof','btn-outline')}</div>
    <div class="profile-summary"><div class="profile-avatar">MC</div><div><span class="eyebrow-label">CAREER DIRECTION</span><h2>${esc(state.name)}</h2><p>${esc(state.currentRole)} ${icon('arrowRight',15)} ${esc(state.targetRole)}</p></div><div class="profile-private">${icon('lock',16)} Private until you choose to share</div></div>
    <div class="section-heading"><div><span class="eyebrow-label">YOUR EXPERIENCE</span><h2>Proof-of-Work Cards</h2><p>Each card connects a real accomplishment to capabilities you chose to highlight.</p></div></div>
    <div class="proof-stack">${state.proofs.map((proof,i)=>`<article class="proof-card"><div class="proof-head"><span>PROOF ${String(i+1).padStart(2,'0')}</span><button data-action="edit-proof" data-proof="${proof.id}">${icon('edit',16)} Edit evidence</button></div><h3>${esc(proof.title||'Work accomplishment')}</h3><div class="proof-pao">${proofDetails(proof)}</div><div class="proof-tags"><span>SKILLS YOU SELECTED</span><div>${proof.selectedSkills.map(s=>tag(esc(s),'green')).join('')}</div></div></article>`).join('')}</div>
    <div class="section-heading small"><div><h2>Capabilities you're showcasing</h2></div></div><div class="capability-list">${all.map(s=>`<span>${icon('checkCircle',17)} ${esc(s)}</span>`).join('')}</div>
    <div class="profile-bottom-banner">${icon('shield',23)}<div><strong>Your story stays yours.</strong><p>These are self-reported work examples and suggested skill connections—not verified employment credentials. Employers only see the stories you submit.</p></div></div>
  `,'profile');
}
function jobDetail() {
  const job=activeJob(); const e=evaluate(job,state.proofs); const application=state.applications[job.id];
  return dashboardShell(`<button class="back-link" data-action="nav" data-view="discover">${icon('arrowLeft',17)} All opportunities</button>
    <div class="job-page-top"><div class="job-identity">${companyMark(job,'company-mark-large')}<div><span class="eyebrow-label">${esc(job.eyebrow)}</span><h1>${esc(job.title)}</h1><p>${esc(job.company)} <span>·</span> ${esc(job.location)} <span>·</span> ${esc(job.arrangement)}</p></div></div><div>${application?statusBadge(application.status):tag('Sample opening','gold')}</div></div>
    <div class="job-page-layout"><section class="job-main-column">
      <div class="job-value-hero"><div><span>YOUR EXPERIENCE MAY MATTER HERE</span><h2>See the connection<br/>before you apply.</h2><p>We mapped this role's requirements to the work you've actually described. Review both evidence and gaps—without a mystery match score.</p></div><div class="job-value-decoration">${icon('layers',66)}</div></div>
      <div class="job-section"><div class="section-heading tighter"><div><h2>Where your work connects</h2><p>Each example links back to an accomplishment you provided.</p></div>${tag(`${e.supported.length} supported`,'green')}</div>
        ${e.supported.length?e.supported.map(s=>`<div class="evidence-row"><div class="evidence-icon">${icon('check',18)}</div><div><strong>${esc(s.skill)}</strong><p>${esc(s.why)}</p><div class="evidence-source">${icon('file',15)} YOUR WORK: “${esc(shortText(s.proof.action,124))}”</div></div></div>`).join(''):`<div class="empty-state compact">No requirements are yet supported by selected proof. Add more detail to your work story to see relevant evidence.</div>`}
      </div>
      <div class="job-section gaps"><div class="section-heading tighter"><div><h2>What's still unclear</h2><p>Not evidenced doesn't mean unqualified; it means we haven't seen supporting work yet.</p></div>${tag(`${e.gaps.length} to explore`)}</div>
        ${e.gaps.map(s=>`<div class="gap-row"><span>${icon('circle',18)}</span><div><strong>${esc(s.skill)}</strong><p>${esc(s.why)}</p></div></div>`).join('')||'<p class="all-evidenced">Every listed requirement has supporting evidence in your selected work stories.</p>'}
      </div>
      <div class="job-section company-about"><span class="eyebrow-label">THE COMPANY</span><h2>About ${esc(job.company)}</h2><p>${esc(job.about)}</p><div class="about-mission"><span>TEAM FOCUS</span><strong>${esc(job.mission)}</strong></div></div>
    </section><aside class="job-side-column"><div class="job-side-card"><span class="eyebrow-label">OPPORTUNITY DETAILS</span><div class="comp-label">Annual base salary</div><div class="comp-amount">${esc(job.pay)}</div><div class="job-side-meta"><div>${icon('mapPin',17)} ${esc(job.location)}</div><div>${icon('briefcase',17)} ${esc(job.arrangement)}</div><div>${icon('shield',17)} Salary visible before interest</div></div><div class="job-side-divider"></div><p>Share the work examples you choose. Your identity isn't shown in the recruiter preview before mutual interest.</p>${application?button(`${application.status==='connected'?'View connection':application.status==='declined'?'View outcome':'View your interest'} ${icon('arrowRight',17)}`,'view-application','btn-primary btn-full') : button(`Express interest ${icon('arrowRight',18)}`,'open-interest','btn-primary btn-full') }<div class="job-side-foot">${icon('lock',15)} No real employer is contacted in this demo.</div></div>
        <div class="tip-card">${icon('sparkles',20)}<div><strong>Why this is different</strong><p>A hiring manager can see your relevant work before drawing conclusions from an unfamiliar title.</p></div></div>
      </aside></div>
    `,'discover');
}
function interest() {
  const job=activeJob(); const selected=state.selectedProofIds;
  return dashboardShell(`<button class="back-link" data-action="open-job" data-job="${job.id}">${icon('arrowLeft',17)} Back to opportunity</button>
    <div class="simple-page-heading"><span class="eyebrow-label">INTENTIONAL INTRODUCTIONS</span><h1>Show them why you're relevant<span class="gold-dot">.</span></h1><p>Choose the proof you want to share with ${esc(job.company)}. You're not sending a generic résumé into a queue.</p></div>
    <div class="interest-layout"><section><div class="editor-card"><div class="editor-card-header"><h2>01 <span>/</span> Select your work evidence</h2><p>Recruiters will see only the cards you explicitly select.</p></div>
      ${state.proofs.map(p=>`<button class="evidence-choice ${selected.includes(p.id)?'active':''}" data-action="toggle-proof" data-proof="${p.id}" aria-pressed="${selected.includes(p.id)}"><span class="choice-check">${selected.includes(p.id)?icon('check',17):''}</span><span><strong>${esc(p.title)}</strong><small>${esc(shortText(p.action,128))}</small><span class="choice-tags">${p.selectedSkills.slice(0,3).map(s=>`<em>${esc(s)}</em>`).join('')}</span></span></button>`).join('')}
      <div class="editor-card-header second"><h2>02 <span>/</span> Add a brief note</h2><p>Keep it human. Your work examples carry the detail.</p></div>
      <textarea class="field field-textarea interest-note" data-model="intro" rows="5" aria-label="Introduction note" placeholder="Why does this opportunity interest you?">${esc(state.intro)}</textarea>
      <div class="interest-foot"><span>${icon('shield',16)} You control what gets shared.</span>${button(`Send interest ${icon('arrowRight',17)}`,'submit-interest','btn-primary',selected.length?'':'disabled')}</div></div></section>
      <aside><div class="request-preview"><span class="eyebrow-label">INTRODUCTION PREVIEW</span><div class="preview-role">${companyMark(job)}<div><strong>${esc(job.title)}</strong><small>${esc(job.company)}</small></div></div><div class="divider"></div><div class="preview-anon">${icon('lock',16)} Shared without your name until both sides connect</div><h3>What the recruiter receives</h3><p>A short introduction, your selected Proof-of-Work Cards, supported skills, and open qualification questions.</p><div class="request-preview-bottom">${icon('checkCircle',18)} A higher-context introduction.</div></div></aside>
    </div>
    `,'discover');
}
function pending() {
  const job=activeJob(); const application=state.applications[job.id];
  if (!application) return dashboard();
  if (application.status==='connected') return connections();
  return dashboardShell(`<button class="back-link" data-action="nav" data-view="connections">${icon('arrowLeft',17)} Your introductions</button>
    <div class="pending-shell"><div class="pending-check">${icon(application.status==='declined'?'info':'check',33)}</div><span class="eyebrow-label">YOUR INTRODUCTION</span><h1>${application.status==='declined'?'Not moving forward this time.':'Your interest has been shared.'}</h1><p>${application.status==='declined'?'In this simulated scenario, the recruiter chose not to connect. Your proof is still available for other opportunities.':`Your selected work evidence is ready for review by ${esc(job.company)}. This is a local simulation; no real application has been sent.`}</p>
      <div class="pending-progress"><div class="pending-progress-step complete"><span>${icon('check',18)}</span><div><strong>You expressed interest</strong><small>Shared your selected work evidence</small></div></div><div class="progress-track"></div><div class="pending-progress-step ${application.status==='declined'?'complete':''}"><span>${application.status==='declined'?icon('check',18):icon('clock',18)}</span><div><strong>Recruiter review</strong><small>${application.status==='declined'?'Demo decision recorded':'Awaiting a demo decision'}</small></div></div><div class="progress-track"></div><div class="pending-progress-step"><span>${icon('message',18)}</span><div><strong>Mutual connection</strong><small>Messaging unlocks if the recruiter accepts</small></div></div></div>
      <div class="pending-demo-callout"><div>${icon('users',22)}</div><div><strong>Continue the demo from the other side</strong><p>See exactly what the recruiter receives and decide whether to connect. Clearly simulated—no real employer activity.</p></div></div>
      <div class="pending-buttons">${button(`Open recruiter demo ${icon('arrowRight',17)}`,'recruiter-open','btn-primary')}${button('Explore more roles','discover','btn-outline')}</div>
    </div>
    `,'connections');
}
function recruiter() {
  const appEntries=Object.entries(state.applications).filter(([,a])=>a.status==='interested');
  const current=state.applications[state.activeJobId]?.status==='interested'?state.activeJobId:appEntries[0]?.[0];
  if (!current) {
    return `<main class="recruiter-page"><div class="recruiter-topbar"><div>${wordmark()}<span class="recruiter-switch-pill">RECRUITER DEMO · SIMULATED</span></div>${button(`${icon('arrowLeft',17)} Back to candidate`,'home','btn-outline')}</div><div class="recruiter-empty"><div class="empty-icon">${icon('users',32)}</div><span class="eyebrow-label">RECRUITER PERSPECTIVE</span><h1>No pending introductions yet.</h1><p>Start as Maya and express interest in a role. Then return here to see the candidate's evidence as the recruiter would.</p>${button(`Explore candidate roles ${icon('arrowRight',17)}`,'discover','btn-primary')}</div></main>`;
  }
  state.activeJobId=current;
  const job=jobById(current); const application=state.applications[current];
  const sharedProofs=application.sharedProofs || state.proofs.filter(p=>application.proofIds.includes(p.id)); const e=evaluate(job,sharedProofs);
  return `<main class="recruiter-page"><div class="recruiter-topbar"><div class="recruiter-brand">${wordmark()}<span class="recruiter-switch-pill">RECRUITER DEMO · SIMULATED</span></div>${button(`${icon('arrowLeft',17)} Candidate view`,'home','btn-outline')}</div>
    <div class="recruiter-body"><div class="recruiter-aside"><span class="side-overline">HIRING WORKSPACE</span><div class="recruiter-company">${companyMark(job)}<div><strong>${esc(job.company)}</strong><span>Hiring for ${esc(job.title)}</span></div></div><div class="recruiter-selected">${icon('users',18)} <span>Introductions</span><span class="recruiter-count">${appEntries.length}</span></div><div class="recruiter-aside-note">${icon('shield',20)}<p>Sample recruiter account. Applications and decisions exist only in your browser.</p></div></div>
    <div class="recruiter-content"><div class="recruiter-content-head"><div><span class="eyebrow-label">NEW INTRODUCTION · CANDIDATE-INITIATED</span><h1>See the work behind the candidate.</h1><p>A candidate you might not have found by searching for previous PM titles.</p></div>${tag('Awaiting review','gold')}</div>
    <div class="recruiter-candidate"><div class="anonymous-avatar">${icon('lock',24)}</div><div><span class="mini-label">PRIVATE CANDIDATE · ID #014</span><h2>${esc(state.currentRole)} <span>→</span> ${esc(state.targetRole)}</h2><p>${esc(state.experience)} of experience · Identity shown after mutual connection</p></div></div>
    <div class="recruiter-grid"><section class="recruiter-main"><div class="recruiter-section-title"><span>01</span><h3>Why this person may fit</h3></div><div class="recruiter-map">${e.supported.map(s=>`<div class="recruiter-match"><div class="match-left"><span class="supported-circle">${icon('check',16)}</span><strong>${esc(s.skill)}</strong><small>${esc(shortText(s.proof.action,155))}</small></div><div class="match-right"><span>ROLE REQUIREMENT</span><p>${esc(s.why)}</p></div></div>`).join('')||'<p>No requirements are supported by the selected work stories.</p>'}</div>
        <div class="recruiter-section-title second"><span>02</span><h3>Original work evidence</h3></div>${sharedProofs.map(p=>`<div class="recruiter-proof"><h4>${esc(p.title)}</h4>${[p.problem,p.action,p.outcome].map((value,i)=>value?.trim()?`<div class="proof-detail"><strong>${esc(proofTemplate(p).labels[i])}</strong><p>${esc(value)}</p></div>`:'').join('')}</div>`).join('')}
      </section><aside class="recruiter-right"><div class="recruiter-note"><span>FROM THE CANDIDATE</span><p>“${esc(application.intro)}”</p></div><div class="recruiter-gaps"><h3>${icon('alert',18)} Still to evaluate</h3><p>Missing evidence is not proof of missing ability.</p>${e.gaps.map(g=>`<div>${icon('circle',15)}<span>${esc(g.skill)}</span></div>`).join('')||'<span>All listed requirements have supporting evidence.</span>'}</div><div class="recruiter-actions"><span class="eyebrow-label">YOUR DECISION</span><h3>Worth a conversation?</h3><p>Your decision—not an algorithm—determines the next step.</p>${button(`${icon('handshake',18)} Invite to connect`,'recruiter-accept','btn-primary btn-full')}${button('Not this time','recruiter-decline','btn-outline btn-full')}</div></aside></div>
    <div class="recruiter-bottom">${icon('info',17)} This is an interactive simulation. The recruiter action is performed by the demo reviewer, not a real hiring team.</div></div></div>
  </main>`;
}
function connections() {
  const apps=Object.entries(state.applications).map(([id,a])=>({job:jobById(id),a}));
  const current=state.applications[state.activeJobId]?.status==='connected'?state.activeJobId:apps.find(x=>x.a.status==='connected')?.job.id;
  const job=current?jobById(current):null;
  const items=current ? (state.messages[current]||[]) : [];
  return dashboardShell(`<div class="dash-topline"><div><span class="eyebrow-label">YOUR NEXT CONVERSATION</span><h1>Connections built on work<span class="gold-dot">.</span></h1><p>Direct messages unlock only after both you and the recruiter express interest.</p></div><div class="dashboard-date">${icon('lock',17)} Your conversations are local demo data</div></div>
    ${!apps.length?`<div class="empty-connections"><div class="empty-icon">${icon('handshake',28)}</div><h2>Your introductions will appear here.</h2><p>Find a role, share work evidence, and express interest to begin.</p>${button(`Explore opportunities ${icon('arrowRight',17)}`,'discover','btn-primary')}</div>`:`<div class="connections-layout"><section class="connections-list"><div class="connections-list-heading">YOUR INTRODUCTIONS <span>${apps.length}</span></div>${apps.map(({job:j,a})=>`<button class="connection-item ${current===j.id?'active':''}" data-action="connection-select" data-job="${j.id}">${companyMark(j)}<div><strong>${esc(j.company)}</strong><small>${esc(j.title)}</small>${statusBadge(a.status)}</div></button>`).join('')}</section><section class="conversation-area">${job?`<div class="conversation-top">${companyMark(job)}<div><strong>${esc(job.company)}</strong><span>${esc(job.recruiter)} · ${esc(job.recruiterTitle)}</span></div>${tag('Mutual interest','green')}</div><div class="conversation-subhead">${icon('handshake',18)} Connected through your ${esc(state.proofs[0]?.title||'work evidence')}</div><div class="message-list"><div class="conversation-day">SIMULATED DEMO CONVERSATION</div>${items.map(m=>`<div class="bubble-wrap ${m.sender==='candidate'?'mine':'theirs'}"><div class="bubble">${esc(m.text)}</div><small>${m.sender==='candidate'?'You':esc(job.recruiter)}</small></div>`).join('')}</div><form id="message-form" class="composer"><input id="message-input" name="message" value="${esc(typingMessage)}" placeholder="Write a message…" autocomplete="off" aria-label="Your message"/><button type="submit" aria-label="Send message">${icon('send',20)}</button></form>`:`<div class="conversation-placeholder"><div class="empty-icon">${icon('clock',27)}</div><h2>Still waiting for a decision.</h2><p>Open the simulated recruiter view to review the evidence and accept an introduction.</p>${button(`Open recruiter demo ${icon('arrowRight',17)}`,'recruiter-open','btn-primary')}</div>`}</section></div>`}
  `,'connections');
}
function layout() {
  const onboard=['welcome','story','skills'].includes(state.view);
  const recruiterView=state.view==='recruiter';
  let content;
  switch(state.view) {
    case 'welcome': content=welcome(); break;
    case 'story': content=story(); break;
    case 'skills': content=skillsView(); break;
    case 'home': content=dashboard(); break;
    case 'discover': content=discover(); break;
    case 'profile': content=profile(); break;
    case 'job': content=jobDetail(); break;
    case 'interest': content=interest(); break;
    case 'pending': content=pending(); break;
    case 'recruiter': content=recruiter(); break;
    case 'connections': content=connections(); break;
    default: content=welcome();
  }
  return `${recruiterView?'':header()}${content}${recruiterView?'':footer()}${state.toast?`<div class="toast" role="status">${icon('info',18)} ${esc(state.toast)}<button data-action="dismiss-toast">${icon('close',16)}</button></div>`:''}`;
}
function render() { persist(); appEl.innerHTML=layout(); document.title=`Pathline — ${state.view==='welcome'?'Your next role starts with your work':state.view==='recruiter'?'Recruiter demo':state.view==='discover'?'Explore roles':'Evidence-first career transitions'}`; }
function focusAfterRender(id,start,end) { render(); const el=document.getElementById(id); if (el) { el.focus(); if (typeof el.setSelectionRange==='function' && start!=null) el.setSelectionRange(start,end); } }

appEl.addEventListener('input', e=>{
  const t=e.target;
  if (t.dataset.story) state.draft[t.dataset.story]=t.value;
  if (t.dataset.model) {
    state[t.dataset.model]=t.value;
    if (t.dataset.model==='search') {
      const start=t.selectionStart,end=t.selectionEnd;
      focusAfterRender('role-search',start,end);
    }
  }
  if (t.id==='message-input') typingMessage=t.value;
  persist();
});
appEl.addEventListener('change', e=>{
  const t=e.target;
  if (t.dataset.model && t.tagName==='SELECT') {state[t.dataset.model]=t.value;render();}
});
appEl.addEventListener('submit', e=>{
  if (e.target.id==='message-form') {
    e.preventDefault();
    const job=activeJob(); const text=typingMessage.trim();
    if (!text||state.applications[job.id]?.status!=='connected') return;
    state.messages[job.id] ||= [];
    state.messages[job.id].push({sender:'candidate',text}); typingMessage=''; render();
    const list=document.querySelector('.message-list'); if(list) list.scrollTop=list.scrollHeight;
    const input=document.querySelector('#message-input'); if(input) input.focus();
  }
});
appEl.addEventListener('click', e=>{
  const target=e.target.closest('[data-action]'); if(!target||target.disabled)return;
  const act=target.dataset.action;
  const jobId=target.dataset.job;
  switch(act) {
    case 'nav':
      if (!eligibleForNav() && !['welcome','story','skills'].includes(target.dataset.view)) return;
      go(target.dataset.view); break;
    case 'home': go('home'); break;
    case 'discover': go('discover'); break;
    case 'mobile-menu': state.sidebarMobile=!state.sidebarMobile; render(); break;
    case 'start':
      if (!state.currentRole.trim()||!state.targetRole.trim()) {toast('Add your current and next role to continue.');return;}
      state.editingProofId=null; state.draft={...DEMO_STORY}; go('story'); break;
    case 'choose-proof-type': {
      const type=target.dataset.type; if (!PROOF_TEMPLATES[type]) return;
      // Preserve typed content when switching: change the questions, not the work.
      state.draft={...state.draft,type}; render();break;
    }
    case 'sample-story': state.draft={...PROOF_EXAMPLES[proofType(state.draft)], id:state.draft.id}; render();break;
    case 'analyze-story': {
      const d=state.draft;
      if(!d.problem.trim()||!d.action.trim()) {toast('Add your work context and personal contribution before continuing.');return;}
      const inferred=inferSkills(d);
      state.suggestedSkills=inferred;
      state.selectedSkills=inferred.filter(x=>state.editingProofId ? (state.proofs.find(p=>p.id===state.editingProofId)?.selectedSkills||[]).includes(x.name) : (state.draft.id===DEMO_STORY.id && proofType(state.draft)==='problem' ? DEMO_STORY.selectedSkills.includes(x.name) : true)).map(x=>x.name);
      go('skills');break;
    }
    case 'toggle-skill': {
      const skill=target.dataset.skill;
      state.selectedSkills=state.selectedSkills.includes(skill)?state.selectedSkills.filter(x=>x!==skill):[...state.selectedSkills,skill];render();break;
    }
    case 'edit-story':go('story');break;
    case 'confirm-skills': {
      if(!state.selectedSkills.length) {toast('Please select at least one skill your work supports.');return;}
      const id=state.editingProofId||'proof-'+Date.now();
      const proof={...state.draft,id,selectedSkills:[...state.selectedSkills]};
      const index=state.proofs.findIndex(p=>p.id===id);
      if(index===-1) state.proofs.push(proof);else state.proofs[index]=proof;
      state.editingProofId=null;
      go(state.proofs.length===1&&index===-1?'home':'profile'); break;
    }
    case 'add-proof':state.editingProofId=null;state.draft={id:'',type:'problem',title:'',problem:'',action:'',outcome:'',selectedSkills:[]};go('story');break;
    case 'edit-proof': {
      const proof=state.proofs.find(p=>p.id===target.dataset.proof);if(!proof)return;
      state.editingProofId=proof.id;state.draft={...proof,type:proofType(proof)};go('story');break;
    }
    case 'open-job':changeJob(jobId);break;
    case 'open-interest': {
      state.selectedProofIds=state.proofs.map(p=>p.id);
      state.intro=`I'm transitioning from ${state.currentRole} into ${state.targetRole}. In my previous work, ${shortText(state.proofs[0]?.action||'I solved meaningful problems with my team',150).replace(/\.$/,'').replace(/^I /,'I ')}. I'd love to discuss how that experience could translate to your team.`;
      go('interest');break;
    }
    case 'toggle-proof': {
      const id=target.dataset.proof;
      state.selectedProofIds=state.selectedProofIds.includes(id)?state.selectedProofIds.filter(x=>x!==id):[...state.selectedProofIds,id];render();break;
    }
    case 'submit-interest': {
      if(!state.selectedProofIds.length)return;
      const job=activeJob();
      state.applications[job.id]={status:'interested',proofIds:[...state.selectedProofIds],sharedProofs:state.proofs.filter(p=>state.selectedProofIds.includes(p.id)).map(p=>({...p,selectedSkills:[...p.selectedSkills]})),intro:state.intro.trim()||`I'm interested in ${job.title} and would love to share how my past work may translate.`,timestamp:new Date().toISOString()};
      go('pending');break;
    }
    case 'view-application': {
      const application=state.applications[state.activeJobId];
      go(application?.status==='connected'?'connections':'pending');break;
    }
    case 'recruiter-open':go('recruiter');break;
    case 'recruiter-accept': {
      const job=activeJob();const application=state.applications[job.id]; if(!application)return;
      application.status='connected';
      state.messages[job.id] ||= [{sender:'recruiter',text:`Hi ${state.name.split(' ')[0]}! ${job.recruiterOpener}`}];
      go('connections');break;
    }
    case 'recruiter-decline': {
      const application=state.applications[state.activeJobId]; if(!application)return;
      application.status='declined';go('pending');break;
    }
    case 'connection-select': {
      state.activeJobId=jobId;
      const status=state.applications[jobId]?.status;
      go(status==='connected'?'connections':'pending');break;
    }
    case 'clear-search':state.search='';state.arrangement='All';render();break;
    case 'dismiss-toast':state.toast='';render();break;
    case 'reset':
      if(window.confirm('Restart the Pathline demo? This clears all locally saved sample progress.')) {
        try{localStorage.removeItem(KEY)}catch(_){} state=freshState();typingMessage='';go('welcome');
      }
      break;
    default:break;
  }
});

render();
