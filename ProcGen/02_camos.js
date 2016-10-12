
$(document).ready(()=>{
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
	
	startFrag("camoReds", {frag:camo}, {
		scale:.98, 
		seed:331, 
		persistence:.4,
		color1:hexToColor("191919"),
		color2:hexToColor("FFFFFF"),
		color3:hexToColor("505050"),
		color4:hexToColor("D73E3E"),
		clips:[.7,.5,.5,.5],
	});
	
	startFrag("camoDesert", {frag:camo}, {
		scale:1.1, 
		seed:232, 
		persistence:.44,
		color1:hexToColor("B79377"),
		color2:hexToColor("6A4926"),
		color3:hexToColor("AC8967"),
		color4:hexToColor("C8B29F"),
		clips:[.7,.3,.3,.6],
	});
	
	startFrag("camoUrban", {frag:camo}, {
		scale:.68, 
		seed:414, 
		persistence:.4,
		color1:hexToColor("000"),
		color2:hexToColor("454A44"),
		color3:hexToColor("E7E7E5"),
		color4:hexToColor("70756F"),
		clips:[.7,.3,.3,.3],
	});
	
	startFrag("camoWoods2", {frag:camo}, {
		scale:.68, 
		seed:414, 
		persistence:.4,
		color1:hexToColor("191418"),
		color2:hexToColor("523027"),
		color3:hexToColor("5D7E37"),
		color4:hexToColor("8F5933"),
		clips:[.7,.3,.3,.3],
	});
	
	startFrag("camoWerid", {frag:camo}, {
		scale:.78, 
		seed:123, 
		persistence:.4,
		color1:hexToColor("248"),
		color2:hexToColor("842"),
		color3:hexToColor("824"),
		color4:hexToColor("428"),
		clips:[.7,.3,.3,.3],
	});
	startFrag("camoWerid2", {frag:camo}, {
		scale:.58, 
		seed:321, 
		persistence:.4,
		color1:hexToColor("285"),
		color2:hexToColor("912"),
		color3:hexToColor("18A"),
		color4:hexToColor("523"),
		clips:[.7,.6,.5,.4],
	});
	
	
});

