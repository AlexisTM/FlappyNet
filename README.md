# FlappyNet
Flappybird played by neural network

# The game

To play:

```javascript
var game;
window.onload = function() {
	game = new Game(60, true)
	game.start();

	document.body.onkeyup = function(e){
		if(e.keyCode == 32){
			game.jump();
		}
		if(e.keyCode == 13){
			game.jump();
		}
		if(e.keyCode == 82){
			game.reset();
		}
	}
	setInterval(function(){game.update()}, 17);
}
```

To use it with machine learning:

```javascript
// Game instanciation
// 60fps, no visuals, will be ran faster. 
game = new Game(60, false); 
training = true;

// While training
while(training) {
	// While the game is not lost
	while(!game.lost) {
		game.update()
		
		let flappy = game.flappy; // flappy.velocity, flappy.altitude, flappy.position
		let grid = game.occupancy; // grid of width/60 x height/60, 0: no obstacle, 1: obstacle

		let output = infer_network(flappy, grid);
		if(output > 0.5)
			game.jump();
	}
	let score = game.score;
	// Compare score to other generations and evolve.

	game.reset()
	// play again with the new genome
}

```

# Neural net

Not yet implemented. 