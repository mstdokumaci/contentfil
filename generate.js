const {
  createSignedToken,
  sendMail
} = require('./src/server/utils')

setTimeout(() => {
  const to = 'mustafa@foraa.com'
  const name = 'Mustafa Dokumacı'
  const token = createSignedToken(to, Date.now() + 86400000)
  sendMail(
    to,
    name,
    'Confirm your e-mail',
    `Hi ${name}, if you want to confirm ownership of your e-mail address (${to}) with us, please click <a href="http://localhost:8080/confirm/${token}">this link</a>. If you think it was someone else using your address, please report us by sending an e-mail back. Thank you.`
  )
}, 100)
