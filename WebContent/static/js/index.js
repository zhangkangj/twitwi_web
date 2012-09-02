$(document).ready(function() {
	$('#logout').click(function(){
		location.href = '/logout';
	});
	$('#restart').click(function(){
		location.href = '/restart';
	});
	$('#clear').click(function(){
		$('#console').empty();
	});
	$('#command').keypress(function(e){
		if(e.keyCode == 13) {
			var command = $('#command').val();
			var elt = document.createElement("div");
			$('#console').append($(elt).text("> " + command));
			$('#command').val("");
			$("#console").attr({ scrollTop: $("#console").attr("scrollHeight") });
			if (command != ''){
				$.post('/command',{command:command},function(response) {
					var elt = document.createElement("div");
					$('#console').append($(elt).text("< " + response));
					$("#console").attr({ scrollTop: $("#console").attr("scrollHeight") });
				});
			}
			
		}
	});
	$('#command').delay(1000).focus();
});