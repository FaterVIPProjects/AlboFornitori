/*global someFunction b:true*/
/*eslint no-undef: "error"*/
sap.ui.define([
	"sap/ui/model/SimpleType"
], function(SimpleType) {
	"use strict";

	return SimpleType.extend("org.fater.albofornitori.control.TENumberTypeString", {

		formatValue: function(oValue) {
			if( oValue !== null && oValue !== undefined && oValue !== "" ) {
				var parsed = parseFloat(oValue);
				if( isNaN(parsed) ) {
					return "";
				} else {
					return parsed.toString();
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