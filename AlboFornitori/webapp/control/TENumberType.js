/*global someFunction b:true*/
/*eslint no-undef: "error"*/
sap.ui.define([
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException"
], function(SimpleType, ValidateException) {
	"use strict";

	return SimpleType.extend("org.fater.albofornitori.control.TENumberType", {

		formatValue: function(oValue) {
			if( oValue !== null && oValue !== undefined && oValue !== "" ) {
				if( isNaN(parseFloat(oValue)) ) {
					//throw new ValidateException(oValue + " is not a valid decimal value");
					return "";
				} else {
					return parseFloat(oValue);
				}
			} else {
				return "";
			}
		},
		
		parseValue: function(oValue) {
			return oValue;
		},
		
		validateValue: function(oValue) {
			return true;
		}

	});

});