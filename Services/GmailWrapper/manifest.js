//MANIFEST.js

class GmailClass {

  constructor() { }

  sendMail(message, receiver) {
    let data = {
      'message': message,
      'receiver': receiver
    };
    const API_URL = "127.0.0.1:3007";
    fetch(`http://${API_URL}/tap/sendMail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

}

// Testing

const main = async () => {

  const Gmail = new GmailClass();
  Gmail.sendMail("it was easy to do that", "imad.abied@gmail.com");

}
main();