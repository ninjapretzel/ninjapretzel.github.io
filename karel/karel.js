
const wallsUniform = [];
const botsUniform = [];
const beepersUniform = [];
const scrollUniform = [0, 0];
const highlightCellUniform = [0, 0];
const focWallUniform = [ 0, 0, 0, 0 ]

const walls = [ ]
const bots = [ ]
const beepers = [ ]
const uniforms = {
	walls: wallsUniform,
	bots: botsUniform,
	beepers: beepersUniform, 
	numWalls: walls.length,
	numBots: bots.length,
	numBeepers: beepers.length,
	scroll: scrollUniform,
	highlightCell: highlightCellUniform,
	focWall: focWallUniform,
	zoom: 10,
};
const minZoom = 5;
const maxZoom = 30;

const floor = Math.floor;
const abs = Math.abs;

// Mouse info
const mouse = {};

// World of Karel 
const world = {
	karel: { 
		x: 0,
		y: 0,
		angle: 90,
		beepers: 0,
	},
	horizontalWalls: { // line pt+(1,0) is blocked
		"-5,0":1, "-4,0":1, "-3,0":1, "-2,0":1, "-1,0":1, "0,0":1, "1,0":1, "2,0":1,
	},
	verticalWalls: { // line pt+(0,1) is blocked
		"2,0":1, "-3,-3":1, "-3,-2":1, "-3,-1":1, "-3,0":1, "-3,1":1, "-3,2":1, "-2,2":1, "-2,-2":1, "-1,-3":1, "-1,-2":1, "-1,-1":1,
	},
	beepers: {
		"2,-1": 3,
		"-2,3": 2,
		"-2,2": 1,
	},
}

function prepareUniforms(world) {
	bots.length = 0;
	walls.length = 0;
	beepers.length = 0;
	let k = world.karel;
	bots[0] = [ k.x, k.y, k.angle, 0 ]
	
	for (let p of Object.keys(world.horizontalWalls)) {
		let pp = p.split(',');
		let x1 = Number(pp[0]);	let y1 = Number(pp[1]);
		let x2 = x1+1;			let y2 = y1;
		walls[walls.length] = [x1, y1, x2, y2];
	}
	for (let p of Object.keys(world.verticalWalls)) {
		let pp = p.split(',');
		let x1 = Number(pp[0]);	let y1 = Number(pp[1]);
		let x2 = x1;	let y2 = y1+1;
		walls[walls.length] = [x1, y1, x2, y2];
	}
	for (let p of Object.keys(world.beepers)) {
		let pp = p.split(',');
		let x = Number(pp[0]);	let y = Number(pp[1]);
		beepers[beepers.length] = [ x, y, world.beepers[p], 0 ];
	}
	// for (let i = 0; i < world.beepers.length; i++) {
	// 	let b = world.beepers[i];
	// 	beepers[beepers.length] = [ b.x, b.y, b.count, 0 ];
	// }
	updateUniforms();
}

function updateUniforms() {
	fillUniform(botsUniform, bots, "vec4", 4);
	uniforms.numBots = bots.length;
	fillUniform(beepersUniform, beepers, "vec4", 256);
	uniforms.numBeepers = beepers.length;
	fillUniform(wallsUniform, walls, "vec4", 512);
	uniforms.numWalls = walls.length;
	
	uniforms.focBeeper = -1;
	uniforms.focBot = -1;
	
	uniforms.scale = 2.2;
	uniforms.seed = 1333.0;
	uniforms.persistence = 0.65;
	updateFocusedWall();
	// uniforms.octaves = 6;
	
	const hc = uniforms.highlightCell;
	if (hasFocusedWall()) {
		hc[0] = Infinity; hc[1] = Infinity;
	} else {
		if (mouse.hasOwnProperty("wx") && mouse.hasOwnProperty("wy")) {
			hc[0] = Math.floor(mouse.wx); hc[1] = Math.floor(mouse.wy);	
		} else {
			hc[0] = Infinity; hc[1] = Infinity;
		}
	}
}

function updateWorldText() {
	$("#world").val(JSON.stringify(world));
}
		
	

