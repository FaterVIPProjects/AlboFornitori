/*global someFunction b:true*/
/*eslint no-undef: "error"*/
// Provides control .TEInput.
sap.ui.define([
		'sap/m/RadioButton'
	], function(RadioButton) {
	"use strict";

	var TERadioButton = RadioButton.extend("org.fater.app.control.TERadioButton", { 
	
		metadata : {
			properties : {
				mandatory : {type : "boolean", group : "Misc", defaultValue : false, deprecated: false}
			}
		}, 
		aggregations: {},
		events: {},
		renderer: {}
		
	});
	
	TERadioButton.prototype.getInternalId = function() {
		return this.getBindingContext().getObject().GroupId + "_" + this.getBindingContext().getObject().QuestionId + "_" + this.getBindingContext().getObject().AnswerId;
	};
	
	TERadioButton.prototype.setSelected = function(sValue) {
		// this.updateValue(sValue);
		console.log(this.getBindingContext() + " | " + this.getGroupName() );
		return RadioButton.prototype.setSelected.call(this, sValue);
	};
	
	TERadioButton.prototype.updateValue = function(sValue) {
		if( this.getBindingContext() !== undefined ) {
			var path = this.getBindingContext().getPath();
			if( path.indexOf('AnswerS') === -1 ) {
				return;
			}
			this.getBindingContext().getModel().setProperty(path+"/Selected", sValue);
		}
	};
	
	TERadioButton.prototype.overrideGroupName = function(sGroupName) {
		this._groupNames = {};
		this.setProperty("groupName", sGroupName, true);
		this.setGroupName(sGroupName);
		console.log(this.getBindingContext() + " | " + this.getGroupName() );
	};
	
	
	TERadioButton.prototype.setGroupName = function(sGroupName) {
		delete this._groupNames["sapMRbDefaultGroup"];
		this.setProperty("groupName", sGroupName, false);
		this._changeGroupName(sGroupName, this.getGroupName());
		return this.setProperty("groupName", sGroupName, true);
	};

	/**
	 * Changes the groupname of a RadioButton.
	 * @param {string} sNewGroupName - Name of the new group.
	 * @param {string} sOldGroupName - Name of the old group.
	 * @private
	 */
	TERadioButton.prototype._changeGroupName = function(sNewGroupName, sOldGroupName) {
		var aNewGroup = this._groupNames[sNewGroupName],
			aOldGroup = this._groupNames[sOldGroupName];

		var index = this._contained(aOldGroup);
		if (aOldGroup && index !== -1) {
			aOldGroup.splice(index, 1);
		}

		if (!aNewGroup) {
			aNewGroup = this._groupNames[sNewGroupName] = [];
		}

		index = this._contained(aOldGroup);
		if (this._contained(aOldGroup) === -1 && this._contained(aNewGroup) === -1) {
			aNewGroup.push(this);
		}

	};
	
	TERadioButton.prototype._contained = function(array) {
		if( !array ) {
			return -1;
		}
			
		for(var i = 0; i < array.length; i++) {
			var eq = array[i].getBindingContext().getPath() === this.getBindingContext().getPath();
			if( eq ) {
				return i;
			}
		}
		return -1;
	};
	
	
	
	/**
	 * Sets the state of the RadioButton to selected.
	 * @param {boolean} bSelected - defines if the radio button is selected
	 * @returns {sap.m.RadioButton} Reference to the control instance for chaining
	 * @public
	 */
	TERadioButton.prototype.setSelected = function(bSelected) {
		var oControl,
			bSelectedOld = this.getSelected(),
			sGroupName = this.getGroupName(),
			aControlsInGroup = this._groupNames[sGroupName],
			iLength = aControlsInGroup && aControlsInGroup.length;

		this.setProperty("selected", bSelected, true); // No re-rendering
		this._changeGroupName(this.getGroupName());
		
		
		var path = this.getBindingContext().getPath();
		this.getBindingContext().getModel().setProperty(path+"/Selected", bSelected);

		if (!!bSelected && sGroupName && sGroupName !== "") { // If this radio button is selected and groupName is set, explicitly deselect the other radio buttons of the same group
			for (var i = 0; i < iLength; i++) {
				oControl = aControlsInGroup[i];

				if (oControl instanceof RadioButton && oControl.getInternalId() !== this.getInternalId() && oControl.getSelected()) {
					path = oControl.getBindingContext().getPath();
					oControl.getBindingContext().getModel().setProperty(path+"/Selected", bSelected);
					oControl.fireSelect({ selected: false });
					oControl.setSelected(false);
				}
			}
		}

		if ((bSelectedOld !== !!bSelected) && this.getDomRef()) {
			this.$().toggleClass("sapMRbSel", bSelected);

			if (bSelected) {
				this.getDomRef().setAttribute("aria-checked", "true");
				this.getDomRef("RB").checked = true;
				this.getDomRef("RB").setAttribute("checked", "checked");
			} else {
				this.getDomRef().removeAttribute("aria-checked"); // aria-checked=false is default value and need not be set explicitly
				this.getDomRef("RB").checked = false;
				this.getDomRef("RB").removeAttribute("checked");
			}
		}

		return this;
	};
	
	return TERadioButton;

}, /* bExport= */ true);