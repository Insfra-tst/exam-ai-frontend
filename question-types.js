// Global variables
let examType = '';
let subject = '';
let topicName = '';
let subtopicName = '';
let cachedQuestionTypesData = null;

// DOM elements
const loadingSection = document.getElementById('loadingSection');
const errorSection = document.getElementById('errorSection');
const questionTypesSection = document.getElementById('questionTypesSection');
const questionTypesTitle = document.getElementById('questionTypesTitle');
const questionTypesSubtitle = document.getElementById('questionTypesSubtitle');
const questionTypesTableBody = document.getElementById('questionTypesTableBody');
const errorMessage = document.getElementById('errorMessage');
const breadcrumb = document.getElementById('breadcrumb');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Question Types page loaded');
    
    // Get parameters from URL first, then fallback to session storage
    const urlParams = new URLSearchParams(window.location.search);
    examType = urlParams.get('exam') || sessionStorage.getItem('examType');
    subject = urlParams.get('subject') || sessionStorage.getItem('subject');
    topicName = urlParams.get('topic') || 'General Topics';
    subtopicName = urlParams.get('subtopic') || 'Core Concepts';
    
    console.log('Parameters:', { examType, subject, topicName, subtopicName });
    
    // Always ensure we have some data to display
    if (!examType) examType = 'General Exam';
    if (!subject) subject = 'General Subject';
    if (!topicName) topicName = 'General Topics';
    if (!subtopicName) subtopicName = 'Core Concepts';
    
    // Save to session storage if not already there
    if (!sessionStorage.getItem('examType')) {
        sessionStorage.setItem('examType', examType);
    }
    if (!sessionStorage.getItem('subject')) {
        sessionStorage.setItem('subject', subject);
    }
    
    // Update page title and subtitle
    questionTypesTitle.textContent = `${subtopicName} - Question Types Analysis`;
    questionTypesSubtitle.textContent = `Detailed frequency analysis of question types for ${examType} - ${subject}`;
    
    // Update breadcrumb
    breadcrumb.classList.remove('hidden');
    
    // Check if we have cached data
    const cacheKey = `question_types_${examType}_${subject}_${topicName}_${subtopicName}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
        try {
            // Show loading message for cached data
            showLoadingMessage('Loading saved data...', 'Retrieving previously generated question types analysis');
            cachedQuestionTypesData = JSON.parse(cachedData);
            
            // Simulate a brief loading time for better UX
            setTimeout(() => {
                displayQuestionTypesData(cachedQuestionTypesData);
                showQuestionTypes();
                showLoading(false);
            }, 500);
        } catch (e) {
            console.error('Error parsing cached data:', e);
            generateQuestionTypesData();
        }
    } else {
        // Generate question types data
        generateQuestionTypesData();
    }
});

// Show loading message with custom text
function showLoadingMessage(title, subtitle) {
    const loadingTitle = loadingSection.querySelector('h3');
    const loadingSubtitle = loadingSection.querySelector('p');
    
    if (loadingTitle) loadingTitle.textContent = title;
    if (loadingSubtitle) loadingSubtitle.textContent = subtitle;
    
    showLoading(true);
}

// Generate question types data using OpenAI
async function generateQuestionTypesData() {
    console.log('Starting to generate question types data...');
    showLoading(true);
    hideError();
    
    try {
        console.log('Making API request with data:', {
            examType: examType,
            subject: subject,
            topic: topicName,
            subtopic: subtopicName
        });
        
        const response = await fetch('/api/generate-question-types', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                examType: examType,
                subject: subject,
                topic: topicName,
                subtopic: subtopicName
            })
        });
        
        console.log('API response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response data:', data);
        
        if (data.success) {
            console.log('API call successful, caching data...');
            // Cache the data
            const cacheKey = `question_types_${examType}_${subject}_${topicName}_${subtopicName}`;
            sessionStorage.setItem(cacheKey, JSON.stringify(data.questionTypes));
            cachedQuestionTypesData = data.questionTypes;
            
            console.log('Displaying question types data...');
            displayQuestionTypesData(data.questionTypes);
        } else {
            throw new Error(data.error || 'Failed to generate question types data');
        }
        
    } catch (error) {
        console.error('Error generating question types data:', error);
        console.log('Using fallback data...');
        // Use fallback data
        const fallbackData = generateFallbackQuestionTypesData();
        displayQuestionTypesData(fallbackData);
    } finally {
        console.log('Hiding loading...');
        showLoading(false);
    }
}

// Generate fallback question types data
function generateFallbackQuestionTypesData() {
    // Set default values if not available
    const fallbackExamType = examType || 'General Exam';
    const fallbackSubject = subject || 'General Subject';
    const fallbackTopicName = topicName || 'General Topics';
    const fallbackSubtopicName = subtopicName || 'Core Concepts';
    
    const fallbackQuestionTypes = [
        {
            name: "Multiple Choice Questions",
            percentage: 40,
            description: "Standard multiple choice questions with 4 options"
        },
        {
            name: "Short Answer Questions",
            percentage: 25,
            description: "Brief answer questions requiring concise responses"
        },
        {
            name: "Problem Solving",
            percentage: 20,
            description: "Step-by-step problem solving questions"
        },
        {
            name: "Essay Questions",
            percentage: 10,
            description: "Long-form questions requiring detailed explanations"
        },
        {
            name: "True/False Questions",
            percentage: 5,
            description: "Binary choice questions with true or false options"
        }
    ];
    
    // Cache fallback data
    const cacheKey = `question_types_${fallbackExamType}_${fallbackSubject}_${fallbackTopicName}_${fallbackSubtopicName}`;
    sessionStorage.setItem(cacheKey, JSON.stringify(fallbackQuestionTypes));
    cachedQuestionTypesData = fallbackQuestionTypes;
    
    console.log('Generated fallback question types data:', fallbackQuestionTypes);
    
    return fallbackQuestionTypes;
}

// Display question types data in table
function displayQuestionTypesData(questionTypes) {
    console.log('Displaying question types data:', questionTypes);
    console.log('Question types table body element:', questionTypesTableBody);
    
    if (!questionTypesTableBody) {
        console.error('Question types table body element not found!');
        return;
    }
    
    questionTypesTableBody.innerHTML = '';
    
    questionTypes.forEach((questionType, index) => {
        console.log('Creating row for question type:', questionType);
        const row = document.createElement('tr');
        
        // Create rank badge
        const rankCell = document.createElement('td');
        const rankBadge = document.createElement('div');
        rankBadge.className = 'rank-badge';
        rankBadge.textContent = index + 1;
        rankCell.appendChild(rankBadge);
        
        // Create question type name cell
        const questionTypeCell = document.createElement('td');
        const questionTypeName = document.createElement('div');
        questionTypeName.className = 'question-type-name';
        questionTypeName.textContent = questionType.name;
        questionTypeCell.appendChild(questionTypeName);
        
        // Create percentage cell
        const percentageCell = document.createElement('td');
        const percentageDisplay = document.createElement('div');
        percentageDisplay.className = 'percentage-display';
        
        const percentageBar = document.createElement('div');
        percentageBar.className = 'percentage-bar';
        
        const percentageFill = document.createElement('div');
        percentageFill.className = 'percentage-fill';
        percentageFill.style.width = `${questionType.percentage}%`;
        
        const percentageText = document.createElement('div');
        percentageText.className = 'percentage-text';
        percentageText.textContent = `${questionType.percentage}%`;
        
        percentageBar.appendChild(percentageFill);
        percentageDisplay.appendChild(percentageBar);
        percentageDisplay.appendChild(percentageText);
        percentageCell.appendChild(percentageDisplay);
        
        // Create action buttons cell
        const actionsCell = document.createElement('td');
        const actionButtons = document.createElement('div');
        actionButtons.className = 'action-buttons';
        
        // Example Questions button
        const exampleBtn = document.createElement('button');
        exampleBtn.className = 'action-btn';
        exampleBtn.innerHTML = '🔁 Example Questions';
        exampleBtn.onclick = () => showExampleQuestions(questionType.name);
        actionButtons.appendChild(exampleBtn);
        
        // Short Note button
        const shortNoteBtn = document.createElement('button');
        shortNoteBtn.className = 'action-btn';
        shortNoteBtn.innerHTML = '✍️ Short Notes';
        shortNoteBtn.onclick = () => showShortNote(questionType.name);
        actionButtons.appendChild(shortNoteBtn);
        
        // Easy Ways to Learn button
        const learnBtn = document.createElement('button');
        learnBtn.className = 'action-btn';
        learnBtn.innerHTML = '💡 Easy Ways to Learn';
        learnBtn.onclick = () => showEasyWaysToLearn(questionType.name);
        actionButtons.appendChild(learnBtn);
        
        actionsCell.appendChild(actionButtons);
        
        // Add cells to row
        row.appendChild(rankCell);
        row.appendChild(questionTypeCell);
        row.appendChild(percentageCell);
        row.appendChild(actionsCell);
        
        // Add row to table
        questionTypesTableBody.appendChild(row);
    });
    
    console.log('Finished creating table rows, showing question types section...');
    showQuestionTypes();
}

// Show example questions
function showExampleQuestions(questionTypeName) {
    console.log('Opening example questions for:', questionTypeName);
    
    // Create URL with parameters
    const params = new URLSearchParams({
        exam: examType,
        subject: subject,
        topic: topicName,
        subtopic: subtopicName,
        questionType: questionTypeName
    });
    
    // Open in new tab
    window.open(`/example-questions.html?${params.toString()}`, '_blank');
}

// Show short note
function showShortNote(questionTypeName) {
    console.log('Opening short notes for:', questionTypeName);
    
    // Create URL with parameters
    const params = new URLSearchParams({
        exam: examType,
        subject: subject,
        topic: topicName,
        subtopic: subtopicName,
        questionType: questionTypeName
    });
    
    // Open in new tab
    window.open(`/short-notes.html?${params.toString()}`, '_blank');
}

// Show easy ways to learn
function showEasyWaysToLearn(questionTypeName) {
    console.log('Opening easy ways to learn for:', questionTypeName);
    
    // Create URL with parameters
    const params = new URLSearchParams({
        exam: examType,
        subject: subject,
        topic: topicName,
        subtopic: subtopicName,
        questionType: questionTypeName
    });
    
    // Open in new tab
    window.open(`/easy-ways-to-learn.html?${params.toString()}`, '_blank');
}

// Show loading state
function showLoading(show) {
    console.log('showLoading called with:', show);
    console.log('Loading section element:', loadingSection);
    console.log('Question types section element:', questionTypesSection);
    console.log('Error section element:', errorSection);
    
    if (show) {
        loadingSection.classList.remove('hidden');
        questionTypesSection.classList.add('hidden');
        errorSection.classList.add('hidden');
    } else {
        loadingSection.classList.add('hidden');
    }
}

// Show question types section
function showQuestionTypes() {
    console.log('showQuestionTypes called');
    console.log('Question types section element:', questionTypesSection);
    if (questionTypesSection) {
        questionTypesSection.classList.remove('hidden');
        console.log('Question types section should now be visible');
    } else {
        console.error('Question types section element not found!');
    }
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
    loadingSection.classList.add('hidden');
    questionTypesSection.classList.add('hidden');
}

// Hide error
function hideError() {
    errorSection.classList.add('hidden');
}

// Go back to topic analysis
function goBack() {
    const params = new URLSearchParams({
        exam: examType,
        subject: subject,
        topic: topicName
    });
    window.location.href = `/topic-analysis.html?${params.toString()}`;
} 