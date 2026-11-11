import assert from 'node:assert/strict';
const handlers={};let html='';const store=new Map();
globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
globalThis.window={scrollTo(){},confirm(){return true}};
globalThis.document={title:'',querySelector(q){if(q==='#app')return {set innerHTML(v){html=v},get innerHTML(){return html},addEventListener(n,fn){handlers[n]=fn}};return null},getElementById(){return null}};
await import('./src/app.js');
function click(action,data={}){const target={dataset:{action,...data},disabled:false,closest(){return this}};handlers.click({target});}
function input(name,value){handlers.input({target:{dataset:{credential:name},value,tagName:'INPUT'}})}
function changeToggle(checked){handlers.change({target:{dataset:{toggle:'shareCredentials'},checked}})}
click('start');click('analyze-story');click('confirm-skills');
assert.match(html,/EDUCATION & CREDENTIALS/);
assert.match(html,/Skip for now/);
input('title','Google Analytics Certification');input('issuer','Google');
// Set type to certification
handlers.change({target:{dataset:{credential:'type'},tagName:'SELECT',value:'certification'}});
click('save-credential');
assert.match(html,/Google Analytics Certification/);
click('finish-credentials');assert.match(html,/Roles worth a closer look/);
click('nav',{view:'profile'});assert.match(html,/Education & Credentials/);
click('nav',{view:'discover'});click('open-job',{job:'cedar-analyst'});
assert.match(html,/You have provided this credential/);
click('open-interest');assert.match(html,/Share my 1 credential/);changeToggle(true);
click('submit-interest');click('recruiter-open');
assert.match(html,/Education & credentials/);assert.match(html,/Google Analytics Certification/);assert.match(html,/Candidate-provided; not verified/);
click('recruiter-accept');assert.match(html,/Connected through/);
console.log('PASS: optional credential onboarding, matching, consent-based sharing and recruiter visibility');
click('reset');click('start');click('analyze-story');click('confirm-skills');click('finish-credentials');
assert.match(html,/Roles worth a closer look/);
click('nav',{view:'discover'});click('open-job',{job:'cedar-analyst'});
assert.match(html,/Not provided in your Pathline profile/);
console.log('PASS: skip onboarding and transparent missing mandatory credential');
