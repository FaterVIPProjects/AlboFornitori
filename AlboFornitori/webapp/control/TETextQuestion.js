/*global someFunction b:true*/
/*eslint no-undef: "error"*/
sap.ui.define([
	"sap/ui/core/Control",
	"org/fater/albofornitori/control/TEInput"
], function (Control, TEInput) {
	"use strict";
	return Control.extend("org.fater.albofornitori.control.TETextQuestion", {
		metadata : {
			properties : {
				enabled			: { type : "bool", defaultValue : false },
				mandatory		: { type : "bool", defaultValue : false }
			},
			aggregations : {
				internalLayout	: {type : "sap.ui.layout.Grid", multiple: false},
				_input : {type : "org.fater.albofornitori.control.TEInput", multiple: false, visibility : "hidden"}
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
			
			var input = new TEInput({
				value: "{Value}",
				enabled: this.getEnabled(),
				customId: "question_{QuestionId}_answer_{AnswerId}",
				liveChange: this._onLiveChange.bind(this),
				layoutData: new sap.ui.layout.GridData({span: "L3 M3 S3"})
			});
			this.setAggregation("_input", input);
			this.getInternalLayout().addContent(input);
			input.bindElement("AnswerS/0");
		},
		
		_onLiveChange : function (oEvent) {
			this.validate();
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
		
		validateAnswer: function(oEvent) {
			var model = new Answer(oEvent.getSource().getBindingContext().getModel().getProperty(oEvent.getSource().getBindingContext().getPath()));
			model.Value = oEvent.getParameter("value");
			var vResult = model.validate(this.latestVisible);
			return vResult;
		},
		
		renderer : function (oRM, oControl) {
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.addClass("TETextQuestion");
			oRM.writeClasses();
			
			if( oControl.getEnabled() !== null ) {
				oControl.getInternalLayout().getContent()[0].setEnabled( oControl.getEnabled() );
			}
			
			if( oControl.getMandatory() !== null ) {
				oControl.getInternalLayout().getContent()[0].setMandatory( oControl.getMandatory() );
			}
			oControl.getInternalLayout().getContent()[0].setValue( oControl.getBindingContext().getObject().AnswerS[0].Value );
			
			oRM.renderControl( oControl.getAggregation("internalLayout") );
			
			oRM.write("</div>");
		}
		
		
	});
});