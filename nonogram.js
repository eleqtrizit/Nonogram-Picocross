"use strict";

var timerSeconds = 0;
var target = {};
var fromId = "welcome";
var pushMode = "marked"; // alternative is X'ed, to indicate to mark
var flexBasisCache;
var turnCount = -1;
var errorCount = 0;
var successBlockColor = "background-color: cyan;";
var errorBlockColor = "background-color: red;";
var level = 0;
var levelData = {};
var maxErrors = 5;
var countDown = 1800;
var arcadeTotalTime = 0;
var elementCount = 0;
var totalElementCount = 0;
var totalErrorCount = 0;
var foundElements = 0;
var reverseScoreList = false;

var noop = function() {}; // do nothing function to set as default callback

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
	turnCount = -1;
	errorCount = 0;
}

var sesh = {
	id: "",
	username: "",
	password: "",
	avatar: ""
};

var user = {};

function configureUserMenus() {
	console.log(user.username);
	if (
		typeof user !== "undefined" &&
		typeof user.username !== "undefined" &&
		user.username !== null &&
		user.username.length > 0
	) {
		document.getElementById("selectLogin").style.display = "none";
		document.getElementById("selectCreateUser").style.display = "none";
		document.getElementById("selectUploadAvatar").style.display = "block";
	} else {
		document.getElementById("selectLogin").style.display = "block";
		document.getElementById("selectCreateUser").style.display = "block";
		document.getElementById("selectUploadAvatar").style.display = "none";
	}

	// if user has avatar
	if (
		typeof user !== "undefined" &&
		typeof user.avatarpath !== "undefined" &&
		user.avatarpath !== null &&
		user.avatarpath.length > 0
	) {
		document.getElementById("avatarImage").innerHTML = "";
		let i = document.createElement("img");
		i.src = user.avatarpath;
		i.width = "200";
		document.getElementById("avatarImage").appendChild(i);
		document.getElementById("noAvatar").style.display = "none";
		document.getElementById("avatarImage").style.display = "block";
	} else {
		document.getElementById("noAvatar").style.display = "block";
		document.getElementById("avatarImage").style.display = "none";
	}
}

function login(obj = user, callback = noop) {
	if (typeof obj.username === "undefined") {
		loadStorage();
		obj = user;
	}

	if (typeof obj.username !== "undefined") {
		postData(obj, "login.php", function(data) {
			// we are not logged in. Destroy storage
			if (data.isLoggedIn === "false" || data.isLoggedIn === false) {
				console.log("User session has expired or password has changed.");
				user = {};
				saveStorage();
			} else {
				console.log("User is logged in.");
				user.id = data.id;
				user.username = data.username;
				user.password = data.password;
				user.avatarpath = data.avatarpath;
				saveStorage();
			}
			callback();
		});
	} else {
		user = {};
		saveStorage();
		callback();
	}
}

function loginUser() {
	let obj = {
		username: document.getElementById("username2").value,
		password: document.getElementById("password2").value
	};
	console.log(obj);
	login(obj, function() {
		configureUserMenus();
		activateSection("userLoggedIn");
	});
}

function getFileName() {
	var fullPath = document.getElementById("fileToUpload").value;
	if (fullPath) {
		var startIndex = fullPath.indexOf("\\") >= 0 ? fullPath.lastIndexOf("\\") : fullPath.lastIndexOf("/");
		var filename = fullPath.substring(startIndex);
		if (filename.indexOf("\\") === 0 || filename.indexOf("/") === 0) {
			filename = filename.substring(1);
		}
	}
}

function submitAvatar() {
	document.getElementById("uploadName").value = user.username;
	// use form element below to help check if the file upload is successful
	document.getElementById("fileName").value = getFileName();
	document.getElementById("avatarForm").submit();
	login();
}

function beginLoading() {
	loadStorage();
	preloadMedia();
	login({}, function() {
		configureUserMenus();
	});
	playSound("menuMusic");
	playSound("menuSelect");
	flashText("startGame");
	activateSection("menu", 500);
}

