sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {
		
		_getBundle:  function(){
			if (!this._bundle){
				var sLanguage = sap.ui.getCore().getConfiguration().getLanguage(),
				sRootPah = jQuery.sap.getModulePath("org.fater.albofornitori");
				
				this._bundle = jQuery.sap.resources({
					url : sRootPah + "/i18n/i18n.properties", 
					locale: sLanguage
				});
			}
			
			return this._bundle;
		},

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		
		createJSONModel: function() {
			
			var oModel = new JSONModel({
				
				suppliers: []
				
			});
			
			return oModel;
		},

		createTempModel: function() {
			
			var oBundle 	= this._getBundle(),
				oFiltersObj	= {
					
					supplierType:	"",
					
					qualStatus: 	"",
					
					purchaseOrganization : "",
					
					cluster: "",
					
					materialCategories:  "",
					
					registrationStart: "",
					registrationEnd: "",
					registrationStartDate: null,
					registrationEndDate: null
				};
			
			var oModel = new JSONModel({
				
				dataLoaded: false,

				supplierTypes: [
					{
						name: oBundle.getText("potentialBidderSupplierTypeLabel"),
						key: "POTENTIAL_BIDDER"
					},
					{
						name: oBundle.getText("bidderSupplierTypeLabel"),
						key: "BIDDER"
					},
					{
						name: oBundle.getText("supplierSupplierTypeLabel"),
						key: "SUPPLIER"
					}
				],
				
				qualStatuses: [
					{
						name: oBundle.getText("approvedSupplierStatusLabel"),
						key: "APPROVED"
					},
					{
						name: oBundle.getText("pendingSupplierStatusLabel"),
						key: "PENDING"
					},
					{
						name: oBundle.getText("rejectedSupplierStatusLabel"),
						key: "REJECTED"
					}
				],
				
				purchaseOrganizations: [],
				
				clusters: [],
				
				materialCategories: [],
				
				filters: oFiltersObj,
				
				defaultFilters: JSON.parse(JSON.stringify(oFiltersObj)),
				
				tableColumns: [
					{
						name: oBundle.getText("companyLabel"),
						selected: true
					},
					{
						name: oBundle.getText("purchaseOrganizationLabel"),
						selected: true
					},
					{
						name: oBundle.getText("supplierTypeLabel"),
						selected: true
					},
					{
						name: oBundle.getText("qualStatusLabel"),
						selected: true
					},
					{
						name: oBundle.getText("supplierIdLabel"),
						selected: true
					},
					{
						name: oBundle.getText("supplierNameLabel"),
						selected: true
					}	,
					{
						name: oBundle.getText("clusterLabel"),
						selected: true
					},
					{
						name: oBundle.getText("materialCategoryLable"),
						selected: true
					},
					{
						name: oBundle.getText("registrationDateLable"),
						selected: true
					}
				],
				
				sortItems: [
					{
						text: oBundle.getText("companyLabel"),
						key: "CompanyId",
						selected: true
					},
					{
						text: oBundle.getText("qualStatusLabel"),
						key: "QualStatus",
						selected: false
					},
					{
						text: oBundle.getText("supplierIdLabel"),
						key: "SupplierId",
						selected: false
					},
					{
						text: oBundle.getText("registrationDateLable"),
						key: "CreationDate",
						selected: false
					}
				],
				
				groupItems: [
					{
						text: oBundle.getText("companyLabel"),
						key: "CompanyId",
						selected: true
					},
					{
						text: oBundle.getText("qualStatusLabel"),
						key: "QualStatus",
						selected: false
					},
					{
						text: oBundle.getText("clusterLabel"),
						key: "ClusterId",
						selected: false
					},
					{
						text: oBundle.getText("materialCategoryLable"),
						key: "MaterialCategoryId",
						selected: false
					}
				]
			});
			
			return oModel;
		}

	};

});