function clickableImages() {
	var imgs = $("img");
	imgs.each(function(i){
		var a = $("<a></a>");
		var i = $("<img></img>");
		a.attr("href", $(this).attr("src"));
		a.attr("target", "_blank");
		i.attr("src", $(this).attr("src"));
		a.append(i);
		$(this).replaceWith(a);
	});
}