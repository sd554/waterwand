// Got this from Liam

function authenticate() {
    return gapi.auth2.getAuthInstance()
        .then(function () {
            },
            function (err) {
                console.error("Error signing in to Google Sheets API", err);
            });
}

function loadClient() {
    return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/sheets/v4/rest")
        .then(function () {
            },
            function (err) {
                console.error("Error loading GAPI client for API", err);
            });
}

function loadAPI(force) {
    if (force || gapi.client.sheets == null) {
        return authenticate().then(loadClient);
    } else {
        return Promise.resolve();
    }
}

function getValues(range) {
    return loadAPI(false).then(() => gapi.client.sheets.spreadsheets.values.get({
        "spreadsheetId": SPREADSHEET_ID,
        "range": range,
        "dateTimeRenderOption": "SERIAL_NUMBER",
        "majorDimension": "DIMENSION_UNSPECIFIED",
        "valueRenderOption": "UNFORMATTED_VALUE"
    }))
        .then(function (response) {
                return response.result.values;
            },
            function (err) {
                return loadAPI(true).then(() => getValues(range));
            });
}

function setValues(range, values) {
    console.log(range);
    console.log(values);
    if (gapi.client.sheets == null) {
        authenticate().then(loadClient);
    }
    return loadAPI(false).then(() => gapi.client.sheets.spreadsheets.values.update({
        "spreadsheetId": SPREADSHEET_ID,
        "range": range,
        "includeValuesInResponse": "false",
        "responseDateTimeRenderOption": "SERIAL_NUMBER",
        "responseValueRenderOption": "UNFORMATTED_VALUE",
        "valueInputOption": "RAW",
        "resource": {
            "values": values
        }
    }))
        .then(() => {}, // Do nothing with response
            function (err) {
                console.error("Set value error", err);
            });
}

function appendValues(range, values) {
    console.log(range);
    console.log(values);
    return gapi.client.sheets.spreadsheets.values.append({
        "spreadsheetId": SPREADSHEET_ID,
        "range": range,
        "includeValuesInResponse": "false",
        "insertDataOption": "INSERT_ROWS",
        "responseDateTimeRenderOption": "SERIAL_NUMBER",
        "responseValueRenderOption": "UNFORMATTED_VALUE",
        "valueInputOption": "RAW",
        "resource": {
            "values": values
        }
    })
}

gapi.load("client:auth2", function () {
    gapi.auth2.init({client_id: CLIENT_ID});
});
