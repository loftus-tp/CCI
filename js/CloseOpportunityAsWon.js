try {
    executionContext.getFormContext().data.process.addOnProcessStatusChange((executionContext) => {
        var isFinished = executionContext.getFormContext().data.process.getStatus() === "finished";
        var isFirstPass = executionContext._depth === 0;

        if (isFinished && isFirstPass) {
            var opportunityId = executionContext._formContext._entityReference.id.guid;
            var opportunityClose = { "opportunityid@odata.bind": "/opportunities("+opportunityId+")" };
            var parameters = { "OpportunityClose": opportunityClose, "Status": -1 };

            var context = Xrm.Page.context;
            var req = new XMLHttpRequest();
            req.open("POST", context.getClientUrl() + "/api/data/v8.2/WinOpportunity", true);
            req.setRequestHeader("OData-MaxVersion", "4.0");
            req.setRequestHeader("OData-Version", "4.0");
            req.setRequestHeader("Accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            req.onreadystatechange = function () {
                if (this.readyState === 4) {
                    req.onreadystatechange = null;
                    if (this.status === 204) {
                        alert('License Application has been completed! Check the License Agreement tab to find the newly created record.');
                    } else {
                        console.log("close as won js http request ERROR...\n", this.responseText);
                    }
                }
            };
            req.send(JSON.stringify(parameters));
        }
    });
} catch (err) { console.log("Close as won js error...\n", err); }

/*

un-refactored 

try {
    executionContext.getFormContext().data.process.addOnProcessStatusChange((executionContext) => {
        //console.log("execution context:", executionContext);
        //console.log("process:", executionContext.getFormContext().data.process);
        if (executionContext.getFormContext().data.process.getStatus() === "finished" && executionContext._depth === 0) {
            var opportunityclose = {
                "opportunityid@odata.bind": "/opportunities("+executionContext._formContext._entityReference.id.guid+")",
                //"actualrevenue": 100,
                //"actualend": new Date(),
                //"description": "Your description here"
            };

            var parameters = {
                "OpportunityClose": opportunityclose,
                "Status": -1
            };

            var context = Xrm.Page.context;
            var req = new XMLHttpRequest();
            req.open("POST", context.getClientUrl() + "/api/data/v8.2/WinOpportunity", true);
            req.setRequestHeader("OData-MaxVersion", "4.0");
            req.setRequestHeader("OData-Version", "4.0");
            req.setRequestHeader("Accept", "application/json");
            req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            req.onreadystatechange = function () {
                if (this.readyState === 4) {
                    req.onreadystatechange = null;
                    if (this.status === 204) {
                        alert('License Application has been completed!');
                    } else {
                        console.log("won opportunity ERROR...\n", this.responseText);
                    }
                }
            };
            req.send(JSON.stringify(parameters));
        }
    });
} catch (err) { console.log("Close as won js error...\n", err); }
*/