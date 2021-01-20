const socket = io('localhost:3000/');

// Constants
const BG_COLOUR = '#231f20';
const CYCLE_COLOUR_1 = '#ef4040';
const CYCLE_COLOUR_2 = '#3a34e2';

// Global Variables
let canvas, ctx;
let playerNumber; // Used to determine game over display
let isGameActive = false;

// DOM Elements
const initialView = document.getElementById('initial-view');
const gameView = document.getElementById('game-view');
const gameCodeInput = document.getElementById('game-code-input');
const newGameButton = document.getElementById('new-game-button');
const joinGameButton = document.getElementById('join-game-button');
const gameCodeDisplay = document.getElementById('game-code-display');
const playerNumberDisplay = document.getElementById('player-number-display');

// DOM Event Listeners
newGameButton.addEventListener('click', newGame);
joinGameButton.addEventListener('click', joinGame);

// Socket event listeners
socket.on('playernumber', handlePlayerNumber);
socket.on('countdown', handleCountdown);
socket.on('gamestate', handleGameState);
socket.on('gameover', handleGameOver);
socket.on('gamecode', handleGameCode);
socket.on('unknowngame', handleUnknownGame);
socket.on('toomanyplayers', handleTooManyPlayers);

// Initialize game view and controls
function init() {
	// Display game view
	initialView.style.display = 'none';
	gameView.style.display = 'block';

	// Inititalize canvas size and color
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	canvas.height = 800;
	canvas.width = 800;
	ctx.fillStyle = BG_COLOUR;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	document.addEventListener('keydown', keydown);
	isGameActive = true;
}

//====================
// RENDER FUNCTIONS
//====================
// Paint a new frame
function paintGame(state) {
	ctx.fillStyle = BG_COLOUR;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const gridsize = state.gridsize;
	const size = canvas.width / gridsize;

	paintPlayer(state.players[0], size, CYCLE_COLOUR_1);
	paintPlayer(state.players[1], size, CYCLE_COLOUR_2);
}

function paintPlayer(playerState, size, colour) {
	const cycle = playerState.cycle;
	ctx.fillStyle = colour;

	for (let cell of cycle) {
		ctx.fillRect(cell.x * size, cell.y * size, size, size);
	}
}

//====================
// SOCKET EVENT HANDLERS
//====================
// Receives gamestate and calls for new animation frame
function handleGameState(gameState) {
	if (!isGameActive) return;

	gameState = JSON.parse(gameState);

	requestAnimationFrame(() => paintGame(gameState));
}

// Receives winner number, ends the game, and displays winner
function handleGameOver(data) {
	if (!isGameActive) return;

	data = JSON.parse(data);

	if (data.winner === playerNumber) {
		alert('WIN');
	} else {
		alert('LOSE');
	}
	isGameActive = false;
}

// Receives game code and displays it in the DOM
function handleGameCode(gameCode) {
	gameCodeDisplay.innerText = gameCode;
}

// Sets player number
function handlePlayerNumber(number) {
	playerNumber = parseInt(number);
	playerNumberDisplay.innerText = `Player ${playerNumber}`;
	if (playerNumber === 1) playerNumberDisplay.style.color = CYCLE_COLOUR_1;
	if (playerNumber === 2) playerNumberDisplay.style.color = CYCLE_COLOUR_2;
}

// Displays countdown number up to game start
function handleCountdown(number) {
	ctx.fillStyle = BG_COLOUR;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.textAlign = 'center';

	ctx.fillStyle = '#FFFFFF';
	ctx.font = '72px Arial';
	ctx.fillText(number, 400, 400);
}

// Handle invalid game codes
function handleUnknownGame() {
	reset();
	alert('Unknown game code');
}

// Handle full rooms
function handleTooManyPlayers() {
	reset();
	alert('This game is already in progress.');
}

// Resets view to the create/join view
function reset() {
	playerNumber = null;
	gameCodeInput.value = '';
	gameCodeDisplay.innerText = '';
	playerNumberDisplay.innerText = '';
	initialView.style.display = 'block';
	gameView.style.display = 'none';
}

//====================
// DOM EVENT HANDLERS
//====================

function newGame() {
	socket.emit('newgame');
	init();
}

function joinGame() {
	const gameCode = gameCodeInput.value;
	socket.emit('joingame', gameCode);
	init();
}

function keydown(event) {
	socket.emit('keydown', event.keyCode);
}
