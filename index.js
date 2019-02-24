// LitElement and html are the basic required imports
import { LitElement, html, css } from 'lit-element';

const capitalize = str => str.replace(/(^\S|\s\S)/g, (_ ,g1) => g1.toUpperCase());

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

  constructor() {
    super();
    this.products = [];
    this.agents = [];
    this.correspondentId = this.getAttribute('correspondent_id');
    this.agentCode = null;
    this.currency = 1000;
    this.currencyBRL = null;
    this.productCode = null;
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
    this.currency = this.shadowRoot.getElementById('currencyInput').value;
    this.updateCurrencyBRL();
  }
  
  updateCurrency() {
    this.currency = +(this.currencyBRL / this.product.sellPrice).toFixed(2);
  }

  setCurrencyBRL() {
    this.currencyBRL = (this.shadowRoot.getElementById('currencyBRLInput').value - this.computedIof());
    this.updateCurrency();
  }

  updateCurrencyBRL() {
    this.currencyBRL = +(this.currency * this.product.sellPrice).toFixed(2);
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
      product,
      productCode,
    } = this;

    return html`
      <div>
        <label>Onde você está?</label>
        <select
          id="agentSelector"
          @change="${() => this.updateAgentCode()}"
        >
          ${agents.map(({ vuoriId, label }) => html`
            <option value=${vuoriId}>${label}</option>
          `)}
        <select>
      </div>
      <div>
        <select
          id="productSelector"
          @change="${() => this.updateProductCode()}"
        >
          ${products.map(({ productCode, currency }) => html`
            <option value=${productCode}>${productCode} - ${capitalize(currency.toLowerCase())}</option>
          `)}
        </select>
        <input
          id="currencyInput"
          type="number"
          value="${currency}"
          @input="${() => this.setCurrency()}"
        >
        </input>
      </div>
      <div>
        <p>1 ${productCode} = R$ ${product.sellPrice.toFixed(4)}</p>
        <p>IOF (1,10%) = R$ ${this.computedIof()}</p>
        <p>VET = ${this.computedVet()}</p>
      </div>
      <div>
        <label>BRL</label>
        <input
          id="currencyBRLInput"
          type="number"
          value="${this.totalValue()}"
          @input="${() => this.setCurrencyBRL()}"
        >
        </input>
      </div>
      <div>
        <a
          href="${`https://frentetech.com.br/${this.correspondentId}/checkout?agentId=${agentCode}&productId=${productCode}&productAmount=${currency}`}"
          target="_blank"
          class="btn"
        >
          Comprar
        </a>
      </div>
      <small>powered by FrenteTech<small>
    `;
  }
}

// Register your element to custom elements registry, pass it a tag name and your class definition
// The element name must always contain at least one dash

customElements.define('price-simulator', PriceSimulator);
