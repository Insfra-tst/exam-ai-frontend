// Global variables
let examType = '';
let subject = '';
let visualData = null;

// DOM elements (will be initialized in DOMContentLoaded)
let loadingSection = null;
let errorSection = null;
let visualAnalyzerSection = null;
let analyzerSubtitle = null;
let errorMessage = null;
let comparisonChartTitle = null;

// Subject info elements
let subjectInfoTitle = null;
let subjectInfoSubtitle = null;

// Chart containers
let pieChartContainer = null;
let quadrantChartContainer = null;
let dualAxisChartContainer = null;
let bubbleChartContainer = null;
let comparisonChartContainer = null;
let syllabusChartContainer = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Visual Analyzer page loaded');
    
    // Initialize DOM elements
    loadingSection = document.getElementById('loadingSection');
    errorSection = document.getElementById('errorSection');
    visualAnalyzerSection = document.getElementById('visualAnalyzerSection');
    analyzerSubtitle = document.getElementById('analyzerSubtitle');
    errorMessage = document.getElementById('errorMessage');
    comparisonChartTitle = document.getElementById('comparisonChartTitle');
    
    // Subject info elements
    subjectInfoTitle = document.getElementById('subjectInfoTitle');
    subjectInfoSubtitle = document.getElementById('subjectInfoSubtitle');
    
    // Chart containers
    pieChartContainer = document.getElementById('pieChart');
    quadrantChartContainer = document.getElementById('quadrantChart');
    dualAxisChartContainer = document.getElementById('dualAxisChart');
    bubbleChartContainer = document.getElementById('bubbleChart');
    comparisonChartContainer = document.getElementById('comparisonChart');
    syllabusChartContainer = document.getElementById('syllabusChart');
    
    console.log('DOM elements found:', {
        loadingSection: !!loadingSection,
        errorSection: !!errorSection,
        visualAnalyzerSection: !!visualAnalyzerSection,
        analyzerSubtitle: !!analyzerSubtitle,
        errorMessage: !!errorMessage,
        comparisonChartTitle: !!comparisonChartTitle,
        pieChartContainer: !!pieChartContainer,
        quadrantChartContainer: !!quadrantChartContainer,
        dualAxisChartContainer: !!dualAxisChartContainer,
        bubbleChartContainer: !!bubbleChartContainer,
        comparisonChartContainer: !!comparisonChartContainer,
        syllabusChartContainer: !!syllabusChartContainer
    });
    
    // Get parameters from URL first, then fallback to session storage
    const urlParams = new URLSearchParams(window.location.search);
    examType = urlParams.get('exam') || sessionStorage.getItem('examType');
    subject = urlParams.get('subject') || sessionStorage.getItem('subject');
    
    console.log('=== PARAMETERS DEBUG ===');
    console.log('URL params:', { exam: urlParams.get('exam'), subject: urlParams.get('subject') });
    console.log('Session storage:', { examType: sessionStorage.getItem('examType'), subject: sessionStorage.getItem('subject') });
    console.log('Final parameters:', { examType, subject });
    
    // Always ensure we have some data to display
    if (!examType) examType = 'General Exam';
    if (!subject) subject = 'General Subject';
    
    // Save to session storage if not already there
    if (!sessionStorage.getItem('examType')) {
        sessionStorage.setItem('examType', examType);
    }
    if (!sessionStorage.getItem('subject')) {
        sessionStorage.setItem('subject', subject);
    }
    
    // Update page subtitle and comparison chart title
    console.log('=== UPDATING TITLES ===');
    console.log('analyzerSubtitle element:', !!analyzerSubtitle);
    console.log('comparisonChartTitle element:', !!comparisonChartTitle);
    
    if (analyzerSubtitle) {
    analyzerSubtitle.textContent = `Interactive data visualizations for ${examType} - ${subject}`;
        console.log('Updated analyzer subtitle:', analyzerSubtitle.textContent);
    } else {
        console.error('analyzerSubtitle element not found');
    }
    if (comparisonChartTitle) {
        comparisonChartTitle.textContent = `Difficulty Comparison: ${subject} vs Other Subjects`;
        console.log('Updated comparison chart title:', comparisonChartTitle.textContent);
    } else {
        console.error('comparisonChartTitle element not found');
    }
    
    // Check if we have cached data in session storage first
    const sessionCacheKey = `visual_analyzer_${examType}_${subject}`;
    const sessionCachedData = sessionStorage.getItem(sessionCacheKey);
    
    console.log('Session cache check for key:', sessionCacheKey, 'Result:', sessionCachedData ? 'FOUND' : 'NOT FOUND');
    
    if (sessionCachedData) {
        try {
            const parsedData = JSON.parse(sessionCachedData);
            visualData = parsedData.visualData;
            console.log('Loading session cached visual data:', visualData);
            
            // Update subtitle without any timestamp
            if (analyzerSubtitle) {
                analyzerSubtitle.textContent = `Interactive data visualizations for ${examType} - ${subject}`;
            }
            
            // Show loading briefly, then render
            showLoading(true);
            setTimeout(() => {
                renderAllCharts();
                showVisualAnalyzer();
                // Ensure loading is hidden and content is shown
                setTimeout(() => {
                    ensureProperLoadingState();
                }, 100);
            }, 800);
        } catch (e) {
            console.error('Error parsing session cached data:', e);
            // Remove corrupted cache and generate new data
            sessionStorage.removeItem(sessionCacheKey);
            generateVisualData();
        }
    } else {
        // Generate visual data (will check Redis cache on server)
        console.log('No session cached data found, generating new data...');
        generateVisualData();
    }
    
    // Add a test function to window for debugging
    window.testVisualAnalyzer = function() {
        console.log('=== TEST VISUAL ANALYZER ===');
        console.log('Current state:', {
            examType,
            subject,
            visualData: !!visualData,
            loadingSection: !!loadingSection,
            visualAnalyzerSection: !!visualAnalyzerSection
        });
        
        if (visualData) {
            console.log('Visual data details:', {
                mainHotspots: visualData.mainHotspots?.length || 0,
                quadrantData: visualData.quadrantData?.length || 0,
                easyToLearnData: visualData.easyToLearnData?.length || 0,
                bubbleData: visualData.bubbleData?.length || 0,
                comparisonData: !!visualData.comparisonData
            });
        }
        
        if (!visualData) {
            console.log('No visual data, generating...');
            generateVisualData(true); // Force regenerate
        } else {
            console.log('Visual data exists, re-rendering...');
            renderAllCharts();
            showVisualAnalyzer();
        }
    };
    
    // Add a simple test function to check if buttons work
    window.testButton = function() {
        alert('Button test works!');
        console.log('Button test successful');
    };
    
    // Attach all UI functions to window for global access (for HTML onclick)
    window.highlightTopTopics = highlightTopTopics;
    window.showEasyWins = showEasyWins;
    window.analyzeWeakAreas = analyzeWeakAreas;
    window.generateStudyPlan = generateStudyPlan;
    window.compareSubjects = compareSubjects;
    window.exportAnalysis = exportAnalysis;
    window.clearVisualAnalyzerCache = clearVisualAnalyzerCache;
    window.forceGenerateData = forceGenerateData;
    window.showCacheStatus = showCacheStatus;

    // Set up event listeners for buttons (instead of inline onclick)
    setupEventListeners();

    console.log('Visual Analyzer initialization complete');
    
    // Force data generation after 3 seconds if nothing has happened
    setTimeout(() => {
        console.log('=== FORCE DATA GENERATION CHECK ===');
        if (!visualData) {
            console.log('No visual data after 3 seconds, forcing generation...');
            generateVisualData(true);
        } else {
            console.log('Visual data exists, no need to force generation');
        }
    }, 3000);
});

