const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'ghariani.aymen1997@gmail.com',
        pass: 'bihkbdtffaacpzjc'
    }
});

app.post('/tap/sendMail', async (req, res) => {

    const mailOptions = {
        from: 'ghariani.aymen1997@gmail.com',
        to: req.body.receiver,
        subject: 'Sending Email from MinTap',
        text: req.body.message
    };
    res.send("email sent");
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

})

const port = 3007;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})