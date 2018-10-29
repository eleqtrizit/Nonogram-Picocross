<?php

require_once ('phplibs/db.php');
$data = new NONOData();

$_POST = json_decode(file_get_contents('php://input'), true);
$username = $_POST['username'];
$password = $_POST['password'];

$result = $data->CheckLogin($username);
$row = $result->fetch_assoc();
$dbusername = $row['username'];
$dbpassword = $row['password'];
$dbavatarpath = $row['avatarpath'];

// probably need to check case of username
if ($password===$dbpassword){
	$ret->isLoggedIn = "true";
	$ret->username = $dbusername; // use official username from db
	$ret->avatarPath = $dbavatarpath;
}
else {
	$ret->isLoggedIn = "false";
}

$data->JSONifyResults($result);





