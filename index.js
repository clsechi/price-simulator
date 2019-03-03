// LitElement and html are the basic required imports
import { LitElement, html, css } from 'lit-element';

class PriceSimulator extends LitElement {
  static get properties() {
    return {
      products: { type: Array },
      agents: { type: Array },
      currency: { type: Number },
      currencyBRL: { type: Number },
      productCode: { type: String },
      product: { type: Object },
      agentCode: {type: String },
    };
  }

  static get styles() {
    return [
      css`
        :host {
          font-family: sans-serif;
          color: #898989;
        }

        .loader {
          position: absolute;
          border: 3px solid #fff; /* Light grey */
          border-top: 3px solid #184060; /* Blue */
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 1s linear infinite;
          z-index: 999;
        }

        .no-show {
          display: none !important;
        }
        
        .bg-black {
          position: absolute;
          z-index: 998;
          width: 100%;
          height: 100%;
          background-color: #f3f3f3;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .ps-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border-color: darkgray;
          border-radius: 5px;
          border-width: 1px;
          border-style: solid;
          padding: 20px;
          width: auto;
          box-shadow: 5px;
          box-sizing: border-box;
        }

        .ps-currency {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .ps-borders {
          border-color: darkgray;
          border-width: 1.3px 0 1.3px 0;
          border-style: solid;
          padding: 6.5px 0;
        }

        .full-width {
          width: 100%
        }

        .ps-city-selector {
          text-transform: capitalize;
          border-width: 0 0 1px 0;
          background-color: transparent;
          color: grey;
        }

        .ps-custom-select {
          background-color: #184060;
          padding: 8px 4px;
          max-width: 170px;
          width: 200px;
        }

        .ps-custom-select option {
          color: white;
          background: #184060;
        }

        .ps-custom-select select {
          text-transform: capitalize;
          border: none;
          background-color: transparent;
          color: white;
        }

        .ps-custom-select span {
          color: white;
          margin-left: 10px;
          font-size: 0.85em;
        }

        .align-center {
          display: flex;
          align-items: center;
        }

        .justify-center {
          display: flex;
          justify-content: center;
        }

        .flex-center {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .ps-custom-select .icon {
          margin-left: 5px;
        }

        .ps-label {
          font-size: 0.8em;
          opacity: 0.8;
          margin-right: 5px;
        }

        .ps-input {
          border: none;
          width: 100px;
        }

        .ps-taxes {
          width: 100%;
          display: flex;
          justify-content: flex-end
        }

        .ps-taxes .margin{
          margin-right: 15%
        }


        .ps-taxes p {
          font-size: 0.60em;
          opacity: 0.7;
          margin: 7px;
        }

        .ps-btn {
          background-color: #009688;
          border: none;
          color: white;
          padding: 10px 30px;
          text-align: center;
          text-transform: uppercase;
          text-decoration: none;
          display: inline-block;
          font-size: 0.9em;
          margin: 20px 0px;
        }

        .ps-padding {
          padding: 7px 0px;
        }
        
        .ps-footer {
          opacity: 0.4;
          font-size: 0.7em; 
        }
      `,
    ];
  }

  constructor() {
    super();
    this.products = [];
    this.agents = [];
    this.correspondentId = this.getAttribute('correspondent_id');
    this.currency = 1000;
    this.product = { sellPrice: 0 };
  }

  async firstUpdated() {
    await this.getAgents();
    await this.getProducts();
  }

  async getAgents() {
    const response = await fetch(`https://api.frentecorretora.com.br/v1/correspondents/${this.correspondentId}/agents?orderByLocation=true`)
    this.agents = await response.json();
    this.agentCode = this.agents[0].vuoriId;
  }

  async getProducts() {
    const response = await fetch(`https://api.frentecorretora.com.br/v1/exchanges/products/${this.agentCode}`)
    this.products = await response.json();
    this.productCode = this.product.productCode ? this.productCode : this.products[0].productCode;
    this.updateProduct();
    this.updateCurrencyBRL();
  }

