//= require_tree .

$(function() {
    var $form = $('#signup-form');
    var $sidebar = $("#sidebar");
    var payment = new Payment($form, 'credit-card-listbox', window.payuConfig);
    payment.initialize();


    /***************************************************************
     *
     * Validation
     *
     */
    function stringIsEmptyOrWhitespace(str) {
        return $.trim(str).length == 0;
    }

    function isMexicanMobilePhoneNumber(input) {
        /**
         * 52 = country code
         * 1 = is mobile, only required if calling from outside Mexico (hence, optional)
         * 55 = is mobile
         * then 8 digits
         */

        return $.trim(input).replace(/ /g, '').match(/^(\+?52)?1?55\d{8}$/);
    }

    function isEmailAddress(input) {
        var cleaned = $.trim(input);
        var parts = cleaned.split('@');

        if (parts.length != 2) {
            return false;
        }

        var usernameIsOk = parts[0].match(/^[a-z0-9_\.+]+$/i);
        var domainIsOk = parts[1].match(/^[a-z0-9\._-]+\.[a-z]{2,}$/i);

        return usernameIsOk && domainIsOk;
    }

    function isNumeric(input) {
        var cleaned = $.trim(input).replace(/ /g, '');

        return !isNaN(parseFloat(cleaned)) && isFinite(cleaned);
    }

    function getNumberValidationErrors($form) {
        var errors = [];

        var $numberPort = $form.find('[name=number-port]:checked');
        var $portNumber = $form.find('#port-number');

        if ($numberPort.length == 0) {
            errors.push('You must select whether to get a new number or keep an old one');
        }

        else {
            if ($numberPort.val() === 'number-port-true')
            {
                if (stringIsEmptyOrWhitespace($portNumber.val())) {
                    errors.push('If you wish to keep your existing number, you must tell us what it is');
                }
                else if (!isMexicanMobilePhoneNumber($portNumber.val())) {
                    errors.push('The provided phone number does not seem to be valid');
                }
            }
        }

        return errors;
    }

    function getContactValidationErrors($form) {
        var errors = [];

        var $name = $form.find('#contact-name');
        var $phoneNumber = $form.find('#contact-phone');
        var $email = $form.find('#contact-email');

        if (stringIsEmptyOrWhitespace($name.val())) {
            errors.push('You must provide a name');
        }

        if (stringIsEmptyOrWhitespace($phoneNumber.val())) {
            errors.push('You must provide a phone number');
        }
        else if (!isMexicanMobilePhoneNumber($phoneNumber.val())) {
            errors.push('The provided phone number does not seem to be valid');
        }

        if (stringIsEmptyOrWhitespace($email.val())) {
            errors.push('You must provide an email address');
        } else if (!isEmailAddress($email.val())) {
            errors.push('The provided email address does not seem to be valid');
        }

        return errors;
    }

    function getDeliveryValidationErrors($form) {
        var errors = [];

        var $name = $form.find('#delivery-name');
        var $address = $form.find('#delivery-address');
        var $address2 = $form.find('#delivery-address2');
        var $area = $form.find('#delivery-area');
        var $postal = $form.find('#delivery-postal');
        var $state = $form.find('#delivery-state');

        if (stringIsEmptyOrWhitespace($name.val())) {
            errors.push('You must provide a name');
        }

        if (stringIsEmptyOrWhitespace($address.val())) {
            errors.push('You must provide an address');
        }

        if (stringIsEmptyOrWhitespace($address2.val())) {
            errors.push('You must provide a floor, house name or similar');
        }

        if (stringIsEmptyOrWhitespace($area.val())) {
            errors.push('You must provide an area');
        }

        if (stringIsEmptyOrWhitespace($postal.val())) {
            errors.push('You must provide a postal code');
        }

        if (stringIsEmptyOrWhitespace($state.val())) {
            errors.push('You must provide a state');
        }

        return errors;
    }

    function getPaymentValidationErrors($form) {
        var errors = [];

        var $name = $form.find('#credit-card-name');
        var $pan = $form.find('#credit-card-number');
        var $expMonth = $form.find('#credit-card-exp-month');
        var $expYear = $form.find('#credit-card-exp-year');
        var $cvv = $form.find('#credit-card-cvv');

        if (stringIsEmptyOrWhitespace($name.val())) {
            errors.push('You must provide the card holder name');
        }

        if (stringIsEmptyOrWhitespace($pan.val())) {
            errors.push('You must provide card number');
        }
        else if (!isNumeric($pan.val()) || $pan.val().length < 16) {
            errors.push('The card number must be numbers only and a minimum of 16 digits');
        }

        if (stringIsEmptyOrWhitespace($expMonth.val())) {
            errors.push('You must provide the card expiry month');
        }
        else if (!isNumeric($expMonth.val()) || $expMonth.val() < 1 || $expMonth.val() > 12) {
            errors.push('The card expiry month must be a number between 1 and 12');
        }

        var thisYear = (new Date()).getFullYear() - 2000;
        if (stringIsEmptyOrWhitespace($expYear.val())) {
            errors.push('You must provide the card expiry year');
        }
        else if (!isNumeric($expYear.val()) || $expYear.val() < thisYear || $expYear.val() > 99) {
            errors.push('The card expiry year must be a number between '+thisYear+' and 99');
        }

        if (stringIsEmptyOrWhitespace($cvv.val())) {
            errors.push('You must provide the card CVV');
        }
        else if (!isNumeric($cvv.val()) || $cvv.val().length != 3) {
            errors.push('The CVV must be a number with 3 digits');
        }

        return errors;
    }

    function enableSubmitButton() {
        $('#submit-btn').removeAttr('disabled');
    }

    function disableSubmitButton() {
        $('#submit-btn').attr('disabled', 'disabled');
    }



    function onChange() {
        // validate sections
        var allSectionsAreValid = true;

        sections.forEach(function(section) {
            allSectionsAreValid &= section.signupsection('isValid');
        });

        if (allSectionsAreValid) {
            enableSubmitButton();
        } else {
            disableSubmitButton();
        }
    }



    var numberSection = $('#number').signupsection({
        onChange: onChange,
        onValidate: getNumberValidationErrors
    });
    var contactSection = $('#contact').signupsection({
        onChange: onChange,
        onValidate: getContactValidationErrors
    });
    var deliverySection = $('#delivery').signupsection({
        onChange: onChange,
        onValidate: getDeliveryValidationErrors
    });
    var paymentSection = $('#payment').signupsection({
        onChange: onChange,
        onValidate: getPaymentValidationErrors,
        isSaveable: false
    });

    var sections = [
        numberSection,
        contactSection,
        deliverySection,
        paymentSection
    ];


    /***************************************************************
     * Pre-populate sections
     */
    sections.forEach(function(section) {
        section.signupsection('prePopulate');
    });
});