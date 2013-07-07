var plans;

$(document).ready(function() {
	restore_options();
    $('#save').on('click', savePrefs);
});

// Restores select box state to saved value from localStorage.
function restore_options() {
    var userkey = localStorage["userkey"];
  	if (userkey && userkey.length > 0) {
		$('#userkey').val(userkey);
	}

    var color_code_upload = localStorage['colorCodeUpload'] == 'true';
	if (color_code_upload) {
		$("#color_code_upload")[0].checked = true;
	} else {
	    $("#color_code_upload")[0].checked = false;
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
	$('#userkey_intro').html(t("videotron_userkey"));
	$('#upload_color_intro').html(t("colored_upload"));
	$('#show_notifications_intro').html(t("show_notifications"));
	$('#title_image').attr('src', t("title_image"));
	$('#save').html(t("save"));
	$('#where_to_find_user_key').html(t("where_to_find_user_key"));
}
