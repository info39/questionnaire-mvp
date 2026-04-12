// ═══════════════════════════════════════════════════════════════════════
// DESERT PULSE — Generative Art Algorithm
// p5.js standalone sketch — include p5.js before this file
// ═══════════════════════════════════════════════════════════════════════

let params = {
  seed: 42195,
  grainCount: 3000,
  windStrength: 1.0,
  rippleDensity: 5,     // 1–12 → internally: value * 0.001
  driftSpeed: 0.4,
  grainSize: 0.9,
};

const BG = [244, 237, 224];

// Desert strata palette: 5 tonal layers
const GRAIN_COLS = [
  [212, 184, 150, 30],   // pale sand
  [184, 152, 112, 25],   // golden sand
  [154, 122, 82,  22],   // ochre / shadow
  [200, 168, 122, 28],   // warm buff
  [232, 216, 188, 38],   // bright sunlit crest
];

let grains = [];
let t = 0;
const MAX_FRAMES = 900;
let running = true;

// ─── Setup ─────────────────────────────────────────────────────────────────

function setup() {
  let canvas = createCanvas(1200, 1200);
  canvas.parent('canvas-container');
  initializeSystem();
  let loadEl = document.querySelector('.loading');
  if (loadEl) loadEl.style.display = 'none';
}

function initializeSystem() {
  randomSeed(params.seed);
  noiseSeed(params.seed);

  // Warm desert ground
  background(BG[0], BG[1], BG[2]);

  // Fine dust texture — simulates the granular surface of compacted sand
  noStroke();
  for (let i = 0; i < 14000; i++) {
    let x = random(width);
    let y = random(height);
    let sz = random(0.3, 1.8);
    fill(
      random(175, 218),
      random(152, 190),
      random(115, 160),
      random(3, 13)
    );
    ellipse(x, y, sz, sz);
  }

  grains = [];
  for (let i = 0; i < params.grainCount; i++) {
    grains.push(new Grain(true));
  }

  t = 0;
  running = true;
  loop();
}

// ─── Flow Field ─────────────────────────────────────────────────────────────

function flowAngle(x, y, time) {
  let scale = params.rippleDensity * 0.001;
  let tScale = params.driftSpeed * 0.001;

  // Large-scale wind band
  let primary   = noise(x * scale * 0.45, y * scale * 0.45, time * tScale) * TWO_PI * 2.0;
  // Medium dune ripples
  let secondary = noise(x * scale * 1.9 + 100, y * scale * 1.9 + 100, time * tScale * 1.6) * PI;

  let angle = primary * 0.62 + secondary * 0.38;

  // Subtle horizontal prevailing bias — desert winds sweep across the land
  let bias = 0.12 + noise(x * scale * 0.28, y * scale * 0.28, time * tScale * 0.5) * 0.72;
  return lerp(angle, bias, 0.22);
}

// ─── Draw Loop ───────────────────────────────────────────────────────────────

function draw() {
  if (!running) return;

  t++;

  // The Pulse — slow sinusoidal breath modulating wind intensity
  let pulse = 0.68 + 0.32 * sin(t * 0.0075);

  for (let g of grains) {
    g.update(pulse);
    g.render();
  }

  if (t >= MAX_FRAMES) {
    running = false;
    noLoop();
  }
}

// ─── Sand Grain ──────────────────────────────────────────────────────────────

class Grain {
  constructor(scattered) {
    this.init(scattered);
  }

  init(scattered) {
    if (scattered || random() < 0.55) {
      this.x = random(width);
      this.y = random(height);
    } else {
      // Spawn from edges — grains blown in from the desert horizon
      let edge = floor(random(4));
      if      (edge === 0) { this.x = random(width);  this.y = -2; }
      else if (edge === 1) { this.x = width + 2;       this.y = random(height); }
      else if (edge === 2) { this.x = random(width);  this.y = height + 2; }
      else                 { this.x = -2;              this.y = random(height); }
    }

    this.px = this.x;
    this.py = this.y;

    this.maxLife = random(55, 240);
    this.life    = scattered ? random(this.maxLife) : 0;
    this.speed   = random(0.45, 2.1) * params.windStrength;

    let ci = floor(random(GRAIN_COLS.length));
    let c  = GRAIN_COLS[ci];
    this.r = c[0];
    this.g = c[1];
    this.b = c[2];
    this.baseAlpha = c[3];

    this.weight = random(0.28, 1.7) * params.grainSize;
  }

  update(pulse) {
    this.px = this.x;
    this.py = this.y;

    let angle = flowAngle(this.x, this.y, t);
    let spd   = this.speed * pulse;

    this.x += cos(angle) * spd;
    this.y += sin(angle) * spd * 0.52; // flatten vertical — horizontal desert sweep

    this.life++;

    if (
      this.life >= this.maxLife ||
      this.x < -6 || this.x > width + 6 ||
      this.y < -6 || this.y > height + 6
    ) {
      this.init(false);
    }
  }

  render() {
    let fade  = sin((this.life / this.maxLife) * PI); // fade in + fade out
    let alpha = this.baseAlpha * fade;

    stroke(this.r, this.g, this.b, alpha);
    strokeWeight(this.weight);
    line(this.px, this.py, this.x, this.y);
  }
}