var selectedGameType = "";
function selectMode(gameType) {
	playSound("menuSelect");
	selectedGameType = gameType;
	flashText(gameType);
	activateSection("pickGrid", 500);
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

		//console.log(gameBoard);
		if (selectedGameType === "arcade") {
			startTimer();
		} else {
			startCountdown();
		}

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
	if (selectedGameType === "arcade") {
		startTimer();
	}

	updateTurns();
	updateErrors();
}

function resetToMenu(flashme = "") {
	clearParams();
	stopAllSound();
	login();
	if (flashme.length !== "") {
		flashText(flashme);
	}
	playSound("menuSelect");
	activateSection("menu", 500, function() {
		playSound("menuMusic");
		activateVideoBG("openingVid.gif");
	});
}

function loserToMenu() {
	resetToMenu("loserToMenu");
}

function tryAgain() {
	clearParams();
	playSound("menuSelect");
	flashText("tryAgain");
	activateSection("uploadAvatar", 500, function() {});
}

function selectUserFunctions() {
	playSound("menuSelect");
	flashText("noAvatar");
	activateSection("userFunctions", 500, function() {});
}

function selectUploadAvatar() {
	playSound("menuSelect");
	flashText("selectUploadAvatar");
	activateSection("uploadAvatar", 500, function() {});
}

function selectLogin() {
	playSound("menuSelect");
	flashText("selectLogin");
	activateSection("loginPage", 500, function() {});
}

function createUserMenu() {
	flashText("selectCreateUser");
	playSound("menuSelect");
	activateSection("createUser", 500, function() {
		stopSound("menuMusic");
		playSound("makeUser");
		activateVideoBG("none");
	});
}

function gotoSettings() {
	flashText("selectSettings");
	playSound("menuSelect");
	activateSection("settings", 500, function() {
		activateVideoBG("none");
	});
}

function gotoHelp() {
	flashText("selectHelp");
	playSound("menuSelect");
	activateSection("helpPage", 500, function() {
		activateVideoBG("none");
	});
}

var selectedSex = "";
function selectSex(sex) {
	let sexes = document.getElementById("gender").children;
	console.log(sexes);
	for (let i = 0; i < sexes.length; i++) {
		if (sexes[i].nodeName === "SPAN") {
			console.log(sexes[i].id);
			document.getElementById(sexes[i].id).style = "";
		}
	}
	document.getElementById(sex).style = "color:cyan";
	selectedSex = sex;
}

function createUser() {
	let problems = false;
	let checkFields = ["username", "password", "email", "firstname", "lastname", "age", "location"];
	let obj = {};

	for (const field of checkFields) {
		obj[field] = document.getElementById(field).value;

		document.getElementById(field).style = "";
		if (document.getElementById(field).value.length === 0) {
			document.getElementById(field).style = "border-color:red";
			console.log(field + " is empty");
			document.getElementById("incompleteForm").style.display = "block";
			problems = true;
		}
	}
	if (selectedSex.length === 0) {
		document.getElementById("male").style = "color:red";
		document.getElementById("female").style = "color:red";
		document.getElementById("other").style = "color:red";
		problems = true;
	} else {
		obj.gender = selectedSex;
	}

	if (problems === false) {
		console.log(obj);
		postData(obj, "create_user.php", function(data) {
			console.log(data);
			if (data[0].username.length === 0) {
				document.getElementById("incompleteForm").innerHTML = "Username already taken.";
			} else {
				// save user
				user = data[0];
				saveStorage();
				activateVideoBG("openingVid.gif");
				activateSection("userCreated");
			}
		});
	}
}

function userCreatedBackToMenu() {
	flashText("userCreatedContinue");
	flashText("userCreatedContinue2");
	playSound("menuSelect");
	activateSection("menu", 500);
}

function leaveSettings() {
	flashText("settingsLabel");
	playSound("menuSelect");
	activateSection("menu", 500, function() {
		activateVideoBG("openingVid.gif");
	});
}

