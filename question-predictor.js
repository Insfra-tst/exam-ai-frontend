// Global variables
let examType = '';
let subject = '';
let currentRandomQuestion = null;
let cachedQuestionData = null;
let displayedQuestions = 0;
const QUESTIONS_PER_LOAD = 3;
const INITIAL_QUESTIONS = 3;
const MAX_QUESTIONS = 12;

// DOM elements
const loadingSection = document.getElementById('loadingSection');
const errorSection = document.getElementById('errorSection');
const questionPredictorSection = document.getElementById('questionPredictorSection');
const questionPredictorGrid = document.getElementById('questionPredictorGrid');
const randomQuestionContainer = document.getElementById('randomQuestionContainer');
const randomQuestionTitle = document.getElementById('randomQuestionTitle');
const randomQuestionText = document.getElementById('randomQuestionText');
const solveAnswerBtn = document.getElementById('solveAnswerBtn');
const solutionContainer = document.getElementById('solutionContainer');
const solutionAnswer = document.getElementById('solutionAnswer');
const solutionSteps = document.getElementById('solutionSteps');
const errorMessage = document.getElementById('errorMessage');
const loadMoreSection = document.getElementById('loadMoreSection');

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
    
    // Check if we have cached question data
    const cacheKey = `questions_${examType}_${subject}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
        try {
            // Show loading message for cached data
            showLoadingMessage('Loading saved data...', 'Retrieving previously generated question predictions');
            cachedQuestionData = JSON.parse(cachedData);
            
            // Simulate a brief loading time for better UX
            setTimeout(() => {
                displayQuestionPredictions(cachedQuestionData);
                showQuestionPredictor();
                showLoading(false); // Hide loading after displaying data
            }, 500);
        } catch (e) {
            console.error('Error parsing cached question data:', e);
            generateQuestionPredictions();
        }
    } else {
        // Generate question predictions
        generateQuestionPredictions();
    }
});

// Generate question predictions using OpenAI
async function generateQuestionPredictions() {
    showLoading(true);
    hideError();
    
    try {
        const response = await fetch('/api/generate-predicted-questions', {
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
            throw new Error('Failed to generate question predictions');
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Cache the data
            const cacheKey = `questions_${examType}_${subject}`;
            sessionStorage.setItem(cacheKey, JSON.stringify(data.predictedQuestions));
            cachedQuestionData = data.predictedQuestions;
            
            displayQuestionPredictions(data.predictedQuestions);
        } else {
            throw new Error(data.error || 'Failed to generate question predictions');
        }
        
    } catch (error) {
        console.error('Error generating question predictions:', error);
        showError('Failed to generate question predictions. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Display question predictions in tile format
function displayQuestionPredictions(predictedQuestions) {
    questionPredictorGrid.innerHTML = '';
    displayedQuestions = 0;
    
    // Show initial questions (first 3)
    const initialQuestions = predictedQuestions.slice(0, INITIAL_QUESTIONS);
    displayQuestionTiles(initialQuestions);
    
    // Show load more button if there are more questions and we haven't reached the max
    const totalQuestionsToShow = Math.min(predictedQuestions.length, MAX_QUESTIONS);
    if (totalQuestionsToShow > INITIAL_QUESTIONS) {
        loadMoreSection.classList.remove('hidden');
    }
    
    showQuestionPredictor();
}

// Display question tiles
function displayQuestionTiles(questions) {
    questions.forEach((question, index) => {
        const tile = document.createElement('div');
        tile.className = 'question-predictor-tile';
        
        // Question name and topic
        const questionName = document.createElement('h3');
        questionName.className = 'question-name';
        questionName.textContent = question.questionName;
        
        const questionTopic = document.createElement('div');
        questionTopic.className = 'question-topic';
        questionTopic.textContent = question.topic;
        
        // Explanation
        const explanation = document.createElement('p');
        explanation.className = 'question-explanation';
        explanation.textContent = question.explanation;
        
        // Heatmap score section
        const heatmapScoreSection = document.createElement('div');
        heatmapScoreSection.className = 'heatmap-score-section';
        
        const heatmapScoreLabel = document.createElement('div');
        heatmapScoreLabel.className = 'heatmap-score-label';
        heatmapScoreLabel.textContent = 'Heatmap Score (Likelihood of Appearance)';
        
        const heatmapScoreDisplay = document.createElement('div');
        heatmapScoreDisplay.className = 'heatmap-score-display';
        
        const heatmapScoreBar = document.createElement('div');
        heatmapScoreBar.className = 'heatmap-score-bar';
        
        const heatmapScoreFill = document.createElement('div');
        heatmapScoreFill.className = 'heatmap-score-fill';
        heatmapScoreFill.style.width = `${question.heatmapScore}%`;
        
        const heatmapScoreText = document.createElement('div');
        heatmapScoreText.className = 'heatmap-score-text';
        heatmapScoreText.textContent = `${question.heatmapScore}%`;
        
        heatmapScoreBar.appendChild(heatmapScoreFill);
        heatmapScoreDisplay.appendChild(heatmapScoreBar);
        heatmapScoreDisplay.appendChild(heatmapScoreText);
        heatmapScoreSection.appendChild(heatmapScoreLabel);
        heatmapScoreSection.appendChild(heatmapScoreDisplay);
        
        // Example questions section
        const exampleQuestionsSection = document.createElement('div');
        exampleQuestionsSection.className = 'example-questions-section';
        
        const exampleQuestionsLabel = document.createElement('div');
        exampleQuestionsLabel.className = 'example-questions-label';
        exampleQuestionsLabel.textContent = 'Example Questions:';
        
        const exampleQuestionsGrid = document.createElement('div');
        exampleQuestionsGrid.className = 'example-questions-grid';
        
        // Add example question buttons (without Q1, Q2, Q3 labels)
        question.exampleQuestions.forEach((exampleQuestion, qIndex) => {
            const exampleBtn = document.createElement('button');
            exampleBtn.className = 'example-question-btn';
            exampleBtn.textContent = exampleQuestion.substring(0, 30) + (exampleQuestion.length > 30 ? '...' : '');
            exampleBtn.title = exampleQuestion;
            exampleBtn.onclick = () => openAdvancedQuestionPage(exampleQuestion, question.questionName, question.topic);
            exampleQuestionsGrid.appendChild(exampleBtn);
        });
        
        exampleQuestionsSection.appendChild(exampleQuestionsLabel);
        exampleQuestionsSection.appendChild(exampleQuestionsGrid);
        
        // Assemble tile
        tile.appendChild(questionName);
        tile.appendChild(questionTopic);
        tile.appendChild(explanation);
        tile.appendChild(heatmapScoreSection);
        tile.appendChild(exampleQuestionsSection);
        
        // Add tile to grid
        questionPredictorGrid.appendChild(tile);
        displayedQuestions++;
    });
}

// Load more questions
function loadMoreQuestions() {
    if (!cachedQuestionData) return;
    
    const startIndex = displayedQuestions;
    const endIndex = Math.min(startIndex + QUESTIONS_PER_LOAD, Math.min(cachedQuestionData.length, MAX_QUESTIONS));
    const nextQuestions = cachedQuestionData.slice(startIndex, endIndex);
    
    displayQuestionTiles(nextQuestions);
    
    // Hide load more button if all questions are displayed or max reached
    if (endIndex >= Math.min(cachedQuestionData.length, MAX_QUESTIONS)) {
        loadMoreSection.classList.add('hidden');
    }
}

// Generate random question
async function generateRandomQuestion() {
    try {
        const response = await fetch('/api/generate-random-question', {
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
            throw new Error('Failed to generate random question');
        }
        
        const data = await response.json();
        
        if (data.success) {
            displayRandomQuestion(data.randomQuestion);
        } else {
            throw new Error(data.error || 'Failed to generate random question');
        }
        
    } catch (error) {
        console.error('Error generating random question:', error);
        // Use fallback random question
        displayRandomQuestion(generateFallbackRandomQuestion());
    }
}

// Display random question
function displayRandomQuestion(randomQuestion) {
    currentRandomQuestion = randomQuestion;
    
    randomQuestionTitle.textContent = randomQuestion.questionName;
    randomQuestionText.textContent = randomQuestion.questionText;
    
    // Set button text based on subject
    const isMathSubject = ['Mathematics', 'Math', 'Calculus', 'Algebra', 'Geometry'].some(math => 
        subject.toLowerCase().includes(math.toLowerCase())
    );
    
    solveAnswerBtn.textContent = isMathSubject ? 'Solve It' : 'Answer It';
    
    // Hide previous solution
    solutionContainer.classList.add('hidden');
    
    // Show random question container
    randomQuestionContainer.classList.remove('hidden');
    
    // Scroll to random question
    randomQuestionContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Show solution for random question
function showSolution() {
    if (!currentRandomQuestion) return;
    
    solutionAnswer.textContent = currentRandomQuestion.answer;
    
    // Create step-by-step solution
    let stepsHTML = '<ol>';
    currentRandomQuestion.steps.forEach(step => {
        stepsHTML += `<li>${step}</li>`;
    });
    stepsHTML += '</ol>';
    
    solutionSteps.innerHTML = stepsHTML;
    
    // Show solution container
    solutionContainer.classList.remove('hidden');
}

// Generate fallback random question
function generateFallbackRandomQuestion() {
    const isMathSubject = ['Mathematics', 'Math', 'Calculus', 'Algebra', 'Geometry'].some(math => 
        subject.toLowerCase().includes(math.toLowerCase())
    );
    
    if (isMathSubject) {
        return {
            questionName: 'Calculus Problem',
            questionText: 'Find the derivative of f(x) = x³ + 2x² - 5x + 3 and determine the critical points.',
            answer: 'f\'(x) = 3x² + 4x - 5. Critical points: x = (-4 ± √76)/6',
            steps: [
                'Apply the power rule to each term: d/dx(x³) = 3x², d/dx(2x²) = 4x, d/dx(-5x) = -5, d/dx(3) = 0',
                'Combine all terms: f\'(x) = 3x² + 4x - 5',
                'Set f\'(x) = 0 to find critical points: 3x² + 4x - 5 = 0',
                'Use quadratic formula: x = (-4 ± √(16 + 60))/6 = (-4 ± √76)/6'
            ]
        };
    } else {
        return {
            questionName: 'Conceptual Question',
            questionText: 'Explain the main differences between mitosis and meiosis in terms of their purpose and outcomes.',
            answer: 'Mitosis produces two identical daughter cells for growth and repair, while meiosis produces four genetically different cells for reproduction.',
            steps: [
                'Mitosis purpose: Growth, repair, and asexual reproduction',
                'Mitosis outcome: Two identical diploid daughter cells',
                'Meiosis purpose: Sexual reproduction and genetic diversity',
                'Meiosis outcome: Four genetically different haploid cells'
            ]
        };
    }
}

// Show example question in modal
function showExampleQuestion(questionText, questionName) {
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;
    
    const modalHeader = document.createElement('div');
    modalHeader.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #e9ecef;
    `;
    
    const modalTitle = document.createElement('h3');
    modalTitle.style.cssText = `
        margin: 0;
        color: #2c3e50;
        font-size: 1.5rem;
        font-weight: 700;
    `;
    modalTitle.textContent = questionName;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 2rem;
        color: #7f8c8d;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    closeBtn.onclick = () => document.body.removeChild(modal);
    
    const questionContent = document.createElement('div');
    questionContent.style.cssText = `
        color: #5a6c7d;
        font-size: 1.1rem;
        line-height: 1.6;
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #667eea;
    `;
    questionContent.textContent = questionText;
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeBtn);
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(questionContent);
    modal.appendChild(modalContent);
    
    // Close modal when clicking outside
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
    
    document.body.appendChild(modal);
}

// Show loading state
function showLoading(show) {
    if (show) {
        loadingSection.classList.remove('hidden');
        questionPredictorSection.classList.add('hidden');
        errorSection.classList.add('hidden');
    } else {
        loadingSection.classList.add('hidden');
    }
}

// Show question predictor section
function showQuestionPredictor() {
    questionPredictorSection.classList.remove('hidden');
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
    loadingSection.classList.add('hidden');
    questionPredictorSection.classList.add('hidden');
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

// Show random question section
function showRandomQuestionSection() {
    const randomQuestionSection = document.getElementById('randomQuestionSection');
    if (randomQuestionSection) {
        randomQuestionSection.classList.remove('hidden');
    }
}

// Open advanced question page
function openAdvancedQuestionPage(questionText, questionName, topic) {
    // Save question data to session storage
    sessionStorage.setItem('advancedQuestion', JSON.stringify({
        questionText: questionText,
        questionName: questionName,
        topic: topic,
        examType: examType,
        subject: subject
    }));
    
    // Open advanced question page
    window.open('/advanced-question.html', '_blank');
} 