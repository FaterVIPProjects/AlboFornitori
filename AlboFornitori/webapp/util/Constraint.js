/*global someFunction b:true*/
/*eslint no-undef: "error"*/

///////////////////////////////////////////
// Utils
///////////////////////////////////////////

// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

///////////////////////////////////////////
// Question
///////////////////////////////////////////

var QUESTION_TYPE = {
	'TEXT': 'TEXT',
	'TEXT_AREA': 'TEXT_AREA',
	'TEXT_SINGLE_CHOICE': 'TEXT_SINGLE_CHOICE',
	'TEXT_MULTI_CHOICE': 'TEXT_MULTI_CHOICE',
	'DATEPICKER': 'DATEPICKER',
	'MONEY': 'MONEY',
	'FILE': 'FILE',
	'FILE_CERTIFICATION': 'FILE_CERTIFICATION',
	'SINGLE_CHECKBOX': 'SINGLE_CHECKBOX',
	'STATEMENT': 'STATEMENT',
	'YEAR_REVENUE_3': 'YEAR_REVENUE_3',
	'YEAR_REVENUE': 'YEAR_REVENUE'
};

function Question(data) {
	this.validation_result = null;
	this.visible = true;
	for (var i in data) {
		if (i === 'AnswerS') {
			this.answers = [];
			for (var j in data.AnswerS) {
				// Questions with single answer are selected by default
				this.answers.push(new Answer(data.AnswerS[j], !this.isChoiceType()));
			}
		} else if (i === 'Constraints') {
			this.constraints = [];
			if( data.Constraints && data.Constraints !== "" ) {
				var jsonConstraints = JSON.parse(data.Constraints);
				for (var j in jsonConstraints) {
					this.constraints.push(new Constraint(jsonConstraints[j]));
				}
			}
		} else {
			this[i] = data[i];
		}
	}
};

Question.prototype.isFileComplexType = function() {
	return this.Type && this.Type == QUESTION_TYPE.FILE_CERTIFICATION;
};

Question.prototype.isStatementType = function() {
	return this.Type && this.Type == QUESTION_TYPE.STATEMENT;
};

Question.prototype.isOpenType = function() {
	return this.Type && (this.Type == QUESTION_TYPE.TEXT || this.Type == QUESTION_TYPE.TEXT_AREA);
};

Question.prototype.isChoiceType = function() {
	return this.isTextChoiceType() || this.isSingleCheckboxType();
};

Question.prototype.isSingleCheckboxType = function() {
	return this.Type && this.Type == QUESTION_TYPE.SINGLE_CHECKBOX;
};

Question.prototype.isTextChoiceType = function() {
	return this.isTextSingleChoiceType() || this.isTextMultiChoiceType();
};

Question.prototype.isSingleChoiceType = function() {
	return this.isTextSingleChoiceType();
};

Question.prototype.isMultiChoiceType = function() {
	return this.isTextMultiChoiceType();
};

Question.prototype.isTextSingleChoiceType = function() {
	return this.Type && this.Type == QUESTION_TYPE.TEXT_SINGLE_CHOICE;
};

Question.prototype.isTextMultiChoiceType = function() {
	return this.Type && this.Type == QUESTION_TYPE.TEXT_MULTI_CHOICE;
};

Question.prototype.isDatePickerType = function() {
	return this.Type && this.Type == QUESTION_TYPE.DATEPICKER;
};

Question.prototype.addContraint = function(constraint) {
	this.constraints.push(constraint);
};

Question.prototype.addAnswer = function(answer) {
	answer.group_id = this.group_id;
	answer.question_id = this.id;
	this.answers.push(answer);
};

Question.prototype.getAnswerByIndex = function(index) {
	return this.answers[index];
};

Question.prototype.getAnswerById = function(id) {
	return _.findWhere(this.answers, {
		id: id
	});
};

