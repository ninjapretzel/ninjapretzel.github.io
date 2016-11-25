var last = "none";
var transition = false;
function swit(id) {
	if (transition) { return; }
	if (last === id) { return; }
	transition = true;
	var elem = $("#"+last);
	console.log(last);
	console.log(elem);
	
	if (elem.length > 0) { 
		elem.hide("fast", ()=>{
			last = id;
			$("#"+last).show("fast", ()=>{
				transition = false;
			});
				
		});
	} else {
		last = id;
		$("#"+last).show("fast", ()=>{
			transition = false;
		});
		console.log("Showed");
	}
	
}
$(document).ready(()=>{
	hide("brickinfo");
	hide("stoneinfo");
	hide("planetinfo");
	hide("mooninfo");
	hide("techinfo");
	hide("marbleinfo");
	
	$("#bricks").click(()=>{ swit("brickinfo"); });
	$("#stone").click(()=>{ swit("stoneinfo"); });
	$("#planet").click(()=>{ swit("planetinfo"); });
	$("#moon").click(()=>{ swit("mooninfo"); });
	$("#tech").click(()=>{ swit("techinfo"); });
	$("#marble").click(()=>{ swit("marbleinfo"); });
	
});