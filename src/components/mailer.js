import forOwn from "lodash/forOwn"

const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
app.transporter = {}
forOwn(app.config.mail, (key, config) => {
  app.transporter[key] = nodemailer.createTransport(config);
})
