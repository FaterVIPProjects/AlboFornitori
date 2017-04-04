/*eslint no-undef: "error"*/
// Provides control .TEInput.
sap.ui.define([
		'sap/m/CheckBox'
	], function(CheckBox, RichTooltip, ValueState, ValueStateSupport) {
	"use strict";

	var TECheckBox = CheckBox.extend("org.fater.app.control.TECheckBox", { 
	
		object : undefined,
	
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
	
	TECheckBox.prototype.getQuestionId = function() {
		return this.getCustomId().match(/question_(\d+)_answer_(\d+)/)[1];
	};
	
	TECheckBox.prototype.getAnswerId = function() {
		return this.getCustomId().match(/question_(\d+)_answer_(\d+)/)[2];
	};
	
	TECheckBox.prototype.setValue = function(sValue) {
		this.updateValue(sValue);
		return CheckBox.prototype.setValue.call(this, sValue);
	};
	
	TECheckBox.prototype.onLiveChange = function(oEvent) {
		this.updateValue(this._getInputValue());
		return CheckBox.prototype.onLiveChange.call(this, oEvent);
	};
	
	TECheckBox.prototype.oninput = function(oEvent) {
		this.updateValue(this._getInputValue());
		return CheckBox.prototype.oninput.call(this, oEvent);
	};
	
	TECheckBox.prototype.onChange = function(oEvent) {
		this.updateValue(this._getInputValue());
		return CheckBox.prototype.onChange.call(this, oEvent);
	};
	
	TECheckBox.prototype.fireChangeEvent = function(sValue, oParams) {
		this.updateValue(sValue);
		return CheckBox.prototype.fireChangeEvent.call(this, sValue, oParams);
	};
	
	TECheckBox.prototype.updateValue = function(sValue) {
		if( this.getBindingContext() !== undefined ) {
			var path = this.getBindingContext().getPath();
			if( path.indexOf('AnswerS') === -1 ) {
				return;
			}
			this.getBindingContext().getModel().setProperty(path+"/Selected", sValue);
		}
	};
	

	return TECheckBox;

}, /* bExport= */ true);