<?php
/**
 * Created by PhpStorm.
 * User: agust
 * Date: 9/30/2017
 * Time: 6:38 AM
 */

/**
 * Class db
 * Common database access methods
 */

error_reporting(E_ERROR | E_PARSE);
 
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASSWORD', '');
define('DB_DB', 'nonogram');

class db
{
    public $conn;
    private $returnType;

    /**
     * Connect to the NONO Database
     */
    public function __construct($_returnType)
    {
		if ($_returnType=='none'){
			return;
		}
        // Create connection
        $connect = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DB);

        // Check connection
        if (mysqli_connect_errno()) {
            echo "Failed to connect to MySQL: " . mysqli_connect_error();
        }
        global $conn;
        $conn = $connect;
        $this->returnType = $_returnType;
    }

    public function Get($sql)
    {
        if ($this->returnType == "json") {
            return $this->GetJSON($sql);
        } else {
            return $this->GetLocal($sql);
        }
    }

    /**
     * @param $sql
     * @return bool|mysqli_result
     */
    private function GetLocal($sql)
    {
        global $conn;
        if (is_null($conn)) {
            echo "Database is not connected.";
        }
        $result = $conn->query($sql);
        return $result;
    }

    private function GetJSON($sql)
    {
        global $conn;
        if (is_null($conn)) {
            echo "Database is not connected.";
        }
        $result = $conn->query($sql);
        $output = array();
        $output = $result->fetch_all(MYSQLI_ASSOC);

        return json_encode($output);
    }

    public function Insert($sql)
    {
        global $conn;
        if ($conn->query($sql) === false) {
            echo json_encode(array('success' => 'false'));
        } else {
            echo json_encode(array('success' => 'true'));
        }
    }

    public function InsertQuietly($sql)
    {
        global $conn;
        if ($conn->query($sql) === false) {
            //echo json_encode(array('success' => 'false'));
        } else {
            //echo json_encode(array('success' => 'true'));
        }
	}
	
	public function GetCredentials(){
		return (array("host"=>DB_HOST, "user"=>DB_USER, "password"=>DB_PASSWORD, "database"=>DB_DB));
	}
}

class NONOData
{
    private $returnType;

    /**
     * NONOData constructor.
     */
    public function __construct()
    {
        $this->returnType = "standard";
    }

    public function SetReturnType($_returnType)
    {
        $this->returnType = $_returnType;
    }

    /**
     * Pass in the user's Lat/Long and the radius distance to find a school,
     * and get back a list of schools
     * @param $latitude
     * @param $longitude
     * @param $dist
     * @return mixed
     */

    public function GetPlayer($username)
    {
        $nono = new db($this->returnType);
        return $nono->Get("select * from players where username='$username';");
    }

    public function GetLevel($id)
    {
        $nono = new db($this->returnType);
        return $nono->Get("select id,name,levelblob from levels where id=$id");
    }

    public function GetLevelType($gridType)
    {
        $nono = new db($this->returnType);
        return $nono->Get("select id,name,levelblob,gridType from levels where gridType=$gridType order by id desc limit 3;");
    }

    public function ListLevels()
    {
        $nono = new db($this->returnType);
        return $nono->Get("select id,name,gridType from levels");
    }

    public function GetGame($id)
    {
        $nono = new db($this->returnType);
        return $nono->Get("select * from games where id=$id;");
    }

    public function InsertLevel($name, $gameBoard, $length)
    {
        $nono = new db($this->returnType);
        $max = $nono->Get("select coalesce(max(id)+1,0) as max from levels;");
        $board = json_encode($gameBoard);
        while ($row = $max->fetch_assoc()) {
            $maxx = $row["max"];
            $query = "insert into levels values($maxx,'$name','$board',$length)";
            return $nono->Insert($query);
        }
    }

    public function ResaveLevel($id, $name, $gameBoard, $length)
    {
        $nono = new db($this->returnType);
        $board = json_encode($gameBoard);
        $nono->Get("delete from levels where id=$id"); // delete old copy
        $nono->Insert("insert into levels values($id,'$name','$board',$length)");
    }

    public function CreateUser($username, $password, $email, $firstname, $lastname, $age, $gender, $location)
    {
        $nono = new db($this->returnType);
        $max = $nono->Get("select coalesce(max(id)+1,0) as max from players;");
        while ($row = $max->fetch_assoc()) {
            $maxx = $row["max"];
            $hashpass = password_hash($password, PASSWORD_BCRYPT);
            $query = "insert into players values($maxx,'$username','$hashpass','$email','$firstname','$lastname',$age,'$gender','$location','')";
            $nono->InsertQuietly($query);

            return $this->CheckLogin($username);
        }
    }

    public function CheckLogin($username)
    {
        $nono = new db($this->returnType);
        $query = "select id,username,password,avatarpath from players where username='$username'";
        return $nono->Get($query);
    }

    // update players set avatarpath='' where username='eleqtriq';
    public function UpdateAvatar($username, $filename)
    {
        $nono = new db($this->returnType);
        $query = "update players set avatarpath='$filename' where username='$username';";
        $nono->InsertQuietly($query);
    }

    public function HashLogin($username, $passhash)
    {
        $nono = new db($this->returnType);
        $query = "select username,passhash,adminlevel from users where username='$username' and passhash='$passhash'";
        return $nono->Get($query);
    }

    public function GetScoreboard($gridType, $gameType)
    {
        $nono = new db($this->returnType);
        $query = "";
        if ($gameType == 'arcade') {
            $query = "select username,duration,errorcount,gameType,score from games,players where playerid=id and gridType=$gridType and gameType='$gameType' order by score desc limit 5";
        } else {
            $query = "select username,duration,errorcount,gameType,score from games,players where playerid=id and gridType=$gridType and gameType='$gameType' order by duration asc limit 5";
        }

        return $nono->Get($query);
    }

    public function UpdateScoreboard($id, $duration, $errorCount, $score, $gridType, $gameType)
    {
        $nono = new db($this->returnType);
        $query = "insert into games values($id,$duration,$errorCount,$score,$gridType,'$gameType');";
        $nono->Insert($query);
    }

    /**
     * Pass in the MySQL results from the functions to turn into JSON
     * @param $result
     */
    public function JSONifyResults($result)
    {
        $output = array();
        $output = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($output, JSON_PRETTY_PRINT);
    }

}
