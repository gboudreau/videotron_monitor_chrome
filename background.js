// For preferences
var username = '';
var lang = chrome.i18n.getMessage('1st') == '1st' ? 'en' : 'fr';

var limitTotal = 250;
var surchargePerGb = 0.50;
var surchargeLimit = 25;

// For AJAX request & response
var xml_request = null;
var last_updated = 0;
var date_last_updated_data = new Date(); date_last_updated_data.setTime(0);
var currentTransfer = null;
var load_usage_error = null;

var last_notification;

$(document).ready(function() {
    reloadPrefs();
	loadUsage();
});

function reloadPrefs() {
	username = localStorage["username"];
	lang = localStorage["lang"];
	if (!lang || lang.length == 0) {
		lang = 'en';
	}
	limitTotal = localStorage['allowed_usage'];
	surchargePerGb = localStorage['surcharge'];
	surchargeLimit = localStorage['surcharge_limit'];
}

function loadUsage() {
	var n = new Date();
	var now = n.getTime();

	var minute = 60*1000;
	var hour = 60*minute;
	var day = 24*hour;

	// only refresh if it's been more than 1h since the last update, or if the data for the day before yesterday hasn't been downloaded yet.
	var lu = new Date(); lu.setTime(last_updated);
	if (last_updated == 0) {
    	console.log("Chrome restarted, or new install. Updating data...");
	} else {
    	console.log("Now: " + n);
    	console.log("Last Updated: " + lu);
    	if ((now - last_updated) <= 1*hour) {
        	console.log("Won't update: data is only refreshed every hour.");
    	}
    	if ((((now - date_last_updated_data.getTime()) > 2*day) && (now - last_updated) > 15*minute)) {
    	    console.log("Oh, oh! Wait... The latest data is more than 2 days old... Let's retry every 15 minutes until it works then.");
    	}
	}
	if ((now - last_updated) > 1*hour || (((now - date_last_updated_data.getTime()) > 2*day) && (now - last_updated) > 15*minute)) {
		if (xml_request != null) {
			xml_request.abort();
			xml_request = null;
		}
		xml_request = new XMLHttpRequest();
		xml_request.onload = function(e) { loadUsage2(e, xml_request); }
		xml_request.overrideMimeType("text/xml");
		xml_request.open("GET", "http://dataproxy.pommepause.com/videotron_usage-12.php?"+username);
		xml_request.setRequestHeader("Cache-Control", "no-cache");
		xml_request.send(null);
    } else {
		chrome.extension.sendRequest({action: 'show'}, function(response) {});
	}

	// Repeat every 12 hours in background
	setTimeout(loadUsage, 12*hour);
}