Question.prototype.validate = function(isVisible) {
	var isValid = true;
	this.validation_result = new ValidationResult();
	
	if( isVisible === false ) {
		return this.validation_result;
	}

	if (this.constraints) {
		for (var constraintType in this.constraints) {
			var constraint = this.constraints[constraintType];
			if( constraint.isValidateScenario() ) {
				var constraintValidated = constraint.validate(this);
				if (!constraintValidated) {
					this.validation_result.addError(constraint);
				}
				isValid = isValid && constraintValidated;
			}
		}
	}

	var hasAnswerValidValue = false;

	if( this.isFileComplexType() ) {
		var dateValidation = null;
		var singleCheckboxSelected = null;
		for (var answerID in this.answers) {
			var answer = this.answers[answerID];
			var answerValidation = answer.validate(isVisible);
			if( answer.isDatePickerType() ) {
				dateValidation = answerValidation;
			} else if ( answer.isSingleCheckboxType() ) {
				singleCheckboxSelected = answer.Selected;
			} else {
				hasAnswerValidValue = hasAnswerValidValue || answerValidation.valid;
				this.validation_result.merge(answerValidation);
			}
		}
			
		if( !dateValidation.valid && !singleCheckboxSelected ) {
			hasAnswerValidValue = false;
			this.validation_result.addErrorString("You must choose at least a date option.");
		}
	} else {
		for (var answerID in this.answers) {
			var answer = this.answers[answerID];
			var answerValidation = answer.validate(isVisible);
			this.validation_result.merge(answerValidation);
			hasAnswerValidValue = hasAnswerValidValue || answerValidation.valid;
		}
	}

	if ( !this.validation_result.hasErrors() && this.Mandatory ) {
		var showError = false;
		if( this.isChoiceType() ) {
			showError = this.getSelectedAnswers().length === 0;
		} else if ( this.isOpenType() || this.isDatePickerType() ) {
			showError = this.answers[0].isEmpty();
		}
		if( showError ) {
			this.validation_result.addErrorString("Question {0} is missing or invalid.".format(this.title));
		}
	}

	return this.validation_result;
};

Question.prototype.hasValidAnswers = function() {
	var selectedAnswer = this.getSelectedAnswers();

	var hasValidAnswers = true;
	for (var i = 0; i < selectedAnswer.length; i++) {
		hasValidAnswers = hasValidAnswers && selectedAnswer[i].validate(this);
	}
	return hasValidAnswers;
};

Question.prototype.getSelectedAnswers = function() {
	var list = [];
	for (var i = 0; i < this.answers.length; i++) {
		var answer = this.answers[i];
		if (!this.isChoiceType() || answer.isSelected(this))
			list.push(answer);
	}
	return list;
};

Question.prototype.countValidAnswer = function() {
	var count = 0;
	var selectedAnswer = this.getSelectedAnswers();

	var hasValidAnswers = true;
	for (var i = 0; i < selectedAnswer.length; i++) {
		if (selectedAnswer[i].validate(this))
			count++;
	}
	return count;
};

///////////////////////////////////////////
// Answer
///////////////////////////////////////////

var ANSWER_TYPE = {
	'TEXT': 'TEXT',
	'TEXT_AREA': 'TEXT_AREA',
	'TEXT_SINGLE_CHOICE': 'TEXT_SINGLE_CHOICE',
	'TEXT_MULTI_CHOICE': 'TEXT_MULTI_CHOICE',
	'DATEPICKER': 'DATEPICKER',
	'FILE': 'FILE',
	'SINGLE_CHECKBOX': 'SINGLE_CHECKBOX',
	'STATEMENT': 'STATEMENT',
	'CURRENCY': 'CURRENCY'
};

function Answer(data) {
	this.validation_result = null;
	for (var i in data) {
		if (i === "Constraints") {
			this.constraints = [];
			if( data.Constraints && data.Constraints !== "" ) {
				var jsonConstraints = JSON.parse(data.Constraints);
				for (var j in jsonConstraints) {
					this.constraints.push(new Constraint(jsonConstraints[j]));
				}
			}
		} else {
			this[i] = data[i];
		}
	}
};

Answer.prototype.isStatementType = function() {
	return this.Type && this.Type == QUESTION_TYPE.STATEMENT;
};

Answer.prototype.isOpenType = function() {
	return this.Type && (this.Type == QUESTION_TYPE.TEXT || this.Type == QUESTION_TYPE.TEXT_AREA);
};

Answer.prototype.isChoiceType = function() {
	return this.isTextChoiceType() || this.isSingleCheckboxType();
};

