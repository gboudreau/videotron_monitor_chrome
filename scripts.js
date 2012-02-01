// Local
var lang = 'en';
var color_code_upload = false;
var username;
var limitTotal = 250;
var surchargePerGb = 4.50;
var surchargeLimit = 50;

function reloadPrefs() {
	lang = localStorage["lang"];
	if (!lang || lang.length == 0) {
		lang = 'en';
	}

	username = localStorage['username'];
	limitTotal = localStorage['allowed_usage'];
	surchargePerGb = localStorage['surcharge'];
	surchargeLimit = localStorage['surcharge_limit'];

	color_code_upload = localStorage["colorCodeUpload"] == 'true';
}

function savePrefs() {
	limitTotal = parseInt($("#allowed_usage").val());
	surchargePerGb = parseFloat($("#surcharge").val().replace(',', '.'));
	surchargeLimit = parseFloat($("#surcharge_limit").val().replace(',', '.'));

	// save preferences
	localStorage['allowed_usage'] = limitTotal;
	localStorage['surcharge'] = surchargePerGb;
	localStorage['surcharge_limit'] = surchargeLimit;
	localStorage['username'] = $("#username").val() == 'vlxxxxxx' ? '' : $("#username").val();
	localStorage['lang'] = $("#lang").val();
	localStorage['colorCodeUpload'] = $("#color_code_upload")[0].checked;
	
	reloadPrefs();

	chrome.extension.sendRequest({action: 'reloadUsage'}, function(response) {});

    // Update status to let user know options were saved.
    $("#status").html(t("options_saved"));
    setTimeout(function() { $("#status").html(""); translate(); }, 1250);
}

function show() {
	reloadPrefs();
	
	translate(); // Maybe language changed; need to re-translate strings if so.

	if (!username || username == null || username.length == 0) {
		$('#loading').css('display', 'none');
		$('#needs_config').css('display', 'block');
		return;
	}

	$("#ohnoes").css('display', "none");
	$('#needs_config').css('display', 'none');
	if ($('#this_month').css('display') == 'none') {
		$('#loading').css('top', '30px');
		$('#loading').css('display', 'block');
	} else {
		$('#this_month_loader').css('display', 'inline');
		$('#this_month_meter_1').css('marginTop', '-5px');
	}

	chrome.extension.sendRequest({action : 'getUsage'}, function(response) {
		var currentTransfer = response.currentTransfer;
		
		if (response.load_usage_error) {
			$('#ohnoes').html(t(response.load_usage_error));
			$("#ohnoes").css('display', "block");
			$("#loading").css('display', "none");
			$('#this_month_loader').css('display', "none");
			$('#this_month_meter_1').css('marginTop', '');
			$('#this_month').css('display', "none");
			$('#this_month_bandwidth').css('display', "none");
			$("#last_updated").css('display', "none");
			setTimeout(show, 30000);
			return;
		}

		if (currentTransfer == null) {
			setTimeout(show, 2000);
			return;
		}

		$("#ohnoes").css('display', "none");

		$("#loading").css('display', "none");
		$('#this_month_loader').css('display', "none");
		$('#this_month_meter_1').css('marginTop', '');
		$("#last_updated").css('display', "block");
		$('#needs_config').css('display', 'none');

		$('#this_month_start').html('('+t('started')+' '+dateFormat(currentTransfer['date_from'])+')');
		var last_updated_date = new Date(currentTransfer['date_to']);
		last_updated_date.setDate(last_updated_date.getDate()-1);
		$('#this_month_end').html(dateFormat(last_updated_date));

		var this_month_start = new Date(currentTransfer['date_from']);
		var next_month_start = new Date(this_month_start); next_month_start.setMonth(next_month_start.getMonth()+1);
		var now = new Date(currentTransfer['date_to']);

		down = numberFormatGB(currentTransfer['download'], currentTransfer['download_units']);
		up = numberFormatGB(currentTransfer['upload'], currentTransfer['upload_units']);
		
		$('#this_month_down').html((down < 1 ? '0' : '') + down.toFixed(2) + ' ' + t("GB"));
		$('#this_month_up').html((up < 1 ? '0' : '') + up.toFixed(2) + ' ' + t("GB"));
		$('#this_month_total').html((down + up < 1 ? '0' : '') + (down + up).toFixed(2) + ' ' + t("GB"));

		$('#this_month').css('display', "block");

		checkLimits(down, up);

		// Now bar(s)
		var nowPercentage = (now.getTime()-this_month_start.getTime())/(next_month_start.getTime()-this_month_start.getTime());
		var metersWidth = 361;
		var nowPos = parseInt((nowPercentage*metersWidth).toFixed(0));
		if (nowPos > (metersWidth)) { nowPos = metersWidth; }
		$('#this_month_now_1').css('left', (29+nowPos)+'px');
		var nowBandwidth = parseFloat((nowPercentage*(limitTotal)-down-up).toFixed(2));

		if (parseInt($('#this_month_meter_1_end').css('left').replace('px','')) <= 1+parseInt(nowPos)) {
			$('#this_month_now_1_img')[0].src = 'Images/now.gif';
		} else {
			$('#this_month_now_1_img')[0].src = 'Images/now_nok.gif';
		}
		$('#this_month_bandwidth').css('display', "");
		if (getLimitPercentage(down+up, limitTotal) > 100) {
			var overLimit = ((down+up) - limitTotal) * surchargePerGb;
			if (overLimit > surchargeLimit) {
				overLimit = surchargeLimit;
			}
			$('#this_month_now_bw_usage').html('<span class="nowbw neg">' + tt('over_limit_get_packages', overLimit.toFixed(0)) + '</span>');
		} else {
			$('#this_month_now_bw_usage').html(tt('accumulated_daily_surplus', [nowBandwidth > 0 ? 'pos' : 'neg', nowBandwidth, (nowPercentage < 1 ? (nowBandwidth > 0 ? t("download_more") : t("slow_down")) : '')]));
		}
    });
}

