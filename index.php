<!DOCTYPE html>
<html>

<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title>Nonogram</title>
	<meta name="description" content="">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" href="nonogram.css">
	<link href="https://fonts.googleapis.com/css?family=Press+Start+2P" rel="stylesheet">
</head>

<body>
	
<?php
require_once 'phplibs/db.php';
$db = new db('none');

$credentials = $db->GetCredentials();
$mysqli = new mysqli($credentials["host"], $credentials["user"], $credentials["password"], $credentials["database"]);
if ($mysqli->query("select * from levels")==false) {
?>
<div>
	<br><br><br>
	There was a problem connecting to the database.<br>
	<br>
	<b>Please check the credentials in <i>phplibs/db.php</i></b> or <br><br>
	<a href="install.php" style="color: red">INSTALL THE GAME</a>
</div>
<?php
}
else {
?>

	<div id="audios" style="display:none">
		<audio id="typing" controls style="display:none" preload="none">
			<source src="assets/typing.mp3" type="audio/mpeg">
			<source src="assets/typing.wav" type="audio/mpeg">
		</audio>
		<audio id="menuMusic" controls style="display:none" preload="auto">
			<source src="assets/DiscoFever.mp3" type="audio/mpeg">
			<source src="assets/DiscoFever.wav" type="audio/mpeg">
		</audio>
		<audio id="menuSelect" controls style="display:none" preload="auto">
			<source src="assets/sfx_menu_select4_short.mp3" type="audio/mpeg">
			<source src="assets/sfx_menu_select4_short.wav" type="audio/mpeg">
		</audio>
		<audio id="rightSound" controls style="display:none" preload="none">
			<source src="assets/right.mp3" type="audio/mpeg">
			<source src="assets/right.wav" type="audio/mpeg">
		</audio>
		<audio id="wrongSound" controls style="display:none" preload="none">
			<source src="assets/wrong.mp3" type="audio/mpeg">
			<source src="assets/wrong.wav" type="audio/mpeg">
		</audio>
		<audio id="levelWon" controls style="display:none" preload="none">
			<source src="assets/levelWon.mp3" type="audio/mpeg">
			<source src="assets/levelWon.wav" type="audio/mpeg">
		</audio>
		<audio id="gameWon1" controls style="display:none" preload="none">
			<source src="assets/RoundandRound.mp3" type="audio/mpeg">
			<source src="assets/RoundandRound.wav" type="audio/mpeg">
		</audio>
		<audio id="gameWon2" controls style="display:none" preload="none">
			<source src="assets/FantasticVoyage.mp3" type="audio/mpeg">
			<source src="assets/FantasticVoyage.wav" type="audio/mpeg">
		</audio>
		<audio id="gameWonAll" controls style="display:none" preload="none">
			<source src="assets/RockTheCasbah.mp3" type="audio/mpeg">
			<source src="assets/RockTheCasbah.wav" type="audio/mpeg">
		</audio>
		<audio id="levelLost" controls style="display:none" preload="none">
			<source src="assets/levelLost.mp3" type="audio/mpeg">
			<source src="assets/levelLost.wav" type="audio/mpeg">
		</audio>
		<audio id="gameLost" controls style="display:none" preload="none">
			<source src="assets/LoseYourself.mp3" type="audio/mpeg">
			<source src="assets/LoseYourself.wav" type="audio/mpeg">
		</audio>
		<audio id="makeUser" controls style="display:none" preload="none">
			<source src="assets/AnotherOneBitesTheDust.mp3" type="audio/mpeg">
			<source src="assets/AnotherOneBitesTheDust.wav" type="audio/mpeg">
		</audio>
		<audio id="suggestion" controls style="display:none" preload="none">
			<source src="assets/Suggestion.mp3" type="audio/mpeg">
			<source src="assets/Suggestion.wav" type="audio/mpeg">
		</audio>
	</div>
	<!-- If you're wondering why
			 there are apparently useless divs below, it's because they are necessary to the CSS I'm using to vertically align
			 the text. I'm using display:table and display:table-cell. The useless div is a table-cell. I then stick in the text
			 I want inside more divs in that, so it'll all be vertically aligned. I couldn't just attach it to the parent div
			 because it also has it's own display type of flex. -->

	<div id="main">
		<section id="welcomeScreenGo" style="display:none">
			<div class="centerlarge">
				<div>
					<div>NONOGRAM</div>
					<div onclick="beginLoading()" id="startGame" role="navigation">Start Game</div>
				</div>
			</div>
		</section>


		<section id="menu" style="display:none">
			<div class="centermedium">
				<div>
					<div>Choose:</div>
					<div id="arcade" style="cursor: pointer;" onclick="selectMode('arcade')" role="navigation">
						Arcade Mode
					</div>
					<div id="timetrial" style="cursor: pointer;" onclick="selectMode('timetrial')" role="navigation">
						Time Trial
					</div>
					<div class="small">
						<div id="avatarImage" onclick="selectUserFunctions()" style="cursor: pointer; display:none" role="navigation"></div>
						<div id="noAvatar" onclick="selectUserFunctions()" role="navigation">Account</div>
						<div onclick="gotoSettings()" style="cursor: pointer;" id="selectSettings" role="navigation">Settings</div>
						<div id="selectHelp" onclick="gotoHelp()" role="navigation">Help</div>
					</div>

				</div>
			</div>
		</section>

		<section id="pickGrid">
			<div class="centermedium">
				<div>
					<div onclick="startGame(7)" id="startGame7" style="cursor: pointer;" role="navigation">
						7x7
					</div>
					<div onclick="startGame(13)" id="startGame13" style="cursor: pointer;" role="navigation" class="no-small-screens">
						13x3
					</div>
					<div id="back2Menu3" onclick="resetToMenu('back2Menu3')" role="navigation">Back to Menu</div>
				</div>
			</div>
		</section>


		<section id="userFunctions" style="display:none">
			<div class="centermedium">
				<div>
					<div onclick="selectLogin()" style="cursor: pointer; display:none" id="selectLogin" role="navigation">Login</div>
					<div onclick="createUserMenu()" style="cursor: pointer; display:none" id="selectCreateUser" role="navigation">Sign
						Up</div>
					<div id="selectUploadAvatar" onclick="selectUploadAvatar()" style="cursor: pointer; display:none" role="navigation">Upload
						Avatar</div>
					<div id="back2Menu" onclick="resetToMenu('back2Menu')" role="navigation">Back to Menu</div>
				</div>
			</div>
		</section>

		<section id="uploadAvatar" style="display: none">
			<div class="centermedium">
				<div>
					<form action="upload.php" method="post" enctype="multipart/form-data" id="avatarForm">



						<div class="upload-btn-wrapper">
							<button class="btn" role="button">Select File</button><br><br><br>
							<input type="hidden" id="uploadName" value="" name="uploadName">
							<input type="file" name="fileToUpload" id="fileToUpload" role="dialog">
							<input type="hidden" name="fileName" id="fileName" value="">
						</div>
						<div class="upload-submit">
							<span onclick="submitAvatar()" role="button">
									Upload Image
							</span>
						</div>
						<div id="back2Menu2" onclick="resetToMenu('back2Menu2')" role="navigation">Back to Menu</div>
					</form>

				</div>
			</div>
		</section>

		<section id="uploadComplete" style="display: none">
			<div class="centermedium">
				<div>
					<div id="uploadMsg" style="padding-bottom: 120px">

					</div>
					<div id="tryAgain" onclick="tryAgain()">Try Again</div>
					<div id="tryMenu" onclick="resetToMenu('tryMenu')" role="navigation">Back to Menu</div>
				</div>

			</div>
		</section>


		<section id="createUser">
			<div class="centersmall">
				<div class="createUser">
					<div>
						Username:<br>
						<input type="text" id="username" autocomplete="off" oninput="clack()" role="textbox"><br>
					</div>
					<div>
						Password:<br>
						<input type="password" id="password" autocomplete="off" oninput="clack()" role="textbox">
					</div>
					<div>Email:<br>
						<input type="email" id="email" oninput="clack()" role="textbox">
					</div>
					<div>First Name:<br>
						<input type="text" id="firstname" autocomplete="off" oninput="clack()" role="textbox">
					</div>
					<div>Last Name:<br>
						<input type="text" id="lastname" autocomplete="off" oninput="clack()" role="textbox">
					</div>
					<div>Age:<br>
						<input type="number" id="age" autocomplete="off" oninput="clack()" role="textbox">
					</div>
					<div id="gender" role="radiogroup">Gender:<br>
						<span id="male" oninput="clack()" onclick="selectSex('male')" role="radio">Male</span>
						<span id="female" oninput="clack()" onclick="selectSex('female')" role="radio">Female</span>
						<span id="other" oninput="clack()" onclick="selectSex('other')" role="radio">Other</span>
					</div>
					<div>Location:<br>
						<input type="text" id="location" autocomplete="off" oninput="clack()" role="textbox">
					</div>
					<div onclick="createUser()" role="button">Submit</div>
					<div id="incompleteForm" style="display:none" role="alert">Please complete the form</div>
					<div id="back2Menu2" onclick="resetToMenu('back2Menu2')" role="navigation">Back to Menu</div>
				</div>
			</div>
		</section>

		<section id="userCreated" style="display:none">
			<div class="centerlarge">
				<div>
					<div style="padding-bottom: 40px;" role="status">Account Created</div>
					<div id="userCreatedContinue" onclick="userCreatedBackToMenu()" role="textbox">Continue</div>
				</div>
			</div>
		</section>

		<section id="userLoggedIn" style="display:none">
			<div class="centerlarge">
				<div>
					<div style="padding-bottom: 40px;" role="status">Login Complete</div>
					<div id="userCreatedContinue2" onclick="userCreatedBackToMenu()" role="navigation">Continue</div>
				</div>
			</div>
		</section>

		<section id="loginPage" style="display:none">
			<div class="centermedium">
				<div>
					<div>
						Username:<br>
						<input type="text" id="username2" autocomplete="off" oninput="clack()" role="textbox"><br>
					</div>
					<div>
						Password:<br>
						<input type="password" id="password2" autocomplete="off" oninput="clack()" role="textbox">
					</div>
					<div onclick="loginUser()" role="button">Submit</div>
				</div>

			</div>
		</section>

		<section id="helpPage" style="display:none;">
			<div class="centersmall">
				<div role="text">
					How to play:<br>
					<br>
					You have to find the squares of the board, revealing the picture underneath, using the hints on the edges.<br>
					<br>
					The numbers represent streaks of consecutive block. Use them as hints.<br>
					<br>
					<img src="assets/helpmap.png" width="400"><br>
					<br>
					<div id="back2Menu3" onclick="resetToMenu('back2Menu3')" role="textbox">Back to Menu</div>
				</div>
			</div>
		</section>

		<section id="scoreboardPage" style="display:none;">
			<div class="centermediumsmall">
				<div role="text">
					<div>High Scores</div>
					<div id="scoreType"></div>
					<div id="scoreboard"></div>
					<div id="reverseScores" style="cursor: pointer">Reverse Scores</div>
					<div id="score2menu" style="cursor: pointer" onclick="activateSection('menu')">Menu</div>
				</div>
			</div>
		</section>

		<section id="play" style="display:none;">
			<div class="centersmall">
				<div>
					<div id="gameStats">
						<span id="timer" class="trackers" role="timer"></span>
						<span id="turns" class="trackers" role="log"></span>
						<span id="errors" role="log"></span>
					</div>
					<div id="board" role="grid"></div>
					<div class="bottom">
						<span id="elementsOnGrid" class="trackers" role="log"></span>
						<span id="suggest">Suggest: <a onclick="findBestMarkedSuggestion()" style="cursor: pointer">Good</a> | <a onclick="findBestUnmarkedSuggestion()" style="cursor: pointer">Bad</a></span>
					</div>
					<div><br><Br><span id="cheat" onclick="forceWin()" style="cursor: pointer">Cheat!</span></div>
				</div>
			</div>

		</section>

		<section id="gameOver" style="display: none">
			<div class="centermedium">
				<div>
					<div id="youWon" style="display: none; margin-top: 20vh;" class="large">
						<div style="margin-bottom: 50px;" role="alert">You Won!</div>
						<div style="margin-bottom: 50px;" role="how long" id="howLong"></div>
						<div id="nextLevel" style="cursor: pointer" onclick="nextLevel()" role="navigation">Go to next level</div>
					</div>
					<div id="youLost" style="display: none" class="youWonOrLost">
						<div style="margin-bottom: 50px;" role="alert">You Lost</div>
						<div id="loserToMenu" style="cursor: pointer" onclick="loserToMenu()" role="navigation">Go to menu</div>
					</div>
					<div id="stats"></div>
				</div>
			</div>
		</section>

		<section id="rollCredits" style="display: none">
			<div class="credits">
				<div>
					<div id="showCredits" role="text">
					</div>
				</div>
			</div>
		</section>


		<section id="settings" style="display:none;">
			<div class="centersmall">
				<div>
					<div id="gridoptions" style="padding-bottom: 80px" role="radiogroup">Change the grid outline color:<br>
						<span style="color: cyan" onclick="setGrid('cyan')" id="gridcyan">Cyan</span>
						<span style="color: yellow" onclick="setGrid('yellow')" id="gridyellow">Yellow</span>
						<span style="color: fuchsia" onclick="setGrid('fuchsia')" id="gridfuchsia">Fuchsia</span>
						<span style="color: crimson" onclick="setGrid('crimson')" id="gridcrimson">Red</span>
						<span style="color: darkorange" onclick="setGrid('darkorange')" id="griddarkorange">Orange</span>
						<span style="color: limegreen" onclick="setGrid('limegreen')" id="gridlimegreen">Green</span>
					</div>
					<div id="blockoptions" style="padding-bottom: 80px" role="radiogroup">Change the success block color:<br>
						<span style="color: cyan" onclick="setSuccess('cyan')" id="blockcyan">Cyan</span>
						<span style="color: yellow" onclick="setSuccess('yellow')" id="blockyellow">Yellow</span>
						<span style="color: fuchsia" onclick="setSuccess('fuchsia')" id="blockfuchsia">Fuchsia</span>
						<span style="color: crimson" onclick="setSuccess('crimson')" id="blockcrimson">Red</span>
						<span style="color: darkorange" onclick="setSuccess('darkorange')" id="blockdarkorange">Orange</span>
						<span style="color: limegreen" onclick="setSuccess('limegreen')" id="blocklimegreen">Green</span>
					</div>
					<div id="erroroptions" style="padding-bottom: 80px" role="radiogroup">Change the error block color:<br>
						<span style="color: cyan" onclick="setError('cyan')" id="errorcyan">Cyan</span>
						<span style="color: yellow" onclick="setError('yellow')" id="erroryellow">Yellow</span>
						<span style="color: fuchsia" onclick="setError('fuchsia')" id="errorfuchsia">Fuchsia</span>
						<span style="color: crimson" onclick="setError('crimson')" id="errorcrimson">Red</span>
						<span style="color: darkorange" onclick="setError('darkorange')" id="errordarkorange">Orange</span>
						<span style="color: limegreen" onclick="setError('limegreen')" id="errorlimegreen">Green</span>
					</div>
					<div onclick="leaveSettings()" id="settingsLabel" role="navigation">
						Return to Menu
					</div>
				</div>
			</div>
		</section>

		<script src="nonogram.js" async defer></script>

	<?php
}

?>
</body>

</html>

