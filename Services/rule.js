//EXAMPLE RULE

if(myService.lastMail.author == "test"){
  if(myService.lastMail.content.includes("hello world")){
    myService.push_notification();
  }
}
