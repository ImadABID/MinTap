//EXAMPLE RULE



if(service.lastMail.author == "test"){
  if(service.lastMail.content.includes("hello world")){
    service.push_notification();
  }
}
