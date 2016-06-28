var propsReader    = require('properties-reader');
var vm             = require('vm');

var PropsConfig = function(filePath, propRules, sandbox) {
	
	if(filePath == undefined && (typeof filePath) != "string") {
		throw new Error("filepath is an invalid property, must be a string ");
	}
	
	propRules = propRules || {};
	sandbox   = sandbox   || {};
	
	
	this.properties = {};
	
	this._init = function() {
		var propertiesObj = propsReader(filePath);
		
		var allProperties = propertiesObj.getAllProperties();
	
		var scriptString = "'use strict';" +  
						   "var result = ";
		
		
		/**
		 * Cache all require rules
		 */
		var requieredKeys = []; 
		for(var ruleKey in propRules) {
			var rule = propRules[ruleKey];
			if(rule['required'] === true) {
				requieredKeys.push(ruleKey);
			}
		}
		
		/**
		 * Loop all properties
		 */
		for(var propsKey in allProperties) {
			var oldValue = allProperties[propsKey];
			var newValue = undefined;
			
			
			if(oldValue == undefined || oldValue === "") {
				/**
				 * In case value is undefined or empty say the new value is string
				 * No need to pull the correct type from vm
				 */
				newValue = "";
				
			} else {
				/**
				 * GET THE CORRECT VARIABLE BY TYPE 'false'/'true' will be
				 * converted to false/true '100' will be converted to 100
				 */
				var context = new vm.createContext(sandbox);
				try{
					// Primitive OR sandbox function OR javascript exprection
					var script = new vm.Script(scriptString + oldValue + ";");
					script.runInContext(context);
				} catch(e) {
					// String
					var script = new vm.Script(scriptString + "\"" + oldValue + "\"" + ";");
					script.runInContext(context);
				}
				
				newValue = sandbox["result"];
			}
	

			//Fetch props rule by key string
			var propsValidate = propRules[propsKey];
			
			
			if(!propsValidate) {
				/**
				 * Case key not found by string means it could be an regex
				 * run on all rules and find the maching one
				 */
				for(var validateKey in propRules) {
					if(propsKey.match(validateKey))  {
						propsValidate = propRules[validateKey];
						break;
					}
				}
			}
			
			if(propsValidate) {
				/**
				 * Validate the rule type
				 */
				var type = typeof(newValue);
				if(type != propsValidate.type) {
					throw new Error("Config file contain invalid value for [" + propsKey + "], Expected:[" + propsValidate.type + "], Got:[" + type + "]");
				}

				/**
				 * Validate is the rule is required , update and remove from the required list 
				 */
				if(propsValidate['required']) {
					for(var requireIndex in requieredKeys) {
						if(propsKey.match(requieredKeys[requireIndex]))  {
							break;
						}
					}
					requieredKeys.splice(requireIndex, 1);
				}
				
				
				if(propsValidate['onDetect']) {
					propsValidate.onDetect(propsKey, newValue);
				}
			}
			
			
			/**
			 * All passed, update the prop
			 */
			this.properties[propsKey] = newValue;
	
	
		}
	
		if(requieredKeys.length > 0) {
			var missingKeys = requieredKeys.join(", ");
			throw new Error("Config file is missing requiered fields [" + missingKeys + "]");
		}
	
	};
	
	this.get = function(key, defaultValue) {
		return this.properties[key] || defaultValue;
	};	
	
	this._init();
	
};

module.exports = PropsConfig;