  setCurrency() {
    this.currency = +this.shadowRoot.getElementById('currencyInput').value;
    this.updateCurrencyBRL();
  }
  
  updateCurrency() {
    this.currency = +(this.currencyBRL / this.product.sellPrice).toFixed(2);
  }

  setCurrencyBRL() {
    this.currencyBRL = +this.shadowRoot.getElementById('currencyBRLInput').value;
    this.updateCurrency();
  }

  updateCurrencyBRL() {
    this.currencyBRL = +(this.currency * this.computedVet()).toFixed(2);
  }

  async updateAgentCode() {
    this.agentCode = this.shadowRoot.getElementById('agentSelector').value;
    await this.getProducts();
  }

  updateProductCode() {
    this.productCode = this.shadowRoot.getElementById('productSelector').value;
    this.updateProduct();
  }

  updateProduct() {
    this.product  = this.products.find(({ productCode }) => productCode === this.productCode);
  }

  computedIof() {
    return +(this.currencyBRL * 0.011).toFixed(2);
  }

  computedVet() {
    return +(this.product.sellPrice + (this.product.sellPrice * 0.011)).toFixed(4);
  }

  totalValue() {
    return this.currencyBRL + this.computedIof();
  }

  render() {
    const {
      agentCode,
      agents,
      products,
      currency,
      currencyBRL,
      product,
      productCode,
    } = this;

    return html`
      <div id="price-simulator" class="ps-container">
        <div class="bg-black flex-center no-show">
          <div class="loader"></div>
        </div>
        <div class="ps-padding full-width">
          <select
            class="ps-city-selector full-width"
            id="agentSelector"
            @change="${() => this.updateAgentCode()}"
          >
            ${agents.map(({ vuoriId, label }) => html`
              <option value=${vuoriId}>
                ${label}
              </option>
            `)}
          <select>
        </div>
        <div class="ps-currency ps-padding full-width">
          <div class="ps-selector-background ps-custom-select">
            <select
              class="ps-product-selector"
              id="productSelector"
              @change="${() => this.updateProductCode()}"
            >
              ${products.map(({ productCode, currency }) => html`
                <option value=${productCode}>${productCode} - ${currency.toLowerCase()}</option>
              `)}
            </select>
          </div>
          <div class="ps-borders full-width justify-center">
            <label class="ps-label">${productCode}</label>
            <input
              id="currencyInput"
              class="ps-input"
              type="number"
              step="10"
              min="0"
              value="${currency}"
              @input="${() => this.setCurrency()}"
            >
          </div>
        </div>
        <div class="ps-taxes">
          <div class="margin">
            <p>1 ${productCode} = R$ ${product.sellPrice ? product.sellPrice.toFixed(4) : '--'}</p>
            <p>IOF (1,10%) = R$ ${this.computedIof() || ' --'}</p>
            <p>VET = R$ ${this.computedVet() || '--'}</p>
          </div>
        </div>
        <div class="ps-currency ps-padding full-width">
          <div class="ps-selector-background ps-custom-select align-center">
            <svg height="20" width="20" class="icon">
              <circle cx="10" cy="10" r="10" fill="grey" />
            </svg>
            <span>Real<span>
          </div>
          <div class="ps-borders full-width justify-center align-center">
            <label class="ps-label">BRL</label>
            <input
              id="currencyBRLInput"
              type="number"
              class="ps-input"
              value="${currencyBRL}"
              @input="${() => this.setCurrencyBRL()}"
            >
          </div>
        </div>
        <div>
          <a
            href="${`https://frentetech.com.br/${this.correspondentId}/checkout?agentId=${agentCode}&productId=${productCode}&productAmount=${currency}`}"
            target="_blank"
            class="ps-btn"
          >
            Comprar
          </a>
        </div>
        <small class="ps-footer">powered by FrenteTech<small>
      </div>
    `;
  }
}

// Register your element to custom elements registry, pass it a tag name and your class definition
// The element name must always contain at least one dash

customElements.define('price-simulator', PriceSimulator);
