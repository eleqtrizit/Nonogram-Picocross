"use strict";

var timerSeconds = 0;
var target = {};
var fromId = "welcome";
var pushMode = "marked"; // alternative is X'ed, to indicate to mark
var flexBasisCache;
var turnCount = -1;
var errorCount = -1;
var successBlockColor = "background-color: cyan;";
var errorBlockColor = "background-color: red;";
var level = 0;
var levelData = {};
var maxErrors = 5;

var noop = function() {}; // do nothing.

var gameBoard = {
	name: "",
	grid: [], // ultimately a 3d grid
	rowStreaks: [], // [i]=[]
	colStreaks: [], // [i]=[]
	totalUsedSquares: 0,
	length: 0
};

// by making an object we can add properties later without breaking
// existing code
var square = {
	isUsed: false,
	isDisplayed: false
};

function resetBoard() {
	timerSeconds = 0;
	turnCount = -1;
	errorCount = -1;
}

function beginLoading() {
	preLoad();
	playSound("menuMusic");
	playSound("menuSelect");
	flashText("startGame");
	activateSection("menu", 500);
}

function startGame(length) {
	loadLevels(length, function() {
		resetBoard();
		chooseLevel();
		createGameBoardHTML(length);
		writeColStreaksToGrid();
		writeRowStreaksToGrid();
		elementsOnGrid();
		stopSound("menuMusic");
		playSound("menuSelect");
		flashText("startGame" + length);
		activateSection("play", 500);
		activateVideoBG("none");

		console.log(gameBoard);
		startTimer();
		updateTurns();
		updateErrors();
	});
}

function nextLevel() {
	resetBoard();
	chooseLevel();
	createGameBoardHTML(length);
	writeColStreaksToGrid();
	writeRowStreaksToGrid();
	elementsOnGrid();
	stopAllSound();
	playSound("menuSelect");
	flashText("nextLevel");
	activateSection("play", 500);
	activateVideoBG("none");

	console.log(gameBoard);
	startTimer();
	updateTurns();
	updateErrors();
}

function backToMenu() {
	stopAllSound();
	playSound("menuSelect");

	activateSection("menu", 500, function() {
		playSound("menuMusic");
		activateVideoBG("openingVid.gif");
	});
}

function loserToMenu() {
	flashText("loserToMenu");
	backToMenu();
}

function gotoSettings() {
	activateVideoBG("none");
	activateSection("settings");
}

function elementsOnGrid() {
	target["elementsOnGrid"].innerHTML =
		"Elements on Grid: " + gameBoard.length * gameBoard.length;
}

function startTimer() {
	target["timer"].innerHTML = "Timer: " + timerSeconds;
	setInterval(function() {
		timerSeconds++;
		target["timer"].innerHTML = "Timer: " + timerSeconds;
	}, 1000);
}

function setGameDifficulty(_difficulty) {
	difficulty = _difficulty;
}

function updateTurns() {
	target["turns"].innerHTML = "Turns: " + ++turnCount;
}

function updateErrors() {
	target["errors"].innerHTML = "Errors: " + ++errorCount;
}

function activateVideoBG(gif) {
	if (gif === "none") {
		document.body.style.backgroundImage = "";
	} else {
		document.body.style.backgroundImage = "url('assets/" + gif + "')";
		document.body.style.backgroundRepeat = "no-repeat";
		document.body.style.backgroundSize = "100% 100%";
	}
}

function activateVideoBGold(id) {
	console.log("Activating background video: " + id);
	let c = videos.children;
	for (let i = 0; i < c.length; i++) {
		if (c[i].id !== "") target[c[i].id].style.display = "none";
	}

	if (id !== "none") {
		target[id].style.display = "inline";
	}
}

function activateSection(id, delayUntilChangover = 0, callback = noop) {
	console.log("Activating section: " + id);

	let changeOver = function() {
		let c = main.children;
		for (let i = 0; i < c.length; i++) {
			if (c[i].id !== "")
				document.getElementById(c[i].id).style.display = "none";
		}
		document.getElementById(id).style.display = "inline";
		callback();
	};

	setTimeout(changeOver, delayUntilChangover);
	fromId = id;
}

