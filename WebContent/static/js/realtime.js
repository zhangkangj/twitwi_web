var latest = null, isFetching = false, notificationOn = true;

function setup_realtime(){
	d3.json("/realtime_tweet.json", function(json) {
		update_realtime_tweet(json);
		start_cycle();
	});
	$("#realtime_tweet_refresh").click(function(){
		notificationOn = false;
		$("#new_tweet_notification").fadeOut(function(){
			if (!isFetching){
				isFetching = true;
				$("#load_icon").show();
				$("#realtime_tweet_refresh").addClass("disabled");
				load_realtime_tweet();
			}
		});	
	});
	setTimeout(function(){
		if (notificationOn){
			$("#new_tweet_notification").fadeIn(function(){
				setInterval(function(){
					if (notificationOn){
						$("#new_tweet_notification").fadeIn();	
					}
				}, 20000);
			});	
		}
	}, 4000);
}

function load_realtime_tweet(){
	d3.json("/realtime_tweet.json?time=" + latest, function(json) {
		if (json.length == 7) {
			$("#load_icon").hide();
			$("#realtime_tweet_refresh").removeClass("disabled");
			isFetching = false;
			$('#realtime_tweet').cycle("destroy");
			update_realtime_tweet(json);
			start_cycle();
			notificationOn = true;
		} else {
			setTimeout(function(){
				load_realtime_tweet();
			},5000);
		}
	});
}

function start_cycle(){
	$('#realtime_tweet').cycle({ 
	    fx:     'scrollVert', 
	    prev:   '#realtime_tweet_down', 
	    next:   '#realtime_tweet_up', 
	    nowrap:  1, 
	    timeout: 0,
	    startingSlide: $('#realtime_tweet').children().length - 1,
	    after: function(curr,next,opts){
	    	if (opts.slideCount <= 1) {
				$("#realtime_tweet_up").addClass("disabled");
				$("#realtime_tweet_down").addClass("disabled");
	    	} else {
	    		$("#realtime_tweet_up").removeClass("disabled");
	    		$("#realtime_tweet_down").removeClass("disabled");
	    	}
	    	if (opts.currSlide == $('#realtime_tweet').children().length - 1){
	    		$("#realtime_tweet_up").addClass("disabled");
	    	} else if (opts.currSlide == 0){
	    		$("#realtime_tweet_down").addClass("disabled");
	    	}
	    }
	});
}

function update_realtime_tweet(json){
	var tweet_panel = $('<li>');
	jQuery.each(json, function(i, val) {
		var name = val.name;
		var screen_name = val.screen_name;
		var id = val.id;
		var text = val.text;
		var time = val.created_at;
		if (time > latest) latest = time;
		var tweet = $("<div>", {}).css({"width":"800px", "height":"70px", "margin":"auto"})
					.append($("<a>", {href: "http://www.twitter.com/" + screen_name,
								      text: name,
									  target: "_blank"}).css({"color": "#333",  "font-weight": "bold"}))
					.append($("<span>",{text: " @" + screen_name}).css({"color": "#999"}))
					.append($("<div>",{text: new Date(time * 1000).toLocaleTimeString(),}).css({float: "right", "color": "#999"}))
					.append($("<br>"))
					.append($("<div>").append($("<a>", {href: "http://www.twitter.com/" + screen_name + "/status/" + id,
						 							   text: text,
						 							   target: "_blank"}).css({"color": "#333"}))
									  .css({"height":"45px"}))
					.append($("<hr>").css({"margin-top":"0px"}));
		tweet.appendTo(tweet_panel);
	});
	$("#realtime_tweet").append(tweet_panel);
}
