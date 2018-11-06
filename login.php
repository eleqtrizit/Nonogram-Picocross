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

$ret->sentUsername = $username;
$ret->isLoggedIn = "false";

// probably need to check case of username
if ($dbpassword != null && (password_verify($password,$dbpassword) || $password == $dbpassword)){
	$ret->isLoggedIn = "true";
	$ret->id = $row['id'];
	$ret->username = $dbusername; // use official username from db
	$ret->avatarpath = $dbavatarpath;
	$ret->password = $dbpassword;
}

echo json_encode($ret);





