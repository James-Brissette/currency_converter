console.log("Fire");
$(document).ready(function(){
    console.log("Water");
    $('.button').on('click', function() {
        var form = $("#form")[0];
        var formData = new FormData(form);
        json = {};

        for (const [key, value] of formData.entries()) {
            json[key] = value;
        }
        
        $.get("localhost:3000/currency", json).done(function(res) {
            $("#conversion-output").html(res);
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
