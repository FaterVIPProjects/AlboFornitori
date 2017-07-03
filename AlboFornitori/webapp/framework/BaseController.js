/*global someFunction b:true*/
/*eslint no-undef: "error"*/
sap.ui.define([
	"jquery.sap.global",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], function (jQuery, Controller, History) {
	"use strict";
	
	return Controller.extend("org.fater.albofornitori.framework.BaseController", {
		
		__targetName: null,
		__isMainAppController: false,

		__MESSAGE_BOX_CHANNEL: "message_box",
		__MESSAGE_BOX_EVENT: "fired",

		__TOAST_ERROR: "error",
		__TOAST_INFO: "info",
		__TOAST_WARNING: "warning",
		__TOAST_SUCCESS: "success",
		
		onInit: function() {
			if( this.__targetName !== undefined && this.__targetName !== null ) {
				var targets = typeof this.__targetName === 'string' ? [this.__targetName] : this.__targetName;
				for( var i = 0; i < targets.length; i++ ) {
					this.getRouter().getRoute(targets[i]).attachPatternMatched(this._onRouteMatched, this);
				}
			}
			if( this.__isMainAppController ) {
				this.subscribe(this.__MESSAGE_BOX_CHANNEL, this.__MESSAGE_BOX_EVENT, this.__handleBusMessageBoxEvent, this);
			}
		},

		onExit : function() {
			if( this.__isMainAppController ) {
				this.unSubscribe(this.__MESSAGE_BOX_CHANNEL, this.__MESSAGE_BOX_EVENT, this.__handleBusMessageBoxEvent, this);
			}
		},
		
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		
		onNavBack: function(oEvent) {
			this.getRouter().myNavBack("surveyList");
		},
		
		navTo: function(sRoute, mData, bReplace) {
			this.getRouter().navTo(sRoute, mData, bReplace);
		},
		
		_onRouteMatched: function(oEvent) {
			var args = oEvent.getParameters().arguments;
			var argsValues = [oEvent, oEvent.getParameters().name];
			for ( var key in args) {
				if (args.hasOwnProperty(key)) {
					var obj = args[key];
					argsValues.push(obj);
				}
			}
			this.onRouteMatched.apply(this, argsValues);
		},
		
		onRouteMatched: function(oEvent, routeName) {
			//Do something here ;)
		},
		
		getPathFromClickEvent: function(oEvent) {
			var context = oEvent.getSource().getBindingContext();
			var sPath = context.getPath().substr(1);
			return sPath;
		},
		
		setViewModel: function(model, modelName) {
			var view = this.getView();
			modelName == null || modelName === undefined  ? view.setModel(model) : view.setModel(model, modelName);
		},
		
		getViewModel: function(modelName) {
			var view = this.getView();
			var model = modelName == null || modelName === undefined  ? view.getModel() : view.getModel(modelName);
			return model;
		},
		
		getViewModelFromClickEvent: function(oEvent, modelName) {
			var view = this.getView();
			var model = modelName == null || modelName === undefined  ? view.getModel() : view.getModel(modelName);
			return model.getProperty(oEvent.getSource().getBindingContext().getPath());
		},
		
		setComponentModel: function(model, modelName) {
			var component = this.getOwnerComponent();
			modelName == null || modelName === undefined  ? component.setModel(model) : component.setModel(model, modelName);
		},
		
		getComponentModel: function(modelName) {
			var component = this.getOwnerComponent();
			var model = modelName == null || modelName === undefined  ? component.getModel() : component.getModel(modelName);
			return model;
		},
		
		getComponentModelProperty: function(modelName, propertyName) {
			return this.getComponentModel(modelName).getProperty(propertyName);
		},
		
		setComponentModelProperty: function(modelName, propertyName, value) {
			return this.getComponentModel(modelName).setProperty(propertyName, value);
		},
		
		getComponentModelFromClickEvent: function(oEvent, modelName) {
			var component = this.getOwnerComponent();
			var model = modelName == null || modelName === undefined ? component.getModel() : component.getModel(modelName);
			return model.getProperty(oEvent.getSource().getBindingContextPath());
		},
		
		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		
		/**
		 * Get the translation for sKey
		 * @public
		 * @param {string} sKey the translation key
		 * @param {array} aParameters translation paramets (can be null)
		 * @returns {string} The translation of sKey
		 */
		getTranslation: function (sKey, aParameters) {
			if( aParameters === undefined || aParameters === null ) {
				return this.getResourceBundle().getText(sKey)
			} else {
				return this.getResourceBundle().getText(sKey, aParameters)
			}
			
		},
		

		/*******************************************************
		 * MESSAGE BOX FROM BUS
		 *******************************************************/

		 sendSuccessMessage: function(title, message) {
		 	this.sendEvent(this.__MESSAGE_BOX_CHANNEL, this.__MESSAGE_BOX_EVENT, {
		 		icon: sap.m.MessageBox.Icon.SUCCESS,
		 		title: title,
		 		message: message
		 	});
		 },

		 sendErrorMessage: function(title, message) {
		 	this.sendEvent(this.__MESSAGE_BOX_CHANNEL, this.__MESSAGE_BOX_EVENT, {
		 		icon: sap.m.MessageBox.Icon.ERROR,
		 		title: title,
		 		message: message
		 	});
		 },

		 __handleBusMessageBoxEvent: function(channel, event, data) {
			this.__showMessageBox(data.icon, data.title, data.message);
		},
		

		/*******************************************************
		 * EVENT BUS
		 *******************************************************/
		
		sendEvent: function(channel, event, data) {
			sap.ui.getCore().getEventBus().publish(channel, event, data);
		},
		
		subscribe: function(channel, event, handler, listener) {
			sap.ui.getCore().getEventBus().subscribe(channel, event, handler, listener);
		},
		
		unSubscribe: function(channel, event, handler, listener) {
			sap.ui.getCore().getEventBus().unsubscribe(channel, event, handler, listener);
		},
		
		/*******************************************************
		 * ERROR HANDLING
		 *******************************************************/

		__showMessageBox: function(icon, title, description) {
			if (!sap.m.MessageBox)
				jQuery.sap.require("sap.m.MessageBox");
			sap.m.MessageBox.show(description, {
				title: title,
				icon: icon
			});	
		},
		
		__showErrorToast: function(title, description, duration) {
			this.__showToast(this.__TOAST_ERROR, title, description, duration);
		},
		
		__showSuccessToast: function(title, description, duration) {
			this.__showToast(this.__TOAST_SUCCESS, title, description, duration);
		},
		
		__showInfoToast: function(title, description, duration) {
			this.__showToast(this.__TOAST_INFO, title, description, duration);
		},
		
		__showWarningToast: function(title, description, duration) {
			this.__showToast(this.__TOAST_WARNING, title, description, duration);
		},
		
		__showErrorToastFromAjax: function(jqXHR, textStatus, errorThrown, duration){
			var errorMessage = null;
			if( jqXHR.responseJSON.error_code != undefined && jqXHR.responseJSON.error_code != null ) {
				errorMessage = this.getTranslation(jqXHR.responseJSON.error_code, jqXHR.responseJSON.parameters);
			} else {
				errorMessage = jqXHR.responseJSON.error_sap;
			}

			if( duration === undefined || duration === null )
				duration = 0;
			this.__showErrorToast(this.getTranslation("errorDialogTitle"), errorMessage, duration);	
		},
		
		__showToast: function(type, title, description, duration) {
			if( title === undefined || title === null )
				title = null;
			if( description === undefined || description === null )
				description = null;
			if( duration === undefined || duration === null )
				duration = 5000;

			toastr[type](description, title, {timeOut: duration});
		},
		
	});
});