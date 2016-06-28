var PropConfig  = require('props-config');
var Environment = {get: function() {return "you env value";}};//require('<path to you env if you have one>/Environment.js');


var pathToConfiguration = ".......";

var Config = {
	_propsConfig: undefined, 
	_multiProps: {},
	
	init: function() {
		var self = this;
		var rules = {
			"db.someconf": {
				type: "boolean"
			},
			"http.port": {
				type: "number"
			},
			"http.address": {
				type: "string"
			},
			"application.production": {
				type: "boolean",
				required: true
			},
			"db.server.*": {
				type: "string",
				onDetect: self._cacheMultiProperties.bind(self)
			},
		};
		
		var sandbox = {
			env: function(variable, defaultValue) {
				return Environment.get(variable) || defaultValue; //Environment is your enviroment variables file
			}			
		};
		
		this._propsConfig = new PropConfig(pathToConfiguration, rules, sandbox);
	}, 
	
	
	get: function(key, defaultValue) {
		return this._propsConfig.get(key, defaultValue);
	},
	
	getMultiConfiguration: function(key) {
		return this._multiProps[key];
	},
	
	_cacheMultiProperties: function(key, value) {
		var index1 = key.indexOf(".");
		var index2 = key.indexOf(".", index1+1);
		
		if(index1 > -1) {
			
			var propType = key.substring(0, index1);
			
			if(this._multiProps[propType] == undefined) {
				this._multiProps[propType] = { 
					haveDefault: false,
					haveSpecific: false, 
					specific: []
				};
			}
			
			if(index2 > -1) {
				var sectionName = key.substring(index2+1);
				this._multiProps[propType].haveSpecific = true;
				
				if(this._multiProps[propType].specific.indexOf(sectionName) == -1) {
					this._multiProps[propType].specific.push(sectionName);
				}
			} else {
				this._multiProps[propType].haveDefault = true;
			}
		}
	},	
};


Config.init();

module.exports = Config;



