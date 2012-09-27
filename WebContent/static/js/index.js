 google.load('visualization', '1.0', {'packages':['corechart', 'annotatedtimeline']});

function setup_map(json) {
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
	var times = [];
	for (time in mention){
		times.push(parseInt(time));
	}
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

function update_time(time) {
	current_time = time;
	color_states(mention[time]);
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
		perform(update_tweet, 'tweet'+current_time + d.properties.abbreviation, "/tweet.json?topic=mention&time=" + current_time + '&state=' + d.properties.abbreviation);
	} else {
		centered_state = null;
		perform(update_tweet, 'tweet'+current_time, "/tweet.json?topic=mention&time=" + current_time);
	}
	g.selectAll("g.state").classed("deactive", centered_state && function(d) { return d != centered_state; });
	g.transition().duration(1000).attr("transform", "scale(" + k + ")translate(" + x + "," + y + ")").style("stroke-width", 1.5 / k + "px");
	
	if (centered_state != null) {
		$('#state_detail_name').text(d.properties.name);
		$('#state_detail').on('hide', function () {
			centered_state_state = null;
			perform(update_tweet, 'tweet'+current_time, "/tweet.json?topic=mention&time=" + current_time);
			g.selectAll("g.state").classed("deactive", true);
			var x = 0, y = 0, k = 1;
			g.transition().duration(1000).attr("transform", "scale(" + k + ")translate(" + x + "," + y + ")").style("stroke-width", 1.5 / k + "px");
		});
		setTimeout(function(){
			$('#state_detail').modal('show');
			draw_state_detail_chart (d);
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
		var obama_count  = mention[current_time][d.properties.abbreviation].obama;
		var romney_count = mention[current_time][d.properties.abbreviation].romney;
		var total_count = obama_count + romney_count;
		if (total_count == 0) total_count = 1;
		$('#state-info').append($(document.createElementNS(svgns, 'tspan')).attr('x','10').text('Obama : ' + obama_count +', '+ (obama_count / total_count * 100).toFixed(1)+'%'))
						.append($(document.createElementNS(svgns, 'tspan')).attr('x','11').attr('y','57').text('Romney: ' + romney_count + ', '+(romney_count / total_count * 100).toFixed(1)+'%'));	
		var m = d3.mouse(c);
		box.attr('transform', 'translate('+(m[0]+box_offset)+','+(m[1]+box_offset)+')').show();
		perform(update_tweet, 'tweet'+current_time + d.properties.abbreviation, "/tweet.json?topic=mention&time=" + current_time + '&state=' + d.properties.abbreviation);
	}
	g.selectAll("g.state").classed("hover", over_state && function(d) { return d == over_state; });
}

function draw_state_detail_chart (d){
	var state = d.properties.abbreviation;
	var data = new google.visualization.DataTable();
	data.addColumn('date', 'Date');
	data.addColumn('number', 'Obama');
	data.addColumn('number', 'Romney');
	for (time in mention){
		var obama_count  = mention[time][state].obama;
		var romney_count = mention[time][state].romney;
		data.addRow([new Date(time * 1000), obama_count, romney_count]);
	}
    // Set chart options
    var options = {'width':300, 'height':300};
    // Instantiate and draw our chart, passing in some options.
    console.log($('#state_detail_chart').width());
    var annotatedtimeline = new google.visualization.AnnotatedTimeLine(document.getElementById('state_detail_chart'));
    annotatedtimeline.draw(annotatedtimeline, options, "800px", "600px");
}

function move_box() {
	var m = d3.mouse(c);
	box.attr('transform', 'translate('+(m[0]+box_offset)+','+(m[1]+box_offset)+')');
}

function hide_box() {
	box.hide();
	$('#state-info').empty();
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
var width = 1000, height = 500,  box_offset = 15;
var color = d3.scale.quantize().range(['#9E2017', '#BB4E55', '#d77176', '#e2a6a9', '#FADCA5', '#a4c6e3', '#79a5ca', '#40698B', '#0D406B']);
var centered_state, over_state;
var path = d3.geo.path().projection(d3.geo.albersUsa().scale(width).translate([0, 0]));
var g, c, svgns, box;
var current_time;
var mention, topic;

$(document).ready(function() {
	// carousel
	$('.carousel').carousel({interval: false});
	  
	// initialize map
	d3.json("/mention.json", function(json){
		mention = json;
		d3.json("/static/dat/us_states.json", function(json){
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
			setup_map(json);
			setup_date_selection();
		});
	});
			

	
	// initialize topic graph
	var node,link,root1,root2;
	var force = d3.layout.force().on("tick", tick).charge(function(d) { return -200; }).linkDistance(function(d) { return  120; }).gravity(0.005).size([width, height - 160]);
	var vis = d3.select("#topic_container").append("svg:svg").attr("width", width).attr("height", height);

	d3.json('/topic.json', function(json) {
	    var keys = [];
	    for (var key in json) {
	      keys.push(key);
	    }
	    var mostRecent = keys[keys.length-1];
	    var topicArray1 = [];
	    var topicJson1 = json[mostRecent]['obama'];
	    var topicArray2 = [];
	    var topicJson2 = json[mostRecent]['romney'];
	
	    for (var c in topicJson1) {
	      topicArray1.push({"topic": c, "count": topicJson1[c]});
	    }
	    for (var c in topicJson2) {
	      topicArray2.push({"topic": c, "count": topicJson2[c]});
	    }
	    root1 = {"name": "obama" , "children": topicArray1};
	    root2 = {"name": "romney", "children": topicArray2};
	    root1.fixed = true;
	    root2.fixed = true;
	    root1.x = width / 2 - 150;
	    root1.y = height / 2 - 80;
	    root2.x = width / 2 + 150;
	    root2.y = height / 2 - 80;
	    update();
	});

	function update() {
		var nodes = flatten(root1).concat(flatten(root2)),
	    links = d3.layout.tree().links(nodes);
		// Restart the force layout.
		force.nodes(nodes).links(links).start();

		// Update the links…
		link = vis.selectAll("line.link").data(links, function(d) { return d.target.id; });
		// Enter any new links.
		link.enter().insert("svg:line", ".node").attr("class", "link").attr("x1", function(d) { return d.source.x; })
	      	.attr("y1", function(d) { return d.source.y; })
	      	.attr("x2", function(d) { return d.target.x; })
	      	.attr("y2", function(d) { return d.target.y; });

		// Exit any old links.
		link.exit().remove();

		// Update the nodes…
		node = vis.selectAll("circle.node").data(nodes, function(d) { return d.id; }).style("fill", color);
		node.transition().attr("r", function(d) { return d.children ? 50 : Math.sqrt(d.count);});

		// for displaying text
		var x = []; var y = []; var name = [];
		// Enter any new nodes.
		node.enter().append("svg:circle")
    	.attr("class", "node")
    	.attr("cx", function(d) { if(d.name) {x.push(d.x); y.push(d.y); name.push(d.name);} return d.x; })
    	.attr("cy", function(d) { return d.y; })
    	.attr("r", function(d) { return d.children ? 50 : Math.sqrt(d.count); })
    	.style("fill", color)
    	.on("click", topicClick);

	    for (var i = 0; i < x.length; i++) {
	      vis.append("text")
	        .attr("text-anchor", "middle")
	        .attr("dy", ".3em")
	        .attr("x", function(d) {return x[i];})
	        .attr("y", function(d) {return y[i];})
	        .text(function(d) { return name[i];});
	    }
	    //Exit any old nodes.
	    node.exit().remove();
	}

	function tick() {
		link.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });
		node.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });
	}


	  function color(d) {
	      return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
	  }

	  // Toggle children on click.
	  function topicClick(d) {
		  if (d.children) {
			  d._children = d.children;
			  d.children = null;
		  } else {
			  d.children = d._children;
			  d._children = null;
		  };
	    update();
	  }

	  function flatten(root) {
	      var nodes = [], i = 0;
	      function recurse(node) {
	    	  if (node.children) node.count = node.children.reduce(function(p, v) { return p + recurse(v); }, 0);
	    	  if (!node.id) node.id = ++i;
	    	  nodes.push(node);
	    	  return node.count;
	      }
	      root.count = recurse(root);
	      return nodes;
	  }
});