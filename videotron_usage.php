<?php
$start = time();

header("Content-Type: text/xml; charset=utf-8");
echo '<?xml version="1.0" encoding="utf-8"?>'."\n";

$plans = array(
	(object) array('id' => 0, 'name' => 'Basic', 'limit_gb' => 2, 'surcharge_per_gb' => 4.50, 'surcharge_limit' => 50, 'end_date' => '2011-03-01'),
	(object) array('id' => 13, 'name' => 'Basic', 'limit_gb' => 3, 'surcharge_per_gb' => 4.50, 'surcharge_limit' => 50, 'start_date' => '2010-03-01', 'end_date' => '2012-02-01'),
	(object) array('id' => 14, 'name' => 'Basic', 'limit_gb' => 4, 'surcharge_per_gb' => 4.50, 'surcharge_limit' => 50, 'start_date' => '2011-02-01'),
	(object) array('id' => 18, 'name' => 'Basic', 'limit_gb' => 5, 'surcharge_per_gb' => 4.50, 'surcharge_limit' => 50, 'start_date' => '2011-04-01'),

	(object) array('id' => 1, 'name' => 'High-Speed', 'limit_gb' => 40, 'surcharge_per_gb' => 4.50, 'surcharge_limit' => 50),
	(object) array('id' => 19, 'name' => 'High-Speed', 'limit_gb' => 50, 'surcharge_per_gb' => 4.50, 'surcharge_limit' => 50, 'start_date' => '2011-04-01'),

	(object) array('id' => 2, 'name' => 'Extreme High-Speed', 'limit_gb' => 100, 'surcharge_per_gb' => 1.50, 'surcharge_limit' => ''),

	(object) array('id' => 3, 'name' => 'Extreme Plus High-Speed', 'limit_gb' => 30, 'surcharge_per_gb' => 7.95, 'surcharge_limit' => ''),

	(object) array('id' => 12, 'name' => 'Ultimate Speed 15', 'limit_gb' => 60, 'surcharge_per_gb' => 1.50, 'surcharge_limit' => '', 'start_date' => '2010-03-01', 'end_date' => '2012-02-01'),
	(object) array('id' => 15, 'name' => 'Ultimate Speed 15', 'limit_gb' => 70, 'surcharge_per_gb' => 1.50, 'surcharge_limit' => '', 'start_date' => '2011-02-01'),
	(object) array('id' => 20, 'name' => 'Ultimate Speed 15', 'limit_gb' => 90, 'surcharge_per_gb' => 1.50, 'surcharge_limit' => '', 'start_date' => '2011-04-01'),
	
	(object) array('id' => 4, 'name' => 'Ultimate Speed 30', 'limit_gb' => 70, 'surcharge_per_gb' => 1.50, 'surcharge_limit' => '', 'end_date' => '2011-03-01'),
	(object) array('id' => 8, 'name' => 'Ultimate Speed 30', 'limit_gb' => 100, 'surcharge_per_gb' => 1.50, 'surcharge_limit' => '', 'start_date' => '2010-03-01', 'end_date' => '2012-02-01'),
	(object) array('id' => 16, 'name' => 'Ultimate Speed 30', 'limit_gb' => 120, 'surcharge_per_gb' => 1.50, 'surcharge_limit' => '', 'start_date' => '2011-02-01'),

	(object) array('id' => 5, 'name' => 'Ultimate Speed 50', 'limit_gb' => 100, 'surcharge_per_gb' => 1.50, 'surcharge_limit' => '', 'end_date' => '2011-03-01'),
	(object) array('id' => 9, 'name' => 'Ultimate Speed 50', 'limit_gb' => 125, 'surcharge_per_gb' => 1.50, 'surcharge_limit' => '', 'start_date' => '2010-03-01', 'end_date' => '2012-02-01'),
	(object) array('id' => 17, 'name' => 'Ultimate Speed 60', 'limit_gb' => 150, 'surcharge_per_gb' => 1.50, 'surcharge_limit' => '', 'start_date' => '2011-02-01'),

	(object) array('id' => 6, 'name' => 'Business - Ultimate Speed 30', 'limit_gb' => 150, 'surcharge_per_gb' => 1.50, 'surcharge_limit' => '', 'end_date' => '2011-03-01'),
	(object) array('id' => 10, 'name' => 'Business - Ultimate Speed 30', 'limit_gb' => 250, 'surcharge_per_gb' => 1.50, 'surcharge_limit' => '', 'start_date' => '2010-03-01'),

	(object) array('id' => 7, 'name' => 'Business - Ultimate Speed 50', 'limit_gb' => 200, 'surcharge_per_gb' => 1.50, 'surcharge_limit' => '', 'end_date' => '2011-03-01'),
	(object) array('id' => 11, 'name' => 'Business - Ultimate Speed 50', 'limit_gb' => 300, 'surcharge_per_gb' => 1.50, 'surcharge_limit' => '', 'start_date' => '2010-03-01'),
);
if (isset($_GET['get_plans'])) {
	echo "<plans>
	";
	foreach ($plans as $plan) {
		if (isset($plan->start_date) && time() < strtotime($plan->start_date)) {
			continue;
		}
		if (isset($plan->end_date) && time() > strtotime($plan->end_date)) {
			continue;
		}
		echo "<plan id=\"$plan->id\">
		<name>$plan->name</name>
		<limit_gb>$plan->limit_gb</limit_gb>
		<surcharge_per_gb>$plan->surcharge_per_gb</surcharge_per_gb>
		<surcharge_limit>$plan->surcharge_limit</surcharge_limit>
	</plan>
	";
	}
	echo '<data_transfer_pkg>
		<amount>0</amount>
	</data_transfer_pkg>
	<data_transfer_pkg>
		<amount>5</amount>
	</data_transfer_pkg>
	<data_transfer_pkg>
		<amount>10</amount>
	</data_transfer_pkg>
	<data_transfer_pkg>
		<amount>15</amount>
	</data_transfer_pkg>
	<data_transfer_pkg>
		<amount>30</amount>
	</data_transfer_pkg>
	<data_transfer_pkg>
		<amount>35</amount>
	</data_transfer_pkg>
	<data_transfer_pkg>
		<amount>40</amount>
	</data_transfer_pkg>
	<data_transfer_pkg>
		<amount>60</amount>
	</data_transfer_pkg>
	<data_transfer_pkg>
		<amount>65</amount>
	</data_transfer_pkg>
	<data_transfer_pkg>
		<amount>90</amount>
	</data_transfer_pkg>
</plans>';
	exit(0);
}

