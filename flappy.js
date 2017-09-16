class Flappy {
	constructor(size, altitude, position) {
		this.size = size;
		this.altitude = altitude;
		this.velocity = 0;
		this.position = position; 
	}

	jump() {
		this.velocity += 500;
	}
}

class World {
	constructor(height=30, width=30, ratio=20, acceleration=981, obstacle_height=0.35, obstacle_width=2) {
		this.height = height*20;
		this.width = width*20;
		this.ratio = ratio;
		this.flappy = new Flappy(ratio, Math.ceil(this.height/2), 0.2*this.width);
		this.speed = 100;
		this.acceleration = acceleration;
		this.grid = new Array(this.width).fill(new Array(this.height).fill(0));

		this.obstacle_width = obstacle_width*this.ratio;
		this.half_obstacle = obstacle_height/2;

		this.obstacles = [];
		this.lost = false;
		this.drawing = {};

		this.score = 0;
	}

	createObstacle() {
		// From 20% to 80%, size of 40%
		const maxTop = this.height - 3*this.half_obstacle*this.height;
		let center = 1.5*this.half_obstacle*this.height+1 + Math.random()*maxTop;
		//let center = 2*this.half_obstacle*this.height + Math.random()*(this.height-4*this.half_obstacle);
		let top =  Math.ceil(center + this.half_obstacle*this.height);
		let bot =  Math.floor(center - this.half_obstacle*this.height);
		center = Math.ceil(center);

		return {"center": center, 
				"bot": bot,
				"top": top,
				"position": this.width,
				"scored": false}
	}

	start() {

	}

	prepareDrawing() {
		// Creates canvas 320 × 200 at 10, 50
		this.paper = Raphael(50, 50, this.width, this.height);

		this.drawing = {
			'flappy': this.paper.circle(this.flappy.position, this.flappy.altitude, this.ratio/2),
			'obstacles': {},
			'score': this.paper.text(this.width/2, 50, "0")
		};

		this.drawing.score.attr({ "font-weight": "bold",
								  "font-size": 50 });

		this.drawing.flappy.attr({"fill": "#f00",
								  "stroke": "#fff" });

	}

	createRaphaelObstacle() {
		var bot = this.paper.rect(0,0,this.obstacle_width,0);
		var top =this.paper.rect(0,0,this.obstacle_width,0);
		top.attr({"fill": "#009933"});
		bot.attr({"fill": "#009933"});

		return {
			"top": top,
			"bot": bot
		}
	}

	drawObstacles(i) {
		// Y is reversed in the drawing
		if(this.drawing.obstacles[i] == undefined) {
			this.drawing.obstacles[i] = this.createRaphaelObstacle();
		}

		let bot =  this.height-this.obstacles[i].bot; // big number, bottom of image
		let top =  this.height-this.obstacles[i].top; // little number, top of image
		this.drawing.obstacles[i].top.attr({"x": this.obstacles[i].position,
											"y": 0,
											"height": top});

		this.drawing.obstacles[i].bot.attr({"x": this.obstacles[i].position,
											"y": bot,
											"height": this.height - bot});
	}

	draw() {
		// Y is reversed in the drawing
		this.drawing.flappy.attr("cx", this.flappy.position);
		this.drawing.flappy.attr("cy", this.height - this.flappy.altitude);
		this.drawing.score.attr("text", this.score.toString());
		for (var i = this.obstacles.length - 1; i >= 0; i--) {
			if(this.obstacles[i] != undefined) {
				this.drawObstacles(i);
			}
		}
	}

	update(dt) {
		if(this.lost) return;
		// Check if we have an obstacle
		let enough_obstacles = false;
		for (var i = this.obstacles.length - 1; i >= 0; i--) {
			if(this.obstacles[i] != undefined) {
				if(this.obstacles[i].position >= 0.6*this.width)
					enough_obstacles = true;
			}
		}
		if(!enough_obstacles) {
			this.obstacles.push(this.createObstacle());
		}

		// Speed increase
		this.speed += 0.001;

		// Update the flappy position
		this.flappy.velocity -= dt*this.acceleration;
		this.flappy.altitude += this.flappy.velocity*dt

		// Check world collision
		if(this.flappy.altitude > this.height - this.ratio/2.) this.lost = true;
		if(this.flappy.altitude < this.ratio/2.) this.lost = true;

		for (var i = 0; i < this.obstacles.length; i++) {
			// Update position of the obstacles
			if(this.obstacles[i] != undefined) {
				
				this.obstacles[i].position -= this.speed*dt;

				// Check obstacle collisions
				if(Math.abs(this.obstacles[i].position - this.flappy.position) < (this.ratio/2)) {
					if(this.flappy.altitude <= this.obstacles[i].bot+this.ratio/2) {
						this.lost = true;
					}
					if(this.flappy.altitude >= this.obstacles[i].top-this.ratio/2){
						this.lost = true;
					}
				}

				// Scoring
				if(this.obstacles[i].position < this.flappy.position) {
					if(!this.obstacles[i].scored) {
						this.obstacles[i].scored = true;
						this.score += 1;
					}
				}

				// Clean out of view obstacle
				if(this.obstacles[i].position < -this.obstacle_width) {
					delete this.obstacles[i];
					this.drawing.obstacles[i].top.remove()
					//this.drawing.obstacles[i].top = false;
					this.drawing.obstacles[i].bot.remove()
					//this.drawing.obstacles[i].bot = false;
				}
			}
		}
	}


	cleanOccupancy() {
		this.grid.length = this.width/this.ratio;
		for (var i = this.grid.length - 1; i >= 0; i--) {
			this.grid[i] = []
			this.grid[i].length = this.height/this.ratio;
			for (var j = this.grid[i].length - 1; j >= 0; j--) {
				this.grid[i][j] = 0;
			}
		}
	}

	get occupancy() {
		this.cleanOccupancy();
		for (var i = 0; i < this.obstacles.length; i++) {
			if (this.obstacles[i] != undefined) {
				let position = Math.ceil(this.obstacles[i].position/this.ratio);
				if(position > 0) {
					let wide = Math.ceil(this.width*this.obstacle_width);
					let top = Math.ceil(this.obstacles[i].top/this.ratio);
					let bot = Math.ceil(this.obstacles[i].bot/this.ratio);

					for (let i = top; i < this.grid.length; i++) {
						this.grid[position][i] = 1;
					}

					for (let i = bot; i >= 0; i--) {
						this.grid[position][i] = 1;
					}
				}
			}
		}
		return this.grid;
	}
}


class Game {
	constructor(speed = 60, draw = false) {
		this.reset()
		this.dt = 1./speed;
		this.visual = draw;
	}

	reset() {
		this.world = new World()
	}

	get flappy() {
		return { "position": this.world.flappy.position,
				 "altitude": this.world.flappy.altitude,
				 "velocity": this.world.flappy.velocity };
	}

	get occupancy() {
		return this.world.occupancy;
	}

	get score() {
		return this.world.score;
	}

	get lost() {
		return this.world.lost;
	}

	draw() {
		this.world.draw();
	}

	prepareDrawing() {
		this.world.prepareDrawing()
	}

	jump() {
		this.world.flappy.jump();
	}

	update() {
		this.world.update(this.dt);
		if(this.visual) this.draw();
	}

	start() {

	}
}


var game;
window.onload = function() {
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