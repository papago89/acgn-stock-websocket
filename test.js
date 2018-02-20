import {createConnection, waitUntil} from './util'
const request = require('request')

const listPriceWebHooksUrl = ''
const highPriceWebHooksUrl = ''
const noDealWebHooksUrl = ''
const CONSTANT = { listPrice: 0, highPrice: 1, noDeal: 2}

let recordListPriceBegin, recordListPriceEnd, releaseStocksForHighPriceBegin, releaseStocksForHighPriceEnd, releaseStocksForNoDealBegin, releaseStocksForNoDealEnd

function getTimeString(date) {
  // getMonth()	Returns the month (from 0-11) ....為了正常顯示1~12月 手動+1
  return `${('0' + (date.getMonth() + 1)).slice(-2)}/${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`
}

function sendMessage(url, type) {
  let message, timeA, timeB, options
  switch(type) {
    case CONSTANT.highPrice:
      timeA = new Date(releaseStocksForHighPriceBegin)
      timeB = new Date(releaseStocksForHighPriceEnd)
      message = `%%save A \n<:stone:362522869022064641>下次高價釋股${getTimeString(timeA)} ~ ${getTimeString(timeB)} (UTC+8)<:stone:362522869022064641>\n`
      break
    case CONSTANT.noDeal:
      timeA = new Date(releaseStocksForNoDealBegin)
      timeB = new Date(releaseStocksForNoDealEnd)
      message = `%%save B \n<:stone:362522869022064641>下次低量釋股${getTimeString(timeA)} ~ ${getTimeString(timeB)} (UTC+8)<:stone:362522869022064641>\n`
      break
    case CONSTANT.listPrice:
      timeA = new Date(recordListPriceBegin)
      timeB = new Date(recordListPriceEnd)
      message = `%%save C \n<:stone:362522869022064641>下次股價更新${getTimeString(timeA)} ~ ${getTimeString(timeB)} (UTC+8)<:stone:362522869022064641>\n`
      break
  }
  options = {
    uri: url,
    method: 'POST',
    json: {
      'content': message
    }
  }
  console.log(JSON.stringify(options))
  request.post(options)
}

function watchVariables() {
  console.log('watchVariables()')
  
  function addedOrChangedHandler({collection, id, fields}) {
    if (collection === 'variables') {
      console.log(`${id} = ${fields.value}`)
      switch(id) {
        case 'recordListPriceBegin':
          recordListPriceBegin = fields.value
          break
        case 'recordListPriceEnd':
          recordListPriceEnd = fields.value
          setTimeout(sendMessage, 5000, listPriceWebHooksUrl, CONSTANT.listPrice)
          break
        case 'releaseStocksForHighPriceBegin':
          releaseStocksForHighPriceBegin = fields.value
          break
        case 'releaseStocksForHighPriceEnd':
          releaseStocksForHighPriceEnd = fields.value
          setTimeout(sendMessage, 5000, highPriceWebHooksUrl, CONSTANT.highPrice)
          break
        case 'releaseStocksForNoDealBegin':
          releaseStocksForNoDealBegin = fields.value
          break
        case 'releaseStocksForNoDealEnd':
          releaseStocksForNoDealEnd = fields.value
          setTimeout(sendMessage, 5000, noDealWebHooksUrl, CONSTANT.noDeal)
          break
      }
    }
  }
  function subscribeVariables() {
    connection.subscribe('variables')
      .on('ready', () => console.log(`subscription to variables`))
      .on('error', message => {
        const {error, details} = message
        console.error(`error subscribing to variables: ${error}`)
        if (error === 'too-many-requests') {
          setTimeout(() => subscribeVariables(), 10000)
        } else {
          console.error(JSON.stringify(message, null, 2))
          setTimeout(() => subscribeVariables(), 10000)
        }
      })
  }
  const connection = createConnection()
  connection.ddp
    .on('added', addedOrChangedHandler)
    .on('changed', addedOrChangedHandler)

  subscribeVariables()
}

watchVariables()
