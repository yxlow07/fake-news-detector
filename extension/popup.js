document.addEventListener('DOMContentLoaded', function () {
    const analyzeBtn = document.getElementById('analyze-btn');
    const analyzeAgainBtn = document.getElementById('analyze-again-btn');
    const retryBtn = document.getElementById('retry-btn');

    const initialState = document.getElementById('initial-state');
    const loadingState = document.getElementById('loading-state');
    const resultsState = document.getElementById('results-state');
    const errorState = document.getElementById('error-state');

    const resultBadge = document.getElementById('result-badge');
    const resultIcon = document.getElementById('result-icon');
    const resultText = document.getElementById('result-text');
    const errorMessage = document.getElementById('error-message');

    function showInitialState() {
        initialState.classList.remove('hidden');
        loadingState.classList.add('hidden');
        resultsState.classList.add('hidden');
        errorState.classList.add('hidden');
    }

    function showLoadingState() {
        initialState.classList.add('hidden');
        loadingState.classList.remove('hidden');
        resultsState.classList.add('hidden');
        errorState.classList.add('hidden');
    }

    function showResultsState(isReal) {
        initialState.classList.add('hidden');
        loadingState.classList.add('hidden');
        resultsState.classList.remove('hidden');
        errorState.classList.add('hidden');

        if (isReal) {
            resultBadge.className = 'badge real';
            resultIcon.textContent = '✅';
            resultText.textContent = 'REAL & NEUTRAL NEWS';
        } else {
            resultBadge.className = 'badge fake';
            resultIcon.textContent = '❌';
            resultText.textContent = 'FAKE / BIASED NEWS';
        }
    }

    function showErrorState(message = 'Unable to analyze the current page. Please try again.') {
        initialState.classList.add('hidden');
        loadingState.classList.add('hidden');
        resultsState.classList.add('hidden');
        errorState.classList.remove('hidden');
        errorMessage.textContent = message;
    }

    async function analyzeCurrentPage() {
        try {
            showLoadingState();

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab) {
                throw new Error('No active tab found');
            }

            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: extractPageContent
            });

            const articleText = results[0].result;

            if (!articleText || articleText.trim().length < 50) {
                throw new Error('Insufficient content found on this page for analysis');
            }

            const response = await fetch('https://fake-news-detector-v5xz.onrender.com/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: articleText })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();

            const isReal = data.prediction == 0;
            showResultsState(isReal);

        } catch (error) {
            console.error('Analysis error:', error);
            let errorMsg = 'Unable to analyze the current page. Please try again.';

            if (error.message.includes('Insufficient content')) {
                errorMsg = 'This page doesn\'t have enough content to analyze. Try a news article page.';
            } else if (error.message.includes('API request failed')) {
                errorMsg = 'Analysis service is temporarily unavailable. Please try again later.';
            } else if (error.message.includes('No active tab')) {
                errorMsg = 'Unable to access the current page. Please refresh and try again.';
            }

            showErrorState(errorMsg);
        }
    }

    analyzeBtn.addEventListener('click', analyzeCurrentPage);
    analyzeAgainBtn.addEventListener('click', analyzeCurrentPage);
    retryBtn.addEventListener('click', analyzeCurrentPage);

    showInitialState();
});

function extractPageContent() {
    articleText = document.body.innerText || "";

    if (!articleText) {
        console.warn("No text found in the article.");
        return "";
    }

    articleText = articleText.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();

    return articleText;
}