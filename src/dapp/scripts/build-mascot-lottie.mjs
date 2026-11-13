// Generates the EXBON CP orangutan mascot as a vector Lottie file.
// Timeline (30fps): 0-120 idle loop, 120-160 hover reaction, 160-220 click reaction.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, "../public/animations/orangutan-mascot.json");

const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
};
const still = (k) => ({ a: 0, k });
const anim = (keys) => ({
  a: 1,
  k: keys.map(([t, s], i) =>
    i < keys.length - 1
      ? { t, s, i: { x: [0.45], y: [1] }, o: { x: [0.55], y: [0] } }
      : { t, s }
  ),
});

const fill = (hex, opacity = 100) => ({ ty: "fl", c: still(rgb(hex)), o: still(opacity), r: 1 });
const stroke = (hex, w) => ({
  ty: "st",
  c: still(rgb(hex)),
  o: still(100),
  w: still(w),
  lc: 2,
  lj: 2,
});
const ellipse = (w, h, x = 0, y = 0) => ({ ty: "el", d: 1, s: still([w, h]), p: still([x, y]) });
const xform = ({ p = [0, 0], r = 0, s = [100, 100], o = 100, rA, sA, oA, pA }) => ({
  ty: "tr",
  a: still([0, 0]),
  p: pA ?? still(p),
  s: sA ?? still(s),
  r: rA ?? still(r),
  o: oA ?? still(o),
  sk: still(0),
  sa: still(0),
});
const group = (name, items, t) => ({ ty: "gr", nm: name, it: [...items, xform(t)] });
const blob = (name, hex, w, h, t = {}, opacity = 100) =>
  group(name, [ellipse(w, h), fill(hex, opacity)], t);
const curve = (name, hex, width, verts, tIn, t = {}) =>
  group(
    name,
    [
      {
        ty: "sh",
        ks: still({
          c: false,
          v: verts,
          i: tIn.map(() => [0, 0]),
          o: tIn.map(() => [0, 0]),
        }),
      },
      stroke(hex, width),
    ],
    t
  );
const smile = (name, hex, width, p, extra = {}) =>
  group(
    name,
    [
      {
        ty: "sh",
        ks: still({
          c: false,
          v: [
            [-16, -2],
            [0, 8],
            [16, -2],
          ],
          i: [
            [0, 0],
            [-8, 0],
            [0, 0],
          ],
          o: [
            [0, 0],
            [8, 0],
            [0, 0],
          ],
        }),
      },
      stroke(hex, width),
    ],
    { p, ...extra }
  );

const layer = (ind, name, shapes, ks = {}) => ({
  ddd: 0,
  ind,
  ty: 4,
  nm: name,
  sr: 1,
  ks: {
    o: still(100),
    r: ks.r ?? still(0),
    p: ks.p ?? still([0, 0, 0]),
    a: ks.a ?? still([0, 0, 0]),
    s: ks.s ?? still([100, 100, 100]),
  },
  ao: 0,
  shapes,
  ip: 0,
  op: 220,
  st: 0,
  bm: 0,
});

const FUR = "#D9692B";
const FUR_DARK = "#B84F1C";
const FUR_LIGHT = "#EC8D4A";
const CREAM = "#F7E0BE";
const CREAM_DEEP = "#F0CFA0";
const INK = "#2A1A12";

// Happy squint during the click reaction, blink once in the idle loop.
const eyeScale = anim([
  [0, [100, 100]],
  [68, [100, 100]],
  [72, [100, 8]],
  [76, [100, 100]],
  [160, [100, 100]],
  [166, [100, 38]],
  [204, [100, 38]],
  [210, [100, 100]],
  [220, [100, 100]],
]);
const eye = (name, x) =>
  group(name, [ellipse(26, 32), fill(INK), ellipse(9, 9, 4, -7), fill("#FFFFFF")], {
    p: [x, 182],
    sA: eyeScale,
  });

const brow = (name, x, flip) =>
  curve(
    name,
    INK,
    6,
    [
      [-14, flip ? -3 : 3],
      [14, flip ? 3 : -3],
    ],
    [[0, 0], [0, 0]],
    {
      pA: anim([
        [0, [x, 148]],
        [120, [x, 148]],
        [130, [x, 143]],
        [150, [x, 143]],
        [160, [x, 148]],
        [220, [x, 148]],
      ]),
    }
  );

