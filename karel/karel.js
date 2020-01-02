
const wallsUniform = [];
const botsUniform = [];
const beepersUniform = [];
const scrollUniform = [0, 0];
const highlightCellUniform = [0, 0];
const focWallUniform = [ 0, 0, 0, 0 ];

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

let codeEditor = undefined;
let delay = 50;
let running = false;
let runId = 0;
let runTask = null;
const INTERRUPTED = "INTERRUPTED.";

const minZoom = 5;
const maxZoom = 30;

let preventEditInRun = false;

// Math...
const floor = Math.floor;
const abs = Math.abs;
const round = Math.round;

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
let snapshot = {};
function takeSnapshot() { 
	snapshot = JSON.parse(JSON.stringify(world)); 
	// console.log(`Took snapshot: `)
	// console.log(snapshot)
}
function loadSnapshot() {
	// console.log(`Loading Snapshot:`)
	// console.log(snapshot)
	world.karel.x = snapshot.karel.x;	world.karel.y = snapshot.karel.y;
	world.karel.angle = snapshot.karel.angle;	
	world.karel.beepers = snapshot.karel.beepers;
	copyKeys(snapshot.horizontalWalls, world.horizontalWalls)
	copyKeys(snapshot.verticalWalls, world.verticalWalls)
	copyKeys(snapshot.beepers, world.beepers)
	// console.log(world);
}

function clearKeys(obj) {
	for (let k of Object.keys(obj)) { delete obj[k]; }
}

function copyKeys(src, dest) {
	clearKeys(dest);
	for (let k of Object.keys(src)) { dest[k] = src[k]; }
}

function toggleWall(fw) {
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
}

function beeperExists(x, y) {
	let key = `${x},${y}`
	return world.beepers.hasOwnProperty(key) && world.beepers[key];
}

function removeBeeper(x, y) {
	let key = `${x},${y}`
	if (world.beepers.hasOwnProperty(key)) {
		let cnt = world.beepers[key];
		cnt -= 1;
		if (cnt === 0) {
			delete world.beepers[key];
		} else {
			world.beepers[key] = cnt;
		}
	}
}

function addBeeper(x,y) {
	let key = `${x},${y}`
	if (world.beepers.hasOwnProperty(key)) {
		world.beepers[key] += 1;
	} else {
		world.beepers[key] = 1;
	}
}

/** Promise wrapper to run code after a delay */
function wait(ms) {
	return new Promise((resolve, reject) => { setTimeout( ()=>{resolve(); }, ms); });
}
/** directly async version of 'wait' */
async function pause(ms) { await wait(ms); }


function checkRunning() {
	if (!running || interp.runId !== runId) { throw INTERRUPTED; }
}
function checkRunningEdit() {
	if (running) { 
		M.toast({html:"Edits made while running will be lost!", classes:"amber black-text", displayLength: 1000})
	}
	return running && preventEditInRun;
}
function checkRunningLoad() {
	if (running) { 
		M.toast({html:"Cannot save/load script/world while running!<br>Please RESET first!", classes:"amber black-text", displayLength: 1000})
	}
	return running;
}

async function step() { 
	let bot = world.karel;
	await pause(delay);
	checkRunning();
	
	let x = bot.x; let y = bot.y;
	let dir = round((bot.angle / 90) % 4);
	
	let dx = 0;		let dy = 0;
	if (dir == 0) { dx =  1; }
	if (dir == 1) { dy =  1; }
	if (dir == 2) { dx = -1; }
	if (dir == 3) { dy = -1; }
	// 0 = right, 1 = up, 2 = left, 3 = down
	let blockedBy = (dir == 0 || dir == 2) ? "verticalWalls" : "horizontalWalls";
	let blockX = dir == 0 ? (x+1) : x;
	let blockY = dir == 1 ? (y+1) : y;
	let key = `${blockX},${blockY}`
	//console.log(`Moving in dir=${dir} at=${x},${y} d=${dx},${dy} block=${blockX},${blockY}`)
	// Don't want to wait again, so we check directly.
	if (world[blockedBy][key]) {
		throw "KarelCrash! Karel crashed into a wall!"
	}
	bot.x += dx;
	bot.y += dy;
}
async function turnLeft() {
	let bot = world.karel;
	await pause(delay);
	checkRunning();
	
	bot.angle = (bot.angle + 90) % 360;
	if (bot.angle < 0) { bot.angle += 360; }
}

