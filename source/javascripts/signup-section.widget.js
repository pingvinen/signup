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
            /**
             * Fire every time a change occurs in the section.
             * Validation has already been performed
             * @param section
             */
            onChange: function defaultOnChange(section) { },

            /**
             * This function should validate each field and
             * return an array of error messages
             */
            onValidate: function defaultOnValidate($form) { return []; },

            /**
             * Fired when the section is submitted - i.e. user is done
             * with this section
             * @param section
             */
            onNext: function defaultOnNext(section) { },

            /**
             * Is called when the section wants to be edited - i.e. the user clicks edit
             * @param section The section
             */
            onEdit: function defaultOnEdit(section) { }
        },

        _create: function _create() {
            this.id = this.element.attr('id');

            this.localStorageItemKey = this.id + '-form-data';

            this.$next = this.element.find('.next-btn');
            this.$form = this.element.find('form');
            this.$collapsable = this.element.find('.inner');
            this.$edit = this.element.find('.edit-btn');

            this.$form.on('submit', $.proxy(this._onSubmit, this));
            this.$next.on('click', $.proxy(this._onSubmit, this));

            this.$form.find(':input').not(':button').on('keyup blur', $.proxy(this._onChange, this));
            this.$form.find(':radio').on('click', $.proxy(this._onChange, this));

            this.$edit.on('click', $.proxy(this._onEdit, this));
        },

        _enableNext: function _enableNext() {
            this.$next.removeAttr('disabled');
        },

        _disableNext: function _disableNext() {
            this.$next.attr('disabled', 'disabled');
        },

        _onChange: function _onChange(event, doUiUpdate) {
            this._numberSection_onChange();

            this.save();

            var isValid = false;
            if (doUiUpdate || doUiUpdate === undefined) {
                isValid = this.isValid();
            } else {
                isValid = this.isValidNoUi();
            }

            if (isValid) {
                this._enableNext();
            } else {
                this._disableNext();
            }

            this.options.onChange(this.element);
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

        _clearValidationErrors: function _clearValidationErrors() {
            this.element.find('.validation-error').empty();
            this.element.find('.invalid').removeClass('invalid');
        },

        isValid: function isValid() {
            this._clearValidationErrors();

            var errors = this.options.onValidate(this.$form);

            errors.forEach($.proxy(this.addError, this));

            var isValid = errors.length == 0;

            if (isValid) {
                this.element.removeClass('invalid-section');
                this._enableNext();
            } else {
                this.element.addClass('invalid-section');
                this._disableNext();
            }

            return isValid;
        },

        isValidNoUi: function isValidNoUi() {
            var errors = this.options.onValidate(this.$form);

            return errors.length == 0;
        },

        addError: function addError(error) {
            this.element.find('#'+error.field+'-error').append(
                $('<p></p>').text(error.msg)
            );
        },

        _onSubmit: function _onSubmit(event) {
            event.preventDefault();
            this.options.onNext(this.element);
        },

        _onEdit: function _onEdit() {
            this.options.onEdit(this.element);
        },

        save: function save() {
            if (this.options.isSaveable) {
                saveFormToLocalStorage(this.$form, this.localStorageItemKey);
            }
        },

        prePopulate: function prePopulate() {
            if (this.options.isSaveable) {
                prePopulateFormWithValuesFromLocalStorage(this.$form, this.localStorageItemKey);
                this._onChange(null, false);
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
        },

        collapse: function collapse() {
            this.$collapsable.removeClass('expanded').addClass('collapsed');
        },

        expandAndFocus: function expandAndFocus() {
            this._clearValidationErrors();
            this.$collapsable.removeClass('collapsed').addClass('expanded');

            if (this.element.hasClass('invalid-section')) {
                this.$form.find('.invalid').first().focus();
            } else {
                this.$form.find(':input').first().focus();
            }
        },

        getId: function getId() {
            return this.id;
        },

        _getField: function _getField(fieldName) {
            return this.$form.find(':input[name='+fieldName+']');
        },

        getValue: function getValue(fieldName) {
            return this._getField(fieldName).val();
        },

        setValue: function setValue(fieldName, newValue) {
            this._getField(fieldName).val(newValue);
            this._onChange(null, false);
        },

        setValueIfEmpty: function setValueIfEmpty(fieldName, newValue) {
            if (this.getValue(fieldName).length == 0) {
                this.setValue(fieldName, newValue);
            }
        }
    });

})(jQuery);
