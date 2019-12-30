function turnRight() { 
	turnLeft(); 
	turnLeft(); 
	turnLeft(); 
}

while (!nearBeeper()) {
	turnRight();
	if (isBlocked()) {
		turnLeft();
		if (isBlocked()) {
			turnLeft();
		} else {
			step();
		}
	} else {
		step();
	}
}