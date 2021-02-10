//#region GLOBALS
var DATA = {
    pdf: '',
    pdfTranslated: '',
    opportunityId: null,
    agreementId: null,
    contactId: null,
    reportId: null,
    reportIdTranslated: null,
    contactLanguage: '',
    contactEmail: '',
    sentDefault: false
}

var STATIC_DATA = {
    FLOW: {
        createAdobeDocument: "https://prod-10.westus.logic.azure.com:443/workflows/5b62965140b94e9cb1c52cad21ce429c/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Qj8BmnsKgEOPerYUt1LEvlfCIjdRA8CgIsVcP7Mi5kc",
        createAdobeAgreement: "https://prod-100.westus.logic.azure.com:443/workflows/ea5e5b8c88564757a83ea3759450b9b8/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=vB0cW6X2IzjsiK1slvKqQSPj5lMvBiTqBuMtgrGgeHs"
    },
    sharePoint: "https://uscotton.sharepoint.com/sites/D365DocumentsNCC2",
    agreementView: "main.aspx?appid=c3ca9abb-7624-4536-894b-055df38beff3&pagetype=entityrecord&etn=adobe_agreement&id=",
    server: Xrm.Page.context.getClientUrl(),
    //reportName: "LicenseApplicationVerificationReport",
    reportName: "LicenseVerification",
    saveReport_1: "/Reserved.ReportViewerWebControl.axd?ReportSession=",
    saveReport_3: "&Culture=1033&CultureOverrides=True&UICulture=1033&UICultureOverrides=True&ReportStack=1&ControlID=",
    saveReport_5: "&RSProxy=https%3a%2f%2fbn1647srs.nam.reporting.cds.dynamics.com%2freportserver&OpType=Export&FileName=LicenseApplicationVerificationReport&ContentDisposition=AlwaysAttachment&Format=PDF"
}

var LOG = {
    methodStubs: true,
    extraMethodStubs: true,
    liveLogging: true,
    data: []
}
//#endregion





//#region CORE
/**
 * 
 */
function AdobeButton() {
    if (LOG.methodStubs)  {
        var msg = 'func - AdobeButton';
        LOG.liveLogging ? console.log(msg) : LOG.data.push(msg);
    }

    DATA.opportunityId = Xrm.Page.data.entity.getId().replace('{', '').replace('}','');
    Xrm.Utility.showProgressIndicator("Generating Verification Report (estimated 20 sec)");
    
    // create adobe agreement flow
    var data = { opportunityId: DATA.opportunityId }
    var request = _postRequest(STATIC_DATA.FLOW.createAdobeAgreement, false);
    request.send(JSON.stringify(data));

    if (request.readyState == 4 && request.status == 200) {
        DATA.agreementId = request.responseText;
    } else {
        console.log('ERROR: failed to create adobe agreement!');
        return;
    }

    // open agreement view
    Xrm.Navigation.openUrl(STATIC_DATA.agreementView + DATA.agreementId);

    var request = _getRequest(STATIC_DATA.server + "/api/data/v8.2/reports?$select=reportid&$filter=filename eq '" + STATIC_DATA.reportName + ".rdl'");
    request.onreadystatechange = afterGetReport;
    request.send();

    getContactLanguage();
}


/**
 * 
 */
function afterGetReport() {
    if (this.readyState === 4) {
        this.onreadystatechange = null;

        if (this.status === 200) {                
            var results = JSON.parse(this.response);

            if (results != null) {
                DATA.contactLanguage.length !== 0 ? DATA.reportIdTranslated = results.value[0]["reportid"] : DATA.reportId = results.value[0]["reportid"];

                if (DATA.opportunityId != null && DATA.opportunityId.length == 36) {
                    convertResponseToPDF(getReportingSessionHomeGrid());
                }
                else if (DATA.opportunityId != null) {
                    DATA.opportunityId.length == 0 ? alert("Please select a record.") : alert("Please select only one record.");;
                    return;
                }
            } else {
                Xrm.Utility.alertDialog(this.statusText);
            }
        }
    }
}



/**
 * 
 */
function getReportingSessionHomeGrid() {
    if (LOG.extraMethodStubs) {
        var msg = 'func - getReportingSessionHomeGrid';
        LOG.liveLogging ? console.log(msg) : LOG.data.push(msg);
    }

    var strParameterXML = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'><entity name='opportunity'><all-attributes/><filter type='and'><condition attribute='opportunityid' operator='eq' value='"+DATA.opportunityId+"' /></filter></entity></fetch>";
    var data = "id=" + (DATA.contactLanguage.length !== 0 ? DATA.reportIdTranslated : DATA.reportId) + "&uniquename=" + Xrm.Utility.getGlobalContext().organizationSettings.uniqueName + "&iscustomreport=true&reportnameonsrs=&reportName=" + STATIC_DATA.reportName + (DATA.contactLanguage.length !== 0 ? "_" + DATA.contactLanguage : '') + ".rdl&isScheduledReport=false&p:CRM_opportunity=" + strParameterXML;

    var request = _postRequest(STATIC_DATA.server + "/CRMReports/rsviewer/reportviewer.aspx", true);
    request.send(data);

    var sessionIndex = request.responseText.lastIndexOf("ReportSession=");
    var ret = new Array(); 
    ret[0] = request.responseText.substr(sessionIndex + 14, 24);
    ret[1] = request.responseText.substr(sessionIndex + 10, 32);
    return ret;
}



/**
 * 
 * @param {*} params 
 */
