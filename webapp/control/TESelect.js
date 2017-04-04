/*global someFunction b:true*/
/*eslint no-undef: "error"*/
// Provides control .TEInput.
sap.ui.define([
		'sap/m/Select',
		'sap/ui/commons/RichTooltip',
	    "sap/ui/core/ValueState",
	    "sap/ui/core/ValueStateSupport"
	], function(Select, RichTooltip, ValueState, ValueStateSupport) {
	"use strict";

	var TESelect = Select.extend("org.fater.app.control.TESelect", { 
	
		metadata : {
			//library : "sap.m",
			properties : {
				customId : {type : "string", group : "Misc", defaultValue : null, deprecated: false},
				showValidState : {type : "boolean", group : "Misc", defaultValue : true, deprecated: false},
                valueState     : { type : "sap.ui.core.ValueState", group : "Appearance", defaultValue : sap.ui.core.ValueState.None},
                valueStateText : { type : "string", group : "Misc",       defaultValue : null },
                width: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: "100%"
				},
			}
		}
		
	});
	
	TESelect.prototype.init = function() {
		Select.prototype.init.apply(this, arguments);
		var that = this;
		
		this.addEventDelegate({
		    onAfterRendering:function() {
		        that.handleValidationStatus();
		    }
		});
	};
	
	TESelect.prototype.setMandatory = function(bValue) {
		var context = this.getBindingContext();
		if( context ) {
			this.getBindingContext().getModel().setProperty(this.getBindingContext().getPath()+"/Mandatory", bValue);
		}
	};
	
	TESelect.prototype.fireChange = function(mParameters) {
			
		var path = this.getBindingContext().getPath();
		if( path.indexOf('AnswerS') !== -1 ) {
			this.getBindingContext().getModel().setProperty(path+"/Value", mParameters.selectedItem.getProperty("key")); 
		}
		return Select.prototype.fireChange.apply(this, arguments);  
	};
	
	/**
     * Setter for property <code>valueState</code>.
     *
     * @param {sap.ui.core.ValueState} sValueState - New value for property <code>valueState</code>.
     * @return {nl.qualiture.custom.SelectExt} <code>this</code> to allow method chaining.
     */
    TESelect.prototype.setValueState = function(sValueState) {
    	if( !this.getShowValidState() ) {
    		return this;
    	}
    	
        var sOldValueState = this.getValueState(),
            $container     = this.$(),
            sTooltip;

        sValueState = this.validateProperty("valueState", sValueState);

        if (sValueState === sOldValueState) {
            return this;
        }

        if (!this.isActive()) {
            return this.setProperty("valueState", sValueState);
        }

        this.setProperty("valueState", sValueState, true);

        if (sOldValueState !== ValueState.None) {
            $container.removeClass("sapMSlt" + sOldValueState);
        }

        if (sValueState  !== ValueState.None) {
            $container.addClass("sapMSlt" + sValueState);
        }

        return this;
    };
	
	TESelect.prototype.validate = function(isVisible) {
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
	
	TESelect.prototype.handleValidationStatus = function() {
		if( this.getBindingContext() === undefined || !this.getShowValidState() ) {
			return;
		}
			
		var valueState = this.getBindingContext().getModel().getProperty(this.getBindingContext().getPath()+"/valueState");
		var valueStateText = this.getBindingContext().getModel().getProperty(this.getBindingContext().getPath()+"/valueStateText");
		valueState = !valueState ? 'None' : valueState;
		
		if( valueState === 'None' || valueState === this.getValueState() ) {
			return;
		}
		
		if( valueState === 'Error' ) {
			this.setTooltip(new RichTooltip({
				text : valueStateText
			}));
			this.setValueState(valueState);
			this.setValueStateText(null);
			//this.closeValueStateMessage();
		} else {
			this.setValueState(valueState);
			this.setTooltip(valueStateText);
		}
	};


	return TESelect;

}, /* bExport= */ true);