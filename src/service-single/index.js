if (false) {
  app.log.debug("Single Service %s loading with id %d", module.filename, app.id)
  // setup email data with unicode symbols
  let mailOptions = {
    from: '"Varun Batra" <codevarun@gmail.com>', // sender address
    to: '"Varun Batra" <codevarun@gmail.com>', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world ?', // plain text body
    html: '<b>Hello world ?</b>' // html body
  };

  // send mail with defined transport object
  app.transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
  });
}