echo "<usage>\n";

#$ips = explode("\n", file_get_contents('/var/www/html/dataproxy.pommepause.com/videotron_unique_ips'));
#if (array_search($_SERVER['REMOTE_ADDR'], $ips) === FALSE) {
if (FALSE) {
	echo "\t<new_version>yes</new_version>\n";
}

function xmlize($string) {
	return str_replace(array('&', '<', '>'), array('&amp;', '&lt;', '&gt;'), $string);
}

$compteInternet = urlencode(array_shift(array_keys($_GET)));
$temp = error_reporting(0);
$url = 'https://www.videotron.com/client/secur/CIUser.do?standardFlow=true&cable.conversionRatio=1024&lang=fr&vl=' . $compteInternet;
exec("curl --connect-timeout 5 --max-time 10 -Lks '$url'", $html);
$html = implode("\n", $html);
error_reporting($temp);

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
while (preg_match("@return overlib\('([0-9]+) ([^<]+)<br */>([amontaval]+)[&nbsp; :]*([0-9\.,]+) ([GM][ob])@i", $html, $regs)) {
	$html = str_replace($regs[0], '', $html);
	
	$regs[2] = mb_convert_encoding($regs[2], 'utf-8', 'iso-8859-1');
	
	// Sometimes, Videotron use , as decimal separator!
	$regs[4] = str_replace(',', '.', $regs[4]);
	
	// Sometimes, Videotron shows Go, even if we ask for Mo...
	if (substr($regs[5], 0, 1) == 'G') {
		$regs[4] = $regs[4] * 1024;
	}
	
	if (date('m') == '01' && $regs[2] == 'décembre') {
		$year = date('Y') - 1;
	} else if (date('m') == '12' && $regs[2] == 'janvier') {
		$year = date('Y') + 1;
	} else {
		$year = date('Y');
	}
	$date = $year . '-' . $months_num[$regs[2]] . '-' . $regs[1];
	
	if (strtotime($date) > time()) {
		continue;
	}

	if (!isset($days[$date])) {
		$days[$date] = (object) array('type' => 'day', 'date' => getFormatedDate($date));
	}
	$days[$date]->{($regs[3] == 'amont') ? 'upload' : 'download'} = (int) $regs[4];
	
	// Sum for the period
	if ($regs[3] == 'amont') {
		$period_total_upload += (int) $regs[4];
	} else if ($regs[3] == 'aval') {
		$period_total_download += (int) $regs[4];
	}
	
	// Find the last day with data
	if ($regs[4] > 0) {
		$last_day = getFormatedDate($date);
	}
}
$days = array_values($days);

