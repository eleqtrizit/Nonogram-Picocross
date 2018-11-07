"use strict";

var flexBasisCache;

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

var difficulty = 50;

function generateRandomGrid() {
	let l = gameBoard.grid.length;
	let row = [];
	let totalSquaresUsed = 0;
	row.length = l;
	for (let i = 0; i < l; i++) {
		let col = [];
		col.length = l;
		for (let j = 0; j < l; j++) {
			col[j] = copyObject(square);
			//document.getElementById(i + "|" + j + 1).style = flexBasisCache + "background-color: black";
			if (isUsedSquare()) {
				col[j].isUsed = true;
				totalSquaresUsed++;
			}
		}
		row[i] = col;
	}
	gameBoard.grid = row;
	gameBoard.totalUsedSquares = totalSquaresUsed;
	gameBoard.diff = difficulty;
	gameBoard.length = l;
	showGridInConsole();
	countStreaks();
	createGameBoardHTML();
}

function isUsedSquare() {
	// randomize the usage of a square, plus add some difficulty from the slider
	let p = Math.floor(Math.random() * 100) / 100;
	let squareCutoff = difficultyMarkup() / 100;
	if (p < squareCutoff) {
		return false;
	} else {
		return true;
	}
}

function difficultyMarkup() {
	// don't let difficulty get too low or high
	let diff = 50;
	if (difficulty < 25) {
		diff = 25;
	} else if (difficulty > 75) {
		diff = 75;
	} else {
		diff = difficulty;
	}
	return diff;
}

function edit(l) {
	generateGrid(l);
	createGameBoardHTML();
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
		createGameBoardHTML();
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
function createGameBoardHTML() {
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
}

function pushSquare(i, j) {
	let x = i - 1;
	let y = j - 1;
	if (gameBoard.grid[x][y].isUsed) {
		gameBoard.grid[x][y].isUsed = false;
		document.getElementById(i + "|" + j).style = flexBasisCache + "background-color: black";
	} else {
		gameBoard.grid[x][y].isUsed = true;
		document.getElementById(i + "|" + j).style = flexBasisCache + "background-color: green";
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
			if (c[i].id !== "") document.getElementById(c[i].id).style.display = "none";
		}
		document.getElementById(id).style.display = "inline";
	};

	setTimeout(changeOver, delayUntilChangover);
}

// ---------------- utility functions
function copyObject(obj) {
	return JSON.parse(JSON.stringify(obj));
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

function uploadImage() {
	let imgAddr = document.getElementById("imageURL").value;
	imageWorks(imgAddr, gameBoard.grid[0].length);
	document.getElementById("imageURL").value = "";
}

function imageWorks(imgAddr, l) {
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	let img = new Image();
	img.crossOrigin = "Anonymous";
	//img.src = "/assets/Mario.png";
	//img.src = "https://vignette.wikia.nocookie.net/mario/images/3/32/8_Bit_Mario.png/revision/latest?cb=20120602231304";
	//img.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Emacs_Tetris_vector_based_detail.svg/200px-Emacs_Tetris_vector_based_detail.svg.png";
	img.src = imgAddr;

	function getPixel(x, y) {
		// returns RGB and Alpha
		return ctx.getImageData(x, y, 1, 1).data;
	}

	function getImageAverage() {
		let count = 0;
		let total = 0;
		for (let i = 0; i < l; i++) {
			for (let j = 0; j < l; j++) {
				let p = getPixel(i, j);
				total += p[0] + p[1] + p[2] + p[3];
				count++;
			}
		}
		let avg = total / count;
		return avg;
	}

	function processImage() {
		let avg = getImageAverage();
		generateGrid(l);
		for (let i = 0; i < l; i++) {
			for (let j = 0; j < l; j++) {
				let p = getPixel(j, i);
				let total = p[0] + p[1] + p[2] + p[3];
				if (total >= avg) {
					gameBoard.grid[i][j].isUsed = true;
				}
			}
		}
	}

	// will trigger automatically when the imageworks is called and the image has loaded
	img.onload = function() {
		var oc = document.createElement("canvas"),
			octx = oc.getContext("2d");

		oc.width = l; // needed for the canvas
		oc.height = l; // needed for the canvas

		octx.drawImage(img, 0, 0, l, l);
		ctx.drawImage(oc, 0, 0, l, l);
		oc.style.display = "none";
		processImage();
		createGameBoardHTML();
		activateSection("editor");
	};
}
