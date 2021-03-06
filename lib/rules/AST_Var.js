/**
 * <p>Copyright (c) 2009-2013 by Appcelerator, Inc. All Rights Reserved.
 * Please see the LICENSE file for information about licensing.</p>
 *
 * Variable initializations. Note that variable declarations are handled when entering a context, NOT when the rule is
 * processed.
 *
 * @module rules/AST_Var
 * @see ECMA-262 Spec Chapter 12.2
 */

/**
 * @event module:rules/AST_Var.rule
 * @property {string} ruleName The string 'AST_Var'
 * @property {module:AST.node} ast The AST node that is an instance of this rule
 * @property {string} file The file that the rule begins on.
 * @property {number} line The line of the file where the rule begins on.
 * @property {number} column The column of the file where the rule begins on.
 * @property {boolean} processingComplete Indicates whether the rule has been processed yet or not. This can be used to
 *		determine if this is the pre-evalutation event or the post-evaluation event.
 * @property {Array.<Object>} initializations The variables that were initialized. If a variable did not have an
 *		initializer, then it is not included in the array. Each entry in the array contains two properties: reference and
 *		value. Only available post-evaluation.
 * @property {module:base.ReferenceType} initializations.reference The reference being initialized. Only available post-evaluation.
 * @property {module:base.BaseType} initializations.value The value that the reference was initialized to. Only available post-evaluation.
 */

/**
 * <p>Copyright (c) 2009-2013 by Appcelerator, Inc. All Rights Reserved.
 * Please see the LICENSE file for information about licensing.</p>
 *
 * Constant initializations. Note that variable declarations are handled when entering a context, NOT when the rule is
 * processed.
 *
 * @module rules/AST_Const
 * @see ECMA-262 Spec Chapter 12.2
 */

/**
 * @event module:rules/AST_Const.rule
 * @property {string} ruleName The string 'AST_Const'
 * @property {module:AST.node} ast The AST node that is an instance of this rule
 * @property {string} file The file that the rule begins on.
 * @property {number} line The line of the file where the rule begins on.
 * @property {number} column The column of the file where the rule begins on.
 * @property {boolean} processingComplete Indicates whether the rule has been processed yet or not. This can be used to
 *		determine if this is the pre-evalutation event or the post-evaluation event.
 * @property {Array.<Object>} initializations The variables that were initialized. If a variable did not have an
 *		initializer, then it is not included in the array. Each entry in the array contains two properties: reference and
 *		value. Only available post-evaluation.
 * @property {module:base.ReferenceType} initializations.reference The reference being initialized. Only available post-evaluation.
 * @property {module:base.BaseType} initializations.value The value that the reference was initialized to. Only available post-evaluation.
 */

var AST = require('../AST'),
	RuleProcessor = require('../RuleProcessor'),
	Base = require('../Base');

function registerRule(ruleType) {

	AST.registerRuleProcessor(ruleType, function processRule() {

		RuleProcessor.preProcess(this);

		var children = this.definitions,
			name,
			i, len,
			context = Base.getCurrentContext(),
			reference,
			value,
			initializations = [],
			result = ['normal', undefined, undefined];

		RuleProcessor.fireRuleEvent(this, {}, false);
		RuleProcessor.logRule(ruleType);

		for (i = 0, len = children.length; i < len; i++) {
			name = children[i].name.name;
			Base.setVisited(children[i]);
			Base.setVisited(children[i].name);

			// Make sure the identifier is not a reserved word
			if (~['break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else',
					'enum', 'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof',
					'new', 'null', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void',
					'while', 'with '].indexOf(name) || (context.strict && ~['implements', 'interface', 'let',
					'package', 'private', 'protected', 'public', 'static', 'yield', 'eval', 'arguments'].indexOf(name))) {
				Base.throwNativeException('SyntaxError', 'Invalid identifier name ' + name);
			}

			// Ininitialize the variable if it has an initializer
			if (children[i].value) {
				reference = Base.getIdentifierReference(context.lexicalEnvironment, name, context.strict);

				value = Base.getValue(children[i].value.processRule());
				if (Base.type(value) === 'Unknown') {
					children[i].value._unknown = true;
				}
				Base.putValue(reference, value);

				initializations.push({
					reference: reference,
					value: value
				});
			}
		}

		RuleProcessor.fireRuleEvent(this, {
			initializations: initializations
		}, true);

		RuleProcessor.postProcess(this);

		return result;
	});
}
registerRule('AST_Var');
registerRule('AST_Const');