function elementsOnGrid() {
	elementCount = 0;
	for (let i = 0; i < gameBoard.grid.length; i++) {
		for (let j = 0; j < gameBoard.grid.length; j++) {
			totalElementCount++;
			if (gameBoard.grid[i][j].isUsed) {
				elementCount++;
			}
		}
	}
	document.getElementById("elementsOnGrid").innerHTML =
		"Elem: " + foundElements + "|" + elementCount + "|" + totalElementCount;
}

var activeTimer;
function startTimer() {
	console.log("Starting timer");
	timerSeconds = 0;
	clearInterval(activeTimer);
	document.getElementById("timer").innerHTML = "Timer: " + timerSeconds;
	activeTimer = setInterval(function() {
		timerSeconds++;
		document.getElementById("timer").innerHTML = "Timer: " + timerSeconds;
	}, 1000);
}

function startCountdown() {
	console.log("Starting countdown");
	clearInterval(activeTimer);
	timerSeconds = countDown;
	document.getElementById("timer").innerHTML = "Timer: " + timerSeconds;
	activeTimer = setInterval(function() {
		timerSeconds--;
		document.getElementById("timer").innerHTML = "Timer: " + timerSeconds;
		if (timerSeconds === 0) {
			doGameOver();
		}
	}, 1000);
}

function setGameDifficulty(_difficulty) {
	difficulty = _difficulty;
}

function updateTurns() {
	document.getElementById("turns").innerHTML = "Turns: " + ++turnCount;
}

function updateErrors() {
	document.getElementById("errors").innerHTML = "Errors: " + errorCount + "/" + maxErrors;
}

function activateVideoBG(gif) {
	if (gif === "none") {
		document.body.style.backgroundImage = "";
	} else {
		document.body.style.backgroundImage = "url('assets/" + gif + "')";
		document.body.style.backgroundRepeat = "no-repeat";
		document.body.style.backgroundAttachment = "fixed";
		document.body.style.backgroundSize = "100% 100%";
	}
}

function activateVideoBGold(id) {
	console.log("Activating background video: " + id);
	let c = videos.children;
	for (let i = 0; i < c.length; i++) {
		if (c[i].id !== "") document.getElementById(c[i].id).style.display = "none";
	}

	if (id !== "none") {
		document.getElementById(id).style.display = "inline";
	}
}

// rotate the high scores at the main menu, just like an old arcade game would
function rotateHighScoresWithMainMenu() {
	let rotateSections = ["menu", "arcade7", "timetrial7", "arcade13", "timetrial13"];
	let rotateIndex = 0;
	// even though setInterval has its own timer, we don't want to accidently rotate away
	// from the main menu if we just got back to it.  Let's make sure we rotate only after a
	// certain amount of time
	let rotateCounter = 0;
	let rotateAt = 5; // rotate after x seconds here

	let rotator = setInterval(function() {
		if (activeSection !== "menu" && activeSection !== "scoreboardPage") {
			// this will make sure we're at fresh counter when going back to the menu
			rotateCounter = 0;
		} else {
			rotateCounter++;
			if (rotateCounter === rotateAt) {
				let currentSection = rotateSections[rotateIndex];
				rotateCounter = 0;
				if (currentSection === "menu") {
					activateSection("menu");
				} else if (currentSection === "arcade7") {
					showHighScores(7, "arcade");
				} else if (currentSection === "arcade13") {
					showHighScores(13, "arcade");
				} else if (currentSection === "timetrial7") {
					showHighScores(7, "timetrial");
				} else if (currentSection === "timetrial13") {
					showHighScores(13, "timetrial");
				}
				rotateIndex++;
				if (rotateIndex === rotateSections.length) {
					rotateIndex = 0;
				}
			}
		}
	}, 1000);
}

