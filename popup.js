$(document).ready(function() {
    translate();
	show();
});

function translate() {
	$('#needs_config').html(tt("needs_config", chrome.extension.getURL('options.html')));
	$('#loading').html(t("loading_please_wait"));
	$('#ohnoes').html(tt("oh_noes_error", ""));
	$('#this_month_intro').html(t("this_month"));
	$('#this_month_down_suffix').html(t("download"));
	$('#this_month_up_suffix').html(t("upload"));
	$('#last_updated_intro').html(t("last_updated"));
}
