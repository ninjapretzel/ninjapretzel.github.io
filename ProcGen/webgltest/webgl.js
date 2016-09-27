var vertCode = `
attribute vec4 position;
void main() {
	gl_Position = position;
}
`;
var stdHeader = `
precision mediump float;
#define PI 3.14159265359
uniform vec2 resolution;
uniform float time;
`;
var noisePrims = `
#define SCALE 2.0
#define SEED 1333.0
#define OCTAVES 8
#define PERSISTENCE 0.65

float hash(float n) { return fract(sin(n)*SEED); }
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
float nnoise(vec3 pos, float factor) {
	float total = 0.0
		, frequency = SCALE
		, amplitude = 1.0
		, maxAmplitude = 0.0;
	
	for (int i = 0; i < OCTAVES; i++) {
		total += noise(pos * frequency) * amplitude;
		frequency *= 2.0, maxAmplitude += amplitude;
		amplitude *= PERSISTENCE;
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
float nnoise(vec3 pos) { return nnoise(pos, .5); }
`;

var fragCode = stdHeader + noisePrims + `
#define ZOOM 4.0
void main() {
	vec2 p = (gl_FragCoord.xy / resolution) - .5;
	p += vec2(cos(time), sin(time));
	p *= ZOOM;
	float v = nnoise(vec3(p, 0.0));
  	gl_FragColor = vec4(v, v, v, 1);
}`;

var fragCode2 = stdHeader + noisePrims + ` 
#define ZOOM 4.0
void main() {
	vec2 p = (gl_FragCoord.xy / resolution) - .5;
	p += vec2(cos(time), sin(time));
	p *= ZOOM;
	float r = nnoise(vec3(p, 0.0));
	float g = nnoise(vec3(p, 1.0));
	float b = nnoise(vec3(p, -1.0));
	
  	gl_FragColor = vec4(r,g,b, 1);
}`;


$(document).ready(function() {
	var c = new GLContext("c");
	var d = new GLContext("d");
	
	var cprog = c.compile( {frag:fragCode} );
	c.drawFrag(cprog);
	setInterval( () => {
		c.drawFrag(cprog);
	}, 1000/60 )
	
	
	var dprog = d.compile( {frag:fragCode2} );
	d.drawFrag(dprog);
	setInterval( () => {
		d.drawFrag(dprog);
	}, 1000/60 )
	
});
















