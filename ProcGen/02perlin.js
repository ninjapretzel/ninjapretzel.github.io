var stdHeader = `
precision mediump float;
#define PI 3.14159265359
uniform vec2 resolution;
uniform float time;
`;
var noisePrim = `
#define SCALE 2.0
#define SEED 1333.0
#define OCTAVES 6
#define PERSISTENCE 0.65

uniform float seed;
uniform float scale;
uniform float persistence;

float _seed;
float _scale;
float _persistence;
void resetNoise() {
	_seed = seed;
	_scale = scale;
	_persistence = persistence;
}

void defaultNoise() {
	_seed = SEED;
	_scale = SCALE;
	_persistence = PERSISTENCE;
}

float hash(float n) { return fract(sin(n)*_seed); }
float lerp(float a, float b, float x) { return a + (b-a) * x; }
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
`;
var nnoise = `
float nnoise(vec3 pos, float factor) {	
	float total = 0.0
		, frequency = _scale
		, amplitude = 1.0
		, maxAmplitude = 0.0;
	
	for (int i = 0; i < OCTAVES; i++) {
		total += noise(pos * frequency) * amplitude;
		frequency *= 2.0, maxAmplitude += amplitude;
		amplitude *= _persistence;
	}
	
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
float nnoise(vec3 pos) { return nnoise(pos, .5); }`;

var noiseWave = stdHeader + noisePrim +`
uniform float amp;
void main( void ) {
	resetNoise();
	vec2 pos = ( gl_FragCoord.xy / resolution.xy ) - .5;
	pos *= 5.0;
	pos.y /= amp * 4.0;
	pos.x *= .10 * scale;
	
	float v = noise(vec3(time*scale+pos.x*8., 0.0, 0.0)) - .5;
	float d = length(pos.y - v) * 25.0;
	float r = .1 + .1 * sin(time + 2.0 * PI * 0.0/3.0);
	float g = .1 + .1 * sin(time + 2.0 * PI * 1.0/3.0);
	float b = .1 + .1 * sin(time + 2.0 * PI * 2.0/3.0);
	
	vec4 c = vec4(r/d, g/d, b/d, 1);
	gl_FragColor = c;
}`;

var perlinWave = stdHeader + noisePrim + nnoise +`
void main( void ){
	resetNoise();
	vec2 pos = ( gl_FragCoord.xy / resolution.xy ) - .5;
	pos *= 5.0;
	pos.y /= 4.0;
	pos.x *= .10;
	
	float v = nnoise(vec3(time*.5+pos.x*8., 0.0, 0.0)) - .5;
	float d = length(pos.y - v) * 25.0;
	float r = .1 + .1 * sin(time + 2.0 * PI * 0.0/3.0);
	float g = .1 + .1 * sin(time + 2.0 * PI * 1.0/3.0);
	float b = .1 + .1 * sin(time + 2.0 * PI * 2.0/3.0);

	vec4 c = vec4(r/d, g/d, b/d, 1);
	gl_FragColor = c;
}`;

var neonWires = stdHeader + noisePrim + nnoise +`
void main( void ) {
	vec2 uv = ( gl_FragCoord.xy / resolution.xy ) - .5;
	_seed = 133.7;
	_scale = 6.;
	_persistence = .65;
	
	float amp = 1.60 + .050 * nnoise(vec3(time*4.+uv.x*32., time*3., 0));
	
	resetNoise();
	vec4 cc = vec4(0,0,0,1);
	for (int i = 0; i < 9; i++) {
		vec2 pos = uv;
		pos *= 5.0;
		pos.y /= amp * 4.0;
		pos.x *= .10 * _scale;
		pos.x -= 35.0;
		
		float v = noise(vec3(time *.5 + time*_scale+pos.x*8., pos.x * .05, 0.0)) - .5;
		float d = length(pos.y - v);
		//d *= (16.0 + 14.50 * sin(-2. * time + float(i)/9.0*2.0*PI));
		d *= .50 + 33.0 * noise(vec3(time * -6. + pos.x * 16.50, .01 * pos.x, 1.0));
		
		float r = .04 + .05 * sin(time + 2.0 * PI * ((float(i)+0.0)/9.0));
		float g = .04 + .05 * sin(time + 2.0 * PI * ((float(i)+3.0)/9.0));
		float b = .04 + .05 * sin(time + 2.0 * PI * ((float(i)+6.0)/9.0));
		cc.r += r/d;
		cc.g += g/d;
		cc.b += b/d;
		
		_scale *= 2.0;
		
		amp *= .72;
	}
	vec4 c = cc;//vec4(r/d, g/d, b/d, 1);
	gl_FragColor = c;
}`;
var texOctave = stdHeader + noisePrim + `
uniform float amp;
void main( void ) {
	resetNoise();
	vec2 uv = ( gl_FragCoord.xy / resolution.xy ) - .5;
	uv += vec2(sin(time * .51), cos(time * .51)) * 0.5;
	uv *= 10.;
	//float sc = 4.;	
	float v = (1.0 - amp) / 2.0 + noise(vec3(uv, 0) * _scale) * amp;
	vec4 c = vec4(v,v,v,1);
	gl_FragColor = c;
}`;
var texFull = stdHeader + noisePrim + nnoise + `
void main( void ) {
	resetNoise();
	vec2 uv = ( gl_FragCoord.xy / resolution.xy ) - .5;
	uv.x *= 4.0;
	uv += vec2(sin(time * .51), cos(time * .51)) * 0.5;
	uv *= 10.;
	float v = nnoise(vec3(uv, 0));
	vec4 c = vec4(v,v,v,1);
	gl_FragColor = c;
}`;

