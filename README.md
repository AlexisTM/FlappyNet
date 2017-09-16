# FlappyNet
Flappybird played by neural network

# The game

To play:

```javascript
var game;
window.onload = function() {
    // 60fps, with visualization
	game = new Game(60, true)
	game.start();
	game.prepareDrawing()

	document.body.onkeyup = function(e){
	    if(e.keyCode == 32){
	        game.jump()
	    }
	    if(e.keyCode == 13){
	        game.update()
	    }
	}
	setInterval(function(){game.update()}, 17);
}
```

To use it with machine learning:

```javascript
// Game instanciation
game = new Game(60, false)
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
}

```

# Neural net

Not yet implemented. 