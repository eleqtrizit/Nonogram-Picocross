<?php

require_once 'phplibs/db.php';
$db = new db();

$credentials = $db->GetCredentials();
?>

<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<title>Install Nonogram</title>
</head>
<body>

<?php

// Connect to MySQL
$mysqli = new mysqli(credentials["host"], credentials["user"], credentials["password"]);
// Check connection
if ($mysqli->connect_error) {
    echo "Please alter/check the credentials in the file phplibs/db.php.";
    die("Connection failed: " . $mysqli->connect_error);
}
echo "Connected successfully";

// Create database
if ($mysqli->query("create database $db") === true) {
    echo "Database $db successfully.";
} else {
    die("Error creating database: " . $mysqli->error);
}

echo "<br><br>";
echo "Connecting to new db $db.";
$mysqli->close();
$mysqli = new mysqli(credentials["host"], credentials["user"], credentials["password"], credentials["db"]);
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}
echo "Connected successfully.";

run_sql_file($sqldump, $mysqli);

echo "Database created and imported successfully.";

function run_sql_file($location, $mysqli)
{
    //load file
    $commands = file_get_contents($location);

    //delete comments
    $lines = explode("\n", $commands);
    $commands = '';
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line && !startsWith($line, '--') && !startsWith($line, '/*')) {
            $commands .= $line;
        }
    }

    //convert to array
    $commands = explode(";", $commands);

    //run commands
    $total = $success = 0;
    foreach ($commands as $command) {
        if (trim($command)) {
            if ($mysqli->query($command) == true) {
                echo "Query Success<br>";
            } else {
                echo "Query failed: $command.<br>";
                die("Error: " . $mysqli->error);
            }
        }
    }
}

// Here's a startsWith function
function startsWith($haystack, $needle)
{
    $length = strlen($needle);
    return (substr($haystack, 0, $length) === $needle);
}

$mysqli->close();
?>

</body>
</html>