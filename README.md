# My Zepbound Journey — Version 11.3.3

## iPhone photo picker fix

This release replaces the programmatic `fileInput.click()` method with a native HTML label connected directly to the photo input. This is more reliable in Safari and Home Screen PWAs because the browser receives the photo-picker request directly from the user's tap.

After deployment, fully close and reopen the app. If an older Home Screen copy remains cached, remove it from the Home Screen, open the new Cloudflare/GitHub address in Safari, and add it again. Existing tracker data is stored by the site address, so changing domains can create a separate local data set.
