$(document).ready(function() {
	restore_options();
    $('#save').on('click', savePrefs);
    $('#username').on('click', function() {
        if (this.value == 'vlxxxxxx') { 
            this.value = '';
        }
    });
});

// Restores options to saved value from localStorage.
function restore_options() {
    var username = localStorage["username"];
  	if (username && username.length > 0) {
		$('#username').val(username);
	}

    var color_code_upload = localStorage['colorCodeUpload'] == 'true';
	if (color_code_upload) {
		$("#color_code_upload")[0].checked = true;
	} else {
	    $("#color_code_upload")[0].checked = false;
	}

    var allowed_usage = localStorage["allowed_usage"];
  	if (allowed_usage && allowed_usage > 0) {
		$('#allowed_usage').val(allowed_usage);
	}

    var surcharge = localStorage["surcharge"];
  	if (surcharge && surcharge > 0) {
		$('#surcharge').val(surcharge);
	}

    var surcharge_limit = localStorage["surcharge_limit"];
  	if (surcharge_limit && surcharge_limit > 0) {
		$('#surcharge_limit').val(surcharge_limit);
	}

	var show_notifications = localStorage['showNotifications'] == 'true' || typeof localStorage["showNotifications"] == 'undefined';
	if (show_notifications) {
		$("#show_notifications")[0].checked = true;
	} else {
		$("#show_notifications")[0].checked = false;
	}
	translate();
}

function translate() {
	$('#title').html(t("title"));
	$('#username_intro').html(t("videotron_username"));
	$('#allowed_usage_intro').html(t("allowed_usage"));
	$('#surcharge_intro').html(t("surcharge"));
	$('#surcharge_limit_intro').html(t("surcharge_limit"));
	$('#upload_color_intro').html(t("colored_upload"));
	$('#show_notifications_intro').html(t("show_notifications"));
	$('#title_image').attr('src', t("title_image"));
	$('#save').html(t("save"));
	$('#where_to_find_vl_username').html(t("where_to_find_vl_username"));
}
