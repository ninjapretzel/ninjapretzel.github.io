const data = [
	{
		"name":"Red Potion",
		"hp":50,
		"mp":0,
		"meso":50,
		"uniquePrices":"47 in Ludibrium, Gumball Machine and Omega Sector",
		"location":"Lith Harbour, Perion, Henesys, Kerning City, Ellinia, Nautilus Harbour, Sleepywood, NLC, Lushan Town, Shanghai, Thailand, Orbis, El Nath, Aqua Road, Korean Folk Town, Ludibrium, Deep Ludibrium, Leafre, Ariant, Magatia, Mu Lung, Herb Town, Omega Sector, CBD, Boat Quay Town, Malaysia, Gumball Machine"
	},
	{
		"name":"Red Pill",
		"hp":50,
		"mp":0,
		"meso":50,
		"location":"Ludibrium, Deep Ludibrium, Gumball Machine"
	},
	{
		"name":"Apple",
		"hp":30,
		"mp":0,
		"meso":30,
		"location":"Lith Harbour, Perion, Henesys, Kerning City, Ellinia, Nautilus Harbour, Sleepywood, NLC, Lushan Town, Shanghai, Thailand, Orbis, El Nath, Aqua Road, Korean Folk Town, Leafre, Ariant, Magatia, Mu Lung, Herb Town, Omega Sector, CBD, Boat Quay Town, Malaysia"
	},
	{
		"name":"Egg",
		"hp":50,
		"mp":0,
		"meso":50,
		"uniquePrices":"47 in Ludibrium, Gumball Machine and Omega Sector",
		"location":"Lith Harbour, Perion, Henesys, Kerning City, Ellinia, Nautilus Harbour, Sleepywood, NLC, Lushan Town, Shanghai, Thailand, Orbis, El Nath, Aqua Road, Korean Folk Town, Ludibrium, Leafre, Ariant, Magatia, Mu Lung, Herb Town, Omega Sector, CBD, Boat Quay Town, Malaysia"
	},
	{
		"name":"Barbarian Elixir",
		"hp":1500,
		"mp":0,
		"meso":1500,
		"location":"NLC"
	},
	{
		"name":"Laksa",
		"hp":800,
		"mp":0,
		"meso":800,
		"location":"CBD, Kampung Village"
	},
	{
		"name":"Hokkien Mee",
		"hp":1200,
		"mp":0,
		"meso":1200,
		"location":"CBD, Kampung Village"
	},
	{
		"name":"Carrot Cake",
		"hp":1800,
		"mp":0,
		"meso":1800,
		"location":"CBD, Kampung Village"
	},
	{
		"name":"Chicken Rice",
		"hp":2200,
		"mp":0,
		"meso":2200,
		"location":"CBD, Kampung Village"
	},
	{
		"name":"Satay",
		"hp":2600,
		"mp":0,
		"meso":2600,
		"location":"CBD, Kampung Village"
	},
	{
		"name":"Chicken Kapitan",
		"hp":4000,
		"mp":0,
		"meso":4200,
		"location":"Kampung Village"
	},
	{
		"name":"Meat",
		"hp":100,
		"mp":0,
		"meso":106,
		"location":"Lith Harbour, Perion, Henesys, Kerning City, Ellinia, Nautilus Harbour, Sleepywood, NLC, Lushan Town, Shanghai, Thailand, Orbis, El Nath, Aqua Road, Korean Folk Town, Ludibrium, Leafre, Ariant, Magatia, Mu Lung, Herb Town, Omega Sector, CBD, Boat Quay Town, Malaysia, Gumball Machine"
	},
	{
		"name":"Hot Dog Supreme",
		"hp":500,
		"mp":0,
		"meso":530,
		"uniquePrices":"503 in Ludibrium and Gumball Machine",
		"location":"24 Hr Mobile Store, Thailand, Ludibrium, Gumball Machine"
	},
	{
		"name":"Kinoko Ramen(pig head)",
		"hp":800,
		"mp":0,
		"meso":850,
		"location":"Mushroom Shrine"
	},
	{
		"name":"Orange Potion",
		"hp":150,
		"mp":0,
		"meso":160,
		"uniquePrices":"152 in Ludibrium, Gumball Machine and Omega Sector",
		"location":"Lith Harbour, Perion, Henesys, Kerning City, Ellinia, Nautilus Harbour, Sleepywood, NLC, Lushan Town, Shanghai, Showa Market, Thailand, Orbis, El Nath, Aqua Road, Korean Folk Town, Ludibrium, Deep Ludibrium, Leafre, Ariant, Magatia, Mu Lung, Herb Town, Omega Sector, CBD, Boat Quay Town, Malaysia, Gumball Machine"
	},
	{
		"name":"White Potion",
		"hp":300,
		"mp":0,
		"meso":320,
		"uniquePrices":"304 from Ludibrium and Gumball Machine, 310 from NPC Jane",
		"location":"Lith Harbour, Perion, Henesys, Kerning City, Ellinia, Nautilus Harbour, Sleepywood, NLC, Lushan Town, Shanghai, Showa Market, Thailand, Orbis, El Nath, Aqua Road, Korean Folk Town, Ludibrium, Deep Ludibrium, Temple of Time, Leafre, Ariant, Magatia, Mu Lung, Herb Town, Omega Sector, CBD, Boat Quay Town, Malaysia, Gumball Machine"
	},
	{
		"name":"Orange Pill",
		"hp":150,
		"mp":0,
		"meso":160,
		"location":"Ludibrium, Deep Ludibrium, Gumball Machine"
	},
	{
		"name":"White Pill",
		"hp":300,
		"mp":0,
		"meso":320,
		"location":"Ludibrium, Deep Ludibrium, Gumball Machine"
	},
	{
		"name":"Hot Dog",
		"hp":300,
		"mp":0,
		"meso":320,
		"uniquePrices":"304 in Ludibrium and Gumball Machine",
		"location":"24 Hr Mobile Store, Thailand, Ludibrium, Gumball Machine"
	},
	{
		"name":"Kinoko Ramen(roasted pork)",
		"hp":1500,
		"mp":0,
		"meso":1600,
		"location":"Mushroom Shrine"
	},
	{
		"name":"Fried Chicken",
		"hp":200,
		"mp":0,
		"meso":220,
		"uniquePrices":"209 in Ludibrium and Gumball Machine",
		"location":"24 Hr Mobile Store, Thailand, Ludibrium, Gumball Machine"
	},
	{
		"name":"Unagi",
		"hp":1000,
		"mp":0,
		"meso":1100,
		"uniquePrices":"1060 from NPC Jane, 1144 from Gumball Machine",
		"location":"Sleepywood, 24 Hr Mobile Store, NPC Jane, NLC, Lushan Town, Shanghai, Orbis, El Nath, Aqua Road, Korean Folk Town, Deep Ludibrium, Ariant, Magatia, Mu Lung, Herb Town, NPC Mo, Omega Sector, CBD, Boat Quay Town, Malaysia, Gumball Machine"
	},
	{
		"name":"Ramen",
		"hp":1000,
		"mp":0,
		"meso":1100,
		"location":"Mushroom Shrine"
	},
	{
		"name":"Kinoko Ramen(salt)",
		"hp":500,
		"mp":0,
		"meso":550,
		"location":"Mushroom Shrine"
	},
	{
		"name":"Supreme Pizza",
		"hp":900,
		"mp":600,
		"meso":1000,
		"location":"NLC"
	},
	{
		"name":"Reindeer Milk",
		"hp":5000,
		"mp":0,
		"meso":5600,
		"uniquePrices":"5000 from NPC Mo, 5824 from Gumball Machine",
		"location":"NLC, El Nath, Aqua Road, Korean Folk Town, Deep Ludibrium, Temple of Time, Leafre, Mu Lung, NPC Mo, Omega Sector, Gumball Machine"
	},
	{
		"name":"Pizza",
		"hp":400,
		"mp":0,
		"meso":450,
		"uniquePrices":"427 in Ludibrium and Gumball Machine",
		"location":"24 Hr Mobile Store, Thailand, Ludibrium, Gumball Machine"
	},
	{
		"name":"Hamburger",
		"hp":400,
		"mp":0,
		"meso":450,
		"uniquePrices":"427 in Ludibrium and Gumball Machine",
		"location":"24 Hr Mobile Store, Thailand, Ludibrium, Gumball Machine"
	},
	{
		"name":"Melting Cheese",
		"hp":4000,
		"mp":0,
		"meso":4500,
		"uniquePrices":"4680 in Omega Sector and Gumball Machine",
		"location":"NLC, Showa Market, El Nath, Aqua Road, Korean Folk Town, Deep Ludibrium, Temple of Time, Leafre, Mu Lung, NPC Mo, Omega Sector, Gumball Machine"
	},
	{
		"name":"Ice Cream Pop",
		"hp":2000,
		"mp":0,
		"meso":2300,
		"uniquePrices":"2185 in Ludibrium, Gumball Machine and Omega Sector",
		"location":"NLC, Lushan Town, Shanghai, Showa Market, Thailand, Orbis, El Nath, Aqua Road, Korean Folk Town, Ludibrium, Deep Ludibrium, Temple of Time, Leafre, Ariant, Magatia, Mu Lung, Herb Town, Omega Sector, CBD, Boat Quay Town, Malaysia, Gumball Machine"
	},
	{
		"name":"Cherry Pie",
		"hp":2000,
		"mp":2000,
		"meso":3000,
		"location":"NLC"
	},
	{
		"name":"Honster",
		"hp":"60%",
		"mp":0,
		"meso":8000,
		"location":"NLC"
	},
	{
		"name":"Grilled Cheese",
		"hp":500,
		"mp":500,
		"meso":1000,
		"location":"NLC"
	},
	{
		"name":"Waffle",
		"hp":300,
		"mp":300,
		"meso":600,
		"location":"NLC"
	},
	{
		"name":"Mushroom Miso Ramen",
		"hp":"80%",
		"mp":"80%",
		"meso":17500,
		"location":"CBD, Malaysia"
	},
	{
		"name":"Ginger Ale",
		"hp":"75%",
		"mp":"75%",
		"meso":16500,
		"location":"NLC"
	},
	{
		"name":"Ginseng Root",
		"hp":"40%",
		"mp":"40%",
		"meso":9000,
		"location":"NLC"
	},
	{
		"name":"Chocolate",
		"hp":1000,
		"mp":1000,
		"meso":3000,
		"uniquePrices":"2850 in Ludibrium",
		"location":"Nautilus Harbour, Lushan Town, Shanghai, Orbis, Ludibrium, Ariant, Magatia, Herb Town, CBD, Boat Quay Town, Malaysia"
	},
	{
		"name":"Cake",
		"hp":100,
		"mp":100,
		"meso":320,
		"uniquePrices":"304 in Ludibrium and Gumball Machine",
		"location":"24 Hr Mobile Store, Thailand, Ludibrium, Gumball Machine"
	},
	{
		"name":"Watermelon",
		"hp":1000,
		"mp":1000,
		"meso":3200,
		"uniquePrices":"3120 from NPC Jane",
		"location":"NLC, NPC Jane, Lushan Town, Shanghai, Thailand, Orbis, El Nath, Aqua Road, Korean Folk Town, Temple of Time, Leafre, Ariant, Magatia, Mu Lung, Herb Town, Omega Sector, CBD, Boat Quay Town, Malaysia"
	},
	{
		"name":"Fried Shrimp",
		"hp":500,
		"mp":500,
		"meso":1600,
		"location":"Aqua Road"
	},
	{
		"name":"Rojak",
		"hp":1000,
		"mp":1000,
		"meso":3200,
		"location":"Kampung Village"
	},
	{
		"name":"Dango",
		"hp":200,
		"mp":200,
		"meso":650,
		"location":"Mushroom Shrine"
	},
	{
		"name":"Tri-coloured Dango",
		"hp":400,
		"mp":400,
		"meso":1350,
		"location":"Mushroom Shrine"
	},
	{
		"name":"Mapleade",
		"hp":"80%",
		"mp":"90%",
		"meso":150000,
		"location":"NLC"
	},
	{
		"name":"Blue Potion",
		"hp":0,
		"mp":100,
		"meso":200,
		"uniquePrices":"190 in Ludibrium, Gumball Machine and Omega Sector, 192 in Ellinia",
		"location":"Lith Harbour, Perion, Henesys, Kerning City, Ellinia, Nautilus Harbour, Sleepywood, NLC, Lushan Town, Shanghai, Showa Market, Thailand, Orbis, El Nath, Aqua Road, Korean Folk Town, Ludibrium, Deep Ludibrium, Leafre, Ariant, Magatia, Mu Lung, Herb Town, Omega Sector, CBD, Boat Quay Town, Malaysia, Gumball Machine"
	},
	{
		"name":"Mana Elixir",
		"hp":0,
		"mp":300,
		"meso":620,
		"uniquePrices":"589 in Ludibrium and Gumball Machine, 598 in Lushan Town, 604 in Ellinia",
		"location":"Lith Harbour, Perion, Henesys, Kerning City, Ellinia, Nautilus Harbour, Sleepywood, NLC, Lushan Town, Shanghai, Showa Market, Orbis, El Nath, Aqua Road, Korean Folk Town, Ludibrium, Deep Ludibrium, Temple of Time, Leafre, Ariant, Magatia, Mu Lung, Herb Town, NPC Mo, Omega Sector, CBD, Boat Quay Town, Malaysia, Gumball Machine"
	},
	{
		"name":"Blue Pill",
		"hp":0,
		"mp":100,
		"meso":200,
		"location":"Ludibrium, Deep Ludibrium, Gumball Machine"
	},
	{
		"name":"Mana Elixir Pill",
		"hp":0,
		"mp":300,
		"meso":620,
		"location":"Ludibrium, Deep Ludibrium, Gumball Machine, Lushan Town"
	},
	{
		"name":"Orange",
		"hp":0,
		"mp":50,
		"meso":100,
		"location":"Lith Harbour, Perion, Henesys, Kerning City, Ellinia, Nautilus Harbour, Sleepywood, NLC, Lushan Town, Shanghai, Thailand, Orbis, El Nath, Aqua Road, Korean Folk Town, Leafre, Ariant, Magatia, Mu Lung, Herb Town, Omega Sector, CBD, Boat Quay Town, Malaysia"
	},
	{
		"name":"Lemon",
		"hp":0,
		"mp":150,
		"meso":310,
		"uniquePrices":"294 in Omega Sector, 305 in Ellinia",
		"location":"Lith Harbour, Perion, Henesys, Kerning City, Ellinia, Nautilus Harbour, Sleepywood, NLC, Lushan Town, Shanghai, Thailand, Orbis, El Nath, Aqua Road, Korean Folk Town, Leafre, Ariant, Magatia, Mu Lung, Herb Town, Omega Sector, CBD, Boat Quay Town, Malaysia"
	},
	{
		"name":"Salad",
		"hp":0,
		"mp":200,
		"meso":420,
		"location":"24 Hr Mobile Store, Thailand"
	},
	{
		"name":"Pure Water",
		"hp":0,
		"mp":800,
		"meso":1650,
		"uniquePrices":"1600 from NPC Jane, 1716 from Gumball Machine",
		"location":"Sleepywood, 24 Hr Mobile Store, NPC Jane, NLC, Lushan Town, Shanghai,  Thailand, Orbis, El Nath, Aqua Road, Korean Folk Town, Deep Ludibrium, Ariant, Magatia, Mu Lung, Herb Town, NPC Mo, Omega Sector, CBD, Boat Quay Town, Malaysia, Gumball Machine"
	},
	{
		"name":"Mana Bull",
		"hp":0,
		"mp":"60%",
		"meso":13400,
		"location":"NLC"
	},
	{
		"name":"Sorcerer Elixir",
		"hp":0,
		"mp":1500,
		"meso":1500,
		"location":"NLC"
	},
	{
		"name":"Red Bean Sundae",
		"hp":0,
		"mp":2000,
		"meso":4000,
		"uniquePrices":"3800 in Ludibrium, Gumball Machine and Omega Sector",
		"location":"NLC, Lushan Town, Shanghai, Showa Market, Thailand, Orbis, El Nath, Aqua Road, Korean Folk Town, Ludibrium, Deep Ludibrium, Temple of Time, Leafre, Ariant, Magatia, Mu Lung, Herb Town, Omega Sector, CBD, Boat Quay Town, Malaysia, Gumball Machine"
	},
	{
		"name":"Sunrise Dew",
		"hp":0,
		"mp":4000,
		"meso":8100,
		"uniquePrices":"8424 from Gumball Machine",
		"location":"NLC, Showa Market, El Nath, Aqua Road, Korean Folk Town, Deep Ludibrium, Temple of Time, Leafre, Mu Lung, NPC Mo, Omega Sector, Gumball Machine"
	},
	{
		"name":"Sunset Dew",
		"hp":0,
		"mp":5000,
		"meso":10200,
		"uniquePrices":"9690 from NPC Mo and Omega Sector, 10608 from Gumball Machine",
		"location":"NLC, El Nath, Aqua Road, Korean Folk Town, Deep Ludibrium, Temple of Time, Leafre, Mu Lung, NPC Mo, Omega Sector, Gumball Machine"
	},
	{
		"name":"Fish Cake(skewer)",
		"hp":0,
		"mp":250,
		"meso":550,
		"location":"Mushroom Shrine"
	},
	{
		"name":"Fish Cake(dish)",
		"hp":0,
		"mp":500,
		"meso":1300,
		"location":"Mushroom Shrine"
	},
	{
		"name":"Guava",
		"hp":0,
		"mp":500,
		"meso":1000,
		"location":"CBD, Kampung Village"
	},
	{
		"name":"Rambutan",
		"hp":0,
		"mp":800,
		"meso":1600,
		"location":"CBD, Kampung Village"
	},
	{
		"name":"Dragon Fruit",
		"hp":0,
		"mp":1600,
		"meso":3200,
		"location":"CBD, Kampung Village"
	},
	{
		"name":"Durian",
		"hp":0,
		"mp":3200,
		"meso":6400,
		"uniquePrices":"6800 in Kampung Village",
		"location":"CBD, Kampung Village"
	},
	{
		"name":"Mee Siam",
		"hp":0,
		"mp":4000,
		"meso":9200,
		"location":"Kampung Village"
	},
	{
		"name":"Elixir",
		"hp":"50%",
		"mp":"50%",
		"meso":9999,
		"uniquePrices":"Just the price I have seen in the free market lately",
		"location":"Free Market"
	},
	{
		"name":"Power Elixir",
		"hp":"100%",
		"mp":"100%",
		"meso":19999,
		"uniquePrices":"Just the price I have seen in the free market lately",
		"location":"Free Market"
	},
	{
		"name":"Onyx Apple",
		"hp":"90%",
		"mp":"90%",
		"meso":12500000,
		"uniquePrices":"lol",
		"location":"Free Market"
	}
]