Answer.prototype.isTextChoiceType = function() {
	return this.isTextSingleChoiceType() || this.isTextMultiChoiceType();
};

Answer.prototype.isSingleChoiceType = function() {
	return this.isTextSingleChoiceType();
};

Answer.prototype.isMultiChoiceType = function() {
	return this.isTextMultiChoiceType();
};

Answer.prototype.isSingleCheckboxType = function() {
	return this.Type && this.Type == QUESTION_TYPE.SINGLE_CHECKBOX;
};

Answer.prototype.isTextSingleChoiceType = function() {
	return this.Type && this.Type == QUESTION_TYPE.TEXT_SINGLE_CHOICE;
};

Answer.prototype.isTextMultiChoiceType = function() {
	return this.Type && this.Type == QUESTION_TYPE.TEXT_MULTI_CHOICE;
};

Answer.prototype.isDatePickerType = function() {
	return this.Type && this.Type == QUESTION_TYPE.DATEPICKER;
};

Answer.prototype.addContraint = function(constraint) {
	this.constraints.push(constraint);
};

Answer.prototype.addUserAnswer = function(value) {
	this.Selected = true;
	if (value)
		this.Value = value;
};

Answer.prototype.validate = function(isVisible) {
	var isValid = true;
	this.validation_result = new ValidationResult();
	if( isVisible === false ) {
		return this.validation_result;
	}

	if (this.constraints) {
		for (var constraintType in this.constraints) {
			var constraint = this.constraints[constraintType];
			if( constraint.isValidateScenario() ) {
				var constraintValidated = constraint.validate(this);
				if (!constraintValidated) {
					this.validation_result.addError(constraint);
				}
				isValid = isValid && constraintValidated;
			}
		}
	}

	var hasAnswerValidValue = true;

	if (this.isChoiceType()) {
		hasAnswerValidValue = this.Selected;
	} else if (this.isDatePickerType()) {
		hasAnswerValidValue = this.Value != undefined;
	} else if (this.Value == null || this.Value == undefined) {
		hasAnswerValidValue = false;
	} else {
		hasAnswerValidValue = !this.isEmpty();
	}
	
	if (this.Mandatory) {
		if (this.isChoiceType()) {
			hasAnswerValidValue = this.Selected;
		} else {
			hasAnswerValidValue = !this.isEmpty();
		}
	} else {
		hasAnswerValidValue = true;
	}

	if (isValid && !hasAnswerValidValue && !this.validation_result.hasErrors() ) {
		this.validation_result.addErrorString("Answer is missing or invalid.");
	}

	return this.validation_result;
};

Answer.prototype.isSelected = function() {
	return this.Selected;
};

Answer.prototype.isEmpty = function() {
	var isNull = this.Value == null;

	if (isNull) {
		return true;
	} else if (!this.Value || this.Value.length <= 0) {
		//If it's a string check if it's not empty
		return true;
	} else {
		return false;
	}
};

Answer.prototype.compareIntegerValue = function(toCompare, lesser, alsoEqual) {
	if (isNaN(toCompare))
		return false;

	if (this.isEmpty()) {
		return false;
	} else {
		var intValue = parseInt(this.Value);
		if (lesser) {
			if (alsoEqual) {
				return intValue <= toCompare;
			} else {
				return intValue < toCompare;
			}
		} else {
			if (alsoEqual) {
				return intValue >= toCompare;
			} else {
				return intValue > toCompare;
			}
		}
	}
};

Answer.prototype.compareValue = function(toCompare, lesser, alsoEqual) {
	var compared = this.Value.localeCompare(toCompare);
	if (lesser) {
		if (alsoEqual) {
			return compared <= 0;
		} else {
			return compared < 0;
		}
	} else {
		if (alsoEqual) {
			return compared >= 0;
		} else {
			return compared > 0;
		}
	}
};

///////////////////////////////////////////
// Utils
///////////////////////////////////////////

function isAnswer(obj) {
	return obj instanceof Answer;
}

function isQuestion(obj) {
	return obj instanceof Question;
}

/*function isGroup(obj) {
	return obj instanceof Group;
} 

function isSurvey(obj) {
	return obj instanceof Survey;
} */

