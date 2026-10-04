import { app } from '../../scripts/app.js';
import { api } from '../../scripts/api.js';

const BASE = new URL('.', import.meta.url);
const VERSION = '2.2.0';
let catalog, root, body, statusText, statusBar, progress, current = null, opening = false, loading = false;
let externalGraph = null, infoCache = null, submitting = false, activePrompt = null, transferring = false, polling = false;
const mediaInfo = new Map();
const snapshots = new Map(), results = new Map(), jobs = new Map();
const removedResults = new Set(), hiddenJobs = new Set();
let lastCleanup = null;
const resultKey = item => JSON.stringify([item.promptID,item.node,item.file?.type,item.file?.subfolder,item.file?.filename,item.text]);
const storageKey = 'neural-underground-session-v1';
const outputLabels = {'el_escaner':{'3':'Mapa de pose'},'el_aislante':{'20':'Máscara','21':'Recorte con transparencia'},'el_doble':{'15':'res_multistep · simple','26':'Euler · simple','27':'Euler ancestral · beta','31':'DPM++ 2M · sgm_uniform'}};
const busyInputs = new Set();
// ── El Implante: solo LoRAs de Z-Image (los detecta el servidor) y palabra clave automática en la descripción ──
let ziLoras = null, ziLoading = false, ziAviso = false;
async function loadZiLoras(){if(ziLoading)return;ziLoading=true;try{ziLoras=await (await api.fetchApi('/neural_underground/loras_zimage')).json();}catch{ziLoras={};}finally{ziLoading=false;}}
const loraBase = v => String(v||'').replaceAll('\\','/').split('/').pop();
const loraLabel = v => loraBase(v).replace(/\.safetensors$/i,'');
function loraTrigger(v){const known=(current?.loraTriggers||{})[loraBase(v)];return known||ziLoras?.[v]?.trigger||null;}
function withTrigger(text,t,add){
  text=String(text||'');if(!t)return text;
  const esc=t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  text=text.replace(new RegExp(`^\\s*${esc}\\s*,?\\s*`,'i'),'').replace(new RegExp(`\\s*,\\s*${esc}(?=\\s*(,|$))`,'gi'),'');
  return add?(text.trim()?`${t}, ${text.trim()}`:t):text.trim();
}
function swapTrigger(oldLora,newLora,descNode=6){
  const w=widget(descNode,'text');if(!w)return;let text=w.value;
  const a=loraTrigger(oldLora),b=loraTrigger(newLora);
  if(a&&a!==b)text=withTrigger(text,a,false);if(b)text=withTrigger(text,b,true);
  if(text!==w.value)setWidget(descNode,'text',text);
}

