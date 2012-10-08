function setup_map(json) {
	var svg = d3.select('#map_container').append("svg").attr('width', width).attr('height', height);
	svg.append("rect").attr("width", width)
					  .attr("height", height)
					  .attr("class", "background")
					  .on("click", click_state)
					  .on("mouseover", hover_state);
	g = svg.append("g").attr("transform", "translate(" + width/2 + "," + height/2 + ")").append("g").attr("id", "map");	
	c = svg[0][0];
	svgns = c.namespaceURI;
	box = $(document.createElementNS(svgns, 'g')).attr('id', 'box').attr('class', 'hover-box').hide()
		.append($(document.createElementNS(svgns, 'rect')).attr('width','160').attr('height','70').attr('rx', '3'))
		.append($(document.createElementNS(svgns, 'text')).attr('id', 'state-name').attr('class', 'hover-box-title').attr('x', '10').attr('y', '17'))
		.append($(document.createElementNS(svgns, 'text')).attr('id', 'state-info').attr('class', 'hover-box-body').attr('x', '10').attr('y', '40'));
	$(c).append(box);
	var ss = g.selectAll("g").data(json.features).enter()
			.append("g").attr("class", "state")
				.attr("id", function(d){return d.properties.abbreviation;})
				.on("click", click_state)
				.on("mouseover", hover_state)
				.on("mousemove", move_box)
				.on('mouseout', hide_box);
	ss.append("path").attr("d", path);
}

function setup_date_selection() {
	times = [];
	for (time in mention_json){
		times.push(parseInt(time));
	}
	// there is no consistent ordering on property name
	times = times.sort();
	current_time = times[times.length-1];
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
				}
	}).prependTo('#control');
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
			console.log(123);
			$('#tweets').cycle('resume');
		});
		$('#detail').on('shown',function(){
			draw_state_detail_chart (centered_state);
		});
		setTimeout(function(){
			$('#detail').modal('show');
			$('#tweets').cycle('pause');
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
		// TODO generate a info box next to the cursor
		$('#state-name').text(d.properties.name);
		// calculate stats
		var obama_count  = mention_json[current_time][d.properties.abbreviation].obama;
		var romney_count = mention_json[current_time][d.properties.abbreviation].romney;
		var total_count = obama_count + romney_count;
		if (total_count == 0) total_count = 1;
		$('#state-info').append($(document.createElementNS(svgns, 'tspan')).attr('x','10').text('Obama : ' + obama_count +', '+ (obama_count / total_count * 100).toFixed(1)+'%'))
						.append($(document.createElementNS(svgns, 'tspan')).attr('x','11').attr('y','57').text('Romney: ' + romney_count + ', '+(romney_count / total_count * 100).toFixed(1)+'%'));	
		var m = d3.mouse(c);
		box.attr('transform', 'translate('+(m[0]+box_offset)+','+(m[1]+box_offset)+')').show();
		update_state_tweet(current_time, d.properties.abbreviation);
	}
	g.selectAll("g.state").classed("hover", over_state && function(d) { return d == over_state; });
}

function draw_state_detail_chart(d){
	var state = d.properties.abbreviation;
	var data = new google.visualization.DataTable();
	data.addColumn('date', 'Date');
	data.addColumn('number', 'Obama');
	data.addColumn('number', 'Romney');
	for (time in mention_json){
		var obama_count  = mention_json[time][state].obama;
		var romney_count = mention_json[time][state].romney;
		data.addRow([new Date(time * 1000), obama_count, romney_count]);
	}
    var annotatedtimeline = new google.visualization.AnnotatedTimeLine(document.getElementById('detail_chart'));
    annotatedtimeline.draw(data, {'displayAnnotations': true});
    update_state_detail_tweet(current_time, d.properties.abbreviation);
}

function update_state_detail_tweet(time, state){
	perform(update_detail_tweet, 'tweet'+ time + state, "/tweet.json?topic=mention&time=" + time + '&state=' + state);
}

function update_state_tweet(time, state){
	perform(update_tweet, 'tweet'+ time + state, "/tweet.json?topic=mention&time=" + time + '&state=' + state);
}

function move_box() {
	var m = d3.mouse(c);
	box.attr('transform', 'translate('+(m[0]+box_offset)+','+(m[1]+box_offset)+')');
}

function hide_box() {
	box.hide();
	$('#state-info').empty();
}