function loadUsage2(e, request) {
	xml_request = null;
	if (!request.responseXML) {
	    load_usage_error = tt("oh_noes_error", "Response is not XML.");
		last_updated = 0;
		chrome.extension.sendRequest({action: 'show'}, function(response) {});
		return;
	} else {
		// Get the top level <usage> element 
		var usage = findChild(request.responseXML, 'usage');
		if (!usage) {
    	    load_usage_error = tt("oh_noes_error", "No usage tag in response.");
			last_updated = 0;
			chrome.extension.sendRequest({action: 'show'}, function(response) {});
			return;
		}

		var error = findChild(usage, 'error');
		if (error) {
    	    load_usage_error = error.firstChild.data;
			last_updated = 0;
			chrome.extension.sendRequest({action: 'show'}, function(response) {});
			return;
		}
		
		load_usage_error = null;

		var transferPeriods = new Array;
		var transferDays = new Array;

		// Get all transfer elements subordinate to the usage element
		for (var item = usage.firstChild; item != null; item = item.nextSibling) {
			if (item.nodeName == 'transfer') {
				var date = findChild(item, 'date');
				var down = findChild(item, 'download');
				var up = findChild(item, 'upload');
				if (date != null && down != null && up != null) {
					var date_from = findChild(date, 'from');
					var date_to = findChild(date, 'to');
					if (date_from != null && date_to != null) {
						transferPeriods[transferPeriods.length] = {
							date_from: Date.parse(date_from.firstChild.data),
							date_to: Date.parse(date_to.firstChild.data),
							download: down.firstChild.data,
							download_units: down.attributes.getNamedItem('unit').value,
							upload: up.firstChild.data,
							upload_units: up.attributes.getNamedItem('unit').value
						};
					} else {
						transferDays[transferDays.length] = {
							date: Date.parse(date.firstChild.data),
							download: down.firstChild.data,
							download_units: down.attributes.getNamedItem('unit').value,
							upload: up.firstChild.data,
							upload_units: up.attributes.getNamedItem('unit').value
						};
					}
				}
			}
		}
		
		currentTransfer = transferPeriods[0];

		date_last_updated_data = new Date(currentTransfer['date_to']);
		var this_month_start = new Date(currentTransfer['date_from']);
		var next_month_start = new Date(this_month_start); next_month_start.setMonth(next_month_start.getMonth()+1);
		var now = new Date(currentTransfer['date_to']);
		now.setDate(now.getDate()+1);
		if (now.getTime() > next_month_start.getTime()) {
			now = next_month_start;
		}

		down = numberFormatGB(currentTransfer['download'], currentTransfer['download_units']);
		up = numberFormatGB(currentTransfer['upload'], currentTransfer['upload_units']);
		
		// Now data
		var nowPercentage = (now.getTime()-this_month_start.getTime())/(next_month_start.getTime()-this_month_start.getTime());
		var nowBandwidth = parseFloat((nowPercentage*limitTotal-down-up).toFixed(2));
		var n = (down+up) * 100.0 / limitTotal;
		var limitPercentage = n.toFixed(0);
		
		console.log("Got new usage data from server...");
		console.log("Down+Up = " + (down+up));
		
		// 'Today is the $num_days day of your billing month.'
		var num_days = Math.floor((now.getTime()-this_month_start.getTime())/(24*60*60*1000))+1;
		num_days = parseInt(num_days.toFixed(0));
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
        }
        
        var badgeDetails = {text: ''};
        var badgeColorDetails = {color: [200, 100, 100, 255]}; // Dark red
        var titleDetails = {title: t('VL Internet Usage Monitor')};
        var current_notification;
		if (down+up > limitTotal) {
		    // You're doomed!
    		var badgeDetails = {text: '!!'};
            var titleDetails = {title: t("over_limit_too_much_tooltip")};

			var totalDisplay = down+up;
			if (totalDisplay.toFixed) {
				totalDisplay = totalDisplay.toFixed(0);
			}
			var overLimitDisplay = overLimit;
			if (overLimit.toFixed) {
				overLimitDisplay = overLimit.toFixed(0);
			}
            var text = tt('used_and_quota', [totalDisplay, limitTotal]) + tt('current_extra', overLimitDisplay);
            current_notification = {title: t('over_limit_too_much_notif_title'), text: text};
		} else if (nowBandwidth < 0 && num_days != '0th' && num_days != '0e') {
		    // Not on a good path!
    		var badgeDetails = {text: '!'};
    		var badgeColorDetails = {color: [255, 204, 51, 255]}; // Yellow orangish
            var titleDetails = {title: t('expected_over_limit_tooltip')};

			var totalDisplay = down+up;
			if (totalDisplay.toFixed) {
				totalDisplay = totalDisplay.toFixed(0);
			}
			var endOfMonthBandwidthDisplay = endOfMonthBandwidth;
			if (endOfMonthBandwidthDisplay.toFixed) {
				endOfMonthBandwidthDisplay = endOfMonthBandwidthDisplay.toFixed(0);
			}
            var text = tt('used_and_quota', [totalDisplay, limitTotal]) + tt('expected_over_limit_tip', [num_days, endOfMonthBandwidthDisplay]);
            current_notification = {title: t('expected_over_limit_notif_title'), text: text};
		} else {
    		var badgeDetails = {text: '+'};
    		var badgeColorDetails = {color: [0, 153, 0, 255]}; // Green
		    var titleDetails = {title: t('all_is_well')};
		}
		
		chrome.browserAction.setBadgeText(badgeDetails);
		chrome.browserAction.setBadgeBackgroundColor(badgeColorDetails);
		chrome.browserAction.setTitle(titleDetails);
		
        if (current_notification && (!last_notification || current_notification.title != last_notification.title)) {
    		// Show notification
			var show_notifications = localStorage["showNotifications"] == 'true' || typeof localStorage["showNotifications"] == 'undefined';
			if (show_notifications) {
				var notification = webkitNotifications.createNotification(
	                'Images/icon-64.png',
	                current_notification.title,
	                current_notification.text
				);
				notification.show();
			}
        }

		last_notification = current_notification;

		// set last_updated to the current time to keep track of the last time a request was posted
		last_updated = (new Date).getTime();
		
		chrome.extension.sendRequest({action: 'show'}, function(response) {});
	}
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

function findChild(element, nodeName) {
	var child = null;
	for (child = element.firstChild; child != null; child = child.nextSibling) {
		if (child.nodeName == nodeName) {
			break;
		}
	}
	return child;
}

/**
* Handles data sent via chrome.extension.sendRequest().
* @param request Object Data sent in the request.
* @param sender Object Origin of the request.
* @param sendResponse Function The method to call when the request completes.
*/
function onRequest(request, sender, sendResponse) {
	switch(request.action) {
		case 'getUsage':
			sendResponse({currentTransfer: currentTransfer, load_usage_error: load_usage_error});
			return;
		case 'reloadUsage':
        	last_updated = 0;
        	reloadPrefs();
        	loadUsage();
		    return;
		case 'loadUsage':
        	loadUsage();
		    return;
	}
	sendResponse({});
	return;
};

// Wire up the listener.
chrome.extension.onRequest.addListener(onRequest);
