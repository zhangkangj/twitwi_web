function update_time(time) {
	current_time = time;
	color_states(mention_json[time]);
	update_topic(topic_graph_json[time]);
	perform(update_tweet, "tweet"+time, "/tweet.json?topic=mention&time=" + time);
}

function update_tweet(json){
	$("#tweet").cycle("destroy");
	$("#tweet").empty();
	jQuery.each(json, function(i, val) {
		var name = val.name;
		var screen_name = val.screen_name;
		var id = val.id;
		var text = val.text;
		var time = val.created_at;
		$("<li>", {}).css({"width": "100%"}).append($("<div>")
			.append($("<a>", {
			    href: "http://www.twitter.com/" + screen_name,
			    text: name}).css({"color": "#333",  "font-weight": "bold"}))
			.append($("<span>",{
				text: " @" + screen_name
				}).css({"color": "#999"}))
			.append($("<div>",{
				text: new Date(time * 1000).toLocaleTimeString(),
				}).css({float: "right", "color": "#999"}))
			.append($("<br>"))
			.append($("<a>",{
				href: "http://www.twitter.com/" + screen_name + "/status/" + id,
				text: text}).css({"color": "#333"}))
			.append($("<br>")))
			.appendTo("#tweet");
	});
	$("#tweet").cycle({
		fx:     'scrollVert', 
	    prev:   '#tweet_up', 
	    next:   '#tweet_down', 
	    timeout: "2000" 
	});
	$("#tweet").cycle({ 
	    fx: "scrollDown", 
	    timeout: "2000"
	});
}

function update_detail_tweet(json){
	$("#detail_tweet").cycle("destroy");
	$("#detail_tweet").empty();
	jQuery.each(json, function(i, val) {
		var name = val.name;
		var screen_name = val.screen_name;
		var id = val.id;
		var text = val.text;
		var time = val.created_at;
		$("<li>", {}).css({"width": "100%"}).append($("<div>")
			.append($("<a>", {
			    href: "http://www.twitter.com/" + screen_name,
			    text: name}).css({"color": "#333",  "font-weight": "bold"}))
			.append($("<span>",{
				text: " @" + screen_name
				}).css({"color": "#999"}))
			.append($("<div>",{
				text: new Date(time * 1000).toLocaleTimeString(),
				}).css({float: "right", "color": "#999"}))
			.append($("<br>"))
			.append($("<a>",{
				href: "http://www.twitter.com/" + screen_name + "/status/" + id,
				text: text}).css({"color": "#333"}))
			.append($("<br>")))
			.appendTo("#detail_tweet");
		});
	$("#detail_tweet").cycle({
		fx:     'scrollVert', 
	    prev:   '#detail_tweet_up', 
	    next:   '#detail_tweet_down', 
	    timeout: "2000" 
	});
	$("#detail_tweet").cycle({ 
	    fx: "scrollDown", 
	    timeout: "2000"
	});
}


//convert epoch time in seconds into EST date string
function date(time) {
	// compensate the EST timezone offset (date strings in EST)
	return (new Date((time + 4*3600)*1000)).toDateString();
}

// "inverse" of date: converting Date object into epoch time
function undate(date) {
	// shift the time compensating for local timezone
	return date.getTime()/1000+date.getTimezoneOffset()*60-5*3600;
}

// ugly (but compact) solution for daylight DST discontinuity
function index(times, date) {
	return (times.indexOf(undate(date))+1  || times.indexOf(undate(date)-3600)+1 || times.indexOf(undate(date)+3600)+1 || null) - 1;
}

function slide_carousel(id){
	 if (id == "map_container"){
	    	$("#topic_container").attr("class", "item carousel_element");
	    	$("#map_container").attr("class", "active item carousel_element");
	    	$("#topic_menu").attr("class", "");
	    	$("#map_menu").attr("class", "active");
	    }else if (id == "topic_container"){
	    	$("#map_container").attr("class", "item carousel_element");
	    	$("#topic_container").attr("class", "active item carousel_element");
	    	$("#map_menu").attr("class", "");
	    	$("#topic_menu").attr("class", "active");
	    }
}

//global variables
var width = 1000, height = 500,  box_offset = 15;
var color = d3.scale.quantize().range(["#9E2017", "#BB4E55", "#d77176", "#e2a6a9", "F6CECE", "#CEE3F6", "#a4c6e3", "#79a5ca", "#40698B", "#0D406B"]);
var path = d3.geo.path().projection(d3.geo.albersUsa().scale(width).translate([0, 0]));
var g, c, svgns, box;
var centered_state, over_state;
var current_time;
var current_topic;
var mention_json, topic_graph_json, map_json;
var vis_left, vis_right, pack_left, pack_right;
var load_counter = 2;


$(document).ready(function() {
	// carousel
	$("#myCarousel").carousel({interval: false});
	$("#myCarousel").bind("slid", function() {
		var active_id = $(".active").filter(".carousel_element")[0].id;
	    if (active_id == "map_container"){
	    	$("#topic_menu").attr("class", "");
	    	$("#map_menu").attr("class", "active");
	    }else if (active_id == "topic_container"){
	    	$("#map_menu").attr("class", "");
	    	$("#topic_menu").attr("class", "active");
	    }
	});
	
	// initialize
	load_counter--;
	if (load_counter == 0){
		topic_graph();
		setup_map();
		setup_date_selection();	
	}
	
	$("#tweet_panel").hover(
			function(){$("#tweet").cycle("pause");},
			function(){$("#tweet").cycle("resume");}
	);
	$("#detail_tweet_panel").hover(
			function(){$("#detail_tweet").cycle("pause");},
			function(){$("#detail_tweet").cycle("resume");}
	);
	$('.black').tooltip("hide");
});

d3.json("/topic.json", function(json) {
	topic_graph_json = json;
	d3.json("/mention.json", function(json){
		mention_json = json;
		d3.json("/static/dat/us_states.json", function(json){
			map_json = json;
			load_counter--;
			if (load_counter == 0){
				topic_graph();
				setup_map();
				setup_date_selection();	
			}
		});
	});
});

google.load("visualization", "1.0", {"packages":["corechart", "annotatedtimeline"]});