//Idea taken from the tutorial at:
//http://www.quantumpetshop.com/tutorials/camo.asp
var camo = stdHeader + noisePrim + nnoise + `
#define TAN vec4(125.0/255.0, 110.0/255.0, 75.0/255.0, 1.0)
#define BROWN vec4(70.0/255.0, 50.0/255.0, 15.0/255.0, 1.0)
#define GREEN vec4(50.0/255.0, 60.0/255.0, 25.0/255.0, 1.0)

uniform vec4 color1;
uniform vec4 color2;
uniform vec4 color3;
uniform vec4 color4;
uniform vec4 clips;

float diff(float a, float b) { return abs(a-b); }
float diffNoise(vec3 pos) {
	float v = nnoise(pos);
	for (int i = 0; i < 3; i++) {
		pos.z += 2.0;
		v = diff(v, nnoise(pos));
	}
	return v;	
}

void main( void ) {
	resetNoise();
	vec2 uv = ( gl_FragCoord.xy / resolution.xy ) - .5;
	uv += vec2(sin(time), cos(time)) * .5;
	uv += vec2(time * .2);
	vec3 pos = vec3(uv, 0) * 5.0;
	
	vec4 c;
	float clip4 = diffNoise(pos);
	if (clip4 < clips.w) {
		pos.z += 3.0;
		float clip3 = diffNoise(pos);
		if (clip3 < clips.z) {
			pos.z -= 5.0;
			float clip2 = diffNoise(pos);
			if (clip2 > clips.y) {
				c = color1;
			} else { 
				c = color2; 
			}
		} else {
			c = color3;
		}
		
	} else {
		c = color4;
	}
	
	gl_FragColor = c;
}
`


function responsiveCanvas(id) {
	var canvas = $(id);
	var container = canvas.parent();
	
	$(window).resize( function() {
		canvas.attr("width", container.width());
		canvas.attr("height", container.height());
	});
}
function redrawFragment(ctx, prog, rate) {
	setInterval( () => {
		if (isElementInView(ctx.canvas)) {
			ctx.drawFrag(prog);
		}
	}, rate );
}
var frameRate = 50;
function startFrag(id, progData, uniforms) {
	var ctx = new GLContext(id);
	var prog = ctx.compile(progData);
	ctx.setUniforms(prog, uniforms);
	redrawFragment(ctx, prog, 1000/frameRate);
}
function start1dOctave(id, i) {
	var amp = Math.pow(.65, i-1);
	var scale = .5 * Math.pow(2.0, i);
	startFrag(id, {frag:noiseWave}, { amp, scale, seed:1337.337, persistence:.65 })
}

function start2dOctave(id, i) {
	var amp = Math.pow(.75, i-1);
	var scale = .125 * Math.pow(2.0, i);
	startFrag(id, {frag:texOctave}, {amp, scale, seed:1337.337, persistence:.65 });
}

$(document).ready(()=>{
	startFrag("perlin", {frag:perlinWave}, { scale:1.0, seed:1337.337, persistence:.65 });
	startFrag("neonWires", {frag:neonWires}, { scale:.125, seed:1337.337, persistence:.75 });
	startFrag("texFull", {frag:texFull}, { scale:.125, seed:1337.337, persistence:.75 });
	startFrag("camoWoods", {frag:camo}, { 
		scale:.5, 
		seed:137, 
		persistence:.35,
		color1:[125/255, 110/255, 75/255, 1.0],
		color2:[070/255, 050/255, 15/255, 1.0],
		color3:[050/255, 060/255, 25/255, 1.0],
		color4:[0, 0, 0, 1],
		clips:[.5,.5,.5,.5],
	});
	/*
	startFrag("camoArctic", {frag:camo}, {
		scale:.65, 
		seed:143, 
		persistence:.35,
		color1:[.7,.9,.9,1],
		color2:[.6,.8,.8,1],
		color3:[1,1,1,1],
		color4:[.85,.90,.95,1],
		clips:[.5,.5,.5,.5],
	});
	startFrag("camoJungle", {frag:camo}, {
		scale:.8, 
		seed:222, 
		persistence:.4,
		color1:[25/255,44/255,35/255,1],
		color2:[94/255,111/255,63/255,1],
		color3:[130/255,133/255,79/255,1],
		color4:[80/255,79/255,48/255,1],
		clips:[.7,.3,.3,.3],
	});
	//*/
	
	for (var i = 1; i <= 6; i++) {
		var id = "octave" + i;
		start1dOctave(id, i);
		var id2 = "tex" + i;
		start2dOctave(id2, i);
	}
	
	
	clickableImages();
});

