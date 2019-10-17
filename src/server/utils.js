const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const nodemailer = require('nodemailer')

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
    .replace(/\+/g, (1 << time >>> 7).toString(36))
    .replace(/\//g, (time >>> 5).toString(36))
    .replace(/=+$/, increment.toString(36))
}

let privateKey, publicKey

fs.readFile(path.join(__dirname, 'private.key'), (error, pK) => {
  if (error) {
    console.log('Can not read private key file', error)
    process.exit()
  } else {
    privateKey = crypto.createPrivateKey(pK)
  }
})

fs.readFile(path.join(__dirname, 'public.key'), (error, pK) => {
  if (error) {
    console.log('Can not read public key file', error)
    process.exit()
  } else {
    publicKey = crypto.createPublicKey(pK)
  }
})

const fromBase64 = base64 => base64
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=/g, '')

const toBase64 = base64Url => {
  const mod = base64Url.length % 4
  if (mod) {
    base64Url += '===='.slice(mod)
  }

  return base64Url
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
}

const createSignedToken = (data, ttl) => {
  const signer = crypto.createSign('RSA-SHA512')
  const payload = Buffer.from(JSON.stringify({ data, ttl }))
  signer.update(payload)
  const signature = signer.sign({
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
  }, 'base64')
  return fromBase64(payload.toString('base64')) + '.' + fromBase64(signature)
}

const verifySignedToken = (token) => {
  const [payload, signature] = token.split('.')
    .map(str => Buffer.from(toBase64(str), 'base64'))

  const { data, ttl } = JSON.parse(payload.toString())
  if (ttl <= Date.now()) {
    throw ('Expired token')
  }

  const verifier = crypto.createVerify('RSA-SHA512')
  verifier.update(payload)
  const result = verifier.verify({
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
  }, signature)

  if (!result) {
    throw ('Invalid token')
  }

  return data
}

let transporter

fs.readFile(path.join(__dirname, 'google_private.key'), (error, pK) => {
  if (error) {
    console.log('Can not read google private key file', error)
    process.exit()
  } else {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: 'foraa@foraa.com',
        serviceClient: '113087642602199923488',
        privateKey: pK.toString()
      }
    })
  }
})

const sendMail = async (to, name, subject, text) => {
  const info = await transporter.sendMail({
    from: '"Foraa" <foraa@foraa.com>',
    to: `${name} <${to}>`,
    subject: subject,
    text: text,
    html: `<div style="margin: 1rem auto;padding:0;width:600px;"><img src="cid:kGtA8i3tr2TdQ8h3p4eD@foraa.com" style="float:left;margin:0;padding:0;width:100px;" /><h1 style="float:left;margin:0;padding:0;line-height:42px;width:500px;text-align:center;font-family: medium-content-serif-font, Georgia, Cambria, Times, serif;font-size:1.5rem;">${subject}</h1><p style="float:left;margin:1.5rem;padding:0;font-family: medium-content-serif-font, Georgia, Cambria, Times, serif;font-size:1.2rem;">${text}</p></div>`,
    attachments: [{
      filename: 'logo.png',
      path: path.join(__dirname, 'logo.png'),
      cid: 'kGtA8i3tr2TdQ8h3p4eD@foraa.com'
    }]
  })
}

module.exports = {
  generateId,
  createSignedToken,
  verifySignedToken,
  sendMail
}
