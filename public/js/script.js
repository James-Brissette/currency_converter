const PRODUCTION_IP = '104.248.121.116';

$(document).ready(function(){
    $('.button').on('click', function() {
        var form = $("#form")[0];
        var formData = new FormData(form);
        data = '?';
	console.log("Hit");
        for (const [key, value] of formData.entries()) {
            data += `${key}=${value}&`
        }
	data = data.substring(0, data.length - 1)
       console.log(data); 
        $.get(`http:\/\/${PRODUCTION_IP}:3000/currency${data}`,function(res) { 
	    console.log(res);
            $("#conversion-output").text(JSON.stringify(res));
        });
    });
});
    
/* var form = document.getElementById('form');

var button = document.getElementById("button");
button.onclick = function() {
    var form = document.getElementById('form');
    formData = new FormData(form);

    console.log(formData)
};
 */
