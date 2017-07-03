/*global someFunction b:true*/
/*eslint no-undef: "error"*/
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"org/fater/albofornitori/framework/Router"
], function (UIComponent, JSONModel, ResourceModel, Router) {
	"use strict";

	var oComponent = UIComponent.extend("org.fater.albofornitori.framework.Component", {

		// Metadata must be defined by the subclass that extend framework Component

		//metadata: {
		//	manifest: "json"
		//},
		
		/**
	     * Function that initilize device model with all the device informations
	     *
	     * @private
	     */
		__initDevice: function() {
			// set device model
	        var deviceModel = new sap.ui.model.json.JSONModel({
	            isTouch : sap.ui.Device.support.touch,
	            isNoTouch : !sap.ui.Device.support.touch,
	            isPhone : sap.ui.Device.system.phone,
	            isNoPhone : !sap.ui.Device.system.phone,
	            listMode : sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",
	            listItemType : sap.ui.Device.system.phone ? "Active" : "Inactive"
	        });
	        deviceModel.setDefaultBindingMode("OneWay");
	        this.setModel(deviceModel, "device");
		},
		
		/**
	     * Function that initialize the translation bundle
	     *
	     * @private
	     */
		__initLocalization: function() {
			var appname = this.getMetadata().getManifestEntry("sap.app").id;
			// LOCALIZATION MODEL
			var oI18NModel = new ResourceModel({
				bundleName: appname+".i18n.i18n"
			});
			this.setModel(oI18NModel, "i18n");
		},
	   		
		/**
	     * Default init function
	     * @private
	     */ 
	   	init: function () {
			UIComponent.prototype.init.apply(this, arguments);

			this.beforeInit();
			
			this.__initDevice();
			this.__initLocalization();
			
			
			this.afterInit();

			// create the views based on the url/hash
			this.getRouter().initialize();
		},
		
		/////////////////////////////////////////////////////////
		//
		// METHODS TO OVERRIDE
		//
		/////////////////////////////////////////////////////////

		/**
	     * Function that will be called after UIComponent init but before internal initialization (device and bundle)
	     * @public
	     */
		beforeInit: function() {
			//OVERRIDE IF NEEDED
		},
		
		/**
	     * Function that will be called before router initialization
	     * @public
	     */
		afterInit: function() {
			//OVERRIDE IF NEEDED
		},

		
	});

	return oComponent;

});