// Set up event listeners for all buttons
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Get all pointer event cards
    const cards = document.querySelectorAll('.pointer-event-card[data-action]');
    console.log('Found cards with data-action:', cards.length);
    
    cards.forEach(card => {
        const action = card.getAttribute('data-action');
        console.log('Setting up listener for action:', action);
        
        card.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Card clicked with action:', action);
            
            switch(action) {
                case 'highlightTopTopics':
                    highlightTopTopics();
                    break;
                case 'showEasyWins':
                    showEasyWins();
                    break;
                case 'analyzeWeakAreas':
                    analyzeWeakAreas();
                    break;
                case 'generateStudyPlan':
                    generateStudyPlan();
                    break;
                case 'compareSubjects':
                    compareSubjects();
                    break;
                case 'exportAnalysis':
                    exportAnalysis();
                    break;
                default:
                    console.warn('Unknown action:', action);
            }
        });
    });
    
    console.log('Event listeners setup complete');
}

// Clear cache and reload function
function clearCacheAndReload() {
    console.log('Clearing cache and reloading...');
    clearVisualAnalyzerCache().then(() => {
        location.reload();
    });
}

// Generate visual data using OpenAI with Redis caching
async function generateVisualData(forceRegenerate = false) {
    console.log('=== GENERATE VISUAL DATA ===');
    console.log('Parameters:', { examType, subject, forceRegenerate });
    showLoading(true);
    hideError();
    
    try {
        console.log('Making API request to /api/generate-visual-data...');
        
        const requestBody = {
            examType: examType,
            subject: subject,
            forceRegenerate: forceRegenerate
        };
        console.log('Request body:', requestBody);
        
        const response = await fetch('/api/generate-visual-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('API response status:', response.status);
        console.log('API response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('API response data received:', data);
        
        if (data.success) {
            visualData = data.visualData;
            console.log('Visual data assigned to global variable:', visualData);
            console.log('Data structure check:', {
                mainHotspots: visualData.mainHotspots?.length || 0,
                quadrantData: visualData.quadrantData?.length || 0,
                easyToLearnData: visualData.easyToLearnData?.length || 0,
                bubbleData: visualData.bubbleData?.length || 0,
                comparisonData: !!visualData.comparisonData
            });
            
            // Show source information
            const sourceInfo = data.source === 'cache' ? '📦 Cached data loaded' : '🔄 Fresh data generated';
            console.log(`${sourceInfo} for ${examType} - ${subject}`);
            
            // Update subtitle without timestamp
            if (analyzerSubtitle) {
                analyzerSubtitle.textContent = `Interactive data visualizations for ${examType} - ${subject}`;
            }
            
            // Also cache in session storage as backup
            const sessionCacheKey = `visual_analyzer_${examType}_${subject}`;
            sessionStorage.setItem(sessionCacheKey, JSON.stringify({
                visualData: data.visualData,
                source: data.source,
                timestamp: data.timestamp,
                cacheKey: data.cacheKey
            }));
            
            console.log('Successfully processed visual data, calling renderAllCharts...');
            renderAllCharts();
            showVisualAnalyzer();
        } else {
            console.error('API returned success: false');
            throw new Error(data.error || 'Failed to generate visual data');
        }
        
    } catch (error) {
        console.error('=== ERROR IN GENERATE VISUAL DATA ===');
        console.error('Error details:', error);
        console.error('Error stack:', error.stack);
        
        // Use fallback data
        console.log('Using fallback visual data...');
        visualData = generateFallbackVisualData();
        console.log('Fallback data generated:', visualData);
        renderAllCharts();
        showVisualAnalyzer();
    } finally {
        // Ensure loading is hidden and content is shown
        setTimeout(() => {
            ensureProperLoadingState();
        }, 500);
    }
}

// Update subject information sections
function updateSubjectInfo() {
    if (!visualData) return;
    
    // Topic Distribution
    const topicDistributionContent = document.getElementById('topicDistributionContent');
    const topicDistributionStats = document.getElementById('topicDistributionStats');
    const totalTopics = document.getElementById('totalTopics');
    const avgPercentage = document.getElementById('avgPercentage');
    
    const topics = visualData.mainHotspots;
    const avgPercent = topics.reduce((sum, topic) => sum + topic.percentage, 0) / topics.length;
    
    topicDistributionContent.textContent = `Analysis of ${topics.length} main topics with their relative importance in the ${subject} syllabus. Topics are weighted based on their frequency in past exams.`;
    totalTopics.textContent = topics.length;
    avgPercentage.textContent = `${Math.round(avgPercent)}%`;
    
    // Hotspot Analysis
    const hotspotAnalysisContent = document.getElementById('hotspotAnalysisContent');
    const topHotspot = document.getElementById('topHotspot');
    const avgHotspot = document.getElementById('avgHotspot');
    
    const hotspotScores = visualData.quadrantData.map(item => item.hotspotScore);
    const maxHotspot = Math.max(...hotspotScores);
    const avgHotspotScore = hotspotScores.reduce((sum, score) => sum + score, 0) / hotspotScores.length;
    
    hotspotAnalysisContent.textContent = `Identified ${topics.length} high-priority topics with hotspot scores ranging from ${Math.min(...hotspotScores)} to ${maxHotspot}. These topics frequently appear in ${examType} exams.`;
    topHotspot.textContent = maxHotspot;
    avgHotspot.textContent = Math.round(avgHotspotScore);
    
    // Learning Difficulty
    const learningDifficultyContent = document.getElementById('learningDifficultyContent');
    const easiestTopic = document.getElementById('easiestTopic');
    const avgDifficulty = document.getElementById('avgDifficulty');
    
    const easyScores = visualData.easyToLearnData.map(item => item.easyScore);
    const maxEasy = Math.max(...easyScores);
    const avgEasyScore = easyScores.reduce((sum, score) => sum + score, 0) / easyScores.length;
    
    learningDifficultyContent.textContent = `Learning difficulty assessment shows topics with ease scores from ${Math.min(...easyScores)} to ${maxEasy}. Higher scores indicate easier topics to master.`;
    easiestTopic.textContent = maxEasy;
    avgDifficulty.textContent = Math.round(avgEasyScore);
    
    // Subject Comparison
    const subjectComparisonContent = document.getElementById('subjectComparisonContent');
    const examWeight = document.getElementById('examWeight');
    const topicVolume = document.getElementById('topicVolume');
    
    const currentSubject = visualData.comparisonData.currentSubject;
    
    subjectComparisonContent.textContent = `${subject} has an exam weight of ${currentSubject.examWeight}% and covers ${currentSubject.topicVolume} topics. This compares to other subjects in the ${examType} exam.`;
    examWeight.textContent = `${currentSubject.examWeight}%`;
    topicVolume.textContent = currentSubject.topicVolume;
}

// Generate fallback visual data
function generateFallbackVisualData() {
    const topics = [
        'Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry',
        'Linear Algebra', 'Differential Equations', 'Number Theory', 'Probability', 'Analysis'
    ];
    
    const fallbackData = {
        mainHotspots: topics.map((topic, index) => ({
            topic: topic,
            percentage: Math.floor(Math.random() * 30) + 10,
            color: `hsl(${index * 36}, 70%, 60%)`
        })),
        
        quadrantData: topics.map((topic, index) => ({
            topic: topic,
            weight: Math.floor(Math.random() * 50) + 20,
            hotspotScore: Math.floor(Math.random() * 100) + 20,
            size: Math.floor(Math.random() * 30) + 10
        })),
        
        easyToLearnData: topics.map((topic, index) => ({
            topic: topic,
            hotspotScore: Math.floor(Math.random() * 100) + 20,
            easyScore: Math.floor(Math.random() * 100) + 20
        })),
        
        bubbleData: topics.map((topic, index) => ({
            topic: topic,
            ease: Math.floor(Math.random() * 100) + 20,
            hotspot: Math.floor(Math.random() * 100) + 20,
            importance: Math.floor(Math.random() * 30) + 10
        })),
        
        comparisonData: {
            currentSubject: {
                name: subject,
                examWeight: Math.floor(Math.random() * 30) + 20,
                topicVolume: Math.floor(Math.random() * 20) + 10,
                difficulty: Math.floor(Math.random() * 100) + 20,
                performance: Math.floor(Math.random() * 100) + 20
            },
            otherSubjects: [
                { name: 'Physics', examWeight: 25, topicVolume: 15, difficulty: 75, performance: 65 },
                { name: 'Chemistry', examWeight: 20, topicVolume: 12, difficulty: 70, performance: 70 },
                { name: 'Biology', examWeight: 18, topicVolume: 18, difficulty: 60, performance: 75 },
                { name: 'English', examWeight: 15, topicVolume: 8, difficulty: 50, performance: 80 },
                { name: 'History', examWeight: 12, topicVolume: 14, difficulty: 55, performance: 72 },
                { name: 'Geography', examWeight: 10, topicVolume: 11, difficulty: 45, performance: 78 }
            ]
        }
    };
    
    return fallbackData;
}

// Wait for Plotly to be loaded
function waitForPlotly(callback, maxAttempts = 10) {
    let attempts = 0;
    
    function checkPlotly() {
        attempts++;
        console.log(`Checking for Plotly (attempt ${attempts}/${maxAttempts})...`);
        
        if (typeof Plotly !== 'undefined') {
            console.log('Plotly is loaded, proceeding with chart rendering');
            callback();
        } else if (attempts < maxAttempts) {
            console.log('Plotly not loaded yet, retrying in 500ms...');
            setTimeout(checkPlotly, 500);
        } else {
            console.error('Plotly failed to load after maximum attempts');
            showError('Failed to load chart library. Please refresh the page.');
        }
    }
    
    checkPlotly();
}

// Render all charts
function renderAllCharts() {
    if (!visualData) {
        console.error('No visual data available for rendering charts');
        return;
    }
    
    console.log('Rendering all charts with data:', visualData);
    
    // Wait for Plotly to be loaded before rendering charts
    waitForPlotly(() => {
    try {
        // Hide all loading messages in chart containers first
        hideChartLoadingMessages();
        
        renderPieChart();
        renderQuadrantChart();
        renderDualAxisChart();
        renderBubbleChart();
        renderComparisonChart();
            renderSyllabusChart();
            
            // Populate chart indicators after charts are rendered
            setTimeout(() => {
                populateChartIndicators();
            }, 200);
        
        // Ensure proper loading state after charts are rendered
        setTimeout(() => {
            ensureProperLoadingState();
            finalizeInitialization();
        }, 100);
        
        console.log('All charts rendered successfully');
    } catch (error) {
        console.error('Error rendering charts:', error);
        showError('Error rendering charts: ' + error.message);
    }
    });
}

// Hide loading messages in chart containers
function hideChartLoadingMessages() {
    const chartContainers = [
        pieChartContainer,
        quadrantChartContainer,
        dualAxisChartContainer,
        bubbleChartContainer,
        comparisonChartContainer,
        syllabusChartContainer
    ];
    
    chartContainers.forEach(container => {
        if (container) {
            const loadingElements = container.querySelectorAll('.loading');
            loadingElements.forEach(element => {
                element.classList.add('hidden');
            });
        }
    });
}

// 1. Render Pie Chart - Main Hotspots
function renderPieChart() {
    if (!visualData || !visualData.mainHotspots) {
        console.error('No mainHotspots data available for pie chart');
        return;
    }
    

    
    try {
        const data = [{
            values: visualData.mainHotspots.map(item => item.percentage),
            labels: visualData.mainHotspots.map(item => item.topic),
            type: 'pie',
            hole: 0.4,
            marker: {
                colors: visualData.mainHotspots.map(item => item.color || `hsl(${Math.random() * 360}, 70%, 60%)`)
            },
            textinfo: 'label+percent',
            textposition: 'outside',
            textfont: {
                size: 12,
                color: '#2c3e50'
            }
        }];
        
        const layout = {
            title: {
                text: 'Topic Distribution by Hotspot Score',
                font: { size: 18, color: '#2c3e50' }
            },
            showlegend: true,
            legend: {
                orientation: 'h',
                x: 0.5,
                y: -0.1
            },
            margin: { t: 50, b: 50, l: 50, r: 50 },
            height: 600,
            width: null, // Use full width
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            autosize: true
        };
        
        Plotly.newPlot(pieChartContainer, data, layout, { responsive: true });
        console.log('Pie chart rendered successfully');
    } catch (error) {
        console.error('Error rendering pie chart:', error);
    }
}

// 2. Render Quadrant Chart - Topic Weight vs Hotspot Score
function renderQuadrantChart() {

    
    const data = visualData.quadrantData;
    
    const trace = {
        x: data.map(item => item.weight),
        y: data.map(item => item.hotspotScore),
        mode: 'markers+text',
        type: 'scatter',
        text: data.map(item => item.topic),
        textposition: 'top center',
        marker: {
            size: data.map(item => item.size * 2),
            color: data.map(item => 
                item.weight > 35 && item.hotspotScore > 60 ? '#e74c3c' :
                item.weight > 35 && item.hotspotScore <= 60 ? '#f39c12' :
                item.weight <= 35 && item.hotspotScore > 60 ? '#3498db' : '#95a5a6'
            ),
            opacity: 0.8
        },
        textfont: {
            size: 10,
            color: '#2c3e50'
        },
        hoverinfo: 'text+x+y'
    };
    
    const layout = {
        title: {
            text: 'Topic Weight vs Hotspot Score',
            font: {
                size: 18,
                color: '#2c3e50'
            }
        },
        xaxis: {
            title: 'Topic Weight (Syllabus Coverage)',
            gridcolor: '#ecf0f1',
            zeroline: false
        },
        yaxis: {
            title: 'Hotspot Score',
            gridcolor: '#ecf0f1',
            zeroline: false
        },
        shapes: [
            // Vertical line at x = 50
            {
                type: 'line',
                x0: 50,
                y0: 0,
                x1: 50,
                y1: 100,
                line: {
                    color: '#bdc3c7',
                    width: 1,
                    dash: 'dash'
                }
            },
            // Horizontal line at y = 50
            {
                type: 'line',
                x0: 0,
                y0: 50,
                x1: 100,
                y1: 50,
                line: {
                    color: '#bdc3c7',
                    width: 1,
                    dash: 'dash'
                }
            }
        ],
        annotations: [
            {
                x: 25,
                y: 75,
                text: 'Low Weight<br>High Score',
                showarrow: false,
                font: { size: 12, color: '#7f8c8d' }
            },
            {
                x: 75,
                y: 75,
                text: 'High Weight<br>High Score',
                showarrow: false,
                font: { size: 12, color: '#7f8c8d' }
            },
            {
                x: 25,
                y: 25,
                text: 'Low Weight<br>Low Score',
                showarrow: false,
                font: { size: 12, color: '#7f8c8d' }
            },
            {
                x: 75,
                y: 25,
                text: 'High Weight<br>Low Score',
                showarrow: false,
                font: { size: 12, color: '#7f8c8d' }
            }
        ],
        margin: { l: 60, r: 40, t: 60, b: 60 },
        height: 600,
        width: null, // Use full width
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        autosize: true
    };
    
    const config = {
        responsive: true,
        displayModeBar: false
    };
    
    Plotly.newPlot(quadrantChartContainer, [trace], layout, config);
}

// 3. Render Dual Axis Bar Chart - Easy to Learn Hotspots
function renderDualAxisChart() {

    
    const data = visualData.easyToLearnData;
    
    const trace1 = {
        x: data.map(item => item.topic),
        y: data.map(item => item.hotspotScore),
        type: 'bar',
        name: 'Hotspot Score',
        marker: {
            color: '#667eea',
            opacity: 0.8
        },
        yaxis: 'y'
    };
    
    const trace2 = {
        x: data.map(item => item.topic),
        y: data.map(item => item.easyScore),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Easy Score',
        line: {
            color: '#e74c3c',
            width: 3
        },
        marker: {
            color: '#e74c3c',
            size: 8
        },
        yaxis: 'y2'
    };
    
    const layout = {
        title: {
            text: 'Easy-to-Learn Hotspots',
            font: {
                size: 18,
                color: '#2c3e50'
            }
        },
        xaxis: {
            title: 'Topics',
            tickangle: -45
        },
        yaxis: {
            title: 'Hotspot Score',
            titlefont: { color: '#667eea' },
            tickfont: { color: '#667eea' },
            gridcolor: '#ecf0f1'
        },
        yaxis2: {
            title: 'Easy Score',
            titlefont: { color: '#e74c3c' },
            tickfont: { color: '#e74c3c' },
            overlaying: 'y',
            side: 'right',
            gridcolor: 'rgba(0,0,0,0)'
        },
        barmode: 'group',
        legend: {
            x: 0.02,
            y: 0.98
        },
        margin: { l: 60, r: 60, t: 60, b: 80 },
        height: 600,
        width: null, // Use full width
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        autosize: true
    };
    
    const config = {
        responsive: true,
        displayModeBar: false
    };
    
    Plotly.newPlot(dualAxisChartContainer, [trace1, trace2], layout, config);
}

// 4. Render Bubble Chart - Hotspot vs Ease
function renderBubbleChart() {

    
    const data = visualData.bubbleData;
    
    const categories = [...new Set(data.map(item => item.category))];
    const colors = ['#667eea', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6'];
    
    const traces = categories.map((category, index) => {
        const categoryData = data.filter(item => item.category === category);
        return {
            x: categoryData.map(item => item.ease),
            y: categoryData.map(item => item.hotspot),
            mode: 'markers+text',
            type: 'scatter',
            text: categoryData.map(item => item.topic),
            textposition: 'top center',
            marker: {
                size: categoryData.map(item => item.importance),
                color: colors[index % colors.length],
                opacity: 0.7,
                line: {
                    color: '#fff',
                    width: 1
                }
            },
            name: category,
            textfont: {
                size: 10,
                color: '#2c3e50'
            },
            hoverinfo: 'text+x+y+marker.size'
        };
    });
    
    const layout = {
        title: {
            text: 'Hotspot vs Ease Analysis',
            font: {
                size: 18,
                color: '#2c3e50'
            }
        },
        xaxis: {
            title: 'Ease of Learning',
            gridcolor: '#ecf0f1',
            zeroline: false
        },
        yaxis: {
            title: 'Hotspot Score',
            gridcolor: '#ecf0f1',
            zeroline: false
        },
        legend: {
            x: 0.02,
            y: 0.98
        },
        margin: { l: 60, r: 40, t: 60, b: 60 },
        height: 600,
        width: null, // Use full width
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        autosize: true
    };
    
    const config = {
        responsive: true,
        displayModeBar: false
    };
    
    Plotly.newPlot(bubbleChartContainer, traces, layout, config);
}

// 5. Render Comparison Chart - Subject vs Other Subjects
function renderComparisonChart() {
    if (!visualData || !visualData.comparisonData) {
        console.error('No comparison data available for comparison chart');
        return;
    }
    
    const currentSubject = visualData.comparisonData.currentSubject;
    const otherSubjects = visualData.comparisonData.otherSubjects;
    
    // Create data for difficulty comparison only
    const subjects = [currentSubject, ...otherSubjects];
    const subjectNames = subjects.map(s => s.name);
    const difficulties = subjects.map(s => s.difficulty);
    
    const trace = {
        x: subjectNames,
        y: difficulties,
        type: 'bar',
        marker: {
            color: subjectNames.map(name => 
                name === subject ? '#667eea' : '#95a5a6'
            ),
            opacity: 0.8
        },
        text: difficulties.map(d => `${d}/100`),
        textposition: 'auto',
        textfont: {
            size: 12,
            color: '#2c3e50'
        }
    };
    
    const layout = {
        title: {
            text: `Difficulty Comparison: ${subject} vs Other Subjects`,
            font: {
                size: 18,
                color: '#2c3e50'
            }
        },
        xaxis: {
            title: 'Subjects',
            gridcolor: '#ecf0f1'
        },
        yaxis: {
            title: 'Difficulty Level (0-100)',
            gridcolor: '#ecf0f1',
            zeroline: false,
            range: [0, 100]
        },
        margin: { l: 60, r: 40, t: 60, b: 60 },
        height: 600,
        width: null, // Use full width
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        autosize: true
    };
    
    const config = {
        responsive: true,
        displayModeBar: false
    };
    
    Plotly.newPlot(comparisonChartContainer, [trace], layout, config);
}

// 6. Render Syllabus Size Chart
function renderSyllabusChart() {
    console.log('=== RENDERING SYLLABUS CHART ===');
    if (!visualData) {
        console.error('No visual data available for syllabus chart');
        return;
    }
    if (!visualData.comparisonData) {
        console.error('No comparison data available for syllabus chart');
        return;
    }
    
    const currentSubject = visualData.comparisonData.currentSubject;
    const otherSubjects = visualData.comparisonData.otherSubjects;
    
    console.log('Syllabus chart subjects:', { currentSubject, otherSubjects });
    
    // Create data for syllabus size comparison
    const subjects = [currentSubject, ...otherSubjects];
    const subjectNames = subjects.map(s => s.name);
    const topicVolumes = subjects.map(s => s.topicVolume);
    
    console.log('Syllabus chart data:', { subjectNames, topicVolumes });
    
    // Validate container exists
    if (!syllabusChartContainer) {
        console.error('Syllabus chart container not found');
        return;
    }
    
    const trace = {
        x: subjectNames,
        y: topicVolumes,
            type: 'bar',
            marker: {
            color: subjectNames.map(name => 
                name === subject ? '#27ae60' : '#95a5a6'
            ),
                opacity: 0.8
        },
        text: topicVolumes.map(v => `${v}`),
        textposition: 'auto',
        textfont: {
            size: 12,
            color: '#2c3e50'
        },
        hovertemplate: '<b>%{x}</b><br>Syllabus Size: %{y}<extra></extra>'
    };
    
    const layout = {
        title: {
            text: 'Syllabus Size Comparison',
            font: {
                size: 18,
                color: '#2c3e50'
            }
        },
        xaxis: {
            title: 'Subjects',
            gridcolor: '#ecf0f1'
        },
        yaxis: {
            title: 'Syllabus Size',
            gridcolor: '#ecf0f1',
            zeroline: false,
            tickformat: 'd'
        },
        margin: { l: 60, r: 40, t: 60, b: 60 },
        height: 600,
        width: null, // Use full width
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        autosize: true
    };
    
    const config = {
        responsive: true,
        displayModeBar: false
    };
    
    if (syllabusChartContainer) {
        Plotly.newPlot(syllabusChartContainer, [trace], layout, config);
        console.log('Syllabus chart rendered successfully');
    } else {
        console.error('Syllabus chart container not found');
    }
}

// Populate chart indicators
function populateChartIndicators() {
    console.log('=== POPULATING CHART INDICATORS ===');
    if (!visualData) {
        console.error('No visual data available for indicators');
        return;
    }
    
    console.log('Visual data available:', {
        mainHotspots: visualData.mainHotspots?.length || 0,
        easyToLearnData: visualData.easyToLearnData?.length || 0,
        quadrantData: visualData.quadrantData?.length || 0,
        bubbleData: visualData.bubbleData?.length || 0,
        comparisonData: !!visualData.comparisonData
    });
    
    // Pie Chart Indicators - Show top topics with colors
    populatePieChartIndicators();
    
    // Dual Axis Chart Indicators - Show hotspot and easy scores
    populateDualAxisChartIndicators();
    
    // Quadrant Chart Indicators - Show weight and hotspot scores
    populateQuadrantChartIndicators();
    
    // Bubble Chart Indicators - Show ease and hotspot scores
    populateBubbleChartIndicators();
    
    // Comparison Chart Indicators - Show difficulty levels
    populateComparisonChartIndicators();
    
    // Syllabus Chart Indicators - Show topic volumes
    populateSyllabusChartIndicators();
    
    console.log('Chart indicators populated successfully');
}

function populatePieChartIndicators() {
    console.log('Populating pie chart indicators...');
    const container = document.getElementById('pieChartIndicators');
    if (!container) {
        console.error('Pie chart indicators container not found');
        return;
    }
    if (!visualData.mainHotspots) {
        console.error('No mainHotspots data available');
        return;
    }
    
    // Clear container first
    container.innerHTML = '';
    console.log('Pie chart topics:', visualData.mainHotspots.slice(0, 5));
    
    // Show only top 3 topics with their colors (no percentages, no duplicates)
    const uniqueTopics = visualData.mainHotspots
        .filter((topic, index, self) => self.findIndex(t => t.topic === topic.topic) === index)
        .slice(0, 3);
    
    uniqueTopics.forEach(topic => {
        const indicator = document.createElement('div');
        indicator.className = 'chart-indicator';
        indicator.innerHTML = `
            <div class="chart-indicator-color" style="background-color: ${topic.color}"></div>
            <span>${topic.topic}</span>
        `;
        container.appendChild(indicator);
    });
    
    console.log('Pie chart indicators populated with', uniqueTopics.length, 'unique topics');
}

function populateDualAxisChartIndicators() {
    console.log('Populating dual axis chart indicators...');
    const container = document.getElementById('dualAxisChartIndicators');
    if (!container) {
        console.error('Dual axis chart indicators container not found');
        return;
    }
    if (!visualData.easyToLearnData) {
        console.error('No easyToLearnData available');
        return;
    }
    
    container.innerHTML = '';
    console.log('Dual axis topics:', visualData.easyToLearnData.slice(0, 3));
    
    // Show top 3 topics with hotspot and easy scores in separate indicators
    visualData.easyToLearnData.slice(0, 3).forEach(topic => {
        // Hotspot score indicator
        const hotspotIndicator = document.createElement('div');
        hotspotIndicator.className = 'chart-indicator';
        hotspotIndicator.innerHTML = `
            <span>${topic.topic} - Hotspot</span>
            <span class="chart-indicator-value">${topic.hotspotScore}</span>
        `;
        container.appendChild(hotspotIndicator);
        
        // Easy score indicator
        const easyIndicator = document.createElement('div');
        easyIndicator.className = 'chart-indicator';
        easyIndicator.innerHTML = `
            <span>${topic.topic} - Easy</span>
            <span class="chart-indicator-value">${topic.easyScore}</span>
        `;
        container.appendChild(easyIndicator);
    });
    
    console.log('Dual axis chart indicators populated');
}

function populateQuadrantChartIndicators() {
    const container = document.getElementById('quadrantChartIndicators');
    if (!container || !visualData.quadrantData) return;
    
    container.innerHTML = '';
    
    // Show top 3 topics with weight and hotspot scores
    visualData.quadrantData.slice(0, 3).forEach(topic => {
        const indicator = document.createElement('div');
        indicator.className = 'chart-indicator';
        indicator.innerHTML = `
            <span>${topic.topic}</span>
            <span class="chart-indicator-value">W:${topic.weight}</span>
            <span class="chart-indicator-value">H:${topic.hotspotScore}</span>
        `;
        container.appendChild(indicator);
    });
}

function populateBubbleChartIndicators() {
    const container = document.getElementById('bubbleChartIndicators');
    if (!container || !visualData.bubbleData) return;
    
    container.innerHTML = '';
    
    // Show top 3 topics with ease, hotspot, and importance
    visualData.bubbleData.slice(0, 3).forEach(topic => {
        const indicator = document.createElement('div');
        indicator.className = 'chart-indicator';
        indicator.innerHTML = `
            <span>${topic.topic}</span>
            <span class="chart-indicator-value">E:${topic.ease}</span>
            <span class="chart-indicator-value">H:${topic.hotspot}</span>
            <span class="chart-indicator-value">I:${topic.importance}</span>
        `;
        container.appendChild(indicator);
    });
}

function populateComparisonChartIndicators() {
    const container = document.getElementById('comparisonChartIndicators');
    if (!container || !visualData.comparisonData) return;
    
    container.innerHTML = '';
    
    const currentSubject = visualData.comparisonData.currentSubject;
    const otherSubjects = visualData.comparisonData.otherSubjects.slice(0, 3);
    
    // Show current subject difficulty
    const currentIndicator = document.createElement('div');
    currentIndicator.className = 'chart-indicator';
    currentIndicator.innerHTML = `
        <span>${currentSubject.name}</span>
        <span class="chart-indicator-value">D:${currentSubject.difficulty}</span>
    `;
    container.appendChild(currentIndicator);
    
    // Show top 3 other subjects
    otherSubjects.forEach(subject => {
        const indicator = document.createElement('div');
        indicator.className = 'chart-indicator';
        indicator.innerHTML = `
            <span>${subject.name}</span>
            <span class="chart-indicator-value">D:${subject.difficulty}</span>
        `;
        container.appendChild(indicator);
    });
}

function populateSyllabusChartIndicators() {
    const container = document.getElementById('syllabusChartIndicators');
    if (!container || !visualData.comparisonData) return;
    
    container.innerHTML = '';
    
    const currentSubject = visualData.comparisonData.currentSubject;
    const otherSubjects = visualData.comparisonData.otherSubjects.slice(0, 3);
    
    // Show current subject syllabus size
    const currentIndicator = document.createElement('div');
    currentIndicator.className = 'chart-indicator';
    currentIndicator.innerHTML = `
        <span>${currentSubject.name}</span>
        <span class="chart-indicator-value">${currentSubject.topicVolume}</span>
    `;
    container.appendChild(currentIndicator);
    
    // Show top 3 other subjects
    otherSubjects.forEach(subject => {
        const indicator = document.createElement('div');
        indicator.className = 'chart-indicator';
        indicator.innerHTML = `
            <span>${subject.name}</span>
            <span class="chart-indicator-value">${subject.topicVolume}</span>
        `;
        container.appendChild(indicator);
    });
}

// Export chart function
function exportChart(chartId) {
    const chartDiv = document.getElementById(chartId);
    if (chartDiv && chartDiv.data) {
        Plotly.downloadImage(chartDiv, {
            format: 'png',
            filename: `${chartId}_${subject}_${examType}`,
            height: 600,
            width: 800
        });
    }
}

// Print chart function
function printChart(chartId) {
    const chartDiv = document.getElementById(chartId);
    if (chartDiv) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${chartId} - ${subject}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .chart-title { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
                        .chart-info { margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <div class="chart-title">${chartId.replace(/([A-Z])/g, ' $1').trim()} - ${subject}</div>
                    <div class="chart-info">Exam: ${examType} | Subject: ${subject}</div>
                    <div id="chart"></div>
                    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
                    <script>
                        const chartData = ${JSON.stringify(chartDiv.data)};
                        const chartLayout = ${JSON.stringify(chartDiv.layout)};
                        Plotly.newPlot('chart', chartData, chartLayout);
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
}

// Utility functions
function showLoading(show) {
    console.log('=== SHOW LOADING ===');
    console.log('Parameter:', show);
    console.log('DOM elements:', { 
        loadingSection: !!loadingSection, 
        visualAnalyzerSection: !!visualAnalyzerSection,
        loadingSectionElement: loadingSection,
        visualAnalyzerSectionElement: visualAnalyzerSection
    });
    
    if (show) {
        if (loadingSection) {
            loadingSection.classList.remove('hidden');
            console.log('✅ Loading section shown');
        } else {
            console.error('❌ Loading section element not found');
        }
        if (visualAnalyzerSection) {
            visualAnalyzerSection.classList.add('hidden');
            console.log('✅ Visual analyzer section hidden');
        } else {
            console.error('❌ Visual analyzer section element not found');
        }
    } else {
        if (loadingSection) {
            loadingSection.classList.add('hidden');
            console.log('✅ Loading section hidden');
        }
        if (visualAnalyzerSection) {
            visualAnalyzerSection.classList.remove('hidden');
            console.log('✅ Visual analyzer section shown');
        }
    }
}

function showVisualAnalyzer() {
    console.log('showVisualAnalyzer called');
    console.log('DOM elements:', { visualAnalyzerSection: !!visualAnalyzerSection, loadingSection: !!loadingSection });
    
    if (visualAnalyzerSection) {
        visualAnalyzerSection.classList.remove('hidden');
        console.log('Visual analyzer section shown');
    } else {
        console.error('Visual analyzer section element not found');
    }
    if (loadingSection) {
        loadingSection.classList.add('hidden');
        console.log('Loading section hidden');
    } else {
        console.error('Loading section element not found');
    }
}

function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
    }
    if (errorSection) {
        errorSection.classList.remove('hidden');
    }
    if (loadingSection) {
        loadingSection.classList.add('hidden');
    }
}

function hideError() {
    if (errorSection) {
        errorSection.classList.add('hidden');
    }
}

// Pointer Event Functions
function highlightTopTopics() {
    console.log('highlightTopTopics called');
    alert('highlightTopTopics function called!');
    
    if (!visualData || !visualData.mainHotspots) {
        alert('No visual data available. Please generate data first.');
        return;
    }
    
    const topTopics = visualData.mainHotspots
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3);
    
    alert(`Top Priority Topics:\n${topTopics.map((topic, index) => 
        `${index + 1}. ${topic.topic} (${topic.percentage}%)`
    ).join('\n')}`);
}

function showEasyWins() {
    console.log('showEasyWins called');
    alert('showEasyWins function called!');
    
    if (!visualData || !visualData.easyToLearnData) {
        alert('No visual data available. Please generate data first.');
        return;
    }
    
    const easyWins = visualData.easyToLearnData
        .filter(item => item.hotspotScore > 60 && item.easyScore > 60)
        .sort((a, b) => (b.hotspotScore + b.easyScore) - (a.hotspotScore + a.easyScore));
    
    if (easyWins.length === 0) {
        alert('No easy wins found. Focus on improving your weakest areas first.');
        return;
    }
    
    alert(`Easy Wins (High Frequency + Easy to Learn):\n${easyWins.map((topic, index) => 
        `${index + 1}. ${topic.topic} (Hotspot: ${topic.hotspotScore}, Easy: ${topic.easyScore})`
    ).join('\n')}`);
}

function analyzeWeakAreas() {
    if (!visualData || !visualData.easyToLearnData) return;
    
    const weakAreas = visualData.easyToLearnData
        .filter(item => item.hotspotScore > 50 && item.easyScore < 40)
        .sort((a, b) => b.hotspotScore - a.hotspotScore);
    
    if (weakAreas.length === 0) {
        alert('Great! No significant weak areas identified. Keep up the good work!');
        return;
    }
    
    alert(`Weak Areas (High Frequency but Difficult):\n${weakAreas.map((topic, index) => 
        `${index + 1}. ${topic.topic} (Hotspot: ${topic.hotspotScore}, Easy: ${topic.easyScore})`
    ).join('\n')}`);
}

function generateStudyPlan() {
    if (!visualData) return;
    
    const plan = `Study Plan for ${subject}:\n\n` +
        `1. Week 1-2: Focus on high-priority topics\n` +
        `2. Week 3-4: Practice easy wins for confidence\n` +
        `3. Week 5-6: Work on weak areas\n` +
        `4. Week 7-8: Review and practice all topics\n\n` +
        `Recommended daily study time: 2-3 hours\n` +
        `Focus on active learning and practice questions.`;
    
    alert(plan);
}

function compareSubjects() {
    if (!visualData || !visualData.comparisonData) return;
    
    const current = visualData.comparisonData.currentSubject;
    const others = visualData.comparisonData.otherSubjects;
    
    const comparison = `${subject} Analysis:\n\n` +
        `Exam Weight: ${current.examWeight}% (vs avg: ${Math.round(others.reduce((sum, s) => sum + s.examWeight, 0) / others.length)}%)\n` +
        `Topic Volume: ${current.topicVolume} topics (vs avg: ${Math.round(others.reduce((sum, s) => sum + s.topicVolume, 0) / others.length)})\n` +
        `Difficulty: ${current.difficulty}/100\n` +
        `Performance: ${current.performance}/100\n\n` +
        `This subject is ${current.difficulty > 70 ? 'challenging' : current.difficulty > 40 ? 'moderate' : 'relatively easy'} to master.`;
    
    alert(comparison);
}

function exportAnalysis() {
    if (!visualData) {
        alert('No data available to export. Please wait for the analysis to complete.');
        return;
    }
    
    // Create a comprehensive analysis report
    const report = generateAnalysisReport();
    
    console.log('=== EXPORT ANALYSIS ===');
    console.log('window.jspdf:', window.jspdf);
    console.log('window.jspdf.jsPDF:', window.jspdf?.jsPDF);
    console.log('typeof jsPDF:', typeof jsPDF);
    console.log('typeof window.jsPDF:', typeof window.jsPDF);
    
    // Check for jsPDF availability with multiple fallbacks
    let jsPDFAvailable = false;
    
    if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
        jsPDFAvailable = true;
        console.log('Using window.jspdf.jsPDF');
    } else if (typeof jsPDF !== 'undefined') {
        window.jspdf = { jsPDF: jsPDF };
        jsPDFAvailable = true;
        console.log('Using global jsPDF');
    } else if (typeof window.jsPDF !== 'undefined') {
        window.jspdf = { jsPDF: window.jsPDF };
        jsPDFAvailable = true;
        console.log('Using window.jsPDF');
    }
    
    if (jsPDFAvailable) {
        try {
            generatePDFReport(report);
        } catch (error) {
            console.error('PDF generation failed:', error);
            fallbackToJSON(report);
        }
    } else {
        console.log('jsPDF not available, falling back to JSON');
        fallbackToJSON(report);
    }
}

function fallbackToJSON(report) {
    const analysisData = {
        examType: examType,
        subject: subject,
        generatedAt: new Date().toISOString(),
        data: visualData,
        report: report
    };
    
    const dataStr = JSON.stringify(analysisData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `visual-analysis-${examType}-${subject}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    alert('Analysis exported as JSON! For PDF export, please ensure jsPDF library is loaded.');
}

function generateAnalysisReport() {
    const report = {
        title: `Visual Analysis Report - ${examType} ${subject}`,
        generatedAt: new Date().toLocaleString(),
        summary: {
            examType: examType,
            subject: subject,
            totalTopics: visualData.mainHotspots?.length || 0,
            topTopic: visualData.mainHotspots?.[0]?.topic || 'N/A',
            topTopicPercentage: visualData.mainHotspots?.[0]?.percentage || 0
        },
        topTopics: visualData.mainHotspots?.slice(0, 5) || [],
        easyWins: visualData.easyToLearnData?.filter(item => item.hotspotScore > 60 && item.easyScore > 60) || [],
        weakAreas: visualData.easyToLearnData?.filter(item => item.hotspotScore > 50 && item.easyScore < 40) || [],
        recommendations: generateRecommendations()
    };
    
    return report;
}

function generateRecommendations() {
    const recommendations = [];
    
    if (visualData.mainHotspots?.length > 0) {
        recommendations.push(`Focus on ${visualData.mainHotspots[0].topic} (${visualData.mainHotspots[0].percentage}% exam weight)`);
    }
    
    const easyWins = visualData.easyToLearnData?.filter(item => item.hotspotScore > 60 && item.easyScore > 60) || [];
    if (easyWins.length > 0) {
        recommendations.push(`Prioritize ${easyWins[0].topic} as an easy win (high frequency, easy to learn)`);
    }
    
    const weakAreas = visualData.easyToLearnData?.filter(item => item.hotspotScore > 50 && item.easyScore < 40) || [];
    if (weakAreas.length > 0) {
        recommendations.push(`Allocate extra time for ${weakAreas[0].topic} (high frequency but challenging)`);
    }
    
    if (recommendations.length === 0) {
        recommendations.push('Review all topics systematically with equal focus');
    }
    
    return recommendations;
}

function generatePDFReport(report) {
    try {
        console.log('=== GENERATING PDF REPORT ===');
        console.log('window.jspdf:', window.jspdf);
        console.log('typeof jsPDF:', typeof jsPDF);
        
        let jsPDFClass;
        if (window.jspdf && window.jspdf.jsPDF) {
            jsPDFClass = window.jspdf.jsPDF;
            console.log('Using window.jspdf.jsPDF');
        } else if (typeof jsPDF !== 'undefined') {
            jsPDFClass = jsPDF;
            console.log('Using global jsPDF');
        } else {
            throw new Error('jsPDF not available');
        }
        
        const doc = new jsPDFClass();
        
        // Title
        doc.setFontSize(20);
        doc.text(report.title, 20, 20);
        
        // Generated date
        doc.setFontSize(12);
        doc.text(`Generated: ${report.generatedAt}`, 20, 35);
        
        // Summary
        doc.setFontSize(16);
        doc.text('Summary', 20, 50);
        doc.setFontSize(12);
        doc.text(`Exam: ${report.summary.examType}`, 20, 65);
        doc.text(`Subject: ${report.summary.subject}`, 20, 75);
        doc.text(`Total Topics: ${report.summary.totalTopics}`, 20, 85);
        doc.text(`Top Topic: ${report.summary.topTopic} (${report.summary.topTopicPercentage}%)`, 20, 95);
        
        // Top Topics
        doc.setFontSize(16);
        doc.text('Top Priority Topics', 20, 115);
        doc.setFontSize(12);
        report.topTopics.forEach((topic, index) => {
            doc.text(`${index + 1}. ${topic.topic} - ${topic.percentage}%`, 20, 130 + (index * 10));
        });
        
        // Easy Wins
        if (report.easyWins.length > 0) {
            doc.setFontSize(16);
            doc.text('Easy Wins', 20, 160);
            doc.setFontSize(12);
            report.easyWins.forEach((topic, index) => {
                doc.text(`${index + 1}. ${topic.topic} (Hotspot: ${topic.hotspotScore}, Easy: ${topic.easyScore})`, 20, 175 + (index * 10));
            });
        }
        
        // Weak Areas
        if (report.weakAreas.length > 0) {
            doc.setFontSize(16);
            doc.text('Weak Areas', 20, 200);
            doc.setFontSize(12);
            report.weakAreas.forEach((topic, index) => {
                doc.text(`${index + 1}. ${topic.topic} (Hotspot: ${topic.hotspotScore}, Easy: ${topic.easyScore})`, 20, 215 + (index * 10));
            });
        }
        
        // Recommendations
        doc.setFontSize(16);
        doc.text('Recommendations', 20, 240);
        doc.setFontSize(12);
        report.recommendations.forEach((rec, index) => {
            doc.text(`${index + 1}. ${rec}`, 20, 255 + (index * 10));
        });
        
        // Save PDF
        doc.save(`visual-analysis-${examType}-${subject}-${new Date().toISOString().split('T')[0]}.pdf`);
        alert('Analysis exported as PDF successfully!');
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Falling back to JSON export.');
        
        // Fallback to JSON
        const analysisData = {
            examType: examType,
            subject: subject,
            generatedAt: new Date().toISOString(),
            data: visualData,
            report: report
        };
        
        const dataStr = JSON.stringify(analysisData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `visual-analysis-${examType}-${subject}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
}

// Clear cache function with Redis support
async function clearVisualAnalyzerCache() {
    try {
        // Clear server-side cache
        const response = await fetch('/api/clear-cache', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pattern: `visual_data:${examType}:${subject}`
            })
        });
        
        const result = await response.json();
        console.log('Server cache clear result:', result);
        
        // Clear session storage cache
        const sessionCacheKey = `visual_analyzer_${examType}_${subject}`;
        sessionStorage.removeItem(sessionCacheKey);
        console.log('Cleared session cache for:', sessionCacheKey);
        
        // Show success message
        if (result.success) {
            alert('✅ Cache cleared successfully! Data will be regenerated on next load.');
        } else {
            alert('⚠️ Cache clear partially successful. Session cache cleared.');
        }
    } catch (error) {
        console.error('Error clearing cache:', error);
        alert('❌ Error clearing cache. Please try again.');
    }
}

