/*global someFunction b:true*/
/*eslint no-undef: "error"*/
jQuery.sap.require("org.fater.app.util.Formatter2");

sap.ui.define([
	"org/fater/app/framework/BaseController",
	"sap/ui/model/Filter",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(Controller, Filter, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("org.fater.app.controller.Main", {

		__targetName: "surveyList",
		__clonedItem: undefined,

		onRouteMatched: function(oEvent, routeName, id){
			this._initTable = true;
		},

		_getBundle: function(){
			var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
			var sRootPath = jQuery.sap.getModulePath("org.fater.app");
			
			if (!this._bundle){
				this._bundle = jQuery.sap.resources({
					url : sRootPath + "/i18n/i18n.properties", 
					locale: sLanguage
				});
			}
			
			return this._bundle;
		},
		
		_getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		
		onTokenChange: function(oEvent) {
			var items = [];
			var tokens = oEvent.getSource().getTokens();
			tokens.map(function(oContext) { 
				var sKey = oContext.getKey(),
					sText = oContext.getText();
				items.push({ Key: sKey, Value: sText });
			});
			this.getView().getModel("tempModel").setProperty("/filters/" + oEvent.getSource().data('filterName'), items);
		},
		
		handleDateChange: function(oEvent) {
			this.getView().getModel("tempModel").setProperty("/filters/" + oEvent.getSource().data('filterName'), oEvent.getSource().getDateValue());
		},
		
		onValueHelpRequest: function(oEvent){
			
			var oSource = oEvent.getSource(),
				sFilterName = oSource.data('filterName'),
				sFragmentName = oSource.data('fragmentName'),
				oTokens = oSource.getTokens();
			
			if (!this["_" + sFilterName + "ValueHelpDialog"]) {
				this["_" + sFilterName + "ValueHelpDialog"] = sap.ui.xmlfragment(
					"org.fater.app.view.fragment." + sFragmentName + "InputAssistedDialog",
					this
				);
				this.getView().addDependent(this["_" + sFilterName + "ValueHelpDialog"]);
			}
			var oVHD = this["_" + sFilterName + "ValueHelpDialog"];
			
			oVHD.open();
	
			var aItems = oVHD.getItems();
			for (var j in aItems){
				for( var k in oTokens ) {
					if( aItems[j].getTitle() === oTokens[k].getText() ) {
						aItems[j].setSelected(true);
					}
				}
			}
		},
		
		_handleValueHelpSearch : function (oEvent) {
			var sValue = oEvent.getParameter("value"),
				aFilters = [];
			
			var oFilter = new Filter(
				this.sPropertyName,
				sap.ui.model.FilterOperator.Contains, 
				sValue
			);
			
			aFilters.push(oFilter);
			
			oEvent.getSource().getBinding("items").filter([aFilters]);
		},
		
		_handleValueHelpClose : function (oEvent) {
			
			if (oEvent.getId() === "cancel"){
				return;
			}
			
			// Retrieve selected items
			var aContexts = oEvent.getParameter("selectedContexts"), 
							aContextsValues = [],
							sInputId = oEvent.getSource().data('inputId'),
							sPropertyName = oEvent.getSource().data('propertyName'),
							sPropertyKey = oEvent.getSource().data('propertyId');
			if (aContexts) {
				
				aContexts.map(function(oContext) { 
					var oObjSelected = oContext.getObject(); 
					aContextsValues.push(new sap.m.Token({ key: oObjSelected[sPropertyKey], text: oObjSelected[sPropertyName] }));
				});
			}
	
			this.getView().byId(sInputId).setTokens(aContextsValues);
			    
			// Empty filter
			oEvent.getSource().getBinding("items").filter([]);
		},
		
		onFilterBarReset: function (oEvent){
			
			var oModel = this.getView().getModel("tempModel");
			
			var oDefaultFilters = JSON.parse(JSON.stringify(oModel.getProperty("/defaultFilters")));
			
			oModel.setProperty("/filters", oDefaultFilters);
			
			this._eraseDatePickerValueStates();
			
		},
	
		_checkIfAllIsOK: function(){
			var oView = this.getView();

			var oDP1 = oView.byId("filterLowerBoundDatePicker"),
				oDP2 = oView.byId("filterUpperBoundDatePicker");
				
			return	(oDP1.getValueState() !== sap.ui.core.ValueState.Error) && 
					(oDP2.getValueState() !== sap.ui.core.ValueState.Error);
		},
		
		onFilterBarSearch: function (oEvent){
			var oView = this.getView(),
				oTable = oView.byId("suppliersTable");
			
			var oClusterInput = oView.byId("clusterFilterInput");
			oClusterInput.setValueState(sap.ui.core.ValueState.None);
			
			var	oModel		= oView.getModel("tempModel"),
				oBundle 	= this._getBundle();
			
			// Retrieve all query parameters (supplier status and type are inverted)
			var sSupplierType		= oModel.getProperty("/filters/supplierType"),
				sQualStatus			= oModel.getProperty("/filters/qualStatus"),
				aClusters 			= oModel.getProperty("/filters/clusters"),
				oDateFrom			= oModel.getProperty("/filters/registrationStartDate"),
				oDateTo 			= oModel.getProperty("/filters/registrationEndDate"),
				sSupplierStatus		= oModel.getProperty("/filters/supplierStatus"),
				aCompany			= oModel.getProperty("/filters/company"),
				aPurchOrganization	= oModel.getProperty("/filters/purchase_org");
			
			if (!this._checkIfAllIsOK()){
				MessageBox.error(
					oBundle.getText("unableToProceedErrorMessage")
				);
				return;
			}
			
			var filters = [];
			if (sSupplierType !== undefined && sSupplierType.length > 0){
				filters.push( new sap.ui.model.Filter("Supplier/Status", sap.ui.model.FilterOperator.EQ, sSupplierType));
			}      
			if (sQualStatus !== undefined && sQualStatus.length > 0){
				switch (sQualStatus){
					case "APPROVED":
						filters.push( new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, "QC"));
						break;
					case "PENDING":
						filters.push( new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.NE, "QC"));
						filters.push( new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.NE, "R"));	
						break;
					case "REJECTED":
						filters.push( new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, "R"));
						break;
				}
			}
			if (aClusters !== undefined && aClusters.length > 0){
				var aClustersFilters = [];
				for (var i in aClusters) {
					aClustersFilters.push(new sap.ui.model.Filter("ClusterId", sap.ui.model.FilterOperator.EQ, aClusters[i].Key));
				}
				filters.push( new sap.ui.model.Filter(aClustersFilters, false));
			}
			if (oDateFrom !== undefined && oDateFrom !== null){
				filters.push( new sap.ui.model.Filter("Supplier/CreatedT", sap.ui.model.FilterOperator.GE, oDateFrom));
			}
			if (oDateTo !== undefined && oDateTo !== null){
				filters.push( new sap.ui.model.Filter("Supplier/CreatedT", sap.ui.model.FilterOperator.LE, oDateTo));
			}
			if (sSupplierStatus !== undefined && sSupplierStatus.length > 0){
				filters.push( new sap.ui.model.Filter("Supplier/Status", sap.ui.model.FilterOperator.EQ, sSupplierStatus));
			}      
			if (aCompany !== undefined && aCompany.length > 0){
				var aCompanyFilters = [];
				for (var i in aCompany) {
					aCompanyFilters.push(new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, aCompany[i].Key));
				}
				filters.push( new sap.ui.model.Filter(aCompanyFilters, false));
			}
			if (aPurchOrganization !== undefined && aPurchOrganization.length > 0){
				var aPurchOrganizationFilters = [];
				for (var i in aPurchOrganization) {
					aPurchOrganizationFilters.push(new sap.ui.model.Filter("Ekorg", sap.ui.model.FilterOperator.EQ, aPurchOrganization[i].Key));
				}
				filters.push( new sap.ui.model.Filter(aPurchOrganizationFilters, false));
			}
			var oFilters = new sap.ui.model.Filter(filters, true);
			
			// Disable user interactions
			oView.setBusy(true);
		    
		    if( this._initTable ) {
		    	if( this.__clonedItem === undefined ) {
		    		this.__clonedItem = oTable.getItems()[0].clone();
		    	}
		    	
		    	var oTemplate = this.__clonedItem;
		    	oTable.bindItems({
		    		path: "oDataModel>/ParticipationSet",
		    		template: oTemplate,
		    		filters: oFilters,
		    		parameters: {
		    			expand: "Supplier,Cluster/ClusterCom"
		    		}
		    	});
		    }
		},	
		
		onUpdateFinishedTable: function(){
			var oView = this.getView(),
				oModel		= oView.getModel("tempModel");
				
			//Make Panel Table Visible
			oModel.setProperty("/dataLoaded",true);		

			// Enable user interactions
			oView.setBusy(false);
		},
		
		/**
		 * CSV Export
		 */
		onExcelExportButtonPressed: function (oEvent){
			
			var oModel		 = this.getView().getModel(),
				aSuppliers	 = oModel.getProperty("/suppliers"),
				sReportTitle = "Report fornitori in albo";
			
			var sCSV = this._generateCSVData(
				aSuppliers,
				sReportTitle
			);
			
			this._downloadCSVFile (
				sReportTitle,
				sCSV
			);
		},
		
		/**
		 * CSV Creation
		 */
		_generateCSVData: function(aLines, sReportTitle){
			
			var sCSV = '',
				oBundle = this._getBundle();
			
		    //Set Report title in first row or line
		    
		    sCSV += sReportTitle + '\r\n';
		    
		    //Generate the Header of line items table structure
	        var row = "";
	        
            row +=	oBundle.getText("companyLabel")					+ ";" +
					oBundle.getText("purchaseOrganizationLabel")	+ ";" +
					oBundle.getText("supplierTypeLabel")			+ ";" +
					oBundle.getText("qualStatusLabel")				+ ";" +
					oBundle.getText("supplierIdStatusLabel")		+ ";" +
					oBundle.getText("supplierNameLabel")			+ ";" +
					oBundle.getText("clusterLabel")					+ ";" +
					oBundle.getText("materialCategoryLable")		+ ";" +
					oBundle.getText("registrationDateLable")		;
            
	        //append Label row with line break
	        sCSV += row + '\r\n';
		    
		    //1st loop is to extract each row
		    for (var i = 0; i < aLines.length; i++) {
		        
		        row = "";
		        
		        row +=	((aLines[i].CompanyName)				?	aLines[i].CompanyName														:	" ")	+ ";" +
						((aLines[i].PurchaseOrganizationName) 	?	aLines[i].PurchaseOrganizationName											:	" ")	+ ";" +
						((aLines[i].SupplierType)				?	org.fater.app.util.Formatter2.supplierTypeFormat(aLines[i].SupplierType)		:	" ")	+ ";" +
						((aLines[i].QualStatus)					?	org.fater.app.util.Formatter2.qualStatusFormat(aLines[i].QualStatus)			:	" ")	+ ";" +
						((aLines[i].SupplierId)					?	aLines[i].SupplierId														:	" ")	+ ";" +
						((aLines[i].Name1) 						?	aLines[i].Name1																:	" ")	+ ";" +
						((aLines[i].Name)						?	aLines[i].Name																:	" ")	+ ";" +
						((aLines[i].MaterialCategoryName)		?	aLines[i].MaterialCategoryName												:	" ")	+ ";" +
						((aLines[i].CreationDate)				?	org.fater.app.util.Formatter2.dateFormat(aLines[i].CreationDate)				:	" ");
						
		        // row.slice(0, row.length - 1);
		        
		        //add a line break after each row
		        sCSV += row + '\r\n';
		    }
		
		    if (sCSV === '') {        
		        MessageBox.error("Invalid data");
		        return;
		    }   
		    
		    return sCSV;
			
		},
		
		/**
		 * CSV Download
		 */
		_downloadCSVFile: function(sReportTitle,sCSV){
			//Generate a file name
		    //this will remove the blank-spaces from the title and replace it with an underscore
		    var sFileName = sReportTitle.replace(/ /g,"_");   
		    
		    //Initialize file format you want csv or xls
		    var uri = 'data:text/csv;charset=utf-8,' + escape(sCSV);
		    
		    // Now the little tricky part.
		    // you can use either>> window.open(uri);
		    // but this will not work in some browsers
		    // or you will not get the correct file extension    
		    
		    //this trick will generate a temp <a /> tag
		    var link = document.createElement("a");    
		    link.href = uri;
		    
		    //set the visibility hidden so it will not effect on your web-layout
		    link.style = "visibility:hidden";
		    link.download = sFileName + ".csv";
		    
		    //this part will append the anchor tag and remove it after automatic click
		    document.body.appendChild(link);
		    link.click();
		    document.body.removeChild(link);
		},
		
		onTablePersonalizationButtonPressed: function(oEvent){
			if (!this._personalizationDialog){
				this._personalizationDialog = sap.ui.xmlfragment(
					"org.fater.app.view.fragment.TablePersonalizationDialog",
					this
				);
				this.getView().addDependent(this._personalizationDialog);
			}
			
			this._personalizationDialog.open();
		},
		
		onTableGroupingButtonPressed: function (oEvent){
			this._getDialog().open("group");
		},
		
		onTableSortingButtonPressed: function (oEvent){
			this._getDialog().open("sort");
		},
		
		_getDialog : function () {
			if (!this._oTableVSDialog) {
				this._oTableVSDialog = sap.ui.xmlfragment("org.fater.app.view.fragment.ViewSettingsDialog", this);
				this.getView().addDependent(this._oTableVSDialog);
			}
			return this._oTableVSDialog;
		},
		
		_handleConfirm: function (oEvent) {
			if (oEvent.getParameters().filterString) {
				sap.m.MessageToast.show(oEvent.getParameters().filterString);
			}
		},
		
		handleSupplierPress: function (oEvent) {
			var participationID = oEvent.getSource().getBindingContextPath().substring(1);
			
			this.getRouter().navTo("dataCompletion", {
				participationId: participationID
			});
		},
		
		handleTablePersonalizationDialogOKButtonPress: function (oEvent) {
			this._personalizationDialog.close();
		},

		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		}

	});

});