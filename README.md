# price-simulator

# This is as WORK IS PROGRESS

## Como tudo funciona

Temos três entidades em questão:

 - CORRESPONDENT
 - AGENTS
 - EXCHANGES

 **CORRESPONDENT** é resposável por retornar os dados do correspondente em questão recebendo um identificador unico na request. Ex: *matriz*

 **AGENT** pertence a um CORRESPONDENT e pode ser visualizado como a cidade de venda moeda, ele contem todos os dados sobre a cidade escolhida pelo cliente e tambèm possui um identicador unico. Ex: *WL-FRENTE-SP*

 **EXCHANGES** é resposável por retornar as taxas das moedas dispíveis da cidade escolhida pelo cliente, baseado na no código AGENT

 ____

## Como obter os AGENTS

O endpoint utilizado, passando o `correspondent_id` do corresondente em questão.

`https://api.frentecorretora.com.br/v1/correspondents/{correspondent_id}/agents`

Response:

```json
[
  {
    "vuoriId": "WL-FRENTE-BH",
    "label": "Belo Horizonte",
    "correspondentId": 1,
    "state": "MG",
    "storeId": 1,
    "isETech": true,
    "createdAt": "2018-10-02T19:00:00.000Z",
    "updatedAt": "2018-10-02T19:00:00.000Z",
    "pipeId": 6
  },
  {
    "vuoriId": "WL-FRENTE-CTB",
    "label": "Curitiba",
    "correspondentId": 1,
    "state": "PR",
    "storeId": 6,
    "isETech": true,
    "createdAt": "2018-10-02T19:00:00.000Z",
    "updatedAt": "2018-10-02T19:00:00.000Z",
    "pipeId": 3
  },
]
```

Nesse caso, vamos utilizar somente `vuoriId` e `label`

Com esses dados conseguimos exibir um select para o cliente selecionar a cidade e a partir disso obtemos as taxas dessa cidade

___

## Como obter os EXCHANGES

O endpoint utilizado, passando o `vuori_id` do corresondente em questão.

`https://api.frentecorretora.com.br/v1/exchanges/products/{vuori_id}`

Response:

```json
[
  {
    "productCode": "USD",
    "value": 0,
    "sellPrice": 3.994958,
    "iof": 1.1,
    "currency": "DÓLAR AMERICANO",
    "currencyAbbreviation": "$",
    "maxToSell": 3000,
    "minToSell": 200,
    "quotationId": "84e20a12-4c5e-4295-a5e4-1c3a150c7a1c",
    "multiples": [
      100
    ]
  },
  {
    "productCode": "EUR",
    "value": 0,
    "sellPrice": 4.491775,
    "iof": 1.1,
    "currency": "EURO",
    "currencyAbbreviation": "€",
    "maxToSell": 3000,
    "minToSell": 200,
    "quotationId": "c5a6351c-1018-4adb-842c-31633c32494f",
    "multiples": [
      100
    ]
  }
]
```

Nesse caso, vamos utilizar somente `productCode`, `sellPrice`, `iof`, `currency`

Com esses dados conseguimos exibir um select para o cliente selecionar a moeda e a partir disso calculamos a coversão.
____

## O Cálculo

Com esses dados conseguimos exibir os valores de quando vai custar em **REAIS** a cotação escolhida pelo cliente.

Um cliente deseja comprar **1000 USD** e temos uma taxa de `R$ 3.975365`

```js
let currentProduct = {};

const setCurrentProduct = (agentCode) => {
  currentProduct = products.find(({ vuoriId }) => vuoriId === agentCode);
}

@click = (agendCode) => setCurrenctProduct(agentCode);

console.log(currentProduct);
/**
  {
    productCode: "USD",
    value: 0,
    sellPrice: 3.975365,
    iof: 1.1,
    currency: "DÓLAR AMERICANO",
    currencyAbbreviation: "$",
    maxToSell: 3000,
    minToSell: 200,
    quotationId: "05c42647-46da-46a4-a5f8-2a7556d13f3c",
    multiples: [
    100
    ]
  }
*/

const currency = () => getInputCurrencyValue();
// 1000

const iofMultiplicator = () => currentProduct.iof / 100;
// 0.011

const computedVet = () =>  +(currentProduct.sellPrice + (currentProduct.sellPrice * iofMultiplicator())).toFixed(2)
// 4.0191

const currencyBRL = () => currency() * computedVet();
// 4019.10

const computedIof = () => +(currencyBRL() * iofMultiplicator()).toFixed(2);
// 44.21

```
## Integração

Você deve montar a URL e redirecionar para ela ou abrir em uma nova guia conforme ação do usuario

`agentId` = id da cidade escolhida pelo usuario

`productId` = id da moeda escolhida pelo usuario

`productAmount` = quantidade da moeda escolhida pelo usuario

`utm_source` = usado para tracking no google analitics

A url ira ficar dessa forma, usando o exemplos acima

`https://frentetech.com.br/matriz/app/checkout/paper-money?agentId=WL-FRENTE-SP&productId=USD&productAmount=1000&utm_source=matriz-simulator`
