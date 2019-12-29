const karelfrag = `
#ifdef GL_ES
precision mediump float;
#endif
// A shader for rendering Karel the Robot.
// cobbled together by ninjapretzel
// Was this renderer here before hooking it up to the running environment

// Fancy mode for pretty grafix
// #define FANCYMODE

// some constants
#define PI 3.14159265359
#define DEG2RAD (PI / 180.0)
#define RAD2DEG (180.0 / PI)

// glslsandbox uniforms
uniform float time;
uniform vec2 resolution;
uniform vec2 scroll;
uniform float zoom;

// Intended to take data from the Karel application.
#define MAX_WALLS 512
#define MAX_BOTS 4
#define MAX_BEEPERS 256
uniform vec4 walls[MAX_WALLS];		// walls are 	(x1,y1, x2,y2)
uniform vec4 bots[MAX_BOTS];		// bots are 	(x,y, angle, unused)
uniform vec4 beepers[MAX_BEEPERS];	// Beepers are 	(x,y, count, unused)
uniform float numWalls;
uniform vec4 focWall;
uniform float numBots;
uniform float focBot;
uniform float numBeepers;
uniform float focBeeper;

uniform vec2 highlightCell;


// Uniforms vars for noise
uniform float seed;
uniform float scale;
uniform float persistence;

////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
// util stuff

// ...
#define lerp mix

// Distance from point p to line segment a,b
float dist(vec2 p, vec2 a, vec2 b) {
	vec2 n = b - a;
	vec2 pa = a - p;
	
	float c = dot(n, pa);
	if (c > 0.0) { return dot(pa, pa); }
	
	vec2 bp = p-b;
	if (dot(n, bp) > 0.0) { return dot(bp, bp); }
	
	vec2 e = pa - n * (c / dot(n,n));
	return dot(e,e);
}
// distance from point p to triangle polygon a->b->c-a
float distTriangle(vec2 pos, vec2 a, vec2 b, vec2 c) {
	return min(min(dist(pos, a, b), dist(pos, b, c)), dist(pos, c, a));
}
// Distance from a point to a box centered at the origin with given bounds size
float distBox(vec2 point, vec2 bounds) {
	vec2 q = abs(point) - bounds;
	return length(max(q,0.0)) + min(max(q.x, q.y), 0.0);
}

//Maps a value from one range to a new range
float map(float val, float olda, float oldb, float newa, float newb) {
	float oldRange = olda-oldb;
	float newRange = newa-newb;
	float p = (val - olda) / oldRange;
	return newa + (newRange * p);
}
//Curves 
//Output peak (1) in the middle (.5)
//Outputs nothing (0) at the edges (0, 1)
float curvesMid(float val) {
	val = clamp(val, 0.0, 1.0);
	if (val < .5) {
		val = map(val, 0.0, .5, .0, 1.);	
	} else {
		val = map(val, .5, 1., 1., 0.);	
	}
	return val;
}
//Levels adjustment. Performs a clamp on the first range, and then a map.
float levels(float val, float a, float b, float c, float d) {
	val = clamp(val, a, b);
	return map(val, a,b,c,d);
}
float mlength(vec2 v) { vec2 a = abs(v); return max(a.x, a.y); }
float mlength(vec3 v) { vec3 a = abs(v); return max(max(a.x, a.y), a.z); }
float mlength(vec4 v) { vec4 a = abs(v); return max(max(max(a.x, a.y), a.z), a.w); }

// Alphablend colors
vec3 blend(vec4 col, vec4 rgba) { return lerp(col.rgb * col.a, rgba.rgb, rgba.a); }

// From https://github.com/hughsk/glsl-hsv2rgb/blob/master/index.glsl
vec3 hsv2rgb(vec3 c) {
	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
// 16-Seg adaptation floating around glslsandbox eg http://glslsandbox.com/e#59933.0
 
#define REPEAT_SIGN true
 
/* Some modifications to 16 segment display.
Segment bit positions:
  __2__ __1__    
 |\    |    /|   15 12 11 8 7  4 3  0 
 | \   |   / |    |  | |  | |  | |  |
 3  11 10 9  0    0000 0000 0000 0000
 |   \ | /   |   
 |    \|/    |  example: letter A
  _12__ __8__ 
 |           |    12    8 7  4 3210
 |    /|\    |     |    | |  | ||||
 4   / | \   7  0001 0001 1001 1111
 | 13 14  15 |
 | /   |   \ |  binary to hex -> 0x119F
  __5__|__6__  */
 
#define n0 0x22FF 
#define n1 0x0281
#define n2 0x1177
#define n3 0x11E7
#define n4 0x5508
#define n5 0x11EE
#define n6 0x11FE
#define n7 0x2206
#define n8 0x11FF
#define n9 0x11EF
 
#define A 0x119F
#define B 0x927E
#define C 0x007E
#define D 0x44E7
#define E 0x107E
#define F 0x101E
#define G 0x807E
#define H 0x1199
#define I 0x4466
#define J 0x4436
#define K 0x9218
#define L 0x0078
#define M 0x0A99
#define N 0x8899
#define O 0x00FF
#define P 0x111F
#define Q 0x80FF
#define R 0x911F
#define S 0x8866
#define T 0x4406
#define U 0x00F9
#define V 0x2218
#define W 0xA099
#define X 0xAA00
#define Y 0x4A00
#define Z 0x2266
#define _ /*ch_pos.x += ch_space.x;*/
#define SS /*ch_pos.x += ch_space.x*0.5;*/
#define s_dot     0
#define s_minus   0x1100
#define s_plus    0x5500
#define s_greater 0x2800
#define s_less    0x8200
#define s_sqrt    0x0C02
//#define nl1 ch_pos = ch_start;  ch_pos.y -= 3.0;
//#define nl2 ch_pos = ch_start;  ch_pos.y -= 6.0;
//#define nl3 ch_pos = ch_start;	ch_pos.y -= 9.0;
float dseg(vec2 pos, vec2 p0, vec2 p1) {
	vec2 dir = normalize(p1 - p0);
	vec2 cp = (pos - p0) * mat2(dir.x, dir.y,-dir.y, dir.x);
	return distance(cp, clamp(cp, vec2(0), vec2(distance(p0, p1), 0)));   
}
 
bool bit(int n, int b) {
	return mod(floor(float(n) / exp2(floor(float(b)))), 2.0) != 0.0;
}
float ddigit(vec2 pos, int n) {
	float v = 1e6;
	if (n == 0)     { v = min(v, dist(pos, vec2(-0.505, -1.000), vec2(-0.500, -1.000))); }
	if (bit(n,  0)) { v = min(v, dist(pos, vec2( 0.500,  0.063), vec2( 0.500,  0.937))); }
	if (bit(n,  1)) { v = min(v, dist(pos, vec2( 0.438,  1.000), vec2( 0.063,  1.000))); }
	if (bit(n,  2)) { v = min(v, dist(pos, vec2(-0.063,  1.000), vec2(-0.438,  1.000))); }
	if (bit(n,  3)) { v = min(v, dist(pos, vec2(-0.500,  0.937), vec2(-0.500,  0.062))); }
	if (bit(n,  4)) { v = min(v, dist(pos, vec2(-0.500, -0.063), vec2(-0.500, -0.938))); }
	if (bit(n,  5)) { v = min(v, dist(pos, vec2(-0.438, -1.000), vec2(-0.063, -1.000))); }
	if (bit(n,  6)) { v = min(v, dist(pos, vec2( 0.063, -1.000), vec2( 0.438, -1.000))); }
	if (bit(n,  7)) { v = min(v, dist(pos, vec2( 0.500, -0.938), vec2( 0.500, -0.063))); }
	if (bit(n,  8)) { v = min(v, dist(pos, vec2( 0.063,  0.000), vec2( 0.438, -0.000))); }
	if (bit(n,  9)) { v = min(v, dist(pos, vec2( 0.063,  0.063), vec2( 0.438,  0.938))); }
	if (bit(n, 10)) { v = min(v, dist(pos, vec2( 0.000,  0.063), vec2( 0.000,  0.937))); }
	if (bit(n, 11)) { v = min(v, dist(pos, vec2(-0.063,  0.063), vec2(-0.438,  0.938))); }
	if (bit(n, 12)) { v = min(v, dist(pos, vec2(-0.438,  0.000), vec2(-0.063, -0.000))); }
	if (bit(n, 13)) { v = min(v, dist(pos, vec2(-0.063, -0.063), vec2(-0.438, -0.938))); }
	if (bit(n, 14)) { v = min(v, dist(pos, vec2( 0.000, -0.938), vec2( 0.000, -0.063))); }
	if (bit(n, 15)) { v = min(v, dist(pos, vec2( 0.063, -0.063), vec2( 0.438, -0.938))); }
	return v;
}
 
////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
// Noise section for fancy-boi stuff 
//Default noise values (Defines, fixed values)
#ifdef FANCYMODE
#define SCALE 2.2
#define SEED 1333.0
#define OCTAVES 6
#define PERSISTENCE 0.65


//Local noise variables (Local, Each pixel has their own)
float _seed;
float _scale;
float _persistence;

//Reset local variables to context's values
void resetNoise() {
	_seed = seed;
	_scale = scale;
	_persistence = persistence;
}

//Reset local variables to default #define'd values
void defaultNoise() {
	_seed = SEED;
	_scale = SCALE;
	_persistence = PERSISTENCE;
}

//1d Hash
float hash(float n) { return fract(sin(n)*_seed); }

//3d hash (uses 1d hash at prime scale offsets for y/z)
float hash3(vec3 v) { return hash(v.x + v.y * 113.0 + v.z * 157.0); }
//Quick 3d smooth noise
float noise(vec3 x) {
	vec3 p = floor(x);
	vec3 f = fract(x);
	f       = f*f*(3.0-2.0*f);
	float n = p.x + p.y*157.0 + 113.0*p.z;

	return mix(mix(	mix( hash(n+0.0), hash(n+1.0),f.x),
			mix( hash(n+157.0), hash(n+158.0),f.x),f.y),
		   mix(	mix( hash(n+113.0), hash(n+114.0),f.x),
			mix( hash(n+270.0), hash(n+271.0),f.x),f.y),f.z);
}

float nnoise(vec3 pos, float factor) {	
	float total = 0.0
		, frequency = _scale
		, amplitude = 1.0
		, maxAmplitude = 0.0;
	
	//Accumulation
	for (int i = 0; i < OCTAVES; i++) {
		total += noise(pos * frequency) * amplitude;
		frequency *= 2.0, maxAmplitude += amplitude;
		amplitude *= _persistence;
	}
	
	//Normalization
	float avg = maxAmplitude * .5;
	if (factor != 0.0) {
		float range = avg * clamp(factor, 0.0, 1.0);
		float mmin = avg - range;
		float mmax = avg + range;
		
		float val = clamp(total, mmin, mmax);
		return val = (val - mmin) / (mmax - mmin);
	} 
	
	if (total > avg) { return 1.0; }
	return 0.0;
}
//Default normalization factor of .5
//This maps the range (.25,.75) to (0, 1)
float nnoise(vec3 pos) { return nnoise(pos, .5); }
//Absolute difference
float diff(float a, float b) { return abs(a-b); }
//Fractal difference noise, samples once and applies difference 4 times.
float diffNoise(vec3 pos) {
	float v = nnoise(pos);
	for (int i = 0; i < 2; i++) {
		pos.z += 2.0;
		v = diff(v, nnoise(pos));
	}
	return v;	
}
#endif
////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

// Maybe make these uniforms or make it so each bot has a unique color set? (based on index?)
#define OUTLINE_THICKNESS .03
#define OUTLINE_COLOR vec4(.04, .04, .04, 1.0)
#define HAND_COLOR vec4(.20, .20, .20, 1.0)
#define SLEEVE_COLOR vec4(.20, .80, .20, 1.0)
#define SHIRT_COLOR vec4(.70, .70, .20, 1.0)
#define HEAD_COLOR vec4(.70, .70, .70, 1.0)
#define LEGS_COLOR vec4(.80, .20, .20, 1.0)
#define EYE_COLOR vec4(.2, .2, .8, 1.0)
#define BOUNCE_DIST .6
// Render a bot at a given position, facing a direction
vec4 bot(vec2 pos, vec4 bot) {
	vec2 botpos = bot.xy;
	float angle = bot.z * DEG2RAD;
	
	vec2 low = botpos;
	vec2 high = botpos+vec2(1);
	// Average (Center) position in cell
	vec2 cell = (low + high) / 2.0;
	
	// Render angle marker
	float offset = .025 * sin(9. * time);
	// points on triangle
	vec2 a = vec2(cos(angle), sin(angle)) * (.61 + offset);
	vec2 b = vec2(cos(angle+PI/32.), sin(angle+PI/32.)) * (.5 + offset);
	vec2 c = vec2(cos(angle-PI/32.), sin(angle-PI/32.)) * (.5 + offset);
	
	// Render direction marker
	float dT = distTriangle(pos-cell, a,b,c);
	if (dT < .00009) { return vec4(1.0,1.0,1.0,1.0); }
	if (dT < .00099) { return vec4(0.0,0.0,0.0,0.75); }
	
	// besides angle marker, clip anything outside the cell.
	vec2 cpos = pos - cell;
	if (mlength(cpos) > .5) { return vec4(0); }
	
	// Bouncing
	float t = fract(3. * time / PI);
	float bounce = t * (1.0-t);
	
	// Animation.
	cpos.y += (-.5 * bounce) * BOUNCE_DIST;
	vec2 mpos = vec2(abs(cpos.x), cpos.y);
	
	// Render bot top to bottom...
	float eye = distBox(mpos + vec2(-.05, -.22), vec2(.03, .04));
	if (eye < 0.) { return EYE_COLOR; }
	
	// Arms and hands are considered one object, so we union them for outline
	float arm = distBox(mpos + vec2(-.20, .02), vec2(.02, .07));
	if (arm < 0.) { return SLEEVE_COLOR; }
	float arm2 = distBox(mpos + vec2(-.20, .1), vec2(.02, .07));
	if (arm2 < 0.) { return HAND_COLOR; }
	if (min(arm, arm2) < OUTLINE_THICKNESS) { return OUTLINE_COLOR; }
	
	// Head is a slight T-shape
	float head = min(distBox(cpos + vec2(.00, -.20), vec2(.15, .08)),
			 distBox(cpos + vec2(.00, -.1), vec2(.075, .025))); // Chin
	head = max(head, -distBox(cpos + vec2(.00, -.12), vec2(.02, .02))); // Mouth-hole uses outline color
	
	if (head < 0.) { return HEAD_COLOR; }
	if (head < OUTLINE_THICKNESS) { return OUTLINE_COLOR; }
	
	float legs = min(distBox(mpos + vec2(-.1, .25), vec2(.04, .03)),
			 distBox(mpos + vec2(-.05, .235), vec2(.01, .015)));
	if (legs < 0.) { return LEGS_COLOR; }
	if (legs < OUTLINE_THICKNESS) { return OUTLINE_COLOR; }
	
	// K on shirt from lines
	float k = dist(cpos, vec2(-.05, -.14), vec2(-.05, -.00));
	k = min(k, dist(cpos, vec2(-.05, -.08), vec2(0.04, +.00)));
	k = min(k, dist(cpos, vec2(-.05, -.03), vec2(0.07, -.15)));
	if (k < 0.00015) { return OUTLINE_COLOR; }
	
	// Body/shirt behind everything else.
	float body = distBox(cpos + vec2(.00, .06), vec2(.15, .13));
	if (body < 0.) { return SHIRT_COLOR; }
	if (body < OUTLINE_THICKNESS) { return OUTLINE_COLOR; }
	// empty
	return vec4(0);
}

// Render axis-aligned grid
vec4 grid(vec2 pos) {
	vec2 low = floor(pos);
	vec2 high = ceil(pos);
	vec2 grid = min( abs(pos - high), abs(pos - low)); 
	// No clipping, we repeat over x/y infinitely. 
	
	vec4 c = vec4(0,0,0,1);
	grid = pow(.055 / grid, vec2(2.0));
	// Make the noise a little fuzzy
	grid *= .05;
	
	#ifdef FANCYMODE
	grid *= nnoise(vec3(1.5 * time, pos * 20.15));
	//if (grid.x == 0.0) { grid.x = 0.1; }
	//if (grid.y == 0.0) { grid.y = 0.1; }
	vec2 grid2 = min( abs(pos - high), abs(pos - low));
	// make blobs and oscilate them slightly
	grid2.x *= 15.2 * abs(nnoise(vec3(.014 * time, pos * 2.5 + vec2(sin(time * 0.37) *  .2, sin(time * 0.29) *  .3))));
	grid2.y *= 15.2 * abs(nnoise(vec3(.026 * time, pos * 2.3 + vec2(sin(time * 0.12) * -.3, sin(time * 0.10) * -.3))));
	// make the lines less glowy
	// make blobs more glowy
	grid2 = pow(1.11 / grid2, vec2(16.0));
	
	c.r += clamp(grid2.r, 0.0, 1.0) * .2;
	c.g += clamp(grid2.g, 0.0, 1.0) * .1;
	// Blend slightly more close to the lines
	#endif
	
	c.a = .10 + clamp(length(grid), 0.0, 10.0) * .005;
	c.rg += clamp(grid.rg, 0.0, 1.0);
	return c;
}

// texture for a given position
vec4 metalTex(vec2 pos) {
	#ifdef FANCYMODE
	float a = .1 + 2.0 * nnoise(vec3(pos, 21.0));
	float b = .1 + 2.5 * nnoise(vec3(pos, -121.32));
	float n = .05 
		+ .6 * diffNoise(vec3(a * pos, 27.34))
		+ .4 * nnoise(vec3(b * pos, 12.34));
	#else
	float n = .66 + .021 * sin(mlength(pos * 32.0));
	#endif
	return vec4(n,n,n, 1.0);
}

// Render a wall at given position
float dwall(vec2 pos, vec4 ab) {
	vec2 a = ab.xy;
	vec2 b = ab.zw;
	return dist(pos, a, b);
}
// Get color for wall based on distance to wall
vec4 wall(vec2 pos, float d) {
	// clip out pixels that are too far away.
	if (d > .2) { return vec4(0); }
	// Render wall
	if (d <= .01) { return metalTex(pos); } 
	// Render wall shadow if pixel is close to wall.
	if (d <= .2) { return vec4(0,0,0,  clamp((1.0-(1164.1*d*d)), 0.0, 1.0) ); }
	
	return vec4(0);
}

// Render a beeper (+ count!)
#define BEEPER_SIZE .3
vec4 beeper(vec2 pos, vec4 beeper) {
	vec2 beeperPos = beeper.xy;
	vec2 low = beeperPos;
	vec2 high = beeperPos+vec2(1);
	// Average (Center) position in cell
	vec2 cell = (low + high) / 2.0;
	// Early return
	vec2 cpos = pos - cell;
	
	// Clip anything outside the cell.
	if (mlength(cpos) > .5) { return vec4(0); }
	
	float d = 1e6;
	float beeperCount = beeper.z;
	int lo = int(mod(beeperCount, 10.0));
	int hi = int(mod(beeperCount, 100.0)/10.);
	
	vec2 loPos = cpos * 7. - vec2(.65, 0);
	vec2 hiPos = cpos * 7. + vec2(.65, 0);
	
	if (lo == 0) { d = min(d, ddigit(loPos, n0)); }
	else if (lo == 1) { d = min(d, ddigit(loPos, n1)); }
	else if (lo == 2) { d = min(d, ddigit(loPos, n2)); }
	else if (lo == 3) { d = min(d, ddigit(loPos, n3)); }
	else if (lo == 4) { d = min(d, ddigit(loPos, n4)); }
	else if (lo == 5) { d = min(d, ddigit(loPos, n5)); }
	else if (lo == 6) { d = min(d, ddigit(loPos, n6)); }
	else if (lo == 7) { d = min(d, ddigit(loPos, n7)); }
	else if (lo == 8) { d = min(d, ddigit(loPos, n8)); }
	else if (lo == 9) { d = min(d, ddigit(loPos, n9)); }
	
	if (hi == 0) { d = min(d, ddigit(hiPos, n0)); }
	else if (hi == 1) { d = min(d, ddigit(hiPos, n1)); }
	else if (hi == 2) { d = min(d, ddigit(hiPos, n2)); }
	else if (hi == 3) { d = min(d, ddigit(hiPos, n3)); }
	else if (hi == 4) { d = min(d, ddigit(hiPos, n4)); }
	else if (hi == 5) { d = min(d, ddigit(hiPos, n5)); }
	else if (hi == 6) { d = min(d, ddigit(hiPos, n6)); }
	else if (hi == 7) { d = min(d, ddigit(hiPos, n7)); }
	else if (hi == 8) { d = min(d, ddigit(hiPos, n8)); }
	else if (hi == 9) { d = min(d, ddigit(hiPos, n9)); }
	
	vec4 beeperBase = vec4(.3 * metalTex(pos * .3).rgb, 1.0);
	if (d < .10) {
		vec4 text = clamp(vec4(.0002, .005, .00003, 1.0)/d, vec4(0), vec4(1));
		return vec4(blend(beeperBase, text), 1.0);
	}
	
	if (length(cpos) < BEEPER_SIZE) {
		return beeperBase;
		//return vec4(.19, .19, .19, 1.0);
	}
	if (length(cpos) < BEEPER_SIZE + .015) {
		//return vec4(.3 * metalTex(pos * .3).rgb, 1.0);
		return vec4(vec3(.02), 1.0);
	}
	// Empty
	return vec4(0);
}


void main( void ) {
	#ifdef FANCYMODE
	defaultNoise();
	#endif
	float aspect = resolution.x / resolution.y;
	vec2 pos = scroll + (( gl_FragCoord.xy / resolution.xy ) - .5 ) * zoom;
	
	// Force square viewing area around focused point
	if (aspect > 1.0) { pos.x *= aspect; } else { pos.y /= aspect; }
	
	vec4 col = vec4(.05 * metalTex(pos).rgb, 1.0);
	
	
	// Fade grid lines into background
	// vec4 grid = grid(pos);
	//
	col.rgb = blend(col, grid(pos));
	
	float distWall = 1e6;
	int nw = int(numWalls);
	for (int i = 0; i < MAX_WALLS; i++) {
		if (i >= nw) { break; }
		distWall = min(distWall, dwall(pos, walls[i]));
	}
	// some debug walls	
	// distWall = min(distWall, dwall(pos, vec4(2,0,2,1)));
	// distWall = min(distWall, dwall(pos, vec4(-5,0,3,0)));
	// distWall = min(distWall, dwall(pos, vec4(-3,-3,-3,3)));
	// distWall = min(distWall, dwall(pos, vec4(-2,3,-2,2)));
	// distWall = min(distWall, dwall(pos, vec4(-2,-2,-2,-1)));
	// distWall = min(distWall, dwall(pos, vec4(-1,-3,-1,0)));
	
	// render all walls as one object
	col.rgb = blend(col, wall(pos, distWall));
	
	// Beepers
	int nb = int(numBeepers);
	for (int i = 0; i < MAX_BEEPERS; i++) {
		if (i >= nb) { break; }
		col.rgb = blend(col, beeper(pos, beepers[i]));	
	}
	// col.rgb = blend(col, beeper(pos, vec4(2,-1, fract(time * .03) * 100.,0)));
	// col.rgb = blend(col, beeper(pos, vec4(-2,3, fract(time * .02) * 100.,0)));
	// col.rgb = blend(col, beeper(pos, vec4(-2,-2, fract(time * .01) * 100.,0)));
	
	// Bots
	int nk = int(numBots);
	for (int i = 0; i < MAX_BOTS; i++) {
		if (i >= nk) { break; }
		col.rgb = blend(col, bot(pos, bots[i]));
	}
	// col.rgb = blend(col, bot(pos, vec4(-2,-2,0,0)));
	// col.rgb = blend(col, bot(pos, vec4(1,0, 90,0)));
	
	vec2 hcell = highlightCell + vec2(0.5);
	float dbox = abs(distBox(pos - hcell, vec2(.5+sin(time*3.0)*.05) ) );
	vec4 highlight = vec4(hsv2rgb(vec3(mod(time*.2, 1.0), 1.0, 1.0)), 0.65);
	if (dbox < .02) { 
		col.rgb = blend(col, highlight);
	}
	
	if (length(focWall.xy - focWall.zw) > .5) {
		float fwd = dwall(pos, focWall);
		if (fwd < .02 + .009 * sin(time*3.0)) {
			col.rgb = blend(col, highlight);
		}
		
	}

	gl_FragColor = col;
}
`;