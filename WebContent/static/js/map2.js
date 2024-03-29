var width = 1000, height = 500;
var box_offset = 15;
var gradient = ['#9E2017', '#BB4E55', '#d77176', '#e2a6a9', '#eecbcb', '#d2e0ed', '#a4c6e3', '#79a5ca', '#40698B', '#0D406B'];
var color = d3.scale.quantize().range(gradient);
var path = d3.geo.path().projection(d3.geo.albersUsa().scale(width).translate([0, 0]));
var g, c, svgns, box;
var centered_state, over_state;

function setup_map() {
	var svg = d3.select('#map_container').append("svg").attr('width', width).attr('height', height);
	svg.append("rect").attr("width", width)
					  .attr("height", height)
					  .attr("class", "background")
					  .on("click", click_state)
					  .on("mouseover", hover_state);
	g = svg.append('g').attr("transform", "translate(" + width/2 + "," + height/2 + ")").append("g").attr("id", "map");	
	c = svg[0][0];
	svgns = c.namespaceURI;
	/*
	box = $(document.createElementNS(svgns, 'g')).attr('id', 'box').attr('class', 'hover-box').hide()
		.append($(document.createElementNS(svgns, 'rect')).attr('width','160').attr('height','70').attr('rx', '3'))
		.append($(document.createElementNS(svgns, 'text')).attr('id', 'state-name').attr('class', 'hover-box-title').attr('x', '10').attr('y', '17'))
		.append($(document.createElementNS(svgns, 'text')).attr('id', 'state-info').attr('class', 'hover-box-body').attr('x', '10').attr('y', '40'));
	*/
	box = $('<div>').attr('id', 'map-tooltip').attr('class', 'hover-box')
		.append($('<div>').attr('id', 'state-name'))
		.append($('<div>').attr('class', 'candidate-row')
			.html('Obama: <span id="obama-count"></span> mentions'))
		.append($('<div>').attr('class', 'candidate-row')
			.html('Romney: <span id="romney-count"></span> mentions'))
		.hide();
		
	$(document).ready(function(){
		$(document.body).append(box);
	});
	
	var ss = g.selectAll("g").data(map_json.features).enter()
				.append("g").attr("class", "state")
				.attr("id", function(d){return d.properties.abbreviation;})
				.on("click", click_state)
				.on("mouseover", hover_state)
				.on("mousemove", move_box)
				.on('mouseout', function() {box.hide();});
	ss.append("path").attr("d", path);
	// legend
	var gradient_width=40, gradient_height=10, gradient_count=gradient.length;
	var legend = svg.append('g').attr('id', 'legend').attr('transform', 'translate('+(width/2-gradient_width*gradient_count/2)+','+(height-gradient_height-10)+')');
	legend.selectAll('rect').data(gradient).enter().append('rect').attr('class', 'gradient').attr('width', gradient_width).attr('height', gradient_height).attr('fill', function(d) { return d; }).attr('x', function(d, k) {return k*gradient_width;});
	legend.append('text').text('Mehr Romney Erwähnungen').attr('x', -185).attr('y', 10);
	legend.append('text').text('Mehr Obama Erwähnungen').attr('x', gradient_width*gradient_count+10).attr('y', 10);
}

function color_states(json) {
	for (state in json){
		var item = json[state];
		g.select("#" + state).select("path").style("fill", color(item.obama/(item.obama+item.romney)));
	}
}

