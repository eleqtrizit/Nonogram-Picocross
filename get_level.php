<?php

require_once ('phplibs/db.php');
$data = new NONOData();

$id = $_GET["id"];
$result = $data->GetLevel($id);
$data->JSONifyResults($result);





