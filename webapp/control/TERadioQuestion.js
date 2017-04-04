/*global someFunction b:true*/
/*eslint no-undef: "error"*/
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/List",
	"sap/m/CustomListItem",
	"sap/m/RadioButton",
	"org/fater/app/control/TERadioButton",
    "sap/ui/core/ValueState",
    "sap/ui/core/ValueStateSupport",
	"sap/ui/commons/RichTooltip"
], function (Control, List, CustomListItem, RadioButton, TERadioButton, ValueState, ValueStateSupport, RichTooltip) {
	"use strict";
	return Control.extend("org.fater.app.control.TERadioQuestion", {
		metadata : {
			properties : {
				customId		: { type : "string", defaultValue : null },
				enabled			: { type : "bool", defaultValue : false },
                valueState		: { type : "sap.ui.core.ValueState", group : "Appearance", defaultValue : sap.ui.core.ValueState.None },
                valueStateText	: { type : "string",                 group : "Misc",       defaultValue : null }
			},
			aggregations : {
				_choices : {type : "sap.m.List", multiple: false, visibility : "hidden"}
			},
			events : {
			}
		},
		
		latestVisible: undefined,
		processedVisibility: undefined,
		
		init : function () {
			__flowAddDelegates(this);
			sap.ui.getCore().getEventBus().subscribe("validate", "all", this.validate, this);
			
			var oTemplate = new CustomListItem({
				content: [
					new TERadioButton({
						groupName: "{GroupId}_{QuestionId}",
						text: "{Title}",
						select: this._onSelect.bind(this),
						selected: "{Selected}"
					})
				]
			});
			
			this.setAggregation("_choices", new List({
				items: { 
					path: "AnswerS/",
					template: oTemplate
				}
			})).setLayoutData(new sap.ui.layout.GridData({ span: "L10 M10 S10" }));
		},
		
		_onSelect : function (oEvent) {
			this.validate();
		},
		
		validate: function(channel, event, data) {
			if( this.getBindingContext() !== undefined ) {
				if( this.processedVisibility === undefined ) {
					__flowHandleVisibility(this);
				}
				
				var result = this.isValid();
				if (this.setValueState && !result.isValid() ) {
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
				}
				
				var obj = this.getBindingContext().getObject();
				sap.ui.getCore().getEventBus().publish("validate", "result", {
					result: result,
					errorCount: result.getErrorCount(),
					id: obj.SurveyId + "_" + obj.GroupId + "_" + obj.QuestionId,
					validate_all_survey: data && data.validate_all_survey,
					group: this.getBindingContext().getPath().match(/\/Survey\/GroupS\/(\d)\/QuestionS\/[\d]*/)[1]
				});
			}
		},
		
		isValid: function() {
			var question = new Question(this.getBindingContext().getModel().getProperty(this.getBindingContext().getPath()));
			var vResult = question.validate(this.latestVisible);
			return vResult;
		},
		
		renderer : function (oRM, oControl) {
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.addClass("TERadioQuestion");
			if( oControl.getValueState() ) 
				oRM.addClass("TERadioQuestion" + oControl.getValueState() );
			oRM.writeClasses();
			oRM.write(">");
			//oControl.getAggregation("_choices").getItems().forEach(function logArrayElements(element, index, array) {
			  //element.getContent()[0].setEnabled(oControl.getEnabled());
			  //element.getContent()[0].setGroupName(element.getContent()[0].getBindingContext().getObject().QuestionId);
			//});
			
			for( var i = 0; i < oControl.getAggregation("_choices").getItems().length; i++ ) {
				var element = oControl.getAggregation("_choices").getItems()[i].getContent()[0];
				element.setEnabled(oControl.getEnabled());
				//element.setGroupName( oControl.getBindingContext().getObject().GroupId + "_" + oControl.getBindingContext().getObject().QuestionId );
				element.setSelected( oControl.getBindingContext().getObject().AnswerS[i].Selected );
			}
			
			oRM.renderControl(oControl.getAggregation("_choices"));
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
	            $container.removeClass("TERadioQuestion" + sOldValueState);
	        }
	
	        if (sValueState  !== ValueState.None) {
	            $container.addClass("TERadioQuestion" + sValueState);
	        }
	
	        return this;
	    }
	
	    
	});
});