///////////////////////////////////////////
// Constraint
///////////////////////////////////////////

var CONSTRAINT_TYPE = {
	'MIN_LENGTH': 'MIN_LENGTH',
	'MAX_LENGTH': 'MAX_LENGTH',
	'IS_SELECTED': 'IS_SELECTED',
	'NOT_SELECTED': 'NOT_SELECTED',
	'NOT_EMPTY': 'NOT_EMPTY',
	'EQUAL': 'EQUAL',
	'NOT_EQUAL': 'NOT_EQUAL',
	'GREATER_THAN': 'GREATER_THAN',
	'GREATER_EQ_THAN': 'GREATER_EQ_THAN',
	'LESSER_THAN': 'LESSER_THAN',
	'LESSER_EQ_THAN': 'LESSER_EQ_THAN',
	'MATCH_PATTERN': 'MATCH_PATTERN',
	'NOT_MATCH_PATTERN': 'NOT_MATCH_PATTERN',
	'MIN_ANSWER': 'MIN_ANSWER',
	'MAX_ANSWER': 'MAX_ANSWER',
	'IS_NUMBER': 'IS_NUMBER',
	'IS_ALPHA_NUM': 'IS_ALPHA_NUM',
	'IS_ALPHA': 'IS_ALPHA',
	'BEFORE_TODAY': 'BEFORE_TODAY',
	'AFTER_TODAY': 'AFTER_TODAY'
};

var CONSTRAINT_SCENARIO = {
	'VALIDATE': 'VALIDATE',
	'FLOW': 'FLOW'
};

function Constraint(data) {
	for (var i in data) {
		this[i] = data[i];
	}
}

/*function Constraint(scenario, groupID, questionID, answerID, type, value, value2, errorMessage) {
    this.scenario = scenario;
	this.group_id = groupID;
	this.question_id = questionID;
	this.answer_id = answerID;
	this.type = type;
	this.value = value;
	this.value2 = value2;
	this.error_message = errorMessage;
};*/

Constraint.prototype.isValidateScenario = function() {
	return this.scenario && this.scenario === CONSTRAINT_SCENARIO.VALIDATE;
};

Constraint.prototype.isFlowScenario = function() {
	return this.scenario && this.scenario === CONSTRAINT_SCENARIO.FLOW;
};

Constraint.prototype.isMinLengthType = function() {
	return this.type && this.type === CONSTRAINT_TYPE.MIN_LENGTH;
};

Constraint.prototype.isMaxLengthType = function() {
	return this.type && this.type === CONSTRAINT_TYPE.MAX_LENGTH;
};

Constraint.prototype.isIsSelectedType = function() {
	return this.type && this.type === CONSTRAINT_TYPE.IS_SELECTED;
};

Constraint.prototype.isNotSelectedType = function() {
	return this.type && this.type === CONSTRAINT_TYPE.NOT_SELECTED;
};

Constraint.prototype.isNotEmptyType = function() {
	return this.type && this.type === CONSTRAINT_TYPE.NOT_EMPTY;
};

Constraint.prototype.isEqualType = function() {
	return this.type && this.type === CONSTRAINT_TYPE.EQUAL;
};

Constraint.prototype.isNotEqualType = function() {
	return this.type && this.type === CONSTRAINT_TYPE.NOT_EQUAL;
};

Constraint.prototype.isGreaterThanType = function() {
	return this.type && this.type === CONSTRAINT_TYPE.GREATER_THAN;
};

Constraint.prototype.isGreaterThanOrEqType = function() {
	return this.type && this.type === CONSTRAINT_TYPE.GREATER_EQ_THAN;
};

Constraint.prototype.isLesserThanType = function() {
	return this.type && this.type === CONSTRAINT_TYPE.LESSER_THAN;
};

Constraint.prototype.isLesserThanOrEqType = function() {
	return this.type && this.type === CONSTRAINT_TYPE.LESSER_EQ_THAN;
};

Constraint.prototype.isMatchPatternType = function() {
	return this.type && this.type === CONSTRAINT_TYPE.MATCH_PATTERN;
};

