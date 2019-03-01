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
        }

        .ps-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          flex: 1;
        }

        .ps-currency {
          display: flex;
          justify-content: center;
          align-items: center;
          flex: 1;
        }

        .ps-borders {
          border-color: darkgray;
          border-width: 1.3px 0 1.3px 0;
          border-style: solid;
          padding: 6.5px 0;
        }

        a {
          text-decoration: none;
        }

        #price-simulator {
          border-color: darkgray;
          border-radius: 5px;
          border-width: 1px;
          border-style: solid;
          padding: 20px;
          wicth: auto;
          max-width: 500px;
          box-shadow: 5px;
        }

        .ps-city-selector {
          text-transform: capitalize;
          border-width: 0 0 1px 0;
          background-color: transparent;
          color: grey;
          width:200px;
        }

        .ps-product-selector {
          text-transform: capitalize;
          border: none;
          background-color: transparent;
          color: white;
          width:200px;
        }

        .ps-product-selector options {

        }

        .ps-selector-background {
          background-color: #184060;
          padding: 8px 4px;
        }

        .ps-taxes {
          font-size: 0.60em;
        }

        .ps-label {
          font-size: 0.8em;
          opacity: 0.8;
          margin-left: 5px;
        }

        .ps-input {
          border: none;
          width: 70px;
        }

        .ps-taxes p {
          opacity: 0.7;
          margin: 7px;
        }

        .ps-btn {
          background-color: #4CAF50; /* Green */
          border: none;
          color: white;
          padding: 7px 35px;
          text-align: center;
          text-transform: uppercase;
          text-decoration: none;
          display: inline-block;
          font-size: 0.9em;
          margin: 20px 0px;
        }

        .ps-padding {
          padding: 6px 0px;
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
        <div class="ps-padding">
          <select
            class="ps-city-selector"
            id="agentSelector"
            @change="${() => this.updateAgentCode()}"
          >
            ${agents.map(({ vuoriId, label }) => html`
              <option value=${vuoriId}>${label}</option>
            `)}
          <select>
        </div>
        <div class="ps-currency">
          <div class="ps-selector-background">
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
          <div class="ps-borders">
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
          <p>1 ${productCode} = R$ ${product.sellPrice ? product.sellPrice.toFixed(4) : '--'}</p>
          <p>IOF (1,10%) = R$ ${this.computedIof() || ' --'}</p>
          <p>VET = R$ ${this.computedVet() || '--'}</p>
        </div>
        <div class="ps-padding">
          <div>
            <span>Real<span>
          </div>
          <div>
            <label>BRL</label>
            <input
              id="currencyBRLInput"
              type="number"
              value="${currencyBRL}"
              @input="${() => this.setCurrencyBRL()}"
            >
          </div>
        </div>
        <div>
          <a
            href="${`https://frentetech.com.br/${this.correspondentId}/checkout?agentId=${agentCode}&productId=${productCode}&productAmount=${currency}&utm_source=${this.correspondentId}-simulator`}"
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
