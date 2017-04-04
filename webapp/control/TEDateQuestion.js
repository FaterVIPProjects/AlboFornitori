/*global someFunction b:true*/
/*eslint no-undef: "error"*/
sap.ui.define([
	"sap/ui/core/Control",
	"org/fater/app/control/TEDatePicker"
], function (Control, TEDatePicker) {
	"use strict";
	return Control.extend("org.fater.app.control.TEDateQuestion", {
		metadata : {
			properties : {
				enabled			: { type : "bool", defaultValue : false },
				mandatory		: { type : "bool", defaultValue : false }
			},
			aggregations : {
				internalLayout	: {type : "sap.ui.layout.Grid", multiple: false},
				_date : {type : "org.fater.app.control.TEDatePicker", multiple: false, visibility : "hidden"}
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
			
			var input = new TEDatePicker({
				value: "{Value}",
	            valueFormat : "yyyyMMdd",
	            displayFormat : "dd/MM/yyyy",
				enabled: this.getEnabled(),
				customId: "question_{QuestionId}_answer_{AnswerId}",
				liveChange: this._onLiveChange.bind(this),
				layoutData: new sap.ui.layout.GridData({span: "L3 M3 S3"})
			});
			this.setAggregation("_date", input);
			this.getInternalLayout().addContent(input);
			input.bindElement("AnswerS/0");
		},
		
		_onLiveChange : function (oEvent) {
			if (oEvent.getSource().validate) {
				oEvent.getSource().validate(this.latestVisible);
			}
		},
	
		validate: function(channel, event, data) {
			if( this.getBindingContext() !== undefined ) {
				if( this.processedVisibility === undefined ) {
					__flowHandleVisibility(this);
				}
				var vResult = this.getInternalLayout().getContent()[0].validate(this.latestVisible);
				
				var obj = this.getBindingContext().getObject();
				sap.ui.getCore().getEventBus().publish("validate", "result", {
					result: vResult,
					errorCount: vResult.getErrorCount(),
					id: obj.SurveyId + "_" + obj.GroupId + "_" + obj.QuestionId,
					validate_all_survey: data && data.validate_all_survey,
					group: this.getBindingContext().getPath().match(/\/Survey\/GroupS\/(\d)\/QuestionS\/[\d]*/)[1]
				});
				
				return vResult;
			}
		},
		
		renderer : function (oRM, oControl) {
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.addClass("TEDateQuestion");
			oRM.writeClasses();
			
			oControl.getInternalLayout().getContent()[0].setEnabled( oControl.getEnabled() );
			oControl.getInternalLayout().getContent()[0].setMandatory( oControl.getMandatory() );
			
			oRM.renderControl( oControl.getAggregation("internalLayout") );
			
			oRM.write("</div>");
		}
		
		
	});
});