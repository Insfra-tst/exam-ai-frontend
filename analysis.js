// Global variables
let currentExamType = '';
let currentSubject = '';
let currentTopic = '';
let analysisData = null;

// DOM elements
const loadingSection = document.getElementById('loadingSection');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const analysisSection = document.getElementById('analysisSection');
const analysisTitle = document.getElementById('analysisTitle');
const analysisSubtitle = document.getElementById('analysisSubtitle');
const sampleQuestion = document.getElementById('sampleQuestion');
const answer = document.getElementById('answer');
const explanation = document.getElementById('explanation');
const shortNote = document.getElementById('shortNote');
const learningTips = document.getElementById('learningTips');
const answerSection = document.getElementById('answerSection');
const solveBtn = document.getElementById('solveBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Get data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    currentExamType = urlParams.get('exam') || '';
    currentSubject = urlParams.get('subject') || '';
    currentTopic = urlParams.get('topic') || '';
    
    if (!currentExamType || !currentSubject || !currentTopic) {
        showError('Missing exam, subject, or topic parameters');
        return;
    }
    
    // Update page title and subtitle
    analysisTitle.textContent = currentTopic;
    analysisSubtitle.textContent = `${currentExamType} - ${currentSubject}`;
    
    // Generate analysis
    generateAnalysis();
    
    // Setup tab functionality
    setupTabs();
    
    // Setup solve button
    setupSolveButton();
});

// Generate analysis for the topic
async function generateAnalysis() {
    showLoading(true);
    
    try {
        const response = await fetch('/api/analyze-topic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                examType: currentExamType,
                subject: currentSubject,
                topic: currentTopic
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate analysis');
        }
        
        const analysis = await response.json();
        analysisData = analysis;
        
        displayAnalysis(analysis);
        
    } catch (error) {
        console.error('Error generating analysis:', error);
        showError('Failed to generate analysis. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Display analysis data
function displayAnalysis(analysis) {
    // Display sample question
    sampleQuestion.textContent = analysis.sampleQuestion || 'Sample question not available';
    
    // Display answer
    answer.textContent = analysis.answer || 'Answer not available';
    
    // Display explanation
    explanation.textContent = analysis.explanation || 'Explanation not available';
    
    // Display short note
    shortNote.textContent = analysis.shortNote || 'Key concepts not available';
    
    // Display learning tips
    if (Array.isArray(analysis.learningTips)) {
        const tipsList = analysis.learningTips.map(tip => `<li>${tip}</li>`).join('');
        learningTips.innerHTML = `<ul class="tips-list">${tipsList}</ul>`;
    } else {
        learningTips.textContent = analysis.learningTips || 'Learning tips not available';
    }
    
    showAnalysis();
}

// Setup tab functionality
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding pane
            this.classList.add('active');
            document.getElementById(targetTab + 'Tab').classList.add('active');
        });
    });
}

// Setup solve button
function setupSolveButton() {
    solveBtn.addEventListener('click', function() {
        if (answerSection.classList.contains('hidden')) {
            answerSection.classList.remove('hidden');
            this.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Answer';
        } else {
            answerSection.classList.add('hidden');
            this.innerHTML = '<i class="fas fa-eye"></i> Show Answer';
        }
    });
}

// Show loading
function showLoading(show) {
    if (show) {
        loadingSection.classList.remove('hidden');
        analysisSection.classList.add('hidden');
        errorSection.classList.add('hidden');
    } else {
        loadingSection.classList.add('hidden');
    }
}

// Show analysis
function showAnalysis() {
    analysisSection.classList.remove('hidden');
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
    loadingSection.classList.add('hidden');
    analysisSection.classList.add('hidden');
}

// Go back to topics page
function goBack() {
    const params = new URLSearchParams({
        exam: currentExamType,
        subject: currentSubject
    });
    window.location.href = `/topics.html?${params.toString()}`;
} 