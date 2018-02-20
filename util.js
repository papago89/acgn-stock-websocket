import * as astroid from 'asteroid'
import WebSocket from 'ws'

export function waitUntil(condition, action) {
  const handle = setInterval(() => {
    if (condition()) {
      action()
      clearInterval(handle)
    }
  }, 0)
}

export function createConnection() {
  const Asteroid = astroid.createClass()
  const connection = new Asteroid({
    endpoint: 'wss://acgn-stock.com/websocket',
    SocketConstructor: WebSocket,
  })
  connection.on('connected', () => console.log('connected'))
    .on('disconnected', () => console.log('disconnected'))
  connection.ddp.on('error', message => console.error(`Error occured: ${JSON.stringify(message, null, 2)}`))
    .on('ready', ({subs}) => console.log(`${new Date()} [ready] subs ${subs}`))
    .on('unsub', ({id}) => console.log(`${new Date()} [unsub] id ${id}`))
    .on('nosub', ({id}) => console.log(`${new Date()} [nosub] id ${id}`))
    .on('added', ({collection, id, fields}) => {
      console.log(`${new Date()} [added] ${collection} ${id}`)
      // console.log(JSON.stringify(fields, null, 2))
    })
    .on('changed', ({collection, id, fields, cleared}) => {
      console.log(`${new Date()} [changed] ${collection} ${id}`)
      // if (fields) console.log(`changed => ${JSON.stringify(fields, null, 2)}`)
      // if (cleared) console.log(`cleared => ${JSON.stringify(cleared, null, 2)}`)
    })
    .on('removed', ({collection, id}) => {
      console.log(`${new Date()} [removed] ${collection} ${id}`)
    })

  return connection
}
