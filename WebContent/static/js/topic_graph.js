function topic_graph(){
  var width = 900,
      height = 225;

  vis_left = d3.select("#topic_left").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("id", "top_rect")
      .append("g");
  vis_right = d3.select("#topic_right").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("id", "bottom_rect")
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
      sum_array.push(Math.sqrt(topicJson1[c]/sum_1));
    }

    for (var k = 0; k < sum_array.length; k++){
      sum_2 += sum_array[k];
    }

    var i = 0;
    for (var c in topicJson1) {
      topicArray1.push({"name": c, "size": (sum_array[i]/sum_2)*800});
      i++;
    }

    sum_1 = 0;
    sum_2 = 0; 
    for (var c in topicJson2) {
      sum_1 += topicJson2[c];
    }

    sum_array = [];
    for (var c in topicJson2) {
      sum_array.push(Math.sqrt(topicJson2[c]/sum_1));
    }

    for (var k = 0; k < sum_array.length; k++){
      sum_2 += sum_array[k];
    }

    i = 0;
    for (var c in topicJson2) {
      topicArray2.push({"name": c, "size": (sum_array[i]/sum_2)*800});
      i++;
    }

    topicArray1 = topicArray1.sort(sortingFunc);
    topicArray2 = topicArray2.sort(sortingFunc);
    var node_left = vis_left.selectAll("g.node")
          .data(topicArray1);

     var width_count = 0;
     var left_enter =  node_left.enter().append("g");

     node_left.attr("class", function(d) { return d.children ? "node" : "dem node"; })
       .attr("transform", function(d) {val = width_count; width_count += d.size;return "translate(" + val + "," + 30 + ")"; })
     left_enter.append("rect");
    var left_c =  node_left.select("rect")
          .attr("width", function(d) { return d.size; })
          .attr("height", function(d) { return 100;})
          .attr("id", function(d) { return d.children ? "dem" : "leaf";});
     left_c.filter(function(d) { return !d.children; })
          .style("fill", function(d) { return fill(d.name);});
    left_enter.filter(function(d) { return !d.children; }).append("text");
    node_left.select("text")
          .attr("text-anchor", "middle")
          .attr("transform", function(d) {return "translate(" + d.size/2 + "," + 50 + ")";})
          .text(function(d) { return d.name.substring(0, d.size / 9); });

      node_left.exit().remove();

    var node_right = vis_right.selectAll("g.node").data(topicArray2);
     width_count = 0;
     var right_enter =  node_right.enter().append("g");

     node_right.attr("class", function(d) { return d.children ? "node" : "dem node"; })
       .attr("transform", function(d) {val = width_count; width_count += d.size;return "translate(" + val + "," + 0 + ")"; })
     right_enter.append("rect");
    var right_c =  node_right.select("rect")
          .attr("width", function(d) { return d.size; })
          .attr("height", function(d) { return 100;})
          .attr("id", function(d) { return d.children ? "dem" : "leaf";});
    right_c.style("fill", function(d) { return fill(d.name);});

    right_enter.append("text");
    node_right.select("text")
          .attr("text-anchor", "middle")
          .attr("transform", function(d) {return "translate(" + d.size/2 + "," + 50 + ")";})
          .text(function(d) { return d.name.substring(0, d.size / 9); });

      node_right.exit().remove();
}

function sortingFunc(a,b) {
var nA = a.name.toLowerCase();
   var nB = b.name.toLowerCase();
     if(nA < nB)
           return -1;
       else if(nA > nB)
             return 1;
        return 0;
}
