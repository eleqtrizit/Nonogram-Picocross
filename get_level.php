<?php

require_once ('phplibs/db.php');
$data = new NONOData();

$_POST = json_decode(file_get_contents('php://input'), true);
$id = $_POST["id"];
$result = $data->GetLevel($id);
$data->JSONifyResults($result);





