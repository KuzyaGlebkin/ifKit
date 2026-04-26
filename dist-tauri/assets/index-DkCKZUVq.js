(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();let At="",_t="",Ct="",J={};const Y=[],Z=[],It=[];let k="scene";function Mt(){At="",_t="",Ct="",J={},Y.length=0,Z.length=0,k="scene",It.length=0}function Tt(t){k==="scene"?At+=t:k==="before"?_t+=t:k==="after"?Ct+=t:J[k]=(J[k]??"")+t}function rt(t){It.push(k),k=t}function ct(){k=It.pop()??"scene"}function ce(){const t=At.replace(/<div data-slot="([^"]+)"><\/div>/g,(e,n)=>J[n]??"");return _t+t+Ct}function le(t,e){Y.push({label:t,handler:e})}function ue(t,e){Z.push({label:t,handler:e})}function de(t){t.innerHTML=ce()}function fe(t){t.innerHTML="";for(const{label:e,handler:n}of Y){const o=document.createElement("button");o.type="button",o.className="btn-act",o.textContent=e,o.addEventListener("click",n),t.appendChild(o)}Y.length=0}function ge(t){t.innerHTML="";for(const{label:e,handler:n}of Z){const o=document.createElement("a");o.href="#",o.className="btn-goto",o.textContent=e,o.addEventListener("click",s=>{s.preventDefault(),n()}),o.addEventListener("keydown",s=>{s.key!==" "&&s.key!=="Spacebar"||s.repeat||(s.preventDefault(),n())}),t.appendChild(o)}Z.length=0}function A(t){return JSON.parse(JSON.stringify(t))}const L={};function pe(t,e){return t in L||(L[t]=A(e)),L[t]}function he(t){return t in L?A(L[t]):null}function me(t,e){L[t]=e}function be(t){delete L[t]}let x={},N=null;function ke(t){x=t,!document.getElementById("snackbar-container")&&(N=document.createElement("div"),N.id="snackbar-container",document.body.appendChild(N))}function Pt(t){const e={};for(const n in x)Object.prototype.hasOwnProperty.call(x,n)&&(e[n]=t[n]);return e}function $t(t,e){const n=[];for(const o in x){if(!Object.prototype.hasOwnProperty.call(x,o))continue;const s=o,i=e[s],a=t[o];if(i!==a){const c=x[s],d=c?.(i,a)??null;d!==null&&n.push(d)}}return n}const ve=3e3;function qt(t){if(!(!N||t.length===0))for(const e of t){const n=document.createElement("div");n.className="snackbar-item",n.textContent=e,N.appendChild(n),setTimeout(()=>n.remove(),ve)}}function ye(t,e,n,o){if(typeof e=="function"?t!==e||!o:!e.has(t))throw new TypeError("Cannot read private member from an object whose class did not declare it");return n==="m"?o:n==="a"?o.call(t):o?o.value:e.get(t)}function Se(t,e,n,o,s){if(typeof e=="function"?t!==e||!0:!e.has(t))throw new TypeError("Cannot write private member to an object whose class did not declare it");return e.set(t,n),n}var D;function we(t,e=!1){return window.__TAURI_INTERNALS__.transformCallback(t,e)}async function r(t,e={},n){return window.__TAURI_INTERNALS__.invoke(t,e,n)}class Ee{get rid(){return ye(this,D,"f")}constructor(e){D.set(this,void 0),Se(this,D,e)}async close(){return r("plugin:resources|close",{rid:this.rid})}}D=new WeakMap;var Vt;(function(t){t.WINDOW_RESIZED="tauri://resize",t.WINDOW_MOVED="tauri://move",t.WINDOW_CLOSE_REQUESTED="tauri://close-requested",t.WINDOW_DESTROYED="tauri://destroyed",t.WINDOW_FOCUS="tauri://focus",t.WINDOW_BLUR="tauri://blur",t.WINDOW_SCALE_FACTOR_CHANGED="tauri://scale-change",t.WINDOW_THEME_CHANGED="tauri://theme-changed",t.WINDOW_CREATED="tauri://window-created",t.WEBVIEW_CREATED="tauri://webview-created",t.DRAG_ENTER="tauri://drag-enter",t.DRAG_OVER="tauri://drag-over",t.DRAG_DROP="tauri://drag-drop",t.DRAG_LEAVE="tauri://drag-leave"})(Vt||(Vt={}));async function Le(t,e){window.__TAURI_EVENT_PLUGIN_INTERNALS__.unregisterListener(t,e),await r("plugin:event|unlisten",{event:t,eventId:e})}async function Nt(t,e,n){var o;const s=(o=void 0)!==null&&o!==void 0?o:{kind:"Any"};return r("plugin:event|listen",{event:t,target:s,handler:we(e)}).then(i=>async()=>Le(t,i))}class Q extends Ee{constructor(e){super(e)}static async load(e,n){const o=await r("plugin:store|load",{path:e,options:n});return new Q(o)}static async get(e){return await r("plugin:store|get_store",{path:e}).then(n=>n?new Q(n):null)}async set(e,n){await r("plugin:store|set",{rid:this.rid,key:e,value:n})}async get(e){const[n,o]=await r("plugin:store|get",{rid:this.rid,key:e});return o?n:void 0}async has(e){return await r("plugin:store|has",{rid:this.rid,key:e})}async delete(e){return await r("plugin:store|delete",{rid:this.rid,key:e})}async clear(){await r("plugin:store|clear",{rid:this.rid})}async reset(){await r("plugin:store|reset",{rid:this.rid})}async keys(){return await r("plugin:store|keys",{rid:this.rid})}async values(){return await r("plugin:store|values",{rid:this.rid})}async entries(){return await r("plugin:store|entries",{rid:this.rid})}async length(){return await r("plugin:store|length",{rid:this.rid})}async reload(e){await r("plugin:store|reload",{rid:this.rid,...e})}async save(){await r("plugin:store|save",{rid:this.rid})}async onKeyChange(e,n){return await Nt("store://change",o=>{o.payload.resourceId===this.rid&&o.payload.key===e&&n(o.payload.exists?o.payload.value:void 0)})}async onChange(e){return await Nt("store://change",n=>{n.payload.resourceId===this.rid&&e(n.payload.key,n.payload.exists?n.payload.value:void 0)})}}async function Ae(t={}){return typeof t=="object"&&Object.freeze(t),await r("plugin:dialog|open",{options:t})}async function _e(t={}){return typeof t=="object"&&Object.freeze(t),await r("plugin:dialog|save",{options:t})}var Ht;(function(t){t[t.Audio=1]="Audio",t[t.Cache=2]="Cache",t[t.Config=3]="Config",t[t.Data=4]="Data",t[t.LocalData=5]="LocalData",t[t.Document=6]="Document",t[t.Download=7]="Download",t[t.Picture=8]="Picture",t[t.Public=9]="Public",t[t.Video=10]="Video",t[t.Resource=11]="Resource",t[t.Temp=12]="Temp",t[t.AppConfig=13]="AppConfig",t[t.AppData=14]="AppData",t[t.AppLocalData=15]="AppLocalData",t[t.AppCache=16]="AppCache",t[t.AppLog=17]="AppLog",t[t.Desktop=18]="Desktop",t[t.Executable=19]="Executable",t[t.Font=20]="Font",t[t.Home=21]="Home",t[t.Runtime=22]="Runtime",t[t.Template=23]="Template"})(Ht||(Ht={}));var Ut;(function(t){t[t.Start=0]="Start",t[t.Current=1]="Current",t[t.End=2]="End"})(Ut||(Ut={}));async function Ce(t,e){if(t instanceof URL&&t.protocol!=="file:")throw new TypeError("Must be a file URL.");const n=await r("plugin:fs|read_text_file",{path:t instanceof URL?t.toString():t,options:e}),o=n instanceof ArrayBuffer?n:Uint8Array.from(n);return new TextDecoder("utf-8").decode(o)}async function Ie(t,e,n){if(t instanceof URL&&t.protocol!=="file:")throw new TypeError("Must be a file URL.");const o=new TextEncoder;await r("plugin:fs|write_text_file",o.encode(e),{headers:{path:encodeURIComponent(t instanceof URL?t.toString():t),options:JSON.stringify(n)}})}const _={settings:"ifkit:settings",saves:"ifkit:saves",seen:"ifkit:seen"},Te="ifkit:";let X=null;const R={};class Oe{get(e){return e in R?R[e]:null}set(e,n){R[e]=n,X?.set(e,n).catch(o=>{console.error("[ifKit] Store write error:",o)})}remove(e){delete R[e],X?.delete(e).catch(n=>{console.error("[ifKit] Store delete error:",n)})}}const S=new Oe;async function Re(){X=await Q.load("ifkit-store.json");const t=await X.entries();for(const[e,n]of t)R[e]=n}async function xe(){const t={};for(const[o,s]of Object.entries(R))o.startsWith(Te)&&(t[o]=s);const e={version:1,exported:new Date().toISOString(),data:t},n=await _e({defaultPath:`ifkit-backup-${new Date().toISOString().slice(0,10)}.json`,filters:[{name:"JSON",extensions:["json"]}]});n&&await Ie(n,JSON.stringify(e,null,2))}async function Me(){const t=await Ae({multiple:!1,filters:[{name:"JSON",extensions:["json"]}]}),e=Array.isArray(t)?t[0]:t;if(!e)return;const n=await Ce(e),o=JSON.parse(n);if(o.version!==1)throw console.warn(`[ifKit] Импорт: неизвестная версия (${o.version}). Импорт отменён.`),new Error(`Unknown backup version: ${o.version}`);for(const[s,i]of Object.entries(o.data))S.set(s,i)}const Pe=5,zt=20;class Wt{buf;latestPos=-1;currentPos=-1;maxSize;constructor(e){this.maxSize=e,this.buf=new Array(e).fill(null)}get oldestPos(){return Math.max(0,this.latestPos-this.maxSize+1)}push(e){this.latestPos=this.currentPos+1,this.buf[this.latestPos%this.maxSize]=e,this.currentPos=this.latestPos}undo(){if(!this.canUndo())return null;const e=this.buf[this.currentPos%this.maxSize];return this.currentPos--,e}redo(){return this.canRedo()?(this.currentPos++,this.buf[this.currentPos%this.maxSize]):null}canUndo(){return this.currentPos>=0&&this.currentPos>=this.oldestPos}canRedo(){return this.currentPos<this.latestPos}}let q=new Wt(zt);function $e(t=zt){q=new Wt(t)}function Ft(t){q.push(t)}function qe(){return q.undo()}function Ve(){return q.redo()}function Bt(){return q.canUndo()}function Kt(){return q.canRedo()}let T=null;function Ot(t=Pe){if(T)return T;const e=S.get(_.saves);if(e&&Array.isArray(e.slots)){const n=e.slots.slice(0,t);for(;n.length<t;)n.push(null);T={auto:e.auto??null,slots:n}}else T={auto:null,slots:new Array(t).fill(null)};return T}function Rt(t){S.set(_.saves,t)}function y(){return T??Ot()}function Ne(t,e){const n=y();n.auto={id:"auto",savedAt:new Date().toISOString(),label:"",sceneKey:t,state:A(e),sceneLocals:null},Rt(n)}function Jt(t,e,n,o){const s=y();if(t<0||t>=s.slots.length)return;const a=(document.getElementById("scene-content")?.textContent??"").trim().slice(0,80);s.slots[t]={id:`slot-${t}`,savedAt:new Date().toISOString(),label:a,sceneKey:e,state:A(n),sceneLocals:o?A(o):null},Rt(s)}function He(t){const e=y();t<0||t>=e.slots.length||(e.slots[t]=null,Rt(e))}const V=1e3;let b=null,M=null,H=null,Yt=.8,Zt=1;const jt=new Map;let O=null,lt=null,C=null,g=null;function pt(){if(b)return b;b=new AudioContext,M=b.createGain(),M.gain.value=Yt,M.connect(b.destination),H=b.createGain(),H.gain.value=Zt,H.connect(b.destination);const t=()=>{b?.resume()};return document.addEventListener("click",t,{once:!0}),document.addEventListener("keydown",t,{once:!0}),b}async function Ue(t){const e=jt.get(t);if(e)return e;const n=pt(),s=await(await fetch(t)).arrayBuffer(),i=await n.decodeAudioData(s);return jt.set(t,i),i}function Fe(){O=null}async function je(){if(O===lt)return;const t=O!==null?pt():b;if(O===null){if(C&&g&&t){const a=t.currentTime;g.gain.setValueAtTime(g.gain.value,a),g.gain.linearRampToValueAtTime(0,a+V/1e3);const c=C,d=g;setTimeout(()=>{try{c.stop()}catch{}c.disconnect(),d.disconnect()},V),C=null,g=null}lt=null;return}const e=await Ue(O),n=pt();if(C&&g){const a=n.currentTime;g.gain.setValueAtTime(g.gain.value,a),g.gain.linearRampToValueAtTime(0,a+V/1e3);const c=C,d=g;setTimeout(()=>{try{c.stop()}catch{}c.disconnect(),d.disconnect()},V)}const o=n.createGain();o.gain.value=0,o.connect(M);const s=n.createBufferSource();s.buffer=e,s.loop=!0,s.connect(o),s.start();const i=n.currentTime;o.gain.setValueAtTime(0,i),o.gain.linearRampToValueAtTime(1,i+V/1e3),C=s,g=o,lt=O}function ht(t){M&&(M.gain.value=t)}function mt(t){H&&(H.gain.value=t)}function Ge(t,e){Yt=t,Zt=e}let U={};function De(){U=S.get(_.seen)??{}}function ze(t){let e=0;for(let n=0;n<t.length;n++)e=Math.imul(31,e)+t.charCodeAt(n)|0;return e.toString(36)}function We(t,e,n){if(!n)return;const o=new Set(U[e]??[]);let s=!1;for(const i of Array.from(t.children)){const a=ze(i.innerHTML);o.has(a)||(i.classList.add("paragraph--unseen"),o.add(a),s=!0)}s&&(U[e]=Array.from(o),S.set(_.seen,U))}function Be(){U={},S.remove(_.seen)}let z={},j=null,m="",Qt=!0;function W(t){Qt=t}let B=null,bt=null,kt=null,vt;function Ke(t,e){z=t,j=e}function Je(t,e,n,o){B=t,bt=e,kt=n,vt=o,document.getElementById("btn-undo")?.addEventListener("click",()=>{if(!Bt())return;const s=qe();s&&et(s)}),document.getElementById("btn-redo")?.addEventListener("click",()=>{if(!Kt())return;const s=Ve();s&&et(s)})}function tt(){const t=he(m);return{sceneKey:m,state:A(j),sceneLocals:t!==null?{[m]:t}:null}}function et(t){if(j=A(t.state),t.sceneLocals)for(const[e,n]of Object.entries(t.sceneLocals))me(e,n);st(t.sceneKey)}function Xt(t){return{act(e,n){le(e,()=>{Ft(tt());const o=Pt(t);n(t);const s=$t(t,o);K(),qt(s)})},goto(e,n,o){ue(n,()=>{Ft(tt());const s=Pt(t);o&&o(t);const i=$t(t,s);Ne(String(e),j),st(String(e)),qt(i)})},local(e){return pe(m,e)}}}function Ye(t){return{...Xt(t),before(n){rt("before"),n(),ct()},after(n){rt("after"),n(),ct()},slot(n,o){rt(n),o(),ct()}}}function K(){st(m)}function Ze(){const t=document.getElementById("btn-undo"),e=document.getElementById("btn-redo"),n=Bt(),o=Kt();t&&(t.setAttribute("aria-disabled",n?"false":"true"),t.classList.toggle("ifk-history-disabled",!n)),e&&(e.setAttribute("aria-disabled",o?"false":"true"),e.classList.toggle("ifk-history-disabled",!o))}async function st(t){if(!z[t])throw new Error(`[ifKit] Сцена не найдена: "${t}". Доступные: ${Object.keys(z).join(", ")}`);if(!B||!bt||!kt)throw new Error("[ifKit] DOM-элементы не инициализированы. Вызови defineGame() первым.");const e=m;m&&m!==t&&be(m),m=t;const n=j,o=Xt(n);Mt(),Fe();try{z[t](n,o)}catch(s){throw Mt(),s}if(vt){const s=Ye(n);vt(n,s)}de(B),We(B,m,Qt),fe(bt),ge(kt),Ze(),await je(),e!==t&&document.getElementById("ifk-scene-focus-anchor")?.focus({preventScroll:!0})}const Qe={blue:{accent:"#2563eb",fg:"#ffffff"},violet:{accent:"#7c3aed",fg:"#ffffff"},emerald:{accent:"#059669",fg:"#ffffff"}},Xe={theme:"system",fontSize:1,musicVolume:.8,soundVolume:1,language:"",showUnseenHighlight:!0,accent:"default"};function tn(t){return{...Xe,...t}}function te(t){const e=S.get(_.settings);if(!e||typeof e!="object")return{...t};const n={...t,...e};return en(n.accent)||(n.accent=t.accent),n}function en(t){return t==="default"||t==="blue"||t==="violet"||t==="emerald"}function ee(t){S.set(_.settings,t)}function it(t){const e=document.documentElement;if(t.theme==="system"?delete e.dataset.theme:e.dataset.theme=t.theme,e.style.setProperty("--ifk-font-size-base",`${t.fontSize}rem`),t.accent==="default")e.style.removeProperty("--ifk-color-accent"),e.style.removeProperty("--ifk-color-accent-fg");else{const n=Qe[t.accent];e.style.setProperty("--ifk-color-accent",n.accent),e.style.setProperty("--ifk-color-accent-fg",n.fg)}}function nn(t){ee(t),it(t)}let xt={},P="";function ne(){const t=Object.keys(xt);if(t.length===0){P="";return}const e=(typeof navigator<"u"?navigator.language:"").split("-")[0];P=t.includes(e)?e:t[0]}function on(t,e){if(xt=t,Object.keys(t).length===0){P="";return}if(e){P=e;return}ne()}function p(t,...e){const n=t.reduce((s,i,a)=>s+i+(a<e.length?`{${a}}`:""),"");return(xt[P]?.[n]??n).replace(/\{(\d+)\}/g,(s,i)=>String(e[Number(i)]??""))}function sn(t){P=t}function ut(t){if(t){sn(t);return}ne()}const an=["a[href]","button:not([disabled])","textarea:not([disabled])","input:not([disabled])","select:not([disabled])",'[tabindex]:not([tabindex="-1"])'].join(", ");function Gt(){return"inert"in HTMLElement.prototype}function rn(t){return t.offsetParent!==null||(t.getClientRects?.().length??0)>0}function nt(t){const e=t.querySelectorAll(an),n=[];return e.forEach(o=>{if(!rn(o)||o.tabIndex<0||o.closest("[hidden]"))return;let s=o;for(;s;){if(s.getAttribute("aria-hidden")==="true"||s.hasAttribute("inert"))return;if(s===t)break;s=s.parentElement}n.push(o)}),n}function oe(t,e){const n=document.activeElement,o=document.getElementById("controls"),s=document.getElementById("content"),i=[o,s].filter(Boolean),a=[];if(Gt())for(const l of i){const f=l.inert;l.inert=!0,a.push(()=>{l.inert=f})}const c=l=>{if(l.key!=="Tab"||t.hasAttribute("hidden"))return;const f=nt(t);if(f.length===0)return;const v=f[0],w=f[f.length-1],at=document.activeElement;if(!t.contains(at)){l.preventDefault(),v.focus();return}l.shiftKey?at===v&&(l.preventDefault(),w.focus()):at===w&&(l.preventDefault(),v.focus())};document.addEventListener("keydown",c,!0),a.push(()=>document.removeEventListener("keydown",c,!0));let d=null;return Gt()||(d=l=>{if(t.hasAttribute("hidden"))return;const f=l.target;if(f&&t.contains(f))return;const v=nt(t);v.length!==0&&(l.stopImmediatePropagation(),queueMicrotask(()=>v[0]?.focus()))},document.addEventListener("focusin",d,!0),a.push(()=>{d&&document.removeEventListener("focusin",d,!0)})),{release:()=>{for(let f=a.length-1;f>=0;f--)a[f]();a.length=0,(e&&document.body.contains(e)?e:n&&document.body.contains(n)?n:null)?.focus({preventScroll:!0})}}}let I,u,yt=[],St=null;function dt(t){return`${Math.round(t*100)}%`}function cn(){if(yt.length<2)return"";const t='<button type="button" class="ifk-lang-btn" data-lang-value="">Авто</button>',e=yt.map(n=>`<button type="button" class="ifk-lang-btn" data-lang-value="${n}">${n}</button>`).join("");return`
    <div class="ifk-settings-row ifk-settings-row--segment" id="ifk-lang-row" role="group" aria-labelledby="ifk-lang-label">
      <span id="ifk-lang-label" class="ifk-settings-label">Язык</span>
      <div class="ifk-segment-group">
        ${t}
        ${e}
      </div>
    </div>`}function ln(){const t=document.createElement("div");return t.id="ifk-settings-backdrop",t.className="ifk-modal-backdrop",t.setAttribute("hidden",""),t.innerHTML=`
    <div id="ifk-settings-dialog"
         class="ifk-modal-dialog">

      <div class="ifk-modal-header">
        <h2 id="ifk-settings-title" class="ifk-modal-title">Настройки</h2>
        <button id="ifk-settings-close"
                class="ifk-modal-close"
                type="button">✕</button>
      </div>

      <div class="ifk-modal-body">
        <div id="ifk-settings-theme-font" aria-hidden="true">
        <div class="ifk-settings-row ifk-settings-row--segment">
          <span class="ifk-settings-label">Тема</span>
          <div class="ifk-segment-group">
            <button type="button" tabindex="-1" class="ifk-theme-btn" data-theme-value="light">Светлая</button>
            <button type="button" tabindex="-1" class="ifk-theme-btn" data-theme-value="dark">Тёмная</button>
            <button type="button" tabindex="-1" class="ifk-theme-btn" data-theme-value="system">Системная</button>
          </div>
        </div>

        <div class="ifk-settings-row">
          <label class="ifk-settings-label" for="ifk-font-size">Шрифт</label>
          <div class="ifk-range-wrap">
            <input type="range" id="ifk-font-size" tabindex="-1"
                   min="0.8" max="1.4" step="0.1">
            <span id="ifk-font-size-val" class="ifk-range-val">100%</span>
          </div>
        </div>
        </div>

        <div class="ifk-settings-row ifk-settings-row--segment" id="ifk-settings-accent-row">
          <span class="ifk-settings-label">Акцент</span>
          <div class="ifk-segment-group">
            <button type="button" class="ifk-accent-btn" data-accent-value="default">Стандарт</button>
            <button type="button" class="ifk-accent-btn" data-accent-value="blue">Синий</button>
            <button type="button" class="ifk-accent-btn" data-accent-value="violet">Фиолет</button>
            <button type="button" class="ifk-accent-btn" data-accent-value="emerald">Зелёный</button>
          </div>
        </div>

        <div class="ifk-settings-row">
          <label class="ifk-settings-label" for="ifk-music-vol">Музыка</label>
          <div class="ifk-range-wrap">
            <input type="range" id="ifk-music-vol"
                   min="0" max="1" step="0.1">
            <span id="ifk-music-vol-val" class="ifk-range-val">80%</span>
          </div>
        </div>

        <div class="ifk-settings-row">
          <label class="ifk-settings-label" for="ifk-sound-vol">Звуки</label>
          <div class="ifk-range-wrap">
            <input type="range" id="ifk-sound-vol"
                   min="0" max="1" step="0.1">
            <span id="ifk-sound-vol-val" class="ifk-range-val">100%</span>
          </div>
        </div>

        ${cn()}

        <div class="ifk-settings-row">
          <label class="ifk-settings-label" for="ifk-unseen-toggle">Новый текст</label>
          <div class="ifk-unseen-wrap">
            <input type="checkbox" id="ifk-unseen-toggle" class="ifk-checkbox">
            <button id="ifk-seen-reset" class="ifk-btn-ghost ifk-btn-sm">Сбросить историю</button>
          </div>
        </div>
      </div>

      <div class="ifk-modal-footer">
        <button id="ifk-settings-reset" class="ifk-btn-ghost">Сбросить настройки</button>
        <div class="ifk-modal-footer-actions">
          <button id="ifk-settings-export" class="ifk-btn-ghost">Экспорт</button>
          <button id="ifk-settings-import" class="ifk-btn-ghost">Импорт</button>
        </div>
      </div>
    </div>
  `,t}function ot(t){const e=document.getElementById("ifk-settings-backdrop");if(!e)return;e.querySelectorAll(".ifk-theme-btn").forEach(h=>{h.classList.toggle("ifk-theme-btn--active",h.dataset.themeValue===t.theme)}),e.querySelectorAll(".ifk-accent-btn").forEach(h=>{const l=h.getAttribute("data-accent-value");h.classList.toggle("ifk-accent-btn--active",l===t.accent)});const n=e.querySelector("#ifk-font-size"),o=e.querySelector("#ifk-font-size-val");n&&(n.value=String(t.fontSize)),o&&(o.textContent=dt(t.fontSize));const s=e.querySelector("#ifk-music-vol"),i=e.querySelector("#ifk-music-vol-val");s&&(s.value=String(t.musicVolume)),i&&(i.textContent=dt(t.musicVolume));const a=e.querySelector("#ifk-sound-vol"),c=e.querySelector("#ifk-sound-vol-val");a&&(a.value=String(t.soundVolume)),c&&(c.textContent=dt(t.soundVolume)),e.querySelectorAll(".ifk-lang-btn").forEach(h=>{const l=h.getAttribute("data-lang-value")??"";h.classList.toggle("ifk-lang-btn--active",l===t.language)});const d=e.querySelector("#ifk-unseen-toggle");d&&(d.checked=t.showUnseenHighlight)}function E(t){u={...u,...t},ee(u),it(u),ht(u.musicVolume),mt(u.soundVolume),ot(u)}function un(){const t=document.getElementById("ifk-settings-backdrop");if(!t||!t.hasAttribute("hidden"))return;ot(u),t.removeAttribute("hidden");const e=document.getElementById("btn-settings");St=oe(t,e),queueMicrotask(()=>nt(t)[0]?.focus())}function ft(){const t=document.getElementById("ifk-settings-backdrop");t&&(St?.release(),St=null,t.setAttribute("hidden",""))}function dn(t,e,n=[]){I=t,u=e,yt=n;const o=ln();document.body.appendChild(o),document.getElementById("btn-settings")?.addEventListener("click",un),o.querySelector("#ifk-settings-close")?.addEventListener("click",ft),o.addEventListener("click",s=>{s.target===o&&ft()}),document.addEventListener("keydown",s=>{s.key==="Escape"&&!o.hasAttribute("hidden")&&ft()}),o.querySelectorAll(".ifk-theme-btn").forEach(s=>{s.addEventListener("click",()=>{E({theme:s.dataset.themeValue})})}),o.querySelectorAll(".ifk-accent-btn").forEach(s=>{s.addEventListener("click",()=>{const i=s.getAttribute("data-accent-value");E({accent:i})})}),o.querySelector("#ifk-font-size")?.addEventListener("input",s=>{const i=parseFloat(s.target.value);E({fontSize:i})}),o.querySelector("#ifk-music-vol")?.addEventListener("input",s=>{const i=parseFloat(s.target.value);E({musicVolume:i})}),o.querySelector("#ifk-sound-vol")?.addEventListener("input",s=>{const i=parseFloat(s.target.value);E({soundVolume:i})}),o.querySelectorAll(".ifk-lang-btn").forEach(s=>{s.addEventListener("click",()=>{const i=s.getAttribute("data-lang-value")??"";ut(i),E({language:i}),K()})}),o.querySelector("#ifk-unseen-toggle")?.addEventListener("change",s=>{const i=s.target.checked;W(i),E({showUnseenHighlight:i})}),o.querySelector("#ifk-seen-reset")?.addEventListener("click",()=>{Be(),K()}),o.querySelector("#ifk-settings-reset")?.addEventListener("click",()=>{nn(I),u={...I},ut(I.language),W(I.showUnseenHighlight),ht(u.musicVolume),mt(u.soundVolume),ot(u)}),o.querySelector("#ifk-settings-export")?.addEventListener("click",xe),o.querySelector("#ifk-settings-import")?.addEventListener("click",()=>{Me().then(()=>{u=te(I),it(u),ut(u.language),ht(u.musicVolume),mt(u.soundVolume),W(u.showUnseenHighlight),ot(u),K()}).catch(()=>{})})}/**
 * @license lucide v1.11.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fn={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide v1.11.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const se=([t,e,n])=>{const o=document.createElementNS("http://www.w3.org/2000/svg",t);return Object.keys(e).forEach(s=>{o.setAttribute(s,String(e[s]))}),n?.length&&n.forEach(s=>{const i=se(s);o.appendChild(i)}),o},gn=(t,e={})=>{const o={...fn,...e};return se(["svg",o,t])};/**
 * @license lucide v1.11.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pn=[["path",{d:"M12 17V3"}],["path",{d:"m6 11 6 6 6-6"}],["path",{d:"M19 21H5"}]];/**
 * @license lucide v1.11.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const hn=[["path",{d:"m18 9-6-6-6 6"}],["path",{d:"M12 3v14"}],["path",{d:"M5 21h14"}]];/**
 * @license lucide v1.11.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mn=[["path",{d:"M21 7v6h-6"}],["path",{d:"M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"}]];/**
 * @license lucide v1.11.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bn=[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7"}]];/**
 * @license lucide v1.11.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kn=[["path",{d:"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"}],["circle",{cx:"12",cy:"12",r:"3"}]];/**
 * @license lucide v1.11.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vn=[["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"}],["path",{d:"M3 6h18"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"}]];/**
 * @license lucide v1.11.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yn=[["path",{d:"M3 7v6h6"}],["path",{d:"M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"}]],Sn={class:"ifk-lucide",width:18,height:18,"stroke-width":2};function ie(t,e){t.replaceChildren(gn(e,Sn))}function wn(){const t=[["btn-undo",yn],["btn-redo",mn],["btn-saves",bn],["btn-settings",kn]];for(const[e,n]of t){const o=document.querySelector(`#${e} .ifk-btn-icon`);o&&ie(o,n)}}function En(t){const e=[[".ifk-slot-load-btn",hn],[".ifk-slot-save-btn",pn],[".ifk-slot-delete-btn",vn]];for(const[n,o]of e)t.querySelectorAll(n).forEach(s=>{const i=s.querySelector(".ifk-btn-icon");i&&ie(i,o)})}let ae=5,wt=null;function Et(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function re(t){try{const e=new Date(t),n=e.toLocaleDateString("ru-RU",{day:"2-digit",month:"2-digit",year:"numeric"}),o=e.toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"});return`${n} ${o}`}catch{return t}}function Ln(t){return t?`
    <div class="ifk-slot ifk-slot--auto" data-slot-id="auto" role="group" aria-labelledby="ifk-slot-num-auto">
      <div class="ifk-slot-info">
        <span class="ifk-slot-num" id="ifk-slot-num-auto">Авто</span>
        <span class="ifk-slot-meta">${Et(re(t.savedAt))}</span>
      </div>
      <div class="ifk-slot-actions">
        <button type="button" class="ifk-btn-ghost ifk-slot-load-btn">
          <span class="ifk-btn-icon" aria-hidden="true"></span>
          <span class="ifk-btn-label">Загрузить</span>
        </button>
      </div>
    </div>`:`
      <div class="ifk-slot ifk-slot--auto" data-slot-id="auto" role="group" aria-labelledby="ifk-slot-num-auto">
        <div class="ifk-slot-info">
          <span class="ifk-slot-num" id="ifk-slot-num-auto">Авто</span>
          <span class="ifk-slot-empty">── нет данных ──</span>
        </div>
        <div class="ifk-slot-actions"></div>
      </div>`}function An(t,e){const n=`ifk-slot-num-${e}`;if(!t)return`
      <div class="ifk-slot" data-slot-index="${e}" role="group" aria-labelledby="${n}">
        <div class="ifk-slot-info">
          <span class="ifk-slot-num" id="${n}">${e+1}</span>
          <span class="ifk-slot-empty">── пусто ──</span>
        </div>
        <div class="ifk-slot-actions">
          <button type="button" class="ifk-btn-ghost ifk-slot-save-btn">
            <span class="ifk-btn-icon" aria-hidden="true"></span>
            <span class="ifk-btn-label">Сохранить</span>
          </button>
        </div>
      </div>`;const o=`ifk-slot-label-${e}`,s=t.label?`${n} ${o}`:n,i=t.label?`<span class="ifk-slot-label" id="${o}">«${Et(t.label)}»</span>`:"";return`
    <div class="ifk-slot" data-slot-index="${e}" role="group" aria-labelledby="${s}">
      <div class="ifk-slot-info">
        <span class="ifk-slot-num" id="${n}">${e+1}</span>
        <span class="ifk-slot-meta">${Et(re(t.savedAt))}</span>
        ${i}
      </div>
      <div class="ifk-slot-actions">
        <button type="button" class="ifk-btn-ghost ifk-slot-load-btn">
          <span class="ifk-btn-icon" aria-hidden="true"></span>
          <span class="ifk-btn-label">Загрузить</span>
        </button>
        <button type="button" class="ifk-btn-ghost ifk-slot-save-btn">
          <span class="ifk-btn-icon" aria-hidden="true"></span>
          <span class="ifk-btn-label">Сохранить</span>
        </button>
        <button type="button" class="ifk-btn-ghost ifk-slot-delete-btn">
          <span class="ifk-btn-icon" aria-hidden="true"></span>
          <span class="ifk-btn-label">Удалить</span>
        </button>
      </div>
    </div>`}function _n(t){const e=document.createElement("div");return e.id="ifk-saves-backdrop",e.className="ifk-modal-backdrop",e.setAttribute("hidden",""),e.innerHTML=`
    <div id="ifk-saves-dialog"
         class="ifk-modal-dialog ifk-saves-dialog">

      <div class="ifk-modal-header">
        <h2 id="ifk-saves-title" class="ifk-modal-title">Сохранения</h2>
        <button id="ifk-saves-close"
                class="ifk-modal-close"
                type="button">✕</button>
      </div>

      <div id="ifk-saves-body" class="ifk-modal-body ifk-saves-body">
      </div>
    </div>
  `,e}function $(t){const e=document.getElementById("ifk-saves-body");if(!e)return;let n=Ln(t.auto);for(let o=0;o<t.slots.length;o++)n+=An(t.slots[o],o);e.innerHTML=n,En(e),Cn(e,t)}function Cn(t,e){t.querySelector(".ifk-slot--auto .ifk-slot-load-btn")?.addEventListener("click",()=>{e.auto&&(et(e.auto),F())}),t.querySelectorAll(".ifk-slot:not(.ifk-slot--auto)").forEach(n=>{const o=n.dataset.slotIndex;if(o===void 0)return;const s=parseInt(o,10),i=e.slots[s]??null;n.querySelector(".ifk-slot-load-btn")?.addEventListener("click",()=>{i&&(et(i),F())}),n.querySelector(".ifk-slot-save-btn")?.addEventListener("click",()=>{if(i)Tn(n,s);else{const a=tt();Jt(s,a.sceneKey,a.state,a.sceneLocals),$(y())}}),n.querySelector(".ifk-slot-delete-btn")?.addEventListener("click",()=>{In(n,s)})})}function In(t,e){const n=t.querySelector(".ifk-slot-actions");n&&(n.innerHTML=`
    <span class="ifk-slot-confirm-text">Удалить?</span>
    <button class="ifk-btn-ghost ifk-confirm-yes">Да</button>
    <button class="ifk-btn-ghost ifk-confirm-no">Нет</button>
  `,n.querySelector(".ifk-confirm-yes")?.addEventListener("click",()=>{He(e),$(y())}),n.querySelector(".ifk-confirm-no")?.addEventListener("click",()=>{$(y())}))}function Tn(t,e){const n=t.querySelector(".ifk-slot-actions");n&&(n.innerHTML=`
    <span class="ifk-slot-confirm-text">Перезаписать?</span>
    <button class="ifk-btn-ghost ifk-confirm-yes">Да</button>
    <button class="ifk-btn-ghost ifk-confirm-no">Нет</button>
  `,n.querySelector(".ifk-confirm-yes")?.addEventListener("click",()=>{const o=tt();Jt(e,o.sceneKey,o.state,o.sceneLocals),$(y())}),n.querySelector(".ifk-confirm-no")?.addEventListener("click",()=>{$(y())}))}function On(){const t=document.getElementById("ifk-saves-backdrop");if(!t||!t.hasAttribute("hidden"))return;$(Ot(ae)),t.removeAttribute("hidden");const e=document.getElementById("btn-saves");wt=oe(t,e),queueMicrotask(()=>nt(t)[0]?.focus())}function F(){const t=document.getElementById("ifk-saves-backdrop");t&&(wt?.release(),wt=null,t.setAttribute("hidden",""))}function Rn(t){ae=t;const e=_n();document.body.appendChild(e),document.getElementById("btn-saves")?.addEventListener("click",On),e.querySelector("#ifk-saves-close")?.addEventListener("click",F),e.addEventListener("click",n=>{n.target===e&&F()}),document.addEventListener("keydown",n=>{n.key==="Escape"&&!e.hasAttribute("hidden")&&F()})}function gt(t,e){let n=document.getElementById(e);return n||(n=document.createElement("div"),n.id=e,t.appendChild(n)),n}function xn(t){const e=async()=>{await Re(),wn();const n=document.getElementById("content");if(!n)throw new Error("[ifKit] Элемент #content не найден в index.html");const o=gt(n,"scene-content"),s=gt(n,"scene-acts"),i=gt(n,"scene-gotos");if(!document.getElementById("ifk-scene-focus-anchor")){const w=document.createElement("div");w.id="ifk-scene-focus-anchor",w.className="ifk-scene-focus-anchor",w.tabIndex=-1,n.insertBefore(w,o)}const a=tn(t.settings),c=te(a);it(c),Ge(c.musicVolume,c.soundVolume);const d={[t.sourceLanguage]:{},...t.locales},h=Object.keys(d);on(d,c.language),De(),W(c.showUnseenHighlight);const l=t.saves?.slots??5,f=t.saves?.historySize??20;$e(f),Ot(l),ke(t.watch??{}),dn(a,c,h),Rn(l),Ke(t.scenes,t.state),Je(o,s,i,t.static);const v=Object.keys(t.scenes)[0];st(v)};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{e()}):e()}function G(t,e,n){return e!==void 0?`<${t}>${e}</${t}>`:`<${t}>`}const Mn=(t,e)=>G("p",t),Pn=(t,e)=>G("h1",t),$n=(t,e)=>G("h2",t),qn=(t,e)=>G("em",t),Vn=(t,e)=>G("strong",t),Lt=(t,e)=>Tt(Mn(t)),Dt=(t,e)=>Tt(Pn(t)),Nn=(t,e)=>Tt($n(t)),Hn={start:(t,{act:e,goto:n})=>{Dt(p`Лес`),Lt(p`Ты стоишь на опушке. Вокруг ${qn(p`мёртвая`)} тишина.`),t.hasBranch||e(p`Поднять ветку`,o=>{o.hasBranch=!0}),n("clearing",p`Пойти на поляну`)},clearing:(t,{goto:e})=>{Dt(p`Поляна`);const n=t.hasBranch?` ${p`В руке у тебя ${Vn(p`ветка`)}.`}`:"";Lt(p`На поляне тихо.`+n),e("start",p`Вернуться в лес`)}},Un={hp:10,gold:0,hasBranch:!1};xn({sourceLanguage:"ru",state:Un,static:(t,{before:e})=>{e(()=>{Nn(p`Персонаж`),Lt(p`HP: ${t.hp} | Золото: ${t.gold}`)})},scenes:Hn,locales:{en:{Персонаж:"Character","HP: {0} | Золото: {1}":"HP: {0} | Gold: {1}",Лес:"Forest","Ты стоишь на опушке. Вокруг {0} тишина.":"You stand at the forest edge. {0} silence all around.",мёртвая:"Dead","Поднять ветку":"Pick up a branch","Пойти на поляну":"Go to the clearing",Поляна:"Clearing","На поляне тихо.":"The clearing is quiet.","В руке у тебя {0}.":"You hold {0} in your hand.",ветка:"a branch","Вернуться в лес":"Return to the forest"}}});
