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

if ($password===$dbpassword){
	$ret->isLoggedIn = "true";
}
else {
	$ret->isLoggedIn = "false";
}

$data->JSONifyResults($result);