function updateFocusedWall(){
	const WALLSIZE = .15;
	const fw = uniforms.focWall;
	const ix = mouse.ix;			let iy = mouse.iy;
	const px = mouse.px;			let py = mouse.py;
	const ddx = .5 - abs(px - .5);	let ddy = .5 - abs(py - .5);
	
	
	// console.log(`cell:${cx.toFixed(3)},${cy.toFixed(3)} dd:${ddx.toFixed(3)},${ddy.toFixed(3)} i:${ix},${iy}`)
	
	fw[0] = 0;	fw[1] = 0;
	fw[2] = 0;	fw[3] = 0;
	
	if (ddx < ddy) {
		// closer on x than y,
		// so draw a vertical line 
		if (px < WALLSIZE) { 
			fw[0] = 		fw[2] = ix; 
			fw[1] = iy; 	fw[3] = iy + 1;
		} else if (px > 1.0-WALLSIZE) {	
			fw[0] = fw[2] = ix + 1; 
			fw[1] = iy; 	fw[3] = iy + 1;
		}
		
	} else {
		// closer on y than x
		// so draw a horizontal line
		if (py < WALLSIZE) {
			fw[0] = ix;	fw[2] = ix + 1;
			fw[1] = fw[3] = iy; 
		} else if (py > 1.0-WALLSIZE) {	
			fw[0] = ix;	fw[2] = ix + 1;
			fw[1] = fw[3] = iy + 1; 
		}
	}
		
}
function hasFocusedWall() {
	const fw = uniforms.focWall;
	return !(fw[0] === fw[1] && fw[1] === fw[2] && fw[2] === fw[3] && fw[3] == 0);
}
function focusedWallIsVertical() {
	const fw = uniforms.focWall;
	return fw[0] === fw[2] && fw[1] !== fw[3];
}
function focusedWallIsHorizontal() {
	const fw = uniforms.focWall;
	return fw[1] === fw[3] && fw[0] !== fw[2];
}
function loadWorld(json) {
	try {
		const loaded = JSON.parse(json)
		const karelFail = "JSON Must describe a 'karel' object with 'x','y','angle', and 'beepers' integer properties!";
		if (isObject(loaded) && !isArray(loaded)) {
			if (!loaded.hasOwnProperty("karel")) { throw karelFail; }
			let karel = loaded.karel;
			// Karel has some specific requirements, so we have to be a bit thorough here. 
			if (!isObject(karel)) { throw karelFail; }
			if (!karel.hasOwnProperty("x")) { throw karelFail; }
			if (!karel.hasOwnProperty("y")) { throw karelFail; }
			if (!karel.hasOwnProperty("angle")) { throw karelFail; }
			if (!karel.hasOwnProperty("beepers")) { throw karelFail; }
			if (!(karel.x === Number(karel.x))) { throw karelFail; }
			if (!(karel.y === Number(karel.y))) { throw karelFail; }
			if (!(karel.angle === Number(karel.angle))) { throw karelFail; }
			if (!(karel.beepers === Number(karel.beepers))) { throw karelFail; }
			if (!(karel.x === floor(karel.x))) { throw karelFail; }
			if (!(karel.y === floor(karel.y))) { throw karelFail; }
			if (!(karel.angle === floor(karel.angle))) { throw karelFail; }
			if (!(karel.beepers === floor(karel.beepers))) { throw karelFail; }
			
			// These are less severe. We will only complain if they are not objects.
			if (!loaded.hasOwnProperty("horizontalWalls")) { loaded.horizontalWalls = {}; }
			if (!loaded.hasOwnProperty("verticalWalls")) { loaded.verticalWalls = {}; }
			if (!loaded.hasOwnProperty("beepers")) { loaded.beepers = {}; }
			
			if (!isObject(loaded.horizontalWalls)) { throw "JSON Must have a horizontalWalls object! (or be empty!!)"}
			if (!isObject(loaded.verticalWalls)) { throw "JSON Must have a verticalWalls object! (or be empty!!)"}
			if (!isObject(loaded.beepers)) { throw "JSON Must have a beepers object! (or be empty!!)"}
			
			// After we've verified that it looks good, we'll assign everything over.
			world.karel = loaded.karel;
			world.verticalWalls = loaded.verticalWalls;
			world.horizontalWalls = loaded.horizontalWalls;
			world.beepers = loaded.beepers;
			M.toast({html: "Load successful!", classes:"green" } );
		} else {
			throw "JSON must describe an object!"
		}
	} catch (err) {
		M.toast({html:`Failed to load json: ${err}`, classes:"red" } )
	}
}

