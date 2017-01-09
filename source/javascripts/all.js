//= require_tree .

$(function() {
    var $form = $('#signup-form');
    var $sidebar = $("#sidebar");

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
    }

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
    $sidebar.sticky({topSpacing:30});


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

    $form.on('submit', function (){
        clearFormDataFromStorage();
    });
});