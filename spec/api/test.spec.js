describe("suite 1", ()=>{
	it("some new test #new", () => {
		console.log("I am a new test")
	});

	it("some story  #new #[story12345]", () => {
		console.log("I am a story12345 test")
	});
	it("some other test aout a new story #new #[story1]", () => {
		console.log("I am a story1 test")
	});

	it("some test about another story #new #[story2]", () => {
		console.log("I am a story2 test")
	});
	it("test about new story #new #story54321", () => {
		console.log("I am a story5 test")
	});

	it("some smoke test added recently #new #[smoke]", () => {
		console.log("I am a new smoke test")
	});

	it("some old test #deprecated", () => {
		console.log("I am a deprecated test")
	});

	it("something that should work", () => {
		console.log("I am a regular regression test")
		expect("a").toEqual("a", "well")
	});
});
describe("suite 77", ()=>{
	it("other thing entirely", () => {
		console.log("I am a regular regression test")
		fail('dunno');
	});
	describe("suite 77", ()=>{
		it("a nested test", () => {
			console.log("I am a nested regular regression test")
		});	
	});
	it("something that should also work", () => {
		console.log("I am a regular regression test")
	});
});