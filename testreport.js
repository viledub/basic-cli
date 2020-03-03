fs = require('fs');

const Parser = require("junitxml-to-javascript");



function readSpecData(spec, suite) {
	const pattern = /#\[?([^\] ]*)\]?/gim
	const matches = [...spec.description.matchAll(pattern)]
		.filter(match => match.length > 0)
		.map(match => [match[0],match[1]])

	let descProgress = spec.description;
	let fullNameProgress = spec.fullName;
	const tags = [];
	matches.forEach(match => {
		descProgress = descProgress.replace(match[0], "");
		fullNameProgress = fullNameProgress.replace(match[0], "");
		tags.push(match[1])
	})
	// description, fullName, status, suite, tags
	return {
		...spec,
		suite,
		tags: tags,
		cleanDesc: descProgress,
		cleanFullName: fullNameProgress,
	}
}

function parseTest(testData, next) {
	const output = [];
	Object.keys(testData).forEach(suite => {
	
		testData[suite].specs
			.filter(spec => spec.status!=='pending')
			.forEach(spec => {
				const specData = readSpecData(spec, suite);
				next(specData);
				output.push(specData);
			})
	})
	return output;
}

const file_to_read = 'jasmine-test-results.json';

var resultsData = JSON.parse(fs.readFileSync(file_to_read, 'utf8'));

const o1 = parseTest(resultsData, (specData)=> {
	console.log(specData.cleanFullName, ": " , specData.status, ":", specData.tags);
});

console.log("aaa")

const file_to_read2 = 'jasmine-test-results-old.json';
var resultsData2 = JSON.parse(fs.readFileSync(file_to_read2, 'utf8'));
const o2 = parseTest(resultsData2, (specData)=> {
	console.log(specData.cleanFullName, ": " , specData.status, ":", specData.tags);
});



function missingFrom(otherArray, check){
  return function(current){
    return otherArray.filter(function(other){
      return check(current, other);
    }).length === 0;
  }
}

function fullNameMatch(left, right) {
	return left.cleanFullName === right.cleanFullName 
}


console.log("diffs1")
const only1 = o1.filter(missingFrom(o2, fullNameMatch));
only1.forEach(x=>{
	console.log(x.cleanFullName, x.status, x.exclusive = true)
})
console.log("diffs2")
const only2 = o2.filter(missingFrom(o1, fullNameMatch));
only2.forEach(x=>{
	console.log(x.cleanFullName, x.status, x.exclusive = true)
})

o1.forEach(test=> console.log(test.cleanFullName, test.tags, test.exclusive ? ' **NEW**' : ''))

function junitProcess(suiteList) {
	const flat = [];

	suiteList.forEach(suite => {
		suite.testCases.forEach(testCase => {
			flat.push(readSpecData({
				fullName: suite.name + " " + testCase.name,
				description: testCase.name,
				status: testCase.result === 'succeeded' ? 'passed' : testCase.result
			}, suite));
		})
	})
	return flat;
}
const fileName = 'junit.xml';

async function compareJunit(oldFile, newFile) {
	const p = new Parser();
	const report = await p.parseXMLFile(oldFile);
	const j3 = junitProcess(report.testsuites);
	const reportRight = await p.parseXMLFile(newFile);
	const j4 = junitProcess(reportRight.testsuites);
	const onlyj3 = j3.filter(missingFrom(j4, fullNameMatch))
	const onlyj4 = j4.filter(missingFrom(j3, fullNameMatch))
	console.log("Removed in " + newFile)
	onlyj3.forEach(x=>{
		console.log(x.cleanFullName, x.status, x.exclusive = true)
	})
	console.log("Added in " + newFile)
	onlyj4.forEach(x=>{
		console.log(x.cleanFullName, x.status, x.exclusive = true)
	})
}

console.log("hhhhh")
compareJunit(fileName, "new.xml")