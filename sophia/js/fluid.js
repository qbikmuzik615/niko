'use strict';
/* Real WebGL2 Navier-Stokes fluid simulation */
(function(){

const VERT = `#version 300 es
precision highp float;
in vec2 aPos;
out vec2 vUv;
out vec2 vL;out vec2 vR;out vec2 vT;out vec2 vB;
uniform vec2 tSz;
void main(){
  vUv=aPos*.5+.5;
  vL=vUv-vec2(tSz.x,0.);vR=vUv+vec2(tSz.x,0.);
  vT=vUv+vec2(0.,tSz.y);vB=vUv-vec2(0.,tSz.y);
  gl_Position=vec4(aPos,0.,1.);
}`;

const DISPLAY_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTex;
uniform float uIntensity;
out vec4 col;
void main(){
  vec3 c=texture(uTex,vUv).rgb*uIntensity;
  float lum=dot(c,vec3(.299,.587,.114));
  col=vec4(c,clamp(lum*2.,0.,1.));
}`;

const SPLAT_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTarget;
uniform float ar;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
out vec4 col;
void main(){
  vec2 p=vUv-point;p.x*=ar;
  vec3 s=exp(-dot(p,p)/(radius*radius))*color;
  col=vec4(texture(uTarget,vUv).rgb+s,1.);
}`;

const ADVECT_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uVel;
uniform sampler2D uSrc;
uniform vec2 vSz;uniform vec2 sSz;
uniform float dt;uniform float dissipation;
out vec4 col;
void main(){
  vec2 coord=vUv-dt*texture(uVel,vUv).xy*vSz;
  vec2 st=coord/sSz-.5;
  vec2 iuv=floor(st);vec2 fuv=fract(st);
  vec4 a=texture(uSrc,(iuv+vec2(.5,.5))*sSz);
  vec4 b=texture(uSrc,(iuv+vec2(1.5,.5))*sSz);
  vec4 c2=texture(uSrc,(iuv+vec2(.5,1.5))*sSz);
  vec4 d=texture(uSrc,(iuv+vec2(1.5,1.5))*sSz);
  vec4 r=mix(mix(a,b,fuv.x),mix(c2,d,fuv.x),fuv.y);
  col=r/(1.+dissipation*dt);
}`;

const DIV_FRAG = `#version 300 es
precision mediump float;
in vec2 vL;in vec2 vR;in vec2 vT;in vec2 vB;
uniform sampler2D uVel;
out vec4 col;
void main(){
  float L=texture(uVel,vL).x,R=texture(uVel,vR).x;
  float T=texture(uVel,vT).y,B=texture(uVel,vB).y;
  col=vec4(.5*(R-L+T-B),0.,0.,1.);
}`;

const CURL_FRAG = `#version 300 es
precision mediump float;
in vec2 vL;in vec2 vR;in vec2 vT;in vec2 vB;
uniform sampler2D uVel;
out vec4 col;
void main(){
  float L=texture(uVel,vL).y,R=texture(uVel,vR).y;
  float T=texture(uVel,vT).x,B=texture(uVel,vB).x;
  col=vec4(.5*(R-L-T+B),0.,0.,1.);
}`;

const VORT_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;in vec2 vL;in vec2 vR;in vec2 vT;in vec2 vB;
uniform sampler2D uVel;uniform sampler2D uCurl;
uniform float curl;uniform float dt;
out vec4 col;
void main(){
  float L=texture(uCurl,vL).x,R=texture(uCurl,vR).x;
  float T=texture(uCurl,vT).x,B=texture(uCurl,vB).x;
  float C=texture(uCurl,vUv).x;
  vec2 f=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));
  f/=length(f)+1e-5;
  f*=curl*C;f.y*=-1.;
  vec2 v=texture(uVel,vUv).xy+f*dt;
  col=vec4(clamp(v,-1e3,1e3),0.,1.);
}`;

const PRESSURE_FRAG = `#version 300 es
precision mediump float;
in vec2 vUv;in vec2 vL;in vec2 vR;in vec2 vT;in vec2 vB;
uniform sampler2D uPressure;uniform sampler2D uDiv;
out vec4 col;
void main(){
  float L=texture(uPressure,vL).x,R=texture(uPressure,vR).x;
  float T=texture(uPressure,vT).x,B=texture(uPressure,vB).x;
  float div=texture(uDiv,vUv).x;
  col=vec4((L+R+T+B-div)*.25,0.,0.,1.);
}`;

const GRAD_FRAG = `#version 300 es
precision mediump float;
in vec2 vUv;in vec2 vL;in vec2 vR;in vec2 vT;in vec2 vB;
uniform sampler2D uPressure;uniform sampler2D uVel;
out vec4 col;
void main(){
  float L=texture(uPressure,vL).x,R=texture(uPressure,vR).x;
  float T=texture(uPressure,vT).x,B=texture(uPressure,vB).x;
  vec2 v=texture(uVel,vUv).xy-vec2(R-L,T-B);
  col=vec4(v,0.,1.);
}`;

function createShader(gl,type,src){
  const s=gl.createShader(type);
  gl.shaderSource(s,src);gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(s));
  return s;
}
function createProgram(gl,vert,frag){
  const p=gl.createProgram();
  gl.attachShader(p,createShader(gl,gl.VERTEX_SHADER,vert));
  gl.attachShader(p,createShader(gl,gl.FRAGMENT_SHADER,frag));
  gl.linkProgram(p);
  const locs={};
  const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);
  for(let i=0;i<n;i++){const u=gl.getActiveUniform(p,i);locs[u.name]=gl.getUniformLocation(p,u.name);}
  return{prog:p,u:locs};
}
function createDoubleFBO(gl,w,h,internalFormat,format,type,filter){
  function makeFBO(){
    const tex=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,filter);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,filter);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,internalFormat,w,h,0,format,type,null);
    const fb=gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
    return{tex,fb,w,h};
  }
  let r=makeFBO(),w2=makeFBO();
  return{
    get read(){return r},
    get write(){return w2},
    swap(){[r,w2]=[w2,r];}
  };
}

