/*global someFunction b:true*/
/*eslint no-undef: "error"*/
// Provides control .TEInput.
sap.ui.define([
		'sap/m/Input',
		'sap/ui/commons/RichTooltip'
	],
	function(Input, RichTooltip) {
	"use strict";

	var TEInput = Input.extend("org.fater.app.control.TEInput", { 
		
		object : undefined,
	
		metadata : {
			properties : {
				showValidState : {type : "boolean", group : "Misc", defaultValue : true, deprecated: false},
				mandatory : {type : "boolean", group : "Misc", defaultValue : false, deprecated: false},
				customId : {type : "string", group : "Misc", defaultValue : null, deprecated: false},
				constraints : {type : "object", group : "Misc", defaultValue : null, deprecated: false}
			}
		}, 
		aggregations: {},
		events: {},
		renderer: {}
		
	});
	
	TEInput.prototype.init = function() {
		Input.prototype.init.apply(this, arguments);
		var that = this;
		
		this.addEventDelegate({
		    onAfterRendering:function() {
		        that.handleValidationStatus();
		    }
		});
	};
	
	TEInput.prototype.getQuestionId = function() {
		return this.getCustomId().match(/question_(\d+)_answer_(\d+)/)[1];
	};
	
	TEInput.prototype.getAnswerId = function() {
		return this.getCustomId().match(/question_(\d+)_answer_(\d+)/)[2];
	};
	
	TEInput.prototype.setValue = function(sValue) {
		this.updateValue(sValue);
		return Input.prototype.setValue.call(this, sValue);
	};
	
	TEInput.prototype.onLiveChange = function(oEvent) {
		this.updateValue(this._getInputValue());
		return Input.prototype.onChange.call(this, oEvent);
	};
	
	TEInput.prototype.oninput = function(oEvent) {
		this.updateValue(this._getInputValue());
		return Input.prototype.oninput.call(this, oEvent);
	};
	
	TEInput.prototype.onChange = function(oEvent) {
		this.updateValue(this._getInputValue());
		return Input.prototype.onChange.call(this, oEvent);
	};
	
	// TEInput.prototype.fireChangeEvent = function(sValue, oParams) {
	// 	this.updateValue(sValue);
	// 	return Input.prototype.fireChangeEvent.call(this, sValue, oParams);
	// };
	
	TEInput.prototype.updateValue = function(sValue) {
		
		var path = this.getBindingContext().getPath();
		if( path.indexOf('AnswerS') === -1 ) {
			return;
		}
		
		this.getBindingContext().getModel().setProperty(path+"/Value", sValue);
		this.getBindingContext().getModel().setProperty(path+"/Selected", sValue ? true : false);
	};
	
	TEInput.prototype.setMandatory = function(bValue) {
		var context = this.getBindingContext();
		if( context ) {
			this.getBindingContext().getModel().setProperty(this.getBindingContext().getPath()+"/Mandatory", bValue);
		}
	};
	
	TEInput.prototype.openValueStateMessage = function() {
		//DO NOTHING
	};
	
	TEInput.prototype.validate = function(isVisible) {
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
	
	TEInput.prototype.handleValidationStatus = function() {
		if( this.getBindingContext() === undefined || !this.getShowValidState() ) {
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


	return TEInput;

}, /* bExport= */ true);