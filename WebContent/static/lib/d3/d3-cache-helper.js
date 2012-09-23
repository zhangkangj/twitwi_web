// use HTML5 Web Storage or an object to cache
localStorage = localStorage || sessionStorage || {};
sessionStorage = sessionStorage || {};

// @param work: a function that works on k, i.e. of the form function(k) {}
// @param is_permanent: true if the data should be stored in localStorage, else in sessionStorage
function perform(work, k, url, is_permanent) {
	var s = is_permanent? localStorage : sessionStorage;
	
	if (s[k]) {
		// data is in the storage
		work(JSON.parse(s[k]));
	} else {
		// not cached, fetch the data from url
		d3.json(url, function(json) {s[k] = JSON.stringify(json); work(json);});
	}
}