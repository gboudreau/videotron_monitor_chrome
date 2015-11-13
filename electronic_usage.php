<?php
header("Content-Type: text/xml; charset=utf-8");
echo '<?xml version="1.0" encoding="utf-8"?>'."\n";

$plans = array(
    (object) array('id' => 1, 'name' => 'Cable Basic (5 mbps)', 'limit_gb' => 100, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 50),
    (object) array('id' => 28, 'name' => 'Cable Basic (5 mbps)', 'limit_gb' => 250, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 50),
    (object) array('id' => 2, 'name' => 'Cable High Speed (10 mbps)', 'limit_gb' => 125, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 50),
    (object) array('id' => 3, 'name' => 'Cable High Speed (10 mbps)', 'limit_gb' => 250, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 50),
    (object) array('id' => 4, 'name' => 'Cable High Speed (10 mbps)', 'limit_gb' => 500, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 50),
    (object) array('id' => 5, 'name' => 'Cable High Speed + (15 mbps)', 'limit_gb' => 150, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 50),
    (object) array('id' => 6, 'name' => 'Cable High Speed + (15 mbps)', 'limit_gb' => 350, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 50),
    (object) array('id' => 7, 'name' => 'Cable High Speed + (15 mbps)', 'limit_gb' => 500, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 50),
    (object) array('id' => 8, 'name' => 'Cable Extreme 20', 'limit_gb' => 150, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 9, 'name' => 'Cable Extreme 20', 'limit_gb' => 250, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 10, 'name' => 'Cable Extreme 20', 'limit_gb' => 500, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 29, 'name' => 'Cable Extreme 30', 'limit_gb' => 150, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 11, 'name' => 'Cable Extreme 30', 'limit_gb' => 250, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 12, 'name' => 'Cable Extreme 30', 'limit_gb' => 500, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 13, 'name' => 'Cable Extreme 60', 'limit_gb' => 250, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 14, 'name' => 'Cable Extreme 60', 'limit_gb' => 500, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 15, 'name' => 'DSL Basic 6', 'limit_gb' => 150, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 50),
    (object) array('id' => 16, 'name' => 'DSL Basic 6', 'limit_gb' => 350, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 50),
    (object) array('id' => 17, 'name' => 'DSL FTTN High Speed 10', 'limit_gb' => 150, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 50),
    (object) array('id' => 18, 'name' => 'DSL FTTN High Speed 10', 'limit_gb' => 350, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 50),
    (object) array('id' => 19, 'name' => 'DSL FTTN High Speed 10', 'limit_gb' => 1000, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => 50),
    (object) array('id' => 20, 'name' => 'DSL FTTN High Speed 15', 'limit_gb' => 150, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 21, 'name' => 'DSL FTTN High Speed 15', 'limit_gb' => 350, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 22, 'name' => 'DSL FTTN High Speed 15', 'limit_gb' => 1000, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 27, 'name' => 'DSL FTTN High Speed 25', 'limit_gb' => 150, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 23, 'name' => 'DSL FTTN High Speed 25', 'limit_gb' => 350, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 24, 'name' => 'DSL FTTN High Speed 25', 'limit_gb' => 1000, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 30, 'name' => 'DSL FTTN High Speed 50', 'limit_gb' => 150, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 25, 'name' => 'DSL FTTN High Speed 50', 'limit_gb' => 350, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
    (object) array('id' => 26, 'name' => 'DSL FTTN High Speed 50', 'limit_gb' => 1000, 'surcharge_per_gb' => 0.50, 'surcharge_limit' => ''),
);
if (isset($_GET['get_plans'])) {
    echo '<plans>
	';
    foreach ($plans as $plan) {
        if (isset($plan->start_date) && time() < strtotime($plan->start_date)) {
            continue;
        }
        if (isset($plan->end_date) && time() > strtotime($plan->end_date)) {
            continue;
        }
        echo "<plan id=\"$plan->id\">
		<name>" . xmlize($plan->name) . "</name>
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

// Chrome extension 0.7.0+ doesn't using this proxy anymore, instead it loads data directly from eBox
echo "<usage>\n";
echo "\t<source_url>" . xmlize($url) . "</source_url>\n";
echo "\t<error>Please update your Chrome extension (to 0.7.1+); this new version will try to load data from ElectronicBox directly, instead of using my own server as a proxy.</error>\n";
echo "</usage>\n";
exit(1);

function xmlize($string) {
    return str_replace(array('&', '<', '>'), array('&amp;', '&lt;', '&gt;'), $string);
}
