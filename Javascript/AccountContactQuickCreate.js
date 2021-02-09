function page_onload(executionContext) {
  console.log("PAGE ON LOAD");
  console.log('controls:', Xrm.Page.getControl());
  
  window.top.account = Xrm.Page.getAttribute("cci_supplychainpartneraccount").getValue();
  window.top.country = Xrm.Page.getAttribute("cci_suppliercountry").getValue();
  window.top.website = Xrm.Page.getAttribute("cci_supplierwebsite").getValue();
  window.top.street = Xrm.Page.getAttribute("cci_supplierstreet").getValue();
  window.top.city = Xrm.Page.getAttribute("cci_suppliercity").getValue();
  window.top.state = Xrm.Page.getAttribute("cci_supplierstateprovince").getValue();
  window.top.zip = Xrm.Page.getAttribute("cci_supplierzippostalcode").getValue();

  window.top.phone = Xrm.Page.getAttribute("cci_contactbusinessphone").getValue();
  window.top.email = Xrm.Page.getAttribute("cci_contactemail").getValue();
  window.top.contact_account = Xrm.Page.getAttribute("cci_supplychainpartneraccountlink").getValue();
  window.top.account_country = Xrm.Page.getAttribute("cci_suppliercountry").getValue();
  window.top.first_name = Xrm.Page.getAttribute("cci_contactfirstname").getValue();
  window.top.last_name = Xrm.Page.getAttribute("cci_contactsurname").getValue();
  window.top.position = Xrm.Page.getAttribute("cci_jobtitle").getValue();
}



function accountQuickCreate_onload(executionContext) {
  console.log("ACCOUNT QUICK CREATE ON LOAD");
  console.log('controls:', Xrm.Page.getControl());

  Xrm.Page.getAttribute("name").setValue(window.top.account);
  Xrm.Page.getAttribute("cci_country_lookup").setValue(window.top.country);
  Xrm.Page.getAttribute("websiteurl").setValue(window.top.website);
  Xrm.Page.getAttribute("address1_line1").setValue(window.top.street);
  Xrm.Page.getAttribute("address1_city").setValue(window.top.city);
  Xrm.Page.getAttribute("address1_stateorprovince").setValue(window.top.state);
  Xrm.Page.getAttribute("address1_postalcode").setValue(window.top.zip);
}



function contactQuickCreate_onload(executionContext) {
  console.log("CONTACT QUICK CREATE ON LOAD");
  console.log('controls:', Xrm.Page.getControl());

  Xrm.Page.getAttribute("telephone1").setValue(window.top.phone);
  Xrm.Page.getAttribute("emailaddress1").setValue(window.top.email);
  Xrm.Page.getAttribute("firstname").setValue(window.top.first_name);
  Xrm.Page.getAttribute("lastname").setValue(window.top.last_name);
  Xrm.Page.getAttribute("jobtitle").setValue(window.top.position);
  Xrm.Page.getAttribute("parentcustomerid").setValue(window.top.contact_account);
  Xrm.Page.getAttribute("cci_country_lookup").setValue(window.top.account_country);
}