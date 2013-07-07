$(document).ready(function() {
	$('#loading').css('top', '30px');
	$('#loading').css('display', 'block');

	chrome.extension.sendRequest({action: 'loadUsage'}, function(response) {});
});

/**
* Handles data sent via chrome.extension.sendRequest().
* @param request Object Data sent in the request.
* @param sender Object Origin of the request.
* @param sendResponse Function The method to call when the request completes.
*/
function onRequest(request, sender, sendResponse) {
	switch(request.action) {
		case 'show':
			show();
	}
	sendResponse({});
	return;
};

// Wire up the listener.
chrome.extension.onRequest.addListener(onRequest);

function translate() {
	$('#needs_config').html(tt("needs_config", chrome.extension.getURL('options.html')));
	$('#loading').html(t("loading_please_wait"));
	$('#ohnoes').html(tt("oh_noes_error", ""));
	$('#this_month_intro').html(t("this_month"));
	$('#this_month_down_suffix').html(t("download"));
	$('#this_month_up_suffix').html(t("upload"));
	$('#last_updated_intro').html(t("last_updated"));
}
