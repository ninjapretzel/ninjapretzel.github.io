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

function isElementInView(element, fullyInView) {
	var pageTop = $(window).scrollTop();
	var pageBottom = pageTop + window.innerHeight;
	
	var elementTop = $(element).offset().top;
	var elementBottom = elementTop + $(element).height();
	
	if ((elementBottom >= pageTop && elementBottom <= pageBottom) ||
		(elementTop <= pageBottom && elementTop >= pageTop)) {
		return true;	
	}
	
	
	return false;
}
