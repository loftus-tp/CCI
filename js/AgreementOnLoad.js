function onload(executionContext) {
    console.log("start of onload script");
    console.log(executionContext);

    setTimeout(function () { checkRecipients(executionContext, 0); }, 3000);
}

function checkRecipients(executionContext) {
    console.log("checkRecipients()");
    var grid = Xrm.Page.getControl("AgreementRecipientsGrid");
    if (grid == null) { //make sure the grid has loaded 
        setTimeout(function () { checkRecipients(executionContext); }, 2000); //if the grid hasn’t loaded run this again when it has 
        return;
    }

    if (grid.getGrid().getTotalRecordCount() === 0) {
        Xrm.Utility.showProgressIndicator("Adding Recipients (estimated 7 sec)");
        queryCDS(0);
    }
}

function queryCDS(loopCount) {
    console.log("queryCDS("+loopCount+")");
    try {
        var req = new XMLHttpRequest();
        var currentAgreementId = Xrm.Page.data.entity.getId().replace('{', '').replace('}','');

        req.open("GET", Xrm.Page.context.getClientUrl() + "/api/data/v8.2/adobe_agreements?$filter=adobe_agreementid eq '" + currentAgreementId + "' &$select=adobe_isrecipientadded", false);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;

                if (this.status === 200) {
                    var isRecipientAdded = JSON.parse(this.responseText).value[0].adobe_isrecipientadded;
                    console.log("isrecipientadded:", isRecipientAdded);
                    
                    if (isRecipientAdded) {
                        Xrm.Utility.closeProgressIndicator();
                        Xrm.Page.getControl("AgreementRecipientsGrid").refresh();
                        return;
                    }
                    else if (loopCount < 5) {
                        setTimeout(function() { queryCDS(loopCount+1); }, 3000);
                    }
                    else {
                        if (Xrm.Page.getControl("AgreementRecipientsGrid").getGrid().getTotalRecordCount() === 0) {
                            alert("WARNING currently no recipients will be sent this agreement!");
                        }
                        Xrm.Utility.closeProgressIndicator();
                        return;
                    }
                }
            }
        };

        req.send(); 
    } catch (ex) { throw ex; }
}