// Manual data generation for testing
async function forceGenerateData() {
    console.log('Force generating new data...');
    await generateVisualData(true);
}

// Check cache status with Redis support
async function checkCacheStatus() {
    try {
        const response = await fetch('/api/cache-status');
        const status = await response.json();
        console.log('Cache status:', status);
        
        if (status.available) {
            const currentCacheKey = `visual_data:${examType}:${subject}`;
            const currentCache = status.cacheInfo.find(cache => cache.key === currentCacheKey);
            
            if (currentCache) {
                const ttlMinutes = Math.floor(currentCache.ttl / 60);
                console.log(`Current data cached for ${ttlMinutes} more minutes`);
                return { available: true, ttl: currentCache.ttl, ttlMinutes };
            } else {
                console.log('No cached data found for current exam/subject');
                return { available: false };
            }
        } else {
            console.log('Redis cache not available');
            return { available: false, message: status.message };
        }
    } catch (error) {
        console.error('Error checking cache status:', error);
        return { available: false, error: error.message };
    }
}

// Show cache status to user
async function showCacheStatus() {
    try {
        const status = await checkCacheStatus();
        
        if (status.available) {
            if (status.ttlMinutes > 0) {
                alert(`📦 Cache Status:\n\n✅ Redis cache is available\n📊 Current data cached for ${status.ttlMinutes} more minutes\n🔄 Data will auto-refresh when cache expires`);
            } else {
                alert(`📦 Cache Status:\n\n✅ Redis cache is available\n⚠️ Current data cache has expired\n🔄 New data will be generated on next request`);
            }
        } else {
            alert(`📦 Cache Status:\n\n❌ Redis cache not available\n💾 Using session storage fallback\n🔄 Data will be generated fresh each time\n\nReason: ${status.message || status.error || 'Unknown'}`);
        }
    } catch (error) {
        console.error('Error showing cache status:', error);
        alert('❌ Error checking cache status. Please try again.');
    }
}

// Final initialization to ensure proper state
function finalizeInitialization() {
    console.log('Finalizing initialization...');
    
    // Ensure proper loading state
    ensureProperLoadingState();
    
    // Hide any remaining loading messages
    hideChartLoadingMessages();
    
    // Force layout recalculation
    if (visualAnalyzerSection) {
        visualAnalyzerSection.style.display = 'block';
        visualAnalyzerSection.offsetHeight; // Force reflow
    }
    
    console.log('Initialization finalized');
}

// Ensure proper loading state and positioning
function ensureProperLoadingState() {
    // Hide main loading section
    if (loadingSection) {
        loadingSection.classList.add('hidden');
    }
    
    // Show visual analyzer section
    if (visualAnalyzerSection) {
        visualAnalyzerSection.classList.remove('hidden');
    }
    
    // Hide any error sections
    if (errorSection) {
        errorSection.classList.add('hidden');
    }
    
    console.log('Loading state properly managed');
} 