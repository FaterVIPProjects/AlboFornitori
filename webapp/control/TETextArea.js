/*global someFunction b:true*/
/*eslint no-undef: "error"*/
// Provides control .TETextArea.
sap.ui.define([
		'sap/m/TextArea',
		'sap/ui/commons/RichTooltip'
	],
	function(TextArea, RichTooltip) {
	"use strict";

	var TETextArea = TextArea.extend("org.fater.app.control.TETextArea", { 
		
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
	
	TETextArea.prototype.init = function() {
		TextArea.prototype.init.apply(this, arguments);
		var that = this;
		
		this.addEventDelegate({
		    onAfterRendering:function() {
		        that.handleValidationStatus();
		    }
		});
	};
	
	TETextArea.prototype.getQuestionId = function() {
		return this.getCustomId().match(/question_(\d+)_answer_(\d+)/)[1];
	};
	
	TETextArea.prototype.getAnswerId = function() {
		return this.getCustomId().match(/question_(\d+)_answer_(\d+)/)[2];
	};
	
	TETextArea.prototype.setValue = function(sValue) {
		this.updateValue(sValue);
		return TextArea.prototype.setValue.call(this, sValue);
	};
	
	TETextArea.prototype.onLiveChange = function(oEvent) {
		this.updateValue(this._getInputValue());
		return TextArea.prototype.onChange.call(this, oEvent);
	};
	
	TETextArea.prototype.oninput = function(oEvent) {
		this.updateValue(this._getInputValue());
		return TextArea.prototype.oninput.call(this, oEvent);
	};
	
	TETextArea.prototype.onChange = function(oEvent) {
		this.updateValue(this._getInputValue());
		return TextArea.prototype.onChange.call(this, oEvent);
	};
	
	TETextArea.prototype.fireChangeEvent = function(sValue, oParams) {
		this.updateValue(sValue);
		return TextArea.prototype.fireChangeEvent.call(this, sValue, oParams);
	};
	
	TETextArea.prototype.updateValue = function(sValue) {
		var path = this.getBindingContext().getPath();
		if( path.indexOf('AnswerS') === -1 ) {
			return;
		}
		this.getBindingContext().getModel().setProperty(path+"/Value", sValue);
		this.getBindingContext().getModel().setProperty(path+"/Selected", sValue ? true : false);
	};
	
	TETextArea.prototype.openValueStateMessage = function() {
		//DO NOTHING
	};
	
	TETextArea.prototype.setMandatory = function(bValue) {
		var context = this.getBindingContext();
		if( context ) {
			var path = this.getBindingContext().getPath();
			if( path.indexOf('AnswerS') === -1 ) {
				return;
			}
			this.getBindingContext().getModel().setProperty(path+"/Mandatory", bValue);
		}
	};
	
	TETextArea.prototype.validate = function(isVisible) {
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
	
	TETextArea.prototype.handleValidationStatus = function() {
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


	return TETextArea;

}, /* bExport= */ true);