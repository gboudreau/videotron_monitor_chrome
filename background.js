// For preferences
var username = '';
var lang = chrome.i18n.getMessage('1st') == '1st' ? 'en' : 'fr';

var xml_request_2 = null;
var plans = new Array();
var transferPackages = new Array();
var load_plans_error = null;
var maxTransferPackages = 0;

var username = '';

var defaultPlanId = 2; // Default selected plan (High Speed 100GB)
var planId = defaultPlanId;
var selectedPlan = null;
var dataTransferPackagesBought = 0;
var dataTransferPackagesBoughtWhen = null;

// From selectedPlan
var limitTotal = 250;
var surchargePerGb = 0.50;
var surchargeLimit = 25;

// For AJAX request & response
var xml_request = null;
var last_updated = 0;
var last_up_down = 0;
var date_last_updated_data = new Date(); date_last_updated_data.setTime(0);
var currentTransfer = null;
var load_usage_error = null;
var developer_message = null;
var developer_message_on_error = null;

var last_notification;
var retry_timeout;

$(document).ready(function() {
    reloadPrefs();
    load_plans_error = tt("oh_noes_error", "Couldn't load available plans from server. Will retry soon...");
    retry_timeout = 1;
    loadPlans();
});

function loadPlans() {
    if (plans.length == 0) {
        developer_message = null;
        developer_message_on_error = null;
        if (xml_request_2 != null) {
            xml_request_2.abort();
            xml_request_2 = null;
        }
        xml_request_2 = new XMLHttpRequest();
        xml_request_2.onload = function(e) { loadPlans2(e, xml_request_2); }
        xml_request_2.addEventListener("error", loadPlansFailed);
        xml_request_2.overrideMimeType("text/xml");
        xml_request_2.open("GET", "http://dataproxy.pommepause.com/electronic_usage-1.php?get_plans=1");
        xml_request_2.setRequestHeader("Cache-Control", "no-cache");
        xml_request_2.send(null);
    }
}

function loadPlansFailed(e) {
    load_plans_error = tt("oh_noes_error", "Couldn't load available plans from server (Request failed). Will retry in " + retry_timeout + " seconds...");
    last_updated = 0;
    setTimeout(loadPlans, retry_timeout*1000);
    console.log("Will retry in " + retry_timeout + " seconds...");
    retry_timeout *= 2;
}

function loadPlans2(e, request) {
    if (typeof planId == 'undefined' || planId.length == 0 || planId < 0) {
        limitTotal = localStorage["limitTotal"];
        if (!limitTotal || limitTotal.length == 0) {
            planId = defaultPlanId;
        } else {
            limitTotal = parseInt(limitTotal);
            for (var i=0; i<plans.length; i++) {
                if (limitTotal == plans[i].limit_gb) {
                    planId = i;
                    localStorage['planId'] = planId;
                    break;
                }
            }
        }
    }
    if (e != null) {
        xml_request_2 = null;
        if (!request.responseXML) {
            load_plans_error = tt("oh_noes_error", "Couldn't load available plans from server (Response is not XML). Will retry in " + retry_timeout + " seconds...");
            last_updated = 0;
            setTimeout(loadPlans, retry_timeout*1000);
            console.log("Will retry in " + retry_timeout + " seconds...");
            retry_timeout *= 2;
            return;
        } else {
            // Get the top level <plans> element
            var plansXml = findChild(request.responseXML, 'plans');
            if (!plansXml) {
                load_plans_error = tt("oh_noes_error", "No 'plans' tag in response.");
                last_updated = 0;
                return;
            }

            load_plans_error = null;

            for (var item = plansXml.firstChild; item != null; item = item.nextSibling) {
                if (item.nodeName == 'developer_message') {
                    developer_message = tt("oh_noes_error", item.firstChild.data);
                }
                if (item.nodeName == 'developer_message_on_error') {
                    developer_message_on_error = tt("oh_noes_error", item.firstChild.data);
                }
                if (item.nodeName == 'plan') {
                    var id = item.attributes.getNamedItem('id').value;
                    var name = findChild(item, 'name');
                    var limit_gb = findChild(item, 'limit_gb');
                    var surcharge_per_gb = findChild(item, 'surcharge_per_gb');
                    var surcharge_limit = findChild(item, 'surcharge_limit');
                    var p = new Object();
                    p.id = id;
                    p.name = name.firstChild.data;
                    p.limit_gb = limit_gb.firstChild.data;
                    p.surcharge_per_gb = surcharge_per_gb.firstChild.data;
                    if (surcharge_limit.firstChild) {
                        p.surcharge_limit = surcharge_limit.firstChild.data;
                    } else {
                        p.surcharge_limit = 999999;
                    }
                    if (planId == p.id) {
                        selectedPlan = p;
                        limitTotal = parseInt(p.limit_gb);

                    }
                    plans.push(p);
                }
                if (item.nodeName == 'data_transfer_pkg') {
                    var amount = parseInt(findChild(item, 'amount').firstChild.data);
                    transferPackages.push(amount);
                    if (amount > maxTransferPackages) {
                        maxTransferPackages = amount;
                    }
                }
            }

            loadUsage();
        }
    }
}

