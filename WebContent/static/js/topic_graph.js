function topic_graph(){
  var width = 900,
      height = 225;

  vis_left = d3.select("#topic_left").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "pack")
      .append("g");
  vis_right = d3.select("#topic_right").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "pack")
      .append("g");

}
function update_topic(json) {
    var topicArray1 = [];
    var topicJson1 = json['obama'];
    var topicArray2 = [];
    var topicJson2 = json['romney'];
    var format = d3.format(",d");
    var fill = d3.scale.category20c();
    // normalizing
    var sum_1 = 0;
    var sum_2 = 0; 
    for (var c in topicJson1) {
      sum_1 += topicJson1[c];
    }

    var sum_array = [];
    for (var c in topicJson1) {
      sum_array.push(Math.sqrt(topicJson1[c]/sum_1)*10);
    }

    for (var k = 0; k < sum_array.length; k++){
      sum_2 += sum_array[k];
    }

    var i = 0;
    for (var c in topicJson1) {
      topicArray1.push({"name": c, "size": (sum_array[i]/sum_2)*400, "order": i});
      i++;
    }

    sum_1 = 0;
    sum_2 = 0; 
    for (var c in topicJson2) {
      sum_1 += topicJson2[c];
    }

    sum_array = [];
    for (var c in topicJson2) {
      sum_array.push(Math.sqrt(topicJson2[c]/sum_1)*10);
    }

    for (var k = 0; k < sum_array.length; k++){
      sum_2 += sum_array[k];
    }

    i = 0;
    for (var c in topicJson2) {
      topicArray2.push({"name": c, "size": (sum_array[i]/sum_2)*400, "order": i});
      i++;
    }
    var node_left = vis_left.selectAll("g.node")
          .data(topicArray1);

     var radius_count = 0;
     var left_enter =  node_left.enter().append("g");

     node_left.attr("class", function(d) { return d.children ? "node" : "dem node"; })
       .attr("transform", function(d) {val = radius_count + d.size; radius_count += 2*d.size;return "translate(" + val + "," + 100 + ")"; })
     left_enter.append("circle");
    var left_c =  node_left.select("circle")
          .attr("r", function(d) { return d.size; })
          .attr("id", function(d) { return d.children ? "dem" : "leaf";});
     left_c.filter(function(d) { return !d.children; })
          .style("fill", function(d) { return fill(d.name);});
    left_enter.filter(function(d) { return !d.children; }).append("text");
    node_left.select("text")
          .attr("text-anchor", "middle")
          .attr("dy", ".3em")
          .text(function(d) { return d.name.substring(0, d.size / 3); });

      node_left.exit().remove();

    var node_right = vis_right.selectAll("g.node").data(topicArray2);
     radius_count = 0;
     var right_enter =  node_right.enter().append("g");

     node_right.attr("class", function(d) { return d.children ? "node" : "dem node"; })
       .attr("transform", function(d) {val = radius_count + d.size; radius_count += 2*d.size;return "translate(" + val + "," + 100 + ")"; })
     right_enter.append("circle");
    var right_c =  node_right.select("circle")
          .attr("r", function(d) { return d.size; })
          .attr("id", function(d) { return d.children ? "dem" : "leaf";});
     right_c.filter(function(d) { return !d.children; })
          .style("fill", function(d) { return fill(d.name);});
    right_enter.filter(function(d) { return !d.children; }).append("text");
    node_right.select("text")
          .attr("text-anchor", "middle")
          .attr("dy", ".3em")
          .text(function(d) { return d.name.substring(0, d.size / 3); });

      node_right.exit().remove();
}