class Fluid{
  constructor(canvas){
    this.canvas=canvas;
    this.pointers=[];
    this._hues=[];
    this._lastTime=0;

    const params={alpha:true,depth:false,stencil:false,antialias:false,preserveDrawingBuffer:false};
    const gl=canvas.getContext('webgl2',params);
    if(!gl){console.warn('WebGL2 not available');return;}
    this.gl=gl;

    gl.getExtension('EXT_color_buffer_float');
    const linExt=gl.getExtension('OES_texture_float_linear');
    const filter=linExt?gl.LINEAR:gl.NEAREST;

    this.SIM_RES=128;
    this.DYE_RES=512;
    this.PRESSURE_ITER=25;
    this.CURL=28;
    this.SPLAT_R=0.22;
    this.VEL_DISS=0.15;
    this.DYE_DISS=0.9;

    this._programs={
      display:createProgram(gl,VERT,DISPLAY_FRAG),
      splat:createProgram(gl,VERT,SPLAT_FRAG),
      advect:createProgram(gl,VERT,ADVECT_FRAG),
      div:createProgram(gl,VERT,DIV_FRAG),
      curl:createProgram(gl,VERT,CURL_FRAG),
      vort:createProgram(gl,VERT,VORT_FRAG),
      pressure:createProgram(gl,VERT,PRESSURE_FRAG),
      grad:createProgram(gl,VERT,GRAD_FRAG),
    };

    const vBuf=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vBuf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    this._vao=gl.createVertexArray();
    gl.bindVertexArray(this._vao);
    Object.values(this._programs).forEach(p=>{
      const loc=gl.getAttribLocation(p.prog,'aPos');
      if(loc>=0){gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);}
    });

