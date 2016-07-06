// For preferences
var username = '';
var lang = chrome.i18n.getMessage('1st') == '1st' ? 'en' : 'fr';

var username = '';

// From selectedPlan
var limitTotal = 250;
var surchargePerGb = 0.50;
var surchargeLimit = 999999;
var maxTransferPackages = 4*75;
var transferPackages = [75, 2*75, 3*75, 4*75];

// For AJAX request & response
var xml_request = null;
var last_updated = 0;
var last_up_down = 0;
var date_last_updated_data = new Date(); date_last_updated_data.setTime(0);
var currentTransfer = null;
var load_usage_error = null;

var last_notification;
var retry_timeout;

$(document).ready(function() {
    reloadPrefs();
    retry_timeout = 1;
    loadUsage();
});

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
    if (typeof username == 'undefined') {
        console.log("No username configured. Will retry once it's set.")
        return;
    }
    if ((now - last_updated) > 1*hour || (((now - date_last_updated_data.getTime()) > 2*day) && (now - last_updated) > 15*minute)) {
        if (xml_request != null) {
            xml_request.abort();
            xml_request = null;
        }
        xml_request = new XMLHttpRequest();
        xml_request.onload = function(e) { loadUsage2(e, xml_request); }
        var params = "actions=list&lng=en&code=" + escape(username);
        //xml_request.open("POST", "https://dataproxy.pommepause.com/electronic_usage-1.html"); // Test HTML
        xml_request.open("POST", "http://conso.ebox.ca/index.php");
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
            if (line.indexOf("Plan total:") > -1) {
                var re = line.match(/.*Plan total:<.b>\s*([0-9\.]+) G.*/i);
                if (re) {
                    limitTotal = re[1];
                }
            }
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
            if (request.response.indexOf("Down For Maintenance")) {
                console.log("Error: Down for maintenance");
                load_usage_error = t("down_for_maintenance") + " [<a href='http://conso.ebox.ca/' target='_blank'>" + t("see_details") + "</a>]";
            } else {
                console.log("Error: table_block not found in HTML: " + request.response);
                console.log("Showing generic error message.");
                load_usage_error = tt("oh_noes_error", t("error_cant_find_table_block"));
            }
            last_updated = 0;
            chrome.extension.sendRequest({action: 'show'}, function(response) {});
            return;
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
        var nowBandwidth = parseFloat((nowPercentage*limitTotal-down-up).toFixed(2));
        var n = (down+up) * 100.0 / limitTotal;
        var limitPercentage = n.toFixed(0);
        
        console.log("Got new usage data from server...");
        console.log("Down+Up = " + (down+up));
        console.log("Limit = " + limitTotal)
        
        // 'Today is the $num_days day of your billing month.'
        var num_days = Math.floor((now.getTime()-this_month_start.getTime())/(24*60*60*1000))+1;
        num_days = parseInt(num_days.toFixed(0));
        num_days = tt_date(num_days); // 1st, 2nd...
        var endOfMonthBandwidth = (down+up) / nowPercentage;
        
        if (down+up > limitTotal) {
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
            current_notification = {title: t('over_limit_too_much_notif_title'), text: text};
        } else if (down+up > limitTotal) {
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
        case 'getUsage':
            sendResponse({currentTransfer: currentTransfer, load_usage_error: load_usage_error, limitTotal: limitTotal});
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


// Allow accessing http://conso.ebox.ca/ withour CORS headers
var responseListener = function(details){
    details.responseHeaders.push({"name": "Access-Control-Allow-Origin", "value": "*"});
    details.responseHeaders.push({"name": "Access-Control-Allow-Methods", "value": "GET, POST, HEAD, OPTIONS"});
    return {responseHeaders: details.responseHeaders};    
};
chrome.runtime.onInstalled.addListener(function(){
    chrome.webRequest.onHeadersReceived.addListener(responseListener, {
        urls: ['http://conso.ebox.ca/']
    },["blocking", "responseHeaders"]);
});
