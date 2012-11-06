var width = 1000, height = 500;
var box_offset = 15;
var gradient = ['#9E2017', '#BB4E55', '#d77176', '#e2a6a9', '#eecbcb', '#d2e0ed', '#a4c6e3', '#79a5ca', '#40698B', '#0D406B'];
var color = d3.scale.quantize().range(gradient);
var path = d3.geo.path().projection(d3.geo.albersUsa().scale(width).translate([0, 0]));
var g, c, svgns, box;
var centered_state, over_state;

function setup_map() {
	var svg = d3.select('#vote-map').append("svg").attr('width', width).attr('height', height);
	svg.append("rect").attr("width", width)
					  .attr("height", height)
					  .attr("class", "background")
					  .on("mouseover", hover_state);
	g = svg.append('g').attr("transform", "translate(" + width/2 + "," + height/2 + ")").append("g").attr("id", "map");	
	c = svg[0][0];
	svgns = c.namespaceURI;
	
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
				.on("mouseover", hover_state)
				.on("mousemove", move_box)
				.on('mouseout', function() {box.hide();});
	ss.append("path").attr("d", path);
	// legend
	var gradient_width=40, gradient_height=10, gradient_count=gradient.length;
	var legend = svg.append('g').attr('id', 'legend').attr('transform', 'translate('+(width/2-gradient_width*gradient_count/2)+','+(height-gradient_height-10)+')');
	legend.selectAll('rect').data(gradient).enter().append('rect').attr('class', 'gradient').attr('width', gradient_width).attr('height', gradient_height).attr('fill', function(d) { return d; }).attr('x', function(d, k) {return k*gradient_width;});
	legend.append('text').text('More Romney Votes').attr('x', -145).attr('y', 10);
	legend.append('text').text('More Obama Votes').attr('x', gradient_width*gradient_count+10).attr('y', 10);
}

function color_states(json) {
	for (state in json){
		if (state != "US"){
			var item = json[state];
			g.select("#" + state).select("path").style("fill", color(item[0]/(item[0]+item[1])));	
		}
	}
}

function hover_state(d) {
	console.log(13);
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
		var obama_count  = mention_json[d.properties.abbreviation][0];
		var romney_count = mention_json[d.properties.abbreviation][1];
		$('#obama-count').text(obama_count);
		$('#romney-count').text(romney_count);
		move_box();
		box.show();
	}
	g.selectAll("g.state").classed("hover", over_state && function(d) { return d == over_state; });
}

function move_box() {
	var m = d3.mouse(document.body);
	box.css('left', m[0]+box_offset).css('top', m[1]+box_offset);
}

var map_json, mention_json;
$(document).ready(function() {
	d3.json("/static/dat/us_states.json", function(json){
		map_json = json;
		d3.json("/ivoted.json", function(json){
			mention_json = json;
			setup_map();
			color_states(mention_json);
		});
	});
});