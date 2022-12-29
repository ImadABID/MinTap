var host = "http://localhost:8080/minimisation";

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
         return {redirectUrl: host };
    },
    {
        urls: [
            "*://*/add_rule",
        ],
        types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
    },
    ["blocking"]
);