var obama_topic = null, romney_topic = null;
var topics = ["Economy", "Budget", "Foreign policy", "Healthcare", "Terrorism", "Immigration", "Education", "Abortion", "Same-sex marriage", "Energy"];

function update_topic(json) {
	var options = {'width':600,
				   'height':500,
				   is3D: true,
				   left:50,
				   backgroundColor:'transparent',
				   chartArea:{width:"95%",height:"95%"},
           slices: [{color: '#1f77b4'},{color: '#ff7f0e'},{color: '#2ca02c'},{color: '#d62728'},{color: '#9467bd'},{color: '#8c564b'},{color: '#e377c2'},{color: '#7f7f7f'},{color: '#bcbd22'},{color: '#17becf'}],
				   legend:{alignment:"end", textStyle: {fontSize: 12}}};
	var data_obama = [];
	for (var key in topics){
		data_obama.push([topics[key], json['obama'][topics[key]]]);
	}
	data_obama.unshift(['candidate', 'mentions']);
    var chart_obama = new google.visualization.PieChart(document.getElementById('topic_obama'));
    chart_obama.draw(google.visualization.arrayToDataTable(data_obama), options);
    google.visualization.events.addListener(chart_obama, 'select', function(){
    	var topic;
    	if (chart_obama.getSelection().length == 0) {
    		topic = obama_topic;
    	} else {
        	topic = data_obama[chart_obama.getSelection()[0].row + 1][0];
        	obama_topic = topic;
    	}
    	click_topic(topic);
    }); 
    google.visualization.events.addListener(chart_obama, 'onmouseover', function(){
    	$("#topic_obama").css("cursor", "pointer");
    }); 
    google.visualization.events.addListener(chart_obama, 'onmouseout', function(){
    	$("#topic_obama").css("cursor", "auto");
    }); 
    
	var options = {'width':415,
			   	   'height':500,
			   	   is3D: true,
			   	   backgroundColor:'transparent',
			   	   legend:null,
			   	   chartArea:{width:"85%",height:"85%"},
			   	   legend:{position:"none"}};
	var data_romney = [];
	for (var key in topics){
		data_romney.push([topics[key], json['romney'][topics[key]]]);
	}
	data_romney.unshift(['candidate', 'mentions']);
    var chart_romney = new google.visualization.PieChart(document.getElementById('topic_romney'));
    chart_romney.draw(google.visualization.arrayToDataTable(data_romney), options);	
    google.visualization.events.addListener(chart_romney, 'select', function(){
    	var topic;
    	if (chart_romney.getSelection().length == 0) {
    		topic = obama_topic;
    	} else {
    		topic = data_romney[chart_romney.getSelection()[0].row + 1][0];
    		romney_topic = topic;
    	}
    	click_topic(topic);
    }); 
    google.visualization.events.addListener(chart_romney, 'onmouseover', function(){
    	$("#topic_romney").css("cursor", "pointer");
    }); 
    google.visualization.events.addListener(chart_romney, 'onmouseout', function(){
    	$("#topic_romney").css("cursor", "auto");
    }); 
}

function sortingFunc(a, b) {
	if (a[0] < b[0]) return -1;
	else if (a[0] > b[0]) return 1;
	return 0;
}

function click_topic(topic) {
	$('#detail_name').text("Twitter mentions #" + topic);
	$('#detail').unbind();
	$('#detail').on('hide', function () {
		perform(update_tweet, 'tweet' + current_time + topic, "/tweet.json?topic=" + topic + "&time=" + current_time);
		$('#tweet').cycle('resume');
	});
	$('#detail').on('shown',function(){
		draw_topic_detail_chart(topic);
	});
	$('#tweet').cycle('pause');
	$('#detail').modal('show');
}

function update_topic_detail_tweet(time, topic){
	perform(update_detail_tweet, 'tweet' + time + topic, "/tweet.json?topic=" + topic + "&time=" + time);
}

function draw_topic_detail_chart(topic){
	var data = new google.visualization.DataTable();
	data.addColumn('date', 'Date');
	data.addColumn('number', 'Obama');
	data.addColumn('string', 'title1');
	data.addColumn('string', 'text1');
	data.addColumn('number', 'Romney');
	data.addColumn('string', 'title1');
	data.addColumn('string', 'text1');
	for (var time in topic_graph_json){
		var obama_count  = topic_graph_json[time]["obama"][topic];
		var romney_count = topic_graph_json[time]["romney"][topic];
		time = parseInt(time);
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
    google.visualization.events.addListener(annotatedtimeline, 'select', function(){
    	var time = times[annotatedtimeline.getSelection()[0].row];
    	update_topic_detail_tweet(time, topic);
    }); 
    annotatedtimeline.draw(data, {'displayAnnotations': true, 'zoomStartTime': new Date(1343793600000)});
    update_topic_detail_tweet(current_time, topic);
}
