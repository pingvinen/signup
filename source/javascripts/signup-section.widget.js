(function($, undefined) {

    function localStorageIsSupported() {
        return typeof(Storage) !== 'undefined';
    }

    function saveFormDataInLocalStorage(formData, localStorageItemKey) {
        if (localStorageIsSupported()) {
            window.localStorage.setItem(localStorageItemKey, JSON.stringify(formData));
        }
    }

    function saveFormToLocalStorage($form, localStorageItemKey) {
        if (localStorageIsSupported()) { // to avoid unnecessary work
            saveFormDataInLocalStorage(getFormData($form), localStorageItemKey);
        }
    }

    function getFormDataFromLocalStorage(localStorageItemKey) {
        if (localStorageIsSupported()) {
            return JSON.parse(window.localStorage.getItem(localStorageItemKey));
        }
    }

    function clearFormDataFromStorage(localStorageItemKey) {
        if (localStorageIsSupported()) {
            window.localStorage.removeItem(localStorageItemKey);
        }
    }

    /**
     * Pre-populates the form fields with values from
     * local storage (if supported)
     */
    function prePopulateFormWithValuesFromLocalStorage($form, localStorageItemKey) {
        if (localStorageIsSupported()) {
            var inLocal = getFormDataFromLocalStorage(localStorageItemKey);

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

    /**
     * Get form data (as an array of objects {name:string, value:string}.
     * @returns {[]}
     */
    function getFormData($form) {
        return $form.serializeArray();
    }

    $.widget('simplii.signupsection', {

        options: {
            isSaveable: true,
            onChange: function defaultOnChange() { },

            /**
             * This function should perform validation and
             * return an array of error messages
             */
            onValidate: function defaultOnValidate($form) { return []; },

            onSubmit: function defaultSubmit() { }
        },

        _create: function _create() {
            this.id = this.element.attr('id');

            this.localStorageItemKey = this.id + '-form-data';

            this.$next = this.element.find('.next-btn');
            this.$form = this.element.find('form');
            this.$validationErrors = this.element.find('.validation-errors');

            this.$form.on('submit', $.proxy(this._onSubmit, this));
            this.$form.find(':input').on('keyup blur', $.proxy(this._onChange, this));
            this.$form.find(':radio').on('click', $.proxy(this._onChange, this));
        },

        _enableNext: function _enableNext() {
            this.$next.removeAttr('disabled');
        },

        _disableNext: function _disableNext() {
            this.$next.attr('disabled', 'disabled');
        },

        _onChange: function _onChange() {
            this._numberSection_onChange();

            this.save();
            this.options.onChange();
        },

        /**
         * This is very EEEWWW! This kind of section specific stuff
         * does not belong in a generic section handler, but I am pressed
         * for time... sorry programming gods...
         * @private
         */
        _numberSection_onChange: function _numberSection_onChange() {
            if (this.id === 'number') {
                var $numberPort = this.$form.find('[name=number-port]:checked');
                var $portNumber = this.$form.find('#port-number');

                if ($numberPort.val() === 'number-port-true') {
                    $portNumber.removeAttr('disabled');
                } else {
                    $portNumber.attr('disabled', 'disabled').val('');
                }
            }
        },

        isValid: function isValid() {
            this.$validationErrors.empty();

            var errors = this.options.onValidate(this.$form);

            errors.forEach($.proxy(this.addError, this));

            var isValid = errors.length == 0;

            if (isValid) {
                this._enableNext();
            } else {
                this._disableNext();
            }

            return isValid;
        },

        addError: function addError(errorMessage) {
            this.$validationErrors.append(
                $('<p></p>').text(errorMessage)
            );
        },

        _onSubmit: function _onSubmit(event) {
            event.preventDefault();
            this.options.onSubmit();
        },

        save: function save() {
            if (this.options.isSaveable) {
                saveFormToLocalStorage(this.$form, this.localStorageItemKey);
            }
        },

        prePopulate: function prePopulate() {
            if (this.options.isSaveable) {
                prePopulateFormWithValuesFromLocalStorage(this.$form, this.localStorageItemKey);
                this._onChange();
            }
        },

        clearStorage: function clearStorage() {
            if (this.options.isSaveable) {
                clearFormDataFromStorage(this.localStorageItemKey);
            }
        },

        getData: function getData() {
            if (this.options.isSaveable) {
                return getFormData(this.$form);
            }

            return [];
        }
    });

})(jQuery);
