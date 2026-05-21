function getRecentMessages(){
    const messageElement = document.querySelectorAll("#chat_from_sender");

    let messages = [];

    messageElement.forEach((messageEl) => {
        const sender = messageEl.querySelector("#message_author").textContent;
        const content = messageEl.querySelector("#message_body").textContent;
        const timestamp = messageEl.querySelector("#message_createtime").textContent;

        messages.push({sender, content, timestamp});
    });

    return messages;
}

function sendMessagesToBackground(messages){
    browser.runtime.sendMessage({
        type: "allMessages",
        messages
    });
}

function triggerContent() {
    console.log(`Test script activated: Reading messages...`);
    const messages = getRecentMessages();
    if (messages.length > 0) {
        sendMessagesToBackground(messages);
    } else {
        console.log("No new messages detected.");
    }
}

const filter = {
    url:[{hostContains: "http://127.0.0.1:8000/*"}]
};

browser.webNavigation.onCompleted.addListener(triggerContent, filter);