function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style') Object.assign(e.style, v);
    else if (v != null) e.setAttribute(k, v);
  }
  for (const c of children.flat()) if (c != null) e.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return e;
}
const btn = (label, fn, extra='') => el('button',{type:'button',class:`nu-btn ${extra}`,onclick:fn},label);
const findModule = id => catalog.modules.find(m=>m.id === id);
const graphID = () => app.graph?.extra?.neural_underground?.id;
const getNode = id => app.graph?.getNodeById?.(id) || app.graph?._nodes?.find(n=>String(n.id)===String(id));
const widget = (id,name,fallback) => {
  const ws=getNode(id)?.widgets || [];
  return ws.find(w=>w.name===name) || (Number.isInteger(fallback) ? ws[fallback] : null);
};
function message(s, error=false) {
  if(statusText) statusText.textContent=s;
  if(statusBar) statusBar.classList.toggle('error',error);
}
function art(m) { return el('img',{class:'nu-art',src:new URL(`assets/modulo_${String(m.index).padStart(2,'0')}.jpg`,BASE).href,alt:`Portada de ${m.title}`,loading:'lazy',draggable:'false'}); }
// Ocupa la zona del lienzo y deja visibles la barra superior y la lateral de ComfyUI (igual que La Casa Maldita).
function place() {
  if(!root)return;let top=0,left=0;
  for(const sel of ['.comfyui-body-top','.comfy-menu-bar','.top-menubar','.workflow-tabs-container','.comfyui-menu'])
    document.querySelectorAll(sel).forEach(e=>{const r=e.getBoundingClientRect();if(r.height>0&&r.top<160)top=Math.max(top,r.bottom);});
  const side=document.querySelector('.side-tool-bar-container');if(side){const r=side.getBoundingClientRect();if(r.width&&r.left<80)left=r.right;}
  const bottomBar=document.querySelector('.comfyui-body-bottom');const bottom=bottomBar?bottomBar.getBoundingClientRect().height:0;
  Object.assign(root.style,{top:`${top}px`,left:`${left}px`,right:'0px',bottom:`${bottom}px`});
}
function jsonDownload(name,data) { downloadBlob(name,new Blob([JSON.stringify(data,null,2)],{type:'application/json'})); }
function downloadBlob(name,blob) { const u=URL.createObjectURL(blob),a=el('a',{href:u,download:name});a.click();setTimeout(()=>URL.revokeObjectURL(u),1000); }
function viewURL(f) { const q=new URLSearchParams({filename:f.filename,subfolder:f.subfolder || '',type:f.type || 'output'});return api.apiURL(`/view?${q}`); }
function inputURL(name) {const parts=name.replaceAll('\\','/').split('/');return viewURL({filename:parts.pop(),subfolder:parts.join('/'),type:'input'});}
async function fetchJSON(url, options) {const r=await fetch(url,options);if(!r.ok) throw new Error(`HTTP ${r.status}: ${url}`);return r.json();}
async function objectInfo(refresh=false) {if(refresh || !infoCache)infoCache=await (await api.fetchApi('/object_info')).json();return infoCache;}
function remember() {
  if(current && graphID()===current.id) snapshots.set(current.id, app.graph.serialize());
  try {sessionStorage.setItem(storageKey,JSON.stringify({version:VERSION,externalGraph,snapshots:[...snapshots],results:[...results],jobs:[...jobs],removedResults:[...removedResults],hiddenJobs:[...hiddenJobs],lastCleanup}));} catch { message('La sesión ocupa demasiado. Exporta el JSON antes de cerrar la pestaña.',true); }
}
function restoreSession() {
  try {const d=JSON.parse(sessionStorage.getItem(storageKey)||'null');if(!d || d.version!==VERSION)return;
    externalGraph=d.externalGraph||null;
    for(const key of d.removedResults||[])removedResults.add(key);
    for(const id of d.hiddenJobs||[])hiddenJobs.add(id);
    lastCleanup=d.lastCleanup||null;
    for(const [k,v] of d.snapshots||[])snapshots.set(k,v);
    for(const [k,v] of d.results||[])results.set(k,v);
    for(const [k,v] of d.jobs||[])jobs.set(k,v);
  }catch{}
}
function setWidget(id, name, value, fallback) {
  const n=getNode(id),w=widget(id,name,fallback);if(!w)throw new Error(`No existe el control ${name} en el nodo ${id}. Abre «Ver nodos» para revisar tu versión.`);
  w.value=value;
  if(typeof w.callback==='function') w.callback(value,app.canvas,n,app.canvas?.graph_mouse,{});
  n?.setDirtyCanvas?.(true,true); app.graph?.setDirtyCanvas?.(true,true);
}
function choices(w) {let v=w?.options?.values;if(typeof v==='function'){try{v=v();}catch{return null;}}return Array.isArray(v)?v:null;}
function setFile(input,name) {
  const w=widget(input.node,input.widget,input.fallbackIndex),opts=choices(w);
  if(opts&&!opts.includes(name))opts.push(name);
  setWidget(input.node,input.widget,name,input.fallbackIndex);
}
const elapsed = ms => {const s=Math.max(0,Math.floor(ms/1000));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
function makeShell() {
  if(root)return;
  root=el('section',{id:'nu-app',role:'dialog','aria-label':'Neural Underground'});
  body=el('main',{class:'nu-body'});statusText=el('span',{},'El Nexo está listo.');progress=el('progress',{max:100,value:0});progress.hidden=true;
  statusBar=el('footer',{class:'nu-status','aria-live':'polite'},progress,statusText,el('span',{class:'nu-ver'},'EDICIÓN 01 · BETA'));
  const home=()=>{remember();renderHome();};
  const top=el('header',{class:'nu-top'},el('div',{class:'nu-logo',title:'Volver a El Nexo',onclick:home},'◈ NEURAL',el('small',{},'UNDERGROUND')),
    el('nav',{},btn('◈ El Nexo',home),btn('⌬ Ver nodos',()=>{remember();root.hidden=true;}),btn('⇩ Exportar JSON',()=>{if(current&&graphID()===current.id){remember();jsonDownload(current.file,app.graph.serialize());}else message('Abre un módulo para exportarlo.',true);}),btn('↶ Grafo anterior',restoreExternal),btn('✕ Cerrar',()=>{remember();root.hidden=true;},'close')));
  root.append(el('div',{class:'nu-fx'}),el('div',{class:'nu-frame'},top,body,statusBar));
  document.body.append(root);
  window.addEventListener('resize',place);
}
async function launch() {
  try {if(!catalog){catalog=await fetchJSON(new URL('catalog.json',BASE));restoreSession();}makeShell();root.hidden=false;place();
    const m=findModule(graphID());if(m){if(m.id==='el_escaner'&&getNode(5)?.type==='LayerUtility: Florence2Image2Prompt'){await openModule(m);return;}current=m;renderModule();}else renderHome();
  }catch(e){console.error(e);alert(`Neural: ${e.message}`);}
}
function renderHome() {
  root.hidden=false;place();body.replaceChildren();
  body.append(el('div',{class:'nu-hero'},el('div',{class:'nu-eyebrow'},`EL NEXO · ${catalog.modules.length} ESPECIALISTAS`),el('h1',{},'NEURAL ',el('span',{},'UNDERGROUND')),el('p',{},'Tu laboratorio bajo la ciudad. Analiza, transforma y conecta tus resultados: elige un especialista para abrir sus herramientas.'),el('i',{class:'nu-line'})));
  const grid=el('div',{class:'nu-grid'});
  for(const m of catalog.modules)grid.append(el('button',{class:'nu-card',type:'button',title:`Abrir ${m.title}`,onclick:()=>openModule(m)},el('div',{class:'nu-card-art'},art(m),el('span',{class:'nu-num'},String(m.index).padStart(2,'0'))),el('div',{class:'nu-card-copy'},el('div',{class:'nu-card-tag'},'Acceso al módulo'),el('h2',{},m.title),el('p',{},m.subtitle))));
  body.append(grid,el('p',{class:'nu-note',style:{marginTop:'22px'}},'Los modelos se ejecutan en tu ComfyUI. Cada módulo comprueba sus nodos y modelos; el pack no instala ni descarga dependencias automáticamente.'));
  renderJobs(body);
}
async function openModule(m, transfer=null) {
  if(loading || submitting || busyInputs.size || (transferring&&!transfer)){message('Espera a que termine la carga actual.',true);return;}
  loading=true;message(`Abriendo ${m.title}…`);
  try {
    const oldID=graphID();if(oldID && findModule(oldID))snapshots.set(oldID,app.graph.serialize());
    else if(!externalGraph)externalGraph=app.graph.serialize();
    const g=structuredClone(snapshots.get(m.id)||await fetchJSON(new URL(`workflows/${m.file}`,BASE)));
    const info=await objectInfo();
    for(const n of g.nodes){const schema=info[n.type]?.input||{},options=Object.values({...schema.required,...schema.optional}).flatMap(spec=>Array.isArray(spec[0])?spec[0]:spec[1]?.options||[]);
      // modelos: si no está en la ruta exacta, se busca por nombre de archivo en cualquier subcarpeta (p. ej. loras/ZImage/…)
      const base=v=>v.replaceAll('\\','/').split('/').pop();
      if(Array.isArray(n.widgets_values))n.widgets_values=n.widgets_values.map(value=>{
        if(typeof value!=='string'||!options.length||options.includes(value))return value;
        const same=options.find(o=>typeof o==='string'&&o.replaceAll('\\','/')===value.replaceAll('\\','/'));if(same)return same;
        if(!/\.(safetensors|gguf|ckpt|pt|pth|bin|onnx|sft)$/i.test(value))return value;
        return options.find(o=>typeof o==='string'&&base(o)===base(value))||value;});
    }
    opening=true;await app.loadGraphData(g,true,true,m.file.replace('.json',''));opening=false;
    current=m;
    if(transfer?.text!=null){const c=m.controls.find(c=>c.kind==='text'&&!c.advanced);if(!c)throw new Error('Este módulo no tiene un prompt de destino.');for(const id of c.nodes)setWidget(id,c.widget,transfer.text,c.fallbackIndex);}
    else if(transfer){const dest=m.inputs[transfer.slot||0];if(!dest)throw new Error('El destino no admite esta entrada.');setFile(dest,transfer.name);}
    remember();renderModule();message(`${m.title}: ajusta los controles y ejecuta.`);
  }catch(e){message(e.message,true);}finally{opening=false;loading=false;}
}
async function restoreExternal() {
  if(loading||submitting||busyInputs.size||transferring)return;
  if(!externalGraph){message('No hay un grafo anterior guardado en esta sesión.');return;}
  remember();const g=externalGraph;opening=true;
  try{await app.loadGraphData(g,true,true);externalGraph=null;current=null;remember();root.hidden=true;}catch(e){message(e.message,true);}finally{opening=false;}
}
function control(c) {
  const w=widget(c.nodes[0],c.widget,c.fallbackIndex),wrap=el('label',{class:'nu-field'},el('span',{},c.label));
  if(!w){wrap.append(el('small',{},`Control no disponible: ${c.widget}. Consulta «Ver nodos».`));return wrap;}
  let field;const opts=choices(w);
  const apply=value=>{try{for(const id of c.nodes)setWidget(id,c.widget,value,c.fallbackIndex);remember();refreshSummary();}catch(e){message(e.message,true);}};
  if(c.kind==='text' || w.type==='customtext' || w.type==='text' && c.widget==='text'){
    field=el('textarea',{rows:4});field.value=w.value??'';field.addEventListener('input',()=>apply(field.value));
  }else if(opts&&c.filter==='zimage'){
    // solo LoRAs de Z-Image, con nombre legible y su palabra clave; al cambiar, la palabra clave pasa a la descripción
    const list=ziLoras?opts.filter(v=>ziLoras[v]):opts;field=el('select');
    if(!list.includes(w.value))field.append(el('option',{value:w.value},`${loraLabel(w.value)} · no disponible`));
    for(const v of list){const t=loraTrigger(v);field.append(el('option',{value:v},t?`${loraLabel(v)} · palabra clave: ${t}`:loraLabel(v)));}
    field.value=w.value;
    // elegir un LoRA activa ese implante (si estaba apagado) y pone su palabra clave
    field.addEventListener('change',()=>{const old=w.value,n=getNode(c.nodes[0]),off=n?.mode===4;ziAviso=false;apply(field.value);if(n)n.mode=0;swapTrigger(off?null:old,field.value);renderModule();});
    if(ziLoras&&!list.length)wrap.append(el('small',{},'No encuentro LoRAs de Z-Image en models/loras.'));
  }else if(opts){field=el('select');if(!opts.includes(w.value)){field.append(el('option',{value:w.value},`${w.value} · no disponible`));}
    for(const v of opts)field.append(el('option',{value:v},v));field.value=w.value;field.addEventListener('change',()=>apply(field.value));
  }else if(typeof w.value==='boolean'){field=el('input',{type:'checkbox'});field.checked=w.value;field.addEventListener('change',()=>apply(field.checked));
  }else if(typeof w.value==='number'){
    field=el('input',{type:'number'});field.value=w.value;
    const o=w.options||{};if((c.min??o.min)!=null)field.min=c.min??o.min;if((c.max??o.max)!=null)field.max=Math.min(c.max??o.max,Number.MAX_SAFE_INTEGER);
    field.step=c.step??(['seed','noise_seed','steps','width','height','length','left','right','top','bottom','resolution'].includes(c.widget)||c.kind==='seed'?'1':'any');
    field.addEventListener('change',()=>{const v=Number(field.value);if(!Number.isFinite(v) || !field.checkValidity()){message(`Valor inválido: ${c.label}`,true);field.value=w.value;return;}apply(v);});
  }else{field=el('input',{type:'text'});field.value=w.value??'';field.addEventListener('change',()=>apply(field.value));}
  if(c.kind==='seed')wrap.append(el('div',{class:'nu-seed'},field,btn('Azar',()=>{const a=new Uint32Array(1);crypto.getRandomValues(a);field.value=a[0];apply(a[0]);})));
  else wrap.append(field);
  if(c.help)wrap.append(el('small',{},c.help));return wrap;
}
async function upload(file) {
  const form=new FormData();form.append('image',file,file.name);form.append('type','input');form.append('subfolder','neural_underground');form.append('overwrite','false');
  const r=await api.fetchApi('/upload/image',{method:'POST',body:form});if(!r.ok)throw new Error(`No se pudo cargar ${file.name} (${r.status}).`);const d=await r.json();return (d.subfolder?`${d.subfolder}/`:'')+d.name;
}
function uploadControl(input,m) {
  const box=el('div',{class:'nu-upload'}),title=el('strong',{},input.label),picker=el('input',{type:'file',accept:input.kind==='video'?'video/*':'image/*','aria-label':input.label});
  const value=widget(input.node,input.widget,input.fallbackIndex)?.value;
  const preview=el('div'),name=el('div',{class:'nu-file-name'},value||'Selecciona un archivo o arrástralo aquí.');
  function show(v){preview.replaceChildren();if(!v)return;const e=el(input.kind==='video'?'video':'img',{src:inputURL(v),alt:input.label});if(input.kind==='video'){e.controls=true;e.preload='metadata';}e.addEventListener(input.kind==='video'?'loadedmetadata':'load',()=>{const data={width:e.videoWidth||e.naturalWidth,height:e.videoHeight||e.naturalHeight,duration:e.duration};mediaInfo.set(v,data);name.textContent=`${v} · ${data.width}×${data.height}${Number.isFinite(data.duration)?' · '+data.duration.toFixed(2)+' s':''}`;refreshSummary();});e.addEventListener('error',()=>{e.remove();name.textContent='Archivo de ejemplo no cargado. Selecciona tu archivo.';});preview.append(e);}
  async function receive(f){if(!f)return;if(loading||submitting||transferring||busyInputs.size){message('Espera a que termine la operación actual.',true);return;}if(current?.id!==m.id||graphID()!==m.id)return;const key=`${m.id}:${input.node}`;busyInputs.add(key);picker.disabled=true;message(`Cargando ${f.name}…`);
    try{const v=await upload(f);if(graphID()!==m.id)throw new Error('El workflow cambió durante la carga. Vuelve a cargar el archivo.');setFile(input,v);name.textContent=v;show(v);remember();message('Archivo cargado.');}
    catch(e){message(e.message,true);}finally{busyInputs.delete(key);picker.disabled=false;}}
  picker.addEventListener('change',()=>receive(picker.files[0]));box.addEventListener('dragover',e=>{e.preventDefault();box.classList.add('dragover');});box.addEventListener('dragleave',()=>box.classList.remove('dragover'));box.addEventListener('drop',e=>{e.preventDefault();box.classList.remove('dragover');receive(e.dataTransfer.files[0]);});
  box.append(title,preview,picker,name);show(value);return box;
}
// botones que rellenan un texto del módulo
function presetText(bar,label,nodeID,name,items){
  const row=el('div',{class:'nu-presets'});row.append(el('label',{},label));
  for(const [title,text] of items)row.append(btn(title,()=>{setWidget(nodeID,name,text);remember();renderModule();}));
  bar.append(row);
}
function moduleTools(parent,m){
  const bar=el('div',{class:'nu-presets'});
  if(m.id==='el_implante'){
    if(ziLoras===null){loadZiLoras().then(()=>{if(current?.id==='el_implante')renderModule();});}
    else{ // LoRAs de serie que no existen en este PC: se cambia por uno de Z-Image que sí tenga, con el implante apagado
      const mine=Object.keys(ziLoras);let fixed=0;
      [13,14].forEach((id,k)=>{const n=getNode(id),w=widget(id,'lora_name');if(!n||!w||ziLoras[w.value])return;
        const alt=mine[k]||mine[0];if(alt)setWidget(id,'lora_name',alt);n.mode=4;fixed++;});
      if(fixed){remember();ziAviso=true;}
      if(!mine.length)bar.append(el('div',{class:'nu-note'},'No tienes LoRAs de Z-Image en models/loras: El Implante genera con Z-Image Turbo sin LoRA. Pon tus LoRAs de Z-Image en esa carpeta (vale cualquier subcarpeta) y recarga.'));
      else if(ziAviso)bar.append(el('div',{class:'nu-note'},'Los LoRAs de serie no están en tu PC: elige uno de tus LoRAs de Z-Image en cada implante y se activará solo.'));
    }
    for(const [id,label] of [[13,'Implante A'],[14,'Implante B']]){const n=getNode(id);if(!n)continue;const on=el('input',{type:'checkbox'});on.checked=n.mode!==4;
      on.onchange=()=>{n.mode=on.checked?0:4;n.setDirtyCanvas?.(true,true);const lora=widget(id,'lora_name')?.value;if(on.checked)swapTrigger(null,lora);else swapTrigger(lora,null);remember();renderModule();};
      bar.append(el('label',{},on,` Activar ${label}`));}
    bar.append(btn('Mezcla suave',()=>{for(const id of [13,14])setWidget(id,'strength_model',0.5);remember();renderModule();}));
    bar.append(btn('Mezcla intensa',()=>{for(const id of [13,14])setWidget(id,'strength_model',0.9);remember();renderModule();}));
  }
  if(m.id==='el_escaner')presetText(bar,'Modo de lectura',5,'prompt',[
    ['Prompt detallado','Describe this image as one detailed paragraph that could be used as a prompt to recreate it: main subject, appearance, clothing, pose and expression, setting, lighting, colors, camera framing and visual style. Do not add an introduction.'],
    ['Breve','Describe this image in one short sentence.'],
    ['Estilo y técnica','Analyze the visual style of this image: medium, art style, color palette, lighting, lens and composition. Answer as a comma-separated list of style keywords.'],
    ['En español','Describe esta imagen en español con un párrafo detallado: sujeto, ropa, pose, entorno, iluminación, colores, encuadre y estilo visual.']]);
  if(m.id==='la_mutacion')presetText(bar,'Órdenes rápidas',2,'prompt',[
    ['De noche','Turn the scene into night time with moody moonlight and practical lights. Keep the subject, face, pose and composition unchanged.'],
    ['Cyberpunk','Turn the scene into a rainy cyberpunk night: neon reflections on wet surfaces, teal and magenta lights, keep the subject\'s face, pose and clothing unchanged.'],
    ['Invierno','Make it a snowy winter day, snow on the ground and falling snowflakes. Keep everything else unchanged.'],
    ['Cómic','Redraw the whole image as a bold comic book illustration with ink outlines and halftone shading. Keep the composition.'],
    ['Quitar fondo','Remove the background and place the subject on a plain light grey studio backdrop. Keep the subject unchanged.']]);
  if(m.id==='el_sastre')presetText(bar,'Plantillas',2,'prompt',[
    ['Ropa','The person from image 1 wears the outfit from image 2. Keep the face, hair and body of image 1 and the design and colors of the outfit from image 2. Full body, same background as image 1.'],
    ['Objeto en mano','The person from image 1 holds the object from image 2 in their hands. Keep both exactly as they look.'],
    ['Nuevo fondo','Place the person from image 1 into the scene from image 2, matching its lighting and perspective. Keep the person unchanged.']]);
  if(m.id==='el_compositor'){
    presetText(bar,'Estilos',94,'tags',[
      ['Synthwave','dark synthwave, cyberpunk, 100 BPM, pulsing analog bass, gated drums, shimmering arpeggios, atmospheric pads, female vocals, melancholic, cinematic'],
      ['Rock','alternative rock, 130 BPM, distorted guitars, driving drums, bass, energetic male vocals, anthemic chorus'],
      ['Lo-fi','lo-fi hip hop, 80 BPM, dusty drums, mellow electric piano, vinyl crackle, relaxed, instrumental'],
      ['Terror','dark ambient horror soundtrack, 70 BPM, low drones, dissonant strings, music box, whispers, unsettling, instrumental'],
      ['Reguetón','reggaeton, 95 BPM, dembow rhythm, deep 808, catchy synth lead, latin male vocals, party']]);
    bar.append(btn('Instrumental (sin letra)',()=>{setWidget(94,'lyrics','[Instrumental]');remember();renderModule();}));
    if(getNode(40)){const xl=widget(40,'value')?.value===true;const mode=(on)=>{setWidget(40,'value',on);setWidget(3,'steps',on?50:8);setWidget(3,'cfg',on?7:1);remember();renderModule();};
      const row=el('div',{class:'nu-presets'});row.append(el('label',{},`Modo actual: ${xl?'Calidad XL · 50 pasos (~50 s por minuto, voz más trabajada)':'Rápido · Turbo 8 pasos (~25 s por minuto)'}`),btn('Rápido · Turbo',()=>mode(false)),btn('Calidad XL',()=>mode(true)));bar.append(row);}
  }
  if(m.id==='la_mutacion'||m.id==='el_sastre'){const fast=getNode(23)?.mode!==4;const mode=(f)=>{const n=getNode(23);if(n)n.mode=f?0:4;setWidget(4,'steps',f?4:30);setWidget(4,'cfg',f?1:4);remember();renderModule();};
    bar.append(el('label',{},`Modo actual: ${fast?'Rápido · 4 pasos':'Calidad · 30 pasos (más lento)'}`),btn('Rápido · 4 pasos',()=>mode(true)),btn('Calidad · 30 pasos',()=>mode(false)));}
  if(m.id==='el_cronista'){const audio=el('input',{type:'checkbox'}),video=getNode(105),slot=video?.inputs?.findIndex(i=>i.name==='audio');if(slot>=0){audio.checked=video.inputs[slot].link!=null;audio.onchange=()=>{if(audio.checked)getNode(103).connect(1,video,slot);else video.disconnectInput(slot);remember();};bar.append(el('label',{},audio,' Conservar audio original (sin estirarlo)'));}}
  if(m.id==='la_orbita'){
    const speed=(fast)=>{for(const id of [109,110]){const n=getNode(id);if(n)n.mode=fast?0:4;}
      for(const [id,start,end] of [[102,0,fast?2:10],[103,fast?2:10,10000]]){setWidget(id,'steps',fast?4:20);setWidget(id,'cfg',fast?1:3.5);setWidget(id,'start_at_step',start);setWidget(id,'end_at_step',end);}
      for(const id of [100,101])setWidget(id,'shift',fast?5:8);remember();renderModule();};
    const fast=getNode(109)?.mode!==4;
    bar.append(el('label',{},`Modo actual: ${fast?'Rápido · 4 pasos (~45 s)':'Calidad · 20 pasos (~3 min)'}`),btn('Rápido · 4 pasos',()=>speed(true)),btn('Calidad · 20 pasos',()=>speed(false)));
  }
  if(['el_puente','la_orbita'].includes(m.id))bar.append(btn('Prueba corta · 33 fotogramas',()=>{for(const c of m.controls)if(c.widget==='length')for(const id of c.nodes)setWidget(id,c.widget,33);remember();renderModule();}));
  if(bar.childNodes.length)parent.append(bar);
}
function refreshSummary(){
  const box=body?.querySelector('#nu-summary');if(!box||!current)return;box.replaceChildren();
  const m=current,get=name=>{const c=m.controls.find(c=>c.widget===name);return c?Number(widget(c.nodes[0],name,c.fallbackIndex)?.value):null;};
  const input=m.inputs[0],name=input?widget(input.node,input.widget,input.fallbackIndex)?.value:null,meta=mediaInfo.get(name);
  if(['el_puente','la_orbita'].includes(m.id)){const fps=get('fps'),frames=get('length'),width=get('width'),height=get('height');box.append(`${width}×${height} · ${frames} fotogramas · ${fps} FPS · ${fps>0?(frames/fps).toFixed(2):'?'} s. Vista aproximada del recorte central:`);
    const previews=el('div',{class:'nu-frame-previews'});for(const i of m.inputs){const name=widget(i.node,i.widget,i.fallbackIndex)?.value;if(name)previews.append(el('figure',{},el('img',{src:inputURL(name),alt:i.label,style:{width:'100%',aspectRatio:`${width}/${height}`,objectFit:'cover'}}),el('figcaption',{},i.label)));}box.append(previews);
    if(m.id==='la_orbita'){const pose=widget(108,'camera_pose')?.value,explain={'Static':'◎ Cámara fija','Pan Up':'↑ Movimiento hacia arriba','Pan Down':'↓ Movimiento hacia abajo','Pan Left':'← Movimiento hacia la izquierda','Pan Right':'→ Movimiento hacia la derecha','Zoom In':'⊕ Acercamiento','Zoom Out':'⊖ Alejamiento','Anti Clockwise (ACW)':'↶ Giro antihorario','ClockWise (CW)':'↷ Giro horario'};box.append(el('strong',{},explain[pose]||pose));}
  }
  else if(m.id==='la_fuga'&&meta){const left=get('left'),top=get('top'),w=meta.width+left+get('right'),h=meta.height+top+get('bottom');box.append(`Salida prevista: ${w}×${h}. El área clara es tu imagen original.`,el('div',{class:'nu-outpaint',style:{aspectRatio:`${w}/${h}`}},el('div',{style:{position:'absolute',left:`${100*left/w}%`,top:`${100*top/h}%`,width:`${100*meta.width/w}%`,height:`${100*meta.height/h}%`,backgroundImage:`url("${inputURL(name)}")`,backgroundSize:'100% 100%',border:'1px solid #6ef3cf'}})));}
  else if(m.id==='el_cronista'){const x=Number(widget(109,'value')?.value),keep=widget(113,'value')?.value;box.append(`Multiplicador ×${x}. ${keep?'FPS de salida ≈ FPS originales × '+x+'.':'Cámara lenta: conserva los FPS originales.'} ${meta?.duration?'Duración aproximada: '+(meta.duration*(keep?1:x)).toFixed(2)+' s. ':''}Se mantienen los fotogramas en memoria; usa un clip corto para la primera prueba. ${keep?'':'El audio original no se estira; puedes quitarlo del resultado.'}`);}
  else if((m.id==='la_mutacion'||m.id==='el_sastre')&&meta){const mp=Number(widget(25,'megapixels')?.value);box.append(`Referencia: ${meta.width}×${meta.height}. ${mp?'Se trabaja a ~'+mp+' megapíxeles conservando la proporción.':'Se conserva el tamaño original.'}`);}
  else{box.hidden=true;return;}box.hidden=false;
}
function renderModule() {
  if(!current)return;const m=current;body.replaceChildren();
  body.append(el('div',{class:'nu-module-head'},art(m),el('div',{},el('div',{class:'nu-eyebrow'},`ESPECIALISTA ${String(m.index).padStart(2,'0')} / NEURAL UNDERGROUND`),el('h1',{},m.title),el('strong',{},m.subtitle),el('p',{},m.description))));
  const layout=el('div',{class:'nu-workspace'}),left=el('div',{class:'nu-controls'}),right=el('section',{class:'nu-result-area',id:'nu-result-area'});
  for(const i of m.inputs)left.append(uploadControl(i,m));
  moduleTools(left,m);
  for(const c of m.controls.filter(c=>!c.advanced))left.append(control(c));
  const adv=el('details',{},el('summary',{},'Ajustes avanzados'));for(const c of m.controls.filter(c=>c.advanced))adv.append(control(c));left.append(adv);
  left.append(el('div',{class:'nu-note'},m.risk),btn('EJECUTAR '+m.title.toUpperCase(),run,'primary nu-run'));
  const deps=el('details',{},el('summary',{},'Modelos y nodos necesarios')),check=el('pre',{class:'nu-check'},'Pulsa comprobar para consultar tu instalación.');
  deps.append(btn('Comprobar instalación',async()=>{check.textContent='Comprobando…';try{const issues=await preflight(m,true);check.textContent=issues.length?issues.join('\n'):'Nodos y valores de modelos encontrados. Falta comprobar una generación real.';}catch(e){check.textContent=e.message;}}),check,el('p',{class:'nu-file-name'},m.models.join('\n')));left.append(deps);
  left.append(el('div',{class:'nu-note',id:'nu-summary','aria-live':'polite'}));
  layout.append(left,right);body.append(layout);refreshSummary();renderResults();renderJobs(body);
}
async function preflight(m,refresh=false) {
  if(graphID()!==m.id)return ['El grafo activo no corresponde a este módulo. Ábrelo de nuevo desde El Nexo.'];
  const info=await objectInfo(refresh),issues=[];
  for(const n of app.graph._nodes||[]){
    if(n.mode===2||n.mode===4)continue;
    if(!info[n.type]){issues.push(`Falta nodo: ${n.type}`);continue;}
    for(const w of n.widgets||[]){if(m.inputs.some(i=>String(i.node)===String(n.id)&&i.widget===w.name))continue;const values=choices(w);if(values && !values.includes(w.value)){
      // Accommodate Windows folders without guessing a different model.
      const norm=s=>String(s).replaceAll('\\','/');const same=values.find(v=>norm(v)===norm(w.value));
      if(same!=null)w.value=same;else issues.push(`${n.title||n.type} → ${w.name}: no disponible «${w.value}»`);
    }}
  }
  for(const i of m.inputs){const w=widget(i.node,i.widget,i.fallbackIndex);if(!w){issues.push(`Falta entrada ${i.label}.`);continue;}if(!w.value){issues.push(`Carga: ${i.label}`);continue;}
    try{const r=await fetch(inputURL(w.value),{method:'HEAD'});if(!r.ok)issues.push(`Carga tu archivo: ${i.label} (${w.value})`);}catch{issues.push(`No se pudo verificar: ${i.label}`);}}
  for(const c of m.controls)for(const id of c.nodes){const w=widget(id,c.widget,c.fallbackIndex);if(!w){if(!c.advanced)issues.push(`Control incompatible: ${c.label} (${id}/${c.widget})`);continue;}
    if(getNode(id)?.mode===4)continue;
    if(c.step===1&&!Number.isInteger(Number(w.value)))issues.push(`${c.label}: introduce un entero.`);
    if(c.min!=null&&Number(w.value)<c.min||c.max!=null&&Number(w.value)>c.max)issues.push(`${c.label}: rango ${c.min}–${c.max}.`);
    if(c.widget==='length'&&(Number(w.value)-1)%4!==0)issues.push('Los fotogramas de Wan deben ser 4n+1: 33, 49, 65, 81…');
    if(['width','height'].includes(c.widget)&&Number(w.value)%16!==0)issues.push(`${c.label}: usa un múltiplo de 16.`);
  }
  return [...new Set(issues)];
}
async function run() {
  if(submitting||loading||busyInputs.size||transferring){message('Espera a que termine la carga.',true);return;}if(!current)return;
  submitting=true;const m=current;message('Comprobando entradas y modelos…');
  try{
    const issues=await preflight(m);if(issues.length)throw new Error(issues.join('\n'));
    if(graphID()!==m.id)throw new Error('El workflow cambió durante la comprobación. Abre el módulo antes de ejecutar.');
    const p=await app.graphToPrompt();
    if(!p.output||!Object.keys(p.output).length)throw new Error('El workflow no contiene salidas ejecutables.');
    const before=m.inputs.find(i=>i.kind==='image');
    const input=before?widget(before.node,before.widget,before.fallbackIndex)?.value:null;
    const r=await api.queuePrompt(0,p);if(!r.prompt_id)throw new Error(JSON.stringify(r));
    jobs.set(r.prompt_id,{module:m.id,state:'En cola',time:Date.now(),input,settings:m.controls.map(c=>`${c.label}: ${widget(c.nodes[0],c.widget,c.fallbackIndex)?.value}`).join('\n')});remember();message(`${m.title}: añadido a la cola.`);renderModule();
  }catch(e){const detail=e.response?JSON.stringify(e.response,null,2):e.message;message(detail||String(e),true);console.error('Neural execution',e);}
  finally{submitting=false;}
}
function renderJobs(parent) {
  const old=parent.querySelector('.nu-jobs');old?.remove();const visible=[...jobs].filter(([id])=>!hiddenJobs.has(id));if(!visible.length)return;
  const list=el('div',{class:'nu-jobs'},el('div',{class:'nu-eyebrow'},'ACTIVIDAD DE ESTA SESIÓN'));
  if(visible.some(([,j])=>j.state.startsWith('Error')))list.append(btn('Quitar errores de la lista',()=>cleanActivity(true),'danger'));
  if(visible.some(([,j])=>!['En cola','Ejecutando'].includes(j.state)))list.append(btn('Limpiar actividad finalizada',()=>cleanActivity(false)));
  for(const [id,j] of visible.slice(-8).reverse()){
    const row=el('div',{class:'nu-job'},`${findModule(j.module)?.title||j.module} · ${j.state} · `,el('span',{'data-job-time':id},jobTime(j)));
    if(['En cola','Ejecutando'].includes(j.state))row.append(btn('Cancelar',()=>cancelJob(id),'danger'));
    else row.append(btn('Quitar de la lista',()=>cleanActivity(false,id)));
    if(j.settings)row.append(el('details',{},el('summary',{},'Ajustes de esta ejecución'),el('pre',{},j.settings)));
    list.append(row);
  }parent.append(list);
}
function refreshCleanup(){remember();if(body){if(current)renderResults();renderJobs(body);}message('Panel actualizado. Los archivos de output se conservan.');}
function removeResultItems(moduleID,items){
  lastCleanup={moduleID,items,jobIDs:[]};
  for(const item of items)removedResults.add(resultKey(item));
  results.set(moduleID,(results.get(moduleID)||[]).filter(item=>!removedResults.has(resultKey(item))));
  refreshCleanup();
}
function cleanActivity(errorsOnly,id=null){
  const ids=[...jobs].filter(([key,j])=>!hiddenJobs.has(key)&&!['En cola','Ejecutando'].includes(j.state)&&(!id||id===key)&&(!errorsOnly||j.state.startsWith('Error'))).map(([key])=>key);
  lastCleanup={items:[],jobIDs:ids};for(const key of ids)hiddenJobs.add(key);refreshCleanup();
}
function undoCleanup(){
  if(!lastCleanup)return;const {moduleID,items,jobIDs}=lastCleanup;
  for(const item of items)removedResults.delete(resultKey(item));
  if(moduleID){const existing=results.get(moduleID)||[],keys=new Set(existing.map(resultKey));results.set(moduleID,[...existing,...items.filter(item=>!keys.has(resultKey(item)))]);}
  for(const id of jobIDs)hiddenJobs.delete(id);lastCleanup=null;refreshCleanup();
}
function jobTime(j){return j.started?`${elapsed((j.ended||Date.now())-j.started)} de ejecución`:`${elapsed((j.ended||Date.now())-j.time)} desde el envío`;}
async function cancelJob(id){
  if(!jobs.has(id))return;
  try{const q=await fetchJSON(api.apiURL('/queue'));let path,data;
    if(q.queue_running.some(x=>x[1]===id)){path='/interrupt';data={prompt_id:id};}
    else if(q.queue_pending.some(x=>x[1]===id)){path='/queue';data={delete:[id]};}
    else{await readHistory(id);return;}
    const r=await api.fetchApi(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(!r.ok)throw new Error('No se pudo cancelar el trabajo.');
    if(path==='/queue'){const stop=await api.fetchApi('/interrupt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt_id:id})});if(!stop.ok)throw new Error('Trabajo retirado de la cola; no se pudo confirmar si había empezado.');}
    message('Cancelación solicitada para este trabajo de Neural.');await reconcileJobs();
  }catch(e){message(e.message,true);}
}
async function reconcileJobs(){
  if(polling||!jobs.size)return;polling=true;
  try{const q=await fetchJSON(api.apiURL('/queue')),running=new Set(q.queue_running.map(x=>x[1])),pending=new Set(q.queue_pending.map(x=>x[1]));
    for(const [id,j] of jobs){if(!['En cola','Ejecutando'].includes(j.state))continue;
      if(running.has(id)){j.state='Ejecutando';activePrompt=id;j.missing=0;}
      else if(pending.has(id)){j.state='En cola';j.missing=0;}
      else if(await readHistory(id)===false&&Date.now()-j.time>10000){j.missing=(j.missing||0)+1;if(j.missing>=2){j.state='Retirado de la cola o servidor reiniciado';j.ended=Date.now();if(activePrompt===id){activePrompt=null;if(progress)progress.hidden=true;}}}
    }remember();if(root&&!root.hidden)renderJobs(body);
  }catch(e){console.warn('Neural queue',e);}finally{polling=false;}
}
function parseOutput(moduleID,outputs,promptID,input=null) {
  const m=findModule(moduleID),items=[];
  for(const [nid,o] of Object.entries(outputs||{})){
    if(!m.outputNodes.includes(Number(nid)))continue;
    for(const s of o.text||[])items.push({kind:'text',text:String(s),node:nid,promptID});
    for(const key of ['images','gifs','videos','audio'])for(const f of o[key]||[]){if(!f.filename)continue;items.push({kind:key==='audio'||/\.(mp3|flac|wav|ogg|opus)$/i.test(f.filename)?'audio':/\.(mp4|webm|mov|mkv)$/i.test(f.filename)||key==='videos'?'video':'image',file:f,node:nid,promptID,input});}
  }
  const old=results.get(moduleID)||[],keys=new Set(old.map(resultKey));
  for(const item of items){const k=resultKey(item);if(!keys.has(k)&&!removedResults.has(k)){old.push(item);keys.add(k);}}
  results.set(moduleID,old.slice(-32));remember();if(current?.id===moduleID && root && !root.hidden && body.querySelector('#nu-result-area'))renderResults();
}
async function readHistory(id) {
  try{const r=await api.fetchApi(`/history/${encodeURIComponent(id)}`);if(!r.ok)return null;const d=await r.json(),h=d[id],j=jobs.get(id);if(!h||!j)return false;
    if(h.outputs)parseOutput(j.module,h.outputs,id,j.input);
    const messages=h.status?.messages||[],start=messages.find(x=>x[0]==='execution_start'),end=[...messages].reverse().find(x=>['execution_success','execution_error','execution_interrupted'].includes(x[0]));
    if(start?.[1]?.timestamp)j.started=start[1].timestamp;
    if(h.status?.status_str==='error')j.state='Error · revisa la consola de ComfyUI';else if(h.status?.completed||h.status?.status_str==='success')j.state='Terminado';
    if(!['En cola','Ejecutando'].includes(j.state))j.ended=end?.[1]?.timestamp||j.ended||Date.now();
    if(j.ended && activePrompt===id){activePrompt=null;if(progress)progress.hidden=true;message(`${findModule(j.module)?.title}: ${j.state.toLowerCase()}.`,j.state!=='Terminado');}
    remember();if(root&&!root.hidden){renderJobs(body);if(current?.id===j.module)renderResults();}return true;
  }catch(e){console.warn('Neural history',e);return null;}
}
function lightbox(url){const box=el('div',{class:'nu-lightbox',role:'dialog','aria-label':'Imagen ampliada'},el('img',{src:url,alt:'Resultado ampliado'}));const close=()=>{box.remove();document.removeEventListener('keydown',key);};const key=e=>{if(e.key==='Escape')close();};box.append(btn('Cerrar ×',close));box.addEventListener('click',e=>{if(e.target===box)close();});document.addEventListener('keydown',key);document.body.append(box);}
async function transfer(item,target,slot=0) {
  if(loading||submitting||busyInputs.size||transferring)return;transferring=true;
  try{message(`Enviando a ${target.title}…`);if(item.kind==='text'){await openModule(target,{text:item.text});return;}const r=await fetch(viewURL(item.file));if(!r.ok)throw new Error('No se pudo leer el resultado.');const blob=await r.blob();const name=await upload(new File([blob],item.file.filename,{type:blob.type}));await openModule(target,{name,slot});}catch(e){message(e.message,true);}finally{transferring=false;}
}
function renderResults() {
  const area=body.querySelector('#nu-result-area');if(!area||!current)return;area.replaceChildren();const items=results.get(current.id)||[];
  const moduleID=current.id,cleanup=el('div',{class:'nu-actions'});
  if(items.length)cleanup.append(btn('Limpiar resultados del módulo',()=>removeResultItems(moduleID,[...(results.get(moduleID)||[])]),'danger'));
  if(lastCleanup)cleanup.append(btn('Deshacer última limpieza',undoCleanup));
  area.append(cleanup);
  if(!items.length){area.append(el('div',{class:'nu-empty'},el('div',{},el('div',{class:'nu-eyebrow'},'CANAL DE SALIDA'),el('h2',{},'Aquí aparecerá tu resultado.'),el('p',{},'Carga las entradas, ajusta los controles y ejecuta el módulo.'))));return;}
  const latest=items.at(-1)?.promptID,media=items.filter(i=>i.kind==='image'&&(current.id!=='el_doble'||i.promptID===latest));if(media.length>=2 || media.some(i=>i.input)){
    const detail=el('details',{},el('summary',{},'Comparar dos imágenes con deslizador'));const options=[];
    if(media.at(-1)?.input)options.push({label:'Entrada original',url:inputURL(media.at(-1).input)});
    media.forEach((i,k)=>options.push({label:`Resultado ${k+1} · nodo ${i.node}`,url:viewURL(i.file)}));
    if(options.length>=2){const a=el('select',{'aria-label':'Imagen izquierda'}),b=el('select',{'aria-label':'Imagen derecha'});for(const [i,o]of options.entries()){a.append(el('option',{value:i},o.label));b.append(el('option',{value:i},o.label));}b.value=String(options.length-1);
      const one=el('img',{src:options[0].url,alt:'Izquierda'}),two=el('img',{class:'top',src:options.at(-1).url,alt:'Derecha'}),line=el('div',{class:'nu-compare-line'}),box=el('div',{class:'nu-compare'},one,two,line),slider=el('input',{type:'range',min:0,max:100,value:50,'aria-label':'División de comparación',style:{width:'100%'}});
      const divide=value=>{value=Math.max(0,Math.min(100,value));slider.value=String(value);two.style.clipPath=`inset(0 ${100-value}% 0 0)`;line.style.left=`${value}%`;};
      const move=e=>{const r=box.getBoundingClientRect();if(r.width)divide(100*(e.clientX-r.left)/r.width);};
      box.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();box.setPointerCapture(e.pointerId);move(e);});
      box.addEventListener('pointermove',e=>{if(box.hasPointerCapture(e.pointerId))move(e);});
      const release=e=>{if(box.hasPointerCapture(e.pointerId))box.releasePointerCapture(e.pointerId);};
      box.addEventListener('pointerup',release);box.addEventListener('pointercancel',release);
      slider.addEventListener('input',()=>divide(Number(slider.value)));a.onchange=()=>one.src=options[a.value].url;b.onchange=()=>two.src=options[b.value].url;
      one.draggable=false;two.draggable=false;
      // ⛶ comparador a pantalla completa (Esc o el mismo botón para volver)
      const big=btn('⛶ Ampliar',()=>full(!detail.classList.contains('nu-full')));big.classList.add('nu-full-btn');
      const esc=e=>{if(e.key==='Escape')full(false);};
      const full=on=>{detail.classList.toggle('nu-full',on);big.textContent=on?'✕ Cerrar (Esc)':'⛶ Ampliar';if(on){detail.open=true;document.addEventListener('keydown',esc);}else document.removeEventListener('keydown',esc);};
      detail.append(el('div',{class:'nu-form-row'},a,b,big),slider,box,el('small',{},'Arrastra sobre la imagen o usa la barra superior. Las imágenes se muestran completas, sin recortar.'));area.append(detail);}
  }
  const grid=el('div',{class:'nu-results'});
  let group=null;
  for(const item of [...items].reverse()){
    if(item.promptID!==group){group=item.promptID;grid.append(el('h3',{class:'nu-result-group'},`Ejecución ${group.slice(0,8)}`));}
    const card=el('article',{class:'nu-result'}),actions=el('div',{class:'nu-actions'});
    const job=jobs.get(item.promptID);card.append(el('div',{class:'nu-num'},outputLabels[current.id]?.[item.node] || `SALIDA · NODO ${item.node}`),el('div',{class:'nu-file-name'},`Ejecución ${item.promptID.slice(0,8)}${job?' · '+jobTime(job):''}`));
    if(item.kind==='text'){card.append(el('pre',{},item.text));actions.append(btn('Copiar texto',async()=>{try{await navigator.clipboard.writeText(item.text);message('Texto copiado.');}catch{message('Selecciona el texto para copiarlo.',true);}}),btn('Guardar TXT',()=>downloadBlob('neural_descripcion.txt',new Blob([item.text],{type:'text/plain'}))));}
    else{
      const url=viewURL(item.file),timed=item.kind==='video'||item.kind==='audio';const visual=el(timed?item.kind:'img',{src:url,alt:'Resultado del workflow',loading:'lazy'});if(timed){visual.controls=true;visual.preload='metadata';}else visual.onclick=()=>lightbox(url);const meta=el('div',{class:'nu-file-name'});visual.addEventListener(timed?'loadedmetadata':'load',()=>{meta.textContent=item.kind==='audio'?`${item.file.filename} · ${visual.duration.toFixed(1)} s`:`${visual.videoWidth||visual.naturalWidth}×${visual.videoHeight||visual.naturalHeight}${Number.isFinite(visual.duration)?' · '+visual.duration.toFixed(2)+' s':''}`;});card.append(visual,meta);
      if(current.id==='el_aislante')for(const [label,color]of [['Fondo claro','#fff'],['Fondo oscuro','#111']])actions.append(btn(label,()=>{visual.style.background=color;}));
      actions.append(el('a',{class:'nu-btn',href:url,download:item.file.filename,target:'_blank',rel:'noopener'},'Descargar'));
      const select=el('select',{'aria-label':'Enviar resultado a otro módulo'},el('option',{value:''},'Enviar a…'));
      // el propio módulo solo aparece donde repetir tiene sentido (editar otra vez, ampliar más…)
      const again=['la_mutacion','la_fuga','el_sastre'].includes(current.id);
      for(const m of catalog.modules){if(m.id===current.id&&!again)continue;
        for(const [slot,i]of m.inputs.entries())if(i.kind===item.kind)select.append(el('option',{value:`${m.id}:${slot}`},m.id===current.id?`↻ otra vez aquí${m.inputs.length>1?' · '+i.label:''}`:`${m.title}${m.inputs.length>1?' · '+i.label:''}`));}
      select.onchange=()=>{if(!select.value)return;const [id,slot]=select.value.split(':');transfer(item,findModule(id),Number(slot));};if(select.options.length>1)actions.append(select);
    }
    if(item.kind==='text'){const dest=el('select',{'aria-label':'Enviar descripción a un prompt'},el('option',{value:''},'Enviar texto a…'));for(const m of catalog.modules)if(m.id!==current.id&&m.controls.some(c=>c.kind==='text'&&!c.advanced))dest.append(el('option',{value:m.id},m.title));dest.onchange=()=>{if(dest.value)transfer(item,findModule(dest.value));};actions.append(dest);}
    actions.append(btn('Quitar resultado',()=>removeResultItems(moduleID,[item]),'danger'));
    card.append(actions);grid.append(card);
  }
  area.append(grid);
}
function events() {
  api.addEventListener('execution_start',e=>{const id=e.detail?.prompt_id;if(!jobs.has(id)){activePrompt=null;return;}activePrompt=id;jobs.get(id).state='Ejecutando';jobs.get(id).started=Date.now();message(`Ejecutando ${findModule(jobs.get(id).module)?.title}…`);remember();if(root&&!root.hidden)renderJobs(body);});
  api.addEventListener('progress',e=>{if(!activePrompt||!jobs.has(activePrompt))return;const {value,max}=e.detail||{};if(progress&&max){progress.hidden=false;progress.value=100*value/max;}});
  api.addEventListener('executed',e=>{const d=e.detail||{},j=jobs.get(d.prompt_id);if(j)parseOutput(j.module,{[d.node]:d.output},d.prompt_id,j.input);});
  api.addEventListener('execution_success',async e=>{const id=e.detail?.prompt_id;if(!jobs.has(id))return;await readHistory(id);jobs.get(id).state='Terminado';jobs.get(id).ended=Date.now();if(activePrompt===id)activePrompt=null;if(progress)progress.hidden=true;message(`${findModule(jobs.get(id).module)?.title}: terminado.`);if(root&&!root.hidden){renderJobs(body);renderResults();}remember();});
  for(const ev of ['execution_error','execution_interrupted'])api.addEventListener(ev,e=>{const d=e.detail||{},j=jobs.get(d.prompt_id);if(!j)return;j.state=ev==='execution_error'?'Error':'Interrumpido';j.ended=Date.now();if(activePrompt===d.prompt_id)activePrompt=null;if(progress)progress.hidden=true;message(d.exception_message||j.state,true);remember();if(root&&!root.hidden)renderJobs(body);});
  // Recover cached executions and finished jobs after browser reload.
  setInterval(reconcileJobs,3500);
  setInterval(()=>{if(root&&!root.hidden)for(const e of body.querySelectorAll('[data-job-time]')){const j=jobs.get(e.dataset.jobTime);if(j)e.textContent=jobTime(j);}},1000);
}
app.registerExtension({
  name:'NeuralUnderground.Workbench',
  async setup(){
    document.head.append(el('link',{rel:'stylesheet',href:new URL('neural.css',BASE)}));
    document.body.append(el('button',{id:'nu-launch',type:'button',onclick:launch},'◈ NEURAL'));
    events();
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root&&!root.hidden&&!document.querySelector('.nu-lightbox')){remember();root.hidden=true;}if(e.ctrlKey&&e.key==='Enter'&&root&&!root.hidden&&body.querySelector('#nu-result-area')){e.preventDefault();run();}});
  },
  async afterConfigureGraph(){if(opening||!catalog)return;const m=findModule(graphID());if(m){current=m;if(root&&!root.hidden)renderModule();}else{current=null;if(root&&!root.hidden)renderHome();}}
});
