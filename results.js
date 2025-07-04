// Global variables
let currentExamType = '';
let currentSubject = '';
let topicChart = null;
let heatChart = null;
let subtopicCharts = {};

// DOM elements
const loadingSection = document.getElementById('loadingSection');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const chartsSection = document.getElementById('chartsSection');
const examInfo = document.getElementById('examInfo');
const topicList = document.getElementById('topicList');
const subtopicsSection = document.getElementById('subtopicsSection');
const subtopicsCharts = document.getElementById('subtopicsCharts');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Get exam data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    currentExamType = urlParams.get('exam') || '';
    currentSubject = urlParams.get('subject') || '';
    
    if (!currentExamType || !currentSubject) {
        showError('Missing exam or subject parameters');
        return;
    }
    
    examInfo.textContent = `${currentExamType} - ${currentSubject}`;
    
    // Generate charts
    generateCharts();
});

// Generate all charts
async function generateCharts() {
    showLoading(true);
    
    try {
        // Generate topics with specific syllabus-based names
        const topicsResponse = await fetch('/api/generate-syllabus-topics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                examType: currentExamType,
                subject: currentSubject
            })
        });
        
        if (!topicsResponse.ok) {
            throw new Error('Failed to generate syllabus topics');
        }
        
        const topicsData = await topicsResponse.json();
        const topics = topicsData.topics;
        
        // Generate heatmap data
        const heatmapResponse = await fetch('/api/generate-heatmap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                examType: currentExamType,
                subject: currentSubject,
                topics: topics
            })
        });
        
        if (!heatmapResponse.ok) {
            throw new Error('Failed to generate heatmap data');
        }
        
        const heatmapData = await heatmapResponse.json();
        
        // Create charts
        createTopicDistributionChart(heatmapData.heatmapData);
        createHeatLevelChart(heatmapData.heatmapData);
        createTopicList(heatmapData.heatmapData);
        
        showCharts();
        
    } catch (error) {
        console.error('Error generating charts:', error);
        showError('Failed to generate charts. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Create topic distribution pie chart
function createTopicDistributionChart(heatmapData) {
    const ctx = document.getElementById('topicChart').getContext('2d');
    
    const data = {
        labels: heatmapData.map(item => item.topic),
        datasets: [{
            data: heatmapData.map(item => {
                const percentage = item.percentage.split('-')[1].replace('%', '');
                return parseInt(percentage);
            }),
            backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                '#4BC0C0', '#FF6384'
            ],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };
    
    const config = {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            return `${label}: ${value}%`;
                        }
                    }
                }
            }
        }
    };
    
    topicChart = new Chart(ctx, config);
}

