function topic_graph(){
  var width = 420,
      height = 450;

  pack_left= d3.layout.pack()
      .size([width - 4, height - 4])
      .value(function(d) { return d.size; });

  pack_right= d3.layout.pack()
      .size([width - 4, height - 4])
      .value(function(d) { return d.size; });

  vis_left = d3.select("#topic_left").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "pack")
      .append("g")
      .attr("transform", "translate(2, 2)");
  vis_right = d3.select("#topic_right").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "pack")
      .append("g")
      .attr("transform", "translate(2, 2)");	

}

function update_topic(json) {
    var topicArray1 = [];
    var topicJson1 = json['obama'];
    var topicArray2 = [];
    var topicJson2 = json['romney'];
    var format = d3.format(",d");
    for (var c in topicJson1) {
      topicArray1.push({"name": c, "size": topicJson1[c]});
    }
    for (var c in topicJson2) {
      topicArray2.push({"name": c, "size": topicJson2[c]});
    }

    root1 = {"name": "Obama", "children": topicArray1};
    root2 = {"name": "Romney", "children": topicArray2};
    var node_left = vis_left.data([root1]).selectAll("g.node")
          .data(pack_left.nodes);

     var left_enter =  node_left.enter().append("g");

     node_left.attr("class", function(d) { return d.children ? "node" : "dem node"; })
          .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; })
     left_enter.append("circle");
     node_left.select("circle")
          .attr("r", function(d) { return d.r; });

    left_enter.filter(function(d) { return !d.children; }).append("text")
    node_left.select("text")
          .attr("text-anchor", "middle")
          .attr("dy", ".3em")
          .text(function(d) { return d.name.substring(0, d.r / 3); });

      node_left.exit().remove();
    var node_right = vis_right.data([root2]).selectAll("g.node")
          .data(pack_right.nodes);
    var right_enter = node_right.enter().append("g")
      node_right.attr("class", function(d) { return d.children ? "node" : "rep node"; })
          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

      right_enter.append("circle");

      node_right.select("circle")
          .attr("r", function(d) { return d.r; });

      right_enter.filter(function(d) { return !d.children; }).append("text")

      node_right.select("text")
          .attr("text-anchor", "middle")
          .attr("dy", ".3em")
          .text(function(d) { return d.name.substring(0, d.r / 3); });

      node_right.exit().remove();
}