async function isBlocked() {
	let bot = world.karel;
	await pause(delay);
	checkRunning();
	
	
	let x = bot.x; let y = bot.y;
	let dir = round((bot.angle / 90) % 4);
	let blockedBy = (dir == 0 || dir == 2) ? "verticalWalls" : "horizontalWalls";
	let blockX = dir == 0 ? (x+1) : x;
	let blockY = dir == 1 ? (y+1) : y;
	let key = `${blockX},${blockY}`
	return (world[blockedBy][key]);
}
async function isNearBeeper() {
	let bot = world.karel;
	await pause(delay);
	checkRunning();
	
	let had = beeperExists(bot.x, bot.y);
	return had;
}
async function hasBeeper() {
	let bot = world.karel;
	await pause(delay);
	if (!running) { throw INTERRUPTED }
	
	return bot.beepers > 0;
}
async function placeBeeper() {
	let bot = world.karel;
	await pause(delay);
	checkRunning();
	
	if (bot.beepers > 0) {
		bot.beepers -= 1;
		addBeeper(bot.x, bot.y);
		updateBeeperText();
	} else {
		throw "KarelCrash! Karel tried to place a beeper, but doesn't have any!";
	}
}
async function takeBeeper() {
	let bot = world.karel;
	await pause(delay);
	checkRunning();
	
	if (beeperExists(bot.x, bot.y)) {
		bot.beepers += 1;
		removeBeeper(bot.x, bot.y);
		updateBeeperText();
	} else {
		throw "KarelCrash! Karel tried to take a beeper, but isn't near one!";
	}
}

	
const karelFunctions = {
	step, turnLeft, isBlocked,
	isNearBeeper, takeBeeper, 
	hasBeeper, placeBeeper,
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
			hc[0] = floor(mouse.wx); hc[1] = floor(mouse.wy);	
		} else {
			hc[0] = Infinity; hc[1] = Infinity;
		}
	}
}

function updateWorldText() {
	if (!running) {
		$("#world").val(JSON.stringify(world));
	}
}

function updateBeeperText() {
	$("#karelBeepers").val(world.karel.beepers.toFixed(0));
	
}
		
	

