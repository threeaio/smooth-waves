import {createContext,useRef,useState,useEffect,useLayoutEffect,useContext}from'react';import {lerp}from'@threeaio/utils/math';import {jsxs,jsx}from'react/jsx-runtime';var Ft=Object.defineProperty,Nt=Object.defineProperties;var Bt=Object.getOwnPropertyDescriptors;var Z=Object.getOwnPropertySymbols;var Pe=Object.prototype.hasOwnProperty,Ve=Object.prototype.propertyIsEnumerable;var We=(e,t,r)=>t in e?Ft(e,t,{enumerable:true,configurable:true,writable:true,value:r}):e[t]=r,g=(e,t)=>{for(var r in t||(t={}))Pe.call(t,r)&&We(e,r,t[r]);if(Z)for(var r of Z(t))Ve.call(t,r)&&We(e,r,t[r]);return e},S=(e,t)=>Nt(e,Bt(t));var z=(e,t)=>{var r={};for(var o in e)Pe.call(e,o)&&t.indexOf(o)<0&&(r[o]=e[o]);if(e!=null&&Z)for(var o of Z(e))t.indexOf(o)<0&&Ve.call(e,o)&&(r[o]=e[o]);return r};function ze(e){let t=useRef(null);return t.current===null&&(t.current=e()),t.current}var Le=createContext({transformPagePoint:e=>e,isStatic:false,reducedMotion:"never"});var Fe=typeof window!="undefined";var Ne=Fe?useLayoutEffect:useEffect;var C=e=>e;var P=C,de=C;process.env.NODE_ENV!=="production"&&(P=(e,t)=>{!e&&typeof console!="undefined"&&console.warn(t);},de=(e,t)=>{if(!e)throw new Error(t)});var H={useManualTiming:false};var $=["read","resolveKeyframes","update","preRender","render","postRender"];function Be(e,t){let r=new Set,o=new Set,n=false,s=false,i=new WeakSet,a={delta:0,timestamp:0,isProcessing:false};function c(l){i.has(l)&&(m.schedule(l),e()),l(a);}let m={schedule:(l,d=false,y=false)=>{let x=y&&n?r:o;return d&&i.add(l),x.has(l)||x.add(l),l},cancel:l=>{o.delete(l),i.delete(l);},process:l=>{if(a=l,n){s=true;return}n=true,[r,o]=[o,r],r.forEach(c),r.clear(),n=false,s&&(s=false,m.process(l));}};return m}var Ut=40;function ke(e,t){let r=false,o=true,n={delta:0,timestamp:0,isProcessing:false},s=()=>r=true,i=$.reduce((p,h)=>(p[h]=Be(s),p),{}),{read:a,resolveKeyframes:f,update:c,preRender:m,render:l,postRender:d}=i,y=()=>{let p=performance.now();r=false,(n.delta=o?1e3/60:Math.max(Math.min(p-n.timestamp,Ut),1)),n.timestamp=p,n.isProcessing=true,a.process(n),f.process(n),c.process(n),m.process(n),l.process(n),d.process(n),n.isProcessing=false,r&&t&&(o=false,e(y));},u=()=>{r=true,o=true,n.isProcessing||e(y);};return {schedule:$.reduce((p,h)=>{let b=i[h];return p[h]=(T,W=false,D=false)=>(r||u(),b.schedule(T,W,D)),p},{}),cancel:p=>{for(let h=0;h<$.length;h++)i[$[h]].cancel(p);},state:n,steps:i}}var{schedule:w,cancel:L,state:U}=ke(typeof requestAnimationFrame!="undefined"?requestAnimationFrame:C,true);var De=new Set;function J(e,t,r){e||De.has(t)||(console.warn(t),De.add(t));}var _t=e=>t=>typeof t=="string"&&t.startsWith(e);var Gt=_t("var(--"),He=e=>Gt(e)?qt.test(e.split("/*")[0].trim()):false,qt=/var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;var A=(e,t,r)=>r>t?t:r<e?e:r;var Q={test:e=>typeof e=="number",parse:parseFloat,transform:e=>e},ee=S(g({},Q),{transform:e=>A(0,1,e)});S(g({},Q),{default:1});var Kt=e=>({test:t=>typeof t=="string"&&t.endsWith(e)&&t.split(" ").length===1,parse:parseFloat,transform:t=>`${t}${e}`});var F=Kt("%");S(g({},F),{parse:e=>F.parse(e)/100,transform:e=>F.transform(e*100)});var te;function Yt(){te=void 0;}var _={now:()=>(te===void 0&&_.set(U.isProcessing||H.useManualTiming?U.timestamp:performance.now()),te),set:e=>{te=e,queueMicrotask(Yt);}};function $e(e,t){e.indexOf(t)===-1&&e.push(t);}function Ue(e,t){let r=e.indexOf(t);r>-1&&e.splice(r,1);}var re=class{constructor(){this.subscriptions=[];}add(t){return $e(this.subscriptions,t),()=>Ue(this.subscriptions,t)}notify(t,r,o){let n=this.subscriptions.length;if(n)if(n===1)this.subscriptions[0](t,r,o);else for(let s=0;s<n;s++){let i=this.subscriptions[s];i&&i(t,r,o);}}getSize(){return this.subscriptions.length}clear(){this.subscriptions.length=0;}};function oe(e,t){return t?e*(1e3/t):0}var _e=30,jt=e=>!isNaN(parseFloat(e)),xe=class{constructor(t,r={}){this.version="12.4.1",this.canTrackVelocity=null,this.events={},this.updateAndNotify=(o,n=true)=>{let s=_.now();this.updatedAt!==s&&this.setPrevFrameValue(),this.prev=this.current,this.setCurrent(o),this.current!==this.prev&&this.events.change&&this.events.change.notify(this.current),n&&this.events.renderRequest&&this.events.renderRequest.notify(this.current);},this.hasAnimated=false,this.setCurrent(t),this.owner=r.owner;}setCurrent(t){this.current=t,this.updatedAt=_.now(),this.canTrackVelocity===null&&t!==void 0&&(this.canTrackVelocity=jt(this.current));}setPrevFrameValue(t=this.current){this.prevFrameValue=t,this.prevUpdatedAt=this.updatedAt;}onChange(t){return process.env.NODE_ENV!=="production"&&J(false,'value.onChange(callback) is deprecated. Switch to value.on("change", callback).'),this.on("change",t)}on(t,r){this.events[t]||(this.events[t]=new re);let o=this.events[t].add(r);return t==="change"?()=>{o(),w.read(()=>{this.events.change.getSize()||this.stop();});}:o}clearListeners(){for(let t in this.events)this.events[t].clear();}attach(t,r){this.passiveEffect=t,this.stopPassiveEffect=r;}set(t,r=true){!r||!this.passiveEffect?this.updateAndNotify(t,r):this.passiveEffect(t,this.updateAndNotify);}setWithVelocity(t,r,o){this.set(r),this.prev=void 0,this.prevFrameValue=t,this.prevUpdatedAt=this.updatedAt-o;}jump(t,r=true){this.updateAndNotify(t),this.prev=t,this.prevUpdatedAt=this.prevFrameValue=void 0,r&&this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect();}get(){return this.current}getPrevious(){return this.prev}getVelocity(){let t=_.now();if(!this.canTrackVelocity||this.prevFrameValue===void 0||t-this.updatedAt>_e)return 0;let r=Math.min(this.updatedAt-this.prevUpdatedAt,_e);return oe(parseFloat(this.current)-parseFloat(this.prevFrameValue),r)}start(t){return this.stop(),new Promise(r=>{this.hasAnimated=true,this.animation=t(r),this.events.animationStart&&this.events.animationStart.notify();}).then(()=>{this.events.animationComplete&&this.events.animationComplete.notify(),this.clearAnimation();})}stop(){this.animation&&(this.animation.stop(),this.events.animationCancel&&this.events.animationCancel.notify()),this.clearAnimation();}isAnimating(){return !!this.animation}clearAnimation(){delete this.animation;}destroy(){this.clearListeners(),this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect();}};function G(e,t){return new xe(e,t)}function qe(e){let t;return ()=>(t===void 0&&(t=e()),t)}var Ke=qe(()=>window.ScrollTimeline!==void 0);var N=(e,t,r)=>{let o=t-e;return o===0?1:(r-e)/o};var Ye=e=>t=>t<=.5?e(2*t)/2:(2-e(2*(1-t)))/2;var ge=e=>1-Math.sin(Math.acos(e)),ve=Ye(ge);var O=e=>Math.round(e*1e5)/1e5;var ne=/-?(?:\d+(?:\.\d+)?|\.\d+)/gu;function Xe(e){return e==null}var Ze=/^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu;var B=(e,t)=>r=>!!(typeof r=="string"&&Ze.test(r)&&r.startsWith(e)||t&&!Xe(r)&&Object.prototype.hasOwnProperty.call(r,t)),se=(e,t,r)=>o=>{if(typeof o!="string")return o;let[n,s,i,a]=o.match(ne);return {[e]:parseFloat(n),[t]:parseFloat(s),[r]:parseFloat(i),alpha:a!==void 0?parseFloat(a):1}};var Zt=e=>A(0,255,e),ye=S(g({},Q),{transform:e=>Math.round(Zt(e))}),E={test:B("rgb","red"),parse:se("red","green","blue"),transform:({red:e,green:t,blue:r,alpha:o=1})=>"rgba("+ye.transform(e)+", "+ye.transform(t)+", "+ye.transform(r)+", "+O(ee.transform(o))+")"};function Jt(e){let t="",r="",o="",n="";return e.length>5?(t=e.substring(1,3),r=e.substring(3,5),o=e.substring(5,7),n=e.substring(7,9)):(t=e.substring(1,2),r=e.substring(2,3),o=e.substring(3,4),n=e.substring(4,5),t+=t,r+=r,o+=o,n+=n),{red:parseInt(t,16),green:parseInt(r,16),blue:parseInt(o,16),alpha:n?parseInt(n,16)/255:1}}var q={test:B("#"),parse:Jt,transform:E.transform};var M={test:B("hsl","hue"),parse:se("hue","saturation","lightness"),transform:({hue:e,saturation:t,lightness:r,alpha:o=1})=>"hsla("+Math.round(e)+", "+F.transform(O(t))+", "+F.transform(O(r))+", "+O(ee.transform(o))+")"};var V={test:e=>E.test(e)||q.test(e)||M.test(e),parse:e=>E.test(e)?E.parse(e):M.test(e)?M.parse(e):q.parse(e),transform:e=>typeof e=="string"?e:e.hasOwnProperty("red")?E.transform(e):M.transform(e)};var Je=/(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;function Qt(e){var t,r;return isNaN(e)&&typeof e=="string"&&(((t=e.match(ne))===null||t===void 0?void 0:t.length)||0)+(((r=e.match(Je))===null||r===void 0?void 0:r.length)||0)>0}var et="number",tt="color",er="var",tr="var(",Qe="${}",rr=/var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;function K(e){let t=e.toString(),r=[],o={color:[],number:[],var:[]},n=[],s=0,a=t.replace(rr,f=>(V.test(f)?(o.color.push(s),n.push(tt),r.push(V.parse(f))):f.startsWith(tr)?(o.var.push(s),n.push(er),r.push(f)):(o.number.push(s),n.push(et),r.push(parseFloat(f))),++s,Qe)).split(Qe);return {values:r,split:a,indexes:o,types:n}}function rt(e){return K(e).values}function ot(e){let{split:t,types:r}=K(e),o=t.length;return n=>{let s="";for(let i=0;i<o;i++)if(s+=t[i],n[i]!==void 0){let a=r[i];a===et?s+=O(n[i]):a===tt?s+=V.transform(n[i]):s+=n[i];}return s}}var or=e=>typeof e=="number"?0:e;function nr(e){let t=rt(e);return ot(e)(t.map(or))}var nt={test:Qt,parse:rt,createTransformer:ot,getAnimatableNone:nr};var I=(e,t,r)=>e+(t-e)*r;function be(e,t,r){return r<0&&(r+=1),r>1&&(r-=1),r<1/6?e+(t-e)*6*r:r<1/2?t:r<2/3?e+(t-e)*(2/3-r)*6:e}function st({hue:e,saturation:t,lightness:r,alpha:o}){e/=360,t/=100,r/=100;let n=0,s=0,i=0;if(!t)n=s=i=r;else {let a=r<.5?r*(1+t):r+t-r*t,f=2*r-a;n=be(f,a,e+1/3),s=be(f,a,e),i=be(f,a,e-1/3);}return {red:Math.round(n*255),green:Math.round(s*255),blue:Math.round(i*255),alpha:o}}function k(e,t){return r=>r>0?t:e}var we=(e,t,r)=>{let o=e*e,n=r*(t*t-o)+o;return n<0?0:Math.sqrt(n)},sr=[q,E,M],ir=e=>sr.find(t=>t.test(e));function it(e){let t=ir(e);if(P(!!t,`'${e}' is not an animatable color. Use the equivalent color code instead.`),!t)return  false;let r=t.parse(e);return t===M&&(r=st(r)),r}var Ee=(e,t)=>{let r=it(e),o=it(t);if(!r||!o)return k(e,t);let n=g({},r);return s=>(n.red=we(r.red,o.red,s),n.green=we(r.green,o.green,s),n.blue=we(r.blue,o.blue,s),n.alpha=I(r.alpha,o.alpha,s),E.transform(n))};var ar=(e,t)=>r=>t(e(r)),ie=(...e)=>e.reduce(ar);var ae=new Set(["none","hidden"]);function at(e,t){return ae.has(e)?r=>r<=0?e:t:r=>r>=1?t:e}function fr(e,t){return r=>I(e,t,r)}function fe(e){return typeof e=="number"?fr:typeof e=="string"?He(e)?k:V.test(e)?Ee:cr:Array.isArray(e)?ft:typeof e=="object"?V.test(e)?Ee:lr:k}function ft(e,t){let r=[...e],o=r.length,n=e.map((s,i)=>fe(s)(s,t[i]));return s=>{for(let i=0;i<o;i++)r[i]=n[i](s);return r}}function lr(e,t){let r=g(g({},e),t),o={};for(let n in r)e[n]!==void 0&&t[n]!==void 0&&(o[n]=fe(e[n])(e[n],t[n]));return n=>{for(let s in o)r[s]=o[s](n);return r}}function mr(e,t){var r;let o=[],n={color:0,var:0,number:0};for(let s=0;s<t.values.length;s++){let i=t.types[s],a=e.indexes[i][n[i]],f=(r=e.values[a])!==null&&r!==void 0?r:0;o[s]=f,n[i]++;}return o}var cr=(e,t)=>{let r=nt.createTransformer(t),o=K(e),n=K(t);return o.indexes.var.length===n.indexes.var.length&&o.indexes.color.length===n.indexes.color.length&&o.indexes.number.length>=n.indexes.number.length?ae.has(e)&&!n.values.length||ae.has(t)&&!o.values.length?at(e,t):ie(ft(mr(o,n),n.values),r):(P(true,`Complex values '${e}' and '${t}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`),k(e,t))};function lt(e,t,r){return typeof e=="number"&&typeof t=="number"&&typeof r=="number"?I(e,t,r):fe(e)(e,t)}function pr(e,t,r){let o=[],n=r||lt,s=e.length-1;for(let i=0;i<s;i++){let a=n(e[i],e[i+1]);if(t){let f=Array.isArray(t)?t[i]||C:t;a=ie(f,a);}o.push(a);}return o}function mt(e,t,{clamp:r=true,ease:o,mixer:n}={}){let s=e.length;if(de(s===t.length,"Both input and output ranges must be the same length"),s===1)return ()=>t[0];if(s===2&&t[0]===t[1])return ()=>t[1];let i=e[0]===e[1];e[0]>e[s-1]&&(e=[...e].reverse(),t=[...t].reverse());let a=pr(t,o,n),f=a.length,c=m=>{if(i&&m<e[0])return t[0];let l=0;if(f>1)for(;l<e.length-2&&!(m<e[l+1]);l++);let d=N(e[l],e[l+1],m);return a[l](d)};return r?m=>c(A(e[0],e[s-1],m)):c}function ct(e,t){let r=e[e.length-1];for(let o=1;o<=t;o++){let n=N(0,t,o);e.push(I(r,1,n));}}function pt(e){let t=[0];return ct(t,e.length-1),t}function ut(e,t,r){var o;if(e instanceof Element)return [e];if(typeof e=="string"){let n=document;let s=(o=void 0)!==null&&o!==void 0?o:n.querySelectorAll(e);return s?Array.from(s):[]}return Array.from(e)}function Se(e,t){let r,o=()=>{let{currentTime:n}=t,i=(n===null?0:n.value)/100;r!==i&&e(i),r=i;};return w.update(o,true),()=>L(o)}var le=new WeakMap,R;function ur(e,t){if(t){let{inlineSize:r,blockSize:o}=t[0];return {width:r,height:o}}else return e instanceof SVGElement&&"getBBox"in e?e.getBBox():{width:e.offsetWidth,height:e.offsetHeight}}function dr({target:e,contentRect:t,borderBoxSize:r}){var o;(o=le.get(e))===null||o===void 0||o.forEach(n=>{n({target:e,contentSize:t,get size(){return ur(e,r)}});});}function hr(e){e.forEach(dr);}function xr(){typeof ResizeObserver!="undefined"&&(R=new ResizeObserver(hr));}function dt(e,t){R||xr();let r=ut(e);return r.forEach(o=>{let n=le.get(o);n||(n=new Set,le.set(o,n)),n.add(t),R==null||R.observe(o);}),()=>{r.forEach(o=>{let n=le.get(o);n==null||n.delete(t),n!=null&&n.size||R==null||R.unobserve(o);});}}var me=new Set,Y;function gr(){Y=()=>{let e={width:window.innerWidth,height:window.innerHeight},t={target:window,size:e,contentSize:e};me.forEach(r=>r(t));},window.addEventListener("resize",Y);}function ht(e){return me.add(e),Y||gr(),()=>{me.delete(e),!me.size&&Y&&(Y=void 0);}}function xt(e,t){return typeof e=="function"?ht(e):dt(e,t)}var vr=50,gt=()=>({current:0,offset:[],progress:0,scrollLength:0,targetOffset:0,targetLength:0,containerLength:0,velocity:0}),yt=()=>({time:0,x:gt(),y:gt()}),yr={x:{length:"Width",position:"Left"},y:{length:"Height",position:"Top"}};function vt(e,t,r,o){let n=r[t],{length:s,position:i}=yr[t],a=n.current,f=r.time;n.current=e[`scroll${i}`],n.scrollLength=e[`scroll${s}`]-e[`client${s}`],n.offset.length=0,n.offset[0]=0,n.offset[1]=n.scrollLength,n.progress=N(0,n.scrollLength,n.current);let c=o-f;n.velocity=c>vr?0:oe(n.current-a,c);}function bt(e,t,r){vt(e,"x",t,r),vt(e,"y",t,r),t.time=r;}function wt(e,t){let r={x:0,y:0},o=e;for(;o&&o!==t;)if(o instanceof HTMLElement)r.x+=o.offsetLeft,r.y+=o.offsetTop,o=o.offsetParent;else if(o.tagName==="svg"){let n=o.getBoundingClientRect();o=o.parentElement;let s=o.getBoundingClientRect();r.x+=n.left-s.left,r.y+=n.top-s.top;}else if(o instanceof SVGGraphicsElement){let{x:n,y:s}=o.getBBox();r.x+=n,r.y+=s;let i=null,a=o.parentNode;for(;!i;)a.tagName==="svg"&&(i=a),a=o.parentNode;o=i;}else break;return r}var ce={start:0,center:.5,end:1};function Ce(e,t,r=0){let o=0;if(e in ce&&(e=ce[e]),typeof e=="string"){let n=parseFloat(e);e.endsWith("px")?o=n:e.endsWith("%")?e=n/100:e.endsWith("vw")?o=n/100*document.documentElement.clientWidth:e.endsWith("vh")?o=n/100*document.documentElement.clientHeight:e=n;}return typeof e=="number"&&(o=t*e),r+o}var br=[0,0];function Et(e,t,r,o){let n=Array.isArray(e)?e:br,s=0,i=0;return typeof e=="number"?n=[e,e]:typeof e=="string"&&(e=e.trim(),e.includes(" ")?n=e.split(" "):n=[e,ce[e]?e:"0"]),s=Ce(n[0],r,o),i=Ce(n[1],t),s-i}var St={All:[[0,0],[1,1]]};var wr={x:0,y:0};function Er(e){return "getBBox"in e&&e.tagName!=="svg"?e.getBBox():{width:e.clientWidth,height:e.clientHeight}}function Ct(e,t,r){let{offset:o=St.All}=r,{target:n=e,axis:s="y"}=r,i=s==="y"?"height":"width",a=n!==e?wt(n,e):wr,f=n===e?{width:e.scrollWidth,height:e.scrollHeight}:Er(n),c={width:e.clientWidth,height:e.clientHeight};t[s].offset.length=0;let m=!t[s].interpolate,l=o.length;for(let d=0;d<l;d++){let y=Et(o[d],c[i],f[i],a[s]);!m&&y!==t[s].interpolatorOffsets[d]&&(m=true),t[s].offset[d]=y;}m&&(t[s].interpolate=mt(t[s].offset,pt(o),{clamp:false}),t[s].interpolatorOffsets=[...t[s].offset]),t[s].progress=A(0,1,t[s].interpolate(t[s].current));}function Sr(e,t=e,r){if(r.x.targetOffset=0,r.y.targetOffset=0,t!==e){let o=t;for(;o&&o!==e;)r.x.targetOffset+=o.offsetLeft,r.y.targetOffset+=o.offsetTop,o=o.offsetParent;}r.x.targetLength=t===e?t.scrollWidth:t.clientWidth,r.y.targetLength=t===e?t.scrollHeight:t.clientHeight,r.x.containerLength=e.clientWidth,r.y.containerLength=e.clientHeight,process.env.NODE_ENV!=="production"&&e&&t&&t!==e&&J(getComputedStyle(e).position!=="static","Please ensure that the container has a non-static position, like 'relative', 'fixed', or 'absolute' to ensure scroll offset is calculated correctly.");}function Tt(e,t,r,o={}){return {measure:()=>Sr(e,o.target,r),update:n=>{bt(e,r,n),(o.offset||o.target)&&Ct(e,r,o);},notify:()=>t(r)}}var j=new WeakMap,At=new WeakMap,Te=new WeakMap,Ot=e=>e===document.documentElement?window:e;function pe(e,o={}){var n=o,{container:t=document.documentElement}=n,r=z(n,["container"]);let s=Te.get(t);s||(s=new Set,Te.set(t,s));let i=yt(),a=Tt(t,e,i,r);if(s.add(a),!j.has(t)){let c=()=>{for(let u of s)u.measure();},m=()=>{for(let u of s)u.update(U.timestamp);},l=()=>{for(let u of s)u.notify();},d=()=>{w.read(c,false,true),w.read(m,false,true),w.update(l,false,true);};j.set(t,d);let y=Ot(t);window.addEventListener("resize",d,{passive:true}),t!==document.documentElement&&At.set(t,xt(t,d)),y.addEventListener("scroll",d,{passive:true});}let f=j.get(t);return w.read(f,false,true),()=>{var c;L(f);let m=Te.get(t);if(!m||(m.delete(a),m.size))return;let l=j.get(t);j.delete(t),l&&(Ot(t).removeEventListener("scroll",l),(c=At.get(t))===null||c===void 0||c(),window.removeEventListener("resize",l));}}function Cr({source:e,container:t,axis:r="y"}){e&&(t=e);let o={value:0},n=pe(s=>{o.value=s[r].progress*100;},{container:t,axis:r});return {currentTime:o,cancel:n}}var Ae=new Map;function Mt({source:e,container:t=document.documentElement,axis:r="y"}={}){e&&(t=e),Ae.has(t)||Ae.set(t,{});let o=Ae.get(t);return o[r]||(o[r]=Ke()?new ScrollTimeline({source:t,axis:r}):Cr({source:t,axis:r})),o[r]}function Tr(e){return e.length===2}function It(e){return e&&(e.target||e.offset)}function Ar(e,t){return Tr(e)||It(t)?pe(r=>{e(r[t.axis].progress,r);},t):Se(e,Mt(t))}function Or(e,t){if(e.flatten(),It(t))return e.pause(),pe(r=>{e.time=e.duration*r[t.axis].progress;},t);{let r=Mt(t);return e.attachTimeline?e.attachTimeline(r,o=>(o.pause(),Se(n=>{o.time=o.duration*n;},r))):C}}function Rt(e,o={}){var n=o,{axis:t="y"}=n,r=z(n,["axis"]);let s=g({axis:t},r);return typeof e=="function"?Ar(e,s):Or(e,s)}function Wt(e,t){P(!!(!t||t.current),`You have defined a ${e} options but the provided ref is not yet hydrated, probably because it's defined higher up the tree. Try calling useScroll() in the same component as the ref, or setting its \`layoutEffect: false\` option.`);}var Ir=()=>({scrollX:G(0),scrollY:G(0),scrollXProgress:G(0),scrollYProgress:G(0)});function Oe(n={}){var s=n,{container:e,target:t,layoutEffect:r=true}=s,o=z(s,["container","target","layoutEffect"]);let i=ze(Ir);return (r?Ne:useEffect)(()=>(Wt("target",t),Wt("container",e),Rt((f,{x:c,y:m})=>{i.scrollX.set(c.current),i.scrollXProgress.set(c.progress),i.scrollY.set(m.current),i.scrollYProgress.set(m.progress);},S(g({},o),{container:(e==null?void 0:e.current)||void 0,target:(t==null?void 0:t.current)||void 0}))),[e,t,JSON.stringify(o.offset)]),i}function Me(e){let t=useRef(0),{isStatic:r}=useContext(Le);useEffect(()=>{if(r)return;let o=({timestamp:n,delta:s})=>{t.current||(t.current=n),e(n-t.current,s);};return w.update(o,true),()=>L(o)},[e]);}var Vr={forceOverlay:false,fillStyle:"hsl(162,12%,14%)",strokeStyle:"white",fillStyleOverlay:"#242e2b",stable:{right:[.2,.9,-0.5],left:[.7,.6,.6]},in:{right:[.2,.9,-0.8],left:[.7,.6,.9]},out:{right:[.2,.9,-0.2],left:[.7,.6,.3]},scrollOffset:["start 80%","end 90%"]};function ue(e,t,r){return [lerp(e[0],t[0],r),lerp(e[1],t[1],r),lerp(e[2],t[2],r)]}function zt(e,t,r){return {left:ue(e.left,t.left,r),right:ue(e.right,t.right,r)}}function zr(e,t,r=1,o=1,n=0,s=0,i,a){e.beginPath(),e.moveTo(0,0),e.lineTo(i,0),e.lineTo(i,a*t.right[0]),e.bezierCurveTo(i-t.right[1]*i,t.right[0]*a+t.right[2]*r*a,t.left[1]*i,t.left[0]*a+t.left[2]*r*a,0,t.left[0]*a),e.closePath(),e.fill();for(let f=0;f<o;f++){let c=f+1;e.beginPath(),e.moveTo(i,a*t.right[0]+s*c),e.bezierCurveTo(i-t.right[1]*i,t.right[0]*a+t.right[2]*r*a+s*c,t.left[1]*i,t.left[0]*a+t.left[2]*r*a+n*c,0,t.left[0]*a+n*c),e.stroke();}}function Lt({waveConfig:e=Vr}){let t=useRef(null),r=useRef(null),o=useRef(null),n=ve,{scrollYProgress:s}=Oe({target:t,offset:e.scrollOffset}),[i,a]=useState(1),[f,c]=useState(e.in),m=useRef(null),l=4e3,d=useRef(s.get());useEffect(()=>{a(window.devicePixelRatio||1);},[]),useEffect(()=>{let u=()=>{let x=r.current,v=o.current,p=t.current;if(!x||!p)return;let h=p.clientWidth,b=p.clientHeight;x.style.width=`${h}px`,x.style.height=`${b}px`,x.width=h*i,x.height=b*i,v&&e.forceOverlay&&(v.style.width=`${h}px`,v.style.height=`${b}px`,v.width=h*i,v.height=b*i);};return u(),window.addEventListener("resize",u),()=>window.removeEventListener("resize",u)},[i,e.forceOverlay]);let y=(u,x,v)=>{var h,b,T,W;if(!u)return;let p=u.getContext("2d");p&&(p.setTransform(1,0,0,1,0,0),p.clearRect(0,0,u.width,u.height),p.scale(i,i),p.fillStyle=v,p.strokeStyle=(h=e.strokeStyle)!=null?h:"white",p.lineWidth=.4,zr(p,x,1,(b=e.curveAmount)!=null?b:1,(T=e.offsetLeft)!=null?T:0,(W=e.offsetRight)!=null?W:0,u.width/i,u.height/i));};return Me(u=>{var W;let x=s.get(),v;if(x>.5){let D=(x-.5)*2;v=zt(e.stable,e.out,D);}else {let D=x*2;v=zt(e.in,e.stable,D);}m.current||(m.current=u);let p=u-m.current,h=Math.min(p/l,1),b=n(h),T={left:ue(f.left,v.left,b),right:ue(f.right,v.right,b)};c(T),x!==d.current&&(m.current=u,d.current=x),e.forceOverlay&&y(o.current,T,(W=e.fillStyleOverlay)!=null?W:"#242e2b"),y(r.current,T,e.fillStyle);}),jsxs("div",{className:"absolute inset-0",ref:t,children:[e.forceOverlay&&jsx("canvas",{ref:o,className:"size-full"}),jsx("div",{className:"absolute inset-0",style:{mask:"linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 100) 30%)"},children:jsx("canvas",{ref:r,className:"size-full"})})]})}export{Lt as Wave};//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map