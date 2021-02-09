// JavaScript source code
var Sdk = window.Sdk || {};

(function () {
    this.selectedConversion;
    this.conversionFactors = "_cci_tonmetriccci_pairscci_numbercci_mtrscci_kgcci_sqmcci_dozenpaircci_dozencci_bales";
    this.formOnLoad = function (ExecutionContext) {
        var formContext = ExecutionContext.getFormContext();
        var doing = formContext.ui.getFormType(); //1=new; 2=update
        var thisid = formContext.data.entity.getId();
        var FetchXML;

        if (doing === 1) {
        }
        else { //update
            //Sdk.setSelectedConversion(ExecutionContext);
        }
    }

    this.setSelectedConversion = function (ExecutionContext) { //deprecated
        var formContext = ExecutionContext.getFormContext();
        var tabObj = formContext.ui.tabs.get("tab_5");
        if (tabObj) {
            var sectionObj = tabObj.sections.get("tab_5_section_1");
            if (sectionObj) {
                sectionObj.controls.forEach(function (attribute, index) {
                    //alert(Sdk.conversionFactors.indexOf(attribute.getName()) + " == " + attribute.getValue());
                    if ((Sdk.conversionFactors.indexOf(attribute.getName()) > 0) && attribute.getValue() == "Yes") {
                        //alert(attribute.getName());
                        Sdk.selectedConversion = attribute;
                    }
                });
            } else alert("tab_5_section_1")
        } else alert("no tab_5");
    };

    this.productidOnChange = function (ExecutionContext) {
        var me = ExecutionContext.getEventSource();
        var productid = me.getValue();
        var formContext = ExecutionContext.getFormContext();
        var logicalName = formContext.data.entity.getEntityName();
        //var acctProdname = formContext.getAttribute("cci_accountproductnumber").getValue();
        //var lk_product = formContext.getAttribute("productid").getValue();
        var utname = logicalName === "salesorderdetail" ? "cci_unittype" : "cci_unit_type";
        if (productid) {
            if (logicalName === "opportunityproduct")
                formContext.getAttribute("opportunityproductname").setValue(productid[0].name);
            //formContext.getAttribute("cci_unitofweight").fireOnChange();
            formContext.getAttribute(utname).fireOnChange();
        }
    };

    this.productCompOnChange = function (ExecutionContext) {
        var me = ExecutionContext.getEventSource();
        var cottonPortionOrQty = me.getValue();
        var formContext = ExecutionContext.getFormContext();
        var logicalName = formContext.data.entity.getEntityName();
        var utname = logicalName === "salesorderdetail" ? "cci_unittype" : "cci_unit_type";
        if (cottonPortionOrQty) {
            formContext.getAttribute(utname).fireOnChange();
        }
    };

    this.unitTypeOnChange = function (ExecutionContext) {
        var me = ExecutionContext.getEventSource();
        var unitType = me.getValue();
        var formContext = ExecutionContext.getFormContext();
        var logicalName = formContext.data.entity.getEntityName();

        if (unitType) {
            switch (unitType) {
                case 100000001:
                    Sdk.buildConversionFetch2(ExecutionContext, "cci_dozen_conversion_factor", 1); break;
                case 100000002:
                    Sdk.buildConversionFetch2(ExecutionContext, "cci_dozen_pair_conversion_factor", 1 / 12); break;
                case 100000003:
                    Sdk.buildConversionFetch2(ExecutionContext, "cci_kg_conversion_factor", 1); break;
                case 100000004:
                    Sdk.buildConversionFetch2(ExecutionContext, "cci_lbs_conversion_factor", 1); break;
                case 100000005:
                    Sdk.buildConversionFetch2(ExecutionContext, "cci_mtrs_conversion_factor", 1); break;
                case 100000006:
                    Sdk.buildConversionFetch2(ExecutionContext, "cci_number_conversion_factor", 1); break;
                case 100000007:
                    Sdk.buildConversionFetch2(ExecutionContext, "cci_pairs_conversion_factor", 1); break;
                case 100000008:
                    Sdk.buildConversionFetch2(ExecutionContext, "cci_set_conversion_factor", 1); break;
                case 100000009:
                    Sdk.buildConversionFetch2(ExecutionContext, "cci_sqm_conversion_factor", 1); break;
                case 100000010:
                    Sdk.buildConversionFetch2(ExecutionContext, "cci_metric_ton_conversion_factor", 1); break;
                default:
                    Sdk.buildConversionFetch2(ExecutionContext, "cci_bales_conversion_factor", 480/2.2046); break;
            }
        }
    };

    //cci_unitofweight
    this.unitofweightOnChange = function (ExecutionContext) {
        var formContext = ExecutionContext.getFormContext();
        var myValue = formContext.getAttribute("cci_unitofweight").getValue();
        if (myValue) {
            switch (myValue) {
                case 100000000: //BALES
                    Sdk.buildConversionFetch2(ExecutionContext, "cci_bales_conversion_factor");
                    break;
                case 100000001: //KG
                    Sdk.buildConversionFetch2(ExecutionContext, "cci_kg_conversion_factor");
                    break;
                case 100000002: //METRIC TON
                    Sdk.buildConversionFetch2(ExecutionContext, "cci_metric_ton_conversion_factor");
                    break;
                case 100000003: //SQM
                    Sdk.buildConversionFetch2(ExecutionContext, "cci_sqm_conversion_factor");
                    break;
            }
        }
    }

    this.buildConversionFetch2 = function (ExecutionContext, cfFieldname, adjuster) {
        var formContext = ExecutionContext.getFormContext();
        var logicalName = formContext.data.entity.getEntityName();
        var prodfield = "productid";
        if (logicalName === "cci_brandprofileproduct")
            prodfield = "cci_brandproductproductid";
        if (logicalName === "cci_mfgprofileproduct")
            prodfield = "cci_productid";
        var product = formContext.getAttribute(prodfield).getValue();

        var alwaysGet = cfFieldname === "cci_bales_conversion_factor" ? " " : "<attribute name='cci_bales_conversion_factor' />";

        if (product && cfFieldname) {
            cFetch = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>"
                + "  <entity name='product'>"
                + "    <attribute name='productid' />"
                + alwaysGet
                + "    <attribute name='" + cfFieldname + "' />"
                + "    <filter type='and'>"
                + "      <condition attribute='productid' operator='eq' uitype='product' value='" + product[0].id + "' />"
                + "    </filter>"
                + "  </entity>"
                + "</fetch>";
            FetchXML = "?fetchXml=" + encodeURIComponent(cFetch);
            Sdk.getConversionValue(ExecutionContext, cfFieldname, FetchXML, adjuster);
        }
    }

    this.buildConversionFetch = function (ExecutionContext, cfFieldname) {
        var me = ExecutionContext.getEventSource();
        var myValue = me.getValue();
        var formContext = ExecutionContext.getFormContext();

        if (myValue == "Yes" || myValue == true) {
            if (Sdk.selectedConversion)
                formContext.getAttribute(Sdk.selectedConversion.getName()).setValue(false);
            Sdk.selectedConversion = me;

            var product = formContext.getAttribute("productid").getValue();
            if (product && cfFieldname) {
                cFetch = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>"
                    + "  <entity name='product'>"
                    + "    <attribute name='productid' />"
                    + "    <attribute name='" + cfFieldname + "' />"
                    + "    <filter type='and'>"
                    + "      <condition attribute='productid' operator='eq' uitype='product' value='" + product[0].id + "' />"
                    + "    </filter>"
                    + "  </entity>"
                    + "</fetch>";
                FetchXML = "?fetchXml=" + encodeURIComponent(cFetch);
                Sdk.getConversionValue(ExecutionContext, cfFieldname, FetchXML);
            }
        }
    }

    this.getConversionValue = function (ExecutionContext, cfFieldname, FetchXML, adjuster) {
        var formContext = ExecutionContext.getFormContext();
        var logicalName = formContext.data.entity.getEntityName();
        var C = (2.2046 / 480) * adjuster;
        var qtyName = logicalName === "opportunityproduct" || logicalName === "salesorderdetail" ? "quantity" : "cci_quantity";
        //var beq = logicalName === "cci_mfgprofileproduct" ? "cci_baleequivalent" : "cci_bale_equivalent";
        var beq = "cci_bale_equivalent";
        var utname = logicalName === "salesorderdetail" ? "cci_unittype" : "cci_unit_type";
        var qty = formContext.getAttribute(qtyName).getValue();
        var proforma = formContext.getAttribute("cci_percentage_cotton").getValue() / 100;
        //var proforma = 1 - (formContext.getAttribute("cci_percentage_cotton").getValue() / 100);

        if (qty) {
            Xrm.WebApi.retrieveMultipleRecords("product", FetchXML).then(
                function success(result) {
                    if (result.entities[0]) {
                        if (result.entities[0][cfFieldname]) {
                            formContext.getAttribute("cci_productconversionfactor").setValue(result.entities[0][cfFieldname]);
                            formContext.getAttribute(beq).setValue(qty * result.entities[0][cfFieldname] * C * proforma);
                        }
                        else if (result.entities[0].cci_bales_conversion_factor) {
                            alert("This Unit Type is not appropriate for the selected CCI Product.  Please select an alternative Unit Type.");
                            formContext.getAttribute("cci_productconversionfactor").setValue(result.entities[0].cci_bales_conversion_factor);
                            formContext.getAttribute(beq).setValue(qty * result.entities[0].cci_bales_conversion_factor * C * proforma);
                            //formContext.getAttribute(utname).setValue(100000000);
                        }
//                        if (logicalName === "cci_mfgprofileproduct")
//                            Sdk.percentUSonChangeMPP(ExecutionContext);
//                        else
                            Sdk.percentUSonChange(ExecutionContext);
                    }
                },
                function (error) {
                    formContext.ui.setFormNotification("Conversion: " + error.message, "ERROR", "_conversion");
                }
            );
        }
    }

    this.percentUSonChangeMPP = function (ExecutionContext) {
        var formContext = ExecutionContext.getFormContext();
        var share = formContext.getAttribute("cci_pctuscotton").getValue() / 100;
        var baleq = formContext.getAttribute("cci_baleequivalent").getValue();
        if (share && baleq) {
            var others = 1 - share;
            formContext.getAttribute("cci_uscottonbales").setValue(baleq * share);
            //formContext.getAttribute("cci_nonuscottonbales").setValue(baleq * others);
        }
    }

    this.percentUSonChange = function (ExecutionContext) {
        var formContext = ExecutionContext.getFormContext();
        var share = formContext.getAttribute("cci_percentage_us_cotton").getValue() / 100;
        var baleq = formContext.getAttribute("cci_bale_equivalent").getValue();
        if (share && baleq) {
            var others = 1 - share;
            formContext.getAttribute("cci_us_cotton_bales").setValue(baleq * share);
            formContext.getAttribute("cci_nonuscottonbales").setValue(baleq * others);
        }
    }

    this.asyncCallSnipet = function (formContext, FetchXML) {
        Xrm.WebApi.retrieveMultipleRecords("businessunit", FetchXML).then(
            function success(result) {
            },
            function (error) {
                formContext.ui.setFormNotification("BU: " + error.message, "ERROR", "_businessunit");
            }
        );
    }
}).call(Sdk);// JavaScript source code