    this._resize();
    this._setupEvents();
    this._scheduleRandomSplats();
    requestAnimationFrame(t=>this._loop(t));
  }

  _resize(){
    const gl=this.gl,c=this.canvas;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    c.width=Math.floor(c.clientWidth*dpr);
    c.height=Math.floor(c.clientHeight*dpr);
    const S=this.SIM_RES,D=this.DYE_RES;
    const fmt=gl.RGBA16F,base=gl.RGBA,hf=gl.HALF_FLOAT;
    this.vel=createDoubleFBO(gl,S,S,fmt,base,hf,gl.LINEAR);
    this.dye=createDoubleFBO(gl,D,D,fmt,base,hf,gl.LINEAR);
    this.pressure=createDoubleFBO(gl,S,S,fmt,base,hf,gl.NEAREST);
    this.div=createDoubleFBO(gl,S,S,fmt,base,hf,gl.NEAREST);
    this.curl=createDoubleFBO(gl,S,S,fmt,base,hf,gl.NEAREST);
    this._initialSplats();
  }

  _initialSplats(){
    for(let i=0;i<6;i++) this._addSplat(Math.random(),Math.random(),
      (Math.random()-.5)*800,(Math.random()-.5)*800,this._randColor());
  }

  _scheduleRandomSplats(){
    const go=()=>{
      if(!this._paused){
        const n=Math.ceil(Math.random()*2);
        for(let i=0;i<n;i++) this._addSplat(Math.random(),Math.random(),
          (Math.random()-.5)*400,(Math.random()-.5)*400,this._randColor());
      }
      setTimeout(go,2000+Math.random()*4000);
    };
    setTimeout(go,3000);
  }

  _randColor(){
    const h=Math.random();
    const s=.9,v=.95;
    const i=Math.floor(h*6),f=h*6-i,p=v*(1-s),q=v*(1-f*s),t=v*(1-(1-f)*s);
    const m=[[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]][i%6];
    return{r:m[0]*0.2,g:m[1]*0.2,b:m[2]*0.2};
  }

  _addSplat(x,y,vx,vy,col){
    const gl=this.gl,{splat}=this._programs;
    const ar=this.canvas.width/this.canvas.height;
    gl.useProgram(splat.prog);
    gl.uniform1i(splat.u.uTarget,0);
    gl.uniform1f(splat.u.ar,ar);
    gl.uniform2f(splat.u.point,x,y);
    gl.uniform1f(splat.u.radius,this.SPLAT_R/100);
    gl.uniform3f(splat.u.color,vx/1e4,vy/1e4,0);
    this._blit(this.vel.write.fb,this.SIM_RES,this.SIM_RES,this.vel.read.tex);
    this.vel.swap();
    gl.uniform3f(splat.u.color,col.r,col.g,col.b);
    gl.uniform1f(splat.u.radius,this.SPLAT_R/100);
    this._blit(this.dye.write.fb,this.DYE_RES,this.DYE_RES,this.dye.read.tex);
    this.dye.swap();
  }

  _blit(fb,w,h,tex0,tex1){
    const gl=this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
    gl.viewport(0,0,w,h);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex0);
    if(tex1){gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,tex1);}
    gl.bindVertexArray(this._vao);
    gl.drawArrays(gl.TRIANGLES,0,3);
  }

  _loop(now){
    if(!this.gl){return;}
    const dt=Math.min((now-this._lastTime)/1000,.016);
    this._lastTime=now;

    this.pointers.forEach(p=>{
      if(p.moved){
        this._addSplat(p.x,p.y,p.dx*5,p.dy*5,p.col);
        p.moved=false;
      }
    });

    const gl=this.gl,p=this._programs;
    const S=this.SIM_RES,D=this.DYE_RES;
    const svSz=[1/S,1/S],dvSz=[1/D,1/D];

    // Curl
    gl.useProgram(p.curl.prog);
    gl.uniform2fv(p.curl.u.tSz,svSz);
    gl.uniform1i(p.curl.u.uVel,0);
    this._blit(this.curl.write.fb,S,S,this.vel.read.tex);
    this.curl.swap();

    // Vorticity
    gl.useProgram(p.vort.prog);
    gl.uniform2fv(p.vort.u.tSz,svSz);
    gl.uniform1i(p.vort.u.uVel,0);gl.uniform1i(p.vort.u.uCurl,1);
    gl.uniform1f(p.vort.u.curl,this.CURL);gl.uniform1f(p.vort.u.dt,dt);
    this._blit(this.vel.write.fb,S,S,this.vel.read.tex,this.curl.read.tex);
    this.vel.swap();

    // Divergence
    gl.useProgram(p.div.prog);
    gl.uniform2fv(p.div.u.tSz,svSz);gl.uniform1i(p.div.u.uVel,0);
    this._blit(this.div.write.fb,S,S,this.vel.read.tex);
    this.div.swap();

    // Clear pressure
    gl.bindFramebuffer(gl.FRAMEBUFFER,this.pressure.write.fb);
    gl.viewport(0,0,S,S);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    this.pressure.swap();

    // Pressure solve
    gl.useProgram(p.pressure.prog);
    gl.uniform2fv(p.pressure.u.tSz,svSz);
    gl.uniform1i(p.pressure.u.uPressure,0);gl.uniform1i(p.pressure.u.uDiv,1);
    for(let i=0;i<this.PRESSURE_ITER;i++){
      this._blit(this.pressure.write.fb,S,S,this.pressure.read.tex,this.div.read.tex);
      this.pressure.swap();
    }

    // Gradient subtract
    gl.useProgram(p.grad.prog);
    gl.uniform2fv(p.grad.u.tSz,svSz);
    gl.uniform1i(p.grad.u.uPressure,0);gl.uniform1i(p.grad.u.uVel,1);
    this._blit(this.vel.write.fb,S,S,this.pressure.read.tex,this.vel.read.tex);
    this.vel.swap();

    // Advect velocity
    gl.useProgram(p.advect.prog);
    gl.uniform2fv(p.advect.u.tSz,svSz);gl.uniform2fv(p.advect.u.vSz,svSz);gl.uniform2fv(p.advect.u.sSz,svSz);
    gl.uniform1i(p.advect.u.uVel,0);gl.uniform1i(p.advect.u.uSrc,1);
    gl.uniform1f(p.advect.u.dt,dt);gl.uniform1f(p.advect.u.dissipation,this.VEL_DISS);
    this._blit(this.vel.write.fb,S,S,this.vel.read.tex,this.vel.read.tex);
    this.vel.swap();

    // Advect dye
    gl.uniform2fv(p.advect.u.tSz,svSz);gl.uniform2fv(p.advect.u.vSz,svSz);gl.uniform2fv(p.advect.u.sSz,dvSz);
    gl.uniform1f(p.advect.u.dissipation,this.DYE_DISS);
    this._blit(this.dye.write.fb,D,D,this.vel.read.tex,this.dye.read.tex);
    this.dye.swap();

    // Display
    gl.useProgram(p.display.prog);
    gl.uniform1i(p.display.u.uTex,0);
    gl.uniform1f(p.display.u.uIntensity,1.8);
    gl.uniform2fv(p.display.u.tSz,[1/this.canvas.width,1/this.canvas.height]);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    gl.viewport(0,0,this.canvas.width,this.canvas.height);
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.dye.read.tex);
    gl.bindVertexArray(this._vao);gl.drawArrays(gl.TRIANGLES,0,3);
    gl.disable(gl.BLEND);

    requestAnimationFrame(t=>this._loop(t));
  }

  _setupEvents(){
    const c=this.canvas;
    const getColor=()=>this._randColor();

    const addPtr=(id,x,y)=>{
      const r=c.getBoundingClientRect();
      const px=(x-r.left)/r.width,py=1-(y-r.top)/r.height;
      const ptr={id,x:px,y:py,px:px,py:py,dx:0,dy:0,col:getColor(),moved:false};
      this.pointers.push(ptr);return ptr;
    };
    const movePtr=(id,x,y)=>{
      const r=c.getBoundingClientRect();
      const px=(x-r.left)/r.width,py=1-(y-r.top)/r.height;
      const ptr=this.pointers.find(p=>p.id===id);
      if(!ptr)return;
      ptr.dx=(px-ptr.x)*8;ptr.dy=(py-ptr.y)*8;
      ptr.x=px;ptr.y=py;ptr.moved=true;
    };
    const removePtr=(id)=>{this.pointers=this.pointers.filter(p=>p.id!==id);};

    c.addEventListener('touchstart',e=>{
      [...e.changedTouches].forEach(t=>addPtr(t.identifier,t.clientX,t.clientY));
    },{passive:true});
    c.addEventListener('touchmove',e=>{
      [...e.changedTouches].forEach(t=>movePtr(t.identifier,t.clientX,t.clientY));
    },{passive:true});
    c.addEventListener('touchend',e=>{
      [...e.changedTouches].forEach(t=>removePtr(t.identifier));
    },{passive:true});
    c.addEventListener('mousedown',e=>addPtr(-1,e.clientX,e.clientY));
    c.addEventListener('mousemove',e=>{if(e.buttons)movePtr(-1,e.clientX,e.clientY);});
    c.addEventListener('mouseup',()=>removePtr(-1));

    window.addEventListener('resize',()=>this._resize());
  }

  splat(x,y,vx,vy){this._addSplat(x,y,vx*500,vy*500,this._randColor());}
  burst(x,y){
    const n=6;
    for(let i=0;i<n;i++){
      const a=Math.PI*2*i/n;
      this._addSplat(x,y,Math.cos(a)*600,Math.sin(a)*600,this._randColor());
    }
  }
}

window.Fluid=Fluid;
})();
