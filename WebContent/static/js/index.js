$(document).ready(function() {
	var width = 1000, height = 600, centered = false, over = true;
	var svg = d3.select('#map_container').append("svg").attr('width', width).attr('height', height);
	svg.append("rect").attr("width", width).attr("height", height).attr("class", "background").on("click", click).on("mouseover", hover);
	var path = d3.geo.path().projection(d3.geo.albersUsa().scale(width).translate([0, 0]));
	var g = svg.append("g").attr("transform", "translate(" + width/2 + "," + height/2 + ")").append("g").attr("id", "map");
	// set up the map
	d3.json("/static/dat/us_states.json", function(json) {
		var ss = g.selectAll("g").data(json.features).enter().append("g").attr("class", "state").attr("id", function(d){return d.properties.abbreviation;}).on("click", click).on("mouseover", hover);
		ss.append("path").attr("d", path);
		//ss.append("text").attr("x", function(d){return path.centroid(d)[0];}).attr("y", function(d){return path.centroid(d)[1];}).attr("dx", "0.35em").style("fill", "white").attr("text-anchor", "middle").text(function(d){return String(d.properties.name)});
		// set up date selector
		d3.json("/static/dat/times.json", function(json) {
			var times = json.times.reverse();
			var ts = d3.select("#page").append("div").append("select");
			// compensate the EST timezone offset
			ts.selectAll("option").data(times).enter().append("option").attr("value", String).text(function(d) {return (new Date((d + 4*3600)*1000)).toDateString();});
			// initialize with the lastest data
			update_count(times[0]);
			// register listener to date selector
			ts.on("change", function() {return update_count(this.value);});
		});
	});
	
	function update_count(time) {
		var count_url = "/count?time=" + time;
		// set up the count after date selection
		d3.json(count_url, function(json) {
			var color = d3.scale.quantize().range(["#9E2017", "#BB4E55", "#FADCA5", "#40698B", "#0D406B"]);
			// TODO change count.json's key to state abbreviations
			for (var i=0; i<json.data.length; i++) {
				var item = json.data[i];
				var temp = item.obama/(item.obama+item.romney);
				if (temp > 0.5) temp = 0.5 + Math.sqrt((temp - 0.5)*2)/2;
				else temp = 0.5 - Math.sqrt((0.5 - temp)*2)/2;
				g.select("#"+item.state).select("path").style("fill",color(temp));
				//append("svg:title").text(item.state+": Obama: "+d3.round(item.obama/(item.obama+item.romney)*100)+"%, Romney: "+d3.round(item.romney/(item.obama+item.romney)*100)+"%");
			}
		});
	}

	function click(d) {
		var x = 0, y = 0, k = 1;
		if (d && centered != d) {
			var centroid = path.centroid(d);
			x = -centroid[0];
			y = -centroid[1];
			// scaling depends on the size of the state
			k = 200*Math.sqrt(1/(path.area(d) + 20000/path.area(d)));
			centered = d;
		} else {
			centered = null;
		}
		g.selectAll("g.state").classed("deactive", centered && function(d) { return d != centered; });
		g.transition().duration(1000).attr("transform", "scale(" + k + ")translate(" + x + "," + y + ")").style("stroke-width", 1.5 / k + "px");
	}

	function hover(d) {
		over = null;
		if (d) {
			over = d;
			var region = g.select("#"+d.properties.abbreviation)[0][0];
			region.parentNode.appendChild(region);
		}
		g.selectAll("g.state").classed("hover", over && function(d) { return d == over; });
	}

  // carousel
  $('.carousel').carousel({
    interval: false
  })

  // topic graph
	var w = 1000,
	    h = 600,
	    node,
	    link,
	    root1,
      root2;
	var force = d3.layout.force()
	    .on("tick", tick)
	    .charge(function(d) { return -200; })
	    .linkDistance(function(d) { return  120; })
      .gravity(0.005)
	    .size([w, h - 160]);

	var vis = d3.select("#topic_container").append("svg:svg")
	    .attr("width", w)
	    .attr("height", h);

	d3.json('/topic', function(json) {
    var keys = [];
    for (var key in json) {
      keys.push(key);
    }
    var mostRecent = keys[keys.length-1];
    // convert json
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
	  root1.x = w / 2 - 150;
	  root1.y = h / 2 - 80;
    root2.x = w / 2 + 150;
    root2.y = h / 2 - 80;
    update();
	});

	function update() {
	  var nodes = flatten(root1).concat(flatten(root2)),
	      links = d3.layout.tree().links(nodes);
	  // Restart the force layout.
	  force
	      .nodes(nodes)
	      .links(links)
	      .start();

	  // Update the links…
	  link = vis.selectAll("line.link")
	      .data(links, function(d) { return d.target.id; });
	  // Enter any new links.
	  link.enter().insert("svg:line", ".node")
	      .attr("class", "link")
	      .attr("x1", function(d) { return d.source.x; })
	      .attr("y1", function(d) { return d.source.y; })
	      .attr("x2", function(d) { return d.target.x; })
	      .attr("y2", function(d) { return d.target.y; });

	  // Exit any old links.
	  link.exit().remove();

	  // Update the nodes…
	  node = vis.selectAll("circle.node")
	      .data(nodes, function(d) { return d.id; })
	      .style("fill", color);

	  node.transition()
	      .attr("r", function(d) { return d.children ? 50 : Math.sqrt(d.count); });

    // for displaying text
    var x = []; var y = []; var name = [];
	  // Enter any new nodes.
	  node.enter().append("svg:circle")
	      .attr("class", "node")
	      .attr("cx", function(d) { if(d.name) {x.push(d.x); y.push(d.y); name.push(d.name);} return d.x; })
	      .attr("cy", function(d) { return d.y; })
	      .attr("r", function(d) { return d.children ? 50 : Math.sqrt(d.count); })
	      .style("fill", color)
	      .on("click", click)

    window.console.log(vis);
    for ( var i = 0; i < x.length; i++) {
      vis.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", ".3em")
        .attr("x", function(d) {return x[i]})
        .attr("y", function(d) {return y[i]})
        .text(function(d) { return name[i]});
    }
	  // Exit any old nodes.
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
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
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

