/*global someFunction b:true*/
/*eslint no-undef: "error"*/
/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.m.TEStandardListItem.
sap.ui.define([
		'sap/m/StandardListItem'
	], function(StandardListItem) {
	"use strict";

	/**
	 * Constructor for a new TEStandardListItem.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * <code>sap.m.TEStandardListItem</code> is a list item providing the most common use cases, e.g. image, title and description.
	 * @extends sap.m.StandardListItem
	 *
	 * @author SAP SE
	 * @version 1.38.5
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.TEStandardListItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TEStandardListItem = StandardListItem.extend("org.fater.albofornitori.control.TEStandardListItem", { 
	
		metadata : {
			properties : {
				/**
				 * Whether the control should be enabled. If set to false, the item is rendered as disabled.
				 */
				enabled : {type : "boolean", group : "Appearance", defaultValue : true}
			}
		}, 
		aggregations: {},
		events: {},
		renderer: {}
		
	});
	
	TEStandardListItem.prototype.getMultiSelectControl = function() {
		var control = StandardListItem.prototype.getMultiSelectControl.apply(this, arguments);
		control.setEnabled( this.getEnabled() );
		return control;
	};
	
	TEStandardListItem.prototype.getSingleSelectControl = function() {
		var control = StandardListItem.prototype.getSingleSelectControl.apply(this, arguments);
		control.setEnabled( this.getEnabled() );
		return control;
	};

	return TEStandardListItem;

}, /* bExport= */ true);