function updateHighScores(data, gridType, gameType) {
	document.getElementById("reverseScores").onclick = function() {
		reverseScoreList = !reverseScoreList;
		updateHighScores(data, gridType, gameType);
	};

	if (reverseScoreList) {
		data = data.reverse();
	}

	let scoreboard = document.getElementById("scoreboard");
	scoreboard.innerHTML = "";
	let scoretype = document.getElementById("scoreType");
	scoretype.innerHTML = "";

	if (gameType === "arcade") {
		scoretype.innerHTML = "Arcade ";
	} else {
		scoretype.innerHTML = "Time Trial ";
	}
	scoretype.innerHTML += gridType + "x" + gridType;

	let table = document.createElement("div");
	table.style = "display:table; width:100%";

	let tr = document.createElement("div");
	tr.style = "display:table-row; width: 100%; ";
	table.appendChild(tr);
	let usercell = document.createElement("div");
	usercell.style = "display:table-cell;width: 55%;";
	usercell.innerHTML = "Player";
	table.appendChild(usercell);

	if (gameType === "arcade") {
		let score = document.createElement("div");
		score.style = "display:table-cell;width: 45%;";
		score.innerHTML = "Score";
		table.appendChild(score);

		for (let i = 0; i < data.length; i++) {
			let tr = document.createElement("div");
			tr.style = "display:table-row; width: 100%; ";
			let usercell = document.createElement("div");
			usercell.style = "display:table-cell;width: 55%;";
			usercell.innerHTML = data[i].username;
			let score = document.createElement("div");
			score.style = "display:table-cell;width: 45%;";
			score.innerHTML = data[i].score;

			table.appendChild(tr);
			table.appendChild(usercell);
			table.appendChild(score);
		}
	} else if (gameType === "timetrial") {
		let time = document.createElement("div");
		time.style = "display:table-cell;width: 245%;";
		time.innerHTML = "Time";
		table.appendChild(time);

		for (let i = 0; i < data.length; i++) {
			let tr = document.createElement("div");
			tr.style = "display:table-row; width: 100%; ";
			let usercell = document.createElement("div");
			usercell.style = "display:table-cell;width: 55%;";
			usercell.innerHTML = data[i].username;
			let score = document.createElement("div");
			score.style = "display:table-cell;width: 45%;";
			score.innerHTML = data[i].duration;
			table.appendChild(tr);
			table.appendChild(usercell);
			table.appendChild(score);
		}
	}
	scoreboard.appendChild(table);
	activateSection("scoreboardPage");
}

function showHighScores(gridType, gameType) {
	// username,duration,errorcount,score,gameType
	let obj = {
		gridType: gridType,
		gameType: gameType
	};

	postData(obj, "get_scoreboard.php", function(data) {
		updateHighScores(data, gridType, gameType);
	});
}

var activeSection = "";
function activateSection(id, delayUntilChangover = 0, callback = noop) {
	console.log("Activating section: " + id);
	activeSection = id;

	let changeOver = function() {
		let c = main.children;
		for (let i = 0; i < c.length; i++) {
			if (c[i].id !== "") document.getElementById(c[i].id).style.display = "none";
		}
		document.getElementById(id).style.display = "inline";
		callback();
	};

	setTimeout(changeOver, delayUntilChangover);
	fromId = id;
}

function pushSquare(i, j) {
	// ignore pushes on the left and top edge boxes
	if (i === 0 || j === 0) {
		return;
	}
	let x = i - 1;
	let y = j - 1;

	// button already pressed
	if (gameBoard.grid[x][y].isDisplayed === true) {
		return;
	}

	updateTurns();
	if (pushMode === "marked") {
		if (gameBoard.grid[x][y].isUsed) {
			foundElements++;
			document.getElementById("elementsOnGrid").innerHTML =
				"Elem: " + foundElements + "|" + elementCount + "|" + totalElementCount;
			gameBoard.grid[x][y].isDisplayed = true;
			document.getElementById(i + "|" + j).style = flexBasisCache + successBlockColor;
			document.getElementById("rightSound").play();
		} else {
			errorCount++;
			totalErrorCount++;
			updateErrors();
			gameBoard.grid[x][y].isDisplayed = true;
			document.getElementById(i + "|" + j).style = flexBasisCache + errorBlockColor;
			if (errorCount < maxErrors) {
				document.getElementById("wrongSound").play();
			}
		}
	}

	isGameOver();
}