Constraint.prototype.isNotMatchPatternType = function() {
	return this.type && this.type === CONSTRAINT_TYPE.NOT_MATCH_PATTERN;
};

Constraint.prototype.isMinAnswerType = function() {
	return this.type && this.type === CONSTRAINT_TYPE.MIN_ANSWER;
};

Constraint.prototype.isMaxAnswerType = function() {
	return this.type && this.type === CONSTRAINT_TYPE.MAX_ANSWER;
};

Constraint.prototype.isNumberType = function() {
	return this.type && this.type === CONSTRAINT_TYPE.IS_NUMBER;
};

Constraint.prototype.isAlphaNumType = function() {
	return this.type && this.type === CONSTRAINT_TYPE.IS_ALPHA_NUM;
};

Constraint.prototype.isAlphaType = function() {
	return this.type && this.type === CONSTRAINT_TYPE.IS_ALPHA;
};

Constraint.prototype.isBeforeTodayType = function() {
	return this.type && this.type === CONSTRAINT_TYPE.BEFORE_TODAY;
};

Constraint.prototype.isAfterTodayType = function() {
	return this.type && this.type === CONSTRAINT_TYPE.AFTER_TODAY;
};

Constraint.prototype.checkMinLength = function(toValidate) {
	var l;
	if (isAnswer(toValidate)) {
		l = toValidate.isEmpty() ? 0 : toValidate.Value.length;
		return l >= parseInt(this.value);
	} else if (isQuestion(toValidate)) {
		var selectedAnswers = toValidate.getSelectedAnswers();
		if (selectedAnswers.length === 1) {
			var answer = selectedAnswers[0];
			l = answer.isEmpty() ? 0 : answer.Value.length;
			return l >= parseInt(this.value);
		} else {
			return true;
		}
	}
	return true;
};

Constraint.prototype.checkMaxLength = function(toValidate) {
	var l;
	if (isAnswer(toValidate)) {
		l = toValidate.isEmpty() ? 0 : toValidate.Value.length;
		return l <= parseInt(this.value);
	} else if (isQuestion(toValidate)) {
		var selectedAnswers = toValidate.getSelectedAnswers();
		if (selectedAnswers.length === 1) {
			var answer = selectedAnswers[0];
			l = answer.isEmpty() ? 0 : answer.Value.length;
			return l <= parseInt(this.value);
		} else {
			return true;
		}
	}
	return true;
};

Constraint.prototype.notEmpty = function(toValidate) {
	if (isAnswer(toValidate)) {
		return !toValidate.isEmpty();
	} else if (isQuestion(toValidate)) {
		return toValidate.hasValidAnswers();
	}
	return true;
};

Constraint.prototype.equalValue = function(toValidate) {
	if (isAnswer(toValidate)) {
		return !answer.isEmpty() && answer.Value.equals(this.value);
	} else if (isQuestion(toValidate)) {
		var selectedAnswers = toValidate.getSelectedAnswers();
		if (selectedAnswers.length === 1) {
			var answer = selectedAnswers[0];
			return answer.Value.equals(this.value);
		} else {
			return false;
		}
	}
	return true;
};

Constraint.prototype.isSelected = function(toValidate) {
	return toValidate.isSelected();
};

Constraint.prototype.compareValue = function(toValidate, lesser, alsoEqual) {
	var isNumber = !isNaN(this.value);
	var toCompareInteger = Number(this.value);
	var allEmpty = true;
	if (isAnswer(toValidate)) {
		return isNumber ? toValidate.compareIntegerValue(toCompareInteger, lesser, alsoEqual) : toValidate.compareValue(this.value, lesser,
			alsoEqual);
	} else if (isQuestion(toValidate)) {
		var selectedAnswers = toValidate.getSelectedAnswers();
		if (selectedAnswers.length === 1) {
			var answer = selectedAnswers[0];
			return isNumber ? answer.compareIntegerValue(toCompareInteger, lesser, alsoEqual) : answer.compareValue(this.value, lesser,
			alsoEqual);
		} else {
			return false;
		}
	}
	return true;
};

