//= require_tree .



$(function() {
  	// Handler for .ready() called.

  	$("#port-number").change(function () {
      var value = $(this).val();
      $("#contact-phone").val(value);
      $("#sum-contact-phone").text(value);
    }).keyup();

    $("#contact-name").change(function () {
      var value = $(this).val();
      $("#delivery-name").val(value);
      $("#credit-name").val(value);
      $("#sum-contact-name").text(value);
    }).keyup();

    $("#contact-email").change(function () {
      var value = $(this).val();
      $("#sum-contact-email").text(value);
    }).keyup();
});

$(function() {
	$("#sidebar").sticky({topSpacing:30});
});