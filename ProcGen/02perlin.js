function frac(n) { return Math.abs(n)%1; }
function lerp(a, b, x) { return a + (b-a) * x; }
function smoothstep(a, b, x) {
	var t = saturate((x - a)/(b - a));
    return t*t*(3.0 - (2.0*t));
}
SEED = 123.456;
function hash(n) { return frac(sin(n)*SEED); }
function noise(x,y,z) {
	var px = floor(x);
	var py = floor(y);
	var pz = floor(z);
	var fx = frac(x);
	var fy = frac(y);
	var fz = frac(z);
	fx     = fx*fx*(3.0-2.0*fx);
	fy     = fy*fy*(3.0-2.0*fy);
	fz     = fz*fz*(3.0-2.0*fz);
	var n  = px + py * 157.0 + 113.0 * pz;
	return lerp(lerp(lerp( hash(n+0.0), hash(n+1.0),fx),
                     lerp( hash(n+157.0), hash(n+158.0),fx),fy),
                lerp(lerp( hash(n+113.0), hash(n+114.0),fx),
                     lerp( hash(n+270.0), hash(n+271.0),fx),fy),fz);
}


function fillOneLayer(id, scale) {
	var container = $(id);
	for (var i = 0; i < 100; i++) {
		
	}
}

$(document).ready(()=>{
	
	
	clickableImages();
	
	//Refresh SVG elements by refreshing page 
	$("body").html($("body").html());
});