Constraint.prototype.matchStringPatternWithModel = function(toValidate, stringPatternToValidate) {
	if (isAnswer(toValidate)) {
		return !toValidate.isEmpty() && Constraint.matchStringPatternWithStringValue(toValidate.Value, stringPatternToValidate);
	} else if (isQuestion(toValidate)) {
		var selectedAnswers = toValidate.getSelectedAnswers();
		if (selectedAnswers.length === 1) {
			var answer = selectedAnswers[0];
			return Constraint.matchStringPatternWithStringValue(answer.Value, stringPatternToValidate);;
		} else {
			return true;
		}
	}
	return true;
};

Constraint.prototype.matchConstraintPatternWithModel = function(toValidate) {
	return this.matchStringPatternWithModel(toValidate, this.value);
};

Constraint.matchStringPatternWithStringValue = function(stringToValidate, stringPatternToValidate) {
	try {
		var re = new RegExp(stringPatternToValidate);
		return re.test(stringToValidate);
	} catch (e) {
		console.log(e);
		return false;
	}
};

Constraint.compareDate = function(toValidate, before, toCompareDate) {
	//TODO when we have Classes and I can do instaceof
	/*if (toValidate.isAnswer()) {
	 Answer answer = (Answer) toValidate;
	 Date answerDate = new Date(Long.parseLong(answer.getValue()));
	 return before ? answerDate.before(toCompareDate) : answerDate.after(toCompareDate);
	 } else if (toValidate.isQuestion()) {
	 Question question = (Question) toValidate;
	 List<Answer> selectedAnswers = question.getSelectedAnswers();
	 if (selectedAnswers.size() === 1) {
	 Answer answer = selectedAnswers.get(0);
	 Date answerDate = new Date(Long.parseLong(answer.getValue()));
	 return !answer.isEmpty() && (before ? answerDate.before(toCompareDate) : answerDate.after(toCompareDate));
	 } else {
	 return false;
	 }
	 }
	 return true;*/

	//TODO TEMP
	var selectedAnswers = toValidate.getSelectedAnswers();
	if (selectedAnswers.length === 1) {
		var answer = selectedAnswers[0];

		// if it's NOT mandatory and the answer is empty return true (skip this constraint check)
		if (!toValidate.Mandatory && answer.isEmpty()) {
			return true;
		}
		return !answer.isEmpty() && (before ? answer.Value < toCompareDate : answer.Value > toCompareDate);
	} else {
		return false;
	}
};

Constraint.prototype.validate = function(toValidate) {

	if (this.isNotEmptyType()) {
		return this.notEmpty(toValidate);
	} else if (this.isMinLengthType()) {
		return this.checkMinLength(toValidate);
	} else if (this.isMaxLengthType()) {
		return this.checkMaxLength(toValidate);
	} else if (this.isIsSelectedType()) {
		return this.isSelected(toValidate);
	} else if (this.isNotSelectedType()) {
		return !this.isSelected(toValidate);
	} else if (this.isEqualType()) {
		return this.equalValue(toValidate);
	} else if (this.isNotEqualType()) {
		return !this.equalValue(toValidate);
	} else if (this.isGreaterThanType()) {
		return this.compareValue(toValidate, false, false);
	} else if (this.isGreaterThanOrEqType()) {
		return this.compareValue(toValidate, false, true);
	} else if (this.isLesserThanType()) {
		return this.compareValue(toValidate, true, false);
	} else if (this.isLesserThanOrEqType()) {
		return this.compareValue(toValidate, true, true);
	} else if (this.isMatchPatternType()) {
		return this.matchConstraintPatternWithModel(toValidate);
	} else if (this.isNotMatchPatternType()) {
		return !this.matchConstraintPatternWithModel(toValidate);
	} else if (this.isMinAnswerType()) {
		//TODO when we have Classes and I can do instaceof
		/*if (toValidate.isQuestion()) {
		 Number toCompare = Integer.valueOf(Value);
		 Question question = (Question) toValidate;
		 return question.countValidAnswer() >= toCompare.intValue();
		 }*/
		var toCompareValue = parseInt(this.value);
		return toValidate.countValidAnswer() >= toCompareValue;
	} else if (this.isMaxAnswerType()) {
		//TODO when we have Classes and I can do instaceof
		/*if (toValidate.isQuestion()) {
		 Number toCompare = Integer.valueOf(Value);
		 Question question = (Question) toValidate;
		 return Question.countValidAnswer() <= toCompare.intValue();
		 }*/
		var toCompareValue = parseInt(this.value);
		return toValidate.countValidAnswer() <= toCompareValue;
	} else if (this.isNumberType()) {
		return this.matchStringPatternWithModel(toValidate, "^-?\\d+(\\.\\d+)?$");
	} else if (this.isAlphaNumType()) {
		return this.matchStringPatternWithModel(toValidate, "^[a-zA-Z0-9]*$");
	} else if (this.isAlphaType()) {
		return this.matchStringPatternWithModel(toValidate, "^[a-zA-Z]*$");
	} else if (this.isBeforeTodayType()) {
		var today = new Date();
		today.setHours(0);
		today.setMinutes(0);
		today.setSeconds(0);
		return Constraint.compareDate(toValidate, true, today);
	} else if (this.isAfterTodayType()) {
		var today = new Date();
		today.setHours(23);
		today.setMinutes(59);
		today.setSeconds(59);
		return Constraint.compareDate(toValidate, false, today);
	}

	return true;
};

