// Service rules are snapshotted into each agreed visit; publishing never rewrites old jobs.
export const DEFAULT_RULES = {
  leaves: { base:150, minutes:90, mode:'instant', questions:[
    {key:'debris',label:'Are there branches or storm debris?',type:'select',required:true,default:'no',options:['no','yes'],when:'',equals:'yes',price:30,minutes:15,prep:'Heavy-duty rake'},
    {key:'rearAccess',label:'Can a wheelbarrow reach the debris?',type:'select',required:true,default:'easy',options:['easy','difficult'],when:'debris',whenValue:'yes',equals:'difficult',price:20,minutes:15,prep:'Small transport cart'}
  ]},
  gutters: {base:120,minutes:90,mode:'instant',questions:[{key:'guards',label:'Are gutter guards fitted?',type:'select',required:true,default:'no',options:['no','yes'],when:'',equals:'yes',price:35,minutes:30,prep:'Gutter-guard removal tools'}]},
  sprinklers: {base:85,minutes:60,mode:'instant',questions:[{key:'zones',label:'How many sprinkler zones?',type:'select',required:true,default:'up to 6',options:['up to 6','7 or more'],when:'',equals:'7 or more',price:0,minutes:0,prep:'Confirm system capacity',review:true}]},
  mowing: {base:40,minutes:45,mode:'instant',questions:[{key:'overgrown',label:'Is the lawn unusually overgrown?',type:'select',required:true,default:'no',options:['no','yes'],when:'',equals:'yes',price:20,minutes:15,prep:'Heavy-duty trimmer'}]}
};
let published = structuredClone(DEFAULT_RULES);
export const getRules = () => structuredClone(published);
export function publishRules(config) { validateRules(config); published=structuredClone(config); }
export function validateRules(config) {
  for (const [id,s] of Object.entries(DEFAULT_RULES)) {
    const c=config[id]; if(!c || !Number.isFinite(c.base) || c.base<0 || !Number.isInteger(c.minutes) || c.minutes<15 || c.minutes>600 || !['instant','quote'].includes(c.mode) || !Array.isArray(c.questions)) throw Error('Use a non-negative price and 15–600 whole minutes for each service.');
    const seen=new Set();
    for(const q of c.questions) {
      if(!q.key || seen.has(q.key) || !q.label?.trim() || !['select','text','number'].includes(q.type)) throw Error('Every question needs a unique key, label, and supported answer type.');
      if(q.when && !seen.has(q.when)) throw Error('A conditional question must depend on an earlier question.');
      if(q.type==='select' && (!q.options?.length || !q.options.includes(q.default))) throw Error('Select questions need options and a matching default answer.');
      if(!Number.isFinite(q.price)||q.price<0||!Number.isInteger(q.minutes)||q.minutes<0||q.minutes>180) throw Error('Question effects need a non-negative price and 0–180 whole minutes.');
      seen.add(q.key);
    }
  }
}
export function visibleQuestions(service,draft,config=draft.catalogSnapshot??getRules()) {
  const answers=draft.answers?.[service]??{}, visible=new Set();
  return (config[service]?.questions??[]).filter(q=>{
    const parent=config[service].questions.find(p=>p.key===q.when);
    const show=!q.when || (visible.has(q.when) && String(answers[q.when]??parent?.default??'')===String(q.whenValue));
    if(show)visible.add(q.key);return show;
  });
}
export function effects(service,draft) {
  const c=(draft.catalogSnapshot??getRules())[service], answers=draft.answers?.[service]??{};
  const visible=visibleQuestions(service,draft);
  const active=visible.filter(q=>String(answers[q.key]??q.default??'').trim()!=='' && String(answers[q.key]??q.default??'')===String(q.equals));
  return {price:active.reduce((n,q)=>n+q.price,0),minutes:active.reduce((n,q)=>n+q.minutes,0),prep:active.map(q=>q.prep).filter(Boolean),review:c.mode==='quote'||active.some(q=>q.review),missing:visible.filter(q=>(q.required && String(answers[q.key]??q.default??'').trim()==='') || (q.type==='number' && String(answers[q.key]??q.default??'')!=='' && !Number.isFinite(Number(answers[q.key]??q.default)))).map(q=>q.label)};
}
