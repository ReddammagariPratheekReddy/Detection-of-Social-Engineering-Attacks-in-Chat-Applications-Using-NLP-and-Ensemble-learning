console.log(`This is the first log!`);

const filter = {
    url:[{hostContains: "http://127.0.0.1:8000/*"}]
};

async function triggerContent(details) {
    if (details.url){
        console.log(`Chat group webpage loaded: ${details.url}`);
        
        try{
            await browser.scripting.executeScript({
                target: { tabId : details.tabId },
                files: ["content.js"]
            });
        }
        catch (scriptErr) {
            console.error(`failed to execute script: ${scriptErr}`);
        }
    }
}

browser.webNavigation.onCompleted.addListener(triggerContent, filter);