Constraint.prototype.getErrorString = function() {
	if (this.error_message && this.error_message != '')
		return this.error_message;

	if (this.isNotEmptyType()) {
		return "Cannot be empty.";
	} else if (this.isEqualType()) {
		return "Is not equal to {0}.".format(this.value);
	} else if (this.isNotEqualType()) {
		return "Need to be not equal to {0}.".format(this.value);
	} else if (this.isGreaterThanType()) {
		return "Need to be greater than {0}.".formay(this.value);
	} else if (this.isGreaterThanOrEqType()) {
		return "Need to be greater or equal than {0}.".format(this.value);
	} else if (this.isLesserThanType()) {
		return "Need to be lesser than {0}.".format(this.value);
	} else if (this.isLesserThanOrEqType()) {
		return "Need to be lesser or equal than {0}.".format(this.value);
	} else if (this.isMatchPatternType()) {
		return "The inserted value is not valid..";
	} else if (this.isNotMatchPatternType()) {
		return "The inserted value is not valid..";
	} else if (this.isMinAnswerType()) {
		return "Need to have at least {0} answers.".format(this.value);
	} else if (this.isMaxAnswerType()) {
		return "Need to have at max {0} answers".format(this.value);
	} else if (this.isNumberType()) {
		return "Need to be a valid number.";
	} else if (this.isAlphaNumType()) {
		return "Need to be alphanumeric.";
	} else if (this.isAlphaType()) {
		return "Need to be a alpha.";
	} else if (this.isBeforeTodayType()) {
		return "The date must be before today.";
	} else if (this.isAfterTodayType()) {
		return "The date must be after today.";
	}
	return "Unknown Constraint.";
};

///////////////////////////////////////////
// Validation Result
///////////////////////////////////////////

function ValidationResult() {
	this.errors = [];
	this.valid = true;
};

ValidationResult.prototype.merge = function(validationResultToMerge) {
	for( var i = 0; i < validationResultToMerge.errors.length; i++ ) {
		this.addErrorString( validationResultToMerge.errors[i] );
	}
};

ValidationResult.prototype.isValid = function() {
	return this.valid;
};

ValidationResult.prototype.hasErrors = function() {
	return this.errors.length > 0;
};

ValidationResult.prototype.getErrorCount = function() {
	return this.errors.length;
};

ValidationResult.prototype.getFirstError = function() {
	return this.errors[0];
};

ValidationResult.prototype.addError = function(constraint) {
	this.valid = false;
	this.errors.push(constraint.getErrorString());
};

ValidationResult.prototype.addErrorString = function(errorString) {
	this.valid = false;
	this.errors.push(errorString);
};

ValidationResult.prototype.getErrorHTML = function() {
	var errorHTML =  "Prima di proseguire devono essere risolti i seguenti problemi:<br>";
	errorHTML += "<ul>";
	for( var i = 0; i < this.errors.length; i++ ) {
		errorHTML += "<li>" + this.errors[i] + "</li>";
	}
	errorHTML += "</ul>";
	return errorHTML;
};