/*global someFunction b:true*/
/*eslint no-undef: "error"*/
sap.ui.define([
	"org/fater/albofornitori/framework/BaseController",
	"org/fater/albofornitori/util/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/Dialog",
	"sap/m/Input",
	"sap/m/TextArea",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Text",
	"sap/ui/commons/RichTooltip",
	"org/fater/albofornitori/control/TETextQuestion",
	"org/fater/albofornitori/control/TETextAreaQuestion",
	"org/fater/albofornitori/control/TEChoiceQuestion",
	"org/fater/albofornitori/control/TERadioQuestion",
	"org/fater/albofornitori/control/TEFileQuestion",
	"org/fater/albofornitori/control/TERevenueYear3Question",
	"org/fater/albofornitori/control/TERevenueYearQuestion",
	"org/fater/albofornitori/control/TEDateQuestion",
	"org/fater/albofornitori/control/TEMoneyQuestion",
	"org/fater/albofornitori/control/TEFileComplexQuestion",
	"org/fater/albofornitori/control/TENumberType",
	"org/fater/albofornitori/control/TENumberTypeString"
], function(Controller, formatter, JSONModel, MessageBox, Dialog, Input, TextArea, Button, ButtonType, Text, RichTooltip, TETextQuestion, TETextAreaQuestion,
	TEChoiceQuestion, TERadioQuestion, TEFileQuestion, TERevenueYear3Question, TERevenueYearQuestion, TEDateQuestion, TEMoneyQuestion, 
	TEFileComplexQuestion, TENumberType, TENumberTypeString) {
	"use strict";

	return Controller.extend("org.fater.albofornitori.controller.DataCompletion", {
		
		__targetName: "dataCompletion",
		formatter: formatter, 
		__partecipationId: undefined,
		_i: {},
		_firstTimeValidate: true,
		isFromBack: false,
		
		__editEnabled: false,
		
		resetValidation: function() {
			this.tabError = {
				groups: {
					1: 0,
					2: 0,
					3: 0,
					6: 0
				},
				fields: {}
			};
		},
		
		processValidation: function() {
			var controller = this;
			for (var key in controller.tabError.groups) {
			  if (controller.tabError.groups.hasOwnProperty(key)) {
				var errors = controller.tabError.groups[key];
				if( errors === 0 ) {
					controller.getView().byId("dc_tab_" + key ).setCount(null);
					controller.getView().byId("dc_tab_" + key ).setIconColor("Default");
				} else {
					controller.getView().byId("dc_tab_" + key ).setCount(errors);
					controller.getView().byId("dc_tab_" + key ).setIconColor("Critical");
				}
			  }
			}
		},
		
		__initFieldsVisibility: function(controller, oData) {
			
			var doneByFater = controller.getView().getModel().getProperty("/DoneByFater");
			var supplierType = controller.getView().getModel().getProperty("/Supplier/Type");
			var surveyType = controller.getView().getModel().getProperty("/Type");
			var surveyStatus = controller.getView().getModel().getProperty("/Status");
			var userRole = controller.getView().getModel("user").getProperty("/Role");
			var userId = controller.getView().getModel("user").getProperty("/Username");
			var isCommercialRef = userId === controller.getView().getModel().getProperty("/CommercialRefId");
			var isCommercialMan = userId === controller.getView().getModel().getProperty("/CommercManagerId") || (
					controller.getView().getModel().getProperty("/CommercialRefId") === controller.getView().getModel().getProperty("/CommercManagerId") && 
					doneByFater
				);
			var isAnagMan = userId === controller.getView().getModel().getProperty("/RegistryManagerId");
			var disableAll = !this.__editEnabled || surveyStatus !== controller.getComponentModelProperty("Types", "/participationStatus/QC");
			/*if( isAnagMan && isCommercialMan ) {
				isCommercialRef = true;
			}
			if( doneByFater && isCommercialMan ) {
				isCommercialRef = true;
			}*/
			var fields = {};

			//all fields
			
			//	--- GENERAL FIELDS ---
			//	supplier_code
			//	header
			//	business_name
			//	research_critery
			//	street_address
			//	street_number
			//	cap
			//	locality
			//	country
			//	province
			//	language
			//	telephone
			//	communication_preferred
			//	fax
			//	email
			
			var tabKey = "1";
			
			controller.__addField(fields, tabKey, null, "supplier_code", true );
			controller.__addField(fields, tabKey, null, "header", true );
			controller.__addField(fields, tabKey, null, "business_name", true );
			controller.__addField(fields, tabKey, null, "research_critery", true );
			controller.__addField(fields, tabKey, null, "street_address", true );
			controller.__addField(fields, tabKey, null, "street_number", true );
			controller.__addField(fields, tabKey, null, "cap", true );
			controller.__addField(fields, tabKey, null, "locality", true );
			controller.__addField(fields, tabKey, null, "country", true );
			controller.__addField(fields, tabKey, null, "province", true );
			controller.__addField(fields, tabKey, null, "language", true );
			controller.__addField(fields, tabKey, null, "telephone", true );
			controller.__addField(fields, tabKey, null, "communication_preferred", true );
			controller.__addField(fields, tabKey, null, "fax", true );
			controller.__addField(fields, tabKey, {"email": true}, "email", true );
			
			if( surveyType !== controller.getOwnerComponent().getModel("Types").getProperty("/participationType/PRE_QUALIFICATION") ) {
				if( isAnagMan ) {
					controller.__addField(fields, tabKey, null, "header", true, disableAll ? false : true );
				}
			}
			
			if( isCommercialRef && surveyStatus === controller.getComponentModelProperty("Types", "/participationStatus/QC") ) {
				controller.__addField(fields, tabKey, null, "business_name", true, disableAll ? false : true, disableAll ? false : true );
				controller.__addField(fields, tabKey, null, "country", true, disableAll ? false : true, disableAll ? false : true );
			}
			
			//	--- CONTACTS ---
			//	contact_title
			//	contact_name
			//	contact_surname
			//	contact_area
			//	contact_telephone
			//	contact_cellphone
			//	contact_email
			
			controller.__addField(fields, tabKey, null, "contact_title", true );
			controller.__addField(fields, tabKey, null, "contact_name", true );
			controller.__addField(fields, tabKey, null, "contact_surname", true );
			controller.__addField(fields, tabKey, null, "contact_area", true );
			controller.__addField(fields, tabKey, null, "contact_telephone", true );
			controller.__addField(fields, tabKey, null, "contact_cellphone", true );
			controller.__addField(fields, tabKey, {"email": true}, "contact_email", true );
			
			if( isCommercialRef && surveyStatus === controller.getComponentModelProperty("Types", "/participationStatus/QC") ) {
				controller.__addField(fields, tabKey, null, "contact_title", true, disableAll ? false : true );
				controller.__addField(fields, tabKey, null, "contact_name", true, disableAll ? false : true, disableAll ? false : true );
				controller.__addField(fields, tabKey, null, "contact_surname", true, disableAll ? false : true, disableAll ? false : true );
				controller.__addField(fields, tabKey, null, "contact_area", true, disableAll ? false : true );
				controller.__addField(fields, tabKey, null, "contact_telephone", true, disableAll ? false : true );
				controller.__addField(fields, tabKey, null, "contact_cellphone", true, disableAll ? false : true );
				controller.__addField(fields, tabKey, {"email": true}, "contact_email", true, disableAll ? false : true, disableAll ? false : true );
			}
			
			//	--- BANK ---
			//	bank_name
			//	bank_address
			//	abi
			//	cab
			//	bank_account
			//	cin
			//	swift
			//	iban
			//	backup_account
			
			tabKey = "2";
			controller.__addField(fields, tabKey, null, "bank_name" );
			controller.__addField(fields, tabKey, null, "bank_address" );
			controller.__addField(fields, tabKey, null, "abi" );
			controller.__addField(fields, tabKey, null, "cab" );
			controller.__addField(fields, tabKey, null, "bank_account" );
			controller.__addField(fields, tabKey, null, "cin" );
			controller.__addField(fields, tabKey, null, "swift" );
			controller.__addField(fields, tabKey, null, "branch" );
			controller.__addField(fields, tabKey, null, "branch_code" );
			controller.__addField(fields, tabKey, null, "iban" );
			controller.__addField(fields, tabKey, null, "backup_account" );
			
			if( surveyType !== controller.getOwnerComponent().getModel("Types").getProperty("/participationType/PRE_QUALIFICATION") ) {
				controller.__addField(fields, tabKey, null, "payment_form", true );
				
				controller.__addField(fields, tabKey, null, "bank_name", true );
				controller.__addField(fields, tabKey, null, "bank_address", true );
				controller.__addField(fields, tabKey, null, "backup_account", true );
				
				if( supplierType === controller.getOwnerComponent().getModel("Types").getProperty("/supplierTypes/NATIONAL") || supplierType === controller.getOwnerComponent().getModel("Types").getProperty("/supplierTypes/FREELANCER") ) {
					controller.__addField(fields, tabKey, null, "abi", true );
					controller.__addField(fields, tabKey, null, "cab", true );
					controller.__addField(fields, tabKey, null, "bank_account", true );
					controller.__addField(fields, tabKey, null, "cin", true );
					controller.__addField(fields, tabKey, null, "swift", true );
					controller.__addField(fields, tabKey, null, "iban", true );
				} else if ( supplierType === controller.getOwnerComponent().getModel("Types").getProperty("/supplierTypes/CEE") ) {
					controller.__addField(fields, tabKey, null, "branch", true );
					controller.__addField(fields, tabKey, null, "branch_code", true );
					controller.__addField(fields, tabKey, null, "swift", true );
					controller.__addField(fields, tabKey, null, "iban", true );
				} else if ( supplierType === controller.getOwnerComponent().getModel("Types").getProperty("/supplierTypes/EXTRA_CEE") ) {
					controller.__addField(fields, tabKey, null, "branch_code", true );
					controller.__addField(fields, tabKey, null, "swift", true );
					controller.__addField(fields, tabKey, null, "iban", true );
				}
				
				fields.abi.minLength = 5;
				fields.cab.minLength = 5;
				fields.bank_account.minLength = 12;
				fields.swift.minLength = 11;
				fields.iban.minLength = 4;
				
			} else {
				controller.__addField(fields, tabKey, null, "payment_form", false );
			}
			
			//	--- FISCAL INFORMATION ---
			//	vat_it
			//	vat_cee
			//	fiscal_code
			//	profession
			//	phisical_person
			//	gender
			//	birth_city
			//	birth_date
			//	withholding
			//	fater_company
			//	industrial_sector
			//	smoi
			//	reconciliation_account
			//	classification_key
			//	payment_condition_text
			//	payment_condition
			//	check_double_invoice
			//	payment_method
			
			controller.__addField(fields, tabKey, null, "vat_it" );
			controller.__addField(fields, tabKey, null, "vat_cee" );
			controller.__addField(fields, tabKey, null, "fiscal_code" );
			controller.__addField(fields, tabKey, null, "profession" );
			controller.__addField(fields, tabKey, null, "phisical_person" );
			controller.__addField(fields, tabKey, null, "gender" );
			controller.__addField(fields, tabKey, null, "birth_city" );
			controller.__addField(fields, tabKey, null, "birth_date" );
			controller.__addField(fields, tabKey, null, "withholding" );
			controller.__addField(fields, tabKey, null, "fater_company", true );
			controller.__addField(fields, tabKey, null, "industrial_sector", true );
			controller.__addField(fields, tabKey, null, "smoi", true );
			controller.__addField(fields, tabKey, null, "reconciliation_account", false );
			controller.__addField(fields, tabKey, null, "classification_key", true );
			controller.__addField(fields, tabKey, null, "payment_condition_text", true );
			controller.__addField(fields, tabKey, null, "payment_condition", true );
			controller.__addField(fields, tabKey, null, "check_double_invoice", false );
			controller.__addField(fields, tabKey, null, "payment_method", false );
			controller.__addField(fields, tabKey, null, "account_management_form", false );
			
			if( supplierType === controller.getOwnerComponent().getModel("Types").getProperty("/supplierTypes/NATIONAL") ) {
				controller.__addField(fields, tabKey, null, "vat_it", true );
			} else if ( supplierType === controller.getOwnerComponent().getModel("Types").getProperty("/supplierTypes/CEE") ) {
				controller.__addField(fields, tabKey, null, "vat_cee", true );
			} else if ( supplierType === controller.getOwnerComponent().getModel("Types").getProperty("/supplierTypes/EXTRA_CEE") ) {
				controller.__addField(fields, tabKey, null, "vat_cee", true );
			} else if( supplierType === controller.getOwnerComponent().getModel("Types").getProperty("/supplierTypes/FREELANCER") ) {
				controller.__addField(fields, tabKey, null, "vat_it", true );
				controller.__addField(fields, tabKey, null, "fiscal_code", true );
				
				controller.__addField(fields, tabKey, null, "profession", true );
				controller.__addField(fields, tabKey, null, "gender", true );
				controller.__addField(fields, tabKey, null, "birth_city", true );
				controller.__addField(fields, tabKey, null, "birth_date", true );
				controller.__addField(fields, tabKey, null, "withholding", true );
			}
			
			if( isCommercialRef && surveyStatus === controller.getComponentModelProperty("Types", "/participationStatus/QC") ) {
				if( supplierType === controller.getOwnerComponent().getModel("Types").getProperty("/supplierTypes/NATIONAL") ) {
					controller.__addField(fields, tabKey, null, "vat_it", true, disableAll ? false : true, disableAll ? false : true );
				} else if ( supplierType === controller.getOwnerComponent().getModel("Types").getProperty("/supplierTypes/CEE") ) {
					controller.__addField(fields, tabKey, null, "vat_cee", true, disableAll ? false : true, disableAll ? false : true );
				} else if ( supplierType === controller.getOwnerComponent().getModel("Types").getProperty("/supplierTypes/EXTRA_CEE") ) {
					controller.__addField(fields, tabKey, null, "vat_cee", true, disableAll ? false : true, disableAll ? false : true );
				} else if( supplierType === controller.getOwnerComponent().getModel("Types").getProperty("/supplierTypes/FREELANCER") ) {
					controller.__addField(fields, tabKey, null, "vat_it", true, disableAll ? false : true, disableAll ? false : true );
					controller.__addField(fields, tabKey, null, "fiscal_code", true, disableAll ? false : true, disableAll ? false : true );
					
					controller.__addField(fields, tabKey, null, "profession", true, disableAll ? false : true );
					controller.__addField(fields, tabKey, null, "gender", true, disableAll ? false : true );
					controller.__addField(fields, tabKey, null, "birth_city", true, disableAll ? false : true );
					controller.__addField(fields, tabKey, null, "birth_date", true, disableAll ? false : true );
					controller.__addField(fields, tabKey, null, "withholding", true, disableAll ? false : true );
				}
			}
			
			if( surveyType !== controller.getOwnerComponent().getModel("Types").getProperty("/participationType/PRE_QUALIFICATION") ) {
				if ( isCommercialRef ) {
					controller.__addField(fields, tabKey, null, "payment_condition_text", true, disableAll ? false : true, disableAll ? false : true );
				}
				if( isAnagMan ) {
					controller.__addField(fields, tabKey, null, "account_management_form", true );
					if( supplierType === controller.getOwnerComponent().getModel("Types").getProperty("/supplierTypes/FREELANCER") ) {
						controller.__addField(fields, tabKey, null, "phisical_person", true, disableAll ? false : true );
					}
					controller.__addField(fields, tabKey, null, "reconciliation_account", true, disableAll ? false : true, disableAll ? false : true );
					controller.__addField(fields, tabKey, null, "classification_key", true, disableAll ? false : true, disableAll ? false : true );
					controller.__addField(fields, tabKey, null, "payment_condition", true, disableAll ? false : true, disableAll ? false : true );
					controller.__addField(fields, tabKey, null, "check_double_invoice", true, disableAll ? false : true, disableAll ? false : true );
					controller.__addField(fields, tabKey, null, "payment_method", true, disableAll ? false : true );
				}
			}
			
			
			if( isCommercialRef && surveyStatus === controller.getComponentModelProperty("Types", "/participationStatus/QC") ) {
				controller.__addField(fields, tabKey, null, "smoi", true, disableAll ? false : true, disableAll ? false : true );
				controller.__addField(fields, tabKey, null, "industrial_sector", true, disableAll ? false : true, disableAll ? false : true );
			}
			
			//	--- PURCHASE CONDITIONS ---
			//	purchase_organization
			//	purchase_currency
			//	purchase_incoterms
			//	purchase_incoterms_text
			//	purchase_payment_condition_text
			//	purchase_payment_condition
			//	purchase_invoice_verification
			//	purchase_transportation_method
			
			tabKey = "3";
			controller.__addField(fields, tabKey, null, "purchase_organization", true );
			controller.__addField(fields, tabKey, null, "purchase_currency", true );
			controller.__addField(fields, tabKey, null, "purchase_incoterms", true );
			controller.__addField(fields, tabKey, null, "purchase_incoterms_text", true );
			controller.__addField(fields, tabKey, null, "purchase_payment_condition_text", true );
			controller.__addField(fields, tabKey, null, "purchase_payment_condition", true );
			controller.__addField(fields, tabKey, null, "purchase_invoice_verification", false );
			controller.__addField(fields, tabKey, null, "purchase_scheme_group", true );
			controller.__addField(fields, tabKey, null, "purchase_transportation_method", false );
			
			
			if( surveyType !== controller.getOwnerComponent().getModel("Types").getProperty("/participationType/PRE_QUALIFICATION") ) {
				if ( isCommercialRef ) {
					
					var selectedIncoterm = oData.Supplier.PurchaseOrg[0].BuyIncotermsCode;
					var incotermTextMandatory = false;
					if( selectedIncoterm ) {
						incotermTextMandatory = controller.getView().getModel("oDataModel").getProperty("/IncotermSet('"+selectedIncoterm+"')/Mandatory");
					}
					
					controller.__addField(fields, tabKey, null, "purchase_currency", true, disableAll ? false : true, disableAll ? false : true );
					controller.__addField(fields, tabKey, null, "purchase_incoterms", true, disableAll ? false : true, disableAll ? false : true );
					controller.__addField(fields, tabKey, null, "purchase_incoterms_text", true, disableAll ? false : true, disableAll ? false : incotermTextMandatory );
					controller.__addField(fields, tabKey, null, "purchase_scheme_group", false );
				}
				
				if( isAnagMan ) {
					controller.__addField(fields, tabKey, null, "purchase_payment_condition", true, disableAll ? false : true, disableAll ? false : true );
					controller.__addField(fields, tabKey, null, "purchase_invoice_verification", true, disableAll ? false : true, disableAll ? false : true );
					
					controller.__addField(fields, tabKey, null, "purchase_scheme_group", true, disableAll ? false : true, disableAll ? false : oData.Supplier.PurchaseOrg[0].Smoi );
					controller.__addField(fields, tabKey, null, "purchase_transportation_method", true, disableAll ? false : true );
				}
			}
			
			//	--- AUTHORIZATIONS ---
			//	supplier_user_hca
			//	supplier_user_hse_firstname
			//	supplier_user_hse_lastname
			//	supplier_user_hse_email
			//	supplier_roles
			//	supplier_relations
			
			tabKey = "6";
			controller.__addField(fields, tabKey, null, "supplier_user_hca", true );
			controller.__addField(fields, tabKey, null, "supplier_user_hse_firstname", true );
			controller.__addField(fields, tabKey, null, "supplier_user_hse_lastname", true );
			controller.__addField(fields, tabKey, null, "supplier_user_hse_email", true );
			controller.__addField(fields, tabKey, null, "supplier_roles", true );
			controller.__addField(fields, tabKey, null, "supplier_relations", true );
			
			
			if( surveyType !== controller.getOwnerComponent().getModel("Types").getProperty("/participationType/PRE_QUALIFICATION") ) {
				if ( isCommercialRef ) {
					controller.__addField(fields, tabKey, null, "supplier_user_hca", true, disableAll ? false : true, false );
					controller.__addField(fields, tabKey, null, "supplier_user_hse_firstname", true, disableAll ? false : true, false );
					controller.__addField(fields, tabKey, null, "supplier_user_hse_lastname", true, disableAll ? false : true, false );
					controller.__addField(fields, tabKey, null, "supplier_user_hse_email", true, disableAll ? false : true, false );
					controller.__addField(fields, tabKey, null, "supplier_roles", true, disableAll ? false : true, false );
				}	
			}
			
			// # TODO FORCE IT TO INVISIBLE
			
			//	--- OTHER CONTACTS ---
			// contact_business_name
			// contact_business_surname
			// contact_business_email
			// contact_oda_name
			// contact_oda_surname
			// contact_oda_email
			// contact_administration_name
			// contact_administration_surname
			// contact_administration_email
			
			controller.__addField(fields, tabKey, null, "contact_business_name", true );
			controller.__addField(fields, tabKey, null, "contact_business_surname", true );
			controller.__addField(fields, tabKey, {"email": true}, "contact_business_email", true );
			
			controller.__addField(fields, tabKey, null, "contact_oda_name", true );
			controller.__addField(fields, tabKey, null, "contact_oda_surname", true );
			controller.__addField(fields, tabKey, {"email": true}, "contact_oda_email", true );
			
			controller.__addField(fields, tabKey, null, "contact_administration_name", true );
			controller.__addField(fields, tabKey, null, "contact_administration_surname", true );
			controller.__addField(fields, tabKey, {"email": true}, "contact_administration_email", true );
			
			controller.__fields = fields;
			
			var oFieldsModel = new JSONModel();
			oFieldsModel.setData(fields);
			controller.getView().setModel(oFieldsModel, "field_visibility");
		},
		
		__addField: function(fields, group, options, field_name, visible, enabled, required) {
			if( fields[field_name] === undefined ) {
				fields[field_name] = {};
			}
			fields[field_name].group = group;
			fields[field_name].name = field_name;
			fields[field_name].options = options;
			fields[field_name].visible = visible ? visible : false;
			fields[field_name].enabled = enabled ? enabled : false;
			fields[field_name].required = required ? required : false;
			fields[field_name].class = fields[field_name].required ? "required" : null;
			fields[field_name].skipVerification = false;
			fields[field_name].minLength = 0;
			return fields;
		},
		
		__mapData: function(data) {
			if( data["results"] ) {
				data = data["results"];
			}
				
			for (var i in data) {
				if (data[i] instanceof Object) {
					data[i] = this.__mapData(data[i]);
				}
			}
			return data;
		},
		
		__mapHSE: function(isHSE, questions) {
			if( !questions || questions.length === 0 )
				return;
			
			for (var qi in questions) {
				var q = questions[qi];
				if( isHSE ) {
					var HsnePoints = 0;
					for (var ai in q["AnswerS"]) {
						var a = q["AnswerS"][ai];
						if( a.Selected ) {
							HsnePoints += a["HsnePoints"];
						}
					}
					q["HsnePoints"] = HsnePoints;
				}
				q["IsHsne"] = isHSE;
			}
		},
		
		onRouteMatched: function(oEvent, routeName, id){
			var controller = this;
			this.__setEnableEdit(false);
			var oView = this.getView();
			this.isFromBack = this.__partecipationId === id;
			this.__partecipationId = id;
			
			this.resetValidation();

			if( !this.isFromBack ) {
				var mParameters = {
						urlParameters: {
							"$expand": "Survey,Survey/GroupS/QuestionS/AnswerS,Supplier,Cluster/ClusterCom/Company/PurchaseOrg,Supplier/Company,Supplier/PurchaseOrg"
							// "$expand": "Survey,Survey/GroupS/QuestionS/AnswerS,Supplier"
						},
						success: function(oData) {

							var newOData = this.__mapData(oData);
							this.__mapHSE(newOData.Survey.GroupS[0].IsHsne, newOData.Survey.GroupS[0].QuestionS);
							this.__mapHSE(newOData.Survey.GroupS[1].IsHsne, newOData.Survey.GroupS[1].QuestionS);
							this.__mapHSE(newOData.Survey.GroupS[2].IsHsne, newOData.Survey.GroupS[2].QuestionS);
							this.__mapHSE(newOData.Survey.GroupS[3].IsHsne, newOData.Survey.GroupS[3].QuestionS);
							
							var oParticipationModel = oView.getModel();
							if (!oView.getModel()) {
								var oParticipationModel = new JSONModel();
							}
							oParticipationModel.setData(newOData);
							oView.setModel(oParticipationModel);

							
							controller.getView().getModel("tempModel").setProperty("/editEnabled", controller.__editEnabled);
							controller.__initFieldsVisibility(controller, newOData);
							

							var oList = oView.byId("clustersTable");
							var oTemplate = oList.getItems()[0].clone();
							oTemplate.setVisible(true);
							var oClusterFilters = [
								new sap.ui.model.Filter("SupplierId", sap.ui.model.FilterOperator.EQ, oData.SupplierId),
								new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.NE, controller.getComponentModelProperty("Types", "/participationStatus/R")),
								new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.NE, controller.getComponentModelProperty("Types", "/participationStatus/DI"))
							];
							oList.bindItems({
								path: "oDataModel>/ParticipationSet",
								template: oTemplate,
								filters: oClusterFilters,
								parameters: {
									expand: "Cluster"
								}
							});

							controller._updateCountrySelectOptions( newOData.Supplier.Country );
							this.getView().byId("iconTabBarDataCompletion").setSelectedKey("dc_tab_1");
							
							for (var key in this.__fields) {
							  if (this.__fields.hasOwnProperty(key)) {
								this.handleFieldVerification(this.__fields[key]);
							  }
							}
							
							var pct = controller.getView().byId("payment_condition");
							pct.attachChange(function(oEventChange) {
								var ppct = controller.getView().byId("purchase_payment_condition");
								if( ppct.getSelectedKey() === null || ppct.getSelectedKey() === undefined || ppct.getSelectedKey().length === 0 ) {
									ppct.setSelectedKey(pct.getSelectedKey());
								}
							});
							
							this.getView().getModel("oUserModel").read("/UserSet('" + newOData.CommercialRefId + "')", {
								success: function(oUserOData) {
									var oUserModel = new JSONModel();
									oUserModel.setData(oUserOData);
									oView.setModel(oUserModel, "CommercialReference");
								}
							});
							
							if( !this.getView().getModel("tickets") ) {
								this.__loadTickets();
							}
							
							this.getView().byId("data_completion_page").setShowFooter(true);

							oView.setBusy(false);
						}.bind(this),
						error: function(oError) {
							jQuery.sap.log.info("Odata Error occured");
							oView.setBusy(false);
						}.bind(this)
					};

				this.getView().setBusyIndicatorDelay(1);
				this.getView().setBusy(true);
				this.getView().getModel("oDataModel").read("/" + id, mParameters);
				
			} else {
				this.__initFieldsVisibility(this, this.getView().getModel().oData);
			}

			//Subscribe to validation Event
			sap.ui.getCore().getEventBus().subscribe("validate", "result", this.onValidateResult, this);
			sap.ui.getCore().getEventBus().subscribe("validate", "refresh_validity_check", this.onRefreshValidityCheck, this);

			oView.bindElement("/");
			
		},
		
		processFieldVerification: function(field, forceValidation) {
			var controller = this;
			var valid = controller.__checkRequired(field, forceValidation);
			if( controller.tabError.fields[field["name"]] === undefined || valid !== controller.tabError.fields[field["name"]] ) {
				if( !valid ) {
					controller.tabError.groups[field["group"]]++;
				} else if( valid && controller.tabError.fields[field["name"]] !== undefined ) {
					controller.tabError.groups[field["group"]]--;
				}
			}
			controller.tabError.fields[field["name"]] = valid;
			controller.processValidation();
		},
		
		handleFieldVerification: function(field) {
			var controller = this;
			var e = this.getView().byId(field.name);
			if( e && !field.skipValidation ) {
				if( e.attachChange ) {
					e.attachChange(function(oEventChange) {
						controller.processFieldVerification(field, false);
					});
				} else if( e.attachSelect ) {
					e.attachSelect(function(oEventSelect) {
						controller.processFieldVerification(field, false);
					});
				}
			}
		},
		
		_bIsFirstTime : true,
		
		fixIconTabBarFilter: function(oITF, invalidate) {
			var oView = this.getView(),
					oPage = oView.byId("data_completion_page");
			if( invalidate ) {
				oITF.invalidate();
				oITF.rerender();
			}
			for ( var i = 0 ; i < oITF.getContent().length ; i++ ) {
				oITF.getContent()[i].rerender();
			}
			oPage.rerender();
			oView.getModel().refresh();
			for ( var i = 0 ; i < oITF.getContent().length ; i++ ) {
				oITF.getContent()[i].rerender();
			}
		},
		
		iconTabBarItemSelected: function (oEvent){
			var e = this._i[oEvent.getParameter("selectedItem").getId()];
			if (e === null || e === undefined) {
				if( oEvent.getParameters().selectedItem.getKey() === "dc_tab_5" ) {
					this.getView().byId("iconTabBarDataCompletion").setSelectedKey( "dc_tab_6" );
					this.getView().byId("iconTabBarDataCompletion").setSelectedKey( "dc_tab_5" );
				}
				
				this._i[oEvent.getParameter("selectedItem").getId()] = 0;
				this.fixIconTabBarFilter(oEvent.getParameter("selectedItem"));
				
				if( oEvent.getParameters().selectedItem.getKey() === "dc_tab_5" ) {
					this.getView().byId("iconTabBarDataCompletion").setSelectedKey( "dc_tab_6" );
					this.getView().byId("iconTabBarDataCompletion").setSelectedKey( "dc_tab_5" );
				}
			}
		},
		
		__loadTickets: function() {
			var controller = this;
			var oView = this.getView();
			var partId = parseInt(this.getView().getModel().getProperty("/ParticipationId"), 10);
			
			var mParameters = {
				filters: [
					new sap.ui.model.Filter("ParticipationId", sap.ui.model.FilterOperator.EQ, partId)	
				],
				urlParameters: {
					"$expand": "Item"
				},
				success: function(oData) {
					var doneByFater = controller.getView().getModel().getProperty("/DoneByFater");
					var userRole = controller.getView().getModel("user").getProperty("/Role");
					var userId = controller.getView().getModel("user").getProperty("/Username");
					var isCommercialRef = userId === controller.getView().getModel().getProperty("/CommercialRefId");
					var isCommercialMan = userId === controller.getView().getModel().getProperty("/CommercManagerId") || (
						controller.getView().getModel().getProperty("/CommercialRefId") === controller.getView().getModel().getProperty("/CommercManagerId") && 
						doneByFater
					);
					var isSupplier = userRole === controller.getOwnerComponent().getModel("Types").getProperty("/userRoleTypes/SUPPLIER") || ( isCommercialRef && doneByFater );
					var isAnagMan = userId === controller.getView().getModel().getProperty("/RegistryManagerId");
					var ticketVisible = false;
					var hasInternal = false;
					var hasExternal = false;
					for (var ti in oData.results) {
						var t = oData.results[ti];
						if( t.Internal ) {
							hasInternal = true;
						} else {
							hasExternal = true;
						}
						if( !t.Internal && (isSupplier || isCommercialRef || isAnagMan) ) {
							ticketVisible = true;
						} else if ( t.Internal && (isCommercialMan || isCommercialRef || isAnagMan) ) {
							ticketVisible = true;
						}
					}
					var oTickets = oView.getModel();
					if (!oView.getModel("tickets")) {
						oTickets = new JSONModel();
					}
					oData.hasInternal = hasInternal;
					oData.hasExternal = hasExternal;
					oTickets.setData(oData);
					oView.setModel(oTickets, "tickets");
					oView.byId("dc_tab_7").setVisible(ticketVisible);
					
					var surveyStatus = controller.getView().getModel().getProperty("/Status");
					if( (isSupplier && (surveyStatus === controller.getComponentModelProperty("Types", "/participationStatus/ES") || surveyStatus === controller.getComponentModelProperty("Types", "/participationStatus/EA"))) 
						|| (isCommercialRef && surveyStatus === controller.getComponentModelProperty("Types", "/participationStatus/ER")) ) {
						this.getView().byId("iconTabBarDataCompletion").setSelectedKey("dc_tab_7");
					}
				}.bind(this),
				error: function(oError) {
				}.bind(this)
			};

			this.getView().getModel("oDataModel").read("/TicketHSet", mParameters);
		},
		
		onTicketPress: function(oEvent) {
			var ticket = this.getView().getModel("tickets").getProperty(oEvent.getSource().getBindingContextPath());
			this.getRouter().navTo("ticketDataCompletion",{
				participation_id: ticket.ParticipationId,
				ticket_id: ticket.TicketId
			});
		},
		
		
		onUpdateFinishedReadOnly: function(oEvent) {
			var e = this._i[oEvent.getSource().getId()];
			if (e === null || e === undefined) {
				this._i[oEvent.getSource().getId()] = 0;
				var items = oEvent.getSource().getItems();
				for (var i = 0; i < items.length; i++) {
					var item = items[i];
					var customControl = this.getCustomControl(item.getBindingContext());
					item.getContent()[0].addContent(customControl);
				}
			}
		},

		getCustomControl: function(bindingContext, enabled) {
			
			var type = bindingContext.getObject().Type;
			var control = null;
			if (type === 'TEXT') {
				control = new TETextQuestion({
					mandatory: "{Mandatory}",
					enabled: false
				});
			} else if (type === 'TEXT_AREA') {
				control = new TETextAreaQuestion({
					mandatory: "{Mandatory}",
					enabled: false
				});
			} else if (type === 'TEXT_MULTI_CHOICE' || type === 'SINGLE_CHECKBOX') {
				control = new TEChoiceQuestion({
					mandatory: "{Mandatory}",
					enabled: false
				});
			} else if (type === 'TEXT_SINGLE_CHOICE') {
				control = new TERadioQuestion({
					mandatory: "{Mandatory}",
					enabled: false
				});
			} else if (type === 'FILE') {
				control = new TEFileQuestion({
					mandatory: "{Mandatory}",
					enabled: false
				});
			} else if (type === 'YEAR_REVENUE_3') {
				control = new TERevenueYear3Question({
					mandatory: "{Mandatory}",
					enabled: false
				});
			} else if (type === 'YEAR_REVENUE') {
				control = new TERevenueYearQuestion({
					mandatory: "{Mandatory}",
					enabled: false
				});
			} else if (type === 'DATEPICKER') {
				control = new TEDateQuestion({
					mandatory: "{Mandatory}",
					enabled: false
				});
			} else if (type === 'MONEY') {
				control = new TEMoneyQuestion({
					mandatory: "{Mandatory}",
					enabled: false
				});
			} else if (type === 'FILE_CERTIFICATION') {
				control = new TEFileComplexQuestion({
					mandatory: "{Mandatory}",
					enabled: false
				});
			}

			return control;
		},
		
		__checkRequired: function(field, forceVerificartion) {
			var isValid = true;
			
			
			if( (field.required || field.minLength > 0) && (!field.skipVerification || forceVerificartion) ) {
				var element = this.getView().byId(field.name);
				var isEmpty = false;
				
				if( field.required ) {
					if( element.getSelectedItem ) {
						isEmpty = !element.getSelectedItem() || element.getSelectedItem().getKey() === null || element.getSelectedItem().getKey().length === 0;
					} else if ( element.getSelected ) {
						isEmpty = false;
					} else {
						isEmpty = element.getValue() === null || element.getValue().length === 0;
					}
					if( isEmpty ) {
						isValid = false;
						if( element.setValueState ) {
							element.setValueState("Error");
						}
						if( element.setValueStateText ) {
							element.setValueStateText( this.getTranslation("field_required_error") );
						}
					}
				}
				
				if( isValid && field.minLength > 0 && element.getValue().length > 0 ) { 
					if( element.getValue().length < field.minLength ) {
						isValid = false;
						if( element.setValueState ) {
							element.setValueState("Error");
						}
						if( element.setValueStateText ) {
							element.setValueStateText( this.getTranslation("field_min_len_error", field.minLength) );
						}
					}
				}
				
				if( isValid && element.getValue && element.getValue().length > 0 && field.options  ) {
					if( field.options.email ) {
						var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
						isValid = re.test(element.getValue());
						if( !isValid ) {
							if( element.setValueState ) {
								element.setValueState("Error");
							}
							if( element.setValueStateText ) {
								element.setValueStateText( this.getTranslation("field_email_error") );
							}
						}
					}
				}
			
				if( isValid ) {
						if( element.setValueState ) {
							element.setValueState("Success");
						}
						if( element.setValueStateText ) {
							element.setValueStateText( null );
						}
				}
			}
			return isValid;
		},
		
		onRefreshValidityCheck: function(channel, event, data) {
			if( !this._firstTimeValidate ) {
				this._validateForm();
			}
		},
		
		_validateForm: function() {
			var isAllValid = true;
			var controller = this;
			this._firstTimeValidate = false;
			
			this.resetValidation();
			
			//First check if all fields has been correctly validated
			for (var key in this.__fields) {
			  if (this.__fields.hasOwnProperty(key)) {
				var field = controller.__fields[key];
				var valid = controller.__checkRequired(controller.__fields[key], false);
				if( controller.tabError.fields[field["name"]] === undefined || valid !== controller.tabError.fields[field["name"]] ) {
					if( !valid ) {
						controller.tabError.groups[field["group"]]++;
					} else if( valid && controller.tabError.fields[field["name"]] !== undefined ) {
						controller.tabError.groups[field["group"]]--;
					}
				}
				controller.tabError.fields[field["name"]] = valid;
				isAllValid = isAllValid && valid;
			  }
			}
			
			var element = this.getView().byId(this.__fields["communication_preferred"].name);
			if( element.getSelectedItem() ) {
				var selectedKey = element.getSelectedItem().getKey();
				if( selectedKey === "FAX" ) {
					var valid = controller.__checkRequired(controller.__fields["fax"], true);
					if( controller.tabError.fields[controller.__fields["fax"]["name"]] === undefined || valid !== controller.tabError.fields[controller.__fields["fax"]["name"]] ) {
						if( !valid ) {
							controller.tabError.groups[controller.__fields["fax"]["group"]]++;
						} else if( valid && controller.tabError.fields[controller.__fields["fax"]["name"]] !== undefined ) {
							controller.tabError.groups[controller.__fields["fax"]["group"]]--;
						}
					}
					controller.tabError.fields[controller.__fields["fax"]["name"]] = valid;
						
					var otherElem = controller.getView().byId(controller.__fields["email"].name);
					otherElem.setValueState("None");
					otherElem.setValueStateText(null);
					isAllValid = isAllValid && valid;
				} else if( selectedKey === "INT" ) {
					var valid = controller.__checkRequired(controller.__fields["email"], true);
					if( controller.tabError.fields[controller.__fields["email"]["name"]] === undefined || valid !== controller.tabError.fields[controller.__fields["email"]["name"]] ) {
						if( !valid ) {
							controller.tabError.groups[controller.__fields["email"]["group"]]++;
						} else if( valid && controller.tabError.fields[controller.__fields["email"]["name"]] !== undefined ) {
							controller.tabError.groups[controller.__fields["email"]["group"]]--;
						}
					}
					controller.tabError.fields[controller.__fields["email"]["name"]] = valid;
					var otherElem = controller.getView().byId(controller.__fields["fax"].name);
					otherElem.setValueState("None");
					otherElem.setValueStateText(null);
					isAllValid = isAllValid && valid;
				}
			}
			
			this.processValidation();
			
			return isAllValid;
		},
		
		onApproveEditButtonPress: function(oEvent){
			var controller = this;
			var dialog = new Dialog({
				title: controller.getTranslation("approveEditSupplierDialogTitle"),
				type: 'Message',
				content: new Text({
					text: controller.getTranslation("approveEditSupplierDialogMessage")
				}),
				beginButton: new Button({
					type: ButtonType.Accept,
					text: controller.getTranslation("approveEditSupplierDialogPositiveAction"),
					press: function() {
						controller.handleParticipationEdit(dialog, "A", controller.getTranslation("approveEditSupplierDialogSuccess"), controller.getTranslation("approveEditSupplierDialogError"), function(oData, response) {
							var oSplitApp = controller.getView().getParent().getParent();
							if( oSplitApp.setMode ) {
								oSplitApp.setMode(sap.m.SplitAppMode.ShowHideMode);
							}
							controller.navTo("surveyList");
						});
					}
				}),
				endButton: new Button({
					text: controller.getTranslation("approveEditSupplierDialogNegativeAction"),
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
			dialog.open();
		},
		
		onRejectEditButtonPress: function(oEvent){
			var controller = this;
			var dialog = new Dialog({
				title: controller.getTranslation("rejectEditSupplierDialogTitle"),
				type: 'Message',
				content: new Text({
					text: controller.getTranslation("rejectEditSupplierDialogMessage")
				}),
				beginButton: new Button({
					type: ButtonType.Accept,
					text: controller.getTranslation("rejectEditSupplierDialogPositiveAction"),
					press: function() {
						controller.handleParticipationEdit(dialog, "R", controller.getTranslation("rejectEditSupplierDialogSuccess"), controller.getTranslation("rejectEditSupplierDialogError"), function(oData, response) {
							var oSplitApp = controller.getView().getParent().getParent();
							if( oSplitApp.setMode ) {
								oSplitApp.setMode(sap.m.SplitAppMode.ShowHideMode);
							}
							controller.navTo("surveyList");
						});
					}
				}),
				endButton: new Button({
					text: controller.getTranslation("rejectEditSupplierDialogNegativeAction"),
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
			dialog.open();
		},
		
		onSendEditButtonPress: function(oEvent){
			var controller = this;
			var validForm = controller._validateForm();
			if( validForm ) {
				var dialog = new Dialog({
					title: controller.getTranslation("sendEditSupplierDialogTitle"),
					type: 'Message',
					content: new Text({
						text: controller.getTranslation("sendEditSupplierDialogMessage")
					}),
					beginButton: new Button({
						type: ButtonType.Accept,
						text: controller.getTranslation("sendEditSupplierDialogPositiveAction"),
						press: function() {
							controller.updateParticipation(dialog, controller.getComponentModelProperty("Types", "/participationStatus/QC"), controller.getTranslation("sendEditSupplierDialogSuccess"), controller.getTranslation("sendEditSupplierDialogError"), function(oData, response) {
								var oSplitApp = controller.getView().getParent().getParent();
								if( oSplitApp.setMode ) {
									oSplitApp.setMode(sap.m.SplitAppMode.ShowHideMode);
								}
								controller.navTo("surveyList");
							}, true);
						}
					}),
					endButton: new Button({
						text: controller.getTranslation("sendEditSupplierDialogNegativeAction"),
						press: function() {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});
				dialog.open();
			} else {
				sap.m.MessageToast.show(controller.getTranslation("form_error_text"));
			}
		},
		
		onApproveRegisterButtonPress: function(oEvent){
			var controller = this;
			var validForm = controller._validateForm();
			if( validForm ) {
				var dialog = new Dialog({
					title: controller.getTranslation("approveRegisterSupplierDialogTitle"),
					type: 'Message',
					content: new Text({
						text: controller.getTranslation("approveRegisterSupplierDialogMessage")
					}),
					beginButton: new Button({
						type: ButtonType.Accept,
						text: controller.getTranslation("approveRegisterSupplierDialogPositiveAction"),
						press: function() {
							controller.updateParticipation(dialog, controller.getComponentModelProperty("Types", "/participationStatus/QC"), controller.getTranslation("approveRegisterSupplierDialogSuccess"), controller.getTranslation("approveRegisterSupplierDialogError"), function(oData, response) {
								if( oData.Status === controller.getComponentModelProperty("Types", "/participationStatus/QC") && oData.Supplier.Lifnr !== "" ) {
									sap.m.MessageToast.show(controller.getTranslation("supplier_created_success", oData.Supplier.Lifnr), {
									    duration: 5000,
									    width: "30em",
									    animationDuration: 1000,
									    closeOnBrowserNavigation: false
									});
								}		
								
								var oSplitApp = controller.getView().getParent().getParent();
								if( oSplitApp.setMode ) {
									oSplitApp.setMode(sap.m.SplitAppMode.ShowHideMode);
								}
								controller.navTo("surveyList");
							}, true);
						}
					}),
					endButton: new Button({
						text: controller.getTranslation("approveRegisterSupplierDialogNegativeAction"),
						press: function() {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});
				dialog.open();
			} else {
				sap.m.MessageToast.show(controller.getTranslation("form_error_text"));
			}
		},
		
		onRejectButtonPress: function(oEvent){
			var controller = this;
			var dialog = new Dialog({
				title: controller.getTranslation("rejectSupplierDialogTitle"),
				type: 'Message',
				content: [
					new Text({
						text: controller.getTranslation("rejectSupplierDialogMessage")
					}),
					new TextArea('rejectRequestBody', {
						growing: true,
						growingMaxLines: 7,
						liveChange: function(oEvent) {
							var enabled = sap.ui.getCore().byId("rejectRequestBody").getValue().length > 0;
							oEvent.getSource().getParent().getBeginButton().setEnabled(enabled);
						},
						width: '100%',
						placeholder: controller.getTranslation("rejectRequestSupplierDialogMessageRequired")
					})
				],
				beginButton: new Button({
					type: ButtonType.Accept,
					text: controller.getTranslation("rejectSupplierDialogPositiveAction"),
					press: function() {
						var sMessage = sap.ui.getCore().byId("rejectRequestBody").getValue();
						controller.getView().getModel().setProperty("/RejectNote", sMessage);
						controller.updateParticipation(dialog, controller.getComponentModelProperty("Types", "/participationStatus/R"), controller.getTranslation("rejectSupplierDialogSuccess"), controller.getTranslation("rejectSupplierDialogError"), function() {
							var oSplitApp = controller.getView().getParent().getParent();
							if( oSplitApp.setMode ) {
								oSplitApp.setMode(sap.m.SplitAppMode.ShowHideMode);
							}
							controller.navTo("surveyList");
						});
					}
				}),
				endButton: new Button({
					text: controller.getTranslation("rejectSupplierDialogNegativeAction"),
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
			dialog.open();
		},
		
		onExplanationRequestButtonPress: function(oEvent){
			
			var controller = this;
			var dialog = new Dialog({
				title: controller.getTranslation("explanationRequestSupplierDialogTitle"),
				type: 'Message',
				content: [
					new Text({
						text: controller.getTranslation("explanationRequestSupplierDialogMessage")
					}),
					new Input('explanationRequestTitle', {
						liveChange: function(oEvent) {
							var enabled = sap.ui.getCore().byId("explanationRequestBody").getValue().length > 0 && sap.ui.getCore().byId("explanationRequestTitle").getValue().length > 0;
							oEvent.getSource().getParent().getBeginButton().setEnabled(enabled);
						},
						width: '100%',
						placeholder: controller.getTranslation("explanationRequestSupplierDialogTitleRequired")
					}),
					new TextArea('explanationRequestBody', {
						growing: true,
						growingMaxLines: 7,
						liveChange: function(oEvent) {
							var enabled = sap.ui.getCore().byId("explanationRequestBody").getValue().length > 0 && sap.ui.getCore().byId("explanationRequestTitle").getValue().length > 0;
							oEvent.getSource().getParent().getBeginButton().setEnabled(enabled);
						},
						width: '100%',
						placeholder: controller.getTranslation("explanationRequestSupplierDialogMessageRequired")
					})
				],
				beginButton: new Button({
					type: ButtonType.Accept,
					enabled: false,
					text: controller.getTranslation("explanationRequestSupplierDialogPositiveAction"),
					press: function() {
						var nextStatus = null;
						var userRole = controller.getView().getModel("user").getProperty("/Role");
						var id = controller.getView().getModel("user").getProperty("/Username");

						if( userRole === controller.getOwnerComponent().getModel("Types").getProperty("/userRoleTypes/COMMERCIAL_REFERENCE") ) {
							nextStatus = controller.getComponentModelProperty("Types", "/participationStatus/ES");
						} else if( userRole === controller.getOwnerComponent().getModel("Types").getProperty("/userRoleTypes/COMMERCIAL_MANAGER") ) {
							if( controller.getView().getModel().getProperty("/DoneByFater") === true && id === controller.getView().getModel().getProperty("/CommercialRefId") ) {
								nextStatus = controller.getComponentModelProperty("Types", "/participationStatus/ES");
							} else {
								nextStatus = controller.getComponentModelProperty("Types", "/participationStatus/ER");
							}
						} else if( userRole === controller.getOwnerComponent().getModel("Types").getProperty("/userRoleTypes/ANAGRAPHIC_MANAGER") ) {
							nextStatus = controller.getComponentModelProperty("Types", "/participationStatus/EA");
						}

						var isInternal = nextStatus === controller.getComponentModelProperty("Types", "/participationStatus/ER");

						var sTitle = sap.ui.getCore().byId('explanationRequestTitle').getValue();
						var sMessage = sap.ui.getCore().byId('explanationRequestBody').getValue();
						
						var oTicket = {
							ParticipationId: controller.getView().getModel().getProperty("/ParticipationId"),
							Title: sTitle,
							Internal: isInternal,
							Item: [
								{
									ParticipationId: controller.getView().getModel().getProperty("/ParticipationId"),
									Message: sMessage,
									Name: controller.getView().getModel("user").getProperty("/Address/Firstname") + " " + controller.getView().getModel("user").getProperty("/Address/Lastname")
								}	
							]
						};
						
						controller.getView().getModel("oDataModel").create("/TicketHSet", oTicket, null, function() {
							var currentStatus = controller.getView().getModel().getProperty("/Status");
							if( currentStatus === controller.getComponentModelProperty("Types", "/participationStatus/QC") ) {
								controller.handleParticipationEdit(dialog, "RC", controller.getTranslation("explanationRequestSupplierDialogCreatedSuccess"), controller.getTranslation("explanationRequestSupplierDialogCreatedError"), function(oData, response) {
									var oSplitApp = controller.getView().getParent().getParent();
									if( oSplitApp.setMode ) {
									oSplitApp.setMode(sap.m.SplitAppMode.ShowHideMode);
								}
									controller.navTo("surveyList");
								});
							} else {
								controller.updateParticipation(dialog, nextStatus, controller.getTranslation("explanationRequestSupplierDialogCreatedSuccess"), controller.getTranslation("explanationRequestSupplierDialogCreatedError"), function() {
									var oSplitApp = controller.getView().getParent().getParent();
									if( oSplitApp.setMode ) {
										oSplitApp.setMode(sap.m.SplitAppMode.ShowHideMode);
									}
									controller.navTo("surveyList");
								});
							}
						},
						function() {
							sap.m.MessageToast.show( controller.getTranslation("explanationRequestSupplierDialogCreatedError") );
						});
						
						
					}
				}),
				endButton: new Button({
					text: controller.getTranslation("explanationRequestSupplierDialogNegativeAction"),
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
			dialog.open();
		},
		
		handleParticipationEdit: function(dialog, decision, successMessage, errorMessage, successCallback) {
			// instantiate dialog
			var busyDialog = sap.ui.xmlfragment("org.fater.albofornitori.view.fragment.dialogs.BusyDialog", this);
			this.getView().addDependent(busyDialog);
 
			// open busyDialog
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), busyDialog);
			busyDialog.open();
			
			var controller = this;
			jQuery.sap.delayedCall(500, this, function () {
				this.getView().getModel("oDataModel").create("/ApplyDecision(ParticipationId='" + this.__partecipationId + "', Decision='" + decision + "')", null, null, function(oData, response) {
					busyDialog.close();
					if( successMessage ) {
						sap.m.MessageToast.show(successMessage, {
						    duration: 5000,
						    width: "30em",
						    animationDuration: 1000,
						    closeOnBrowserNavigation: false
						});
					}
					
					if( successCallback ) {
						successCallback(oData, response);
					}
				},
				function(oError) {
					busyDialog.close();
					if( errorMessage ) {
						sap.m.MessageToast.show(errorMessage);
					}
					
					if( oError && oError.response ) {
						var jsonError = JSON.parse(oError.response.body);
						var message = "";
						
						if( jsonError.error.message.value ) {
							message = jsonError.error.message.value + "\n\n";
						}
						
						for (var i = 0; i < jsonError.error.innererror.errordetails.length; i++){
							var error = jsonError.error.innererror.errordetails[i];
							if( error.severity === "error" && error.message !== "" ) {
								message += error.message + "\n";
							}
						}
						var bCompact = !!controller.getView().$().closest(".sapUiSizeCompact").length;
						MessageBox.error(
							message,
							{
								styleClass: bCompact ? "sapUiSizeCompact" : ""
							}
						);
					}
				});
			});

			if( dialog ) {
				dialog.close();
			}
		},

		updateParticipation: function(dialog, newStatus, successMessage, errorMessage, successCallback, saveInRegistry) {
			// instantiate dialog
			var busyDialog = sap.ui.xmlfragment("org.fater.albofornitori.view.fragment.dialogs.BusyDialog", this);
			this.getView().addDependent(busyDialog);
 
			// open busyDialog
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), busyDialog);
			busyDialog.open();
			
			var object = this.getView().getModel().getProperty("/");
			var currentStatus = object.Status;
			var controller = this;
			
			if( currentStatus !== this.getComponentModelProperty("Types", "/participationStatus/QC") && newStatus === this.getComponentModelProperty("Types", "/participationStatus/QC") ) {
				object.CompletedT = new Date();
				var surveyType = this.getView().getModel().getProperty("/Type");
				if( saveInRegistry ) { 
					object.Supplier.Status = this.getComponentModelProperty("Types", "/supplierStatus/BIDDER");
				} else {
					if ( surveyType === this.getOwnerComponent().getModel("Types").getProperty("/participationType/ONLY_CODIFICATION") || surveyType === this.getOwnerComponent().getModel("Types").getProperty("/participationType/QUALIFICATION") || surveyType === this.getOwnerComponent().getModel("Types").getProperty("/participationType/PRE_QUALIFICATION_AND_QUALIFICATION") ) {
						object.Supplier.Status = this.getComponentModelProperty("Types", "/supplierStatus/SUPPLIER");
					}
				}
			} else if ( newStatus === this.getComponentModelProperty("Types", "/participationStatus/ES") || newStatus === this.getComponentModelProperty("Types", "/participationStatus/EA") ) {
				var newExpiredate = new Date(object.ExpireT);
    			newExpiredate.setDate(newExpiredate.getDate() + 45);
				object.ExpireT = object.ExpireT;
			}
			if( newStatus ) {
				object.Status = newStatus;
				object.ModifiedT = new Date();
			}
			jQuery.sap.delayedCall(500, this, function () {
				this.getView().getModel("oDataModel").create("/ParticipationSet", object, null, function(oData, response) {
					busyDialog.close();
					if( successMessage ) {
						sap.m.MessageToast.show(successMessage, {
						    duration: 5000,
						    width: "30em",
						    animationDuration: 1000,
						    closeOnBrowserNavigation: false
						});
					}
					
					if( successCallback ) {
						successCallback(oData, response);
					}
				},
				function(oError) {
					busyDialog.close();
					if( errorMessage ) {
						sap.m.MessageToast.show(errorMessage);
					}
					
					
					if( oError && oError.response ) {
						var jsonError = JSON.parse(oError.response.body);
						var message = "";
						
						if( jsonError.error.message.value ) {
							message = jsonError.error.message.value + "\n\n";
						}
						
						for (var i = 0; i < jsonError.error.innererror.errordetails.length; i++){
							var error = jsonError.error.innererror.errordetails[i];
							if( error.severity === "error" && error.message !== "" ) {
								message += error.message + "\n";
							}
						}
						var bCompact = !!controller.getView().$().closest(".sapUiSizeCompact").length;
						MessageBox.error(
							message,
							{
								styleClass: bCompact ? "sapUiSizeCompact" : ""
							}
						);
					}
				});
			});	
			if( dialog ) {
				dialog.close();
			}
		},
		
		onRoleSelected: function(oEvent) {
			var selectedItems = oEvent.getSource().getSelectedItems();
			var roles = [];
			for( var i = 0; i < selectedItems.length; i++ ) {
				roles.push(selectedItems[i].getBindingContext("Types").getObject());
			}
			this.getView().getModel().setProperty("/Supplier/Role", roles.join(","));
		},

		onCountryChange: function(oEvent) {
			var selectedKey = oEvent.getParameter("selectedItem").getKey();
			this._updateCountrySelectOptions(selectedKey);
		},
		
		_updateCountrySelectOptions: function(selectedCountry) {
			if( !selectedCountry ) {
				return;
			}
			
			var controller = this;
			var bukrs = this.getView().getModel().getProperty("/Supplier/Company/0/Bukrs");
			this.getView().byId("reconciliation_account").bindItems({
	    		path: "oDataModel>/ReconciliationAccountSet",
	    		sorter: new sap.ui.model.Sorter("Description", true),
	    		filters: [
	    			new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, bukrs)
	    		],
	    		template: new sap.ui.core.ListItem({  
					key : "{oDataModel>Key}",  
					text : {
						parts: [
								{ path: 'oDataModel>Key' }, 
								{ path: 'oDataModel>Description' } 
						], 
						formatter: function(key, description) { 
							return parseInt(key, 10) + " - " + description;
						} 
					}
					// text : "{oDataModel>Description}"
				})
	    	});
	    	
			this.getView().byId("supplier_association_list").bindItems({
	    		path: "oDataModel>/SupplierAssociatedSet",
	    		parameters: {
	    			expand: "Supplier"
	    		},
	    		filters: [
	    			new sap.ui.model.Filter("SupplierId", sap.ui.model.FilterOperator.EQ, this.getView().getModel().getProperty("/SupplierId"))
	    		],
	    		sorter: new sap.ui.model.Sorter("Supplier/Name1", true),
	    		template: new sap.m.StandardListItem({  
					title : "{oDataModel>Supplier/Name1}",  
					description : {
						parts: [
								{ path: "oDataModel>Supplier/VatIt" }, 
								{ path: "oDataModel>Supplier/VatCee" }, 
								{ path: "oDataModel>Supplier/TaxCode" }, 
								{ path: "oDataModel>Supplier/City" }, 
								{ path: "oDataModel>Supplier/Country" }
						], 
						formatter: function(vatIt, vatCee, taxCode, city, country) { 
							if( vatIt ) {
								return controller.getTranslation("vat") + ": " + vatIt;            
							} else if ( vatCee ) {
								return controller.getTranslation("vatCEE") + ": " + vatCee;   
							} else if ( taxCode ) {
								return controller.getTranslation("fiscal_code") + ": " + taxCode;   
							} else if ( city ) {
								return controller.getTranslation("city") + ": " + city + " (" + country + ")";   
							} else {
								return "";
							}
						} 
					}
				})
	    	});
	    	
			this.getView().byId("withholding").bindItems({
	    		path: "oDataModel>/CountrySet('"+selectedCountry+"')/Withholdingtaxcode",
	    		sorter: new sap.ui.model.Sorter("Description", true),
	    		template: new sap.ui.core.Item({  
					key : "{oDataModel>Key}",  
					text : "{oDataModel>Description}"  
				})
	    	});
			
			this.getView().byId("province").bindItems({
	    		path: "oDataModel>/CountrySet('"+selectedCountry+"')/Regio",
	    		sorter: new sap.ui.model.Sorter("Description", true),
	    		template: new sap.ui.core.Item({  
					key : "{oDataModel>Key}",  
					text : "{oDataModel>Description}"  
				})
	    	});
			
			this.getView().byId("payment_method").bindItems({
	    		path: "oDataModel>/CountrySet('"+selectedCountry+"')/PaymentMethod",
	    		sorter: new sap.ui.model.Sorter("Description", true),
	    		template: new sap.ui.core.Item({  
					key : "{oDataModel>Key}",  
					text : "{oDataModel>Description}"  
				})
	    	});
			
			this.getView().byId("purchase_transportation_method").bindItems({
	    		path: "oDataModel>/CountrySet('"+selectedCountry+"')/TransportationMethod",
	    		sorter: new sap.ui.model.Sorter("Description", true),
	    		template: new sap.ui.core.Item({  
					key : "{oDataModel>Key}",  
					text : "{oDataModel>Description}"  
				})
	    	});
			
			var lang = sap.ui.getCore().getConfiguration().getLocale().getLanguage().toUpperCase();
			if( lang !== "IT" ) {
				lang = "EN";
			}
			
			this.getView().byId("contact_area").bindItems({
	    		path: "ControlValues>/ContactArea_" + lang,
	    		sorter: new sap.ui.model.Sorter("Description", true),
	    		template: new sap.ui.core.Item({  
					key : "{ControlValues>Key}",  
					text : "{ControlValues>Description}"  
				})
	    	});
			
			if( this.getView().byId("gender_readonly") ) {
				this.getView().byId("gender_readonly").bindItems({
		    		path: "ControlValues>/Gender_" + lang,
		    		sorter: new sap.ui.model.Sorter("Description", true),
		    		template: new sap.ui.core.Item({  
						key : "{ControlValues>Key}",  
						text : "{ControlValues>Description}"  
					})
		    	});
			}
			
			this.getView().byId("gender").bindItems({
	    		path: "ControlValues>/Gender_" + lang,
	    		sorter: new sap.ui.model.Sorter("Description", true),
	    		template: new sap.ui.core.Item({  
					key : "{ControlValues>Key}",  
					text : "{ControlValues>Description}"  
				})
	    	});
			
		},
		
		/************************ SUPPLIER SEARCH ***************************/
		
		handleTableSelectDialogPress: function(oEvent) {
			if (! this._oSupplierDialog) {
				this._oSupplierDialog = sap.ui.xmlfragment("org.fater.albofornitori.view.fragment.dialogs.SupplierSearchDialog", this);
			}
 
			this.getView().addDependent(this._oSupplierDialog);
 
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oSupplierDialog);
			this._oSupplierDialog.open();
		},
		
		handleSupplierDialogSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		}, 
		
		handleSupplierDelete: function(oEvent) {
			var oList = oEvent.getSource(),
				oItem = oEvent.getParameter("listItem");
 
			// after deletion put the focus back to the list
			oList.attachEventOnce("updateFinished", oList.focus, oList);
 
			// send a delete request to the odata service
			this.getView().getModel("oDataModel").remove(oItem.getBindingContextPath());
		},
		
		handleSupplierDialogConfirm: function(oEvent) {
			var items = oEvent.getParameter("selectedContexts");
			for( var i = 0; i < items.length; i++ ) {
				var item = items[i].getObject();
				this.getView().getModel("oDataModel").createEntry("/SupplierAssociatedSet", {
					SupplierId: this.getView().getModel().getProperty("/SupplierId"),
					Lifnr: item.Lifnr
				});
			}
						
			this.getView().getModel("oDataModel").submitChanges({
				success: function(oData) {
					console.log(oData);
				},
				error: function(oError) {
					console.log(oError);
				}
			});
		},
		
		onIncotermSelected: function(oEvent) {
			var item = oEvent.getParameter("selectedItem");
			var mandatory = this.getView().getModel("oDataModel").getProperty("/IncotermSet('"+item.getKey()+"')/Mandatory");
			if( this.__fields.purchase_incoterms_text.enabled ) {
				this.getView().getModel("field_visibility").setProperty("purchase_incoterms_text/required", mandatory);
				this.__fields.purchase_incoterms_text.required = mandatory;
				this.processFieldVerification(this.__fields.purchase_incoterms_text, true);
			}
		},
		
		onEnableEdit: function(oEvent) {
			this.__setEnableEdit(true);
			this.__initFieldsVisibility(this, this.getView().getModel().oData);
		},
		
		__setEnableEdit: function(value) {
			this.__editEnabled = value;
			this.getView().getModel("tempModel").setProperty("/editEnabled", this.__editEnabled);
		}
		
	});

});