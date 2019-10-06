import { create } from 'stx/dist/es'

const client = create()
let connection = client.connect('ws://localhost:7071')
let connected
let disconnectTimeout

client.on('connected', status => {
  connected = status
})

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    if (connected) {
      disconnectTimeout = setTimeout(
        () => connection.socket.close(), 3000
      )
    }
  } else {
    clearTimeout(disconnectTimeout)
    if (!connected) {
      connection = client.connect('ws://localhost:7071')
    }
  }
})

export default client
