<?php
require_once 'db_connect.php';

$meld = '';
$anz = 0;

$uri    = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];
$paths 	= explode('/', $uri); // formt die URL um in einen Array
$elem0  = array_pop($paths); // liefert das letzte Element des Arrays --> sollte leer sein!!
$elem1  = strtoupper(array_pop($paths)); // liefert das letzte Element des Arrays in GROSSBUCHSTABEN
$elem2  = strtoupper(array_pop($paths)); // liefert das letzte Element des Arrays in GROSSBUCHSTABEN
$addrid = is_numeric($elem1) ? intval($elem1) : 0;
$source = $addrid == 0 ? $elem1 : $elem2;

// var_dump($elem1." ".$elem2);
// var_dump($addrid." ".$source);

// Decide what to do!
switch ($method) {
	case 'POST':  	// Create
		saveAddress($addrid, 'INSERT');
		break;
	case 'GET': 		// Read
		switch ($source) {
			case 'SINGLE':
				var_dump($addrid);
				getSingleAddress($addrid);
				break;
			case 'NEXT':
				getNextAddressId();
				break;
			default: 
				getAllAddresses();
		}
		break;
	case 'PUT':			// Update / Create
		parse_str(file_get_contents("php://input"),$_POST);
		//var_dump($_POST);
		updateSingleAddress();
		break;
	case 'DELETE':	// Delete
		deleteAddress($addrid);
		break;
}

/* ========================================================================= */
/* Functions to Maintain the Addresses             													 */
/* ========================================================================= */
function getAllAddresses() {
	$q = 'select * from adressen order by name';
	$res = mysql_query($q);
	$anz = (mysql_num_rows($res)>0) ? mysql_num_rows($res) : 0;
	
	$rows = array();
	$rows['msg'][] = $anz;
	while ($row = mysql_fetch_array($res, MYSQL_ASSOC)) {
		$row['addrid'] = html_entity_decode($row['addrid']);
		$row['name'] = utf8_encode($row['name']);
		$row['plz_ort'] = utf8_encode($row['plz_ort']);
		$row['ort'] = utf8_encode($row['ort']);
		$row['geburtstag'] = date("d.m.Y",strtotime($row['geburtstag']));
		$rows['adressen'][] = $row;
	}
	print json_encode($rows);
}

function getSingleAddress($addrid) {
	$q = 'select * from adressen where addrid='.$addrid;
	$res = mysql_query($q);
	$anz = (mysql_num_rows($res)>0) ? mysql_num_rows($res) : 0;
	
	$rows = array();
	$rows['msg'][] = $anz;
	while ($row = mysql_fetch_array($res, MYSQL_ASSOC)) {
		$row['addrid'] = html_entity_decode($row['addrid']);
		$row['name'] = utf8_encode($row['name']);
		$row['firstletter'] = utf8_encode($row['firstletter']);
		$row['adresse'] = utf8_encode($row['adresse']);
		$row['plz_ort'] = utf8_encode($row['plz_ort']);
		$row['ort'] = utf8_encode($row['ort']);
		$row['bild'] = html_entity_decode($row['bild']);
		$row['geburtstag'] = date("d.m.Y",strtotime($row['geburtstag']));
		$rows['detail'][] = $row;
	}
	print json_encode($rows);
}

function getNextAddressId() {
	$q = 'select max(addrid)+1 as nextaddrid from adressen';
	$res = mysql_query($q);
	$anz = (mysql_num_rows($res)>0) ? mysql_num_rows($res) : 0;	
	$row = mysql_fetch_array($res, MYSQL_ASSOC);
	$rows = array();
	$rows['msg'][] = $anz;
	$rows['nextaddrid'][] = $row['nextaddrid'];
	print json_encode($rows);
}

