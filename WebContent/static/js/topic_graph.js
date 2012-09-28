function topic_graph() {
    // initialize topic graph

  var width = 420,
      height = 450,
      format = d3.format(",d");

  var pack_left= d3.layout.pack()
      .size([width - 4, height - 4])
      .value(function(d) { return d.size; });

  var pack_right= d3.layout.pack()
      .size([width - 4, height - 4])
      .value(function(d) { return d.size; });


  var vis_left = d3.select("#topic_left").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "pack")
      .append("g")
      .attr("transform", "translate(2, 2)");

  
  var vis_right = d3.select("#topic_right").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "pack")
      .append("g")
      .attr("transform", "translate(2, 2)");


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
        topicArray1.push({"name": c, "size": topicJson1[c]});
      }
      for (var c in topicJson2) {
        topicArray2.push({"name": c, "size": topicJson2[c]});
      }

      root1 = {"name": "Obama", "children": topicArray1};
      root2 = {"name": "Romney", "children": topicArray2};
      var node_left = vis_left.data([root1]).selectAll("g.node")
            .data(pack_left.nodes)
          .enter().append("g")
            .attr("class", function(d) { return d.children ? "node" : "dem node"; })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

        node_left.append("title")
            .text(function(d) { return d.name + (d.children ? "" : ": " + format(d.size)); });

        node_left.append("circle")
            .attr("r", function(d) { return d.r; });

        node_left.filter(function(d) { return !d.children; }).append("text")
            .attr("text-anchor", "middle")
            .attr("dy", ".3em")
            .text(function(d) { return d.name.substring(0, d.r / 3); });
   var node_right = vis_right.data([root2]).selectAll("g.node")
            .data(pack_right.nodes)
          .enter().append("g")
            .attr("class", function(d) { return d.children ? "node" : "rep node"; })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

        node_right.append("title")
            .text(function(d) { return d.name + (d.children ? "" : ": " + format(d.size)); });

        node_right.append("circle")
            .attr("r", function(d) { return d.r; });

        node_right.filter(function(d) { return !d.children; }).append("text")
            .attr("text-anchor", "middle")
            .attr("dy", ".3em")
            .text(function(d) { return d.name.substring(0, d.r / 3); });
	});

}