// Layers are listed front to back.
const headShapes = [
  eye("eyeL", 165),
  eye("eyeR", 235),
  brow("browL", 165, false),
  brow("browR", 235, true),
  group(
    "mouthOpen",
    [ellipse(34, 24), fill("#7A2E1E"), ellipse(18, 10, 0, 6), fill("#E8837A")],
    {
      p: [200, 240],
      oA: anim([
        [0, [0]],
        [162, [0]],
        [168, [100]],
        [204, [100]],
        [210, [0]],
        [220, [0]],
      ]),
    }
  ),
  smile("mouthSmile", "#7A3B1E", 5, [200, 236], {
    oA: anim([
      [0, [100]],
      [162, [100]],
      [168, [0]],
      [204, [0]],
      [210, [100]],
      [220, [100]],
    ]),
  }),
  blob("nostrilL", "#A8643A", 8, 6, { p: [190, 208] }),
  blob("nostrilR", "#A8643A", 8, 6, { p: [210, 208] }),
  blob("blushL", "#F2A08A", 30, 16, { p: [138, 216] }, 60),
  blob("blushR", "#F2A08A", 30, 16, { p: [262, 216] }, 60),
  blob("muzzle", CREAM_DEEP, 96, 64, { p: [200, 224] }),
  blob("faceTop", CREAM, 150, 90, { p: [200, 160] }),
  blob("face", CREAM, 176, 150, { p: [200, 198] }),
  blob("hairTuft", FUR_LIGHT, 120, 56, { p: [196, 86] }, 90),
  blob("hair", FUR, 236, 206, { p: [200, 172] }),
  blob("earInnerL", CREAM_DEEP, 24, 28, { p: [96, 188] }),
  blob("earInnerR", CREAM_DEEP, 24, 28, { p: [304, 188] }),
  blob("earL", FUR_DARK, 46, 52, { p: [94, 188] }),
  blob("earR", FUR_DARK, 46, 52, { p: [306, 188] }),
];

const head = layer(1, "head", headShapes, {
  a: still([200, 250, 0]),
  p: anim([
    [0, [200, 250, 0]],
    [60, [200, 253, 0]],
    [120, [200, 250, 0]],
    [160, [200, 250, 0]],
    [220, [200, 250, 0]],
  ]),
  r: anim([
    [0, [0]],
    [30, [1.6]],
    [90, [-1.6]],
    [120, [0]],
    [140, [-8]],
    [160, [0]],
    [175, [4]],
    [200, [-3]],
    [220, [0]],
  ]),
});

const armRight = layer(
  2,
  "armRight",
  [
    group("hand", [ellipse(44, 44), fill(FUR_DARK)], { p: [0, 108] }),
    group("armR", [ellipse(50, 120), fill(FUR)], { p: [0, 54] }),
  ],
  {
    a: still([0, 0, 0]),
    p: still([292, 292, 0]),
    r: anim([
      [0, [0]],
      [160, [0]],
      [172, [-140]],
      [182, [-112]],
      [192, [-140]],
      [202, [-112]],
      [220, [0]],
    ]),
  }
);

const body = layer(
  3,
  "body",
  [
    group("armL", [ellipse(50, 120), fill(FUR_DARK)], {
      p: [108, 345],
      r: 8,
    }),
    blob("belly", FUR_LIGHT, 130, 110, { p: [200, 372] }),
    blob("torso", FUR, 236, 190, { p: [200, 362] }),
    blob("shoulders", FUR, 200, 90, { p: [200, 300] }),
  ],
  {
    a: still([200, 400, 0]),
    p: still([200, 400, 0]),
    s: anim([
      [0, [100, 100, 100]],
      [60, [100, 102.5, 100]],
      [120, [100, 100, 100]],
      [220, [100, 100, 100]],
    ]),
  }
);

const leaves = layer(4, "leaves", [
  blob("leafA", "#2E6B3F", 130, 52, { p: [62, 330], r: -38 }),
  blob("leafB", "#8FCB97", 112, 44, { p: [48, 262], r: -64 }),
  blob("leafC", "#BFE3C0", 96, 38, { p: [86, 372], r: -12 }),
  blob("leafD", "#2E6B3F", 130, 52, { p: [338, 330], r: 38 }),
  blob("leafE", "#8FCB97", 112, 44, { p: [352, 262], r: 64 }),
  blob("leafF", "#BFE3C0", 96, 38, { p: [314, 372], r: 12 }),
]);

const lottie = {
  v: "5.7.0",
  fr: 30,
  ip: 0,
  op: 220,
  w: 400,
  h: 400,
  nm: "EXBON CP Orangutan Mascot",
  ddd: 0,
  assets: [],
  layers: [head, armRight, body, leaves],
  markers: [
    { tm: 0, cm: "idle", dr: 120 },
    { tm: 120, cm: "hover", dr: 40 },
    { tm: 160, cm: "click", dr: 60 },
  ],
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(lottie));
console.log("Wrote", OUT);

