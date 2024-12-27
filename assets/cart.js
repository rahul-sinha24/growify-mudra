theme.cart = {
  getCart: function() {
    const url = `${theme.routes.cart}?t=${Date.now()}`;
    return fetch(url, { credentials: 'same-origin', method: 'GET' }).then(response => response.json());
  },

  getCartProductMarkup: function() {
    const url = `${theme.routes.cartPage}?t=${Date.now()}&view=ajax`;
    return fetch(url, { credentials: 'same-origin', method: 'GET' }).then(response => response.text());
  },

  changeItem: function(key, qty) {
    return this._updateCart({
      url: `${theme.routes.cartChange}?t=${Date.now()}`,
      data: JSON.stringify({ id: key, quantity: qty })
    });
  },

  _updateCart: function(params) {
    return fetch(params.url, {
      method: 'POST',
      body: params.data,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
      .then(response => response.json())
      .then(cart => cart);
  },

  updateAttribute: function(key, value) {
    return this._updateCart({
      url: '/cart/update.js',
      data: JSON.stringify({ attributes: { [key]: this.attributeToString(value) } })
    });
  },

  updateNote: function(note) {
    return this._updateCart({
      url: '/cart/update.js',
      data: JSON.stringify({ note: this.attributeToString(note) })
    });
  },

  attributeToString: function(attribute) {
    return (typeof attribute !== 'string' ? `${attribute}` : attribute || '').trim();
  }
};

class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
      cartItems.updateQuantity(this.dataset.index, 0);
    });
  }
}
customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.lineItemStatusElement =
      document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus');
    const debouncedOnChange = debounce(event => this.validateQuantity(event), ON_CHANGE_DEBOUNCE_TIMER);
    this.addEventListener('change', debouncedOnChange);
  }

  cartUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, event => {
      if (event.source !== 'cart-items') this.onCartUpdate();
    });
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) this.cartUpdateUnsubscriber();
  }

  validateQuantity(event) {
    const inputValue = parseInt(event.target.value);
    const index = event.target.dataset.index;
    let message = '';

    if (inputValue < event.target.dataset.min) {
      message = window.quickOrderListStrings.min_error.replace('[min]', event.target.dataset.min);
    } else if (inputValue > parseInt(event.target.max)) {
      message = window.quickOrderListStrings.max_error.replace('[max]', event.target.max);
    } else if (inputValue % parseInt(event.target.step) !== 0) {
      message = window.quickOrderListStrings.step_error.replace('[step]', event.target.step);
    }

    if (message) {
      this.setValidity(event, index, message);
    } else {
      this.updateQuantity(
        index,
        inputValue,
        document.activeElement.getAttribute('name'),
        event.target.dataset.quantityVariantId
      );
    }
  }

  setValidity(event, index, message) {
    event.target.setCustomValidity(message);
    event.target.reportValidity();
    this.resetQuantityInput(index);
    event.target.select();
  }

  resetQuantityInput(id) {
    const input = this.querySelector(`#Quantity-${id}`);
    input.value = input.getAttribute('value');
    event.target.setCustomValidity('');
  }

  updateQuantity(line, quantity, name, variantId) {
    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map(section => section.section),
      sections_url: window.location.pathname
    });

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), body })
      .then(response => response.json())
      .then(parsedState => this.handleCartUpdate(parsedState, line, name, variantId))
      .catch(() => {
        const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
        errors.textContent = window.cartStrings.error;
      });
  }

  handleCartUpdate(parsedState, line, name, variantId) {
    if (parsedState.errors) {
      this.updateLiveRegions(line, parsedState.errors);
      return;
    }
    publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items', cartData: parsedState, variantId });
  }

  onCartUpdate() {
    if (this.tagName === 'CART-DRAWER-ITEMS') {
      fetch(`${routes.cart_url}?section_id=cart-drawer`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const selectors = ['cart-drawer-items', '.cart-drawer__footer'];
          for (const selector of selectors) {
            const targetElement = document.querySelector(selector);
            const sourceElement = html.querySelector(selector);
            if (targetElement && sourceElement) {
              targetElement.replaceWith(sourceElement);
            }
          }
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      fetch(`${routes.cart_url}?section_id=main-cart-items`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const sourceQty = html.querySelector('cart-items');
          this.innerHTML = sourceQty.innerHTML;
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }

  getSectionsToRender() {
    return [
      { id: 'main-cart-items', section: 'main-cart-items', selector: '.js-contents' },
      { id: 'cart-icon-bubble', section: 'cart-icon-bubble', selector: '.shopify-section' },
      { id: 'cart-live-region-text', section: 'cart-live-region-text', selector: '.shopify-section' },
      { id: 'main-cart-footer', section: 'main-cart-footer', selector: '.js-contents' }
    ];
  }
}
customElements.define('cart-items', CartItems);
