const crypto = require('crypto')

let increment = 0

const generateId = () => {
  const time = Date.now()

  const timeArray = Uint8Array.of(
    time / 2 ** 32,
    increment,
    time >>> 24,
    time >>> 16,
    time >>> 8,
    time
  )

  increment = (increment + 13) % 255

  return Buffer.concat([
    crypto.randomBytes(3),
    timeArray,
    crypto.randomBytes(3)
  ]).toString('base64')
    .replace(/\+/g, (1 << Date.now() >>> 7).toString(36))
    .replace(/\//g, (time >>> 5).toString(36))
    .replace(/=+$/, increment.toString(36))
}

module.exports = {
  generateId
}
