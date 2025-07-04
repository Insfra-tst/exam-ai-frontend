// Global variables
let examType = '';
let subject = '';
let topicName = '';
let subtopicName = '';
let questionTypeName = '';
let cachedExampleQuestionsData = null;

// DOM elements
let loadingSection, errorSection, exampleQuestionsSection, exampleQuestionsTitle, exampleQuestionsSubtitle, questionsContainer, errorMessage, breadcrumb;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Example Questions page loaded');
    
    // Initialize DOM elements
    loadingSection = document.getElementById('loadingSection');
    errorSection = document.getElementById('errorSection');
    exampleQuestionsSection = document.getElementById('exampleQuestionsSection');
    exampleQuestionsTitle = document.getElementById('exampleQuestionsTitle');
    exampleQuestionsSubtitle = document.getElementById('exampleQuestionsSubtitle');
    questionsContainer = document.getElementById('questionsContainer');
    errorMessage = document.getElementById('errorMessage');
    breadcrumb = document.getElementById('breadcrumb');
    
    // Get parameters from URL first, then fallback to session storage
    const urlParams = new URLSearchParams(window.location.search);
    examType = urlParams.get('exam') || sessionStorage.getItem('examType');
    subject = urlParams.get('subject') || sessionStorage.getItem('subject');
    topicName = urlParams.get('topic') || 'General Topics';
    subtopicName = urlParams.get('subtopic') || 'Core Concepts';
    questionTypeName = urlParams.get('questionType') || 'General Questions';
    
    console.log('Parameters:', { examType, subject, topicName, subtopicName, questionTypeName });
    
    // Set default values if not available
    if (!examType) examType = 'General Exam';
    if (!subject) subject = 'General Subject';
    
    // Save to session storage
    sessionStorage.setItem('examType', examType);
    sessionStorage.setItem('subject', subject);
    
    // Update page title and subtitle
    if (exampleQuestionsTitle) {
        exampleQuestionsTitle.textContent = `Example Questions - ${questionTypeName}`;
    }
    if (exampleQuestionsSubtitle) {
        exampleQuestionsSubtitle.textContent = `Practice questions for ${questionTypeName} in ${subtopicName}`;
    }
    
    // Update breadcrumb
    if (breadcrumb) {
        const activeBreadcrumbItem = breadcrumb.querySelector('.breadcrumb-item.active');
        if (activeBreadcrumbItem) {
            activeBreadcrumbItem.innerHTML = `<i class="fas fa-question-circle"></i> ${questionTypeName}`;
        }
        breadcrumb.classList.remove('hidden');
    }
    
    // Check if we have cached data
    const cacheKey = `example_questions_${examType}_${subject}_${topicName}_${subtopicName}_${questionTypeName}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    console.log('Cache key:', cacheKey);
    console.log('Cached data exists:', !!cachedData);
    
    if (cachedData) {
        try {
            // Show loading message for cached data
            showLoadingMessage('Loading saved questions...', 'Retrieving previously generated example questions');
            cachedExampleQuestionsData = JSON.parse(cachedData);
            console.log('Parsed cached data:', cachedExampleQuestionsData);
            
            // Simulate a brief loading time for better UX
            setTimeout(() => {
                console.log('Displaying cached data...');
                displayExampleQuestions(cachedExampleQuestionsData);
                showExampleQuestions();
                showLoading(false);
                console.log('Cached data displayed successfully');
            }, 500);
        } catch (e) {
            console.error('Error parsing cached data:', e);
            generateExampleQuestions();
        }
    } else {
        // Generate example questions data
        console.log('No cached data, generating new data...');
        generateExampleQuestions();
    }
    
    // Add a safety timeout to prevent infinite loading
    setTimeout(() => {
        if (loadingSection && !loadingSection.classList.contains('hidden')) {
            console.log('Safety timeout triggered - forcing fallback data');
            const fallbackData = generateFallbackExampleQuestions();
            displayExampleQuestions(fallbackData);
            showLoading(false);
        }
    }, 10000); // 10 second timeout
});

// Show loading message with custom text
function showLoadingMessage(title, subtitle) {
    const loadingTitle = loadingSection.querySelector('h3');
    const loadingSubtitle = loadingSection.querySelector('p');
    
    if (loadingTitle) loadingTitle.textContent = title;
    if (loadingSubtitle) loadingSubtitle.textContent = subtitle;
    
    showLoading(true);
}

// Generate example questions data using OpenAI
async function generateExampleQuestions() {
    console.log('generateExampleQuestions started');
    showLoadingMessage('Generating example questions...', 'Creating exam-style questions with step-by-step solutions');
    hideError();
    
    try {
        const response = await fetch('/api/generate-example-questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                examType: examType,
                subject: subject,
                topic: topicName,
                subtopic: subtopicName,
                questionType: questionTypeName
            })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success && data.questions && Array.isArray(data.questions)) {
            console.log('Valid response received, caching data...');
            // Cache the data
            const cacheKey = `example_questions_${examType}_${subject}_${topicName}_${subtopicName}_${questionTypeName}`;
            sessionStorage.setItem(cacheKey, JSON.stringify(data.questions));
            cachedExampleQuestionsData = data.questions;
            
            console.log('Calling displayExampleQuestions...');
            displayExampleQuestions(data.questions);
            console.log('displayExampleQuestions completed');
        } else {
            console.error('Invalid response structure:', data);
            throw new Error(data.error || 'Invalid response structure');
        }
        
    } catch (error) {
        console.error('Error generating example questions:', error);
        console.log('Using fallback data...');
        // Use fallback data
        const fallbackData = generateFallbackExampleQuestions();
        console.log('Fallback data generated:', fallbackData);
        displayExampleQuestions(fallbackData);
    } finally {
        console.log('Setting loading to false...');
        showLoading(false);
        console.log('Loading set to false');
    }
}

// Generate fallback example questions data
function generateFallbackExampleQuestions() {
    // Set default values if not available
    if (!examType) examType = 'General Exam';
    if (!subject) subject = 'General Subject';
    if (!topicName) topicName = 'General Topics';
    if (!subtopicName) subtopicName = 'Core Concepts';
    if (!questionTypeName) questionTypeName = 'General Questions';
    
    const fallbackQuestions = [
        {
            questionNumber: 1,
            questionText: "Solve the equation: 2x + 5 = 13",
            solution: [
                "Step 1: Subtract 5 from both sides",
                "2x + 5 - 5 = 13 - 5",
                "2x = 8",
                "Step 2: Divide both sides by 2",
                "2x ÷ 2 = 8 ÷ 2",
                "x = 4",
                "Therefore, x = 4"
            ],
            finalAnswer: "x = 4"
        },
        {
            questionNumber: 2,
            questionText: "Find the derivative of f(x) = x² + 3x + 1",
            solution: [
                "Step 1: Apply the power rule to x²",
                "d/dx(x²) = 2x",
                "Step 2: Apply the power rule to 3x",
                "d/dx(3x) = 3",
                "Step 3: The derivative of a constant is 0",
                "d/dx(1) = 0",
                "Step 4: Combine all terms",
                "f'(x) = 2x + 3 + 0",
                "f'(x) = 2x + 3"
            ],
            finalAnswer: "f'(x) = 2x + 3"
        },
        {
            questionNumber: 3,
            questionText: "Calculate the area of a circle with radius 5 units",
            solution: [
                "Step 1: Recall the formula for area of a circle",
                "A = πr²",
                "Step 2: Substitute the given radius",
                "A = π(5)²",
                "Step 3: Calculate the square",
                "A = π(25)",
                "Step 4: Multiply by π",
                "A = 25π square units"
            ],
            finalAnswer: "25π square units"
        }
    ];
    
    // Cache fallback data
    const cacheKey = `example_questions_${examType}_${subject}_${topicName}_${subtopicName}_${questionTypeName}`;
    sessionStorage.setItem(cacheKey, JSON.stringify(fallbackQuestions));
    cachedExampleQuestionsData = fallbackQuestions;
    
    console.log('Generated fallback data:', fallbackQuestions);
    
    return fallbackQuestions;
}

// Display example questions
function displayExampleQuestions(questions) {
    console.log('displayExampleQuestions called with:', questions);
    
    if (!questionsContainer) {
        console.error('questionsContainer element not found!');
        return;
    }
    
    questionsContainer.innerHTML = '';
    console.log('Cleared questions container');
    
    questions.forEach((question, index) => {
        console.log(`Creating question ${index + 1}:`, question);
        
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        
        const questionNumber = document.createElement('div');
        questionNumber.className = 'question-number';
        questionNumber.textContent = `Question ${question.questionNumber || index + 1}`;
        
        const questionText = document.createElement('div');
        questionText.className = 'question-text';
        questionText.textContent = question.questionText;
        
        const questionActions = document.createElement('div');
        questionActions.className = 'question-actions';
        
        const solveBtn = document.createElement('button');
        solveBtn.className = 'solve-btn';
        solveBtn.innerHTML = '<i class="fas fa-calculator"></i> Solve Step by Step';
        solveBtn.onclick = () => toggleSolution(questionCard, question);
        
        const answerBtn = document.createElement('button');
        answerBtn.className = 'answer-btn';
        answerBtn.innerHTML = '<i class="fas fa-eye"></i> Show Answer';
        answerBtn.onclick = () => showAnswer(questionCard, question);
        
        questionActions.appendChild(solveBtn);
        questionActions.appendChild(answerBtn);
        
        const solutionSection = document.createElement('div');
        solutionSection.className = 'solution-section';
        solutionSection.id = `solution-${index}`;
        
        const solutionTitle = document.createElement('div');
        solutionTitle.className = 'solution-title';
        solutionTitle.innerHTML = '<i class="fas fa-lightbulb"></i> Step-by-Step Solution';
        
        const solutionContent = document.createElement('div');
        solutionContent.id = `solution-content-${index}`;
        
        solutionSection.appendChild(solutionTitle);
        solutionSection.appendChild(solutionContent);
        
        questionCard.appendChild(questionNumber);
        questionCard.appendChild(questionText);
        questionCard.appendChild(questionActions);
        questionCard.appendChild(solutionSection);
        
        questionsContainer.appendChild(questionCard);
    });
    
    console.log(`Created ${questions.length} question cards`);
    showExampleQuestions();
}

// Toggle solution visibility
function toggleSolution(questionCard, question) {
    const solutionSection = questionCard.querySelector('.solution-section');
    const solutionContent = questionCard.querySelector('.solution-content-0');
    
    if (solutionSection.style.display === 'block') {
        solutionSection.style.display = 'none';
    } else {
        solutionSection.style.display = 'block';
        
        // Generate solution content if not already present
        if (solutionContent.innerHTML === '') {
            generateSolutionContent(solutionContent, question);
        }
    }
}

// Generate solution content
function generateSolutionContent(solutionContent, question) {
    if (question.solution && Array.isArray(question.solution)) {
        question.solution.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'step';
            
            const stepNumber = document.createElement('span');
            stepNumber.className = 'step-number';
            stepNumber.textContent = index + 1;
            
            const stepText = document.createElement('span');
            stepText.className = 'step-text';
            stepText.textContent = step;
            
            stepDiv.appendChild(stepNumber);
            stepDiv.appendChild(stepText);
            solutionContent.appendChild(stepDiv);
        });
        
        if (question.finalAnswer) {
            const finalAnswer = document.createElement('div');
            finalAnswer.className = 'final-answer';
            finalAnswer.textContent = `Final Answer: ${question.finalAnswer}`;
            solutionContent.appendChild(finalAnswer);
        }
    }
}

// Show answer only
function showAnswer(questionCard, question) {
    const solutionSection = questionCard.querySelector('.solution-section');
    const solutionContent = questionCard.querySelector('.solution-content-0');
    
    solutionSection.style.display = 'block';
    
    // Clear existing content and show only final answer
    solutionContent.innerHTML = '';
    
    if (question.finalAnswer) {
        const finalAnswer = document.createElement('div');
        finalAnswer.className = 'final-answer';
        finalAnswer.textContent = `Answer: ${question.finalAnswer}`;
        solutionContent.appendChild(finalAnswer);
    }
}

// Show loading state
function showLoading(show) {
    console.log('showLoading called with:', show);
    
    if (!loadingSection) {
        console.error('loadingSection element not found!');
        return;
    }
    
    if (!exampleQuestionsSection) {
        console.error('exampleQuestionsSection element not found!');
        return;
    }
    
    if (show) {
        loadingSection.classList.remove('hidden');
        exampleQuestionsSection.classList.add('hidden');
        errorSection.classList.add('hidden');
        console.log('Loading section shown, example questions section hidden');
    } else {
        loadingSection.classList.add('hidden');
        console.log('Loading section hidden');
    }
}

// Show example questions section
function showExampleQuestions() {
    console.log('showExampleQuestions called');
    
    if (!exampleQuestionsSection) {
        console.error('exampleQuestionsSection element not found!');
        return;
    }
    
    exampleQuestionsSection.classList.remove('hidden');
    console.log('Example questions section shown');
}

// Show error
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
    if (exampleQuestionsSection) {
        exampleQuestionsSection.classList.add('hidden');
    }
}

// Hide error
function hideError() {
    if (errorSection) {
        errorSection.classList.add('hidden');
    }
} 