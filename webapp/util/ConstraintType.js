sap.ui.model.SimpleType.extend("org.fater.app.util.ConstraintType", {
	
    formatValue: function(oValue) {
        return oValue;
    },

    parseValue: function(oValue) {
        return oValue;
    },

    validateValue: function(oValue) {
    	return false;
    }
});