function doGameOver() {
	level = 0;
	playSound("levelLost");
	document.body.className = "levelLost";
	console.log("Gamer lost");
	document.getElementById("youLost").style.display = "block";
	activateSection("gameOver", 1000, function() {
		playSound("gameLost");
		activateVideoBG("gameLost.gif");
	});
}

// use to hack the game for a win
function forceWin() {
	let l = gameBoard.grid[0].length;
	for (let i = 0; i < l; i++) {
		for (let j = 0; j < l; j++) {
			if (gameBoard.grid[i][j].isUsed) {
				//gameBoard.grid[i][j].isDisplayed = true;
				//pushSquare(i, j);
				gameBoard.grid[i][j].isDisplayed = true;
				let x = i + 1;
				let y = j + 1;
				document.getElementById(x + "|" + y).style = flexBasisCache + successBlockColor;
				document.getElementById("rightSound").play();
			}
		}
	}
	isGameOver();
}

function forceCredits() {
	level = levelData.length;
	forceWin();
}

function forceTimeout() {
	if (selectedGameType !== "arcade") {
		timerSeconds = 1;
	} else {
		console.log("Not in time trial mode");
	}
}

function isGameOver() {
	document.getElementById("youLost").style.display = "none";
	document.getElementById("youWon").style.display = "none";

	if (errorCount === maxErrors) {
		doGameOver();
		foundElements = 0;
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

	if (selectedGameType === "arcade") {
		document.getElementById("howLong").innerHTML = "Time: " + timerSeconds;
	} else {
		document.getElementById("howLong").innerHTML = "Time so far: " + timerSeconds;
	}

	level++; // next board

	document.body.className = "levelWon";
	playSound("levelWon");
	// all levels have been won!
	if (level >= levelData.length) {
		activateSection("rollCredits", 1000, function() {
			activateVideoBG("gameWonAll.gif");
			document.body.className = "";
			rollCredits();
			level = 0;
		});
		let score = parseInt((Math.max(elementCount - errorCount, 0) / elementCount) * 100, 10);
		let duration = countDown - timerSeconds;
		let obj = {
			id: user.id,
			errorCount: errorCount,
			duration: duration,
			gridType: levelData[0].gridType,
			gameType: selectedGameType,
			score: score
		};
		console.log(obj);
		postData(obj, "update_scoreboard.php", function(data) {
			console.log("Update scoreboard? " + data.success);
			totalErrorCount = 0; // reset after submit
			totalElementCount = 0; // reset after submit
		});
	} else {
		activateSection("gameOver", 1000, function() {
			playSound("gameWon" + level);
			activateVideoBG("gameWon" + level + ".gif");
			document.body.className = "";
		});
	}
	foundElements = 0;
	return true;
}

function rollCredits() {
	let credits = [
		"This has been an<br>Agustin Rivera<br>Production",
		"This has been an<br>Agustin Rivera<br>Production",
		"Game Design:<br><br>A. Rivera",
		"Graphic Design:<br><br>Agustin R.",
		"Coding:<br><br>Augi Rivera",
		"Lead Programmer:<br><br>A.J. Rivera",
		"Costume Design:<br><br>A. Jesus Rivera",
		"Chief Mayhem Officer:<br><br>Zaira",
		"Edited By:<br><br>Visual Studio Code",
		"Special<br>Thanks To:<br><br>Coffee",
		"Special<br>Thanks To:<br><br>Creamer",
		"Special<br>Thanks To:<br><br>Sugar",
		"Background<br>Design:<br><br>Google Images",
		"Special<br>Coding<br>Thanks To:<br><br>Stack Overflow<br><br>w3schools",
		"Sound Effects:<br><br>BassGorilla.com<br><br>Woolyss.com<br><br>OpenGameArt.org",
		"Music:<br><br>Disco Fever<br><br>Fortnite",
		"Music:<br><br>Lose Yourself<br><br>Eminem",
		"Music:<br><br>Another One Bites The Dust<br><br>Queen",
		"Music:<br><br>Round and Round<br><br>Ratt",
		"Music:<br><br>Fantastic Voyage<br><br>Lakeside",
		"Music:<br><br>Rock the Casbah<br><br>The Clash",
		"No freshmen were harmed in the making of this game.",
		"No freshmen were harmed in the making of this game."
	];
	if (selectedGameType === "arcade") {
		document.getElementById("showCredits").innerHTML = "Congrats!<br>You beat the game!";
	} else {
		document.getElementById("showCredits").innerHTML =
			"Congrats!<br>You beat the game<br> with " + timerSeconds + " seconds left!";
	}
	let i = 0;

	playSound("gameWonAll");

	// why is there an interval in the interval?
	// the first interval is waiting for the first beat of the song Rock the Casbah
	// the second interval is the tempo
	let firstInterval = setInterval(function() {
		document.getElementById("showCredits").innerHTML = credits[i++];

		let interval = setInterval(function() {
			document.getElementById("showCredits").innerHTML = credits[i++];
			if (i === credits.length + 1) {
				document.getElementById("showCredits").innerHTML = "";
				clearInterval(interval);
				resetBoard();
				let d = document.createElement("div");
				d.innerHTML = "Thanks for playing.<br><br><br><br>Back to the menu";
				d.onclick = function() {
					level = 0;
					activateVideoBG("openingVid.gif");
					stopAllSound();
					playSound("menuMusic");
					login();
					activateSection("menu");
				};
				document.getElementById("showCredits").appendChild(d);
			}
		}, 1852); // why 1852?? syncs to the music :D
		clearInterval(firstInterval);
	}, 2000); // why 2100?  It's when the first beat hits
}

// ---------------- settings
function setGrid(colour) {
	document.getElementById("board").style.color = colour;
	let t = "grid" + colour;
	// clear previous underlines before setting a new one
	let c = document.getElementById("gridoptions").children;
	for (let i = 0; i < c.length; i++) {
		c[i].style.textDecoration = "none";
	}
	document.getElementById(t).style.textDecoration = "underline";
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
	let c = document.getElementById("blockoptions").children;
	for (let i = 0; i < c.length; i++) {
		c[i].style.textDecoration = "none";
	}

	document.getElementById(t).style.textDecoration = "underline";
	successBlockColor = "background-color: " + colour + ";";
}

function setError(colour) {
	let t = "error" + colour;
	// clear previous underlines before setting a new one
	let c = document.getElementById("erroroptions").children;
	for (let i = 0; i < c.length; i++) {
		c[i].style.textDecoration = "none";
	}

	document.getElementById(t).style.textDecoration = "underline";
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
			document.getElementById(id).children[0].innerHTML = 0;
		} else {
			document.getElementById(id).children[0].innerHTML = t;
		}

		// reduce padding on bigger grid
		if (gameBoard.grid.length > 7 && gameBoard.colStreaks[i].length > 2) {
			document.getElementById(id).children[0].style.paddingTop = "15%";
			document.getElementById(id).children[0].style.fontSize = "12px";
		} else {
			document.getElementById(id).children[0].style.paddingTop = "35%";
			document.getElementById(id).children[0].style.fontSize = "12px";
		}

		document.getElementById(id).children[0].className = "side-col";
	}
}

