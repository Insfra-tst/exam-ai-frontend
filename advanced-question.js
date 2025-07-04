// Global variables
let questionData = null;
let examType = '';
let subject = '';

// DOM elements
const loadingSection = document.getElementById('loadingSection');
const questionCard = document.getElementById('questionCard');
const questionTopic = document.getElementById('questionTopic');
const questionTitle = document.getElementById('questionTitle');
const questionText = document.getElementById('questionText');
const solveBtn = document.getElementById('solveBtn');
const answerBtn = document.getElementById('answerBtn');
const solutionContainer = document.getElementById('solutionContainer');
const solutionAnswer = document.getElementById('solutionAnswer');
const solutionSteps = document.getElementById('solutionSteps');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadQuestionData();
});

// Load question data from session storage
function loadQuestionData() {
    try {
        const savedData = sessionStorage.getItem('advancedQuestion');
        if (!savedData) {
            showError('No question data found. Please go back and select a question.');
            return;
        }
        
        questionData = JSON.parse(savedData);
        examType = questionData.examType;
        subject = questionData.subject;
        
        // Display the question
        displayQuestion();
        
        // Generate advanced solution
        generateAdvancedSolution();
        
    } catch (error) {
        console.error('Error loading question data:', error);
        showError('Error loading question data. Please try again.');
    }
}

// Display the question
function displayQuestion() {
    questionTopic.textContent = questionData.topic;
    questionTitle.textContent = questionData.questionName;
    questionText.textContent = questionData.questionText;
    
    // Determine button text based on question type
    const isMathQuestion = questionData.topic.toLowerCase().includes('math') || 
                          questionData.topic.toLowerCase().includes('calculus') ||
                          questionData.topic.toLowerCase().includes('algebra') ||
                          questionData.topic.toLowerCase().includes('geometry');
    
    if (isMathQuestion) {
        solveBtn.style.display = 'inline-flex';
        answerBtn.style.display = 'none';
    } else {
        solveBtn.style.display = 'none';
        answerBtn.style.display = 'inline-flex';
    }
    
    questionCard.classList.remove('hidden');
}

// Generate advanced solution using OpenAI
async function generateAdvancedSolution() {
    try {
        const response = await fetch('/api/generate-advanced-solution', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                questionText: questionData.questionText,
                questionName: questionData.questionName,
                topic: questionData.topic,
                examType: examType,
                subject: subject
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            displaySolution(data.solution);
        } else {
            // Use fallback solution
            displayFallbackSolution();
        }
        
    } catch (error) {
        console.error('Error generating solution:', error);
        // Use fallback solution
        displayFallbackSolution();
    }
}

// Display the solution
function displaySolution(solution) {
    solutionAnswer.textContent = solution.answer;
    
    // Format steps
    let stepsHtml = '';
    if (solution.steps && solution.steps.length > 0) {
        stepsHtml = '<ol>';
        solution.steps.forEach(step => {
            stepsHtml += `<li>${step}</li>`;
        });
        stepsHtml += '</ol>';
    } else {
        stepsHtml = '<p>' + (solution.explanation || 'Detailed explanation will be shown when you click the button.') + '</p>';
    }
    
    solutionSteps.innerHTML = stepsHtml;
    
    // Hide loading
    loadingSection.classList.add('hidden');
}

// Display fallback solution
function displayFallbackSolution() {
    const isMathQuestion = questionData.topic.toLowerCase().includes('math') || 
                          questionData.topic.toLowerCase().includes('calculus') ||
                          questionData.topic.toLowerCase().includes('algebra') ||
                          questionData.topic.toLowerCase().includes('geometry');
    
    if (isMathQuestion) {
        solutionAnswer.textContent = 'The solution will be calculated step-by-step when you click "Solve It".';
        solutionSteps.innerHTML = `
            <p>This is a mathematical problem that requires step-by-step calculation. 
            Click the "Solve It" button to see the detailed solution process.</p>
        `;
    } else {
        solutionAnswer.textContent = 'The detailed answer will be provided when you click "Answer It".';
        solutionSteps.innerHTML = `
            <p>This question requires detailed analysis and explanation. 
            Click the "Answer It" button to see the comprehensive answer.</p>
        `;
    }
    
    // Hide loading
    loadingSection.classList.add('hidden');
}

// Show solution when button is clicked
function showSolution() {
    solutionContainer.style.display = 'block';
    
    // Scroll to solution
    solutionContainer.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Show error message
function showError(message) {
    loadingSection.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
        <h3>Error</h3>
        <p>${message}</p>
        <button onclick="history.back()" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Go Back
        </button>
    `;
} 