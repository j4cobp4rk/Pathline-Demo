import assert from 'node:assert/strict';
const handlers={};let html='';
const storage=new Map();
globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
globalThis.window={scrollTo(){},confirm(){return true}};
globalThis.document={title:'',querySelector(q){if(q==='#app')return {set innerHTML(value){html=value},get innerHTML(){return html},addEventListener(name,fn){handlers[name]=fn}};return null},getElementById(){return null}};
await import('./src/app.js');
function click(action,data={}){const target={dataset:{action,...data},disabled:false,closest(){return this}}; handlers.click({target});}
function input(field,value){handlers.input({target:{dataset:{story:field},value}})}
assert.match(html,/Your next role/);
click('start');assert.match(html,/People I supported/);
click('choose-proof-type',{type:'people'});assert.match(html,/Who did you support/);
click('sample-story');assert.match(html,/Building trust with students/);
click('analyze-story');assert.match(html,/Stakeholder communication/);
click('confirm-skills');assert.match(html,/Proof-of-Work/);
click('nav',{view:'profile'});assert.match(html,/Who did you support/);
click('nav',{view:'discover'});click('open-job',{job:'northstar-apm'});click('open-interest');click('submit-interest');click('recruiter-open');assert.match(html,/Who did you support/);click('recruiter-accept');assert.match(html,/Connected through/);
console.log('PASS: guided experience template, skills, profile, interest, recruiter review, connection.');
click('reset');click('start');click('choose-proof-type',{type:'responsibility'});click('sample-story');click('analyze-story');assert.match(html,/Operational coordination/);click('confirm-skills'); console.log('PASS: responsibility template and skill extraction.');