function writeRowStreaksToGrid() {
	for (let i = 0; i < gameBoard.rowStreaks.length; i++) {
		let t = "";
		for (let j = 0; j < gameBoard.rowStreaks[i].length; j++) {
			t += gameBoard.rowStreaks[i][j] + " ";
		}
		let offset = i + 1;
		let id = "0|" + offset;
		if (t.length === 0) {
			document.getElementById(id).children[0].innerHTML = 0;
		} else {
			document.getElementById(id).children[0].innerHTML = t;
		}

		// reduce padding on bigger grid
		if (gameBoard.grid.length > 7 && gameBoard.rowStreaks[i].length > 2) {
			document.getElementById(id).children[0].style.paddingTop = "5%";
			document.getElementById(id).children[0].style.fontSize = "12px";
		} else {
			document.getElementById(id).children[0].style.paddingTop = "15%";
			document.getElementById(id).children[0].style.fontSize = "12px";
		}
		document.getElementById(id).children[0].className = "top-row";
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
			square.setAttribute("role", "cell"); // ARIA

			square.onclick = function() {
				pushSquare(i, j);
			};

			var sqContent = document.createElement("div");
			sqContent.className = "content";
			square.appendChild(sqContent);
			board.appendChild(square);
		}
	}
}

function loadLevels(gridType, callback) {
	let post = {
		gridType: gridType
	};
	postData(post, "get_level_type.php?", function(data) {
		//console.log(data);
		levelData = data;
		callback();
	});
}

