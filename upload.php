<?php

require_once ('phplibs/db.php');


/* error codes
1 - not an image
2 - already exists
3 - too large
4 - unknown file type
5 - file upload failed
6 - file upload failed
*/

$error = 0;
$target_dir = "avatars/";
$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
$imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));

// Check if image file is a actual image or fake image
if(isset($_POST["submit"])) {
    $check = getimagesize($_FILES["fileToUpload"]["tmp_name"]);
    if($check == false) {
        $error = 1;

	}
}
// Check if file already exists
/*if (file_exists($target_file)) {
	$error = 2;
}
*/

// Check file size
if ($_FILES["fileToUpload"]["size"] > 1000000) {
	$error = 3;
}

// Allow certain file formats
if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg"
&& $imageFileType != "gif" ) {
	$error = 4;
}

// Check if $uploadOk is set to 0 by an error
if ($error==0) {
    if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
        $data = new NONOData();
        $result = $data->UpdateAvatar( $_POST["uploadName"], basename($_FILES["fileToUpload"]["name"]));
    } else {
		$error = 6;
    }
}

if ($error>0){
	header('Location: /?upload=failed&error=' . $error .'&filename= ' . $imageFileType, $statusCode = 303);
	die();
}
else {
	header('Location: /?upload=complete', $statusCode = 303);
	die();
}