function checkLimits(currentDown, currentUp) {
	$('#this_month_now_1').css('display', 'inline');

	// Numbers colors
	$('#this_month_total').css('fontWeight', 'bold');
	$('#this_month_total').css('color', getLimitColor(currentDown+currentUp, limitTotal));
	$('#this_month_down').css('fontWeight', 'normal');
	$('#this_month_up').css('fontWeight', 'normal');
	$('#this_month_down').css('color', "#000000");
	$('#this_month_up').css('color', "#000000");
	
	// Meters
	var metersWidth = 360;
	$('#this_month_meter_1_text').html(t('download_and_upload'));
	var x = (getLimitPercentage(currentDown+currentUp, limitTotal)*metersWidth/100.0 + 1).toFixed(0);
	if (x > (metersWidth+1)) { x = (metersWidth+1); }
	$('#this_month_meter_1_end').css('width', ((metersWidth+1)-x) + 'px');
	$('#this_month_meter_1_end').css('left', x + 'px');

	if (color_code_upload) {
		x = (getLimitPercentage(currentUp, limitTotal)*metersWidth/100.0 + 1).toFixed(0);
		$('#this_month_meter_1_start').css('width', x + 'px');
		$('#this_month_meter_1_start').css('left', '1px');
	} else {
		$('#this_month_meter_1_start').css('width', '0px');
	}

	// Percentage
	$('#this_month_percentage_1').css('left', t('this_month_percentage_1_pos_total'));
	$('#this_month_percentage_1').html(getLimitPercentage(currentDown+currentUp, limitTotal)+'%');
}

function getLimitPercentage(number, limit) {
	return (number * 100.0 / limit).toFixed(0);
}

function getLimitColor(number, limit) {
	var color = '#01B200';
	if (getLimitPercentage(number, limit) >= 75) {
		color = '#D79800';
	}
	if (getLimitPercentage(number, limit) >= 90) {
		color = '#FF7F00';
	}
	if (getLimitPercentage(number, limit) >= 98) {
		color = '#FF0900';
	}
	return color;
}

function dateFormat(d) {
	if (typeof d == 'string') {
		d = new Date(d);
	}
	return d.getFullYear()+'-'+(d.getMonth()+1 < 10 ? '0'+(d.getMonth()+1) : (d.getMonth()+1))+'-'+(d.getDate() < 10 ? '0'+d.getDate() : d.getDate());
}

var units = new Array("B","KB","MB","GB");
function numberFormatGB(number, unit) {
	var go = false;
	for (var i = 0, len = units.length; i < len; i++) {
		if (go) {
			number = number / 1024;
		}
		if (units[i] == unit) {
			go = true;
		}
	}
	return number;
}

/***********************************/
// Internationalization
/***********************************/

function t(key) {
	var text = chrome.i18n.getMessage(key);
	return text == '' ? key : text;
}

function tt(key, substitutions) {
	var text = chrome.i18n.getMessage(key, substitutions);
	return text == '' ? key : text;
}
