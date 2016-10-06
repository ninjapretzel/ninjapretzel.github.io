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
	
	vec4 c = vec4(.03/d, .1/d, .3/d, 1);
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
	
	vec4 c = vec4(.03/d, .1/d, .3/d, 1);
	gl_FragColor = c;
}`;

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
		ctx.drawFrag(prog);
	}, rate );
}
var frameRate = 50;
function startOctave(id, i, prog) {
	var ctx = new GLContext(id);
	var prog = ctx.compile( {frag:noiseWave} );
	var amp = Math.pow(.65, i-1);
	var scale = .5 * Math.pow(2.0, i);
	
	var unis = { amp, scale, seed:1337.337, persistence:.65 }
	
	ctx.setUniforms(prog, unis);
	//ctx.drawFrag(prog);
	redrawFragment(ctx, prog, 1000/frameRate);

}

$(document).ready(()=>{
	
	var pctx = new GLContext("perlin");
	var prog = pctx.compile( { frag:perlinWave} );
	var unis = { scale:1.0, seed:1337.337, persistence:.65 }
	pctx.setUniforms(prog, unis);
	redrawFragment(pctx, prog, 1000/frameRate);
	
	for (var i = 1; i <= 6; i++) {
		var id = "octave" + i;
		startOctave(id, i);
	}
	
	
	clickableImages();
});

