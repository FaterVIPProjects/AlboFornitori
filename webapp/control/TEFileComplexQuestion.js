/*global a*/
/*eslint no-undef: ["error", { "typeof": true }] */
sap.ui.define([
	"sap/ui/core/Control",
	"org/fater/app/control/TEDatePicker",
	"org/fater/app/control/TECheckBox",
	"org/fater/app/control/TEInput",
	"org/fater/app/control/TEFileUploader",
	"org/fater/app/control/TEButton",
	"sap/m/Link",
	"sap/m/Label",
	"sap/ui/core/Item",
    "sap/ui/core/ValueState",
    "sap/ui/core/ValueStateSupport",
	"sap/ui/commons/RichTooltip",
	"sap/ui/layout/Grid",
	"sap/m/FlexBox"

], function (Control, TEDatePicker, TECheckBox, TEInput, TEFileUploader, TEButton, Link, Label, Item, ValueState, ValueStateSupport, RichTooltip, Grid, FlexBox) {
	"use strict";
	return Control.extend("org.fater.app.control.TEFileComplexQuestion", {
		metadata : {
			properties : {
				enabled			: { type : "bool", defaultValue : false },
				mandatory		: { type : "bool", defaultValue : false },
                valueState		: { type : "sap.ui.core.ValueState", group : "Appearance", defaultValue : sap.ui.core.ValueState.None},
                valueStateText	: { type : "string",                 group : "Misc",       defaultValue : null }
			},
			aggregations : {
				internalLayout	: {type : "sap.ui.layout.Grid", multiple: false},
				_date_label : {type : "sap.m.Label", multiple: false},
				_date_input : {type : "org.fater.app.control.TEDatePicker", multiple: false, visibility : "hidden"},
				_date_checkbox : {type : "org.fater.app.control.TECheckBox", multiple: false, visibility : "hidden"},
				_description_label : {type : "sap.m.Label", multiple: false},
				_description : {type : "org.fater.app.control.TEInput", multiple: false, visibility : "hidden"},
				_file_link  : {type : "sap.m.Link", multiple: false, visibility : "hidden"},
				_file_upload  : {type : "org.fater.app.control.TEFileUploader", multiple: false, visibility : "hidden"},
				_file_button : {type : "org.fater.app.control.TEButton", multiple: false, visibility : "hidden"}
			},
			events : {
				upload : {
					parameters : {
						filePath : {type : "string"}
					}
				}
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
				text: "{i18n>fileComplexExpireDate}"
			});
			this.setAggregation("_date_label", input);
			flexBox = new FlexBox({
				alignItems: "Center",
				justifyContent: "Center",
				height: "48px",
				layoutData: new sap.ui.layout.GridData({span: "L2 M2 S2"})
			});
			flexBox.addItem(input);
			this.getInternalLayout().addContent(flexBox);
			input.bindElement("AnswerS/2");
			
			var input = new TEDatePicker({
				value: "{Value}",
	            valueFormat : "yyyyMMdd",
	            displayFormat : "dd/MM/yyyy",
				enabled: this.getEnabled(),
				customId: "question_{QuestionId}_answer_{AnswerId}",
				liveChange: this._onLiveChange.bind(this),
				layoutData: new sap.ui.layout.GridData({span: "L3 M3 S3"})
			});
			input.bindElement("AnswerS/2");
			this.setAggregation("_date_input", input);
			this.getInternalLayout().addContent(input);
			
			input = new TECheckBox({
				text: "{i18n>fileComplexExpireDateNever}",
				selected: "{Selected}",
				customId: "question_{QuestionId}_answer_{AnswerId}",
				select: this._onSelect.bind(this),
				layoutData: new sap.ui.layout.GridData({span: "L6 M6 S6"})
			});
			this.setAggregation("_date_checkbox", input);
			this.getInternalLayout().addContent(input);
			input.bindElement("AnswerS/3");
			
			input = new Label({
				text: "{i18n>fileComplexFileDescription}"
			});
			this.setAggregation("_description_label", input);
			flexBox = new FlexBox({
				alignItems: "Center",
				justifyContent: "Center",
				height: "48px",
				layoutData: new sap.ui.layout.GridData({span: "L2 M2 S2"})
			});
			flexBox.addItem(input);
			this.getInternalLayout().addContent(flexBox);
			input.bindElement("AnswerS/1");
			
			input = new TEInput({
				value: "{Value}",
				enabled: this.getEnabled(),
				customId: "question_{QuestionId}_answer_{AnswerId}",
				liveChange: this._onLiveChange.bind(this),
				mandatory: this.getMandatory(),
				layoutData: new sap.ui.layout.GridData({span: "L4 M4 S4"})
			});
			input.bindElement("AnswerS/1");
			this.setAggregation("_description", input);
			this.getInternalLayout().addContent(input);
			
			input = new TEFileUploader({
				customId: "question_{QuestionId}_answer_{AnswerId}",
				uploadUrl: "/sap/opu/odata/sap/ZVIP_PROJECT_SRV/FileSet",
				sendXHR: true,
				useMultipart: false,
				uploadComplete: this._onUploadComplete.bind(this)
				// layoutData: new sap.ui.layout.GridData({span: "L4 M4 S4"})
			});
			input.bindElement("AnswerS/0");
			this.setAggregation("_file_upload", input);
			this.getInternalLayout().addContent(input);
			
			input = new TEButton({
				relatedCustomId: "question_{QuestionId}_answer_{AnswerId}",
				text: "{i18n>buttonUpload}",
				press: this._onUpload.bind(this),
				// layoutData: new sap.ui.layout.GridData({span: "L2 M2 S2"})
			});
			input.bindElement("AnswerS/0");
			this.setAggregation("_file_button", input);
			this.getInternalLayout().addContent(input);
			
			input = new Link({
				text: "{i18n>uploadedFile}",
				target: "_blank",
				visible: "{= ${Value} !== '' }",
				emphasized: true,
				href: {
					parts: [
						{ path: "Value" },
						{ path: "/SupplierId" }
					],
					formatter: function(fileName, supplierId) {
						if( fileName === "" || fileName === null || fileName === undefined )
							return "";
						return "/sap/opu/odata/sap/ZVIP_PROJECT_SRV" + "/FileSet(FileName='" + fileName + "',Supplier='" + supplierId + "')/$value";	
					}
				}
			});
			flexBox = new FlexBox({
				alignItems: "Center",
				justifyContent: "Center",
				height: "48px",
				layoutData: new sap.ui.layout.GridData({span: "L6 M6 S6"})
			});
			this.getInternalLayout().addContent(flexBox);
			input.bindElement("AnswerS/0");
			this.setAggregation("_file_link", input);
			flexBox.addItem(input);
		},
		
		_onSelect : function (oEvent) {
			this.validate();
		},
		
		_onChange : function (oEvent) {
			this.validate();
		},
		
		_onLiveChange : function (oEvent) {
			this.validate();
		},
		
		_onUploadComplete: function(oEvent) {
			this.setBusy(false);
			this.getBindingContext().getModel().setProperty( this.getBindingContext().getPath() + "/AnswerS/0/Value", JSON.parse(oEvent.getParameter("responseRaw")).d.FileName );
		},
		
		_onUpload : function(oEvent) {
			var uploader = this.getInternalLayout().getContent()[5];
			var valid = true;
			if( valid ) {
				var supplierId = this.getBindingContext().getModel().getProperty("/SupplierId");
				uploader.removeAllHeaderParameters();
				uploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
				     name: "Accept", 
				     value: "application/json"
				}));
				uploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
				     name: "x-requested-with", 
				     value: true
				}));
				uploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
				     name: "slug", 
				     value: uploader.getValue() + "/" + supplierId
				}));
				this.setBusy(true);
				uploader.upload();
			}
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
			oRM.addClass("TEFileComplexQuestion");
			if( oControl.getValueState() ) 
				oRM.addClass("TEFileComplexQuestion" + oControl.getValueState() );
			oRM.writeClasses();
			oRM.write(">");
			
			oControl.getInternalLayout().getContent()[1].setMandatory( oControl.getMandatory() );
			oControl.getInternalLayout().getContent()[2].setMandatory( oControl.getMandatory() );
			
			oControl.getInternalLayout().getContent()[1].setEnabled( oControl.getEnabled() );
			oControl.getInternalLayout().getContent()[4].setEnabled( oControl.getEnabled() );
			oControl.getInternalLayout().getContent()[4].setMandatory( oControl.getMandatory() );
			oControl.getInternalLayout().getContent()[5].setEnabled( oControl.getEnabled() );
			oControl.getInternalLayout().getContent()[5].setMandatory( oControl.getMandatory() );
			oControl.getInternalLayout().getContent()[6].setEnabled( oControl.getEnabled() );
			oControl.getInternalLayout().getContent()[5].setVisible( oControl.getEnabled() );
			oControl.getInternalLayout().getContent()[6].setVisible( oControl.getEnabled() );
			
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
	            $container.removeClass("TEFileComplexQuestion" + sOldValueState);
	        }
	
	        if (sValueState  !== ValueState.None) {
	            $container.addClass("TEFileComplexQuestion" + sValueState);
	        }
	
	        return this;
	    }
	});
});