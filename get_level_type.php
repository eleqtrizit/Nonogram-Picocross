<?php

require_once ('phplibs/db.php');
$data = new NONOData();

$_POST = json_decode(file_get_contents('php://input'), true);
$gridType = $_POST['gridType'];
$result = $data->GetLevelType($gridType);
$data->JSONifyResults($result);





