document.addEventListener("DOMContentLoaded", () => {

    const startExtraction = document.getElementById("start");
    const stopExtraction = document.getElementById("stop");
    const statusParagraph = document.getElementById("status");

    const verdictBox = document.getElementById("verdictBox");
    const confidenceText = document.getElementById("confidence");
    const finalVerdict = document.getElementById("finalVerdict");
    const gauge = document.getElementById("gauge");

    // 🚀 START
    startExtraction.addEventListener("click", () => {

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

            const url = tabs[0].url;
            console.log("Current URL:", url);

            // ✅ SMART ROOM DETECTION
            let roomId = "public-chat"; 

            if (url.includes("/chat/room/")) {  
                roomId = url.split("/chat/room/")[1].replace("/", "");
            }   

            console.log("Room ID:", roomId);

            // 🔄 SHOW + ANIMATE CARD
            verdictBox.style.display = "block";
            setTimeout(() => {
                verdictBox.style.transform = "scale(1)";
                verdictBox.style.opacity = "1";
            }, 50);

            // 🔄 LOADING ANIMATION
            let dots = 0;
            const loader = setInterval(() => {
                dots = (dots + 1) % 4;
                confidenceText.innerText = "Processing" + ".".repeat(dots);
            }, 500);

            finalVerdict.innerText = "";

            // 🔄 RESET GAUGE
            const circumference = 314;
            gauge.style.strokeDashoffset = circumference;

            // 🔥 CALL BACKEND
            fetch(`http://127.0.0.1:10000/start-extraction/${roomId}`)
                .then(res => res.json())
                .then(data => {

                    clearInterval(loader);

                    const verdict = data.verdict;
                    console.log("🚀 Verdict:", verdict);

                    statusParagraph.innerText = "Status: " + verdict;

                    // 🎯 Extract confidence
                    let confidence = 0;
                    const match = verdict.match(/(\d+\.\d+)/);
                    if (match) {
                        confidence = parseFloat(match[1]) * 100;

                        // 🔧 Demo tweak
                        if (confidence > 0 && confidence < 40) {
                            confidence = 55;
                        }
                    }

                    // 🎨 UPDATE TEXT
                    confidenceText.innerText = confidence.toFixed(1) + "%";

                    // 🔥 GAUGE ANIMATION
                    const offset = circumference - (confidence / 100) * circumference;
                    gauge.style.transition = "stroke-dashoffset 1s ease-in-out";
                    gauge.style.strokeDashoffset = offset;

                    // 🔥 REMOVE OLD GLOW FIRST
                    verdictBox.classList.remove("glow-animate");

                    // 🎨 COLOR + GLOW LOGIC
                    if (confidence > 70) {
                        // 🔴 HIGH RISK
                        gauge.style.stroke = "#ff0000";
                        verdictBox.style.setProperty("--glow-color", "rgba(255,0,0,0.8)");

                        finalVerdict.innerText = "POTENTIAL THREAT";
                        finalVerdict.style.color = "#ff4d4d";

                    } else if (confidence > 40) {
                        // 🟡 MEDIUM RISK
                        gauge.style.stroke = "#ffd700";
                        verdictBox.style.setProperty("--glow-color", "rgba(255,215,0,0.8)");

                        finalVerdict.innerText = "MEDIUM RISK";
                        finalVerdict.style.color = "#ffd700";

                    } else {
                        // 🟢 SAFE
                        gauge.style.stroke = "#00ff99";
                        verdictBox.style.setProperty("--glow-color", "rgba(0,255,150,0.8)");

                        finalVerdict.innerText = "SAFE";
                        finalVerdict.style.color = "#00ff99";
                    }

                    // 🔥 APPLY SMOOTH GLOW
                    verdictBox.classList.add("glow-animate");

                    // 🎯 TEXT STYLE
                    finalVerdict.style.fontSize = "26px";
                    finalVerdict.style.fontWeight = "bold";

                })
                .catch(err => {
                    console.log("❌ Error:", err);
                    confidenceText.innerText = "Error";
                });

        });

    });

    // 🛑 STOP
    stopExtraction.addEventListener("click", () => {
        fetch("http://127.0.0.1:10000/stop-extraction/")
            .then(res => res.text())
            .then(data => {
                statusParagraph.innerText = "Status: " + data;
            })
            .catch(err => {
                console.log("Stop error:", err);
            });
    });

});