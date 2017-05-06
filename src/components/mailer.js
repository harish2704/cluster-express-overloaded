import {forOwn, isArray} from 'lodash'
const nodemailer = require('nodemailer')
let app = global.app
// create reusable transporter object using the default SMTP transport
let mailer = {}
mailer.transporters = {}
forOwn(app.config.app.mail.transporters, (config, key) => {
  mailer.transporters[key] = nodemailer.createTransport(config)
})
mailer.transporters['default'] = mailer.transporters[app.config.app.mail.defaultTransporter]

mailer.mail = (to, from, subject, text, html = text, transport = 'default') => {
  let transporter = mailer.transporters[transport]
  if (isArray(to)) {
    to = to.join(',')
  }
  let mailOptions = {
    from: from,
    to: to,
    subject: subject,
    text: text, // plain text body
    html: html // html body
  }

  // send mail with defined transport object
  app.emit("beforeEmail", mailOptions)
  transporter.sendMail(mailOptions, (error, info) => {
    app.emit('email', error, info)
    if (error) {
      app.emit('errorOnEmail', error, info)
      return app.log.error(error)
    }
    app.emit('emailSent', info)
    app.log.info('Message %s sent: %s', info.messageId, info.response)
  })
}
module.exports = mailer
