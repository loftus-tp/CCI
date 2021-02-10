function runReportToPrint(selectedRecords) {
    try {
        var selectedid = null;
        var reportid = null;
 
        var req = new XMLHttpRequest();
        var reportName = "LicenseApplicationVerificationReport";
        console.log("reportName = " + reportName);
        req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/reports?$select=reportid&$filter=filename eq '" + reportName + ".rdl'", true);
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
                        console.log("reportid = " + reportid);
 
                        if (selectedRecords != null && selectedRecords.length == 36) {
                            selectedid = selectedRecords;
                            var params = getReportingSessionhomegrid(reportName, reportid, selectedid);
                            var newPth = Xrm.Page.context.getClientUrl() + "/Reserved.ReportViewerWebControl.axd?ReportSession=" + params[0] + "&Culture=1033&CultureOverrides=True&UICulture=1033&UICultureOverrides=True&ReportStack=1&ControlID=" + params[1] + "&RSProxy=https%3a%2f%2fbn1647srs.nam.reporting.cds.dynamics.com%2freportserver&OpType=Export&FileName=LicenseApplicationVerificationReport&ContentDisposition=AlwaysAttachment&Format=PDF";
                            convertResponseToPDF(newPth);
                        }
                        else if (selectedRecords != null && selectedRecords.length == 0) {
                            alert("Please select a record.");
                        }
                        else if (selectedRecords != null && selectedRecords.length > 1) {
                            alert("Please select only one record .");
                        }
                        else {
                            var params = getReportingSession(reportName, reportid);
                            var newPth = Xrm.Page.context.getClientUrl() + "/Reserved.ReportViewerWebControl.axd?ReportSession=" + params[0] + "&Culture=1033&CultureOverrides=True&UICulture=1033&UICultureOverrides=True&ReportStack=1&ControlID=" + params[1] + "&OpType=Export&FileName=" + reportName + "&ContentDisposition=OnlyHtmlInline&Format=PDF";
                            window.open(newPth, "_self");
                        }
                    } else {
                        Xrm.Utility.alertDialog(this.statusText);
                    }
                }
            }
        };
 
        req.send();
 
    } catch (ex) {
 
        throw ex;
    }
 }
 

 function getReportingSessionhomegrid(reportName, reportGuid, selectedrecordid) {
    var pth = Xrm.Page.context.getClientUrl() + "/CRMReports/rsviewer/reportviewer.aspx";
    
    var retrieveEntityReq = new XMLHttpRequest();
    retrieveEntityReq.open("POST", pth, false);
    retrieveEntityReq.setRequestHeader("Accept", "*/*");
    retrieveEntityReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    var strParameterXML = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'><entity name='opportunity'><all-attributes/><filter type='and'><condition attribute='opportunityid' operator='eq' value='"+Xrm.Page.data.entity.getId()+"' /></filter></entity></fetch>";
    var queryString = "id=" + reportGuid + "&uniquename=" + Xrm.Utility.getGlobalContext().organizationSettings.uniqueName + "&iscustomreport=true&reportnameonsrs=&reportName=" + reportName + ".rdl&isScheduledReport=false&p:CRM_opportunity=" + strParameterXML;  
    console.log("URL 1: " + pth + "?" + queryString);
    retrieveEntityReq.send(queryString);
    
    var x = retrieveEntityReq.responseText.lastIndexOf("ReportSession=");   
    var y = retrieveEntityReq.responseText.lastIndexOf("ControlID="); 
    var ret = new Array(); 
    ret[0] = retrieveEntityReq.responseText.substr(x + 14, 24); 
    ret[1] = retrieveEntityReq.responseText.substr(x + 10, 32);
    console.log("ReportSession = " + ret[0]);
    console.log("ControlID = " + ret[1]);
 
    return ret;
 }
 

 function convertResponseToPDF(pth)  {
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

            var base64PDFString = btoa(binary);
            console.log(base64PDFString);

            var plainString = atob(base64PDFString);
            console.log(plainString);
        }
    };

    retrieveEntityReq.send();
}



var currentOpportunityId = Xrm.Page.data.entity.getId().replace('{', '').replace('}','');
console.log("currentOpportunityId = " + currentOpportunityId);
runReportToPrint(currentOpportunityId);