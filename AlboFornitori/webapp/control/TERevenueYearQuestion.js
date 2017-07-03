/*global someFunction b:true*/
/*eslint no-undef: "error"*/
sap.ui.define([
	"sap/ui/core/Control",
	"org/fater/albofornitori/control/TEInput",
	"org/fater/albofornitori/control/TESelect",
	"sap/m/Label",
	"sap/m/Text",
	"sap/ui/core/Item",
    "sap/ui/core/ValueState",
    "sap/ui/core/ValueStateSupport",
	"sap/ui/commons/RichTooltip",
	"sap/ui/layout/Grid",
	"sap/m/FlexBox"

], function (Control, TEInput, TESelect, Label, Text, Item, ValueState, ValueStateSupport, RichTooltip, Grid, FlexBox) {
	"use strict";
	return Control.extend("org.fater.albofornitori.control.TERevenueYearQuestion", {
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
				_year_label : {type : "sap.m.Text", multiple: false, visibility : "hidden"},
				_year : {type : "org.fater.albofornitori.control.TEInput", multiple: false, visibility : "hidden"}
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
				text: "{i18n>revenueYear3Revenue}"
			});
			this.setAggregation("_revenue_label", input);
			flexBox = new FlexBox({
				alignItems: "Center",
				justifyContent: "Center",
				height: "48px",
				layoutData: new sap.ui.layout.GridData({span: "L1 M1 S1"})
			});
			flexBox.addItem(input);
			this.getInternalLayout().addContent(flexBox);
			input.bindElement("AnswerS/0");
			
			input = new TEInput({
				value: "{Value}",
				type: "Number",
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
				layoutData: new sap.ui.layout.GridData({span: "L5 M5 S5"})
			});
			this.setAggregation("_currency", input);
			this.getInternalLayout().addContent(input);
			input.bindElement("AnswerS/1");
			
			input = new Text({
				textAlign: "End",
				text: "{i18n>revenueYear3Year}"
			});
			input.addStyleClass("fakeLabel");
			this.setAggregation("_year_label", input);
			flexBox = new FlexBox({
				alignItems: "Center",
				justifyContent: "Center",
				height: "48px",
				layoutData: new sap.ui.layout.GridData({span: "L1 M1 S1"})
			});
			flexBox.addItem(input);
			this.getInternalLayout().addContent(flexBox);
			input.bindElement("AnswerS/2");
			
			input = new TEInput({
				value: {
					path: "Value",
					type: "org.fater.albofornitori.control.TENumberTypeString"
				},
				maxLength: 4,
				enabled: this.getEnabled(),
				customId: "question_{QuestionId}_answer_{AnswerId}",
				liveChange: this._onLiveChange.bind(this),
				layoutData: new sap.ui.layout.GridData({span: "L2 M2 S2"})
			});
			this.setAggregation("_year", input);
			this.getInternalLayout().addContent(input);
			input.bindElement("AnswerS/2");
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
	
		validate: function(channel, event, data) {
			if( this.getBindingContext() !== undefined ) {
				if( this.processedVisibility === undefined ) {
					__flowHandleVisibility(this);
				}
				var oResult = new ValidationResult();
				
				var controls = this.getInternalLayout().getContent();
				for( var i = 0; i < controls.length; i++ ) {
					var c = controls[i];
					if( c.validate ) {
						oResult.merge( c.validate(this.latestVisible) );
					}
				}
				
				var obj = this.getBindingContext().getObject();
				sap.ui.getCore().getEventBus().publish("validate", "result", {
					result: oResult,
					errorCount: oResult.getErrorCount(),
					id: obj.SurveyId + "_" + obj.GroupId + "_" + obj.QuestionId,
					validate_all_survey: data && data.validate_all_survey,
					group: this.getBindingContext().getPath().match(/\/Survey\/GroupS\/(\d)\/QuestionS\/[\d]*/)[1]
				});
				
				return oResult;
			}
		},
	
		validateAnswer: function(oEvent) {
			var model = new Answer(oEvent.getSource().getBindingContext().getModel().getProperty(oEvent.getSource().getBindingContext().getPath()));
			model.value = oEvent.getParameter("value");
			var vResult = model.validate(this.latestVisible);
			return vResult;
		},
		
		renderer : function (oRM, oControl) {
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.addClass("TERevenueYearQuestion");
			if( oControl.getValueState() ) 
				oRM.addClass("TERevenueYearQuestion" + oControl.getValueState() );
			oRM.writeClasses();
			oRM.write(">");
			
			oControl.getInternalLayout().getContent()[1].setEnabled( oControl.getEnabled() );
			oControl.getInternalLayout().getContent()[1].setValue(oControl.getBindingContext().getObject().AnswerS[0].Value );
			oControl.getInternalLayout().getContent()[2].setEnabled( oControl.getEnabled() );
			oControl.getInternalLayout().getContent()[4].setEnabled( oControl.getEnabled() );
			oControl.getInternalLayout().getContent()[4].setValue(oControl.getBindingContext().getObject().AnswerS[2].Value );
			
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
	            $container.removeClass("TEChoiceQuestion" + sOldValueState);
	        }
	
	        if (sValueState  !== ValueState.None) {
	            $container.addClass("TEChoiceQuestion" + sValueState);
	        }
	
	        // set tooltip based on state (will be undefined when state is None)
	        sTooltip = ValueStateSupport.enrichTooltip(this, this.getTooltip_AsString());
	        this.$().attr("title", sTooltip || "");
	
	        return this;
	    },
	
	    /**
	     * Setter for property <code>valueStateText</code>.
	     *
	     * @param {string} sValueStateText - New value for property <code>valueStateText</code>
	     * @return {nl.qualiture.custom.SelectExt} <code>this</code> to allow method chaining
	     */
	    setValueStateText: function(sValueStateText) {
	        this.setProperty("valueStateText", sValueStateText, true);
	        return this;
	    }
	});
});