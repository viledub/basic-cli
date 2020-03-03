var Jasmine = require('jasmine');
var JSONReporter = require('jasmine-json-test-reporter');
var reporters = require('jasmine-reporters');
var jasmine = new Jasmine();
var { hasTag, hasString, createSpecFilter } = require('./utils.js')

jasmine.addReporter(new JSONReporter({
    file: 'jasmine-test-results.json',
    beautify: true,
    indentationLevel: 4 // used if beautify === true
}));


var junitReporter = new reporters.JUnitXmlReporter({
    savePath: '.',
    filePrefix: 'junit'
});
jasmine.addReporter(junitReporter);


let testType = "api"; // default to api
process.argv.slice(2).forEach((arg) => {
	if(arg.indexOf('type') > -1) {
		var [_,type] = arg.split("=");
		testType=type;
	}
});

jasmine.loadConfig({
  "spec_dir": "spec/api",
  "spec_files": [
    "*[sS]pec.js"
  ],
  "helpers": [
    "helpers/**/*.js"
  ],
  "stopSpecOnExpectationFailure": false,
  "random": true
});

var filterFunction = (specName) => true;  // default to always

var states = {
	"all" : (specName) => true,  // everything
	"regression" : (s) => !(hasTag(s, "new") || hasTag(s, "deprecated")), // not new or deprecated
	"new" : (s) => hasTag(s, "new"), // new only
	"smoke" : (s) => hasTag(s, "smoke"), // smoke only
	"sample1" : (s) => hasTag(s, "story", true) && hasTag(s, "new"), // new items for story 1, 12, 1*
}

if (states[testType]) {
	filterFunction = states[testType];
}

var specFilter = createSpecFilter(filterFunction);

jasmine.env.configure({ specFilter });
jasmine.execute();