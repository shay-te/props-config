# What is props-config

Easy way to convert properties files into configuration files.
if you prefer to give your users a config file based on properties.
you can do that easily with props-config.

The basic idea of props-config, is to make sure that the configuration file is **SAFE TO USE**, and the user configured your application with the mandatory required properties, 
and with the properties correct types.


# So, What do i get ?

* Get all properties values by their true type ('true'/'false' will be a boolean , '11' will be a number)
* Support javascript function and your specific function (for example get value from environment file ) 
* Catch an event when a specified rule have been read
* Mark a specific key/rule as mandatory
* Support for rules using REGEX


# How dose it work ?

Simple, you give props-config 3 parameters

1. ```filePath``` the location of the configuration file (at this point all )
2. ```rules``` set of pre defined rules, to will verify the value type, validate if a property is mandatory (required) 
3. ```sandbox``` props-config uses '[vm](https://nodejs.org/api/vm.html)' to determinate the props value, you can set functions in the sandbox, for example your environment object 


# The rules of a Rule 

Rule is a simple JSON object that have only 3 options
```javascript
var rules = [
	"i.am.the.properties.key.*" {//Will match an exact string or a regular expression 
		type: "string"/"number"/"boolean", //This will make sure that if a value was defined, it was with the requested type
		required: true //Mark this field as a mandatory field
		onDetect: fooAFunction //Call this function on this rule detection. if returned false, means an invalid config file
	}
];
```


# Example 

(you can download this example under the example folder)

Lets call you configuration file myProduct.conf

and in that file, Your configuration file will probably look something like this : 

```
# i am a remark


# Production
# ~~~~~
# Set application for development mode, or production mode
application.production=false

# Server configuration
# ~~~~~
# If you need to change the HTTP port
http.port=3000

# Server address
# ~~~~~
# Will bind to your ..
http.address=127.0.0.1

#db main configuration
# ~~~~~ 
#db.server.main=mysql
#db.host.main=localhost
#db.port.main=3306
#db.database.main=dbname
#db.user.main=dbuser
#db.password.main=dbpass

#db some_connection configuration
# ~~~~~ 
#db.server.some_connection=mysql
#db.host.some_connection=localhost
#db.port.some_connection=3306
#db.database.some_connection=dbname
#db.user.some_connection=dbuser
#db.password.some_connection=dbpass

```

Define the rules that matched your configuration file, and pass the 'myProduct.conf' path, and you are Done.

now you will have a **SAFE TO USER** get function, to get any value from the configuration file 

(this is a more complex example that also handle group of values. and a sandbox)

 ```javascript
  
var PropConfig  = require('props-config');
var Environment = {get: function() {return "you env value";}};//require('<path to you env if you have one>/Environment.js');

var pathToConfiguration = "yada-yada-path/myProduct.conf";

//Define you config module 
var Config = {
	_propsConfig: undefined, 
	_multiProps: {},
	
	init: function() {
		var self = this;
		
		//Define the rules, The rules object key will match the property key 
		var rules = {
			"http.port": {
				type: "number" //Validate this property have only a number type, other wise you will get and error
			},
			"http.address": {
				type: "string" // validate this key values is a string
			},
			"application.production": {
				type: "boolean", //validate this key value is a boolean
				required: true //Mark this field as a mandatory fiels
			},
			"db.server.*": {
				type: "string",
				onDetect: self._cacheMultiProperties.bind(self) //An event notifying when use defined some property
			},
		};
		
		//props-config uses 
		var sandbox = {
			env: function(variable, defaultValue) {
				return Environment.get(variable) || defaultValue; //Environment is your environment object
			}, 
			customMethod: function(variable, defaultValue) {
				return //some manipulation 
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
		/**
		 * This is the event called from a match on the Rule 'db.server.*'
		 * we will pull the group key from the rule
		 * and cache what group are avilable in that file 
		 */
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
		
		return true;
	},	
};


Config.init();

module.exports = Config;
  ```
  
# Tests 
(wip)

# TODO 
Support case insensitive