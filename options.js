var plans;

$(document).ready(function() {
	restore_options();
    $('#save').on('click', savePrefs);
    $('#username').on('click', function() {
        if (this.value == 'vlxxxxxx') { 
            this.value = '';
        }
    });
});

// Restores select box state to saved value from localStorage.
function restore_options() {
    var username = localStorage["username"];
  	if (username && username.length > 0) {
		$('#username').val(username);
	}

    var billingDate = localStorage["billing_date"];
    for (var i=0; i<31; i++) {
        $('#billing_date')[0].options[i] = new Option(tt_date(i+1), i+1, i == 0, billingDate && billingDate.length > 0 && i+1 == billingDate);
    }

    var color_code_upload = localStorage['colorCodeUpload'] == 'true';
	if (color_code_upload) {
		$("#color_code_upload")[0].checked = true;
	} else {
	    $("#color_code_upload")[0].checked = false;
	}

    chrome.extension.sendRequest({action : 'getPlans'}, function(response) {
        plans = response.plans;
        var transferPackages = response.transferPackages;
        var selectedPlan = response.selectedPlan;
        var dataTransferPackagesBought = response.dataTransferPackagesBought;

        for (var i=0; i<plans.length; i++) {
            $('#plan')[0].options[i] = new Option(t(plans[i].name) + ' (' + plans[i].limit_gb + t('GB') + ')', plans[i].id, i == 0, selectedPlan.id == plans[i].id);
        }

        for (var i=0; i<transferPackages.length; i++) {
            $('#transfer_packages')[0].options[i] = new Option(transferPackages[i] + ' ' + t('GB'), transferPackages[i], i==0, dataTransferPackagesBought == transferPackages[i]);
        }

        translate();
    });

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
    $('#billing_date_intro').html(t("billing_date"));
    $('#plan_intro').html(t("type_of_access"));
    $('#transfer_packages_intro').html(t("data_transfer_packages"));
	$('#upload_color_intro').html(t("colored_upload"));
	$('#show_notifications_intro').html(t("show_notifications"));
	$('#title_image').attr('src', t("title_image"));
	$('#save').html(t("save"));
	$('#where_to_find_vl_username').html(t("where_to_find_vl_username"));
}
