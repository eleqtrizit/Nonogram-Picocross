"use strict";

var slider = document.getElementById("myDiff");
var difficulty = slider.value; // medium default
var timerSeconds = 0;
var target = {};
var fromId = 'welcome';

var gameBoard = {
	grid: [], // ultimately a 3d grid
	rowStreaks: [], // [i]=[]
	colStreaks: [], // [i]=[]
	diff: 50, // default
	totalUsedSquares: 0,
	length: 0
};

// by making an object we can add properties later without breaking
// existing code
var square = {
	isUsed: false,
	isDisplayed: false
};

function welcomeScreenGo(){
	playSound('menuSelect');
	flashText('welcomeScreenGo'); 
	activateSection('menu',500);
}

function startGame(length) {
	generateGrid(length);
	createGameBoardHTML(length);
	elementsOnGrid();
	playSound('menuSelect');
	flashText('startGame'+length);
    activateSection("play",500);
    activateVideoBG('none');
	startTimer();
}

function elementsOnGrid() {
	document.getElementById("elementsOnGrid").innerHTML =
		"Elements on Grid: " + gameBoard.length * gameBoard.length;
}

function startTimer() {
	document.getElementById("timer").innerHTML = "Timer: " + timerSeconds;
	setInterval(function() {
		timerSeconds++;
		document.getElementById("timer").innerHTML = "Timer: " + timerSeconds;
	}, 1000);
}

function setGameDifficulty(_difficulty) {
	difficulty = _difficulty;
}

// this seems redudant now but future features might add to this
function createGameBoardHTML(length) {
	let board = document.getElementById("board");
	let l = gameBoard.length + 1; // +1 for hints areas
	let width = 100 / l;

	for (let i = 0; i < l; i++) {
		for (let j = 0; j < l; j++) {
			var square = document.createElement("div");
			square.id = i + "|" + j;
			square.className = "square";
			square.style = "flex-basis: calc(" + width + "% - 4px);";

			var sqContent = document.createElement("div");
			sqContent.className = "content";
			square.appendChild(sqContent);
			board.appendChild(square);
		}
	}
}

function generateGrid(l) {
	let row = [];
	let totalSquaresUsed = 0;
	row.length = l;
	for (let i = 0; i < l; i++) {
		let col = [];
		col.length = l;
		for (let j = 0; j < l; j++) {
			col[j] = copyObject(square);
			if (isUsedSquare()) {
				col[j].isUsed = true;
				totalSquaresUsed++;
			}
			col[j].isUsed = isUsedSquare();
		}
		row[i] = col;
	}
	gameBoard.grid = row;
	gameBoard.totalUsedSquares = totalSquaresUsed;
	gameBoard.diff = difficulty;
	gameBoard.length = l;
	showGridInConsole();
	countStreaks();
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
			if (gameBoard.grid[i][j].isUsed == true) {
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
			if (gameBoard.grid[j][i].isUsed == true) {
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

slider.oninput = function() {
	difficulty = this.value;
};

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

function activateVideoBG(id) {
	console.log("Activating background video: " + id);
    let videos = document.getElementById("videos");
    let c = videos.children;
	for (let i = 0; i < c.length; i++) {
        console.log(c[i].id);
		if (c[i].id != "")
			document.getElementById(c[i].id).style.display = "none";
	}

    if (id !== 'none') {
        document.getElementById(id).style.display = "inline";
    }
	
}

function activateSection(id, delayUntilChangover = 0) {
	console.log("Activating section: " + id);

	let changeOver = function(){
		let main = document.getElementById("main");
		let c = main.children;
		for (let i = 0; i < c.length; i++) {
			if (c[i].id != "")
				document.getElementById(c[i].id).style.display = "none";
		}
		document.getElementById(id).style.display = "inline";
	}

	setTimeout(changeOver, delayUntilChangover);
	fromId=id;
}

function init() {
	// preload for performance
	buildIdTargets(); 
	// begin
	activateSection("welcome");
}

function buildIdTargets() {
	let ts = document.querySelectorAll('*[id]');
	for (let i=0; i<ts.length; i++){
		target[ts[i].id] = ts[i];
	}
}


// ---------------- animations
function flashText(id,animDelay=50,repeat=1){

	setTimeout(function(){
		target[id].className='flash1';
	}, 0);
	setTimeout(function(){
		target[id].className='flash2';
	}, animDelay*1);
	setTimeout(function(){
		target[id].className='flash3';
	}, animDelay*2);
	setTimeout(function(){
		target[id].className='flash4';
	}, animDelay*3);
	setTimeout(function(){
		if (repeat>0){
			repeat--;
			console.log(repeat);
			flashText(id,animDelay,repeat);
		}
	}, animDelay*4);
}

// ---------------- utility functions
function copyObject(obj) {
	return JSON.parse(JSON.stringify(obj));
}

// ----------------- audio routines
function playSound(id){
	const audios = document.getElementById('audios');
	let c = audios.children;
	for (let i=0; i<c.length; i++){
		if (c[i].id===id){
			console.log(c[i]);
			let audio = c[i];
			if (!audio) return;
			audio.currentTime = 0;
			audio.play();
		}
	}
	
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
			colText += gameBoard.grid[i][j].isUsed;
			colText += " ";
		}
		console.log(colText);
	}
}

init();
