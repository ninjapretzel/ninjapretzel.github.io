////////////////////////////////////////////////////////////
//Embedded script for 02coherence.html
//Controls an interactive canvas that draws noise textures

//fractional part of number
function frac(n) { return Math.abs(n)%1; }
//alias for Math.sin
function sin(n) { return Math.sin(n); }
//global seed
SEED = 1234.456;

//Raw 1d hash function
function hash(n) {
	return frac(sin(n)*SEED);
}
//Linear interpolate
function lerp(a, b, x) { return a + (b-a) * x; }
//Cosine interpolate
function coserp(a, b, x) { 
	var ft = x * 3.1415927;
	var f = (1 - Math.cos(ft)) * .5;
	return a + (b-a) * f;
}

//2d hash function
function hash2d(x, y) { 
	return hash(x + 1337*y);
}
//2d interpolated noise
function noise2d(x,y) {
	var ix = Math.floor(x);
	var fx = x-ix;
	var iy = Math.floor(y);
	var fy = y-iy;
	
	var v1 = hash2d(ix  , iy  );
	var v2 = hash2d(ix+1, iy  );
	var v3 = hash2d(ix  , iy+1);
	var v4 = hash2d(ix+1, iy+1);
	
	var i1 = coserp(v1, v2, fx);
	var i2 = coserp(v3, v4, fx);
	return coserp(i1, i2, fy);
}

//Smoothed hash function
function shash(x,y) {
	var h = hash2d;
	var corners = (h(x-1,y-1) + h(x+1, y-1) + h(x-1,y+1) + h(x+1,y+1)) / 16.0;
	var sides = (h(x-1, y) + h(x+1, y) + h(x, y-1) + h(x, y+1)) / 8.0;
	var center = h(x,y) / 4.0;
	
	return corners + sides + center;
}

//Smoothed, Interpolated noise function
function snoise2d(x,y) {
	var ix = Math.floor(x);
	var fx = x-ix;
	var iy = Math.floor(y);
	var fy = y-iy;
	
	var v1 = shash(ix  , iy  );
	var v2 = shash(ix+1, iy  );
	var v3 = shash(ix  , iy+1);
	var v4 = shash(ix+1, iy+1);
	
	var i1 = lerp(v1, v2, fx);
	var i2 = lerp(v3, v4, fx);
	return lerp(i1, i2, fy);
}









//page globals
drag = false;
canvas = null;
ctx = null;
lastx = -1;
lasty = -1;
posx = 0;
posy = 0;
af = null;

minScale = .1;
maxScale = 1;
scale = .3;

//Redraw canvas
function draw() {
	
	if (ctx) {
		var count = 100.0;
		var size = 200.0 / count;
		
		//Fill 3 segments with the noise textures
		for (var y = 0; y < count; y++) {
			for (var x = 0; x < count; x++) {
				var v = Math.floor(hash2d(posx+x*scale, posy+y*scale) * 255.0);
				ctx.fillStyle = "rgb(" + v + "," + v + "," + v + ")";
				ctx.fillRect(x*size,y*size,size,size);
				
				v = Math.floor(noise2d(posx+x*scale, posy+y*scale) * 255.0);
				ctx.fillStyle = "rgb(" + v + "," + v + "," + v + ")";
				ctx.fillRect(200+x*size,y*size,size,size);
				
				v = Math.floor(snoise2d(posx+x*scale, posy+y*scale) * 255.0);
				ctx.fillStyle = "rgb(" + v + "," + v + "," + v + ")";
				ctx.fillRect(400+x*size,y*size,size,size);
				
			}
		}
		
		
		//Clear bottom part
		ctx.fillStyle = "#112233";
		ctx.fillRect(0,200,600,50);
			
		//Draw labels
		ctx.fillStyle = "white";
		ctx.font = "14px Tahoma";
		ctx.textAlign = "center";
		var textp = canvas.width/6;
		var textShift = canvas.width/3;
		
		ctx.fillText("Raw Noise", textp, 225);
		ctx.fillText("Interpolated Noise", textp + textShift, 225);
		ctx.fillText("Smoothed/Interpolated Noise", textp + 2 * textShift, 225);
		
		//Draw position string
		ctx.textAlign = "left";
		var maxX = posx + count * scale;
		var maxY = posy + count * scale;
		ctx.fillText("Position: (" + posx.toFixed(3) + ", " + posy.toFixed(3) + ") to (" + maxX.toFixed(3) + "," + maxY.toFixed(3) + 	")", 0, 245);
		
		//Draw some boxes around the noise textures.
		ctx.strokeStyle = "#336699";
		
		var sz = 2;
		var ww = 200-sz;
		ctx.lineWidth = sz;
		ctx.strokeRect(000+sz/2,sz/2,ww,ww);
		ctx.strokeRect(200+sz/2,sz/2,ww,ww);
		ctx.strokeRect(400+sz/2,sz/2,ww,ww);
		
	}
}






















/////////////////////////////////////////////
//Interaction functions
function mousemove(e) {
	if (drag && ctx) {
		posx += (lastx - e.clientX) / 3.0;
		posy += (lasty - e.clientY) / 3.0;
		lastx = e.clientX;
		lasty = e.clientY;
		draw();
	}
}

function mousedown(e) {
	drag = true; 
	lastx = e.clientX; 
	lasty = e.clientY; 
}

function mouseup(e) { 
	drag = false; 
	if (af) { window.cancelAnimationFrame(af); }
}

function wheel(e) {
	if (e.deltaY > 0) { scale += .1; }
	if (e.deltaY < 0) { scale -= .1; }
	if (scale > maxScale) { scale = maxScale; }
	if (scale < minScale) { scale = minScale; }
	e.preventDefault();
	draw();
}

$(document).ready(()=>{
	canvas = document.getElementById("canvas");
	if (canvas.getContext) {
		canvas.addEventListener("mouseup", mouseup);
		canvas.addEventListener("mouseout", mouseup);
		canvas.addEventListener("mousedown", mousedown);
		canvas.addEventListener("mousemove", mousemove);
		canvas.addEventListener("wheel", wheel);
		
		ctx = canvas.getContext("2d");
		
		draw();
	}
});