function click_state(d) {
	var x = 0, y = 0, k = 1;
	if (d && centered_state != d) {
		var centroid = path.centroid(d);
		x = -centroid[0];
		y = -centroid[1];
		// zoom level depends on the size of the state, make an exception for Hawaii (small area but large span)
		if (d.properties.name == "Hawaii") {
			k = 4;
		} else {
			k = 200*Math.sqrt(1/(path.area(d) + 20000/path.area(d)));
		}
		centered_state = d;
		update_state_tweet(current_time, d.properties.abbreviation);
	} else {
		centered_state = null;
		perform(update_tweet, 'tweet'+current_time, "/tweet.json?topic=mention&time=" + current_time);
	}
	g.selectAll("g.state").classed("deactive", centered_state && function(d) { return d != centered_state; });
	g.transition().duration(1000).attr("transform", "scale(" + k + ")translate(" + x + "," + y + ")").style("stroke-width", 1.5 / k + "px");
	
	if (centered_state != null) {
		$('#detail_name').text("Twitter mentions @" + d.properties.name);
		$('#detail').unbind();
		$('#detail').on('hide', function () {
			centered_state_state = null;
			perform(update_tweet, 'tweet'+current_time, "/tweet.json?topic=mention&time=" + current_time);
			g.selectAll("g.state").classed("deactive", true);
			var x = 0, y = 0, k = 1;
			g.transition().duration(1000).attr("transform", "scale(" + k + ")translate(" + x + "," + y + ")").style("stroke-width", 1.5 / k + "px");
			$('#tweet').cycle('resume');
		});
		$('#detail').on('shown',function(){
			draw_state_detail_chart (centered_state);
		});
		setTimeout(function(){
			$('#detail').modal('show');
			$('#tweet').cycle('pause');
		}, 200);
	}
}

function hover_state(d) {
	over_state = null;
	if (d) {
		over_state = d;
		// switch place to be drawn on top
		var region = g.select('#'+d.properties.abbreviation)[0][0];
		region.style.cursor = 'hand';
		$(region).parent().append(region);
		// show a hover box next to the cursor
		$('#state-name').text(d.properties.name);
		// calculate stats
		var obama_count  = mention_json[current_time][d.properties.abbreviation].obama;
		var romney_count = mention_json[current_time][d.properties.abbreviation].romney;
		$('#obama-count').text(obama_count);
		$('#romney-count').text(romney_count);
		move_box();
		box.show();
		//update_state_tweet(current_time, d.properties.abbreviation);
	}
	g.selectAll("g.state").classed("hover", over_state && function(d) { return d == over_state; });
}

function draw_state_detail_chart(d){
	var state = d.properties.abbreviation;
	var data = new google.visualization.DataTable();
	data.addColumn('date', 'Date');
	data.addColumn('number', 'Obama');
	data.addColumn('string', 'title1');
	data.addColumn('string', 'text1');
	data.addColumn('number', 'Romney');
	data.addColumn('string', 'title1');
	data.addColumn('string', 'text1');
	for (var i in times){
		var time = times[i];
		var obama_count  = mention_json[time][state].obama;
		var romney_count = mention_json[time][state].romney;
		time = parseInt(time);
		if (news_json[time] == null){
			data.addRow([new Date(time * 1000), obama_count, null, null, romney_count, null, null]);	
		} else{
			var parts = news_json[time].split(':');
			if (parts[0] == 'O'){
				data.addRow([new Date(time * 1000), obama_count, 'Obama', parts[1], romney_count, null, null]);
			} else if (parts[0] == 'R') {
				data.addRow([new Date(time * 1000), obama_count, null, null, romney_count, 'Romney', parts[1]]);
			} else {
				data.addRow([new Date(time * 1000), obama_count, parts[1], null, romney_count, null, null]);	
			}
		}
	}
    var annotatedtimeline = new google.visualization.AnnotatedTimeLine(document.getElementById('detail_chart'));
    google.visualization.events.addListener(annotatedtimeline, 'select', function(){
    	var time = times[annotatedtimeline.getSelection()[0].row];
    	update_state_detail_tweet(time, state);
    }); 
    annotatedtimeline.draw(data, {'displayAnnotations': true, 'zoomStartTime': new Date(1343793600000)});
    update_state_detail_tweet(current_time, state);
}

function update_state_detail_tweet(time, state){
	perform(update_detail_tweet, 'tweet'+ time + state, "/tweet.json?topic=mention&time=" + time + '&state=' + state);
}

function update_state_tweet(time, state){
	perform(update_tweet, 'tweet'+ time + state, "/tweet.json?topic=mention&time=" + time + '&state=' + state);
}

function move_box() {
	var m = d3.mouse(document.body);
	box.css('left', m[0]+box_offset).css('top', m[1]+box_offset);
}