function pushSquare(i, j) {
	console.log(i + " " + j);

	// ignore pushes on the left and top edge boxes
	if (i === 0 || j === 0) {
		return;
	}
	let x = i - 1;
	let y = j - 1;

	console.log(gameBoard.grid[x][y].isDisplayed);
	// button already pressed
	if (gameBoard.grid[x][y].isDisplayed === true) {
		return;
	}

	updateTurns();
	if (pushMode === "marked") {
		if (gameBoard.grid[x][y].isUsed) {
			gameBoard.grid[x][y].isDisplayed = true;
			target[i + "|" + j].style = flexBasisCache + successBlockColor;
			target["rightSound"].play();
		} else {
			updateErrors();
			gameBoard.grid[x][y].isDisplayed = true;
			target[i + "|" + j].style = flexBasisCache + errorBlockColor;
			if (errorCount < maxErrors) {
				target["wrongSound"].play();
			}
		}
	}

	isGameOver();
}

function isGameOver() {
	document.getElementById("youLost").style.display = "none";
	document.getElementById("youWon").style.display = "none";

	console.log(errorCount);
	if (errorCount === maxErrors) {
		playSound("levelLost");
		document.body.className = "levelLost";
		console.log("Gamer lost");
		document.getElementById("youLost").style.display = "block";
		activateSection("gameOver", 1000, function() {
			playSound("gameLost");
			activateVideoBG("gameLost.gif");
		});
		return true;
	}

	// scan the board and see if all the squares are clicked
	// if so, gamer won!
	let l = gameBoard.grid[0].length;
	for (let i = 0; i < l; i++) {
		for (let j = 0; j < l; j++) {
			if (gameBoard.grid[i][j].isUsed) {
				if (!gameBoard.grid[i][j].isDisplayed) {
					return false;
				}
			}
		}
	}

	// gamer won sequence
	document.getElementById("youWon").style.display = "block";
	level++; // next board
	// all levels have been won!
	console.log(level);
	console.log(levelData.length);
	document.body.className = "levelWon";
	playSound("levelWon");

	if (level === levelData.length) {
		activateSection("rollCredits", 1000, function() {
			activateVideoBG("gameWonAll.gif");
			document.body.className = "";
			rollCredits();
		});
	} else {
		activateSection("gameOver", 1000, function() {
			playSound("gameWon" + level);
			activateVideoBG("gameWon" + level + ".gif");
			document.body.className = "";
		});
	}

	return true;
}

function rollCredits() {
	let credits = [
		"Congrats!<br>You beat the game!",
		"This has been an<br>Agustin Rivera<br>production",
		"Game Design:<br><br>A. Rivera",
		"Graphic Design:<br><br>Agustin R.",
		"Coding:<br><br>Augi Rivera",
		"Lead Programmer:<br><br>A.J. Rivera",
		"Costume Design:<br><br>A. Jesus Rivera",
		"Special<br>Thanks To:<br><br>Coffee",
		"Background<br>Design:<br><br>Google Images",
		"Special<br>Coding<br>Thanks To:<br><br>Stack Overflow<br><br>w3schools",
		"Sound Effects:<br><br>BassGorilla.com<br><br>Woolyss.com<br><br>OpenGameArt.org",
		"Music:<br><br>Disco Fever<br>Fortnite",
		"Music:<br><br>Lose Yourself<br>Eminem",
		"Music:<br><br>Round and Round<br>Ratt",
		"Music:<br><br>Fantastic Voyage<br>Lakeside",
		"Music:<br><br>Rock the Casbah<br>The Clash",
		"No freshmen were harmed in the making of this game"
	];
	let i = 0;
	target["showCredits"].innerHTML = credits[i++];

	playSound("gameWonAll");
	let interval = setInterval(function() {
		console.log(i);
		target["showCredits"].innerHTML = credits[i++];
		if (i == credits.length) {
			target["showCredits"].innerHTML = "";
			clearInterval(interval);
			resetBoard();
			let d = document.createElement("div");
			d.innerHTML = "Thanks for playing.<br><br><br><br>Back to the menu";
			d.onclick = function() {
				level = 0;
				activateVideoBG("openingVid.gif");
				stopAllSound();
				playSound("menuMusic");
				activateSection("menu");
			};
			target["showCredits"].appendChild(d);
		}
	}, 1860); // why 1860?? syncs to the music :D
}