function updateFocusedWall(){
	const WALLSIZE = .30;
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
			
			scrollUniform[0] = karel.x;
			scrollUniform[1] = karel.y;
			
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


function saveToLocal(slot) {
	let save = JSON.stringify({
		world: JSON.parse(JSON.stringify(world)),
		script: codeEditor.getValue()
	});
	localStorage[slot] = save;
	
	M.toast({html:`Saved to slot '${slot}'`, classes: 'green', displayLength:1000})
}
function checkForLocalSlot(slot) {
	let save = localStorage[slot];
	if (save) {	
		return JSON.parse(save);
	} else {
		M.toast({html:`Save slot '${slot}' does not exist!`, classes: 'yellow black-text', displayLength:4000})
		return null;
	}
	
}
function loadFromLocal(slot) {
	let save = checkForLocalSlot(slot);
	
	if (save) {	
		let script = save.script;
		codeEditor.setValue(script);
		let worldJson = JSON.stringify(save.world);
		loadWorld(worldJson)
		
		M.toast({html:`Loaded from slot '${slot}'`, classes: 'green', displayLength:1000})
	}
}
function loadScriptFromLocal(slot) {
	let save = checkForLocalSlot(slot);
	if (save) {	
		let script = save.script;
		codeEditor.setValue(script);
		M.toast({html:`Loaded script from slot '${slot}'`, classes: 'green', displayLength:1000})
	}
}
function loadWorldFromlocal(slot) {
	let save = checkForLocalSlot(slot);
	if (save) {	
		let worldJson = JSON.stringify(save.world);
		loadWorld(worldJson)
		M.toast({html:`Loaded world from slot '${slot}'`, classes: 'green', displayLength:1000})
	}
}

function rebuildSlotSelector() {
	
}

async function execScript() {
	takeSnapshot();
	//M.toast({html: "Run Not yet implemented. Sorry.", classes:"yellow black-text" } );
	running = true;
	runId = interp.runId;
	
	$("#reset").removeClass("disabled");
	$("#restart").removeClass("disabled");
	$("#run").addClass("disabled");
	
	$(".activation").addClass("light-green")
		.removeClass("blue-grey")
		.removeClass("deep-orange")
		.removeClass("green")
		.removeClass("red")
	let script = codeEditor.getValue();
	
	try {
		runTask = evaluate(script, "dynamic", 1, karelFunctions);
		await runTask;
		M.toast({html: "Run Finished.", classes:"green", displayLength: 2000  } );
		
		$(".activation").addClass("green")
				.removeClass("red")
				.removeClass("blue-grey")
				.removeClass("light-green")
				.removeClass("deep-orange")
	} catch (e) {
		if (e === INTERRUPTED) {
			M.toast({html:`${e}.`, classes:"yellow black-text", displayLength: 1000});
		} else {
			if (typeof(e) === "string" && e.includes("KarelCrash!")) {
				M.toast({html:`${e}!<br/>Instruct Karel to be a little more careful!`, classes:"red" })
				
				$(".activation").addClass("deep-orange")
					.removeClass("blue-grey")
					.removeClass("green")
					.removeClass("light-green")
					.removeClass("red")
				
			} else {
				M.toast({html:`Script error. ${e}`, classes:"red" })
				console.error(e);
				
				$(".activation").addClass("red")
					.removeClass("blue-grey")
					.removeClass("green")
					.removeClass("deep-orange")
					.removeClass("light-green")
			}
			
		}
	}
	
}

async function resetScriptExec() {
	try {
		loadSnapshot();
		updateBeeperText();
		
		M.toast({html: "Reset Finished.", classes:"green", displayLength: 2000 } );
	} catch (err) { 
		
		M.toast({html: `Reset failed: ${err}`, classes: "red" } );
	}
	$("#reset").addClass("disabled");
	$("#restart").addClass("disabled");
	$("#run").removeClass("disabled");
	$(".activation").addClass("blue-grey")
			.removeClass("green")
			.removeClass("deep-orange")
			.removeClass("red")
			.removeClass("light-green")
			
	running = false;
	// Signal to vm we want to quit.
	interp.running = false;
	try {
		await runTask;
	} catch (e) { 
		if (e !== INTERRUPTED) {
			console.warn("Unexpected throw when interrupting VM:")
			console.warn(e);
			M.toast({html: `Unexpected throw when interrupting VM: ${e}`, classes:"red", displayLength:4000})
		}
	}
	
}

$(document).ready(()=>{
	let demoToLoad = "maze";
	
	let demoP = urlParam("demo");
	
	if (demoP && this[demoP+"Js"] && this[demoP+"World"]) {
		demoToLoad = demoP;
	}
	setTimeout(()=>{
		let extra = "";
		if (urlParam("fancy")) {
			extra = "#define FANCYMODE\n";
		}
		startFrag("k", {frag: extra+karelfrag}, uniforms)
		let jsToLoad = demoToLoad ? this[demoToLoad+"Js"] : null;
		let jsonToLoad = demoToLoad ? this[demoToLoad+"World"] : null;
		if (jsToLoad == null) { jsToLoad = ""; }
		if (jsonToLoad == null) { jsonToLoad = "{}"; }
		
		$(".preload").addClass("hidden");
		$(".main").removeClass("hidden");
		responsiveCanvas("#k");
		codeEditor = CodeMirror(document.getElementById("scriptEntry"), {
			value: jsToLoad,
			// value: demoJs,
			// value: "\nfunction main() {\n\tconsole.log('hello world');\n}\nmain();",
			mode: "javascript",	
			theme: "solarized dark",
			indentUnit: 4,
			smartIndent: true,
			tabSize: 4,
			indentWithTabs: true,
			electricChars: false,
			lineNumbers: true,
		})
		//*
		let worldJson = JSON.stringify(jsonToLoad)
		loadWorld(worldJson)
		//*/
		
		
		
		// Call Materialize's polyfills
		try { $('select').formSelect(); } catch (e) { console.warn(e); }
		try { $('.tooltipped').tooltip(); } catch (e) { console.warn(e); }
	}, 100);
	
	updateWorldText();
	updateBeeperText();
	prepareUniforms(world);
	updateUniforms();
	
	$(".preload").removeClass("hidden");
	$(".main").addClass("hidden");
	
	function updateDelay(num) {
		if (num && num > 0 && num <= 250) { 
			delay = num; 
		}
		$("#delay-range").val(delay);
		$("#delay").val(delay);
	}
	$("#delay").val(delay);
	$("#delay-range").val(delay);
	$("#delay").keydown((event)=>{
		updateDelay(Number($("#delay").val()))
	})
	$("#delay").keyup((event)=>{
		updateDelay(Number($("#delay").val()))
	})
	$("#delay-range").on("input", (event)=>{
		updateDelay(Number($("#delay-range").val()))
	})
	
	$(".bb").addClass("blue-grey lighten-2 blue-grey-text text-darken-3");
	$("#restart").addClass("disabled");
	$("#reset").addClass("disabled");
	
	$("#loadSlot").click(()=>{ 
		if (checkRunningLoad()) { return; }
		loadFromLocal($("#slotName").val() )
	});
	$("#loadScript").click(()=>{ 
		if (checkRunningLoad()) { return; }
		loadScriptFromLocal($("#slotName").val() )
	});
	$("#loadWorld").click(()=>{ 
		if (checkRunningLoad()) { return; }
		loadScriptFromLocal($("#slotName").val() )
	});
	$("#saveSlot").click(()=>{ 
		if (checkRunningLoad()) { return; }
		saveToLocal($("#slotName").val() )
	});
	
	$("#run").click(()=>{ execScript(); });
	$("#reset").click(()=>{ resetScriptExec(); });
	$("#restart").click(async ()=>{ 
		await resetScriptExec();
		await execScript(); 
	});
	$("#import").click(()=>{ 
		if (checkRunningEdit()) { return; }
		loadWorld( $("#world").val() ); 
	});
	$("#clear").click(()=>{
		if (checkRunningEdit()) { return; }
		world.karel.x = 0;
		world.karel.y = 0;
		world.karel.angle = 0;
		world.karel.beepers = 0;
		clearKeys(world.horizontalWalls)
		clearKeys(world.verticalWalls)
		clearKeys(world.beepers)
		scrollUniform[0] = 0;
		scrollUniform[1] = 0;
		updateWorldText();
		updateBeeperText();
	})
	$("#karelBeepers").keydown((event)=>{
		if (checkRunningEdit()) { return; }
		let num = Number($("#karelBeepers").val());
		if (num && num > 0) { world.karel.beepers = num; updateWorldText(); } else { updateBeeperText(); }
	});
	$("#karelBeepers").keyup((event)=>{
		if (checkRunningEdit()) { return; }
		let num = Number($("#karelBeepers").val());
		if (num && num > 0) { world.karel.beepers = num; updateWorldText(); } else { updateBeeperText(); }
	});
	$("#addBeeper").click(()=>{
		if (checkRunningEdit()) { return; }
		world.karel.beepers += 1; 
		updateBeeperText(); 
		updateWorldText();
	});
	$("#removeBeeper").click(()=>{ 
		if (checkRunningEdit()) { return; }
		world.karel.beepers -= 1; 
		if (world.karel.beepers <= 0) { world.karel.beepers = 0; }
		updateBeeperText(); 
		updateWorldText();
	});
	
	$("#k").click((event)=>{ 
		if (mouse.dragged) { 
			mouse.dragged = false;
			return;
		}
		if (checkRunningEdit()) { return; }
		
		if (hasFocusedWall()) {
			const fw = uniforms.focWall;
			toggleWall(fw);
			updateWorldText();
		} else {
			let key = `${mouse.ix},${mouse.iy}`;
			let dir = event.originalEvent.shiftKey ? -1 : 1;
			
			if (world.karel.x === mouse.ix && world.karel.y === mouse.iy) {
				world.karel.angle = (world.karel.angle + 90 * dir) % 360;
				if (world.karel.angle < 0) { world.karel.angle += 360; }
				updateWorldText();
			} else {
				if (dir === 1) {
					addBeeper(mouse.ix, mouse.iy);
					if (Object.keys(world.beepers).length >= 255) {
						M.toast({html: "Too Many Beepers! Beepers may not display properly! [Renderer limitation].", classes: "yellow black-text", displayLength: 1000 } )
					}
				} else {
					removeBeeper(mouse.ix, mouse.iy);
				}
				updateWorldText();
			}
				
		}
	 })
	$("#k").keydown((event)=>{
		if (checkRunningEdit()) { return; }
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
			if (mouse.x != null && mouse.y != null) {
				let diffx = (mouse.x - event.pageX) * uniforms.zoom / 500;
				let diffy = (mouse.y - event.pageY) * uniforms.zoom / 500;
				scrollUniform[0] += diffx;
				scrollUniform[1] -= diffy;
				
				if (abs(mouse.x - event.pageX) > 1 || abs(mouse.y - event.pageY) > 1) {
					mouse.dragged = true;
				}
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

function urlParam(parameterName) {
	let result = null;
	let tmp = [];
	let items = location.search.substr(1).split("&");
	for (let i = 0; i < items.length; i++) {
		tmp = items[i].split("=");
		if (tmp[0] === parameterName) { result = decodeURIComponent(tmp[1]); }
	}
	return result;
}