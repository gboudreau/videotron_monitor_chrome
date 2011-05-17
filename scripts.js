// Local
var color_code_upload = false;

// From selectedPlan
var limitTotal = 50;
var surchargePerGb = 4.50;
var surchargeLimit = 50;
var maxTransferPackages = 90;

function reloadPrefs() {
	color_code_upload = localStorage["colorCodeUpload"] == 'true';
}

function savePrefs() {
	// save preferences
	localStorage['userkey'] = $("#userkey").val();
	localStorage['colorCodeUpload'] = $("#color_code_upload")[0].checked;
	
	chrome.extension.sendRequest({action : 'loadUsage'}, function() {});

    // Update status to let user know options were saved.
    $("#status").html(t("options_saved"));
    setTimeout(function() { $("#status").html(""); translate(); }, 1250);
}

function show() {
	reloadPrefs();
	
	var userkey = localStorage['userkey'];
	if (!userkey || userkey == null || userkey.length == 0) {
    	console.log(userkey)
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
		
		response = response.response;

		if (response == null) {
			setTimeout(show, 2000);
			return;
		}

		limitTotal = parseInt(response.maxCombinedBytes/1024/1024/1024);
		surchargeLimit = response.surchargeLimit;
		surchargePerGb = response.surchargePerGb;
		
		$("#ohnoes").css('display', "none");

		$("#loading").css('display', "none");
		$('#this_month_loader').css('display', "none");
		$('#this_month_meter_1').css('marginTop', '');
		$("#last_updated").css('display', "block");
		$('#needs_config').css('display', 'none');

		$('#this_month_start').html('('+t('started')+' '+dateFormat(response.periodStartDate)+')');
		var last_updated_date = new Date(response.usageTimestamp);
		$('#this_month_end').html(dateFormat(last_updated_date, true));

		var this_month_start = new Date(response.periodStartDate);
		var next_month_start = new Date(response.periodEndDate); next_month_start.setDate(next_month_start.getDate()+1);
		var now = new Date(response.usageTimestamp);

		down = numberFormatGB(response.downloadedBytes, 'B');
		up = numberFormatGB(response.uploadedBytes, 'B');
		
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
		var nowBandwidth = parseFloat((nowPercentage*limitTotal-down-up).toFixed(2));

    	// 'Today is the $num_days day of your billing month.'
    	var num_days = Math.floor((now.getTime()-this_month_start.getTime())/(24*60*60*1000))+1;
    	num_days = parseInt(num_days.toFixed(0));

		if (parseInt($('#this_month_meter_1_end').css('left').replace('px','')) <= 1+parseInt(nowPos) || num_days == 0) {
			$('#this_month_now_1_img')[0].src = 'Images/now.gif';
		} else {
			$('#this_month_now_1_img')[0].src = 'Images/now_nok.gif';
		}
		$('#this_month_bandwidth').css('display', "");

    	// Now data
    	var n = (down+up) * 100.0 / limitTotal;
    	var limitPercentage = n.toFixed(0);

    	// 'Today is the $num_days day of your billing month.'
    	switch (num_days) {
    	    case 1: num_days = t('1st'); break;
    	    case 2: num_days = t('2nd'); break;
    	    case 3: num_days = t('3rd'); break;
    	    case 21: num_days = t('21st'); break;
    	    case 22: num_days = t('22nd'); break;
    	    case 23: num_days = t('23rd'); break;
    	    case 31: num_days = t('31st'); break;
    	    default: num_days = num_days + t('th');
    	}
    	var endOfMonthBandwidth = (down+up) / nowPercentage;

    	if (limitPercentage > 100) {
    	    // 'Current extra charges: $overLimit'
    		var overLimit = ((down+up) - limitTotal) * surchargePerGb;
    		if (overLimit > surchargeLimit) {
    			overLimit = surchargeLimit;
    		}

            // 'Extra charges with $maxTransferPackages of transfer packages (the maximum): $hypotetic_overLimit.'
    		var hypoteticOverLimit = ((down+up) - (limitTotal+maxTransferPackages)) * surchargePerGb;
    		if (hypoteticOverLimit > surchargeLimit) {
    			hypoteticOverLimit = surchargeLimit;
    		} else if (hypoteticOverLimit < 0) {
    		    // 'To get no extra charges, you'd need to buy another $extraPackages of extra transfer packages.'
    		    for (var i=0; i<transferPackages.length; i++) {
    		        if ((down+up) - (limitTotal+transferPackages[i]) < 0) {
    		            extraPackages = transferPackages[i];
    		            break;
    		        }
    		    }
    		}
        }

    	if (down+up > limitTotal+maxTransferPackages) {
    	    // You're doomed!
            var text = '<span class="nowbw neg">' + tt('used_and_quota', [(down+up).toFixed(0), limitTotal]) + tt('current_extra', overLimit.toFixed(0)) + '</span>';
    	} else if (down+up > limitTotal) {
    	    // All is not lost... Buy transfer packages!
            var text = '<span class="nowbw neg">' + tt('used_and_quota', [(down+up).toFixed(0), limitTotal]) + tt('current_extra', overLimit.toFixed(0)) + tt('over_limit_tip', extraPackages.toString()) + '</span>';
    	} else if (nowBandwidth < 0 && num_days != '0th') {
    	    // Not on a good path!
            var text = '<span class="nowbw neg">' + tt('used_and_quota', [(down+up).toFixed(0), limitTotal]) + tt('expected_over_limit_tip', [num_days, endOfMonthBandwidth.toFixed(0)]) + '</span>';
    	} else {
			var text = tt('accumulated_daily_surplus', ['neg', nowBandwidth, (nowBandwidth > 0 ? t("download_more") : '')]);
    	}
    	$('#this_month_now_bw_usage').html(text);
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

function dateFormat(d, include_time) {
    if (typeof include_time == 'undefined') {
        include_time = false;
    }
	if (typeof d == 'string') {
		d = new Date(d);
	}
	return d.getFullYear()+'-'+(d.getMonth()+1 < 10 ? '0'+(d.getMonth()+1) : (d.getMonth()+1))+'-'+(d.getDate() < 10 ? '0'+d.getDate() : d.getDate()) + (include_time ? (' ' + d.getHours() + ':' + d.getMinutes()) : '');
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
