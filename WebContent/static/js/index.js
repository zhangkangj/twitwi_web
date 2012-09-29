google.load('visualization', '1.0', {'packages':['corechart', 'annotatedtimeline']});

function update_time(time) {
	current_time = time;
	color_states(mention_json[time]);
	update_topic(topic_graph_json[time]);
	perform(update_tweet, 'tweet'+time, "/tweet.json?topic=mention&time=" + time);
}

function update_tweet(json){
	$('#tweets').cycle('destroy');
	$('#tweets').empty();
	jQuery.each(json, function(i, val) {
		var name = val.name;
		var screen_name = val.screen_name;
		var id = val.id;
		var text = val.text;
		var time = val.created_at;
		$('<li>', {}).css({'width': '100%'}).append($('<div>')
			.append($('<a>', {
			    href: 'http://www.twitter.com/' + screen_name,
			    text: name}).css({'color': '#333',  'font-weight': 'bold'}))
			.append($('<span>',{
				text: ' @' + screen_name
				}).css({'color': '#999'}))
			.append($('<div>',{
				text: new Date(time * 1000).toLocaleTimeString(),
				}).css({float: 'right', 'color': '#999'}))
			.append($('<br>'))
			.append($('<a>',{
				href: 'http://www.twitter.com/' + screen_name + '/status/' + id,
				text: text}).css({'color': '#333'}))
			.append($('<br>')))
			.appendTo('#tweets');
		});
	$('#tweets').cycle({ 
	    fx: 'scrollDown', 
	    timeout: '2000'
	});
}


//convert epoch time in seconds into EST date string
function date(time) {
	// compensate the EST timezone offset (date strings in EST)
	return (new Date((time + 4*3600)*1000)).toDateString();
}

// inverse of date: converting date string into epoch time
function undate(date) {
	// shift the time compensating for local timezone
	return date.getTime()/1000+date.getTimezoneOffset()*60-6*3600;
}

// ugly (but compact) solution for daylight DST discontinuity
function index(times, date) {
	return (times.indexOf(undate(date))+1  || times.indexOf(undate(date)-3600)+1 || times.indexOf(undate(date)+3600)+1 || null) - 1;
}

//global variables
var width = 1000, height = 450,  box_offset = 15;
var color = d3.scale.quantize().range(['#9E2017', '#BB4E55', '#d77176', '#e2a6a9', 'F6CECE', '#CEE3F6', '#a4c6e3', '#79a5ca', '#40698B', '#0D406B']);
var centered_state, over_state;
var path = d3.geo.path().projection(d3.geo.albersUsa().scale(width).translate([0, 0]));
var g, c, svgns, box;
var current_time;
var mention_json, topic_graph_json;
var vis_left, vis_right, pack_left, pack_right;

$(document).ready(function() {
	// carousel
	$('.carousel').carousel({interval: false});

	// initialize
	d3.json('/topic.json', function(json) {
		topic_graph_json = json;
		d3.json("/mention.json", function(json){
			mention_json = json;
			d3.json("/static/dat/us_states.json", function(json){
				topic_graph();
				setup_map(json);
				setup_date_selection();
			});
		});
	});
});