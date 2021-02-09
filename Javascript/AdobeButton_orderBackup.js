var pdf = '';
var currentOrderId = '';
var responseUrl = '';
var agreementGuid = '';

var LOG = false;

function AdobeButton() {
    if (LOG) console.log('AdobeButton(Order)');
    currentOrderId = Xrm.Page.data.entity.getId().replace('{', '').replace('}','');
    
    //TODO: May want to change this message
    Xrm.Utility.showProgressIndicator("License Agreement Generating (estimated 30 sec)");
    triggerFlow_CreateAdobeAgreement();
    Xrm.Navigation.openUrl('main.aspx?appid=c3ca9abb-7624-4536-894b-055df38beff3&pagetype=entityrecord&etn=adobe_agreement&id=' + agreementGuid);

    try {
        var selectedid = null;
        var reportid = null;
 
        var req = new XMLHttpRequest();

        //TODO: Change report name
        var reportName = "LicenseAgreementReport";
        req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/reports?$select=reportid&$filter=filename eq '" + reportName + ".rdl'", false);

        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.onreadystatechange = function () {
 
            if (this.readyState === 4) {
                req.onreadystatechange = null;
 
                if (this.status === 200) {                
                    var results = JSON.parse(this.response);
 
                    if (results != null) {
                        reportid = results.value[0]["reportid"];
 
                        if (currentOrderId != null && currentOrderId.length == 36) {
                            selectedid = currentOrderId;
                            var params = getReportingSessionHomeGrid(reportName, reportid, selectedid);
                            var newPth = Xrm.Page.context.getClientUrl() + "/Reserved.ReportViewerWebControl.axd?ReportSession=" + params[0] + "&Culture=1033&CultureOverrides=True&UICulture=1033&UICultureOverrides=True&ReportStack=1&ControlID=" + params[1] + "&RSProxy=https%3a%2f%2fbn1647srs.nam.reporting.cds.dynamics.com%2freportserver&OpType=Export&FileName=LicenseAgreementReport&ContentDisposition=AlwaysAttachment&Format=PDF";
                            convertResponseToPDF(newPth);
                        }
                        else if (currentOrderId != null && currentOrderId.length == 0) {
                            alert("Please select a record.");
                        }
                        else if (currentOrderId != null && currentOrderId.length > 1) {
                            alert("Please select only one record .");
                        }
                        else {
                            var params = getReportingSession(reportName, reportid);
                            var newPth = Xrm.Page.context.getClientUrl() + "/Reserved.ReportViewerWebControl.axd?ReportSession=" + params[0] + "&Culture=1033&CultureOverrides=True&UICulture=1033&UICultureOverrides=True&ReportStack=1&ControlID=" + params[1] + "&OpType=Export&FileName=" + reportName + "&ContentDisposition=OnlyHtmlInline&Format=PDF";
                        }
                    } else {
                        Xrm.Utility.alertDialog(this.statusText);
                    }
                }
            }
        };

        req.send(); 
    } catch (ex) { throw ex; }
}
 

function getReportingSessionHomeGrid(reportName, reportGuid, selectedrecordid) {
    if (LOG) console.log('  getReportingSessionHomeGrid()');
    var pth = Xrm.Page.context.getClientUrl() + "/CRMReports/rsviewer/reportviewer.aspx";

    var retrieveEntityReq = new XMLHttpRequest();
    retrieveEntityReq.open("POST", pth, false);
    retrieveEntityReq.setRequestHeader("Accept", "*/*");
    retrieveEntityReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    var strParameterXML = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'><entity name='salesorder'><all-attributes/><filter type='and'><condition attribute='salesorderid' operator='eq' value='"+Xrm.Page.data.entity.getId()+"' /></filter></entity></fetch>";
    var queryString = "id=" + reportGuid + "&uniquename=" + Xrm.Utility.getGlobalContext().organizationSettings.uniqueName + "&iscustomreport=true&reportnameonsrs=&reportName=" + reportName + ".rdl&isScheduledReport=false&p:CRM_salesorder=" + strParameterXML;  
    retrieveEntityReq.send(queryString);

    var x = retrieveEntityReq.responseText.lastIndexOf("ReportSession=");   
    var y = retrieveEntityReq.responseText.lastIndexOf("ControlID="); 
    var ret = new Array(); 
    ret[0] = retrieveEntityReq.responseText.substr(x + 14, 24); 
    ret[1] = retrieveEntityReq.responseText.substr(x + 10, 32);

    return ret;
}
 

 function convertResponseToPDF(pth)  {
     if (LOG) console.log('  convertResponseToPDF()');
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

            pdf = btoa(binary);
            try {
                getCurrentUserEmail();
            } catch (e) { alert(e); }
        }
    };

    retrieveEntityReq.send();
}


function getCurrentUserEmail() {
    if (LOG) console.log('  getCurrentUserEmail()');
    var serverUrl = Xrm.Page.context.getClientUrl();
    var ODataPath = serverUrl + "/XRMServices/2011/OrganizationData.svc"; 
    var userRequest = new XMLHttpRequest(); 
    userRequest.open("GET", ODataPath + "/SystemUserSet(guid'" + Xrm.Page.context.getUserId() + "')", false); 
    userRequest.setRequestHeader("Accept", "application/json"); 
    userRequest.setRequestHeader("Content-Type", "application/json; charset=utf-8"); 
    userRequest.onreadystatechange = function () {
        if (userRequest.status === 200) {
            var retrievedUser = JSON.parse(userRequest.responseText).d; 
            triggerFlow_CreateAdobeDocument(retrievedUser.InternalEMailAddress);
        }
        else {
            return "error";
        }
    };
    userRequest.send();
}


function triggerFlow_CreateAdobeDocument(email) {
    if (LOG) console.log('  triggerFlow_CreateAdobeDocument()');

    url = "https://prod-110.westus.logic.azure.com:443/workflows/7afdb5933fd14d268f12600f1383aa39/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=G3-jV2WOKF2do1Oc6Q-PDEq1YuLODJKw1MZEC546t38";
    var request = new XMLHttpRequest();
    request.open('POST', url, false);

    request.setRequestHeader("Content-Type", "application/json");   
    var data = { "pdf": pdf, "email": email, "orderId": currentOrderId, "agreementId": agreementGuid };
    if (LOG) console.log('triggerFlow_CreateAdobeDocument() data:', data);
    request.send(JSON.stringify(data));

    if (request.readyState == 4 && request.status == 200) {
        //responseUrl = request.responseText;
        try {
            var path = "https://uscotton.sharepoint.com/sites/D365DocumentsNCC2" + JSON.parse(request.responseText).path;
            if (LOG) console.log('path:', path);
            window.open(path);
        } catch (err) { console.log('Error during SharePoint redirect...', err); }
        Xrm.Utility.closeProgressIndicator();
    } 
}


function triggerFlow_CreateAdobeAgreement() {
    if (LOG) console.log('  triggerFlow_CreateAdobeAgreement()');

    url = "https://prod-81.westus.logic.azure.com:443/workflows/18c973a2fa91413ca46839fddf49723d/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=t2NwRnL8CNgmes_x2l9UbZXyjp4871b93Er93GgsqM0";
    var request = new XMLHttpRequest();
    request.open('POST', url, false);
    request.setRequestHeader("Content-Type", "application/json");  
    var data = {  "orderId": currentOrderId };
    request.send(JSON.stringify(data));

    if (request.readyState == 4 && request.status == 200) {
        agreementGuid = request.responseText;
        if (LOG) console.log('agreementGuid:', agreementGuid);
    } 
}