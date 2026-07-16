import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import zlib from "zlib";

const filePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "cdc",
  "stature-weight-2-20-boys.png",
);

function readPng(filePath) {
  const buf = fs.readFileSync(filePath);
  const W = buf.readUInt32BE(16);
  const H = buf.readUInt32BE(20);
  const bpp = buf[25] === 6 ? 4 : 3;
  let offset = 8;
  let inflated = null;
  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + len);
    if (type === "IDAT") inflated = inflated ? Buffer.concat([inflated, data]) : data;
    offset += 12 + len;
  }
  const raw = zlib.inflateSync(inflated);
  const pixels = Buffer.alloc(W * H * bpp);
  let rawOffset = 0;
  let pxOffset = 0;
  for (let y = 0; y < H; y++) {
    rawOffset++;
    raw.subarray(rawOffset, rawOffset + W * bpp).copy(pixels, pxOffset);
    rawOffset += W * bpp;
    pxOffset += W * bpp;
  }
  return { W, H, bpp, pixels };
}

function rgb(px, W, bpp, x, y) {
  const i = (y * W + x) * bpp;
  return [px[i], px[i + 1], px[i + 2]];
}

const { W, H, bpp, pixels } = readPng(filePath);
const xA = Math.round(W * 0.2);
const xB = Math.round(W * 0.8);

console.log("Row mean luminance every 400 rows:");
for (let y = 0; y < H; y += 400) {
  let sum = 0;
  for (let x = xA; x <= xB; x++) {
    const [r, g, b] = rgb(pixels, W, bpp, x, y);
    sum += r + g + b;
  }
  console.log(`y=${y} (${(y/H).toFixed(3)}) mean=${(sum/(xB-xA+1)).toFixed(1)}`);
}

// histogram of luminance in plot center
const hist = new Array(20).fill(0);
for (let y = Math.round(H*0.2); y < Math.round(H*0.45); y+=3) {
  for (let x = Math.round(W*0.2); x < Math.round(W*0.8); x+=3) {
    const [r,g,b]=rgb(pixels,W,bpp,x,y);
    const bucket = Math.min(19, Math.floor((r+g+b)/765*20));
    hist[bucket]++;
  }
}
console.log("\nLuminance histogram (stature region):");
hist.forEach((c,i)=>console.log(`  ${((i/20)*100).toFixed(0)}-${(((i+1)/20)*100).toFixed(0)}%: ${c}`));

// Find columns where white pixels dominate in stature band
const y0=Math.round(H*0.22), y1=Math.round(H*0.42);
const whiteCol = new Float64Array(W);
for (let x=0;x<W;x++){
  let w=0,n=0;
  for(let y=y0;y<=y1;y+=2){
    const [r,g,b]=rgb(pixels,W,bpp,x,y);
    if(r+g+b>700){w++}; n++;
  }
  whiteCol[x]=w/n;
}
const peaks=[];
for(let x=Math.round(W*0.1); x<Math.round(W*0.9); x++){
  if(whiteCol[x]>0.6 && whiteCol[x-1]<=0.6) peaks.push({x,type:'start',v:whiteCol[x]});
  if(whiteCol[x]>0.6 && whiteCol[x+1]<=0.6) peaks.push({x,type:'end',v:whiteCol[x]});
}
console.log('\nWhite-dominant column transitions in stature band:');
peaks.slice(0,20).forEach(p=>console.log(`  x=${p.x} ${p.type} white=${p.v.toFixed(2)}`));