function chooseLevel() {
	gameBoard = JSON.parse(levelData[level].levelblob);
}

function postData(obj, url, callback = noop) {
	var data = {};
	data = JSON.stringify(obj);
	//console.log("data to post:");
	//console.log(data);

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
	login({}, function() {
		configureUserMenus();
	});
	// set initial color scheme
	setGrid("fuchsia");

	//document.getElementById("openingVid").play();
	activateVideoBG("openingVid.gif");

	// begin
	if (isSpecialMode()) {
		let msg = "";
		if (readParam("upload") === "failed") {
			if (readParam("error") !== null) {
				msg += errors(readParam("error"));
			} else {
				msg += "Upload complete.";
				document.getElementById("tryAgain").style.display = "none";
				login(user);
			}
		} else {
			msg += "Upload complete.";
			document.getElementById("tryAgain").style.display = "none";
			login(user);
		}
		document.getElementById("uploadMsg").innerHTML = msg;
		//clearParams();
		activateSection("uploadComplete");
	} else {
		activateSection("welcomeScreenGo");
	}

	rotateHighScoresWithMainMenu();
	// deactivate the 13x13 grid for mobile devices
	var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
	var android = !!navigator.platform && /android/.test(navigator.platform);
	if (iOS || android) {
		document.getElementById("startGame13").style.display = "none";
	}
}

// move suggestion
//   why am I making this?  just a quick way to check boundaries
function doesSquareExist(i, j) {
	if (typeof gameBoard.grid[i] === "undefined" || typeof gameBoard.grid[i][j] === "undefined") {
		return false;
	}
	return true;
}

// rate the value of a square for the purpose of suggestions
function squareScore(i, j) {
	if (doesSquareExist(i, j)) {
		if (gameBoard.grid[i][j].isUsed) {
			return 1;
		}
	}
	return 0;
}

// create a score that is a count of all the surrounding squares being isUsed=true
function getSuggestionScore(i, j) {
	let total = squareScore(i - 1, j) + squareScore(i + 1, j);
	total += squareScore(i, j - 1) + squareScore(i, j + 1);
	total += squareScore(i - 1, j - 1) + squareScore(i + 1, j + 1);
	total += squareScore(i - 1, j + 1) + squareScore(i + 1, j - 1);
	return total;
}

// find the square with the highest total
function bestSuggestion(isCenterSquareMarked) {
	let bestSquare = {
		i: 0,
		j: 0,
		score: 0 // default score for unmarked center square
	};

	// change the score if we need to find the lowest score
	if (isCenterSquareMarked) {
		bestSquare.score = 9;
	}

	for (let i = 0; i < gameBoard.grid.length; i++) {
		for (let j = 0; j < gameBoard.grid.length; j++) {
			// don't pay any attention to already touched blocks
			if (gameBoard.grid[i][j].isDisplayed) {
				continue;
			}
			let score = getSuggestionScore(i, j);

			if (isCenterSquareMarked === true && gameBoard.grid[i][j].isUsed === true) {
				if (score < bestSquare.score) {
					bestSquare.i = i;
					bestSquare.j = j;
					bestSquare.score = score;
				}
			} else if (isCenterSquareMarked === false && gameBoard.grid[i][j].isUsed === false) {
				if (score > bestSquare.score) {
					bestSquare.i = i;
					bestSquare.j = j;
					bestSquare.score = score;
				} else {
					// nada
				}
			}
		}
	}
	return bestSquare;
}

