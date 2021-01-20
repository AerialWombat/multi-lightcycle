const io = require('socket.io')();
const { initGameState, gameLoop, getUpdatedVelocity } = require('./game');
const { makeid } = require('./utils');
const { FRAME_RATE } = require('./constants');

const state = {};
const clientRooms = {};

io.on('connection', (client) => {
	client.on('newgame', handleNewGame);
	client.on('joingame', handleJoinGame);
	client.on('keydown', handleKeydown);

	function handleNewGame() {
		// Add room to clientRooms with "random" ID
		let roomID = makeid(5);
		clientRooms[client.id] = roomID;

		// Initialize game state with room ID
		state[roomID] = initGameState();

		// Send generated room ID to client
		client.emit('gamecode', roomID);

		// Join client to room and assign player number
		client.join(roomID);
		client.number = 1;
		client.emit('playernumber', 1);
	}

	function handleJoinGame(roomID) {
		const room = io.sockets.adapter.rooms[roomID];

		let allUsers;
		let clientAmount = 0;

		if (room) {
			allUsers = room.sockets;
		}

		if (allUsers) {
			clientAmount = Object.keys(allUsers).length;
		}

		if (clientAmount === 0) {
			client.emit('unknowngame');
			return;
		} else if (clientAmount > 1) {
			client.emit('toomanyplayers');
			return;
		}

		clientRooms[client.id] = roomID;

		client.join(roomID);
		client.number = 2;
		client.emit('playernumber', 2);

		// Begin game countdown
		let countdown = 3;

		let countdownInterval = setInterval(() => {
			io.sockets.in(roomID).emit('countdown', countdown);
			if (countdown <= 0) {
				clearInterval(countdownInterval);
				startGameInterval(roomID);
			}

			countdown--;
		}, 1000);
	}

	// Update player velocity in state based on key code
	function handleKeydown(keyCode) {
		const roomID = clientRooms[client.id]; // Look for client ID in clientRooms keys

		if (!roomID) return;

		try {
			keyCode = parseInt(keyCode);
		} catch (error) {
			console.error(error);
			return;
		}
		const vel = getUpdatedVelocity(keyCode);

		if (vel) {
			state[roomID].players[client.number - 1].vel = vel;
		}
	}
});

// Initialize game loop with interval while checking for a winner
function startGameInterval(roomID) {
	const intervalId = setInterval(() => {
		const winner = gameLoop(state[roomID]);

		if (!winner) {
			emitGameState(roomID, state[roomID]);
		} else {
			emitGameOver(roomID, winner);
			state[roomID] = null;
			clearInterval(intervalId);
		}
	}, 1000 / FRAME_RATE);
}

// Emit 'gamestate' event with gamestate data
function emitGameState(roomID, state) {
	io.sockets.in(roomID).emit('gamestate', JSON.stringify(state));
}

// Emit 'gameover' event with winner number
function emitGameOver(roomID, winner) {
	io.sockets.in(roomID).emit('gameover', JSON.stringify({ winner }));
}

io.listen(process.env.PORT || 3000);
