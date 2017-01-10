(function($, payU, undefined) {
    function Payment($form, listBoxId, config) {
        this.$form = $form;
        this.listBoxId = listBoxId;
        this.config = config;
        this.hasBeenInitialized = false;
    }

    Payment.prototype.initialize = function initialize() {
        if (!this.hasBeenInitialized) {
            this.hasBeenInitialized = true;
            payU.setURL(this.config.url);
            payU.setPublicKey(this.config.publicKey);
            payU.setAccountID(this.config.accountId);
            payU.setListBoxID(this.listBoxId);
            payU.setLanguage(this.config.language);
            payU.getPaymentMethods();

            this.$form.find('input[payu-content=payer_id]').val(this.config.payerId);
        }
    };


    Payment.prototype.getProvider = function getProvider() {
        if (!this.hasBeenInitialized) {
            throw new Error('You must first initialize me by calling .initialize()');
        }

        return payU;
    };

    Payment.prototype.createToken = function createToken() {
        return $.Deferred($.proxy(function (promise) {
            try {
                var provider = this.getProvider();

                provider.createToken($.proxy(function (response) {
                    this._onCreateTokenResponse(promise, response);
                }, this), this.$form);
            }
            catch (err) {
                promise.reject(err);
            }
        }, this));
    };

    Payment.prototype._onCreateTokenResponse = function _onCreateTokenResponse(promise, response) {
        if (response.error) {
            promise.reject(response.error);
            return;
        }

        promise.resolve({
            token: response.token
        });
    };

    window.Payment = Payment;

})(jQuery, payU);
