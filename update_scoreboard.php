<?php

require_once ('phplibs/db.php');
$data = new NONOData();

$_POST = json_decode(file_get_contents('php://input'), true);
$id = $_POST['id'];
$duration = $_POST['duration'];
$errorCount = $_POST['errorCount'];
$score = 150 - ($errorCount*10);
$gridType = $_POST['gridType'];
$gameType = $_POST['gameType'];

// $id,$errorCount,$score,$gridType,$gameType)
$result = $data->UpdateScoreboard($id,$duration,$errorCount,$score,$gridType,$gameType);




