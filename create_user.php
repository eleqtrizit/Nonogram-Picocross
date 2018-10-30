<?php

require_once ('phplibs/db.php');
$data = new NONOData();

$_POST = json_decode(file_get_contents('php://input'), true);
$username = $_POST['username'];
$password = $_POST['password'];
$email =  $_POST['email'];
$firstname = $_POST['firstname'];
$lastname = $_POST['lastname'];
$age = $_POST['age'];
$gender = $_POST['gender'];
$location = $_POST['location'];

$result = $data->CreateUser($username,$password,$email,$firstname,$lastname,$age,$gender,$location);
$data->JSONifyResults($result);