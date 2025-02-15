import {createContext,useRef,useState,useEffect,useLayoutEffect,useContext,useInsertionEffect}from'react';import {remap,lerp}from'@threeaio/utils/math';import {jsx}from'react/jsx-runtime';var _r=Object.defineProperty,Gr=Object.defineProperties;var Hr=Object.getOwnPropertyDescriptors;var ue=Object.getOwnPropertySymbols;var yt=Object.prototype.hasOwnProperty,bt=Object.prototype.propertyIsEnumerable;var vt=(e,t,r)=>t in e?_r(e,t,{enumerable:true,configurable:true,writable:true,value:r}):e[t]=r,v=(e,t)=>{for(var r in t||(t={}))yt.call(t,r)&&vt(e,r,t[r]);if(ue)for(var r of ue(t))bt.call(t,r)&&vt(e,r,t[r]);return e},E=(e,t)=>Gr(e,Hr(t));var L=(e,t)=>{var r={};for(var o in e)yt.call(e,o)&&t.indexOf(o)<0&&(r[o]=e[o]);if(e!=null&&ue)for(var o of ue(e))t.indexOf(o)<0&&bt.call(e,o)&&(r[o]=e[o]);return r};function X(e){let t=useRef(null);return t.current===null&&(t.current=e()),t.current}var J=createContext({transformPagePoint:e=>e,isStatic:false,reducedMotion:"never"});var Tt=typeof window!="undefined";var pe=Tt?useLayoutEffect:useEffect;var A=e=>e;var R=A,W=A;process.env.NODE_ENV!=="production"&&(R=(e,t)=>{!e&&typeof console!="undefined"&&console.warn(t);},W=(e,t)=>{if(!e)throw new Error(t)});var ne={useManualTiming:false};var se=["read","resolveKeyframes","update","preRender","render","postRender"];function St(e,t){let r=new Set,o=new Set,n=false,s=false,i=new WeakSet,a={delta:0,timestamp:0,isProcessing:false};function c(f){i.has(f)&&(m.schedule(f),e()),f(a);}let m={schedule:(f,u=false,p=false)=>{let g=p&&n?r:o;return u&&i.add(f),g.has(f)||g.add(f),f},cancel:f=>{o.delete(f),i.delete(f);},process:f=>{if(a=f,n){s=true;return}n=true,[r,o]=[o,r],r.forEach(c),r.clear(),n=false,s&&(s=false,m.process(f));}};return m}var Yr=40;function wt(e,t){let r=false,o=true,n={delta:0,timestamp:0,isProcessing:false},s=()=>r=true,i=se.reduce((y,w)=>(y[w]=St(s),y),{}),{read:a,resolveKeyframes:l,update:c,preRender:m,render:f,postRender:u}=i,p=()=>{let y=performance.now();r=false,(n.delta=o?1e3/60:Math.max(Math.min(y-n.timestamp,Yr),1)),n.timestamp=y,n.isProcessing=true,a.process(n),l.process(n),c.process(n),m.process(n),f.process(n),u.process(n),n.isProcessing=false,r&&t&&(o=false,e(p));},x=()=>{r=true,o=true,n.isProcessing||e(p);};return {schedule:se.reduce((y,w)=>{let O=i[w];return y[w]=(D,d=false,S=false)=>(r||x(),O.schedule(D,d,S)),y},{}),cancel:y=>{for(let w=0;w<se.length;w++)i[se[w]].cancel(y);},state:n,steps:i}}var{schedule:M,cancel:N,state:B}=wt(typeof requestAnimationFrame!="undefined"?requestAnimationFrame:A,true);var Et=new Set;function de(e,t,r){e||Et.has(t)||(console.warn(t),Et.add(t));}var jr=e=>t=>typeof t=="string"&&t.startsWith(e);var Zr=jr("var(--"),Mt=e=>Zr(e)?Jr.test(e.split("/*")[0].trim()):false,Jr=/var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;var Ue=["transformPerspective","x","y","z","translateX","translateY","translateZ","scale","scaleX","scaleY","rotate","rotateX","rotateY","rotateZ","skew","skewX","skewY"];new Set(Ue);var Xe=e=>!!(e&&e.getVelocity);var C=(e,t,r)=>r>t?t:r<e?e:r;var he={test:e=>typeof e=="number",parse:parseFloat,transform:e=>e},ge=E(v({},he),{transform:e=>C(0,1,e)});E(v({},he),{default:1});var Qr=e=>({test:t=>typeof t=="string"&&t.endsWith(e)&&t.split(" ").length===1,parse:parseFloat,transform:t=>`${t}${e}`});var Q=Qr("%");E(v({},Q),{parse:e=>Q.parse(e)/100,transform:e=>Q.transform(e*100)});var xe;function eo(){xe=void 0;}var I={now:()=>(xe===void 0&&I.set(B.isProcessing||ne.useManualTiming?B.timestamp:performance.now()),xe),set:e=>{xe=e,queueMicrotask(eo);}};function At(e,t){e.indexOf(t)===-1&&e.push(t);}function Ct(e,t){let r=e.indexOf(t);r>-1&&e.splice(r,1);}var ve=class{constructor(){this.subscriptions=[];}add(t){return At(this.subscriptions,t),()=>Ct(this.subscriptions,t)}notify(t,r,o){let n=this.subscriptions.length;if(n)if(n===1)this.subscriptions[0](t,r,o);else for(let s=0;s<n;s++){let i=this.subscriptions[s];i&&i(t,r,o);}}getSize(){return this.subscriptions.length}clear(){this.subscriptions.length=0;}};function ee(e,t){return t?e*(1e3/t):0}var Pt=30,to=e=>!isNaN(parseFloat(e)),qe=class{constructor(t,r={}){this.version="12.4.1",this.canTrackVelocity=null,this.events={},this.updateAndNotify=(o,n=true)=>{let s=I.now();this.updatedAt!==s&&this.setPrevFrameValue(),this.prev=this.current,this.setCurrent(o),this.current!==this.prev&&this.events.change&&this.events.change.notify(this.current),n&&this.events.renderRequest&&this.events.renderRequest.notify(this.current);},this.hasAnimated=false,this.setCurrent(t),this.owner=r.owner;}setCurrent(t){this.current=t,this.updatedAt=I.now(),this.canTrackVelocity===null&&t!==void 0&&(this.canTrackVelocity=to(this.current));}setPrevFrameValue(t=this.current){this.prevFrameValue=t,this.prevUpdatedAt=this.updatedAt;}onChange(t){return process.env.NODE_ENV!=="production"&&de(false,'value.onChange(callback) is deprecated. Switch to value.on("change", callback).'),this.on("change",t)}on(t,r){this.events[t]||(this.events[t]=new ve);let o=this.events[t].add(r);return t==="change"?()=>{o(),M.read(()=>{this.events.change.getSize()||this.stop();});}:o}clearListeners(){for(let t in this.events)this.events[t].clear();}attach(t,r){this.passiveEffect=t,this.stopPassiveEffect=r;}set(t,r=true){!r||!this.passiveEffect?this.updateAndNotify(t,r):this.passiveEffect(t,this.updateAndNotify);}setWithVelocity(t,r,o){this.set(r),this.prev=void 0,this.prevFrameValue=t,this.prevUpdatedAt=this.updatedAt-o;}jump(t,r=true){this.updateAndNotify(t),this.prev=t,this.prevUpdatedAt=this.prevFrameValue=void 0,r&&this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect();}get(){return this.current}getPrevious(){return this.prev}getVelocity(){let t=I.now();if(!this.canTrackVelocity||this.prevFrameValue===void 0||t-this.updatedAt>Pt)return 0;let r=Math.min(this.updatedAt-this.prevUpdatedAt,Pt);return ee(parseFloat(this.current)-parseFloat(this.prevFrameValue),r)}start(t){return this.stop(),new Promise(r=>{this.hasAnimated=true,this.animation=t(r),this.events.animationStart&&this.events.animationStart.notify();}).then(()=>{this.events.animationComplete&&this.events.animationComplete.notify(),this.clearAnimation();})}stop(){this.animation&&(this.animation.stop(),this.events.animationCancel&&this.events.animationCancel.notify()),this.clearAnimation();}isAnimating(){return !!this.animation}clearAnimation(){delete this.animation;}destroy(){this.clearListeners(),this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect();}};function q(e,t){return new qe(e,t)}function Dt(e){let t;return ()=>(t===void 0&&(t=e()),t)}var Ft=Dt(()=>window.ScrollTimeline!==void 0);var Y=e=>e*1e3,k=e=>e/1e3;function ye(e){return typeof e=="function"}var It=e=>Array.isArray(e)&&typeof e[0]=="number";var K=(e,t,r)=>{let o=t-e;return o===0?1:(r-e)/o};var Vt=(e,t,r=10)=>{let o="",n=Math.max(Math.round(t/r),2);for(let s=0;s<n;s++)o+=e(K(0,n-1,s))+", ";return `linear(${o.substring(0,o.length-2)})`};var zt=(e,t,r)=>(((1-3*r+3*t)*e+(3*r-6*t))*e+3*t)*e,ro=1e-7,oo=12;function no(e,t,r,o,n){let s,i,a=0;do i=t+(r-t)/2,s=zt(i,o,n)-e,s>0?r=i:t=i;while(Math.abs(s)>ro&&++a<oo);return i}function _(e,t,r,o){if(e===t&&r===o)return A;let n=s=>no(s,0,1,e,r);return s=>s===0||s===1?s:zt(n(s),t,o)}var be=e=>t=>t<=.5?e(2*t)/2:(2-e(2*(1-t)))/2;var Te=e=>t=>1-e(1-t);var Ye=_(.33,1.53,.69,.99),ie=Te(Ye),kt=be(ie);var Lt=e=>(e*=2)<1?.5*ie(e):.5*(2-Math.pow(2,-10*(e-1)));var Se=e=>1-Math.sin(Math.acos(e)),Wt=Te(Se),Nt=be(Se);var G=e=>Math.round(e*1e5)/1e5;var we=/-?(?:\d+(?:\.\d+)?|\.\d+)/gu;function Bt(e){return e==null}var Kt=/^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu;var te=(e,t)=>r=>!!(typeof r=="string"&&Kt.test(r)&&r.startsWith(e)||t&&!Bt(r)&&Object.prototype.hasOwnProperty.call(r,t)),Ee=(e,t,r)=>o=>{if(typeof o!="string")return o;let[n,s,i,a]=o.match(we);return {[e]:parseFloat(n),[t]:parseFloat(s),[r]:parseFloat(i),alpha:a!==void 0?parseFloat(a):1}};var so=e=>C(0,255,e),je=E(v({},he),{transform:e=>Math.round(so(e))}),V={test:te("rgb","red"),parse:Ee("red","green","blue"),transform:({red:e,green:t,blue:r,alpha:o=1})=>"rgba("+je.transform(e)+", "+je.transform(t)+", "+je.transform(r)+", "+G(ge.transform(o))+")"};function io(e){let t="",r="",o="",n="";return e.length>5?(t=e.substring(1,3),r=e.substring(3,5),o=e.substring(5,7),n=e.substring(7,9)):(t=e.substring(1,2),r=e.substring(2,3),o=e.substring(3,4),n=e.substring(4,5),t+=t,r+=r,o+=o,n+=n),{red:parseInt(t,16),green:parseInt(r,16),blue:parseInt(o,16),alpha:n?parseInt(n,16)/255:1}}var ae={test:te("#"),parse:io,transform:V.transform};var H={test:te("hsl","hue"),parse:Ee("hue","saturation","lightness"),transform:({hue:e,saturation:t,lightness:r,alpha:o=1})=>"hsla("+Math.round(e)+", "+Q.transform(G(t))+", "+Q.transform(G(r))+", "+G(ge.transform(o))+")"};var j={test:e=>V.test(e)||ae.test(e)||H.test(e),parse:e=>V.test(e)?V.parse(e):H.test(e)?H.parse(e):ae.parse(e),transform:e=>typeof e=="string"?e:e.hasOwnProperty("red")?V.transform(e):H.transform(e)};var _t=/(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;function ao(e){var t,r;return isNaN(e)&&typeof e=="string"&&(((t=e.match(we))===null||t===void 0?void 0:t.length)||0)+(((r=e.match(_t))===null||r===void 0?void 0:r.length)||0)>0}var Ht="number",$t="color",lo="var",fo="var(",Gt="${}",co=/var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;function le(e){let t=e.toString(),r=[],o={color:[],number:[],var:[]},n=[],s=0,a=t.replace(co,l=>(j.test(l)?(o.color.push(s),n.push($t),r.push(j.parse(l))):l.startsWith(fo)?(o.var.push(s),n.push(lo),r.push(l)):(o.number.push(s),n.push(Ht),r.push(parseFloat(l))),++s,Gt)).split(Gt);return {values:r,split:a,indexes:o,types:n}}function Ut(e){return le(e).values}function Xt(e){let{split:t,types:r}=le(e),o=t.length;return n=>{let s="";for(let i=0;i<o;i++)if(s+=t[i],n[i]!==void 0){let a=r[i];a===Ht?s+=G(n[i]):a===$t?s+=j.transform(n[i]):s+=n[i];}return s}}var mo=e=>typeof e=="number"?0:e;function uo(e){let t=Ut(e);return Xt(e)(t.map(mo))}var Me={test:ao,parse:Ut,createTransformer:Xt,getAnimatableNone:uo};var po=new Set(["x","y","z"]),ho=Ue.filter(e=>!po.has(e));function jt(e){let t=[];return ho.forEach(r=>{let o=e.getValue(r);o!==void 0&&(t.push([r,o.get()]),o.set(r.startsWith("scale")?1:0));}),t}var Z=new Set,Ze=false,Je=false;function Zt(){if(Je){let e=Array.from(Z).filter(o=>o.needsMeasurement),t=new Set(e.map(o=>o.element)),r=new Map;t.forEach(o=>{let n=jt(o);n.length&&(r.set(o,n),o.render());}),e.forEach(o=>o.measureInitialState()),t.forEach(o=>{o.render();let n=r.get(o);n&&n.forEach(([s,i])=>{var a;(a=o.getValue(s))===null||a===void 0||a.set(i);});}),e.forEach(o=>o.measureEndState()),e.forEach(o=>{o.suspendedScrollY!==void 0&&window.scrollTo(0,o.suspendedScrollY);});}Je=false,Ze=false,Z.forEach(e=>e.complete()),Z.clear();}function Jt(){Z.forEach(e=>{e.readKeyframes(),e.needsMeasurement&&(Je=true);});}function Qt(){Jt(),Zt();}var Ce=class{constructor(t,r,o,n,s,i=false){this.isComplete=false,this.isAsync=false,this.needsMeasurement=false,this.isScheduled=false,this.unresolvedKeyframes=[...t],this.onComplete=r,this.name=o,this.motionValue=n,this.element=s,this.isAsync=i;}scheduleResolve(){this.isScheduled=true,this.isAsync?(Z.add(this),Ze||(Ze=true,M.read(Jt),M.resolveKeyframes(Zt))):(this.readKeyframes(),this.complete());}readKeyframes(){let{unresolvedKeyframes:t,name:r,element:o,motionValue:n}=this;for(let s=0;s<t.length;s++)if(t[s]===null)if(s===0){let i=n==null?void 0:n.get(),a=t[t.length-1];if(i!==void 0)t[0]=i;else if(o&&r){let l=o.readValue(r,a);l!=null&&(t[0]=l);}t[0]===void 0&&(t[0]=a),n&&i===void 0&&n.set(t[0]);}else t[s]=t[s-1];}setFinalKeyframe(){}measureInitialState(){}renderEndStyles(){}measureEndState(){}complete(){this.isComplete=true,this.onComplete(this.unresolvedKeyframes,this.finalKeyframe),Z.delete(this);}cancel(){this.isComplete||(this.isScheduled=false,Z.delete(this));}resume(){this.isComplete||this.scheduleResolve();}};var Qe=(e,t)=>t==="zIndex"?false:!!(typeof e=="number"||Array.isArray(e)||typeof e=="string"&&(Me.test(e)||e==="0")&&!e.startsWith("url("));function go(e){let t=e[0];if(e.length===1)return  true;for(let r=0;r<e.length;r++)if(e[r]!==t)return  true}function er(e,t,r,o){let n=e[0];if(n===null)return  false;if(t==="display"||t==="visibility")return  true;let s=e[e.length-1],i=Qe(n,t),a=Qe(s,t);return R(i===a,`You are trying to animate ${t} from "${n}" to "${s}". ${n} is not an animatable value - to enable this animation set ${n} to a value animatable to ${s} via the \`style\` property.`),!i||!a?false:go(e)||(r==="spring"||ye(r))&&o}var xo=e=>e!==null;function Pe(e,{repeat:t,repeatType:r="loop"},o){let n=e.filter(xo),s=t&&r!=="loop"&&t%2===1?0:n.length-1;return !s||o===void 0?n[s]:o}var vo=40,Oe=class{constructor(l){var c=l,{autoplay:t=true,delay:r=0,type:o="keyframes",repeat:n=0,repeatDelay:s=0,repeatType:i="loop"}=c,a=L(c,["autoplay","delay","type","repeat","repeatDelay","repeatType"]);this.isStopped=false,this.hasAttemptedResolve=false,this.createdAt=I.now(),this.options=v({autoplay:t,delay:r,type:o,repeat:n,repeatDelay:s,repeatType:i},a),this.updateFinishedPromise();}calcStartTime(){return this.resolvedAt?this.resolvedAt-this.createdAt>vo?this.resolvedAt:this.createdAt:this.createdAt}get resolved(){return !this._resolved&&!this.hasAttemptedResolve&&Qt(),this._resolved}onKeyframesResolved(t,r){this.resolvedAt=I.now(),this.hasAttemptedResolve=true;let{name:o,type:n,velocity:s,delay:i,onComplete:a,onUpdate:l,isGenerator:c}=this.options;if(!c&&!er(t,o,n,s))if(!i){l&&l(Pe(t,this.options,r)),a&&a(),this.resolveFinishedPromise();return}else this.options.duration=0;let m=this.initPlayback(t,r);m!==false&&(this._resolved=v({keyframes:t,finalKeyframe:r},m),this.onPostResolved());}onPostResolved(){}then(t,r){return this.currentFinishedPromise.then(t,r)}flatten(){this.options.type="keyframes",this.options.ease="linear";}updateFinishedPromise(){this.currentFinishedPromise=new Promise(t=>{this.resolveFinishedPromise=t;});}};function De(e){let t=0,r=50,o=e.next(t);for(;!o.done&&t<2e4;)t+=r,o=e.next(t);return t>=2e4?1/0:t}var $=(e,t,r)=>e+(t-e)*r;function tt(e,t,r){return r<0&&(r+=1),r>1&&(r-=1),r<1/6?e+(t-e)*6*r:r<1/2?t:r<2/3?e+(t-e)*(2/3-r)*6:e}function tr({hue:e,saturation:t,lightness:r,alpha:o}){e/=360,t/=100,r/=100;let n=0,s=0,i=0;if(!t)n=s=i=r;else {let a=r<.5?r*(1+t):r+t-r*t,l=2*r-a;n=tt(l,a,e+1/3),s=tt(l,a,e),i=tt(l,a,e-1/3);}return {red:Math.round(n*255),green:Math.round(s*255),blue:Math.round(i*255),alpha:o}}function re(e,t){return r=>r>0?t:e}var rt=(e,t,r)=>{let o=e*e,n=r*(t*t-o)+o;return n<0?0:Math.sqrt(n)},yo=[ae,V,H],bo=e=>yo.find(t=>t.test(e));function rr(e){let t=bo(e);if(R(!!t,`'${e}' is not an animatable color. Use the equivalent color code instead.`),!t)return  false;let r=t.parse(e);return t===H&&(r=tr(r)),r}var ot=(e,t)=>{let r=rr(e),o=rr(t);if(!r||!o)return re(e,t);let n=v({},r);return s=>(n.red=rt(r.red,o.red,s),n.green=rt(r.green,o.green,s),n.blue=rt(r.blue,o.blue,s),n.alpha=$(r.alpha,o.alpha,s),V.transform(n))};var To=(e,t)=>r=>t(e(r)),oe=(...e)=>e.reduce(To);var Fe=new Set(["none","hidden"]);function or(e,t){return Fe.has(e)?r=>r<=0?e:t:r=>r>=1?t:e}function So(e,t){return r=>$(e,t,r)}function Re(e){return typeof e=="number"?So:typeof e=="string"?Mt(e)?re:j.test(e)?ot:Mo:Array.isArray(e)?nr:typeof e=="object"?j.test(e)?ot:wo:re}function nr(e,t){let r=[...e],o=r.length,n=e.map((s,i)=>Re(s)(s,t[i]));return s=>{for(let i=0;i<o;i++)r[i]=n[i](s);return r}}function wo(e,t){let r=v(v({},e),t),o={};for(let n in r)e[n]!==void 0&&t[n]!==void 0&&(o[n]=Re(e[n])(e[n],t[n]));return n=>{for(let s in o)r[s]=o[s](n);return r}}function Eo(e,t){var r;let o=[],n={color:0,var:0,number:0};for(let s=0;s<t.values.length;s++){let i=t.types[s],a=e.indexes[i][n[i]],l=(r=e.values[a])!==null&&r!==void 0?r:0;o[s]=l,n[i]++;}return o}var Mo=(e,t)=>{let r=Me.createTransformer(t),o=le(e),n=le(t);return o.indexes.var.length===n.indexes.var.length&&o.indexes.color.length===n.indexes.color.length&&o.indexes.number.length>=n.indexes.number.length?Fe.has(e)&&!n.values.length||Fe.has(t)&&!o.values.length?or(e,t):oe(nr(Eo(o,n),n.values),r):(R(true,`Complex values '${e}' and '${t}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`),re(e,t))};function Ie(e,t,r){return typeof e=="number"&&typeof t=="number"&&typeof r=="number"?$(e,t,r):Re(e)(e,t)}var Ao=5;function Ve(e,t,r){let o=Math.max(t-Ao,0);return ee(r-e(o),t-o)}var T={stiffness:100,damping:10,mass:1,velocity:0,duration:800,bounce:.3,visualDuration:.3,restSpeed:{granular:.01,default:2},restDelta:{granular:.005,default:.5},minDuration:.01,maxDuration:10,minDamping:.05,maxDamping:1};var nt=.001;function sr({duration:e=T.duration,bounce:t=T.bounce,velocity:r=T.velocity,mass:o=T.mass}){let n,s;R(e<=Y(T.maxDuration),"Spring duration must be 10 seconds or less");let i=1-t;i=C(T.minDamping,T.maxDamping,i),e=C(T.minDuration,T.maxDuration,k(e)),i<1?(n=c=>{let m=c*i,f=m*e,u=m-r,p=ze(c,i),x=Math.exp(-f);return nt-u/p*x},s=c=>{let f=c*i*e,u=f*r+r,p=Math.pow(i,2)*Math.pow(c,2)*e,x=Math.exp(-f),g=ze(Math.pow(c,2),i);return (-n(c)+nt>0?-1:1)*((u-p)*x)/g}):(n=c=>{let m=Math.exp(-c*e),f=(c-r)*e+1;return  -1e-3+m*f},s=c=>{let m=Math.exp(-c*e),f=(r-c)*(e*e);return m*f});let a=5/e,l=Po(n,s,a);if(e=Y(e),isNaN(l))return {stiffness:T.stiffness,damping:T.damping,duration:e};{let c=Math.pow(l,2)*o;return {stiffness:c,damping:i*2*Math.sqrt(o*c),duration:e}}}var Co=12;function Po(e,t,r){let o=r;for(let n=1;n<Co;n++)o=o-e(o)/t(o);return o}function ze(e,t){return e*Math.sqrt(1-t*t)}var Do=["duration","bounce"],Fo=["stiffness","damping","mass"];function ir(e,t){return t.some(r=>e[r]!==void 0)}function Ro(e){let t=v({velocity:T.velocity,stiffness:T.stiffness,damping:T.damping,mass:T.mass,isResolvedFromDuration:false},e);if(!ir(e,Fo)&&ir(e,Do))if(e.visualDuration){let r=e.visualDuration,o=2*Math.PI/(r*1.2),n=o*o,s=2*C(.05,1,1-(e.bounce||0))*Math.sqrt(n);t=E(v({},t),{mass:T.mass,stiffness:n,damping:s});}else {let r=sr(e);t=E(v(v({},t),r),{mass:T.mass}),t.isResolvedFromDuration=true;}return t}function ke(e=T.visualDuration,t=T.bounce){let r=typeof e!="object"?{visualDuration:e,keyframes:[0,1],bounce:t}:e,{restSpeed:o,restDelta:n}=r,s=r.keyframes[0],i=r.keyframes[r.keyframes.length-1],a={done:false,value:s},{stiffness:l,damping:c,mass:m,duration:f,velocity:u,isResolvedFromDuration:p}=Ro(E(v({},r),{velocity:-k(r.velocity||0)})),x=u||0,g=c/(2*Math.sqrt(l*m)),b=i-s,y=k(Math.sqrt(l/m)),w=Math.abs(b)<5;o||(o=w?T.restSpeed.granular:T.restSpeed.default),n||(n=w?T.restDelta.granular:T.restDelta.default);let O;if(g<1){let d=ze(y,g);O=S=>{let P=Math.exp(-g*y*S);return i-P*((x+g*y*b)/d*Math.sin(d*S)+b*Math.cos(d*S))};}else if(g===1)O=d=>i-Math.exp(-y*d)*(b+(x+y*b)*d);else {let d=y*Math.sqrt(g*g-1);O=S=>{let P=Math.exp(-g*y*S),h=Math.min(d*S,300);return i-P*((x+g*y*b)*Math.sinh(h)+d*b*Math.cosh(h))/d};}let D={calculatedDuration:p&&f||null,next:d=>{let S=O(d);if(p)a.done=d>=f;else {let P=0;g<1&&(P=d===0?Y(x):Ve(O,d,S));let h=Math.abs(P)<=o,F=Math.abs(i-S)<=n;a.done=h&&F;}return a.value=a.done?i:S,a},toString:()=>{let d=Math.min(De(D),2e4),S=Vt(P=>D.next(d*P).value,d,30);return d+"ms "+S}};return D}function st({keyframes:e,velocity:t=0,power:r=.8,timeConstant:o=325,bounceDamping:n=10,bounceStiffness:s=500,modifyTarget:i,min:a,max:l,restDelta:c=.5,restSpeed:m}){let f=e[0],u={done:false,value:f},p=h=>a!==void 0&&h<a||l!==void 0&&h>l,x=h=>a===void 0?l:l===void 0||Math.abs(a-h)<Math.abs(l-h)?a:l,g=r*t,b=f+g,y=i===void 0?b:i(b);y!==b&&(g=y-f);let w=h=>-g*Math.exp(-h/o),O=h=>y+w(h),D=h=>{let F=w(h),z=O(h);u.done=Math.abs(F)<=c,u.value=u.done?y:z;},d,S,P=h=>{p(u.value)&&(d=h,S=ke({keyframes:[u.value,x(u.value)],velocity:Ve(O,h,u.value),damping:n,stiffness:s,restDelta:c,restSpeed:m}));};return P(0),{calculatedDuration:null,next:h=>{let F=false;return !S&&d===void 0&&(F=true,D(h),P(h)),d!==void 0&&h>=d?S.next(h-d):(!F&&D(h),u)}}}var ar=_(.42,0,1,1),lr=_(0,0,.58,1),Le=_(.42,0,.58,1);var fr=e=>Array.isArray(e)&&typeof e[0]!="number";var cr={linear:A,easeIn:ar,easeInOut:Le,easeOut:lr,circIn:Se,circInOut:Nt,circOut:Wt,backIn:ie,backInOut:kt,backOut:Ye,anticipate:Lt},it=e=>{if(It(e)){W(e.length===4,"Cubic bezier arrays must contain four numerical values.");let[t,r,o,n]=e;return _(t,r,o,n)}else if(typeof e=="string")return W(cr[e]!==void 0,`Invalid easing type '${e}'`),cr[e];return e};function Io(e,t,r){let o=[],n=r||Ie,s=e.length-1;for(let i=0;i<s;i++){let a=n(e[i],e[i+1]);if(t){let l=Array.isArray(t)?t[i]||A:t;a=oe(l,a);}o.push(a);}return o}function We(e,t,{clamp:r=true,ease:o,mixer:n}={}){let s=e.length;if(W(s===t.length,"Both input and output ranges must be the same length"),s===1)return ()=>t[0];if(s===2&&t[0]===t[1])return ()=>t[1];let i=e[0]===e[1];e[0]>e[s-1]&&(e=[...e].reverse(),t=[...t].reverse());let a=Io(t,o,n),l=a.length,c=m=>{if(i&&m<e[0])return t[0];let f=0;if(l>1)for(;f<e.length-2&&!(m<e[f+1]);f++);let u=K(e[f],e[f+1],m);return a[f](u)};return r?m=>c(C(e[0],e[s-1],m)):c}function mr(e,t){let r=e[e.length-1];for(let o=1;o<=t;o++){let n=K(0,t,o);e.push($(r,1,n));}}function Ne(e){let t=[0];return mr(t,e.length-1),t}function ur(e,t){return e.map(r=>r*t)}function Vo(e,t){return e.map(()=>t||Le).splice(0,e.length-1)}function fe({duration:e=300,keyframes:t,times:r,ease:o="easeInOut"}){let n=fr(o)?o.map(it):it(o),s={done:false,value:t[0]},i=ur(r&&r.length===t.length?r:Ne(t),e),a=We(i,t,{ease:Array.isArray(n)?n:Vo(t,n)});return {calculatedDuration:e,next:l=>(s.value=a(l),s.done=l>=e,s)}}var pr=e=>{let t=({timestamp:r})=>e(r);return {start:()=>M.update(t,true),stop:()=>N(t),now:()=>B.isProcessing?B.timestamp:I.now()}};var zo={decay:st,inertia:st,tween:fe,keyframes:fe,spring:ke},ko=e=>e/100,at=class extends Oe{constructor(t){super(t),this.holdTime=null,this.cancelTime=null,this.currentTime=0,this.playbackSpeed=1,this.pendingPlayState="running",this.startTime=null,this.state="idle",this.stop=()=>{if(this.resolver.cancel(),this.isStopped=true,this.state==="idle")return;this.teardown();let{onStop:l}=this.options;l&&l();};let{name:r,motionValue:o,element:n,keyframes:s}=this.options,i=(n==null?void 0:n.KeyframeResolver)||Ce,a=(l,c)=>this.onKeyframesResolved(l,c);this.resolver=new i(s,a,r,o,n),this.resolver.scheduleResolve();}flatten(){super.flatten(),this._resolved&&Object.assign(this._resolved,this.initPlayback(this._resolved.keyframes));}initPlayback(t){let{type:r="keyframes",repeat:o=0,repeatDelay:n=0,repeatType:s,velocity:i=0}=this.options,a=ye(r)?r:zo[r]||fe,l,c;a!==fe&&typeof t[0]!="number"&&(process.env.NODE_ENV!=="production"&&W(t.length===2,`Only two keyframes currently supported with spring and inertia animations. Trying to animate ${t}`),l=oe(ko,Ie(t[0],t[1])),t=[0,100]);let m=a(E(v({},this.options),{keyframes:t}));s==="mirror"&&(c=a(E(v({},this.options),{keyframes:[...t].reverse(),velocity:-i}))),m.calculatedDuration===null&&(m.calculatedDuration=De(m));let{calculatedDuration:f}=m,u=f+n,p=u*(o+1)-n;return {generator:m,mirroredGenerator:c,mapPercentToKeyframes:l,calculatedDuration:f,resolvedDuration:u,totalDuration:p}}onPostResolved(){let{autoplay:t=true}=this.options;this.play(),this.pendingPlayState==="paused"||!t?this.pause():this.state=this.pendingPlayState;}tick(t,r=false){let{resolved:o}=this;if(!o){let{keyframes:h}=this.options;return {done:true,value:h[h.length-1]}}let{finalKeyframe:n,generator:s,mirroredGenerator:i,mapPercentToKeyframes:a,keyframes:l,calculatedDuration:c,totalDuration:m,resolvedDuration:f}=o;if(this.startTime===null)return s.next(0);let{delay:u,repeat:p,repeatType:x,repeatDelay:g,onUpdate:b}=this.options;this.speed>0?this.startTime=Math.min(this.startTime,t):this.speed<0&&(this.startTime=Math.min(t-m/this.speed,this.startTime)),r?this.currentTime=t:this.holdTime!==null?this.currentTime=this.holdTime:this.currentTime=Math.round(t-this.startTime)*this.speed;let y=this.currentTime-u*(this.speed>=0?1:-1),w=this.speed>=0?y<0:y>m;this.currentTime=Math.max(y,0),this.state==="finished"&&this.holdTime===null&&(this.currentTime=m);let O=this.currentTime,D=s;if(p){let h=Math.min(this.currentTime,m)/f,F=Math.floor(h),z=h%1;!z&&h>=1&&(z=1),z===1&&F--,F=Math.min(F,p+1),!!(F%2)&&(x==="reverse"?(z=1-z,g&&(z-=g/f)):x==="mirror"&&(D=i)),O=C(0,1,z)*f;}let d=w?{done:false,value:l[0]}:D.next(O);a&&(d.value=a(d.value));let{done:S}=d;!w&&c!==null&&(S=this.speed>=0?this.currentTime>=m:this.currentTime<=0);let P=this.holdTime===null&&(this.state==="finished"||this.state==="running"&&S);return P&&n!==void 0&&(d.value=Pe(l,this.options,n)),b&&b(d.value),P&&this.finish(),d}get duration(){let{resolved:t}=this;return t?k(t.calculatedDuration):0}get time(){return k(this.currentTime)}set time(t){t=Y(t),this.currentTime=t,this.holdTime!==null||this.speed===0?this.holdTime=t:this.driver&&(this.startTime=this.driver.now()-t/this.speed);}get speed(){return this.playbackSpeed}set speed(t){let r=this.playbackSpeed!==t;this.playbackSpeed=t,r&&(this.time=k(this.currentTime));}play(){if(this.resolver.isScheduled||this.resolver.resume(),!this._resolved){this.pendingPlayState="running";return}if(this.isStopped)return;let{driver:t=pr,onPlay:r,startTime:o}=this.options;this.driver||(this.driver=t(s=>this.tick(s))),r&&r();let n=this.driver.now();this.holdTime!==null?this.startTime=n-this.holdTime:this.startTime?this.state==="finished"&&(this.startTime=n):this.startTime=o!=null?o:this.calcStartTime(),this.state==="finished"&&this.updateFinishedPromise(),this.cancelTime=this.startTime,this.holdTime=null,this.state="running",this.driver.start();}pause(){var t;if(!this._resolved){this.pendingPlayState="paused";return}this.state="paused",this.holdTime=(t=this.currentTime)!==null&&t!==void 0?t:0;}complete(){this.state!=="running"&&this.play(),this.pendingPlayState=this.state="finished",this.holdTime=null;}finish(){this.teardown(),this.state="finished";let{onComplete:t}=this.options;t&&t();}cancel(){this.cancelTime!==null&&this.tick(this.cancelTime),this.teardown(),this.updateFinishedPromise();}teardown(){this.state="idle",this.stopDriver(),this.resolveFinishedPromise(),this.updateFinishedPromise(),this.startTime=this.cancelTime=null,this.resolver.cancel();}stopDriver(){this.driver&&(this.driver.stop(),this.driver=void 0);}sample(t){return this.startTime=0,this.tick(t,true)}};function dr(e){return new at(e)}function hr(e,t,r){var o;if(e instanceof Element)return [e];if(typeof e=="string"){let n=document;let s=(o=void 0)!==null&&o!==void 0?o:n.querySelectorAll(e);return s?Array.from(s):[]}return Array.from(e)}function lt(e,t){let r,o=()=>{let{currentTime:n}=t,i=(n===null?0:n.value)/100;r!==i&&e(i),r=i;};return M.update(o,true),()=>N(o)}var Be=new WeakMap,U;function Lo(e,t){if(t){let{inlineSize:r,blockSize:o}=t[0];return {width:r,height:o}}else return e instanceof SVGElement&&"getBBox"in e?e.getBBox():{width:e.offsetWidth,height:e.offsetHeight}}function Wo({target:e,contentRect:t,borderBoxSize:r}){var o;(o=Be.get(e))===null||o===void 0||o.forEach(n=>{n({target:e,contentSize:t,get size(){return Lo(e,r)}});});}function No(e){e.forEach(Wo);}function Bo(){typeof ResizeObserver!="undefined"&&(U=new ResizeObserver(No));}function gr(e,t){U||Bo();let r=hr(e);return r.forEach(o=>{let n=Be.get(o);n||(n=new Set,Be.set(o,n)),n.add(t),U==null||U.observe(o);}),()=>{r.forEach(o=>{let n=Be.get(o);n==null||n.delete(t),n!=null&&n.size||U==null||U.unobserve(o);});}}var Ke=new Set,ce;function Ko(){ce=()=>{let e={width:window.innerWidth,height:window.innerHeight},t={target:window,size:e,contentSize:e};Ke.forEach(r=>r(t));},window.addEventListener("resize",ce);}function xr(e){return Ke.add(e),ce||Ko(),()=>{Ke.delete(e),!Ke.size&&ce&&(ce=void 0);}}function vr(e,t){return typeof e=="function"?xr(e):gr(e,t)}var _o=50,yr=()=>({current:0,offset:[],progress:0,scrollLength:0,targetOffset:0,targetLength:0,containerLength:0,velocity:0}),Tr=()=>({time:0,x:yr(),y:yr()}),Go={x:{length:"Width",position:"Left"},y:{length:"Height",position:"Top"}};function br(e,t,r,o){let n=r[t],{length:s,position:i}=Go[t],a=n.current,l=r.time;n.current=e[`scroll${i}`],n.scrollLength=e[`scroll${s}`]-e[`client${s}`],n.offset.length=0,n.offset[0]=0,n.offset[1]=n.scrollLength,n.progress=K(0,n.scrollLength,n.current);let c=o-l;n.velocity=c>_o?0:ee(n.current-a,c);}function Sr(e,t,r){br(e,"x",t,r),br(e,"y",t,r),t.time=r;}function wr(e,t){let r={x:0,y:0},o=e;for(;o&&o!==t;)if(o instanceof HTMLElement)r.x+=o.offsetLeft,r.y+=o.offsetTop,o=o.offsetParent;else if(o.tagName==="svg"){let n=o.getBoundingClientRect();o=o.parentElement;let s=o.getBoundingClientRect();r.x+=n.left-s.left,r.y+=n.top-s.top;}else if(o instanceof SVGGraphicsElement){let{x:n,y:s}=o.getBBox();r.x+=n,r.y+=s;let i=null,a=o.parentNode;for(;!i;)a.tagName==="svg"&&(i=a),a=o.parentNode;o=i;}else break;return r}var _e={start:0,center:.5,end:1};function ft(e,t,r=0){let o=0;if(e in _e&&(e=_e[e]),typeof e=="string"){let n=parseFloat(e);e.endsWith("px")?o=n:e.endsWith("%")?e=n/100:e.endsWith("vw")?o=n/100*document.documentElement.clientWidth:e.endsWith("vh")?o=n/100*document.documentElement.clientHeight:e=n;}return typeof e=="number"&&(o=t*e),r+o}var Ho=[0,0];function Er(e,t,r,o){let n=Array.isArray(e)?e:Ho,s=0,i=0;return typeof e=="number"?n=[e,e]:typeof e=="string"&&(e=e.trim(),e.includes(" ")?n=e.split(" "):n=[e,_e[e]?e:"0"]),s=ft(n[0],r,o),i=ft(n[1],t),s-i}var Mr={All:[[0,0],[1,1]]};var $o={x:0,y:0};function Uo(e){return "getBBox"in e&&e.tagName!=="svg"?e.getBBox():{width:e.clientWidth,height:e.clientHeight}}function Ar(e,t,r){let{offset:o=Mr.All}=r,{target:n=e,axis:s="y"}=r,i=s==="y"?"height":"width",a=n!==e?wr(n,e):$o,l=n===e?{width:e.scrollWidth,height:e.scrollHeight}:Uo(n),c={width:e.clientWidth,height:e.clientHeight};t[s].offset.length=0;let m=!t[s].interpolate,f=o.length;for(let u=0;u<f;u++){let p=Er(o[u],c[i],l[i],a[s]);!m&&p!==t[s].interpolatorOffsets[u]&&(m=true),t[s].offset[u]=p;}m&&(t[s].interpolate=We(t[s].offset,Ne(o),{clamp:false}),t[s].interpolatorOffsets=[...t[s].offset]),t[s].progress=C(0,1,t[s].interpolate(t[s].current));}function Xo(e,t=e,r){if(r.x.targetOffset=0,r.y.targetOffset=0,t!==e){let o=t;for(;o&&o!==e;)r.x.targetOffset+=o.offsetLeft,r.y.targetOffset+=o.offsetTop,o=o.offsetParent;}r.x.targetLength=t===e?t.scrollWidth:t.clientWidth,r.y.targetLength=t===e?t.scrollHeight:t.clientHeight,r.x.containerLength=e.clientWidth,r.y.containerLength=e.clientHeight,process.env.NODE_ENV!=="production"&&e&&t&&t!==e&&de(getComputedStyle(e).position!=="static","Please ensure that the container has a non-static position, like 'relative', 'fixed', or 'absolute' to ensure scroll offset is calculated correctly.");}function Cr(e,t,r,o={}){return {measure:()=>Xo(e,o.target,r),update:n=>{Sr(e,r,n),(o.offset||o.target)&&Ar(e,r,o);},notify:()=>t(r)}}var me=new WeakMap,Pr=new WeakMap,ct=new WeakMap,Or=e=>e===document.documentElement?window:e;function Ge(e,o={}){var n=o,{container:t=document.documentElement}=n,r=L(n,["container"]);let s=ct.get(t);s||(s=new Set,ct.set(t,s));let i=Tr(),a=Cr(t,e,i,r);if(s.add(a),!me.has(t)){let c=()=>{for(let x of s)x.measure();},m=()=>{for(let x of s)x.update(B.timestamp);},f=()=>{for(let x of s)x.notify();},u=()=>{M.read(c,false,true),M.read(m,false,true),M.update(f,false,true);};me.set(t,u);let p=Or(t);window.addEventListener("resize",u,{passive:true}),t!==document.documentElement&&Pr.set(t,vr(t,u)),p.addEventListener("scroll",u,{passive:true});}let l=me.get(t);return M.read(l,false,true),()=>{var c;N(l);let m=ct.get(t);if(!m||(m.delete(a),m.size))return;let f=me.get(t);me.delete(t),f&&(Or(t).removeEventListener("scroll",f),(c=Pr.get(t))===null||c===void 0||c(),window.removeEventListener("resize",f));}}function qo({source:e,container:t,axis:r="y"}){e&&(t=e);let o={value:0},n=Ge(s=>{o.value=s[r].progress*100;},{container:t,axis:r});return {currentTime:o,cancel:n}}var mt=new Map;function Dr({source:e,container:t=document.documentElement,axis:r="y"}={}){e&&(t=e),mt.has(t)||mt.set(t,{});let o=mt.get(t);return o[r]||(o[r]=Ft()?new ScrollTimeline({source:t,axis:r}):qo({source:t,axis:r})),o[r]}function Yo(e){return e.length===2}function Fr(e){return e&&(e.target||e.offset)}function jo(e,t){return Yo(e)||Fr(t)?Ge(r=>{e(r[t.axis].progress,r);},t):lt(e,Dr(t))}function Zo(e,t){if(e.flatten(),Fr(t))return e.pause(),Ge(r=>{e.time=e.duration*r[t.axis].progress;},t);{let r=Dr(t);return e.attachTimeline?e.attachTimeline(r,o=>(o.pause(),lt(n=>{o.time=o.duration*n;},r))):A}}function Rr(e,o={}){var n=o,{axis:t="y"}=n,r=L(n,["axis"]);let s=v({axis:t},r);return typeof e=="function"?jo(e,s):Zo(e,s)}function Ir(e,t){R(!!(!t||t.current),`You have defined a ${e} options but the provided ref is not yet hydrated, probably because it's defined higher up the tree. Try calling useScroll() in the same component as the ref, or setting its \`layoutEffect: false\` option.`);}var Qo=()=>({scrollX:q(0),scrollY:q(0),scrollXProgress:q(0),scrollYProgress:q(0)});function ut(n={}){var s=n,{container:e,target:t,layoutEffect:r=true}=s,o=L(s,["container","target","layoutEffect"]);let i=X(Qo);return (r?pe:useEffect)(()=>(Ir("target",t),Ir("container",e),Rr((l,{x:c,y:m})=>{i.scrollX.set(c.current),i.scrollXProgress.set(c.progress),i.scrollY.set(m.current),i.scrollYProgress.set(m.progress);},E(v({},o),{container:(e==null?void 0:e.current)||void 0,target:(t==null?void 0:t.current)||void 0}))),[e,t,JSON.stringify(o.offset)]),i}function Vr(e){let t=X(()=>q(e)),{isStatic:r}=useContext(J);if(r){let[,o]=useState(e);useEffect(()=>t.on("change",o),[]);}return t}function dt(e,t={}){let{isStatic:r}=useContext(J),o=useRef(null),n=X(()=>Xe(e)?e.get():e),s=X(()=>typeof n=="string"?n.replace(/[\d.-]/g,""):void 0),i=Vr(n),a=useRef(n),l=useRef(A),c=()=>{m(),o.current=dr(E(v({keyframes:[kr(i.get()),kr(a.current)],velocity:i.getVelocity(),type:"spring",restDelta:.001,restSpeed:.01},t),{onUpdate:l.current}));},m=()=>{o.current&&o.current.stop();};return useInsertionEffect(()=>i.attach((f,u)=>r?u(f):(a.current=f,l.current=p=>u(zr(p,s)),M.postRender(c),i.get()),m),[JSON.stringify(t)]),pe(()=>{if(Xe(e))return e.on("change",f=>i.set(zr(f,s)))},[i,s]),i}function zr(e,t){return t?e+t:e}function kr(e){return typeof e=="number"?e:parseFloat(e)}function ht(e){let t=useRef(0),{isStatic:r}=useContext(J);useEffect(()=>{if(r)return;let o=({timestamp:n,delta:s})=>{t.current||(t.current=n),e(n-t.current,s);};return M.update(o,true),()=>N(o)},[e]);}var He={featheredOut:"top",strokeStyle:"#fff",strokeWidth:.4,fill:"rgba(0,0,0,0.1)",configs:[{right:[.2,.9,-0.8],left:[.7,.6,.9]},{right:[.2,.9,-0.5],left:[.7,.6,.6]},{right:[.2,.9,-0.2],left:[.7,.6,.3]}],scrollOffset:["start 80%","end 90%"]};function Nr(e,t,r){return [lerp(e[0],t[0],r),lerp(e[1],t[1],r),lerp(e[2],t[2],r)]}function Br(e,t,r){try{return {left:Nr(e.left,t.left,r),right:Nr(e.right,t.right,r)}}catch(o){return console.error(o,e,t,r),e}}function mn(e,t,r=1,o=0,n=0,s,i){let l=t.left[0]*i,c=t.left[1]*s,m=t.left[2]*i,f=s,u=t.right[0]*i,p=t.right[1]*s,x=t.right[2]*i;e.beginPath(),e.moveTo(0,0),e.lineTo(f,0),e.lineTo(f,u),e.bezierCurveTo(f-p,u+x,0+c,l+m,0,l),e.closePath(),e.fill();for(let g=0;g<r;g++){let b=g+1;e.beginPath(),e.moveTo(f,u+n*b),e.bezierCurveTo(f-p,u+x+n*b,0+c,l+m+o*b,0,l+o*b),e.stroke();}}function Kr({waveConfig:e=He}){let t=useRef(null),r=useRef(null),{scrollYProgress:o}=ut({target:t,offset:e.scrollOffset}),n=dt(o,{damping:15,mass:.27,stiffness:55}),[s,i]=useState(1);useEffect(()=>{i(window.devicePixelRatio||1);},[]),useEffect(()=>{let l=()=>{let c=r.current,m=t.current;if(!c||!m)return;let f=m.clientWidth,u=m.clientHeight;c.style.width=`${f}px`,c.style.height=`${u}px`,c.width=f*s,c.height=u*s;};return l(),window.addEventListener("resize",l),()=>window.removeEventListener("resize",l)},[s]);let a=(l,c,m)=>{var u,p,x,g,b;if(!l)return;let f=l.getContext("2d");f&&(f.setTransform(1,0,0,1,0,0),f.clearRect(0,0,l.width,l.height),f.scale(s,s),f.fillStyle=m,f.strokeStyle=(u=e.strokeStyle)!=null?u:He.strokeStyle,f.lineWidth=(p=e.strokeWidth)!=null?p:He.strokeWidth,mn(f,c,(x=e.curveAmount)!=null?x:1,(g=e.offsetLeft)!=null?g:0,(b=e.offsetRight)!=null?b:0,l.width/s,l.height/s));};return ht(()=>{var f;let l=Math.max(0,Math.min(1,n.get())),c=e.configs.length,m=c===1?e.configs[0]:(()=>{if(c===2)return Br(e.configs[0],e.configs[1],l);let u=1/(c-1),p=Math.min(Math.floor(l/u),c-2),x=remap(p*u,(p+1)*u,0,1,l),g=e.configs[p],b=e.configs[p+1];return Br(g,b,x)})();a(r.current,m,(f=e.fill)!=null?f:He.fill);}),jsx("div",{className:"absolute inset-0",ref:t,children:jsx("div",{className:"absolute inset-0",style:{mask:e.featheredOut==="top"?"linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 40%)":e.featheredOut==="bottom"?"linear-gradient(rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0) 100%)":e.featheredOut==="both"?"linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%)":void 0},children:jsx("canvas",{ref:r,className:"size-full"})})})}export{Kr as Wave};//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map