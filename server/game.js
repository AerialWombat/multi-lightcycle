const { GRID_SIZE } = require('./constants');

module.exports = { initGameState, gameLoop, getUpdatedVelocity };

function initGameState() {
	const state = {
		players: [
			{
				pos: {
					x: 3,
					y: 40,
				},
				vel: {
					x: 1,
					y: 0,
				},
				cycle: [],
			},
			{
				pos: {
					x: 77,
					y: 40,
				},
				vel: {
					x: -1,
					y: 0,
				},
				cycle: [],
			},
		],
		gridsize: GRID_SIZE,
	};

	return state;
}

function gameLoop(state) {
	if (!state) {
		return;
	}

	const playerOne = state.players[0];
	const playerTwo = state.players[1];

	playerOne.pos.x += playerOne.vel.x;
	playerOne.pos.y += playerOne.vel.y;

	playerTwo.pos.x += playerTwo.vel.x;
	playerTwo.pos.y += playerTwo.vel.y;

	// Checks if cycle is out of bounds
	if (
		playerOne.pos.x < 0 ||
		playerOne.pos.x > GRID_SIZE ||
		playerOne.pos.y < 0 ||
		playerOne.pos.y > GRID_SIZE
	) {
		console.log('P1 OUT OF BOUNDS');
		return 2;
	}
	if (
		playerTwo.pos.x < 0 ||
		playerTwo.pos.x > GRID_SIZE ||
		playerTwo.pos.y < 0 ||
		playerTwo.pos.y > GRID_SIZE
	) {
		console.log('P2 OUT OF BOUNDS');
		return 1;
	}

	// Check to see if cycle has velocity before updating position
	if (playerOne.vel.x || playerOne.vel.y) {
		// Check if cycle's head overlaps one of its cells
		for (let cell of playerOne.cycle) {
			if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
				console.log('P1 COLLIDED WITH SELF');
				return 2;
			}
			if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
				console.log('P2 COLLIDED WITH P1');
				return 1;
			}
		}

		playerOne.cycle.push({ ...playerOne.pos });
		// playerOne.cycle.shift();
	}
	if (playerTwo.vel.x || playerTwo.vel.y) {
		// Check if cycle's head overlaps one of its cells
		for (let cell of playerTwo.cycle) {
			if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
				console.log('P2 COLLIDED WITH SELF');
				return 1;
			}
			if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
				console.log('P1 COLLIDED WITH P2');
				return 2;
			}
		}

		playerTwo.cycle.push({ ...playerTwo.pos });
		// playerTwo.cycle.shift();
	}

	return false;
}

// Return a velocity object based on keycode
function getUpdatedVelocity(keyCode) {
	switch (keyCode) {
		case 37: {
			return { x: -1, y: 0 };
		}
		case 38: {
			return { x: 0, y: -1 };
		}
		case 39: {
			return { x: 1, y: 0 };
		}
		case 40: {
			return { x: 0, y: 1 };
		}
	}
}
