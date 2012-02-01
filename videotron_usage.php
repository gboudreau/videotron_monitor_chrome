<?php
$start = time();

header("Content-Type: text/xml; charset=utf-8");
echo '<?xml version="1.0" encoding="utf-8"?>'."\n";
echo "<usage>\n";

if (FALSE) {
	echo "\t<new_version>yes</new_version>\n";
}

function xmlize($string) {
	return str_replace(array('&', '<', '>'), array('&amp;', '&lt;', '&gt;'), $string);
}

function getFormatedDate($dateString) {
	$date = strtotime($dateString);
	return str_replace(date('O', $date), date('I', $date) ? 'EDT' : 'EST', date('r', $date));
}

$months_num = array(
	'janvier' => '01',
	'février' => '02',
	'mars' => '03',
	'avril' => '04',
	'mai' => '05',
	'juin' => '06',
	'juillet' => '07',
	'août' => '08',
	'septembre' => '09',
	'octobre' => '10',
	'novembre' => '11',
	'décembre' => '12',
);

// Get days in current billing month
$days = array();
$period_total_upload = $period_total_download = 0;

// Let's try the extranet URL...
$compteInternet = urlencode(array_shift(array_keys($_GET)));
$url = 'https://extranet.videotron.com/services/secur/extranet/tpia/Usage.do?lang=FRENCH&compteInternet=' . $compteInternet;
$temp = error_reporting(0);
exec("curl --connect-timeout 5 --max-time 10 -Lks --sslv2 '$url'", $html);
$html = implode("\n", $html);
error_reporting($temp);
		
// Get all periods (this month, and 2 previous months)
while (preg_match("@nowrap=\"nowrap\">([0-9\\-]+) au<br />([0-9\\-]+)</@", $html, $regs)) {
	$html = str_replace($regs[0], '', $html);
	$periods[] = (object) array('type' => 'period', 'from' => getFormatedDate($regs[1]), 'to' => getFormatedDate($regs[2]));
	break;
}

// Get all days (60 last days)
while (preg_match("@class=\"reg\">(20[0-9\\-]+)</@", $html, $regs)) {
	$html = str_replace($regs[0], '', $html);
	$days[] = (object) array('type' => 'day', 'date' => getFormatedDate($regs[1]));
}

// Get all the download and upload data, for periods and days
$i = 0;
$pos = strpos($html, 'valign="top" class="reg">');
while ($pos !== FALSE) {
	if (preg_match("@valign=\"top\" class=\"reg\">([0-9\\.]+)</@", substr($html, $pos, 50), $regs)) {
		if ($i++ % 2 == 0 && strpos(substr($html, $pos-20, 20), '<td></td>') === FALSE) {
			$transfers[] = $regs[1];
		}
		$pos += strlen($regs[0]);
	} else {
		$pos += 50;
	}
	$pos = strpos($html, 'valign="top" class="reg">', $pos);
}

if (!isset($days) || count($days) == 0) {
	echo "\t<source_url>" . xmlize($url) . "</source_url>\n";
	echo "\t<error>Vidéotron dit: Nous n'avons pas de données de consommation pour ce compte.</error>\n";
	echo "</usage>\n";
	exit(1);
}

$first_period = $periods[0];
$first_period->to = getFormatedDate(date('Y-m-d', strtotime($first_period->to)));
if (date('Y-m-d', strtotime($first_period->to)) == date('Y-m-d')) {
	$first_period->to = getFormatedDate(date('Y-m-d H:i:s'));
}
foreach ($periods as $period) {
	$period->download = (int) array_shift($transfers);
	$period->upload = (int) array_shift($transfers);
	array_shift($transfers);
}
foreach ($days as $day) {
	$day->download = (int) array_shift($transfers);
	$day->upload = (int) array_shift($transfers);
}

echo "\t<source_url>" . xmlize($url) . "</source_url>\n";

// Display transfer data
foreach ($periods as $data) {
	echo "\t<transfer>\n";
	echo "\t\t<date type=\"period\">\n";
	echo "\t\t\t<from>$data->from</from>\n";
	echo "\t\t\t<to>$data->to</to>\n";
	echo "\t\t</date>\n";
	echo "\t\t<download unit=\"MB\">$data->download</download>\n";
	echo "\t\t<upload unit=\"MB\">$data->upload</upload>\n";
	echo "\t</transfer>\n";
}
?>
</usage>
