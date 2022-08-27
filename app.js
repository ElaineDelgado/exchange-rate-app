const currencyOneEl = document.querySelector('[data-js="currency-one"]')
const currencyTwoEl = document.querySelector('[data-js="currency-two"]')
const convertedValueEl = document.querySelector('[data-js="converted-value"]')
const currenciesEl = document.querySelector('[data-js="currencies-container"]')
const conversionPrecisionEl = document
  .querySelector('[data-js="conversion-precision"]')
const timesCurrencyEl = document.querySelector('[data-js="currency-one-times"]')

const showAlert = (err) => {
  const div = document.createElement('div')
  const button = document.createElement('button')

  div.textContent = err.message
  div.classList.add(
    'alert',
    'mt-3',
    'alert-warning',
    'alert-dismissible',
    'fade',
    'show',
  )
  button.classList.add('btn-close')
  div.setAttribute('role', 'alert')
  button.setAttribute('type', 'button')
  button.setAttribute('aria-label', 'Fechar')

  const removeAlert = () => div.remove()
  button.addEventListener('click', removeAlert)

  div.appendChild(button)

  currenciesEl.insertAdjacentElement('afterend', div)
}

const state = (() => {
  let exchangeRate = {}

  return {
    getExchangeRate: () => exchangeRate,
    setExchangeRate: (newExchangeRate) => {
      if (!newExchangeRate.conversion_rates) {
        showAlert(
          {
          message: 'O objeto não possui uma propriedade conversion_rates' 
          }
        )
      } 
      exchangeRate = newExchangeRate
      return exchangeRate
    }
  }
})()

const APIKey = '9cf76910c5b6f546ca12c49c'

const getUrl = (currency) =>
  `https://v6.exchangerate-api.com/v6/${APIKey}/latest/${currency}`

const getErrorMessage = (errorType) =>
  ({
    'unsupported-code': 'Moeda inválida (consulte as moedas suportadas).',
    'malformed-request': 'Solicitação não segue a estrutura correta.',
    'invalid-key': 'Chave da API inválida.',
    'inactive-account': 'Endereço de e-mail não confirmado.',
    'quota-reached': 'Cota de solicitações permitidas pelo seu plano atingida.',
  }[errorType] || 'Não foi possível obter as informações.')

const fetchExchangeRate = async (url) => {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Sua conexão falhou. Não foi possível obter as informações.')
    }

    const exchangeRateData = await response.json()

    if (exchangeRateData.result === 'error') {
      const errorMessage = getErrorMessage(exchangeRateData['error-type'])
      throw new Error(errorMessage)
    }

    return state.setExchangeRate(exchangeRateData)
  } catch (err) {
    showAlert(err)
  }
}

const getOptions = (selectedCurrency, conversion_rates) => {
  const setSelectedAttribute = currency => currency === selectedCurrency ? 'selected' : '' 
  const getOptionsArray = (currency) =>
    `<option ${setSelectedAttribute(currency)}>${currency}</option>`

  return Object.keys(conversion_rates)
    .map(getOptionsArray)
    .join('')
}

getMultipliedExchangeRate = (conversion_rates) => {
  const currencyTwo = conversion_rates[currencyTwoEl.value]
  return (timesCurrencyEl.value * currencyTwo).toFixed(2)
}

const getRowExchangeRate = (conversion_rates) => {
  const currencyTwo = conversion_rates[currencyTwoEl.value]
  return `1 ${currencyOneEl.value} = ${1 * currencyTwo} ${currencyTwoEl.value}`
}

const showUpdatedRates = ({ conversion_rates }) => {
  const multipliedExchangeRate = getMultipliedExchangeRate(conversion_rates)
  convertedValueEl.textContent = `Total: ${multipliedExchangeRate}`
  conversionPrecisionEl.textContent = getRowExchangeRate(conversion_rates)
}

const showInitialInfo = ({ conversion_rates }) => {
  currencyOneEl.innerHTML = getOptions('USD', conversion_rates)
  currencyTwoEl.innerHTML = getOptions('BRL', conversion_rates)

  showUpdatedRates({conversion_rates})  
}

const init = async () => {
  const url = getUrl('USD')
  const exchangeRate = (await fetchExchangeRate(url))
  
  if (exchangeRate && exchangeRate.conversion_rates) {
    showInitialInfo(exchangeRate)
  }
}

const handleTimesCurrencyElInput = () => {
  const { conversion_rates } = state.getExchangeRate()
  const multipliedExchangeRate = getMultipliedExchangeRate(conversion_rates)
  convertedValueEl.textContent = `Total: ${multipliedExchangeRate}`
}

const handleTimescurrencyTwoElInput = () => {
  const exchangeRate = state.getExchangeRate()
  showUpdatedRates(exchangeRate)
}

const handleCurrencyOneElInput = async (event) => {
  const url = getUrl(event.target.value)
  const exchangeRate = await fetchExchangeRate(url)

  showUpdatedRates(exchangeRate)
}

timesCurrencyEl.addEventListener('input', handleTimesCurrencyElInput)
currencyTwoEl.addEventListener('input', handleTimescurrencyTwoElInput)
currencyOneEl.addEventListener('input', handleCurrencyOneElInput)

init()