function saveAddress($addrid, $action) {
	$values = '';
	$values .= 'addrid 	= '.intval($addrid).',';
	$values .= 'name   	= "'.utf8_decode($_POST['name']).'",';
	
	$fletter = isset($_POST['name']) ? $_POST['name'][0] : '';
	$values .= 'firstletter = "'.$fletter.'",';
	
	$adresse = isset($_POST['adresse']) ? utf8_decode($_POST['adresse']) : '';
	$values .= 'adresse	= "'.$adresse.'",';

	$plzort = isset($_POST['plz_ort']) ? utf8_decode($_POST['plz_ort']) : '';
	$values .= 'plz_ort	= "'.$plzort.'",';
	
	$ort = isset($_POST['plz_ort']) ? explode(" ",utf8_decode($_POST['plz_ort'])) : "";
	$values .= 'ort	= "'.$ort[1].'",';
	
	$geschlecht = isset($_POST['geschlecht']) ? $_POST['geschlecht'] : 'm';
	$values .= 'geschlecht = "'.$geschlecht.'",';
	
	$datum = isset($_POST['geburtstag']) ? utf8_decode($_POST['geburtstag']) : '';
	$geburtstag= date_german2mysql($datum);
	$values .= 'geburtstag = "'.$geburtstag.'",';

	$bild = isset($_POST['bild']) ? utf8_decode($_POST['bild']) : './img/nopicture.jpg';
	$values .= 'bild = "'.$bild.'",';

	$telefonp1 = isset($_POST['telefonp1']) ? utf8_decode($_POST['telefonp1']) : '';
	$values .= 'telefonp1 = "'.$telefonp1.'",';
	
	$telefong1 = isset($_POST['telefong1']) ? utf8_decode($_POST['telefong1']) : '';
	$values .= 'telefong1 = "'.$telefong1.'",';

	$emailp1 = isset($_POST['emailp1']) ? utf8_decode($_POST['emailp1']) : '';
	$values .= 'emailp1 = "'.$emailp1.'",';
	
	$emailg1 = isset($_POST['emailg1']) ? utf8_decode($_POST['emailg1']) : '';
	$values .= 'emailg1 = "'.$emailg1.'",';

	$websitep1 = isset($_POST['websitep1']) ? utf8_decode($_POST['websitep1']) : '';
	$values .= 'websitep1 = "'.$websitep1.'",';
	
	$websiteg1 = isset($_POST['websiteg1']) ? utf8_decode($_POST['websiteg1']) : '';
	$values .= 'websiteg1 = "'.$websiteg1.'",';

	$notizen = isset($_POST['notizen']) ? utf8_decode($_POST['notizen']) : '';
	$values .= 'notizen	= "'.$notizen.'"';
		

	if ($action == 'UPDATE') {
		$q  = 'update adressen set '.$values.' where addrid = '.$addrid;	
	} else {	
		$q  = 'insert into adressen set '.$values;
	}
	$res = mysql_query($q);
	if (!$res) {
		echo "Query failed\n<br><b>$q</b>\n";
		echo mysql_error(); 
	} else {
		$act = $action == 'UPDATE' ? 'aktualisiert' : 'eingefügt'; 
		$msg = 'Der Datensatz mit der AdressId '.$addrid.' wurde '.$act.'.';
		print json_encode($msg);
	}
	 
}

function date_german2mysql($datum) {
	if ($datum == null) { $datum = '00.00.0000'; }
	list($tag, $monat, $jahr) = explode('.', $datum);
	if(checkdate($monat,$tag,$jahr)) {
		return sprintf("%04d-%02d-%02d", $jahr, $monat, $tag);
	} else {
		return false; /* sprintf("%04d-%02d-%02d", '00', '00', '000'); */
	}
}

function updateSingleAddress() {
	$addrid = intval($_POST['addrid']);
//	var_dump($_POST);
	if (is_numeric($addrid) && $addrid > 0) {
		saveAddress($addrid,'UPDATE');
	}
}

function deleteAddress($addrid) {
	$q = 'delete from adressen where addrid='.$addrid;
	$res = mysql_query($q);
	if (!$res) {
		echo "Query failed\n<br><b>$q</b>\n";
    echo mysql_error(); 
	} else {
		$msg = 'Der Datensatz mit der AdressId '.$addrid.' wurde gelöscht';
		print json_encode($msg);
	}
}


?>