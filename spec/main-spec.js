var path = require('path');

var PropsConfig = require("../../PropsConfig");


var pathToConfiguration = path.join(__dirname, "data", "config.poperties");

describe("Test initiliaztion ", function() {

  it("Test PropsConfig no URI", function() {
	  expect(function() {
		  new PropsConfig(undefined, {}, {});
	  }).toThrow();
  });
  
  it("Test PropsConfig invalude url type", function() {
	  expect(function() {
		  new PropsConfig({}, {}, {});
	  }).toThrow();
  });
  
  it("Test PropsConfig invalude URI position", function() {
	  expect(function() {
		  new PropsConfig("not_Exists.cong", {}, {});
	  }).toThrow();
  });
  
  it("Test PropsConfig only with file path", function() {
	  propsConfig = new PropsConfig(pathToConfiguration);
	  
	  expect(propsConfig).not.toBe(undefined);
  });

});  



describe("Test Rules ", function() {
  
  it("Test PropsConfig With not rules", function() {
	  var propsConfig = new PropsConfig(pathToConfiguration);
	  
	  expect(propsConfig).not.toBe(undefined);
	  expect(propsConfig.get('key_number')).toBe(1); 									//Test numeric value
	  expect(propsConfig.get('key_string')).toBe("some string");						//Test sring value
	  expect(propsConfig.get('key_bool_true')).toBe(true);								//Test boolean true value
	  expect(propsConfig.get('key_bool_false')).toBe(false);							//Test boolean false value
	  expect(propsConfig.get('NOT_EXISTS_KEY', "DEFAULT_VALUE")).toBe("DEFAULT_VALUE"); //Test not exist key with default value
  });

  it("Test PropsConfig type check valid", function() {
	  var rulesType = {
		  "key_number": { type: "number" },
		  "key_string": { type: "string" },
		  "key_bool_true": { type: "boolean" },
		  "key_bool_false": { type: "boolean"}				  
	  };
	  
	  var propsConfig = new PropsConfig(pathToConfiguration, rulesType);
	  
	  expect(propsConfig).not.toBe(undefined);
  });  

  it("Test PropsConfig type check invalid", function() {
	  
	  /**
	   * VALID CONFIG
	   */
	  
	  //CASE SENSETIVE	  
	  expect(function() {
		  new PropsConfig(pathToConfiguration, {"key_bool_true": { type: "boolean" }});
	  }).not.toThrow();

	  expect(function() {
		  new PropsConfig(pathToConfiguration, {"key_bool_false": { type: "boolean" }});
	  }).not.toThrow();

	  expect(function() {
		  new PropsConfig(pathToConfiguration, {"key_stringr": { type: "string" }});
	  }).not.toThrow();
	  
	  expect(function() {
		  new PropsConfig(pathToConfiguration, {"key_number": { type: "number" }});
	  }).not.toThrow();


	  //CASE INSENSETIVE
	  expect(function() {
		  new PropsConfig(pathToConfiguration, {"KEY_bool_true": { type: "boolean" }});
	  }).not.toThrow();

	  expect(function() {
		  new PropsConfig(pathToConfiguration, {"key_BOOLl_false": { type: "boolean" }});
	  }).not.toThrow();

	  expect(function() {
		  new PropsConfig(pathToConfiguration, {"key_string": { type: "string" }});
	  }).not.toThrow();
	  
	  expect(function() {
		  new PropsConfig(pathToConfiguration, {"key_number": { type: "number" }});
	  }).not.toThrow();
	  
	  
	  
	  
	  /**
	   * INVALID CONFIG
	   */
	  expect(function() {
		  new PropsConfig(pathToConfiguration, {"key_number": { type: "boolean" }});
	  }).toThrow();

	  expect(function() {
		  new PropsConfig(pathToConfiguration, {"key_number": { type: "string" }});
	  }).toThrow();
	  
	  expect(function() {
		  new PropsConfig(pathToConfiguration, {"key_string": { type: "number" }});
	  }).toThrow();

	  expect(function() {
		  new PropsConfig(pathToConfiguration, {"key_string": { type: "boolean" }});
	  }).toThrow();

	  expect(function() {
		  new PropsConfig(pathToConfiguration, {"key_bool_true": { type: "string" }});
	  }).toThrow();

	  expect(function() {
		  new PropsConfig(pathToConfiguration, {"key_bool_true": { type: "number" }});
	  }).toThrow();

	  expect(function() {
		  new PropsConfig(pathToConfiguration, {"key_bool_false": { type: "string" }});
	  }).toThrow();

	  expect(function() {
		  new PropsConfig(pathToConfiguration, {"key_bool_false": { type: "number" }});
	  }).toThrow();
	  
  });  
  
});




describe("Test Sandbox ", function() {
  
  it("Test PropsConfig With empty sandbox", function() {
	  var propsConfig = new PropsConfig(pathToConfiguration);
	  
	  expect(typeof(propsConfig.get("key_sandbox_func"))).toBe("function");
	  expect(propsConfig.get("key_sandbox_func_run")).toBe("key_sandbox_func_run");
	  
	  expect(propsConfig.get("key_sandbox_math")).toBe(2);
  });
  
  it("Test PropsConfig With empty sandbox", function() {

	  var envValues = {
		  	key1: "keyOne",
		  	key2: "keyTwo"
		  };

	  var sandbox = {
		  env: function(key) {
			  return envValues[key];
		  }
	  };
	  var propsConfig = new PropsConfig(pathToConfiguration, {}, sandbox);
	  
	  expect(typeof(propsConfig.get("key_sandbox_env_key1"))).toBe("string");
	  expect(typeof(propsConfig.get("key_sandbox_env_key2"))).toBe("string");
	  
	  expect(propsConfig.get("key_sandbox_env_key1")).toBe("keyOne");
	  expect(propsConfig.get("key_sandbox_env_key2")).toBe("keyTwo");
  });


});