function loadUsage() {
    if (developer_message) {
	    load_usage_error = developer_message;
        console.log("Showing developer_message: " + developer_message);
    	last_updated = 0;
    	chrome.extension.sendRequest({action: 'show'}, function(response) {});
    	return;
    }
    
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
        var params = "actions=list&lng=en&code=" + escape(username);
		//xml_request.open("POST", "http://dataproxy.pommepause.com/electronic_usage-1.html"); // Test HTML
        xml_request.open("POST", "http://conso.electronicbox.net/index.php");
		xml_request.setRequestHeader("Cache-Control", "no-cache");
		xml_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xml_request.send(params);
    } else {
		chrome.extension.sendRequest({action: 'show'}, function(response) {});
	}

	// Repeat every 4 hours in background
	setTimeout(loadUsage, 4*hour);
}

function loadUsage2(e, request) {
	xml_request = null;
	if (!request.response) {
	    load_usage_error = tt("oh_noes_error", "Couldn't load Internet Usage data (HTML) from ElectronicBox.");
		last_updated = 0;
		chrome.extension.sendRequest({action: 'show'}, function(response) {});
		return;
	} else {
		load_usage_error = null;

		var transferPeriods = new Array;

        var html = request.response.split("\n");
        for (var i=0; i<html.length; i++) {
            var line = html[i];
            if (line.indexOf("table_block") > -1) {
                var re = line.match(/.*<hr width=.50px.>([0-9\.]+) ([MGT]).*<hr width=.50px.>([0-9\.]+) ([MGT]).*<hr width=.50px.>([0-9\.]+) ([MGT]).*/i);
                if (re) {
                    var download = re[1];
                    if (re[2] == 'G') {
                        download *= 1024;
                    } else if (re[2] == 'T') {
                        download *= (1024*1024);
                    }

                    var upload = re[3];
                    if (re[4] == 'G') {
                        upload *= 1024;
                    } else if (re[4] == 'T') {
                        upload *= (1024*1024);
                    }

                    var now = new Date();
                    var firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                    
                    transferPeriods[0] = {
                        date_last_updated: now.toString(),
                        date_from: firstDay.toString(),
                        date_to: now.toString(),
                        download: download,
                        download_units: 'MB',
                        upload: upload,
                        upload_units: 'MB'
                    };
                    break;
                }
            }
        }
        
    	if (transferPeriods.length == 0) {
            console.log("Error: table_block not found in HTML: " + request.response);
            if (developer_message_on_error) {
        	    load_usage_error = developer_message_on_error;
                console.log("Showing developer_message_on_error: " + developer_message_on_error);
            } else {
                console.log("Showing generic error message.");
        	    load_usage_error = tt("oh_noes_error", "Couldn't load Internet Usage from ElectronicBox (table_block not found in HTML response).");
            }
    		last_updated = 0;
    		chrome.extension.sendRequest({action: 'show'}, function(response) {});
    		return;
    	}
        
        if (!dataTransferPackagesBoughtWhen || dataTransferPackagesBoughtWhen <= transferPeriods[0]['date_from']) {
            dataTransferPackagesBought = 0;
            localStorage['dataTransferPackagesBought'] = dataTransferPackagesBought;
        }

        currentTransfer = transferPeriods[0];

		down = numberFormatGB(currentTransfer['download'], currentTransfer['download_units']);
		up = numberFormatGB(currentTransfer['upload'], currentTransfer['upload_units']);

        if (last_up_down != 0 && last_up_down != up+down) {
            // Up and/or Down changed; update the 'Last Updated: ...' label in the popup to reflect that.
            // Otherwise, we will simply show what the API sent up (the last day we have data for).
            currentTransfer['date_last_updated'] = (new Date).toString();
        }
        last_up_down = up+down;
        
		date_last_updated_data = new Date(currentTransfer['date_last_updated']);
		var this_month_start = new Date(currentTransfer['date_from']);
		var next_month_start = new Date(this_month_start); next_month_start.setMonth(next_month_start.getMonth()+1);
		var now = new Date(currentTransfer['date_to']);
		now.setDate(now.getDate()+1);
		if (now.getTime() > next_month_start.getTime()) {
			now = next_month_start;
		}
		
		// Now data
		var nowPercentage = (now.getTime()-this_month_start.getTime())/(next_month_start.getTime()-this_month_start.getTime());
        var nowBandwidth = parseFloat((nowPercentage*(limitTotal+dataTransferPackagesBought)-down-up).toFixed(2));
        var n = (down+up) * 100.0 / (limitTotal+dataTransferPackagesBought);
		var limitPercentage = n.toFixed(0);
		
		console.log("Got new usage data from server...");
		console.log("Down+Up = " + (down+up));
		
		// 'Today is the $num_days day of your billing month.'
		var num_days = Math.floor((now.getTime()-this_month_start.getTime())/(24*60*60*1000))+1;
		num_days = parseInt(num_days.toFixed(0));
        num_days = tt_date(num_days); // 1st, 2nd...
		var endOfMonthBandwidth = (down+up) / nowPercentage;

		if (down+up > limitTotal) {
		    // 'Current extra charges: $overLimit'
            var overLimit = ((down+up) - (limitTotal+dataTransferPackagesBought)) * surchargePerGb;
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
                        extraPackages = transferPackages[i] - dataTransferPackagesBought;
                        break;
                    }
                }
            }
        }
        
        var badgeDetails = {text: ''};
        var badgeColorDetails = {color: [200, 100, 100, 255]}; // Dark red
        var titleDetails = {title: t('VL Internet Usage Monitor')};
        var current_notification;
        if (down+up > limitTotal+maxTransferPackages) {
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
            if (dataTransferPackagesBought < maxTransferPackages) {
                text += tt('too_late', [maxTransferPackages, hypoteticOverLimit.toFixed(0)]);
            }
            current_notification = {title: t('over_limit_too_much_notif_title'), text: text};
        } else if (down+up > limitTotal+dataTransferPackagesBought) {
            // All is not lost... Buy transfer packages!
            var badgeDetails = {text: '!'};
            var titleDetails = {title: t('over_limit_tooltip')};

            var text = tt('used_and_quota', [(down+up).toFixed(0), limitTotal]) + tt('current_extra', overLimit.toFixed(0)) + tt('over_limit_tip', extraPackages.toString());
            current_notification = {title: t('over_limit_notif_title'), text: text};
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
				chrome.notifications.create(
                    "not1",
                    {
                        type: 'basic',
                        iconUrl: 'Images/icon-64.png',
                        title: current_notification.title,
                        message: current_notification.text
                    },
	                function(){}
				);
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
        case 'getPlans':
            sendResponse({plans: plans, selectedPlan: selectedPlan, transferPackages: transferPackages, dataTransferPackagesBought: dataTransferPackagesBought, load_plans_error: load_plans_error});
            return;
		case 'getUsage':
            sendResponse({currentTransfer: currentTransfer, dataTransferPackagesBought: dataTransferPackagesBought, load_usage_error: load_usage_error});
			return;
        case 'setSelectedPlan':
            selectedPlan = request.selectedPlan;
            dataTransferPackagesBought = request.dataTransferPackagesBought;
            limitTotal = parseInt(selectedPlan.limit_gb);
            surchargePerGb = parseFloat(selectedPlan.surcharge_per_gb);
            surchargeLimit = parseFloat(selectedPlan.surcharge_limit);
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


// Allow accessing http://conso.electronicbox.net/ withour CORS headers
var responseListener = function(details){
	details.responseHeaders.push({"name": "Access-Control-Allow-Origin", "value": "*"});
	details.responseHeaders.push({"name": "Access-Control-Allow-Methods", "value": "GET, POST, HEAD, OPTIONS"});
	return {responseHeaders: details.responseHeaders};	
};
chrome.runtime.onInstalled.addListener(function(){
	chrome.webRequest.onHeadersReceived.addListener(responseListener, {
		urls: ['http://conso.electronicbox.net/']
	},["blocking", "responseHeaders"]);
});
