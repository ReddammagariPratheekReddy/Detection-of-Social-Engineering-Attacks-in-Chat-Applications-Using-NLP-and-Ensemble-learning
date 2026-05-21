browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(`Background script is running`);

    if (request.type === "newMessages") {
        const messages = request.messageElement;
        messages.forEach(message => {
            console.log(`${message}`);
        });

        sendResponse({ status : "Messages received!" });
    }
})