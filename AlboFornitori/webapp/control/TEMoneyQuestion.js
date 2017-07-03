/*global someFunction b:true*/
/*eslint no-undef: "error"*/
sap.ui.define([
	"sap/ui/core/Control",
	"org/fater/albofornitori/control/TEInput",
	"org/fater/albofornitori/control/TESelect",
	"sap/m/Label",
	"sap/ui/core/Item",
    "sap/ui/core/ValueState",
    "sap/ui/core/ValueStateSupport",
	"sap/ui/commons/RichTooltip",
	"sap/ui/layout/Grid",
	"sap/m/FlexBox"

], function (Control, TEInput, TESelect, Label, Item, ValueState, ValueStateSupport, RichTooltip, Grid, FlexBox) {
	"use strict";
	return Control.extend("org.fater.albofornitori.control.TEMoneyQuestion", {
		metadata : {
			properties : {
				enabled			: { type : "bool", defaultValue : false },
                valueState		: { type : "sap.ui.core.ValueState", group : "Appearance", defaultValue : sap.ui.core.ValueState.None},
                valueStateText	: { type : "string",                 group : "Misc",       defaultValue : null }
			},
			aggregations : {
				internalLayout	: {type : "sap.ui.layout.Grid", multiple: false},
				_revenue_label : {type : "sap.m.Label", multiple: false},
				_revenue : {type : "org.fater.albofornitori.control.TEInput", multiple: false, visibility : "hidden"},
				_currency : {type : "org.fater.albofornitori.control.TESelect", multiple: false, visibility : "hidden"},
			},
			events : {
			}
		},
		
		latestVisible: undefined,
		processedVisibility: undefined,
		
		init : function () {
			__flowAddDelegates(this);
			sap.ui.getCore().getEventBus().subscribe("validate", "all", this.validate, this);
			
			this.setLayoutData(new sap.ui.layout.GridData({ span: "L10 M10 S10" }));
			this.setAggregation("internalLayout", new sap.ui.layout.Grid({
				width: "100%"
			}));
			
			var flexBox, input;
			
			input = new Label({
				text: "{i18n>moneyAmount}"
			});
			this.setAggregation("_revenue_label", input);
			flexBox = new FlexBox({
				alignItems: "Center",
				justifyContent: "Center",
				height: "48px",
				layoutData: new sap.ui.layout.GridData({span: "L2 M2 S2"})
			});
			flexBox.addItem(input);
			this.getInternalLayout().addContent(flexBox);
			input.bindElement("AnswerS/0");
			
			input = new TEInput({
				showValidState: true,
				value: "{Value}",
				enabled: this.getEnabled(),
				customId: "question_{QuestionId}_answer_{AnswerId}",
				liveChange: this._onLiveChange.bind(this),
				layoutData: new sap.ui.layout.GridData({span: "L3 M3 S3"})
			});
			this.setAggregation("_revenue", input);
			this.getInternalLayout().addContent(input);
			input.bindElement("AnswerS/0");
			
			input = new TESelect({
				width: "100%",
				showValidState: true,
				enabled: this.getEnabled(),
				forceSelection: false,
				selectedKey: "{Value}",
				items: { 
					path: "oDataModel>/CurrencySet", 
					sorter: { path: "Description" },
					template: new Item({  
			            key : "{oDataModel>Key}",  
			            text : "{oDataModel>Description}"
				    })
				},
				change: this._onChange.bind(this),
				layoutData: new sap.ui.layout.GridData({span: "L2 M2 S2"})
			});
			this.setAggregation("_currency", input);
			this.getInternalLayout().addContent(input);
			input.bindElement("AnswerS/1");
		},
		
		_onLiveChange : function (oEvent) {
			if (oEvent.getSource().validate) {
				oEvent.getSource().validate(this.latestVisible);
			}
		},
		
		_onChange : function (oEvent) {
			if (oEvent.getSource().validate) {
				oEvent.getSource().validate(this.latestVisible);
			}
		},
	
		validate: function(oEvent) {
			if( this.getBindingContext() !== undefined ) {
				if( this.processedVisibility === undefined ) {
					__flowHandleVisibility(this);
				}
				var result = this.isValid();
				/*if (this.setValueState && !result.isValid() ) {
					var errorHTML = result.getErrorHTML();
					//this.setValueStateText(result.getFirstError());
					this.setTooltip(new RichTooltip({
						text : errorHTML
					}));
					this.setValueState('Error');
					this.setValueStateText(null);
				} else {
					this.setValueState('Success');
					this.setTooltip(null);
				}*/
				
				var obj = this.getBindingContext().getObject();
				sap.ui.getCore().getEventBus().publish("validate", "result", {
					result: result,
					errorCount: result.getErrorCount(),
					id: obj.SurveyId + "_" + obj.GroupId + "_" + obj.QuestionId,
					validate_all_survey: data && data.validate_all_survey,
					group: this.getBindingContext().getPath().match(/\/Survey\/GroupS\/(\d)\/QuestionS\/[\d]*/)[1]
				});
				
				return result;
			}
		},
		
		isValid: function() {
			var oResult = new ValidationResult();
				
			var controls = this.getInternalLayout().getContent();
			for( var i = 0; i < controls.length; i++ ) {
				var c = controls[i];
				if( c.validate ) {
					oResult.merge( c.validate(this.latestVisible) );
				}
			}
			
			return oResult;
		},
	
		renderer : function (oRM, oControl) {
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.addClass("TEMoneyQuestion");
			if( oControl.getValueState() ) 
				oRM.addClass("TEMoneyQuestion" + oControl.getValueState() );
			oRM.writeClasses();
			oRM.write(">");
			
			oControl.getInternalLayout().getContent()[1].setEnabled( oControl.getEnabled() );
			oControl.getInternalLayout().getContent()[2].setEnabled( oControl.getEnabled() );
			
			oRM.renderControl( oControl.getAggregation("internalLayout") );
			
			oRM.write("</div>");
		},
		
		/**
	     * Setter for property <code>valueState</code>.
	     *
	     * @param {sap.ui.core.ValueState} sValueState - New value for property <code>valueState</code>.
	     * @return {nl.qualiture.custom.SelectExt} <code>this</code> to allow method chaining.
	     */
	    setValueState: function(sValueState) {
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
	            $container.removeClass("TEMoneyQuestion" + sOldValueState);
	        }
	
	        if (sValueState  !== ValueState.None) {
	            $container.addClass("TEMoneyQuestion" + sValueState);
	        }
	
	        // set tooltip based on state (will be undefined when state is None)
	        sTooltip = ValueStateSupport.enrichTooltip(this, this.getTooltip_AsString());
	        this.$().attr("title", sTooltip || "");
	
	        return this;
	    }
	
	});
});