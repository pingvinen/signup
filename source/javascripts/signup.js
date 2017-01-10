//= require_tree .

$(function() {
    var $form = $('#signup-form');
    var $sidebar = $("#sidebar");
    var payment = new Payment($form, 'credit-card-listbox', window.payuConfig);
    payment.initialize();

    /***************************************************************
     *
     * Form related stuff
     *
     **************************************************************/
    function localStorageIsSupported() {
        return typeof(Storage) !== 'undefined';
    }

    function getFormDataFromLocalStorage() {
        if (localStorageIsSupported()) {
            return JSON.parse(window.localStorage.getItem('signup-form-data'));
        }
    }

    function saveFormDataInLocalStorage(formData) {
        if (localStorageIsSupported()) {
            window.localStorage.setItem('signup-form-data', JSON.stringify(formData));
        }
    }

    function clearFormDataFromStorage() {
        if (localStorageIsSupported()) {
            window.localStorage.removeItem('signup-form-data');
        }
    }

    function saveFormToLocalStorage() {
        if (localStorageIsSupported()) { // to avoid unnecessary work
            var data = $form.serializeArray();

            var namesNotAllowedToStore = [
                'credit-card-name',
                'credit-card-number',
                'credit-card-exp-month',
                'credit-card-exp-year',
                'credit-card-cvv'
            ];

            // filter out fields that we are not allowed to store
            data = data.filter(function(item) {
                return namesNotAllowedToStore.indexOf(item.name) == -1;
            });

            saveFormDataInLocalStorage(data);
        }
    }

    /**
     * Pre-populates the form fields with values from
     * local storage (if supported)
     */
    function prePopulateFormWithValuesFromLocalStorage() {
        if (localStorageIsSupported()) {
            var inLocal = getFormDataFromLocalStorage();

            if (inLocal != null) {
                inLocal.forEach(function(item) {
                    var $elm = $($form.get(0)[item.name]);

                    if (item.name === 'number-port') {
                        $form.find('#'+item.value).attr('checked', true);
                    }
                    else {
                        $elm.val(item.value);
                    }
                });


            }
        }
    }

    function copyPortNumberToContactPhone() {
        var $portNumber = $form.find('#port-number');
        var $contactNumber = $form.find('#contact-phone');

        if ($contactNumber.val().length == 0) {
            $contactNumber.val($portNumber.val());
        }
    }

    function copyContactNameToDeliveryAndPayment() {
        var $contactName = $form.find('#contact-name');
        var $deliveryName = $form.find('#delivery-name');
        var $paymentName = $form.find('#credit-card-name');

        if ($deliveryName.val().length == 0) {
            $deliveryName.val($contactName.val());
        }

        if ($paymentName.val().length == 0) {
            $paymentName.val($contactName.val());
        }
    }


    /***************************************************************
     *
     * Sidebar related stuff
     *
     **************************************************************/

    var planRepository = [
        {
            code: 'small',
            name: 'Small(TM)',
            price: '111'
        },
        {
            code: 'ninja',
            name: 'Ninja Package',
            price: '333'
        }
    ];

    function getPlanCodeFromQueryString() {
        var queryString = window.location.search.substr(1);

        var result = null;
        queryString.split('&').forEach(function(part) {
            var item = part.split('=');
            if (item[0] === 'plan') {
                result = item[1];
            }
        });

        return result;
    }

    function getPlan(planCode) {
        var result = null;

        planRepository.forEach(function(item) {
            if (item.code === planCode) {
                result = item;
            }
        });

        return result;
    }

    function updateSidebar() {
        $sidebar.find('#sum-plan-name').text(plan.name);
        $sidebar.find('#sum-contact-name').text($form.find('#contact-name').val());
        $sidebar.find('#sum-contact-phone').text($form.find('#contact-phone').val());
        $sidebar.find('#sum-contact-email').text($form.find('#contact-email').val());
        $sidebar.find('#sum-total').text(plan.price);

        var $submit = $('#submit-btn');
        if (validate()) {
            $submit.removeAttr('disabled');
        } else {
            $submit.attr('disabled', 'disabled');
        }
    }

    function validate() {
        clearValidationErrors();
        var validationErrors = getValidationErrors();

        if (validationErrors.length != 0) {
            showValidationErrors(validationErrors);
            return false;
        }

        return true;
    }

    function submitForm() {
        if (validate()) {
            checkPaymentInfo();
        }
    }

    function checkPaymentInfo() {
        payment.createToken().then(
            function onResolved(data) {
                console.log('yay... resolved', data);
                $form.find('#payment-token').val(data.token);
                // clearFormDataFromStorage()
                // submit to netlify
            },

            function onRejected(error) {
                addPaymentError(error);
            }
        );
    }

    function addPaymentError(message) {
        getValidationGroup('payment').$elm.append(
            $('<p></p>').text(message)
        );
    }


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

    function getNumberValidationErrors() {
        var errors = [];

        var $numberPort = $form.find('[name=number-port]:checked');
        var $portNumber = $form.find('#port-number');

        if ($numberPort.length == 0) {
            errors.push({
                message: 'You must select whether to get a new number or keep an old one',
                group: 'number'
            });
        }

        else {
            if ($numberPort.val() === 'number-port-true')
            {
                if (stringIsEmptyOrWhitespace($portNumber.val())) {
                    errors.push({
                        message: 'If you wish to keep your existing number, you must tell us what it is',
                        group: 'number'
                    });
                }
                else if (!isMexicanMobilePhoneNumber($portNumber.val())) {
                    errors.push({
                        message: 'The provided phone number does not seem to be valid',
                        group: 'number'
                    });
                }
            }
        }

        return errors;
    }

    function getContactValidationErrors() {
        var errors = [];

        var $name = $form.find('#contact-name');
        var $phoneNumber = $form.find('#contact-phone');
        var $email = $form.find('#contact-email');

        if (stringIsEmptyOrWhitespace($name.val())) {
            errors.push({
                message: 'You must provide a name',
                group: 'contact'
            });
        }

        if (stringIsEmptyOrWhitespace($phoneNumber.val())) {
            errors.push({
                message: 'You must provide a phone number',
                group: 'contact'
            });
        }
        else if (!isMexicanMobilePhoneNumber($phoneNumber.val())) {
            errors.push({
                message: 'The provided phone number does not seem to be valid',
                group: 'contact'
            });
        }

        if (stringIsEmptyOrWhitespace($email.val())) {
            errors.push({
                message: 'You must provide an email address',
                group: 'contact'
            });
        } else if (!isEmailAddress($email.val())) {
            errors.push({
                message: 'The provided email address does not seem to be valid',
                group: 'contact'
            });
        }

        return errors;
    }

    function getDeliveryValidationErrors() {
        var errors = [];

        var $name = $form.find('#delivery-name');
        var $address = $form.find('#delivery-address');
        var $address2 = $form.find('#delivery-address2');
        var $area = $form.find('#delivery-area');
        var $postal = $form.find('#delivery-postal');
        var $state = $form.find('#delivery-state');

        if (stringIsEmptyOrWhitespace($name.val())) {
            errors.push({
                message: 'You must provide a name',
                group: 'delivery'
            });
        }

        if (stringIsEmptyOrWhitespace($address.val())) {
            errors.push({
                message: 'You must provide an address',
                group: 'delivery'
            });
        }

        if (stringIsEmptyOrWhitespace($address2.val())) {
            errors.push({
                message: 'You must provide a floor, house name or similar',
                group: 'delivery'
            });
        }

        if (stringIsEmptyOrWhitespace($area.val())) {
            errors.push({
                message: 'You must provide an area',
                group: 'delivery'
            });
        }

        if (stringIsEmptyOrWhitespace($postal.val())) {
            errors.push({
                message: 'You must provide a postal code',
                group: 'delivery'
            });
        }

        if (stringIsEmptyOrWhitespace($state.val())) {
            errors.push({
                message: 'You must provide a state',
                group: 'delivery'
            });
        }

        return errors;
    }

    function getPaymentValidationErrors() {
        var errors = [];

        var $name = $form.find('#credit-card-name');
        var $pan = $form.find('#credit-card-number');
        var $expMonth = $form.find('#credit-card-exp-month');
        var $expYear = $form.find('#credit-card-exp-year');
        var $cvv = $form.find('#credit-card-cvv');

        if (stringIsEmptyOrWhitespace($name.val())) {
            errors.push({
                message: 'You must provide the card holder name',
                group: 'payment'
            });
        }

        if (stringIsEmptyOrWhitespace($pan.val())) {
            errors.push({
                message: 'You must provide card number',
                group: 'payment'
            });
        }
        else if (!isNumeric($pan.val()) || $pan.val().length < 16) {
            errors.push({
                message: 'The card number must be numbers only and a minimum of 16 digits',
                group: 'payment'
            });
        }

        if (stringIsEmptyOrWhitespace($expMonth.val())) {
            errors.push({
                message: 'You must provide the card expiry month',
                group: 'payment'
            });
        }
        else if (!isNumeric($expMonth.val()) || $expMonth.val() < 1 || $expMonth.val() > 12) {
            errors.push({
                message: 'The card expiry month must be a number between 1 and 12',
                group: 'payment'
            });
        }

        var thisYear = (new Date()).getFullYear() - 2000;
        if (stringIsEmptyOrWhitespace($expYear.val())) {
            errors.push({
                message: 'You must provide the card expiry year',
                group: 'payment'
            });
        }
        else if (!isNumeric($expYear.val()) || $expYear.val() < thisYear || $expYear.val() > 99) {
            errors.push({
                message: 'The card expiry year must be a number between '+thisYear+' and 99',
                group: 'payment'
            });
        }

        if (stringIsEmptyOrWhitespace($cvv.val())) {
            errors.push({
                message: 'You must provide the card CVV',
                group: 'payment'
            });
        }
        else if (!isNumeric($cvv.val()) || $cvv.val().length != 3) {
            errors.push({
                message: 'The CVV must be a number with 3 digits',
                group: 'payment'
            });
        }

        return errors;
    }

    var validationGroups = [
        {
            group: 'number',
            $elm: $('#number-validation-errors')
        },
        {
            group: 'contact',
            $elm: $('#contact-validation-errors')
        },
        {
            group: 'delivery',
            $elm: $('#delivery-validation-errors')
        },
        {
            group: 'payment',
            $elm: $('#payment-validation-errors')
        }
    ];

    function getValidationErrors() {
        return getNumberValidationErrors().concat(
            getContactValidationErrors(),
            getDeliveryValidationErrors(),
            getPaymentValidationErrors()
        );
    }

    function clearValidationErrors() {
        validationGroups.forEach(function(group) {
            group.$elm.empty();
        });
    }

    function showValidationErrors(errors) {
        errors.forEach(function (error) {
            getValidationGroup(error.group).$elm.append(
                $('<p></p>').text(error.message)
            );
        });
    }

    function getValidationGroup(groupName) {
        var result = null;
        validationGroups.forEach(function(group) {
            if (group.group === groupName) {
                result = group;
            }
        });
        return result;
    }


    /***************************************************************
     *
     * The plan
     *
     */
    var planCode = getPlanCodeFromQueryString();

    var plan = getPlan(planCode);
    if (plan !== null) {
        $form.find('#plan-code').val(plan.code);
    }




    /***************************************************************
     *
     * Start working
     *
     */
    prePopulateFormWithValuesFromLocalStorage();
    updateSidebar();


    /***************************************************************
     *
     * Setup events for saving and clearing form data.
     *
     * We are setting up the "save on change" __after__ we pre-populate
     * in order to avoid triggering the save before all data is there.
     *
     */
    $form.find(':input').on('keyup blur', function() {
        saveFormToLocalStorage();
        updateSidebar();
    });

    $form.find(':radio').on('click', function() {
        saveFormToLocalStorage();
        updateSidebar();
    });

    $form.find('#port-number').on('blur', function() {
        copyPortNumberToContactPhone();
        updateSidebar();
    });

    $form.find('#contact-name').on('blur', function() {
        copyContactNameToDeliveryAndPayment();
        updateSidebar();
    });

    $form.on('submit', function (event) {
        event.preventDefault();
        submitForm();
        return false;
    });
});