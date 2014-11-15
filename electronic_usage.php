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
    (object) array('id' => 20, 'name' => 'DSL FTTN High Speed 15', 'limit_gb' => 150, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 21, 'name' => 'DSL FTTN High Speed 15', 'limit_gb' => 250, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 22, 'name' => 'DSL FTTN High Speed 15', 'limit_gb' => 500, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 23, 'name' => 'DSL FTTN High Speed 25', 'limit_gb' => 250, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 24, 'name' => 'DSL FTTN High Speed 25', 'limit_gb' => 500, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 25, 'name' => 'DSL FTTN High Speed 50', 'limit_gb' => 250, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 26, 'name' => 'DSL FTTN High Speed 50', 'limit_gb' => 500, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
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

if (string_contains($compteInternet, '@')) {
    // DSL
    $url = 'http://consodsl.electronicbox.net/index.php?actions=list&lng=en&code=' . urlencode($compteInternet);
} else {
    if (strtolower(substr($compteInternet, 0, 2)) == 'vl') {
        // Cable (Quebec)
        $url = 'http://consocable.electronicbox.net/index.php?actions=list&lng=en&codeVL=' . urlencode($compteInternet);
    } else {
        // Cable (Ontario)
        $url = 'http://consocableontario.electronicbox.net/index.php?action=list&lng=en&codeACO=' . urlencode($compteInternet);
    }
}

$temp = error_reporting(0);
exec("curl --connect-timeout 5 --max-time 10 -Lks --socks5 localhost:9050 '$url'", $html);
#exec("curl --connect-timeout 5 --max-time 10 -Lks '$url'", $html);
error_reporting($temp);

$found = FALSE;
foreach ($html as $line) {
    if (string_contains($line, "table_block")) {
        if (preg_match('@.*<hr width=.50px.>([0-9\.]+) ([MGT]).*<hr width=.50px.>([0-9\.]+) ([MGT]).*<hr width=.50px.>([0-9\.]+) ([MGT]).*@i', $line, $re)) {
            $found = TRUE;
            break;
        } else if (preg_match('@.*Download</b><br>([0-9\.]+) ([MGT]).*Upload</b><br>([0-9\.]+) ([MGT]).*Total</b><br>([0-9\.]+) ([MGT]).*@i', $line, $re)) {
            $found = TRUE;
            break;
        }
    }
    if (preg_match('@.*Download[ &nbsp;]*([0-9\.]+) ([MGT]).*Upload[ &nbsp;]*([0-9\.]+) ([MGT]).*Total[ &nbsp;]*([0-9\.]+) ([MGT])@i', $line, $re)) {
        $found = TRUE;
        break;
    }
}

if (!$found) {
    echo "\t<source_url>" . xmlize($url) . "</source_url>\n";
    echo "\t<error>Invalid username, or parsing failed.</error>\n";
    echo "</usage>\n";
    exit(1);
}

$download = $re[1];
if ($re[2] == 'G') {
    $download *= 1024;
} else if ($re[2] == 'T') {
    $download *= (1024*1024);
}

$upload = $re[3];
if ($re[4] == 'G') {
    $upload *= 1024;
} else if ($re[4] == 'T') {
    $upload *= (1024*1024);
}

$periods = array(
    (object) array(
        'from' => date('Y-m-01 00:00:00'),
        'to' => date('Y-m-d H:i:s'),
        'download' => $download,
        'upload' => $upload,
    )
);
$last_updated = date('Y-m-d H:i:s');

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
