<?php
// mein Laptop
if ($_SERVER['HTTP_HOST'] == 'localhost')  { 
	$dbtype    = 'mysqli'; 		// Datenbank-Server Typ
	$server    = 'localhost';
	$benutzer  = 'root';
	$passwort  = '';
	$datenbank = 'adressen';
}
// www.publicdev.ch
elseif ($_SERVER['HTTP_HOST'] == 'www.publicdev.ch' || $_SERVER['HTTP_HOST'] == 'publicdev.ch') {
	$dbtype    = 'mysqli'; 		// Datenbank-Server Typ
	$server    = 'localhost';
	$benutzer  = 'mwd_dbu1';
	$passwort  = '3Ydp#g17';
	$datenbank = 'mwd_adressen';
}

$verbindung = mysql_connect($server,$benutzer,$passwort) or die ('Verbindungsaufnahme mit Datenbank-Server fehlgeschlagen!');

@mysql_select_db($datenbank,$verbindung) or die ('Verbindungsaufnahme mit Datenbank art4art fehlgeschlagen!');
?>