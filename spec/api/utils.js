
exports.hasTag = (body, tag, anySuffix=false) => { // Match #tag or #[tag]
	const pattern = '#\\[?'+tag+'\\]?\\b';
	if (anySuffix) {
		const wildSuffixPattern = '#\\[?'+tag+'[^\\]]*\\]?\\b';
		const matchWithWild = body.match(new RegExp(wildSuffixPattern)) != null;
		return matchWithWild;
	}
	const matchExact = body.match(new RegExp(pattern)) != null;
	return matchExact
}
exports.hasString = (body, str) => { // Simple substring
	const matchPrefix = body.indexOf(str) > -1;
	return matchPrefix;
}
exports.createSpecFilter = (filterFunction) => {
	return function(spec) {
		const fullName = spec.getFullName();
		if (!filterFunction(fullName)){
			console.log("SKIPPED: "+ spec.getFullName())
			spec.pend();
		} else {
			console.log(spec.getFullName())
		}
	    return true;
	}
}
