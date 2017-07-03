/*global someFunction b:true*/
/*eslint no-undef: "error"*/
// Provides control .TEInput.
sap.ui.define(['sap/m/Button'],
	function(Button) {
	"use strict";

	var TEButton = Button.extend("org.fater.albofornitori.control.TEButton", { 
	
		metadata : {
			//library : "sap.m",
			properties : {
				customId : {type : "string", group : "Misc", defaultValue : null, deprecated: false},
				relatedCustomId : {type : "string", group : "Misc", defaultValue : null, deprecated: false}
			}
		}, 
		renderer: {}
		
	});

	return TEButton;

}, /* bExport= */ true);