function setup_time(){
	times = [];
	for (var time in mention_json){
		times.push(parseInt(time));
	}
	times = times.sort();
	current_time = times[times.length-1];
}

function setup_date_selection() {
	// set up slider
	$('<div>').attr('id','slider').slider({
		value: times.length-1, 
		min: 0, 
		max: times.length-1, 
		step: 1,
		animate: 500,
		create: function(event, ui) {
					$('#date').val(date(times[times.length-1])); 
					update_time(times[times.length-1]);
				},
		slide:  function(event, ui) {
					$('#date').val(date(times[ui.value]));
				},
		change: function(event, ui) {
					$('#date').val(date(times[ui.value])); 
					update_time(times[ui.value]);
					if (ui.value == 0) {
						$('#prev-day-btn').addClass('disabled');
					} else if (ui.value == times.length-1) {
						$('#next-day-btn').addClass('disabled');
					} else {
						$('#next-day-btn').removeClass('disabled');
						$('#prev-day-btn').removeClass('disabled');
					}
				}
	}).prependTo('#control');
	// set up day increment/decrement buttons
	$('<div>').insertAfter('#slider').addClass('btn-group').append(
		$('<button>').attr('id', 'prev-day-btn').addClass('btn').append('<i class="icon-chevron-left"></i>').click(function() {
			var v = $('#slider').slider('value');
			$('#slider').slider('value', Math.max(v-1, 0));
		})
	).append(
		$('<button>').attr('id', 'next-day-btn').addClass('btn').append('<i class="icon-chevron-right"></i>').click(function() {
			var v = $('#slider').slider('value');
			$('#slider').slider('value', Math.min(v+1, times.length-1));
		})
	);
	// set up datepicker
	$('#date').datepicker({
		dateFormat: 'D M dd yy',
		beforeShowDay: function(date) {
			if (index(times, date) > -1 ) {
				return [true, ''];
			}
			return [false, ''];
		},
	}).change(function(event) {
		$('#slider').slider('value', index(times, new Date($('#date').val())));
	});
}

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
			    text: name,
			    target: "_blank"}).css({"color": "#333",  "font-weight": "bold"}))
			.append($("<span>",{
				text: " @" + screen_name
				}).css({"color": "#999"}))
			.append($("<div>",{
				text: new Date(time * 1000).toLocaleTimeString(),
				}).css({float: "right", "color": "#999"}))
			.append($("<br>"))
			.append($("<a>",{
				href: "http://www.twitter.com/" + screen_name + "/status/" + id,
				text: text,
				target: "_blank"}).css({"color": "#333"}))
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
			    text: name,
			    target: "_blank"}).css({"color": "#333",  "font-weight": "bold"}))
			.append($("<span>",{
				text: " @" + screen_name
				}).css({"color": "#999"}))
			.append($("<div>",{
				text: new Date(time * 1000).toLocaleTimeString(),
				}).css({float: "right", "color": "#999"}))
			.append($("<br>"))
			.append($("<a>",{
				href: "http://www.twitter.com/" + screen_name + "/status/" + id,
				text: text,
				target: "_blank"}).css({"color": "#333"}))
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
		$("#realtime_container").attr("class", "item carousel_element");
		$("#index_container").attr("class", "item carousel_element");
		$("#map_menu").attr("class", "active");
		$("#topic_menu").attr("class", "");
		$("#realtime_menu").attr("class", "");
		$("#index_menu").attr("class", "");
		$("#control").fadeIn();
		$("#tweet_panel").fadeIn();
	} else if (id == "topic_container"){
		$("#map_container").attr("class", "item carousel_element");
		$("#topic_container").attr("class", "active item carousel_element");
		$("#realtime_container").attr("class", "item carousel_element");
		$("#index_container").attr("class", "item carousel_element");
		$("#map_menu").attr("class", "");
		$("#topic_menu").attr("class", "active");
		$("#realtime_menu").attr("class", "");
		$("#index_menu").attr("class", "");
		$("#control").fadeIn();
		$("#tweet_panel").fadeIn();
	 } else if (id == "realtime_container"){
		$("#map_container").attr("class", "item carousel_element");
		$("#topic_container").attr("class", "item carousel_element");
		$("#realtime_container").attr("class", "active item carousel_element");
		$("#index_container").attr("class", "item carousel_element");
		$("#map_menu").attr("class", "");
		$("#topic_menu").attr("class", "");
		$("#realtime_menu").attr("class", "active");
		$("#index_menu").attr("class", "");
		$("#control").fadeOut();
		$("#tweet_panel").fadeOut();
	 } else if (id == "index_container"){
		$("#map_container").attr("class", "item carousel_element");
		$("#topic_container").attr("class", "item carousel_element");
		$("#realtime_container").attr("class", "item carousel_element");
		$("#index_container").attr("class", "active item carousel_element");
		$("#map_menu").attr("class", "");
		$("#topic_menu").attr("class", "");
		$("#realtime_menu").attr("class", "");
		$("#index_menu").attr("class", "active");
		$("#control").fadeOut();
		$("#tweet_panel").fadeOut();
	 }
}

//global variables
var current_time, times;
var current_topic;
var mention_json, topic_graph_json, map_json, news_json;
var load_counter = 2;


$(document).ready(function() {
	// carousel
	$("#myCarousel").carousel({interval: false});
	$("#myCarousel").bind("slid", function() {
		var active_id = $(".active").filter(".carousel_element")[0].id;
		slide_carousel(active_id);
	});
	
	$("#tweet_panel").hover(
			function(){$("#tweet").cycle("pause");},
			function(){$("#tweet").cycle("resume");}
	);
	$("#detail_tweet_panel").hover(
			function(){$("#detail_tweet").cycle("pause");},
			function(){$("#detail_tweet").cycle("resume");}
	);
	$('.black').tooltip("hide");
	
	// initialize
	load_counter--;
	if (load_counter == 0){
		setup_time();
		setup_map();
		setup_realtime();
		setup_date_selection();
	}
});

d3.json("/news.json", function(json) {
	news_json = json;
});

d3.json("/topic.json", function(json) {
	topic_graph_json = json;
	d3.json("/mention.json", function(json){
		mention_json = json;
		d3.json("/static/dat/us_states.json", function(json){
			map_json = json;
			load_counter--;
			if (load_counter == 0){
				setup_time();
				setup_map();
				setup_realtime();
				setup_date_selection();
			}
		});
	});
});

google.load("visualization", "1.0", {"packages":["corechart", "annotatedtimeline"]});