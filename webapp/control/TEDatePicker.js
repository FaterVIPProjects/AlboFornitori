/*eslint linebreak-style: ["error", "windows"]*/
sap.ui.define([
	"sap/m/DatePicker",
	'sap/ui/commons/RichTooltip'
], function (DatePicker, RichTooltip) {
	"use strict";

	var TEDatePicker = DatePicker.extend("org.fater.app.control.TEDatePicker", { 
	
		metadata : {
			properties : {
				mandatory : {type : "boolean", group : "Misc", defaultValue : false, deprecated: false},
				customId : {type : "string", group : "Misc", defaultValue : null, deprecated: false},
				constraints : {type : "object", group : "Misc", defaultValue : null, deprecated: false}
			}
		}, 
		aggregations: {},
		events: {},
		renderer: {}
		
	});
	
	TEDatePicker.prototype.init = function() {
		DatePicker.prototype.init.apply(this, arguments);
		var that = this;
		
		this.addEventDelegate({
		    onAfterRendering:function() {
		        that.handleValidationStatus();
		    }
		});
	};
	
	TEDatePicker.prototype.getQuestionId = function() {
		return this.getCustomId().match(/question_(\d+)_answer_(\d+)/)[1];
	};
	
	TEDatePicker.prototype.getAnswerId = function() {
		return this.getCustomId().match(/question_(\d+)_answer_(\d+)/)[2];
	};
	
	TEDatePicker.prototype.setValue = function(sValue) {
		this.updateValue(sValue);
		return DatePicker.prototype.setValue.call(this, sValue);
	};
	
	TEDatePicker.prototype.onLiveChange = function(oEvent) {
		this.updateValue(this._getInputValue());
		return DatePicker.prototype.onChange.call(this, oEvent);
	};
	
	TEDatePicker.prototype.oninput = function(oEvent) {
		this.updateValue(this._getInputValue());
		return DatePicker.prototype.oninput.call(this, oEvent);
	};
	
	TEDatePicker.prototype.onChange = function(oEvent) {
		this.updateValue(this._getInputValue());
		return DatePicker.prototype.onChange.call(this, oEvent);
	};
	
	TEDatePicker.prototype.updateValue = function(sValue) {
		var path = this.getBindingContext().getPath();
		if( path.indexOf('AnswerS') === -1 ) {
			return;
		}
		this.getBindingContext().getModel().setProperty(path+"/Value", sValue);
		this.getBindingContext().getModel().setProperty(path+"/Selected", sValue ? true : false);
	};
	
	TEDatePicker.prototype.setMandatory = function(bValue) {
		var context = this.getBindingContext();
		if( context ) {
			this.getBindingContext().getModel().setProperty(this.getBindingContext().getPath()+"/Mandatory", bValue);
		}
	};
	
	TEDatePicker.prototype.openValueStateMessage = function() {
		//DO NOTHING
	};
	
	TEDatePicker.prototype.validate = function(isVisible) {
		var model = new Answer(this.getBindingContext().getModel().getProperty(this.getBindingContext().getPath()));
		var result = model.validate(isVisible);
		var valueState = 'None';
		var valueStateText = null;
		
		if (this.setValueState && !result.isValid() ) {
			valueStateText = result.getErrorHTML();
			valueState = 'Error';
		} else {
			valueState = 'Success';
			valueStateText = null;
		}
		
		this.getBindingContext().getModel().setProperty(this.getBindingContext().getPath()+"/valueState", valueState);
		this.getBindingContext().getModel().setProperty(this.getBindingContext().getPath()+"/valueStateText", valueStateText);
		
		this.handleValidationStatus();
		
		return result;
	};
	
	TEDatePicker.prototype.handleValidationStatus = function() {
		if( this.getBindingContext() === undefined ) {
			return;
		}
		
		var valueState = this.getBindingContext().getModel().getProperty(this.getBindingContext().getPath()+"/valueState");
		var valueStateText = this.getBindingContext().getModel().getProperty(this.getBindingContext().getPath()+"/valueStateText");
		valueState = !valueState ? 'None' : valueState;
		
		if( valueState === 'None' ) {
			return;
		}
		
		if( valueState === 'Error' ) {
			this.setTooltip(new RichTooltip({
				text : valueStateText
			}));
			this.setValueState(valueState);
			this.setValueStateText(null);
			this.closeValueStateMessage();
		} else {
			this.setValueState(valueState);
			this.setTooltip(valueStateText);
		}
	};


	return TEDatePicker;

}, /* bExport= */ true);