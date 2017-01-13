//= require_tree .

$(function() {
    var $form = $('#signup-form');
    var $sidebar = $("#sidebar");
    var payment = new Payment($form, 'credit-card-listbox', window.payuConfig);
    payment.initialize();


    function onChange() {
        console.log('parent onChange');
    }



    var numberSection = $('#number').signupsection({ onChange: onChange });
    var contactSection = $('#contact').signupsection({ onChange: onChange });
    var deliverySection = $('#delivery').signupsection({ onChange: onChange });
    var paymentSection = $('#payment').signupsection({ onChange: onChange, isSaveable: false });

    var sections = [
        numberSection,
        contactSection,
        deliverySection,
        paymentSection
    ];

    sections.forEach(function(section) {
        section.signupsection('prePopulate');
    });


});