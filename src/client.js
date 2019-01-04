import { create } from 'stx/dist/es'

const client = create()
client.connect('ws://localhost:7071')

export default client
