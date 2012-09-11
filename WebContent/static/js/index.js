$(document).ready(function() {
	var width = 1000, height = 600,  centered, over;
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
			var ts = d3.select("#map_container").append("div").append("select");
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
				console.log(temp);
				g.select("#"+item.state).select("path").style("fill",color(temp));
				//append("svg:title").text(item.state+": Obama: "+d3.round(item.obama/(item.obama+item.romney)*100)+"%, Romney: "+d3.round(item.romney/(item.obama+item.romney)*100)+"%");
			}
		});
	}

	function click(d) {
		var x = 0, y = 0, k = 1;
		centered = null;
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
});