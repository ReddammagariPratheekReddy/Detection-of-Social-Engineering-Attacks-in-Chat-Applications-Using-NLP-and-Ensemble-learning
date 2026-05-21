const messageElement = document.querySelectorAll("#chat_from_me");

// messageElement.forEach((messageEl) => {
//     const sender = messageEl.getElementById("#message_author").textContent;
//     const content = messageEl.getElementById("#message_body").textContent;
//     const timestamp = messageEl.getElementById("#message_createtime").textContent;

//     messages.push({sender, content, timestamp});
// });

browser.runtime.sendMessage({
    type: "newMessages",
    messageElement
});