function convertResponseToPDF(params)  {
    if (LOG.methodStubs) {
        var msg = 'func - convertResponseToPDF';
        LOG.liveLogging ? console.log(msg) : LOG.data.push(msg);
    }

    var pth = STATIC_DATA.server + STATIC_DATA.saveReport_1 + params[0] + STATIC_DATA.saveReport_3 + params[1] + STATIC_DATA.saveReport_5;
    var retrieveEntityReq = new XMLHttpRequest();
    retrieveEntityReq.open('GET', pth, true);
    retrieveEntityReq.setRequestHeader('Accept', '*/*');
    retrieveEntityReq.responseType = 'arraybuffer';
    retrieveEntityReq.onreadystatechange = function () { 
        if (retrieveEntityReq.readyState == 4 && retrieveEntityReq.status == 200) { 
            var binary = '';
            var bytes = new Uint8Array(this.response);

            for (var i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }

            DATA.pdf.length !== 0 ? DATA.pdfTranslated = btoa(binary) : DATA.pdf = btoa(binary);
            getCurrentUserEmail();
        }
    };

    retrieveEntityReq.send();
}




/**
 * 
 */
function getCurrentUserEmail() {
    if (LOG.methodStubs) {
        var msg = 'func - getCurrentUserEmail';
        LOG.liveLogging ? console.log(msg) : LOG.data.push(msg);
    }

    var path = STATIC_DATA.server + "/XRMServices/2011/OrganizationData.svc" + "/SystemUserSet(guid'" + Xrm.Page.context.getUserId() + "')";
    var request = _getRequest(path);
    request.onreadystatechange = function() {
        if (request.status === 200) {
            DATA.contactEmail = JSON.parse(request.responseText).d.InternalEMailAddress;
            createAdobeDocument(DATA.contactEmail);
        }
    }
    request.send();
}



/**
 * 
 * @param {*} email 
 */
function createAdobeDocument(email) {
    if (LOG.methodStubs) {
        var msg = 'func - createAdobeDocument()';
        LOG.liveLogging ? console.log(msg) : LOG.data.push(msg);
    }
    
    var request = _postRequest(STATIC_DATA.FLOW.createAdobeDocument, false);
    console.log('sentDefault:', DATA.sentDefault);
    var data = {
        pdf: DATA.sentDefault ? DATA.pdfTranslated : DATA.pdf, 
        email: email, 
        opportunityId: DATA.opportunityId, 
        agreementId: DATA.agreementId
    }
    DATA.sentDefault = true;
    //console.log('pdfTranslated', DATA.pdfTranslated, 'contactLanguage', DATA.contactLanguage);
    request.send(JSON.stringify(data));

    if (request.readyState == 4 && request.status == 200) {
        try {
            window.open(STATIC_DATA.sharePoint + JSON.parse(request.responseText).path);
        } catch (err) { console.log('Error during SharePoint redirect...', err); }
        Xrm.Utility.closeProgressIndicator();
    }

    if (DATA.contactLanguage.length !== 0) {
        console.log('DATA:', DATA);
        console.log('STATIC_DATA:', STATIC_DATA);
        console.log('LOG.data:', LOG.data);
        console.log('FIN - AdobeButton.js');
    }
}



function getContactLanguage() {
    if (LOG.methodStubs) {
        var msg = 'func - getContactLanguage';
        LOG.liveLogging ? console.log(msg) : LOG.data.push(msg);
    }

    try {
    DATA.contactId = Xrm.Page.getAttribute('parentcontactid').getValue()[0].id.replace("{", "").replace("}", "");
    var path = STATIC_DATA.server + "/XRMServices/2011/OrganizationData.svc" + "/ContactSet(guid'" + DATA.contactId + "')";
    var request = _getRequest(path);
    request.onreadystatechange = function() {
        if (request.status === 200) {
            var languageVal = JSON.parse(request.responseText).d.cci_PreferredLanguage.Value;
            if (languageVal != null && languageVal !== 100000000) {
                switch (languageVal) {
                    case 100000001: DATA.contactLanguage="Spanish"; break;
                }

                if (DATA.contactLanguage.length !== 0) {
                    var _request = _getRequest(STATIC_DATA.server + "/api/data/v8.2/reports?$select=reportid&$filter=filename eq '" + STATIC_DATA.reportName + "_" + DATA.contactLanguage + ".rdl'");
                    _request.onreadystatechange = afterGetReport;
                    _request.send();
                }
            }
        }
    }
    request.send();
    } catch (err) { console.log(err); }
}
//#endregion





//#region UTILITY
/**
 * 
 * @param {*} url 
 * @param {*} isBinaryArray 
 */
function _getRequest(url) {
    if (LOG.extraMethodStubs) {
        var msg = 'func - _getRequest';
        LOG.liveLogging ? console.log(msg) : LOG.data.push();
    }

    console.log('GET', url);

    try {
        var request = new XMLHttpRequest();
        request.open("GET", url, false);
        request.setRequestHeader("OData-MaxVersion", "4.0");
        request.setRequestHeader("OData-Version", "4.0");
        request.setRequestHeader("Accept", "application/json");
        request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        request.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");

        return request;
    } catch (err) { console.log('GET ERROR', err); }
}



/**
 * 
 * @param {*} url 
 * @param {*} isXML 
 */
function _postRequest(url, isXML) {
    if (LOG.extraMethodStubs) {
        var msg = 'func - _postRequest';
        LOG.liveLogging ? console.log(msg) : LOG.data.push(msg);
    }

    console.log('POST', url, isXML);

    try {
        var request = new XMLHttpRequest();
        request.open('POST', url, false);

        var contentType = isXML ? "application/x-www-form-urlencoded" : "application/json";
        request.setRequestHeader("Content-Type", contentType);
        request.setRequestHeader("Accept", "*/*");

        return request;
    } catch (err) { console.log('POST ERROR', err); }
}
//#endregion