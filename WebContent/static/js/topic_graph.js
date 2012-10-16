function topic_graph() {
	var width = 900, height = 150;
	vis_left = d3.select("#topic_left").append("svg").attr("width", width)
			.attr("height", height).attr("id", "top_rect").append("g");
	vis_right = d3.select("#topic_right").append("svg").attr("width", width)
			.attr("height", height).attr("id", "bottom_rect").append("g");
}

function update_topic(json) {
	var topicArray1 = [];
	var topicJson1 = json['obama'];
	var topicArray2 = [];
	var topicJson2 = json['romney'];
	var format = d3.format(",d");
	var fill = d3.scale.category20c();
	
	// normalizing
	var sum_1 = 0, sum_2 = 0;
	for (var c in topicJson1) {
		sum_1 += topicJson1[c];
	}
	for (var c in topicJson2) {
		sum_2 += topicJson2[c];
	}
	for (var c in topicJson1) {
		if (topicJson1[c] / sum_1 < 0.15){
			topicJson1[c] = 0;
		}
	}
	for (var c in topicJson2) {
		if (topicJson2[c] / sum_2 < 0.15){
			topicJson2[c] = 0;
		}
	}
	sum_1 = 0; sum_2 = 0;
	for (var c in topicJson1) {
		sum_1 += topicJson1[c];
	}
	for (var c in topicJson2) {
		sum_2 += topicJson2[c];
	}
	for (var c in topicJson1) {
		topicArray1.push({
			"topic" : c,
			"size" : (topicJson1[c] / sum_1) * 800,
			"entity": "obama"
		});
	}
	for (var c in topicJson2) {
		topicArray2.push({
			"topic" : c,
			"size" : (topicJson2[c] / sum_2) * 800,
			"entity": "romney"
		});
	}

	topicArray1 = topicArray1.sort(sortingFunc);
	topicArray2 = topicArray2.sort(sortingFunc);
	var node_left = vis_left.selectAll("g.node").data(topicArray1);

	var width_count = 0;
	var left_enter = node_left.enter().append("g");

	node_left.attr("class", function(d) {
		return d.children ? "node" : "dem node";
	}).attr("transform", function(d) {
		val = width_count;
		width_count += d.size;
		return "translate(" + val + "," + 30 + ")";
	});
	left_enter.append("rect");
	var left_c = node_left.select("rect").attr("width", function(d) {
		return d.size;
	}).attr("height", function(d) {
		return 100;
	}).on("click", click_topic).on("mouseover", hover_topic).attr("id",
			function(d) {
				return d.children ? "dem" : "leaf";
			});
	left_c.filter(function(d) {
		return !d.children;
	}).style("fill", function(d) {
		return fill(d.topic);
	});
	left_enter.filter(function(d) {
		return !d.children;
	}).append("text");
	node_left.select("text").attr("text-anchor", "middle").attr("transform",
			function(d) {
				return "translate(" + d.size / 2 + "," + 50 + ")";
			}).text(function(d) {
		return d.topic.substring(0, d.size / 9);
	});

	node_left.exit().remove();

	var node_right = vis_right.selectAll("g.node").data(topicArray2);
	width_count = 0;
	var right_enter = node_right.enter().append("g");

	node_right.attr("class", function(d) {
		return d.children ? "node" : "dem node";
	}).attr("transform", function(d) {
		val = width_count;
		width_count += d.size;
		return "translate(" + val + "," + 0 + ")";
	});
	right_enter.append("rect");
	var right_c = node_right.select("rect").attr("width", function(d) {
		return d.size;
	}).attr("height", function(d) {
		return 100;
	}).on("click", click_topic).on("mouseover", hover_topic).attr("id",
			function(d) {
				return d.children ? "dem" : "leaf";
			});
	right_c.style("fill", function(d) {
		return fill(d.topic);
	});

	right_enter.append("text");
	node_right.select("text").attr("text-anchor", "middle").attr("transform",
			function(d) {
				return "translate(" + d.size / 2 + "," + 50 + ")";
			}).text(function(d) {
		return d.topic.substring(0, d.size / 9);
	});

	node_right.exit().remove();
}

function sortingFunc(a, b) {
	var nA = a.topic.toLowerCase();
	var nB = b.topic.toLowerCase();
	if (nA < nB)
		return -1;
	else if (nA > nB)
		return 1;
	return 0;
}

function hover_topic(d) {
	//perform(update_tweet, 'tweet' + time + d.topic, "/tweet.json?topic=" + d.topic + "&time=" + time);
	//TODO show small box
}

function click_topic(d) {
	$('#detail_name').text("Twitter mentions #" + d.topic);
	$('#detail').unbind();
	$('#detail').on('hide', function () {
		perform(update_tweet, 'tweet' + current_time + d.topic, "/tweet.json?topic=" + d.topic + "&time=" + current_time);
		$('#tweet').cycle('resume');
	});
	$('#detail').on('shown',function(){
		draw_topic_detail_chart(d);
	});
	$('#tweet').cycle('pause');
	$('#detail').modal('show');
	console.log("clicked", d.topic, d.entity);
}

function update_topic_detail_tweet(time, topic){
	perform(update_detail_tweet, 'tweet' + time + topic, "/tweet.json?topic=" + topic + "&time=" + time);
}

function draw_topic_detail_chart(d){
	var topic = d.topic;
	var data = new google.visualization.DataTable();
	data.addColumn('date', 'Date');
	data.addColumn('number', 'Obama');
	data.addColumn('number', 'Romney');
	for (time in topic_graph_json){
		var obama_count  = topic_graph_json[time]["obama"][topic];
		var romney_count = topic_graph_json[time]["romney"][topic];
		time = parseInt(time) + 46800;
		if (news_json[time] == null){
			data.addRow([new Date(time * 1000), obama_count, null, null, romney_count, null, null]);	
		} else{
			var parts = news_json[time].split(':');
			if (parts[0] == 'O'){
				data.addRow([new Date(time * 1000 + 1), obama_count, 'Obama', parts[1], romney_count, null, null]);
			} else if (parts[0] == 'R') {
				data.addRow([new Date(time * 1000 + 1), obama_count, null, null, romney_count, 'Romney', parts[1]]);
			} else {
				data.addRow([new Date(time * 1000 + 1), obama_count, parts[1], null, romney_count, null, null]);	
			}
		}
	}
    var annotatedtimeline = new google.visualization.AnnotatedTimeLine(document.getElementById('detail_chart'));
    annotatedtimeline.draw(data, {'displayAnnotations': true});
    update_topic_detail_tweet(current_time, d.topic);
}