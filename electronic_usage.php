<?php
$start = time();

header("Content-Type: text/xml; charset=utf-8");
echo '<?xml version="1.0" encoding="utf-8"?>'."\n";

$plans = array(
    (object) array('id' => 1, 'name' => 'Cable Basic (5 mbps)', 'limit_gb' => 50, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 25),
    (object) array('id' => 2, 'name' => 'Cable High Speed (10 mbps)', 'limit_gb' => 100, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 25),
    (object) array('id' => 3, 'name' => 'Cable High Speed (10 mbps)', 'limit_gb' => 250, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 25),
    (object) array('id' => 4, 'name' => 'Cable High Speed (10 mbps)', 'limit_gb' => 500, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 25),
    (object) array('id' => 5, 'name' => 'Cable High Speed + (15 mbps)', 'limit_gb' => 125, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 6, 'name' => 'Cable High Speed + (15 mbps)', 'limit_gb' => 250, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 7, 'name' => 'Cable High Speed + (15 mbps)', 'limit_gb' => 500, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 8, 'name' => 'Cable Extreme 20', 'limit_gb' => 150, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 9, 'name' => 'Cable Extreme 20', 'limit_gb' => 250, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 10, 'name' => 'Cable Extreme 20', 'limit_gb' => 500, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 11, 'name' => 'Cable Extreme 30', 'limit_gb' => 250, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 12, 'name' => 'Cable Extreme 30', 'limit_gb' => 500, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 13, 'name' => 'Cable Extreme 60', 'limit_gb' => 250, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 14, 'name' => 'Cable Extreme 60', 'limit_gb' => 500, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 15, 'name' => 'DSL Basic 6', 'limit_gb' => 100, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 25),
    (object) array('id' => 16, 'name' => 'DSL Basic 6', 'limit_gb' => 250, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 25),
    (object) array('id' => 17, 'name' => 'DSL FTTN High Speed 10', 'limit_gb' => 100, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 25),
    (object) array('id' => 18, 'name' => 'DSL FTTN High Speed 10', 'limit_gb' => 250, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 25),
    (object) array('id' => 19, 'name' => 'DSL FTTN High Speed 10', 'limit_gb' => 500, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 25),
    (object) array('id' => 20, 'name' => 'DSL FTTN High Speed 15', 'limit_gb' => 100, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 21, 'name' => 'DSL FTTN High Speed 15', 'limit_gb' => 250, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 22, 'name' => 'DSL FTTN High Speed 15', 'limit_gb' => 500, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 23, 'name' => 'DSL FTTN High Speed 25', 'limit_gb' => 250, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 24, 'name' => 'DSL FTTN High Speed 25', 'limit_gb' => 500, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
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
		<amount>75</amount>
	</data_transfer_pkg>
	<data_transfer_pkg>
		<amount>150</amount>
	</data_transfer_pkg>
	<data_transfer_pkg>
		<amount>225</amount>
	</data_transfer_pkg>
	<data_transfer_pkg>
		<amount>300</amount>
	</data_transfer_pkg>
</plans>';
    exit(0);
}

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

function string_contains($haystack, $needle) {
    return strpos($haystack, $needle) !== FALSE;
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

$compteInternet = $_GET['u'];

if (!string_contains($compteInternet, '@')) {
    // Cable (Videotron)

    // Let's try the extranet URL...
    $url = 'https://extranet.videotron.com/services/secur/extranet/tpia/Usage.do?lang=FRENCH&compteInternet=' . $compteInternet;
    $temp = error_reporting(0);
    exec("curl --connect-timeout 5 --max-time 10 -Lks '$url'", $html);
    $html = implode("\n", $html);
    error_reporting($temp);

    // Get latest period (this month)
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
        if (!isset($last_updated)) {
            $last_updated = $day->date;
        }
        $day->download = (int) array_shift($transfers);
        $day->upload = (int) array_shift($transfers);
    }
}
else {
    // DSL
    $url = 'http://74.116.184.9/daloradius-svn-prod/trunk/bandwitdh_check_v2.php?language=en_US&retry=0&username=' . $compteInternet;
    $temp = error_reporting(0);
    exec("curl --connect-timeout 5 --max-time 10 -Ls '$url'", $html);
    error_reporting($temp);

    $found_tables = 0;
    $download_section = FALSE;
    $upload_section = FALSE;
    $download = 0;
    $upload = 0;
    foreach ($html as $line) {
        if (string_contains($line, "Usager invalide")) {
            echo "\t<source_url>" . xmlize($url) . "</source_url>\n";
            echo "\t<error>Electronic Box dit: Usager invalide</error>\n";
            echo "</usage>\n";
            exit(1);
        }

        if (string_contains($line, "<table class='bandwidth'>")) {
            $found_tables++;
        } else if (string_contains($line, "<th>Download</th>") && $found_tables == 2) {
            $download_section = TRUE;
        } else if (string_contains($line, "<th>Upload</th>") && $found_tables == 2) {
            $upload_section = TRUE;
        } else if (string_contains($line, "<td>") && $download_section) {
            if (preg_match('@.*<td>([0-9\.]+) ([MGT])B</td>.*@i', $line, $re)) {
                $download = $re[1];
                if ($re[2] == 'G') {
                    $download *= 1024;
                } else if ($re[2] == 'T') {
                    $download *= (1024*1024);
                }
            }
            $download_section = FALSE;
        } else if (string_contains($line, "<td>") && $upload_section) {
            if (preg_match('@.*<td>([0-9\.]+) ([MGT])B</td>.*@i', $line, $re)) {
                $upload = $re[1];
                if ($re[2] == 'G') {
                    $upload *= 1024;
                } else if ($re[2] == 'T') {
                    $upload *= (1024*1024);
                }
            }
            break;
        }
    }

    $billing_date = $_GET['d'];
    if (empty($billing_date)) {
        $billing_date = 1;
    }
    for ($i=0; $i<31; $i++) {
        $month = date('m', strtotime("$i days ago"));
        $day = date('d', strtotime("$i days ago"));
        $changed_month = isset($last_month) && $last_month != $month;
        if ($billing_date == $day || ($changed_month && $billing_date > $day)) {
            $month_start = strtotime("$i days ago");
            break;
        }
        $last_month = $month;
    }
    $periods = array(
        (object) array(
            'from' => date('Y-m-d 00:00:00', $month_start),
            'to' => date('Y-m-d H:i:s'),
            'download' => $download,
            'upload' => $upload,
        )
    );
    $last_updated = date('Y-m-d H:i:s');
}

echo "\t<source_url>" . xmlize($url) . "</source_url>\n";

// Display transfer data
foreach ($periods as $data) {
	echo "\t<transfer>\n";
    echo "\t\t<last_updated>$last_updated</last_updated>\n";
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
