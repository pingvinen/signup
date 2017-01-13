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
            onChange: function defaultOnChange() { }
        },

        _create: function _create() {
            this.id = this.element.attr('id');

            this.localStorageItemKey = this.id + '-form-data';

            this.$next = this.element.find('.next-btn');
            this.$form = this.element.find('form');

            this.$form.on('submit', $.proxy(this._onSubmit, this));
            this.$form.find(':input').on('keyup blur', $.proxy(this._onChange, this));
            this.$form.find(':radio').on('click', $.proxy(this._onChange, this));
        },

        _onChange: function _onChange() {
            this.save();
            this.options.onChange();
        },

        _validate: function _validate() {
        },

        _onSubmit: function _onSubmit(event) {
            event.preventDefault();
            this._validate();
        },

        save: function save() {
            if (this.options.isSaveable) {
                saveFormToLocalStorage(this.$form, this.localStorageItemKey);
            }
        },

        prePopulate: function prePopulate() {
            if (this.options.isSaveable) {
                prePopulateFormWithValuesFromLocalStorage(this.$form, this.localStorageItemKey);
            }
        }
    });

})(jQuery);
