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

define ( 'DB_HOST', 'localhost' );
define ( 'DB_USER', 'agustin' );
define ( 'DB_PASSWORD', '7788' );
define ( 'DB_DB', 'nonogram' );


class db
{
    var $conn;
    private $returnType;

    /**
     * Connect to the NONO Database
     */
    function __construct($_returnType){
        // Create connection
        $connect = new mysqli(DB_HOST, DB_USER, DB_PASSWORD,DB_DB);

        // Check connection
        if (mysqli_connect_errno())
        {
            echo "Failed to connect to MySQL: " . mysqli_connect_error();
        }
        global $conn;
        $conn=$connect;
        $this->returnType=$_returnType;
    }

    public function Get($sql) {
        if ($this->returnType=="json") {
            return $this->GetJSON($sql);
        }
        else {
            return $this->GetLocal($sql);
        }
    }

    /**
     * @param $sql
     * @return bool|mysqli_result
     */
    private function GetLocal($sql) {
        global $conn;
        if (is_null($conn)) {
            echo "Database is not connected.";
        }
        $result = $conn->query($sql);
        return $result;
    }

    private function GetJSON($sql) {
        global $conn;
        if (is_null($conn)) {
            echo "Database is not connected.";
        }
        $result = $conn->query($sql);
        $output = array();
        $output  = $result->fetch_all(MYSQLI_ASSOC);

        return json_encode($output);
    }

    public function Insert($sql) {
    	 global $conn;
	    if ($conn->query($sql) === FALSE) {
            echo json_encode(array('success' => 'false'));
        }
        else {
            echo json_encode(array('success' => 'true'));
        }
    }
}

class NONOData
{
    private $returnType;

    /**
     * NONOData constructor.
     */
    function __construct (){
        $this->returnType = "standard";
    }

    public function SetReturnType($_returnType) {
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

    public function GetPlayer($username){
        $nono = new db($this->returnType);
        return $nono->Get("select * from players where username='$username';");
    }

    public function GetLevel(){
	    $nono = new db($this->returnType);
        return $nono->Get("select * from levels where id=0;");
    }

    public function GetGames($id) {
	    $nono = new db($this->returnType);
        return $nono->Get("select * from games where id=0;");
    }

    public function FindStudentByPhone($phone) {
        $nono = new db($this->returnType);
        // strip anything that is not a number
        $normalizedPhone = preg_replace("/[^0-9]/", "", $phone);
        if (strlen($normalizedPhone)==10) {
            return $nono->Get("select * from students where phoneNumber='$normalizedPhone'");
        }
    }
    public function InsertLevel($name,$gameBoard,$length) {
		$nono = new db($this->returnType);
        $max = $nono->Get("select coalesce(max(id)+1,0) as max from levels;"); 
        $board = json_encode($gameBoard);
        while ($row = $max->fetch_assoc()) {
            $maxx = $row["max"];
            $query="insert into levels values($maxx,'$name','$board',$length)";
            echo $nono->Insert($query);
        }
        
        
        //var_dump($query);
        //$nono->Insert($query);
    }

    public function DeleteBuilding($schoolID,$buildingID) {
        $nono = new db($this->returnType);
        $nono->Get("delete from structures where schoolID=$schoolID and buildingID=$buildingID");
        $nono->Get("delete from structureLatLong where schoolID=$schoolID and buildingID=$buildingID");
        $nono->Get("delete from structureDimensions where schoolID=$schoolID and buildingID=$buildingID");
    }

    public function UserLogin($username) {
    	    $nono = new db($this->returnType);
    	    $query="select * from players where username='$username'";
    	    return $nono->Get($query);
    }

    public function HashLogin($username,$passhash) {
	    $nono = new db($this->returnType);
	    $query="select username,passhash,adminlevel from users where username='$username' and passhash='$passhash'";
	    return $nono->Get($query);
    }

    /**
     * Pass in the MySQL results from the functions to turn into JSON
     * @param $result
     */
    public function JSONifyResults($result){
        $output = array();
        $output  = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($output,JSON_PRETTY_PRINT);
    }

}
