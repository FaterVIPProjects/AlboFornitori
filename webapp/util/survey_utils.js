/****************************************** Custom Control Utils ******************************************/ 

function __flowAddDelegates(cc) {
	cc.addEventDelegate({
		onBeforeRendering: function(oEvent) {
			__flowHandleVisibility(cc);
		}
	});
	cc.addEventDelegate({
		onAfterRendering: function(oEvent) {
			// if( !processedFirstConstraint ) {
				cc.getParent().setVisible( cc.latestVisible === undefined ? false : cc.latestVisible );
				cc.getParent().getParent().setVisible( cc.latestVisible === undefined ? false : cc.latestVisible );
		    	try {
		    		//cc.getParent().rerender();
		    	} catch( e ) {}
		    	try {
		    		//cc.getParent().getParent().rerender();
		    	} catch( e ) {}
				// processedFirstConstraint = true;
			// }
		}
	});
};

function __flowHandleVisibility(cc) {
	if( cc.getBindingContext() === null ) {
		return;
	}
	
	cc.processedVisibility = true;
	var constraints = cc.getBindingContext().getObject().Constraints;
	if( constraints.length === 0 ) {
		cc.latestVisible = true;
		return;
	}
	constraints = JSON.parse(constraints);
	var processedFirstConstraint = false;
	var hasOneFlow = false;
	for( var i = 0; i < constraints.length; i++ ) {
		var c = constraints[i];
		if( c.scenario === "FLOW" ) {
			hasOneFlow = true;
			if( cc.latestVisible === undefined ) {
				cc.latestVisible = false;
			}
			__flowApplyBindingEventChange(cc, c, cc.getParent());
		}
	}
	if( !hasOneFlow ) {
		cc.latestVisible = true;
	}
};

function __flowApplyBindingEventChange( cc, constraint, view ) {
	var path = __flowGetPath( cc, constraint );
	var binding = new sap.ui.model.Binding(cc.getBindingContext().getModel(), path + "/Selected");
	binding.attachChange(function(oEvent) {
	    var v = oEvent.getSource().getModel().getProperty(oEvent.getSource().getPath());
	    view.setVisible(v);
	    view.getParent().setVisible(v);
	    if( cc.latestVisible === undefined || cc.latestVisible !== v ) {
	    	cc.latestVisible = v;
	    	view.rerender();
	    	view.getParent().rerender();
	    }
	});
};
		
function __flowGetPath( cc, constraint ) {
	var groups = cc.getBindingContext().getModel().getProperty("/Survey/GroupS");
	var path = "/Survey/GroupS/";
	for( var ig = 0; ig < groups.length; ig++ ) {
		var g = groups[ig];
		if( g.GroupId === constraint.groupId && g.SurveyId === constraint.surveyId ) {
			path += ig + "/QuestionS/";
			for( var iq = 0; iq < g.QuestionS.length; iq++ ) {
				var q = g.QuestionS[iq];
				if( q.QuestionId === constraint.questionId ) {
					path += iq + "/AnswerS/";
					for( var ia = 0; ia < q.AnswerS.length; ia++ ) {
						var a = q.AnswerS[ia];
						if( a.AnswerId === constraint.answerId ) {
							path += ia;
							return path;
						}
					}
				}
			}
		}
	}
	return null;
};