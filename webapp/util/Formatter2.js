/*global someFunction b:true*/
/*eslint no-undef: "error"*/
jQuery.sap.declare("org.fater.app.util.Formatter2");

org.fater.app.util.Formatter2 = {
	
	_getBundle: function (){
		
		if (!org.fater.app.util.Formatter2._bundle){
			var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
			var sRootPath = jQuery.sap.getModulePath("org.fater.app");
		
			org.fater.app.util.Formatter2._bundle = jQuery.sap.resources({
				url : sRootPath + "/i18n/i18n.properties", 
				locale: sLanguage
			});
		}
		
		return this._bundle;
	},
	
	dateFormat: function (sDate) {
		
		var oConfig = sap.ui.getCore().getConfiguration(),
			sLocale = oConfig.getLocale().getLanguage(),
			oDate = new Date(sDate);
		
		return oDate.toLocaleDateString(sLocale);
		
	},
	
	dateCompletedFormat: function(sDate){
		var oConfig = sap.ui.getCore().getConfiguration(),
			sLocale = oConfig.getLocale().getLanguage(),
			oBundle = org.fater.app.util.Formatter2._getBundle();	

		var date = new Date(sDate);
		if (!sDate){
			return oBundle.getText("notInRegistry");
		}			
		return date.toLocaleDateString(sLocale);		
	},
	
	supplierTypeFormat: function (sType){
		
		var oBundle = org.fater.app.util.Formatter2._getBundle();
		
		switch (sType){
			
			case "POTENTIAL_BIDDER":
				return oBundle.getText("potentialBidderLabel");
				
			case "BIDDER":
				return oBundle.getText("bidderLabel");
				
			case "SUPPLIER":
				return oBundle.getText("supplierLabel");
			
			default:
				return "ERROR!";
				
		}
	},
	
	qualStatusFormat: function (sStatus){
			/*
			N            Nuovo
			I              Inviato
			S             Scaduto
			DI           Draft Invito
			DQ         Draft Questionario
			C             Completato                       
			A1          Approvato Livello 1         -> approvato commercial Ref
			A2          Approvato Livello 2         -> approvato comm manag
			QC          Qualifica completata      -> approvato service manager                       
			C1          Completato Livello 1         -> approvato commercial Ref
			C2          Completato Livello 2         -> approvato comm manag
			C3          Completato Livello 3      -> approvato service manager 
			R           Rifiutato 
			*/		
		var oBundle = org.fater.app.util.Formatter2._getBundle();
		
		switch (sStatus){
			
			case "N":
			case "I":
			case "DI":
			case "DQ":
			case "C":
			case "A1":
			case "A2":
			case "C1":
			case "C2":
			case "C3":
				return oBundle.getText("pendingLabel");
			case "QC":
				return oBundle.getText("approvedLabel");
			case "R":
				return oBundle.getText("rejectedLabel");
			default:
				return "ERROR!";
				
		}
	},
	
	qualStatusValueStateFormat: function (sType){
		
		switch (sType){

			case "N":
			case "I":
			case "DI":
			case "DQ":
			case "C":
			case "A1":
			case "A2":
			case "C1":
			case "C2":
			case "C3":
				return sap.ui.core.ValueState.Warning;
			case "QC":
				return sap.ui.core.ValueState.Success;
			case "R":
				return sap.ui.core.ValueState.Error;
			default:
				return sap.ui.core.ValueState.Error;			
				
		}
	},

	participationStatus : function(status) {
		var bundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		return bundle.getText("P_STATUS_" + status);
	},
	
	participationType : function(pType) {
		var bundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		return bundle.getText("PARTICIPATION_TYPE_" + pType);
	},
	
	supplierType : function(sType) {
		var bundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		return bundle.getText("SUPPLIER_TYPE_" + sType);
	},
	
	supplierStatus : function(status) {
		var bundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		if( status === "POTENTIAL_BIDDER" ) {
			return bundle.getText("supplierStatusPotentialBidder");
		} else if ( status === "BIDDER" ) {
			return bundle.getText("supplierStatusBidder");
		} else {
			return bundle.getText("supplierStatusSupplier");
		}
	},
	
	supplierCode: function (isSupplier, supplierCodeString, supplierCode){
		if (isSupplier === 'SUPPLIER' ){
			return "";
		} else {
			return supplierCodeString + ": " + supplierCode;
		}	
		
	},
	
	/**
	 * Rounds the formatted date from timestamp
	 *
	 * @public
	 * @param {string} sValue value to be formatted
	 * @returns {string} formatted 
	 */
	timestampToDate : function (expireString, date) {
		if (!date) {
			return "";
		}
		var sLocale = sap.ui.getCore().getConfiguration().getLocale().getLanguage();
		
		switch (sLocale){
			case "it":
				return expireString + " " + date.substr(8,2) + "/" + date.substr(5,2) + "/" + date.substr(2,2);
			
			case "en":
				return expireString + " " + date.substr(5,2) + "/" + date.substr(8,2) + "/" + date.substr(2,2);
		}
	},
	
	/**
	 * Format js Data
	 *
	 * @public
	 * @param {string} sValue value to be formatted
	 * @returns {string} formatted 
	 */
	formattedDate : function (date, expireString) {
		if (!date) {
			return "";
		}
		if (expireString){
			return expireString + " " + date.toLocaleDateString();					
		} else {
			return date.toLocaleDateString();
		}

	},
	
	/**
	 * Convert date to js object
	 *
	 * @public
	 * @param {string} date 
	 * @returns {[object Date]} 
	 */			
	jsDate : function(date){
		return new Date(date);
	},
	
	/**
	 * Convert date to millisecond Date
	 *
	 * @public
	 * @param {string} date 
	 * @returns {string} "Date(date)"
	 */			
	jsDateMillisecond : function(date){
		var dateJS = new Date(date);
		return "Date(" + dateJS.getTime() + ")";
	},			
	
	/**
	 * Rounds the formatted date from timestamp
	 *
	 * @public
	 * @param {string} sValue value to be formatted
	 * No prefix needed 
	 */
	timestampToDatev2 : function (date) {
		if (!date) {
			return "";
		}
		var sLocale = sap.ui.getCore().getConfiguration().getLocale().getLanguage();
		
		switch (sLocale){
			case "it":
				return date.substr(8,2) + "/" + date.substr(5,2) + "/" + date.substr(2,2);
			
			case "en":
				return date.substr(5,2) + "/" + date.substr(8,2) + "/" + date.substr(2,2);
		}
	},	

	/**
	 * Return average of scores 
	 *
	 * @public
	 * @param {string} valueX survey's scores
	 * @returns {int} average 
	 */
	average : function(value1, value2, value3, value4, weight1, weight2, weight3, weight4) {
		var average = 0;
		for (var i = 0; i < arguments.length / 2; i++) {
			if (arguments[i] === null || arguments[i + 4] === null)
				return "";
	        arguments[i] = parseInt(arguments[i], 10);
	        arguments[i + 4] = parseInt(arguments[i + 4], 10);
	        average += arguments[i] * arguments[i + 4];
	    }
		return average / arguments.length * 2;
	},
	
	color : function(score, target, threshold){
		if (parseInt(score, 10) >= parseInt(target, 10)){
			return "#008000";
		}
		else if (parseInt(score, 10) < parseInt(threshold, 10)){
			return "#ff0000";
		} else {
			return "#ff8000";
		}
	},
	
	supplierRoleType: function(roleType){
		return this.getResourceBundle().getText(roleType);
	},
	
	getResearchPolicyText: function(businessName){
		if (businessName && businessName !== '') {
			return businessName.substr(0, 10);
		}
		return '';
	},
	
	isSupplierRoleTypeSelected: function(currentType, types){
		if(types){
			var exploded = types.split(",");
			return exploded.indexOf(currentType) >= 0;
		}
		return false;
	},
	
	//Group Title Formatter
	groupTitle: function(title){
		var bundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		switch (title) {
			case "GENERAL":
				return bundle.getText("companyData");
			case "FINANCIAL":
				return bundle.getText("financialData");
			case "ORGANIZATION":
				return bundle.getText("organization");
			case "QUALITY":
				return bundle.getText("qualitySecurity");
		}
		
	}
};