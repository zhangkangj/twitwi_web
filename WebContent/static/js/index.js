function setup_index(){
	console.log(123);
	var obama = [], romney = [];
	for (var i in times){
		var time = times[i];
		var obama_total = 0, romney_total = 0;
		for (var key in mention_json[time]){
			if (key != "US"){
				obama_total  +=  user_json[key] * mention_json[time][key]["obama"];
				romney_total +=  user_json[key] * mention_json[time][key]["romney"] ;	
			}
		}
		var total = obama_total + romney_total;
		obama.push(obama_total / total);
		romney.push(romney_total / total);
	}
	obama = movingAverage(obama, 3);
	romney = movingAverage(romney, 3);
	
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
		var obama_count  = obama[i];
		var romney_count = romney[i];
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
    var annotatedtimeline = new google.visualization.AnnotatedTimeLine(document.getElementById('index_panel'));
    annotatedtimeline.draw(data, {"width":"800px", "height":"500px",'displayAnnotations': true, 'zoomStartTime': new Date(1338523200000)});
}

function movingAverage(input, n){
	var output = [];
	for (var i = 0; i < input.length; i++){
		var moving_sum = 0;
		if (i < n){
			for (var j = -i; j <= i; j++){
				moving_sum += input[i + j];	
			}
			output.push(moving_sum / (2 * i + 1));
		} else if (input.length - i - 1 < n){
			for (var j = -(input.length - i - 1); j <= (input.length - i - 1); j++){
				moving_sum += input[i + j];	
			}
			output.push(moving_sum / ((input.length - i - 1) * 2 + 1));
		} else{
			for (var j = -n; j <=n; j++){
				moving_sum += input[i + j];	
			}
			output.push(moving_sum / (2 * n + 1));
		}
	}
	return output;
}