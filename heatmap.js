// Global variables
let examType = '';
let subject = '';
let cachedHeatmapData = null;

// DOM elements
const loadingSection = document.getElementById('loadingSection');
const errorSection = document.getElementById('errorSection');
const heatmapSection = document.getElementById('heatmapSection');
const heatmapTableBody = document.getElementById('heatmapTableBody');
const errorMessage = document.getElementById('errorMessage');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Get parameters from URL first, then fallback to session storage
    const urlParams = new URLSearchParams(window.location.search);
    examType = urlParams.get('exam') || sessionStorage.getItem('examType');
    subject = urlParams.get('subject') || sessionStorage.getItem('subject');
    
    if (!examType || !subject) {
        showError('Missing exam type or subject parameters. Please go back to the main page and enter your exam details.');
        return;
    }
    
    // Save to session storage if not already there
    if (!sessionStorage.getItem('examType')) {
        sessionStorage.setItem('examType', examType);
    }
    if (!sessionStorage.getItem('subject')) {
        sessionStorage.setItem('subject', subject);
    }
    
    // Check if we have cached data
    const cacheKey = `heatmap_${examType}_${subject}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
        try {
            // Show loading message for cached data
            showLoadingMessage('Loading saved data...', 'Retrieving previously generated heatmap analysis');
            cachedHeatmapData = JSON.parse(cachedData);
            
            // Simulate a brief loading time for better UX
            setTimeout(() => {
                displayHeatmapData(cachedHeatmapData);
                showHeatmap();
                showLoading(false); // Hide loading after displaying data
            }, 500);
        } catch (e) {
            console.error('Error parsing cached data:', e);
            generateHeatmapData();
        }
    } else {
        // Generate heatmap data
        generateHeatmapData();
    }
});

// Generate heatmap data using OpenAI
async function generateHeatmapData() {
    showLoading(true);
    hideError();
    
    try {
        const response = await fetch('/api/generate-heatmap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                examType: examType,
                subject: subject
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate heatmap data');
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Cache the data
            const cacheKey = `heatmap_${examType}_${subject}`;
            sessionStorage.setItem(cacheKey, JSON.stringify(data.topics));
            cachedHeatmapData = data.topics;
            
            displayHeatmapData(data.topics);
        } else {
            throw new Error(data.error || 'Failed to generate heatmap data');
        }
        
    } catch (error) {
        console.error('Error generating heatmap data:', error);
        showError('Failed to generate heatmap data. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Display heatmap data in table
function displayHeatmapData(topics) {
    heatmapTableBody.innerHTML = '';
    
    topics.forEach((topic, index) => {
        const row = document.createElement('tr');
        
        // Create rank badge
        const rankCell = document.createElement('td');
        const rankBadge = document.createElement('div');
        rankBadge.className = 'rank-badge';
        rankBadge.textContent = index + 1;
        rankCell.appendChild(rankBadge);
        
        // Create topic name cell
        const topicCell = document.createElement('td');
        const topicName = document.createElement('div');
        topicName.className = 'topic-name';
        topicName.textContent = topic.name;
        topicCell.appendChild(topicName);
        
        // Create percentage cell
        const percentageCell = document.createElement('td');
        const percentageDisplay = document.createElement('div');
        percentageDisplay.className = 'percentage-display';
        
        const percentageBar = document.createElement('div');
        percentageBar.className = 'percentage-bar';
        
        const percentageFill = document.createElement('div');
        percentageFill.className = 'percentage-fill';
        percentageFill.style.width = `${topic.percentage}%`;
        
        const percentageText = document.createElement('div');
        percentageText.className = 'percentage-text';
        percentageText.textContent = `${topic.percentage}%`;
        
        percentageBar.appendChild(percentageFill);
        percentageDisplay.appendChild(percentageBar);
        percentageDisplay.appendChild(percentageText);
        percentageCell.appendChild(percentageDisplay);
        
        // Create analysis button cell
        const analysisCell = document.createElement('td');
        const analysisBtn = document.createElement('button');
        analysisBtn.className = 'analysis-btn';
        analysisBtn.innerHTML = '<i class="fas fa-chart-line"></i> In-depth Analysis';
        analysisBtn.onclick = () => openInDepthAnalysis(topic.name);
        analysisCell.appendChild(analysisBtn);
        
        // Add cells to row
        row.appendChild(rankCell);
        row.appendChild(topicCell);
        row.appendChild(percentageCell);
        row.appendChild(analysisCell);
        
        // Add row to table
        heatmapTableBody.appendChild(row);
    });
    
    showHeatmap();
}

// Open in-depth analysis page
function openInDepthAnalysis(topicName) {
    const params = new URLSearchParams({
        exam: examType,
        subject: subject,
        topic: topicName
    });
    window.open(`/topic-analysis.html?${params.toString()}`, '_blank');
}

// Show loading state
function showLoading(show) {
    if (show) {
        loadingSection.classList.remove('hidden');
        heatmapSection.classList.add('hidden');
        errorSection.classList.add('hidden');
    } else {
        loadingSection.classList.add('hidden');
    }
}

// Show heatmap section
function showHeatmap() {
    heatmapSection.classList.remove('hidden');
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
    loadingSection.classList.add('hidden');
    heatmapSection.classList.add('hidden');
}

// Hide error
function hideError() {
    errorSection.classList.add('hidden');
}

// Show loading message with custom text
function showLoadingMessage(title, subtitle) {
    const loadingTitle = loadingSection.querySelector('h3');
    const loadingSubtitle = loadingSection.querySelector('p');
    
    if (loadingTitle) loadingTitle.textContent = title;
    if (loadingSubtitle) loadingSubtitle.textContent = subtitle;
    
    showLoading(true);
} 