if (!isset($days) || count($days) == 0) {
	if (stripos($html, "Nous n'avons pas de donn") !== FALSE) {
		// Let's try the extranet URL...
		$url = 'https://extranet.videotron.com/services/secur/extranet/tpia/Usage.do?lang=FRENCH&compteInternet=' . $compteInternet;
		$temp = error_reporting(0);
		exec("curl --connect-timeout 5 --max-time 10 -Lks --sslv2 '$url'", $html);
		$html = implode("\n", $html);
		error_reporting($temp);
				
		// Get all periods (this month, and 2 previous months)
		while (preg_match("@nowrap=\"nowrap\">([0-9\\-]+) au<br />([0-9\\-]+)</@", $html, $regs)) {
			$html = str_replace($regs[0], '', $html);
			$periods[] = (object) array('type' => 'period', 'from' => getFormatedDate($regs[1]), 'to' => getFormatedDate($regs[2]));
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
		#var_dump($transfers);
		
		if (!isset($days) || count($days) == 0) {
			echo "\t<source_url>" . xmlize($url) . "</source_url>\n";
			echo "\t<error>Vidéotron dit: Nous n'avons pas de données de consommation pour ce compte.</error>\n";
			echo "</usage>\n";
			exit(1);
		}

		$first_period = $periods[0];
		$first_period->to = getFormatedDate(date('Y-m-d', strtotime($first_period->to)-4000));
		foreach ($periods as $period) {
			$period->download = (int) array_shift($transfers);
			$period->upload = (int) array_shift($transfers);
			array_shift($transfers);
		}
		foreach ($days as $day) {
			$day->download = (int) array_shift($transfers);
			$day->upload = (int) array_shift($transfers);
		}
	} else if (stripos($html, "Assurez-vous d'avoir bien inscrit votre nom d'utilisateur Internet vlxxxxxx") !== FALSE) {
		echo "\t<source_url>" . xmlize($url) . "</source_url>\n";
		echo "\t<error>Invalid vlxxxxxx username.</error>\n";
		echo "</usage>\n";
		exit(1);
	} else {
		echo "\t<source_url>" . xmlize($url) . "</source_url>\n";
		echo "\t<error>Invalid vlxxxxxx username.</error>\n";
		echo "</usage>\n";
		exit(1);
	}
} else {
	$first_day = $days[0];
	if (!isset($last_day)) {
        $last_day = $first_day->date;
	}
	$periods[] = (object) array(
		'type' => 'period', 
		'from' => $first_day->date, 
		'to' => $last_day, 
		'upload' => $period_total_upload, 
		'download' => $period_total_download
	);

	$periods[] = (object) array(
		'type' => 'period', 
		'from' => '2000-01-01', 
		'to' => '2000-12-31', 
		'upload' => 0, 
		'download' => 0
	);

	$periods[] = (object) array(
		'type' => 'period', 
		'from' => '2000-01-01', 
		'to' => '2000-12-31', 
		'upload' => 0, 
		'download' => 0
	);
}

echo "\t<source_url>" . xmlize($url) . "</source_url>\n";

// Display transfer data
foreach (array_merge($periods, $days) as $data) {
	echo "\t<transfer>\n";
		if ($data->type == 'period') {
			echo "\t\t<date type=\"period\">\n";
			echo "\t\t\t<from>$data->from</from>\n";
			echo "\t\t\t<to>$data->to</to>\n";
			echo "\t\t</date>\n";
		} else {
			echo "\t\t<date type=\"$data->type\">$data->date</date>\n";
		}
		echo "\t\t<download unit=\"MB\">$data->download</download>\n";
		echo "\t\t<upload unit=\"MB\">$data->upload</upload>\n";
	echo "\t</transfer>\n";
}

function do_post_request($url, $data, $optional_headers = null) {
	$params = array('http' => array(
		'method' => 'POST',
		'content' => $data
	));
	if ($optional_headers !== null) {
		$params['http']['header'] = $optional_headers;
	}
	$ctx = stream_context_create($params);
	$fp = @fopen($url, 'rb', false, $ctx);
	if (!$fp) {
		throw new Exception("Problem with $url, $php_errormsg");
	}
	$response = @stream_get_contents($fp);
	if ($response === false) {
		throw new Exception("Problem reading data from $url, $php_errormsg");
	}
	return $response;
}
?>
</usage>
