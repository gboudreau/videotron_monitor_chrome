Videotron Internet Usage Monitor for Google Chrome
==================================================

Whats is it?
------------

Quite simply, this is a Google Chrome extension that allows Videotron.com customers
to monitor their monthly bandwidth quota.

Features
--------

The extensions adds a button in the toolbar. This button will have a '!' yellow overlay if you're on your way to being over-limit.
It will have a '!' red overlay if you exceeded your limit, but could still buy extra transfer packages to prevent overcharges.
It will have a '!!' red overlay if you exceeded your limit, and even if you buy all the extra transfer packages you can (90GB at this time), you'll still be charged extra.

Clicking the toolbar button will display a popup window with more details:

* when your billing month started;
* the amount of upload and download you made thus far, this month;
* a graph of you current usage versus your allowed usage;
* a hint about where you stand on your daily quota usage: did you download too much, or not enough, since the beginning of your billing month, to end the month with your quota used at 100%?;
* the last updated date.

Desktop Notifications will appear if you either are over-limit, or on your way to be over-limit by the end of the month. They will give you some details about your current situation and options.

How it works?
-------------
Every 6 hours, the extension sends an HTTP request to http://dataproxy.pommepause.com/videotron_usage-#.php?vlxxxxxx
where vlxxxxxx is your Videotron Internet username.

This videotron_usage-#.php server-side script will use the specified username to load the Videotron Internet Usage page for that user, and parse it to extract the usage data, and return that in XML format to the extension, which will in turn parse it, and update it's numbers.

The source of that server-side script can be found in videotron_usage.php in this repository.

How to use?
-----------

Install the extension from the [Google Chrome WebStore](https://chrome.google.com/webstore/detail/fnhepcakkcnkaehfhpagimbbkpelkdha)

Then go in the options (right-click the taskbar button and choose Options), enter your Videotron Internet (VL) username, and choose your Internet plan.

Don't know your VL username? You can find it on your monthly invoice, just above the Internet daily usage numbers. You can also find it in your Videotron Customer Centre, on the [Manage e-mail accounts](https://www.videotron.com/client/Customer-Centre/Internet/Email-services) page.
