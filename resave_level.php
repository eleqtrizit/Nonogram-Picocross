<?php

require_once ('phplibs/db.php');
$data = new NONOData();

$_POST = json_decode(file_get_contents('php://input'), true);
$gameBoard = $_POST['gameBoard'];
$boardName = $_POST['boardName'];
$length = $_POST['length'];
$id = $_POST['id'];

$data->ResaveLevel($id,$boardName,$gameBoard,$length);
$ret->success = "true";





