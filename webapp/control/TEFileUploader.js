/*global someFunction b:true*/
/*eslint no-undef: "error"*/
// Provides control .TEInput.
sap.ui.define(['sap/ui/unified/FileUploader'],
	function(FileUploader) {
	"use strict";

	var TEFileUploader = FileUploader.extend("org.fater.albofornitori.control.TEFileUploader", { 
	
		metadata : {
			//library : "sap.m",
			properties : {
				mandatory		: { type : "bool", defaultValue : false },
				customId		: {type : "string", group : "Misc", defaultValue : null, deprecated: false}
			}
		}, 
		renderer: {}
		
	});
	
	TEFileUploader.prototype.setMandatory = function(bValue) {
		var context = this.getBindingContext();
		if( context ) {
			this.getBindingContext().getModel().setProperty(this.getBindingContext().getPath()+"/Mandatory", bValue);
		}
	};
	
	return TEFileUploader;

}, /* bExport= */ true);