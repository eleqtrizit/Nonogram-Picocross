"use strict";

var flexBasisCache;
var target = {};

var gameBoardOrig = {
	name: "",
	grid: [], // ultimately a 3d grid
	rowStreaks: [], // [i]=[]
	colStreaks: [], // [i]=[]
	totalUsedSquares: 0,
	length: 0
};

var gameBoard = {};

// by making an object we can add properties later without breaking
// existing code
var square = {
	isUsed: false,
	isDisplayed: false
};

function edit(l) {
	generateGrid(l);
	createGameBoardHTML(l);
	// activate resave options
	document.getElementById("save").style.display = "inline";
	document.getElementById("resave").style.display = "none";
	document.getElementById("boardName").readOnly = false;
	document.getElementById("boardName").value = "";
	document.getElementById("backCreate").style.display = "block";
	document.getElementById("backEdit").style.display = "none";
	activateSection("editor");
}

function displayLevels() {
	postData({}, "/list_levels.php", function(data) {
		let list = document.getElementById("list");
		list.innerHTML = "";
		for (let i = 0; i < data.length; i++) {
			let d = document.createElement("div");
			d.innerHTML = data[i].name;
			d.innerHTML += ", size: " + data[i].gridType;
			d.onclick = function() {
				loadLevel(data[i].id);
			};
			d.style = "cursor: pointer";
			list.appendChild(d);
		}
		console.log(data);
	});
	activateSection("displayLevels");
}

function loadLevel(id) {
	let post = {
		id: id
	};
	postData(post, "/get_level.php?", function(data) {
		gameBoard = JSON.parse(data[0].levelblob);
		console.log(gameBoard);
		createGameBoardHTML(gameBoard.length, true);
		// activate resave options
		document.getElementById("save").style.display = "none";
		document.getElementById("resave").style.display = "inline";
		document.getElementById("boardName").readOnly = true;
		document.getElementById("boardName").value = gameBoard.name;
		document.getElementById("backCreate").style.display = "none";
		document.getElementById("backEdit").style.display = "block";
		document.getElementById("resave").onclick = function() {
			saveToServer(id);
		};
		activateSection("editor");
	});
}

function generateGrid(l) {
	gameBoard = copyObject(gameBoardOrig);
	let row = [];
	let totalSquaresUsed = 0;
	row.length = l;
	for (let i = 0; i < l; i++) {
		let col = [];
		col.length = l;
		for (let j = 0; j < l; j++) {
			col[j] = copyObject(square);
		}
		row[i] = col;
	}
	gameBoard.grid = row;
	gameBoard.totalUsedSquares = totalSquaresUsed;
	gameBoard.length = l;
	showGridInConsole();
}

// this seems redudant now but future features might add to this
function createGameBoardHTML(length) {
	let board = document.getElementById("board");
	board.innerHTML = "";
	let l = gameBoard.length + 1;
	let width = 100 / (l - 1);
	flexBasisCache = "flex-basis: calc(" + width + "% - 4px);";

	for (let i = 0; i < l; i++) {
		for (let j = 0; j < l; j++) {
			if (i === 0 || j === 0) {
				continue;
			}
			var square = document.createElement("div");
			square.id = i + "|" + j;
			square.className = "square";

			square.onclick = function() {
				pushSquare(i, j);
			};

			if (gameBoard.grid[i - 1][j - 1].isUsed) {
				square.style = flexBasisCache + "background-color: green";
			} else {
				square.style = flexBasisCache;
			}

			var sqContent = document.createElement("div");
			sqContent.className = "content";
			square.appendChild(sqContent);
			board.appendChild(square);
		}
	}

	// rebuild targets
	buildIdTargets();
}

function pushSquare(i, j) {
	console.log(i + " " + j);
	let x = i - 1;
	let y = j - 1;
	console.log(gameBoard.grid[x][y].isUsed);
	if (gameBoard.grid[x][y].isUsed) {
		gameBoard.grid[x][y].isUsed = false;
		target[i + "|" + j].style = flexBasisCache + "background-color: black";
	} else {
		gameBoard.grid[x][y].isUsed = true;
		target[i + "|" + j].style = flexBasisCache + "background-color: green";
	}
}

function countStreaks() {
	let l = gameBoard.grid[0].length;
	for (let i = 0; i < l; i++) {
		let colStreak = 0;
		let rowStreak = 0;
		let colStreaks = [];
		let rowStreaks = [];
		for (let j = 0; j < l; j++) {
			// cols
			// count up the consecutive marked spaces
			if (gameBoard.grid[i][j].isUsed === true) {
				colStreak++;
			} else {
				// streak of marked spaces ended, push to array
				if (colStreak > 0) {
					colStreaks.push(colStreak);
					colStreak = 0;
				}
			}

			// rows   just swap j and i - genius!
			// count up the consecutive marked spaces
			if (gameBoard.grid[j][i].isUsed === true) {
				rowStreak++;
			} else {
				// streak of marked spaces ended, push to array
				if (rowStreak > 0) {
					rowStreaks.push(rowStreak);
					rowStreak = 0;
				}
			}
		}
		// check for last streaks
		if (colStreak > 0) {
			colStreaks.push(colStreak);
		}
		if (rowStreak > 0) {
			rowStreaks.push(rowStreak);
		}

		// makes multidimensional arrays e.g. colStreaks[0]=[]
		gameBoard.colStreaks[i] = colStreaks;
		gameBoard.rowStreaks[i] = rowStreaks;
	}
}

function saveToServer(id = "") {
	countStreaks();
	let boardName = document.getElementById("boardName").value;
	boardName = boardName.replace(/("|')/g, ""); // no quotes in the name, thanks
	gameBoard.name = boardName;
	let obj = {
		gameBoard: gameBoard,
		boardName: boardName,
		length: gameBoard.length
	};

	let url = "/save_level.php"; // default

	if (id.length > 0) {
		url = "/resave_level.php";
		obj.id = id;
	}

	postData(
		obj,
		url,
		function() {
			activateSection("saved");
		},
		function() {
			activateSection("error");
		}
	);
}

function reload() {
	console.log("reload!");
	location.reload();
}

function activateSection(id, delayUntilChangover = 0) {
	console.log("Activating section: " + id);

	let changeOver = function() {
		let c = main.children;
		for (let i = 0; i < c.length; i++) {
			if (c[i].id !== "")
				document.getElementById(c[i].id).style.display = "none";
		}
		document.getElementById(id).style.display = "inline";
	};

	setTimeout(changeOver, delayUntilChangover);
}

// ---------------- utility functions
function copyObject(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function buildIdTargets() {
	let ts = document.querySelectorAll("*[id]");
	target = {};
	for (let i = 0; i < ts.length; i++) {
		target[ts[i].id] = ts[i];
	}
	var main = document.getElementById("main");
	var audios = document.getElementById("audios");
	var videos = document.getElementById("videos");
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

// ----------------- debug helpers
function showGridInConsole() {
	let l = gameBoard.grid[0].length;
	console.log("Gameboard Stats -- ");
	console.log("Diff: " + gameBoard.diff);
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
