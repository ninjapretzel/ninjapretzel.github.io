let target;

const csses = { 
	mixed: "purple", hp: "red", mp: "blue",
	active: "blue-grey lighten-3",
	fixed: "lighten-3", percent: "lighten-1"
}
let sort = localStorage.sort || "TOTAL";
let size = localStorage.size || "SMALL";
function loadData(name, defaultVal) {
	window[name] = defaultVal;
	if (localStorage[name]) {
		try { window[name] = parseInt(localStorage[name]); } catch (err) {}
	}
}
loadData("hp", 5000);
loadData("mp", 5000);
loadData("elixir", 9999);
loadData("power", 19999);

const example = {
	"name":"Red Potion",
	"hp":50,
	"mp":0,
	"meso":50,
	"uniquePrices":"47 in Ludibrium, Gumball Machine and Omega Sector",
	"location":"Lith Harbour, Perion, Henesys, Kerning City, Ellinia, Nautilus Harbour, Sleepywood, NLC, Lushan Town, Shanghai, Thailand, Orbis, El Nath, Aqua Road, Korean Folk Town, Ludibrium, Deep Ludibrium, Leafre, Ariant, Magatia, Mu Lung, Herb Town, Omega Sector, CBD, Boat Quay Town, Malaysia, Gumball Machine"
};

let dataset = data.map((it, idx) => {
	const obj = {...it};
	obj.recKind = "fixed";
	obj.rawHp = obj.hp;
	obj.rawMp = obj.mp;
	
	if ((""+obj.hp).includes("%")) { obj.hp = parseFloat(obj.hp) / 100; obj.recKind = "percent"; }
	if ((""+obj.mp).includes("%")) { obj.mp = parseFloat(obj.mp) / 100; obj.recKind = "percent"; }
	obj.id = "item"+idx;
	
	if (obj.hp > 0 && obj.mp > 0) {
		obj.type = "mixed"
	} else {
		obj.type = obj.hp > 0 ? "hp" : "mp"
	}
	return obj;
});

function updateData() {
	for (let i = 0; i < dataset.length; i++) {
		const obj = dataset[i];
		if (obj.name === "Elixir") { obj.meso = elixir; }
		if (obj.name === "Power Elixir") { obj.meso = power; }
		obj.hpRec = obj.hp <= 1 ? (obj.hp * hp) : obj.hp;
		obj.mpRec = obj.mp <= 1 ? (obj.mp * mp) : obj.mp;
		obj.hpRatio = obj.hpRec / obj.meso;
		obj.mpRatio = obj.mpRec / obj.meso;
		obj.totRatio = (obj.hp + obj.mp) / obj.meso;
	}

}

function updateDisplay() {
	target.empty();
	const active = csses.active;
	
	for (let i = 0; i < dataset.length; i++) {
		const obj = dataset[i];
		const css = " " + csses[obj.type] + " " + csses[obj.recKind];
		const hpcss = " " + ((sort === "HP") ? active : css);
		const mpcss = " " + ((sort === "MP") ? active : css);
		const totcss = " " + ((sort === "TOTAL") ? active : css);
		
		const unq = obj.uniquePrices 
			? `<div id="${obj.id}unq" class="col s12 card-panel noMargin hidden ${active}">Unique Prices:${obj.uniquePrices}</div>` 
			: "";
		const loc = obj.location
			? `<div id="${obj.id}loc" class="col s12 card-panel noMargin hidden ${active}">Location: ${obj.location}</div>`
			: "";
		const tt = (obj.uniquePrices || obj.location) ? "Click to Reveal" : "";
		
		const row = $(`<div class="col s12 row card black-text noMargin ${css}" id="${obj.id}"> 
<div id="${obj.id}nm" class="col s3 card-panel noMargin ${css}">${obj.name}</div>
<div id="${obj.id}rh" class="col s1 card-panel noMargin ${css}">${obj.rawHp}</div>
<div id="${obj.id}rm" class="col s1 card-panel noMargin ${css}">${obj.rawMp}</div>
<div id="${obj.id}ms" class="col s2 card-panel noMargin ${css}">${obj.meso}</div>
<div id="${obj.id}hr" class="col s1 card-panel noMargin ${hpcss}">${obj.hpRatio.toFixed(3)}</div>
<div id="${obj.id}mr" class="col s1 card-panel noMargin ${mpcss}">${obj.mpRatio.toFixed(3)}</div>
<div id="${obj.id}tr" class="col s1 card-panel noMargin ${totcss}">${obj.totRatio.toFixed(3)}</div>
<div id="${obj.id}tt" class="col s2 card-panel noMargin ${css} center">${tt}</div>
${loc}
${unq}
			</div>`);
		
		row.find(`#${obj.id}tt`).click((evt)=>{
			console.log("hello from", obj.name);
			$(`#${obj.id}loc`).toggleClass("hidden");
			$(`#${obj.id}unq`).toggleClass("hidden");
		});
		target.append(row);
		
	}
}

const sortModes = {
	HP: {cmp: (a,b)=> b.hpRatio - a.hpRatio },
	MP: {cmp: (a,b)=> b.mpRatio - a.mpRatio },
	TOTAL: {cmp: (a,b)=> b.totRatio - a.totRatio },
}
for (let key of Object.keys(sortModes)) {
	sortModes[key].id = key+"_HEADER";
}

function highlight(elem) { elem.addClass("blue-grey").removeClass("brown"); }
function clearHeaders() {
	for (let key of Object.keys(sortModes)) {
		const mode = sortModes[key];
		$("#"+mode.id).addClass("brown").removeClass("blue-grey");
	}
}

function sortBy(mode) {
	localStorage.sort = sort = mode;
	clearHeaders();
	dataset.sort(sortModes[mode].cmp);
	highlight($("#"+sortModes[mode].id));
	updateDisplay();
}

function updateNumber(name) {
	try {
		localStorage[name] = window[name] = parseInt( $("#" + name).val() );
		updateData();
		sortBy(sort);
		updateDisplay();
	} catch (err) { }
}
function bindChanges(id) {
	$("#"+id).keydown((evt)=>{ updateNumber(id); });
	$("#"+id).keyup((evt)=>{ updateNumber(id); });
	$("#"+id).change((evt)=>{ updateNumber(id); });
}

$(document).ready(()=>{
	target = $("#target");
	
	$("#hp").val(hp);
	$("#mp").val(mp);
	$("#elixir").val(elixir);
	$("#power").val(power);
	M.updateTextFields();
	
	updateData();
	sortBy(sort);

	
	for (let key of Object.keys(sortModes)) {
		const name = key;
		const mode = sortModes[key];
		$("#" + mode.id).click((evt)=>{ sortBy(key); });
	}
	bindChanges("hp");
	bindChanges("mp");
	bindChanges("elixir");
	bindChanges("power");
	
	if (size === "BIG") { $("#wrapper").toggleClass("container"); }
	$("#toggleContainer").click(()=>{
		$("#wrapper").toggleClass("container");
		localStorage.size = size = (size === "SMALL" ? "BIG" : "SMALL");
	});
	
});

