sap.ui.define([
	], function () {
		"use strict";

		return {
			
			fileUrl: function(fileName, supplierId) {
				if( fileName === "" || fileName === null || fileName === undefined )
					return "";
					
				// /sap/opu/odata/sap/zvip_project_srv/fileset('\documents\vip\000000000338\company-invoice-template1.pdf')/$value
				var model = this.getView().getModel("oDataModel");
				return model.sServiceUrl + "/FileSet(FileName='" + fileName + "',Supplier='" + supplierId + "')/$value";	
			},
			
			participationStatus : function(status, statusChange, editBySupplier, currentRole) {
				var isEditMode = statusChange === this.getOwnerComponent().getModel("Types").getProperty("/participationStatusEdit/DA");
				var isEditModeER = statusChange === this.getOwnerComponent().getModel("Types").getProperty("/participationStatusEdit/RC");
				var isSupplier = currentRole === this.getOwnerComponent().getModel("Types").getProperty("/userRoleTypes/SUPPLIER");
				var bundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				
				if( isEditMode || isEditModeER ) {
					if( isSupplier && !editBySupplier ) {
						return bundle.getText("P_STATUS_SUPPLIER_" + status);
					} else if( isSupplier && editBySupplier ) {
						return bundle.getText("P_STATUS_SUPPLIER_" + statusChange);
					} else {
						return bundle.getText("P_STATUS_FATER_" + statusChange);
					}
				} else {
					if( isSupplier ) {
						return bundle.getText("P_STATUS_SUPPLIER_" + status);
					} else {
						return bundle.getText("P_STATUS_FATER_" + status);
					}
				}
			},
			
			participationDetailStatus : function(status, statusChange, editBySupplier, currentRole) {
				var isEditMode = statusChange === this.getOwnerComponent().getModel("Types").getProperty("/participationStatusEdit/DA");
				var isEditModeER = statusChange === this.getOwnerComponent().getModel("Types").getProperty("/participationStatusEdit/RC");
				var isSupplier = currentRole === this.getOwnerComponent().getModel("Types").getProperty("/userRoleTypes/SUPPLIER");
				var bundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				
				if( isEditMode || isEditModeER ) {
					if( isSupplier && !editBySupplier ) {
						return bundle.getText("P_STATUS_SUPPLIER_DETAIL_" + status);
					} else if( isSupplier && editBySupplier ) {
						return bundle.getText("P_STATUS_SUPPLIER_DETAIL_" + statusChange);
					} else {
						return bundle.getText("P_STATUS_FATER_DETAIL_" + statusChange);
					}
				} else {
					if( isSupplier ) {
						return bundle.getText("P_STATUS_SUPPLIER_DETAIL_" + status);
					} else {
						return bundle.getText("P_STATUS_FATER_DETAIL_" + status);
					}
				}
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
				return bundle.getText("SUPP_STATUS_"+status);
			},
			
			supplierStatusString : function(status, supplierStatusCode) {
				var bundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				return supplierStatusCode + ": " + bundle.getText("SUPP_STATUS_"+status);
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
			 * Format js Data
			 *
			 * @public
			 * @param {string} sValue value to be formatted
			 * @returns {string} formatted 
			 */
			formattedDateFull: function (date) {
				if (!date) {
					return "";
				}
				return date.toLocaleDateString() + " " + date.toLocaleTimeString();

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
			
			averagePoints: function(group1, group2, group3, group4) {
				var a = [group1, group2, group3, group4];
				var points = [];
				var weigths = [];
				for( var i = 0; i < a.length; i++ ) {
					var g = a[i];
					if( g !== null && g !== undefined && g.QuestionS.length > 0 ) {
						points.push(g.Points);
						weigths.push(g.Weight);
					}
				}
				if( this.average ) {
					return this.average(points, weigths);
				} else {
					return this.formatter.average(points, weigths);
				}
			},	
			
			averageTargetPoint: function(group1, group2, group3, group4) {
				var a = [group1, group2, group3, group4];
				var points = [];
				var weigths = [];
				for( var i = 0; i < a.length; i++ ) {
					var g = a[i];
					if( g !== null && g !== undefined && g.QuestionS.length > 0 ) {
						points.push(g.TargetPoint);
						weigths.push(g.Weight);
					}
				}
				if( this.average ) {
					return this.average(points, weigths);
				} else {
					return this.formatter.average(points, weigths);
				}
			},	
			
			averageThresholdPoint: function(group1, group2, group3, group4) {
				var a = [group1, group2, group3, group4];
				var points = [];
				var weigths = [];
				for( var i = 0; i < a.length; i++ ) {
					var g = a[i];
					if( g !== null && g !== undefined && g.QuestionS.length > 0 ) {
						points.push(g.ThresholdPoint);
						weigths.push(g.Weight);
					}
				}
				if( this.average ) {
					return this.average(points, weigths);
				} else {
					return this.formatter.average(points, weigths);
				}
			},
		
			average : function(aValue, aWeight) {
				var average = 0;
				if( aWeight === null || aWeight === undefined ) {
					return 0;
				}
				for (var i = 0; i < aValue.length; i++) {
			        average += parseInt(aValue[i], 10) * (aWeight[i] === null ? 1 : parseInt(aWeight[i], 10));
			    }
				return Math.round(average / aValue.length);
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
			
			averageColor : function(group1, group2, group3, group4){
				var avScore = this.formatter.averagePoints(group1, group2, group3, group4);
				var avTarget = this.formatter.averageTargetPoint(group1, group2, group3, group4);
				var avThreshold = this.formatter.averageThresholdPoint(group1, group2, group3, group4);
				return this.formatter.color(avScore, avTarget, avThreshold);
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
			
			isSupplierRoleTypeEnabled: function(currentType){
				return currentType !== this.getOwnerComponent().getModel("Types").getProperty("/supplierRoleTypes/QUALIFICATION_PROCESS");
			},
			
			isSupplierRoleTypeBankStatementSelected: function(types){
				var currentType = this.getOwnerComponent().getModel("Types").getProperty("/supplierRoleTypes/BANK_STATEMENTS");
				if(types){
					var exploded = types.split(",");
					return exploded.indexOf(currentType) >= 0;
				}
				return false;
			},
			
			isSupplierRoleTypeSelectedIcon: function(currentType, types, userRole){
				var isCommRef = userRole === this.getOwnerComponent().getModel("Types").getProperty("/userRoleTypes/COMMERCIAL_REFERENCE");
				if( isCommRef )
					return "";
					
				if(types){
					var exploded = types.split(",");
					var selected = exploded.indexOf(currentType) >= 0;
					return selected ? "sap-icon://accept" : "";
				}
				return "";
			},
			
			surveyListTitle: function(participationId, supplierName, userRole){
				if( !participationId ) {
					return "";
				}
					
				var isSupplier = userRole === this.getOwnerComponent().getModel("Types").getProperty("/userRoleTypes/SUPPLIER");
				if( isSupplier ) {
					var bundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					return bundle.getText("inviteQualificationProcess") + ": " + participationId;
				} else {
					return supplierName;
				}
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
	}
);