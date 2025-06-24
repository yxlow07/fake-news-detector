chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: detectFakeNews,
    });
});

function detectFakeNews() {
    const articleText = document.body.innerText || "";

    console.log("Article text extracted:", articleText);

    if (!articleText) {
        console.log("No text found in the article.");
        return;
    }

    // Create notification to indicate processing
    const processingNotification = document.createElement('div');
    processingNotification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2196F3;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        font-size: 16px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    processingNotification.textContent = 'Analyzing the news article...';
    document.body.appendChild(processingNotification);

    setTimeout(() => {
        if (processingNotification.parentNode) {
            processingNotification.parentNode.removeChild(processingNotification);
        }
    }, 2000);

    fetch('https://fake-news-detector-v5xz.onrender.com/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: articleText })
    })
    .then(response => response.json())
    .then(data => {
        // remove processing notification
        if (processingNotification.parentNode) {
            processingNotification.parentNode.removeChild(processingNotification);
        }

        console.log('Prediction data:', data);
        const result = data.prediction == 1 ? 'Fake' : 'Real';
        
        // Create a styled notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${result === 'Real' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        notification.textContent = `News Analysis: ${result}`;

        document.body.appendChild(notification);

        // Remove notification after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    })
    .catch(error => {
        console.error('Error:', error);
        const errorNotification = document.createElement('div');
        errorNotification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        errorNotification.textContent = 'Error analyzing the news article. Please try again later.';
        document.body.appendChild(errorNotification);

        setTimeout(() => {
            if (errorNotification.parentNode) {
                errorNotification.parentNode.removeChild(errorNotification);
            }
        }, 5000);
    });
}