// ---------------- settings
function setGrid(colour) {
	target["board"].style.color = colour;
	let t = "grid" + colour;
	// clear previous underlines before setting a new one
	let c = target["gridoptions"].children;
	for (let i = 0; i < c.length; i++) {
		c[i].style.textDecoration = "none";
	}
	target[t].style.textDecoration = "underline";
	switch (colour) {
		case "cyan":
			document.body.style.background = "#000033";
			break;
		case "yellow":
			document.body.style.background = "#222200";
			break;
		case "fuchsia":
			document.body.style.background = "#10003b";
			break;
		case "crimson":
			document.body.style.background = "#110000";
			break;
		case "darkorange":
			document.body.style.background = "#111100";
			break;
		case "limegreen":
			document.body.style.background = "#001100";
			break;
		default:
			document.body.style.background = "#10003b";
	}
}

function setSuccess(colour) {
	let t = "block" + colour;
	// clear previous underlines before setting a new one
	let c = target["blockoptions"].children;
	for (let i = 0; i < c.length; i++) {
		c[i].style.textDecoration = "none";
	}

	target[t].style.textDecoration = "underline";
	successBlockColor = "background-color: " + colour + ";";
}

function setError(colour) {
	let t = "error" + colour;
	// clear previous underlines before setting a new one
	let c = target["erroroptions"].children;
	for (let i = 0; i < c.length; i++) {
		c[i].style.textDecoration = "none";
	}

	target[t].style.textDecoration = "underline";
	errorBlockColor = "background-color: " + colour + ";";
}

// ---------------- board generation
function writeColStreaksToGrid() {
	for (let i = 0; i < gameBoard.colStreaks.length; i++) {
		let t = "";
		for (let j = 0; j < gameBoard.colStreaks[i].length; j++) {
			t += gameBoard.colStreaks[i][j] + " ";
		}
		let offset = i + 1;
		let id = offset + "|0";
		if (t.length === 0) {
			target[id].children[0].innerHTML = 0;
		} else {
			target[id].children[0].innerHTML = t;
		}
	}
}

function writeRowStreaksToGrid() {
	for (let i = 0; i < gameBoard.rowStreaks.length; i++) {
		let t = "";
		for (let j = 0; j < gameBoard.rowStreaks[i].length; j++) {
			t += gameBoard.rowStreaks[i][j] + "<br>";
		}
		let offset = i + 1;
		let id = "0|" + offset;
		target[id].children[0].innerHTML = t;
		target[id].children[0].className = "top-row";
	}
}

// this seems redudant now but future features might add to this
function createGameBoardHTML(length) {
	let board = document.getElementById("board");
	board.innerHTML = "";
	let l = gameBoard.length + 1; // +1 for hints areas
	let width = 100 / l;
	flexBasisCache = "flex-basis: calc(" + width + "% - 4px);";

	for (let i = 0; i < l; i++) {
		for (let j = 0; j < l; j++) {
			var square = document.createElement("div");
			square.id = i + "|" + j;
			square.className = "square";
			square.style = flexBasisCache;

			square.onclick = function() {
				pushSquare(i, j);
			};

			var sqContent = document.createElement("div");
			sqContent.className = "content";
			square.appendChild(sqContent);
			board.appendChild(square);
		}
	}

	// rebuild targets
	buildIdTargets();
}

