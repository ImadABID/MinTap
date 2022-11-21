
const WEB_REQUEST = chrome.webRequest;

WEB_REQUEST.onBeforeRequest.addListener(
    function(details) {
        if(details.method == "POST")
        console.log("hereeeee");
        console.log(details.requestBody.formData);
    },
    {urls: ["<all_urls>"]},
    ["blocking", "requestBody"]
);