$(document).ready(()=>{
	updateWorldText();
	prepareUniforms(world);
	updateUniforms();
	$(".preload").removeClass("hidden");
	$(".main").addClass("hidden");
	$("#reset").click(()=>{
		M.toast({html: "Reset Not yet implemented. Sorry.", classes:"yellow black-text" } );
	});
	$("#run").click(()=>{
		M.toast({html: "Run Not yet implemented. Sorry.", classes:"yellow black-text" } );
	});
	$("#load").click(()=>{ loadWorld( $("#world").val() ); });
	
	setTimeout(()=>{
		startFrag("k", {frag: karelfrag}, uniforms)

		$(".preload").addClass("hidden");
		$(".main").removeClass("hidden");
		responsiveCanvas("#k");
		let mirror = CodeMirror(document.getElementById("scriptEntry"), {
			value: "\nfunction main() {\n\tconsole.log('hello world');\n}",
			mode: "javascript",	
			theme: "solarized dark",
			indentUnit: 4,
			smartIndent: true,
			tabSize: 4,
			indentWithTabs: true,
			electricChars: false,
			lineNumbers: true,
		})
	}, 100);
	
	$("#k").click((event)=>{ 
		if (mouse.dragged) { 
			mouse.dragged = false;
			return;
		}
		if (hasFocusedWall()) {
			const fw = uniforms.focWall;
			let key = `${fw[0]},${fw[1]}`;
			let wallCount = 0;
			wallCount += Object.keys(world.horizontalWalls).length;
			wallCount += Object.keys(world.verticalWalls).length;
			
			if (wallCount >= 511) {
				M.toast({html: "Too Many Walls! Walls may not display properly! [Renderer limitation].", classes: "yellow black-text", displayLength: 1000 } )
			}
			if (focusedWallIsHorizontal()) {
				if (world.horizontalWalls.hasOwnProperty(key)) {
					delete world.horizontalWalls[key];
				} else {
					world.horizontalWalls[key] = 1;
				}
			} else {
				if (world.verticalWalls.hasOwnProperty(key)) {
					delete world.verticalWalls[key];
				} else {
					world.verticalWalls[key] = 1;
				}
			}
			updateWorldText();
		} else {
			let key = `${mouse.ix},${mouse.iy}`;
			let dir = event.originalEvent.shiftKey ? -1 : 1;
			
			if (world.karel.x === mouse.ix && world.karel.y === mouse.iy) {
				world.karel.angle += 90 * dir;
				updateWorldText();
			} else if (world.beepers.hasOwnProperty(key)) {
				let cnt = world.beepers[key];
				let next = cnt + dir;
				if (next === 0) {
					delete world.beepers[key];
				} else {
					world.beepers[key] = next;
				}
				updateWorldText();
			} else {
				if (Object.keys(world.beepers).length >= 255) {
					M.toast({html: "Too Many Beepers! Beepers may not display properly! [Renderer limitation].", classes: "yellow black-text", displayLength: 1000 } )
				}
				if (dir === 1) {
					world.beepers[key] = 1;
					updateWorldText();
				}
			}
				
		}
	 })
	$("#k").keydown((event)=>{
		// console.log(event);
		const k = event.originalEvent.key;
		if (!hasFocusedWall()) {
			
			if (k === 'k') { 
				world.karel.x = floor(mouse.wx);
				world.karel.y = floor(mouse.wy);
			}
		}
	})
	
	$("#k").mousedown((event)=>{ mouse.drag = true; })
	$("#k").mouseup((event)=>{ mouse.drag = false; })
	$("#k").mouseleave((event)=>{ mouse.drag = false; })
	$("#k").bind('DOMMouseScroll mousewheel', (event)=>{
		let dir = event.originalEvent.wheelDelta | (-event.originalEvent.detail);
		if (dir > 0) {
			uniforms.zoom *= .95;
			if (uniforms.zoom < minZoom) { uniforms.zoom = minZoom; }
		} else {
			uniforms.zoom *= 1.05;
			if (uniforms.zoom > maxZoom) { uniforms.zoom = maxZoom; }
		}
	})
	$("#k").mousemove((event)=>{
		if (mouse.drag) {
			mouse.dragged = true;
			if (mouse.x != null && mouse.y != null) {
				let diffx = (mouse.x - event.pageX) * uniforms.zoom / 500;
				let diffy = (mouse.y - event.pageY) * uniforms.zoom / 500;
				scrollUniform[0] += diffx;
				scrollUniform[1] -= diffy;
				//console.log(`Mouse drag delta=${diffx},${diffy}`);
			}
			mouse.x = event.pageX;
			mouse.y = event.pageY;
		} else {
			mouse.x = mouse.y = null;
		}
		
		let x = event.offsetX;		let y = event.offsetY;
		let w = $("#k").width();	let h = $("#k").height();
		let u = x / w;				let v = 1.0 - y / h;
		let aspect = w / h;
		mouse.u = u;				mouse.v = v;
		// calculate rendered world coords at mouse as in shader
		let wx = scrollUniform[0] + (u - .5) * uniforms.zoom;
		let wy = scrollUniform[1] + (v - .5) * uniforms.zoom;
		if (aspect > 1.0) { wx *= aspect; } else { wy /= aspect; }
		mouse.wx = wx;				mouse.wy = wy;
		mouse.ix = floor(wx);		mouse.iy = floor(wy);
		mouse.px = wx - mouse.ix;	mouse.py = wy - mouse.iy;
	})
})


function responsiveCanvas(id) {
	var canvas = $(id);
	var container = canvas.parent();
	canvas.attr("width", container.width());
	canvas.attr("height", container.height());
	
	$(window).resize( function() {
		canvas.attr("width", container.width());
		canvas.attr("height", container.height());
	});
}

const frags = {};

///Gets a GL Context, and renders a shader repeatidly
function startFrag(id, progData, uniforms) {
	var ctx = new GLContext(id);
	var prog = ctx.compile(progData);
	ctx.setUniforms(prog, uniforms);
	ctx.id = id;
	ctx.uniforms = uniforms;
	
	redrawFragment(ctx, prog, 1000/frameRate);
	frags[id] = {id, prog, ctx, progData, uniforms};
}

function redrawFragment(ctx, prog, rate) {
	return setInterval( ()=>{
		if (isElementInView(ctx.canvas)) {
			prepareUniforms(world);
			ctx.setUniforms(prog, uniforms);
			ctx.drawFrag(prog);
		}
	}, rate)
}