function loadLevels(gridType, callback) {
	let post = {
		gridType: gridType
	};
	postData(post, "/get_level_type.php?", function(data) {
		//console.log(data);
		levelData = data;
		callback();
	});
}

function chooseLevel() {
	console.log(levelData[0]);
	gameBoard = JSON.parse(levelData[level].levelblob);
}

function postData(obj, url, callback) {
	var data = {};
	data = JSON.stringify(obj);
	console.log("data to post:");
	console.log(data);

	// Sending and receiving data in JSON format using POST method
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				var json = JSON.parse(xhr.responseText);
				callback(json);
			} else {
				activateSection("error");
			}
		}
	};
	xhr.send(data);
}

// ---------------- initialization and preloading

function init() {
	// preload for performance and almost must come first!
	buildIdTargets();
	// set initial color scheme
	setGrid("fuchsia");

	//target["openingVid"].play();
	activateVideoBG("openingVid.gif");

	// begin
	activateSection("welcomeScreenGo");

	// deactivate the 13x13 grid for mobile devices
	var iOS =
		!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
	var android = !!navigator.platform && /android/.test(navigator.platform);
	if (iOS || android) {
		target["startGame13"].style.display = "none";
	}
}

var audioFiles = ["assets/DiscoFever.mp3", "assets/sfx_menu_select4_short.mp3"];

function preLoad() {
	for (var i in audioFiles) {
		preloadAudio(audioFiles[i]);
	}
}

function preloadAudio(url) {
	var audio = new Audio();
	// once this file loads, it will call loadedAudio()
	// the file will be kept by the browser as cache
	audio.addEventListener("canplaythrough", loadedAudio, false);
	audio.src = url;
}

var loaded = 0;
function loadedAudio() {
	// this will be called every time an audio file is loaded
	// we keep track of the loaded files vs the requested files
	loaded++;
	if (loaded === audioFiles.length) {
		// all have loaded
	}
}

function buildIdTargets() {
	let ts = document.querySelectorAll("*[id]");
	target = {};
	for (let i = 0; i < ts.length; i++) {
		target[ts[i].id] = ts[i];
	}
	var main = document.getElementById("main");
	var audios = document.getElementById("audios");
}

// ---------------- animations
function flashText(id, animDelay = 50, repeat = 1) {
	setTimeout(function() {
		target[id].className = "flash1";
	}, 0);
	setTimeout(function() {
		target[id].className = "flash2";
	}, animDelay * 1);
	setTimeout(function() {
		target[id].className = "flash3";
	}, animDelay * 2);
	setTimeout(function() {
		target[id].className = "flash4";
	}, animDelay * 3);
	setTimeout(function() {
		if (repeat > 0) {
			repeat--;
			console.log(repeat);
			flashText(id, animDelay, repeat);
		} else {
			target[id].className = "";
		}
	}, animDelay * 4);
}

// ---------------- utility functions
function copyObject(obj) {
	return JSON.parse(JSON.stringify(obj));
}

// ----------------- audio routines
function playSound(id) {
	console.log(id);
	target[id].pause();
	if (!target[id]) return;
	target[id].currentTime = 0;
	target[id].play();
}

function stopSound(id) {
	target[id].pause();
	target[id].currentTime = 0;
}

function stopAllSound() {
	let c = document.getElementById("audios").children;
	for (let i = 0; i < c.length; i++) {
		stopSound(c[i].id);
	}
}

// ----------------- debug helpers
function showGridInConsole() {
	let l = gameBoard.grid[0].length;
	console.log("Gameboard Stats -- ");
	console.log("Used Squares: " + gameBoard.totalUsedSquares);
	for (let i = 0; i < l; i++) {
		let colText = "";
		for (let j = 0; j < l; j++) {
			if (gameBoard.grid[i][j].isUsed) {
				colText += "T ";
			} else {
				colText += "F ";
			}
		}
		console.log(colText);
	}
}

init();
