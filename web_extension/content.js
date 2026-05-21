console.log("✅ Content script loaded");

function showAlert(message) {
    const alertBox = document.createElement("div");

    alertBox.innerText = message;

    alertBox.style.position = "fixed";
    alertBox.style.top = "20px";
    alertBox.style.right = "20px";
    alertBox.style.padding = "15px";
    alertBox.style.backgroundColor = "red";
    alertBox.style.color = "white";
    alertBox.style.fontSize = "16px";
    alertBox.style.borderRadius = "10px";
    alertBox.style.zIndex = "9999";

    document.body.appendChild(alertBox);

    setTimeout(() => {
        alertBox.remove();
    }, 5000);
}

chrome.runtime.onMessage.addListener((request) => {
    console.log("📩 Message received:", request);

    if (request.type === "SHOW_ALERT") {
        showAlert(request.message);
    }
});