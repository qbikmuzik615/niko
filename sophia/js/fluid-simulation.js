export class FluidSimulation {
  constructor(canvas, cfg = {}) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' });
    this.cfg = Object.assign({ startBlank:true, visibleTime:0.985, colorRotationSpeed:0.12, bloom:true, bloomIntensity:0.7, splatRadius:0.18, vorticity:22, swirl:6, rainbow:5 }, cfg);
    this.fallback = !this.gl; this.touches = new Map(); this.hue = 0; this.running = false; this.splats = [];
    this.resize(); this.bind();
    if (this.fallback) this.ctx = canvas.getContext('2d');
  }
  bind(){
    const s=e=>{document.getElementById('splashUi')?.classList.add('hide-copy');for(const t of(e.changedTouches||[e])){const p=this.pos(t),id=t.identifier??'mouse';this.touches.set(id,{x:p.x,y:p.y,px:p.x,py:p.y,down:true,moved:false});}this.pointerActive=true;if(e.cancelable)e.preventDefault();};
    const m=e=>{for(const t of(e.changedTouches||[e])){const id=t.identifier??'mouse',s=this.touches.get(id);if(!s)continue;const p=this.pos(t);s.px=s.x;s.py=s.y;s.x=p.x;s.y=p.y;s.moved=true;}if(e.cancelable)e.preventDefault();};
    const en=e=>{for(const t of(e.changedTouches||[e]))this.touches.delete(t.identifier??'mouse');};
    this.canvas.addEventListener('touchstart',s,{passive:false});this.canvas.addEventListener('touchmove',m,{passive:false});this.canvas.addEventListener('touchend',en);this.canvas.addEventListener('touchcancel',en);
    this.canvas.addEventListener('mousedown',s);this.canvas.addEventListener('mousemove',e=>{if(e.buttons)m(e);});this.canvas.addEventListener('mouseup',en);this.canvas.addEventListener('mouseleave',en);
    window.addEventListener('resize',()=>this.resize());
  }
  pos(t){const r=this.canvas.getBoundingClientRect();return{x:(t.clientX-r.left)/r.width,y:1-(t.clientY-r.top)/r.height};}
  resize(){const dpr=Math.min(window.devicePixelRatio||1,2),w=this.canvas.clientWidth||innerWidth,h=this.canvas.clientHeight||innerHeight;this.w=w;this.h=h;this.canvas.width=Math.max(1,Math.floor(w*dpr));this.canvas.height=Math.max(1,Math.floor(h*dpr));if(this.gl)this.gl.viewport(0,0,this.canvas.width,this.canvas.height);if(this.ctx)this.ctx.setTransform(dpr,0,0,dpr,0,0);}
  setConfig(next){Object.assign(this.cfg,next);}
  addSplat(x,y,dx,dy){const speed=Math.min(1,Math.hypot(dx,dy)*10+0.1);this.hue=(this.hue+this.cfg.colorRotationSpeed*0.01*this.cfg.rainbow)%1;this.splats.push({x,y,r:this.cfg.splatRadius*(0.6+speed),hue:this.hue,life:1,vx:dx,vy:dy});if(this.splats.length>48)this.splats.shift();}
  burst(x,y){for(let i=0;i<6;i++){const a=Math.PI*2*i/6;this.addSplat(x,y,Math.cos(a)*0.04,Math.sin(a)*0.04);}}
  ripple(x,y){this.addSplat(x,y,(Math.random()-.5)*0.02,(Math.random()-.5)*0.02);}
  update(){for(const[,p]of this.touches){const dx=p.x-p.px,dy=p.y-p.py;if(p.down&&(p.moved||!this.cfg.startBlank))this.addSplat(p.x,p.y,dx,dy);}const fade=Math.max(0.001,1-this.cfg.visibleTime);this.splats.forEach(s=>{s.x+=s.vx*0.1*this.cfg.swirl;s.y+=s.vy*0.1*this.cfg.swirl;s.vx*=0.985;s.vy*=0.985;s.life*=(1-fade*0.5);s.r*=1+this.cfg.vorticity*0.0006;});this.splats=this.splats.filter(s=>s.life>0.02);}
  drawGL(ts){const gl=this.gl;if(!this._p){const vs=gl.createShader(gl.VERTEX_SHADER);gl.shaderSource(vs,'#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0.,1.);}');gl.compileShader(vs);const fs=gl.createShader(gl.FRAGMENT_SHADER);gl.shaderSource(fs,`#version 300 es\nprecision highp float;out vec4 o;uniform vec2 r;uniform float t;uniform float bloom;uniform vec4 splats[48];uniform int count;vec3 pal(float h){return .5+.5*cos(6.28318*(vec3(0.,.33,.67)+h));}void main(){vec2 uv=gl_FragCoord.xy/r;vec3 col=vec3(0);for(int i=0;i<48;i++){if(i>=count)break;vec2 p=splats[i].xy;float rad=splats[i].z,hu=splats[i].w,d=distance(uv,p),m=exp(-d*d/(rad*rad)),ring=.5+.5*sin((1.-d*14.+t*1.2)*5.);col+=pal(hu)*m*(.6+ring*.4);}col=1.-exp(-col*(1.4+bloom));o=vec4(col,1);}`);gl.compileShader(fs);const pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.bindAttribLocation(pr,0,'a');gl.linkProgram(pr);this._p=pr;this._buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this._buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);this._u={r:gl.getUniformLocation(pr,'r'),t:gl.getUniformLocation(pr,'t'),b:gl.getUniformLocation(pr,'bloom'),s:gl.getUniformLocation(pr,'splats'),c:gl.getUniformLocation(pr,'count')};}
    gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(this._p);gl.bindBuffer(gl.ARRAY_BUFFER,this._buf);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.uniform2f(this._u.r,this.canvas.width,this.canvas.height);gl.uniform1f(this._u.t,ts*0.001);gl.uniform1f(this._u.b,this.cfg.bloom?this.cfg.bloomIntensity:0);const flat=[];this.splats.slice(0,48).forEach(s=>flat.push(s.x,s.y,s.r*s.life,s.hue));while(flat.length<192)flat.push(0,0,0,0);gl.uniform4fv(this._u.s,new Float32Array(flat));gl.uniform1i(this._u.c,Math.min(48,this.splats.length));gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
  draw2D(){const c=this.ctx;c.fillStyle='#000';c.fillRect(0,0,this.w,this.h);for(const s of this.splats){const x=s.x*this.w,y=(1-s.y)*this.h,r=Math.max(10,s.r*Math.min(this.w,this.h)),g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`hsla(${Math.floor(s.hue*360)},100%,62%,${0.5*s.life})`);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}}
  start(){if(this.running)return;this.running=true;this.last=performance.now();this.loop();}
  stop(){this.running=false;cancelAnimationFrame(this.raf);}
  loop(){if(!this.running)return;const now=performance.now();this.update();if(this.fallback)this.draw2D();else this.drawGL(now);this.raf=requestAnimationFrame(()=>this.loop());}
}
