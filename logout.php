<?php

require_once ('phplibs/db.php');
$data = new NONOData();

$result = $data->ListLevels();
$data->JSONifyResults($result);
