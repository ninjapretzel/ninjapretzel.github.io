var vertCode = `
attribute vec4 position;
void main() {
	gl_Position = position;
}
`;
var fragCode = `
// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;

#define PI 3.14159265359
#define SCALE 64.0
#define SEED 1337.37

uniform vec2 resolution;
uniform float time;

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
 
void main() {
	vec2 p = (gl_FragCoord.xy / resolution) - .5;
	p += vec2(cos(time), sin(time));
	p *= SCALE;
	float v = noise(vec3(p, 0.0));
  	gl_FragColor = vec4(v, v, v, 1);
}
`;

var fragCode2 = `
// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;

#define PI 3.14159265359
#define SCALE 64.0
#define SEED 1337.37

uniform vec2 resolution;
uniform float time;

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
 
void main() {
	vec2 p = (gl_FragCoord.xy / resolution) - .5;
	p += vec2(cos(time), sin(time));
	p *= SCALE;
	float r = noise(vec3(p, 0.0));
	float g = noise(vec3(p, 1.0));
	float b = noise(vec3(p, -1.0));
	
  	gl_FragColor = vec4(r,g,b, 1);
}
`;


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
















