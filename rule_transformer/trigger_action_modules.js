let Office365Mail = {
    newEmail : {
        Subject : '[IFTTT] Urgent mail',
        Body : 'Mr Freeman,\nIt is urgent.\nRegards,\nFreewoman'
    }
}

let Slack = {
    postToChannel : {
        skip : ()=>{},
        setMessage : (msg_str) => {console.log(`Slack sending : ${msg_str}`)}
    }
}

module.exports.Office365Mail = Office365Mail;
module.exports.Slack = Slack;