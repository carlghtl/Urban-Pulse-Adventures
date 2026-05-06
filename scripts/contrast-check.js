const fs = require('fs');
const path = require('path');

function parseVars(css){
  const vars = {};
  const root = css.match(/:root\s*\{([\s\S]*?)\}/);
  if(root){
    const body = root[1];
    body.split(';').forEach(line => {
      const m = line.match(/--([\w-]+)\s*:\s*([^;\n]+)/);
      if(m) vars[m[1].trim()] = m[2].trim();
    });
  }
  // dark theme
  const dark = css.match(/\[data-theme="dark"\]\s*\{([\s\S]*?)\}/);
  const darkvars = {};
  if(dark){
    dark[1].split(';').forEach(line => {
      const m = line.match(/--([\w-]+)\s*:\s*([^;\n]+)/);
      if(m) darkvars[m[1].trim()] = m[2].trim();
    });
  }
  return {vars, darkvars};
}

function hexToRgb(hex){
  hex = hex.replace(/\s/g,'');
  if(hex.startsWith('rgba')){
    const m = hex.match(/rgba\((\d+),(\d+),(\d+),([\d\.]+)\)/);
    if(m) return {r:+m[1], g:+m[2], b:+m[3], a:+m[4]};
  }
  if(hex.startsWith('rgb')){
    const m = hex.match(/rgb\((\d+),(\d+),(\d+)\)/);
    if(m) return {r:+m[1], g:+m[2], b:+m[3], a:1};
  }
  const m = hex.replace(/rgba?\(|\)/g,'').split(',');
  if(m.length>=3){ return {r:+m[0], g:+m[1], b:+m[2], a: m[3]?+m[3]:1}; }
  if(hex[0]==='#'){
    let v = hex.substring(1);
    if(v.length===3) v = v.split('').map(ch=>ch+ch).join('');
    const num = parseInt(v,16);
    return {r:(num>>16)&255,g:(num>>8)&255,b:num&255,a:1};
  }
  return null;
}

function lum(rgb){
  function chan(c){
    c = c/255;
    return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4);
  }
  return 0.2126*chan(rgb.r)+0.7152*chan(rgb.g)+0.0722*chan(rgb.b);
}

function contrast(hexA, hexB){
  const A = hexToRgb(hexA);
  const B = hexToRgb(hexB);
  if(!A || !B) return null;
  const L1 = lum(A);
  const L2 = lum(B);
  const hi = Math.max(L1,L2); const lo = Math.min(L1,L2);
  return (hi+0.05)/(lo+0.05);
}

const css = fs.readFileSync(path.join(__dirname,'..','styles','static.css'),'utf8');
const {vars,darkvars} = parseVars(css);

function pick(key){
  return (vars[key]||'').replace(/\s*;?$/,'');
}
function pickDark(key){
  return (darkvars[key]||vars[key]||'').replace(/\s*;?$/,'');
}

const checks = [
  {name:'page text vs bg', light:[ 'bg','muted'], dark:['bg','muted']},
  {name:'accent vs bg', light:['accent','bg'], dark:['accent','bg']},
  {name:'accent-2 vs bg', light:['accent-2','bg'], dark:['accent-2','bg']},
  {name:'card bg vs text', light:['card','muted'], dark:['card','muted']},
];

console.log('\nAccessibility contrast report (WCAG ratio):\n');
checks.forEach(c => {
  const la = pick(c.light[0]);
  const lb = pick(c.light[1]);
  const da = pickDark(c.dark[0]);
  const db = pickDark(c.dark[1]);
  const rLight = contrast(la,lb);
  const rDark = contrast(da,db);
  function fmt(v){ if(!v) return 'n/a'; return v.toFixed(2);} 
  console.log(`- ${c.name}: light=${fmt(rLight)}  dark=${fmt(rDark)}`);
});

console.log('\nInterpretation: 4.5+ = AA for normal text, 7+ = AAA.');
