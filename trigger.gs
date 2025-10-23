function onFormSubmit(e) {
  try {
    // Check if we have form data
    if (!e || !e.namedValues) {
      Logger.log('ERROR: No form data received');
      return;
    }

    Logger.log('Form data received: ' + JSON.stringify(e.namedValues));

    // Extract form data
    var formData = {
      firstName: e.namedValues['First Name']
        ? e.namedValues['First Name'][0]
        : '',
      lastName: e.namedValues['Last Name'] ? e.namedValues['Last Name'][0] : '',
      email: e.namedValues['Email'] ? e.namedValues['Email'][0] : '',
      requestType: e.namedValues['Request Type']
        ? e.namedValues['Request Type'][0]
        : '',
      description: e.namedValues['Request Description']
        ? e.namedValues['Request Description'][0]
        : '',
      priority: e.namedValues['Priority'] ? e.namedValues['Priority'][0] : '',
    };

    Logger.log('Sending to server: ' + JSON.stringify(formData));

    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(formData),
      muteHttpExceptions: true,
    };

    var response = UrlFetchApp.fetch(
      'https://unvisitable-maricruz-quarryable.ngrok-free.dev/webhook',
      options
    );
    Logger.log('Server response: ' + response.getContentText());
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
  }
}
function processExistingRows() {
  // This gets whatever sheet you currently have open
  var sheet = SpreadsheetApp.getActiveSheet();
  var lastRow = sheet.getLastRow();

  Logger.log('Found ' + (lastRow - 1) + ' rows to process');

  // Start from row 2 (skip header)
  for (var i = 2; i <= lastRow; i++) {
    var timestamp = sheet.getRange(i, 1).getValue();

    // Skip the Amanda Jones entries from today
    if (timestamp >= new Date('9/30/2025 15:28:08')) {
      Logger.log('Skipping row ' + i + ' - already processed');
      continue;
    }

    var formData = {
      firstName: sheet.getRange(i, 2).getValue(), // Column B
      lastName: sheet.getRange(i, 3).getValue(), // Column C
      email: sheet.getRange(i, 4).getValue(), // Column D
      requestType: sheet.getRange(i, 5).getValue(), // Column E
      description: sheet.getRange(i, 6).getValue(), // Column F
      priority: sheet.getRange(i, 7).getValue(), // Column G
    };

    Logger.log(
      'Processing row ' +
        i +
        ': ' +
        formData.firstName +
        ' ' +
        formData.lastName
    );

    var url = 'https://unvisitable-maricruz-quarryable.ngrok-free.dev/webhook';

    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(formData),
      muteHttpExceptions: true,
    };

    try {
      var response = UrlFetchApp.fetch(url, options);
      Logger.log('✓ Row ' + i + ' success');
      Utilities.sleep(1000);
    } catch (error) {
      Logger.log('✗ Row ' + i + ' error: ' + error.toString());
    }
  }

  Logger.log('========== FINISHED! ==========');
}
