var Ajv = require('ajv');
var ajv = new Ajv();
var instance = {
	category: 1,
	maturity: 4,
	git: "aa",
	helm: "h",
	restricted: 1,
	restricted_desc: "aa"
};

var schema = {
	"type": "object",
	"properties": {
		"category": {
			"type": "number",
			"description": "The category"
		},
		"maturity": {
			"type":"number",
			"description": "The mat"
		},
		"git": {
			"type":"string",
			"description": "repo"
		},
		"helm": {
			"type":"string",
			"description": "h"
		},
		"restricted": {
			"type": "number",
			"description": "res"
		},
		"restricted_desc" : {
			"type": "string",
			"description": "resdes"
		}
	},
	"required": ["category", "maturity"],
	"allOf" : [
		{
			"if" : {
				"properties": { "category" : {"enum": [1,2]}}
			},
			"then": {
				"allOf" : [
					{
						"if": {
							"properties": { "maturity" : {"const": 2}}
						},
						"then": {
							"required": ["git"]
						}
					},
					{
						"if": {
							"properties": { "maturity" : {"const": 3}}
						},
						"then": {
							"required": ["git", "helm"]
						}
					},
					{
						"if": {
							"properties": { "maturity" : {"const": 4}}
						},
						"then": {
							"required": ["git", "helm", "restricted"]
						}
					},
					{
						"if": {
							"properties": { "restricted" : {"const": 1}}
						},
						"then": {
							"required": ["restricted_desc"]
						}
					}
				]
			}
		}
	]
};

const validate = ajv.compile(schema);
var valid = validate(instance);
console.log(validate.errors);


