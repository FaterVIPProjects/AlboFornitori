/*global someFunction b:true*/
/*eslint no-undef: "error"*/
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/List",
	"sap/m/CustomListItem",
	"org/fater/app/control/TECheckBox",
    "sap/ui/core/ValueState",
    "sap/ui/core/ValueStateSupport",
	"sap/ui/commons/RichTooltip"
], function (Control, List, CustomListItem, TECheckBox, ValueState, ValueStateSupport, RichTooltip) {
	"use strict";
	return Control.extend("org.fater.app.control.TEChoiceQuestion", {
		metadata : {
			properties : {
				customId		: {type : "string", defaultValue : null},
				enabled			: {type : "bool", defaultValue : false},
                valueState		: { type : "sap.ui.core.ValueState", group : "Appearance", defaultValue : sap.ui.core.ValueState.None},
                valueStateText	: { type : "string",                 group : "Misc",       defaultValue : null }
			},
			aggregations : {
				_choices : {type : "sap.m.List", multiple: true, visibility : "hidden"}
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
					new TECheckBox({
						text: "{Title}",
						selected: "{Selected}",
						customId: "question_{QuestionId}_answer_{AnswerId}",
						select: this._onSelect.bind(this)
					})
				]
			});
			
			this.addAggregation("_choices", new List({
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
			oRM.addClass("TEChoiceQuestion");
			if( oControl.getValueState() ) 
				oRM.addClass("TEChoiceQuestion" + oControl.getValueState() );
			oRM.writeClasses();
			oRM.write(">");
			oRM.renderControl(oControl.getAggregation("_choices")[0]);
			oControl.getAggregation("_choices")[0].getItems().forEach(function logArrayElements(element, index, array) {
			  element.getContent()[0].setEnabled(oControl.getEnabled());
			});
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
	
	        return this;
	    }
	
	    
	});
});