function findBestMarkedSuggestion() {
	let square = bestSuggestion(true);
	animateSuggestion(square, successBlockColor);
}

function findBestUnmarkedSuggestion() {
	let square = bestSuggestion(false);
	animateSuggestion(square, errorBlockColor, function() {
		errorCount = errorCount - 1;
		updateErrors();
	});
}

// start from the far side and animate
function animateSuggestion(square, blockColor, callback = noop) {
	//document.getElementById("suggest").innerHTML = "";
	let iterator = 6;
	let val = 5;
	let maxBounces = 7;
	playSound("suggestion");
	let anim = setInterval(function() {
		if (val >= 255 || val <= 0) {
			if (val >= 255) val = 255;
			if (val < 0) val = 0;

			iterator = -iterator;
			maxBounces--;
		}
		let i = square.i + 1;
		let j = square.j + 1;
		document.getElementById(i + "|" + j).style.backgroundColor = `rgb(${val}, ${val}, ${val})`;

		val += iterator;
		if (maxBounces === 0) {
			stopSound("suggestion");
			pushSquare(square.i + 1, square.j + 1);
			callback();
			clearInterval(anim);
		}
	}, 1);
}

// only trigger this after "Game Start" has been touched
// that way, the most important media will get preloaded first as part of the HTML
function preloadMedia() {
	document.getElementById("typing").preload = "true";
	document.getElementById("rightSound").preload = "true";
	document.getElementById("wrongSound").preload = "true";
	document.getElementById("suggestion").preload = "true";
	document.getElementById("makeUser").preload = "true";
	document.getElementById("levelWon").preload = "true";
	document.getElementById("levelLost").preload = "true";
	document.getElementById("gameLost").preload = "true";
	document.getElementById("gameWon1").preload = "true";
	document.getElementById("gameWon2").preload = "true";
	document.getElementById("gameWonAll").preload = "true";
}

// error handling
function errors(index) {
	/* error codes
	1 - not an image
	2 - already exists
	3 - too large
	4 - unknown file type
	5 - file upload failed
	6 - file upload failed
	*/
	let errors = [
		"No errors",
		"Not an image",
		"Already exists",
		"Too large",
		"Unknown file type",
		"File upload failed",
		"File upload failed"
	];
	return errors[index];
}

// ---------------- animations
function flashText(id, animDelay = 50, repeat = 1) {
	setTimeout(function() {
		document.getElementById(id).className = "flash1";
	}, 0);
	setTimeout(function() {
		document.getElementById(id).className = "flash2";
	}, animDelay * 1);
	setTimeout(function() {
		document.getElementById(id).className = "flash3";
	}, animDelay * 2);
	setTimeout(function() {
		document.getElementById(id).className = "flash4";
	}, animDelay * 3);
	setTimeout(function() {
		if (repeat > 0) {
			repeat--;
			flashText(id, animDelay, repeat);
		} else {
			document.getElementById(id).className = "";
		}
	}, animDelay * 4);
}

// ---------------- utility functions
function copyObject(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function loadStorage() {
	if (localStorage.nono) {
		user = JSON.parse(localStorage.nono);
	} else {
		user = copyObject(sesh);
	}
}

function saveStorage() {
	localStorage.nono = JSON.stringify(user);
}

function isSpecialMode() {
	if (readParam("upload") !== null) {
		return true;
	}

	return false;
}

function readParam(param) {
	var url_string = window.location.href;
	var url = new URL(url_string);
	var val = url.searchParams.get(param);
	return val;
}

function clearParams() {
	window.history.replaceState({}, document.title, "./");
}

// ----------------- audio routines
function clack() {
	playSound("typing");
}

var currentSound;
function playSound(id) {
	if (!document.getElementById(id)) return;
	console.log(id);

	document.getElementById(id).pause();

	document.getElementById(id).currentTime = 0;
	document.getElementById(id).play();
	currentSound = document.getElementById(id);
}

function stopSound(id) {
	document.getElementById(id).pause();
	document.getElementById(id).currentTime = 0;
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