// Create heat level bar chart
function createHeatLevelChart(heatmapData) {
    const ctx = document.getElementById('heatChart').getContext('2d');
    
    const data = {
        labels: heatmapData.map(item => item.topic),
        datasets: [{
            label: 'Heat Level',
            data: heatmapData.map(item => item.heatLevel),
            backgroundColor: heatmapData.map(item => {
                const level = item.heatLevel;
                if (level >= 4) return '#FF6384';
                if (level >= 3) return '#FF9F40';
                if (level >= 2) return '#FFCE56';
                return '#36A2EB';
            }),
            borderColor: heatmapData.map(item => {
                const level = item.heatLevel;
                if (level >= 4) return '#E53E3E';
                if (level >= 3) return '#DD6B20';
                if (level >= 2) return '#D69E2E';
                return '#3182CE';
            }),
            borderWidth: 1
        }]
    };
    
    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Heat Level: ${context.parsed.y}/5`;
                        }
                    }
                }
            }
        }
    };
    
    heatChart = new Chart(ctx, config);
}

// Create topic list with subtopics buttons
function createTopicList(heatmapData) {
    topicList.innerHTML = '';
    
    heatmapData.forEach((item, index) => {
        const topicItem = document.createElement('div');
        topicItem.className = 'topic-item';
        
        topicItem.innerHTML = `
            <div class="topic-name">${item.topic}</div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <div class="topic-percentage">${item.percentage}</div>
                <button class="subtopics-btn" onclick="showSubtopics('${item.topic}', ${index})">
                    <i class="fas fa-sitemap"></i>
                    Subtopics
                </button>
            </div>
        `;
        
        topicList.appendChild(topicItem);
    });
}

// Show subtopics for a specific topic
async function showSubtopics(mainTopic, topicIndex) {
    try {
        const response = await fetch('/api/generate-subtopics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                examType: currentExamType,
                subject: currentSubject,
                mainTopic: mainTopic
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate subtopics');
        }
        
        const data = await response.json();
        const subtopics = data.subtopics;
        
        // Generate heatmap data for subtopics
        const subtopicsHeatmap = subtopics.map((subtopic, index) => {
            const heatData = generateSubtopicHeatData();
            return {
                topic: subtopic,
                heatLevel: heatData.heatLevel,
                percentage: heatData.percentage
            };
        });
        
        createSubtopicCharts(mainTopic, subtopicsHeatmap, topicIndex);
        
    } catch (error) {
        console.error('Error generating subtopics:', error);
        showError('Failed to generate subtopics. Please try again.');
    }
}

// Create subtopic charts
function createSubtopicCharts(mainTopic, subtopicsData, topicIndex) {
    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-wrapper';
    chartContainer.innerHTML = `
        <h3>${mainTopic} - Subtopics</h3>
        <canvas id="subtopicChart${topicIndex}" class="chart-canvas"></canvas>
    `;
    
    // Clear existing charts and add new one
    subtopicsCharts.innerHTML = '';
    subtopicsCharts.appendChild(chartContainer);
    
    // Create the chart
    const ctx = document.getElementById(`subtopicChart${topicIndex}`).getContext('2d');
    
    const data = {
        labels: subtopicsData.map(item => item.topic),
        datasets: [{
            label: 'Heat Level',
            data: subtopicsData.map(item => item.heatLevel),
            backgroundColor: subtopicsData.map(item => {
                const level = item.heatLevel;
                if (level >= 4) return '#FF6384';
                if (level >= 3) return '#FF9F40';
                if (level >= 2) return '#FFCE56';
                return '#36A2EB';
            }),
            borderColor: subtopicsData.map(item => {
                const level = item.heatLevel;
                if (level >= 4) return '#E53E3E';
                if (level >= 3) return '#DD6B20';
                if (level >= 2) return '#D69E2E';
                return '#3182CE';
            }),
            borderWidth: 1
        }]
    };
    
    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Heat Level: ${context.parsed.y}/5`;
                        }
                    }
                }
            }
        }
    };
    
    subtopicCharts[`subtopic${topicIndex}`] = new Chart(ctx, config);
    
    // Show subtopics section
    subtopicsSection.classList.remove('hidden');
    subtopicsSection.scrollIntoView({ behavior: 'smooth' });
}

// Generate heat data for subtopics
function generateSubtopicHeatData() {
    const heatLevels = [1, 2, 3, 4, 5];
    const percentages = [
        '5-8%', '8-12%', '12-16%', '16-20%', '20-25%',
        '25-30%', '30-35%', '35-40%', '40-45%', '45-50%'
    ];
    
    return {
        heatLevel: heatLevels[Math.floor(Math.random() * heatLevels.length)],
        percentage: percentages[Math.floor(Math.random() * percentages.length)]
    };
}

// Show loading
function showLoading(show) {
    if (show) {
        loadingSection.classList.remove('hidden');
        chartsSection.classList.add('hidden');
        errorSection.classList.add('hidden');
    } else {
        loadingSection.classList.add('hidden');
    }
}

// Show charts
function showCharts() {
    chartsSection.classList.remove('hidden');
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
    loadingSection.classList.add('hidden');
    chartsSection.classList.add('hidden');
}

// Go back to main page
function goBack() {
    window.location.href = '/';
} 