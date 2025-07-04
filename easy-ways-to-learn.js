// Global variables
let examType = '';
let subject = '';
let topicName = '';
let subtopicName = '';
let questionTypeName = '';
let cachedLearningData = null;

// DOM elements
let loadingSection, errorSection, learningSection, learningTitle, learningSubtitle, learningContent, errorMessage, breadcrumb;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Easy Ways to Learn page loaded');
    
    // Initialize DOM elements
    loadingSection = document.getElementById('loadingSection');
    errorSection = document.getElementById('errorSection');
    learningSection = document.getElementById('learningSection');
    learningTitle = document.getElementById('learningTitle');
    learningSubtitle = document.getElementById('learningSubtitle');
    learningContent = document.getElementById('learningContent');
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
    if (learningTitle) {
        learningTitle.textContent = `Easy Ways to Learn - ${questionTypeName}`;
    }
    if (learningSubtitle) {
        learningSubtitle.textContent = `Creative tips and tricks for mastering ${questionTypeName}`;
    }
    
    // Update breadcrumb
    if (breadcrumb) {
        const activeBreadcrumbItem = breadcrumb.querySelector('.breadcrumb-item.active');
        if (activeBreadcrumbItem) {
            activeBreadcrumbItem.innerHTML = `<i class="fas fa-lightbulb"></i> ${questionTypeName}`;
        }
        breadcrumb.classList.remove('hidden');
    }
    
    // Check if we have cached data
    const cacheKey = `learning_tips_${examType}_${subject}_${topicName}_${subtopicName}_${questionTypeName}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    console.log('Cache key:', cacheKey);
    console.log('Cached data exists:', !!cachedData);
    
    if (cachedData) {
        try {
            // Show loading message for cached data
            showLoadingMessage('Loading saved tips...', 'Retrieving previously generated learning strategies');
            cachedLearningData = JSON.parse(cachedData);
            console.log('Parsed cached data:', cachedLearningData);
            
            // Simulate a brief loading time for better UX
            setTimeout(() => {
                console.log('Displaying cached data...');
                displayLearningTips(cachedLearningData);
                showLearning();
                showLoading(false);
                console.log('Cached data displayed successfully');
            }, 500);
        } catch (e) {
            console.error('Error parsing cached data:', e);
            generateLearningTips();
        }
    } else {
        // Generate learning tips data
        console.log('No cached data, generating new data...');
        generateLearningTips();
    }
    
    // Add a safety timeout to prevent infinite loading
    setTimeout(() => {
        if (loadingSection && !loadingSection.classList.contains('hidden')) {
            console.log('Safety timeout triggered - forcing fallback data');
            const fallbackData = generateFallbackLearningTips();
            displayLearningTips(fallbackData);
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

// Generate learning tips data using OpenAI
async function generateLearningTips() {
    console.log('generateLearningTips started');
    showLoadingMessage('Generating learning tips...', 'Creating creative strategies and memory techniques');
    hideError();
    
    try {
        const response = await fetch('/api/generate-learning-tips', {
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
        
        if (data.success && data.tips && Array.isArray(data.tips)) {
            console.log('Valid response received, caching data...');
            // Cache the data
            const cacheKey = `learning_tips_${examType}_${subject}_${topicName}_${subtopicName}_${questionTypeName}`;
            sessionStorage.setItem(cacheKey, JSON.stringify(data.tips));
            cachedLearningData = data.tips;
            
            console.log('Calling displayLearningTips...');
            displayLearningTips(data.tips);
            console.log('displayLearningTips completed');
        } else {
            console.error('Invalid response structure:', data);
            throw new Error(data.error || 'Invalid response structure');
        }
        
    } catch (error) {
        console.error('Error generating learning tips:', error);
        console.log('Using fallback data...');
        // Use fallback data
        const fallbackData = generateFallbackLearningTips();
        console.log('Fallback data generated:', fallbackData);
        displayLearningTips(fallbackData);
    } finally {
        console.log('Setting loading to false...');
        showLoading(false);
        console.log('Loading set to false');
    }
}

// Generate fallback learning tips data
function generateFallbackLearningTips() {
    // Set default values if not available
    if (!examType) examType = 'General Exam';
    if (!subject) subject = 'General Subject';
    if (!topicName) topicName = 'General Topics';
    if (!subtopicName) subtopicName = 'Core Concepts';
    if (!questionTypeName) questionTypeName = 'General Questions';
    
    const fallbackTips = [
        {
            tipNumber: 1,
            title: "Visual Learning Technique",
            content: "Create mind maps and diagrams to visualize complex concepts. Use different colors for different topics and draw connections between related ideas. This helps your brain process information more effectively and improves memory retention.",
            icon: "🎨"
        },
        {
            tipNumber: 2,
            title: "Active Recall Method",
            content: "Instead of just reading, actively test yourself on the material. Cover the answers and try to recall them from memory. This strengthens neural pathways and makes information stick better than passive reading.",
            icon: "🧠"
        },
        {
            tipNumber: 3,
            title: "Spaced Repetition",
            content: "Review the same material at increasing intervals - first after 1 day, then 3 days, then a week, then a month. This technique leverages the forgetting curve and helps you remember information long-term.",
            icon: "⏰"
        },
        {
            tipNumber: 4,
            title: "Teach Someone Else",
            content: "The best way to learn something is to teach it to someone else. Explain concepts in your own words, create examples, and answer questions. This forces you to understand the material deeply.",
            icon: "👥"
        },
        {
            tipNumber: 5,
            title: "Practice with Real Examples",
            content: "Don't just memorize formulas or rules - practice applying them to real problems. The more you practice, the more comfortable you become with the concepts and the better you'll perform under exam pressure.",
            icon: "📝"
        }
    ];
    
    // Cache fallback data
    const cacheKey = `learning_tips_${examType}_${subject}_${topicName}_${subtopicName}_${questionTypeName}`;
    sessionStorage.setItem(cacheKey, JSON.stringify(fallbackTips));
    cachedLearningData = fallbackTips;
    
    console.log('Generated fallback data:', fallbackTips);
    
    return fallbackTips;
}

// Display learning tips
function displayLearningTips(tips) {
    console.log('displayLearningTips called with:', tips);
    
    if (!learningContent) {
        console.error('learningContent element not found!');
        return;
    }
    
    learningContent.innerHTML = '';
    console.log('Cleared learning content');
    
    // Create strategy section
    const strategySection = document.createElement('div');
    strategySection.className = 'strategy-section';
    
    const strategyTitle = document.createElement('div');
    strategyTitle.className = 'strategy-title';
    strategyTitle.innerHTML = '<i class="fas fa-chess"></i> Strategic Learning Approach';
    
    const strategyList = document.createElement('ul');
    strategyList.className = 'strategy-list';
    
    const strategies = [
        "Break down complex topics into smaller, manageable chunks",
        "Use the Pomodoro Technique: 25 minutes of focused study, then 5-minute breaks",
        "Create a study schedule and stick to it consistently",
        "Use multiple learning resources (books, videos, practice tests)",
        "Join study groups to discuss and clarify concepts"
    ];
    
    strategies.forEach(strategy => {
        const li = document.createElement('li');
        li.textContent = strategy;
        strategyList.appendChild(li);
    });
    
    strategySection.appendChild(strategyTitle);
    strategySection.appendChild(strategyList);
    learningContent.appendChild(strategySection);
    
    // Create mnemonic section
    const mnemonicSection = document.createElement('div');
    mnemonicSection.className = 'mnemonic-section';
    
    const mnemonicTitle = document.createElement('div');
    mnemonicTitle.className = 'mnemonic-title';
    mnemonicTitle.innerHTML = '<i class="fas fa-brain"></i> Memory Techniques';
    
    const mnemonicContent = document.createElement('div');
    mnemonicContent.className = 'mnemonic-content';
    mnemonicContent.innerHTML = `
        <strong>Acronym Method:</strong> Create memorable acronyms for lists and sequences.<br><br>
        <strong>Rhyme Method:</strong> Turn important information into rhymes or songs.<br><br>
        <strong>Story Method:</strong> Create a story that connects all the concepts you need to remember.<br><br>
        <strong>Loci Method:</strong> Associate information with familiar locations in your mind.
    `;
    
    mnemonicSection.appendChild(mnemonicTitle);
    mnemonicSection.appendChild(mnemonicContent);
    learningContent.appendChild(mnemonicSection);
    
    // Create individual tip cards
    tips.forEach((tip, index) => {
        console.log(`Creating tip ${index + 1}:`, tip);
        
        const tipCard = document.createElement('div');
        tipCard.className = 'tip-card';
        
        const tipNumber = document.createElement('div');
        tipNumber.className = 'tip-number';
        tipNumber.textContent = `Tip ${tip.tipNumber || index + 1}`;
        
        const tipTitle = document.createElement('div');
        tipTitle.className = 'tip-title';
        tipTitle.innerHTML = `<span class="tip-icon">${tip.icon || '💡'}</span> ${tip.title}`;
        
        const tipContent = document.createElement('div');
        tipContent.className = 'tip-content';
        tipContent.textContent = tip.content;
        
        tipCard.appendChild(tipNumber);
        tipCard.appendChild(tipTitle);
        tipCard.appendChild(tipContent);
        
        learningContent.appendChild(tipCard);
    });
    
    console.log(`Created ${tips.length} tip cards`);
    showLearning();
}

// Show loading state
function showLoading(show) {
    console.log('showLoading called with:', show);
    
    if (!loadingSection) {
        console.error('loadingSection element not found!');
        return;
    }
    
    if (!learningSection) {
        console.error('learningSection element not found!');
        return;
    }
    
    if (show) {
        loadingSection.classList.remove('hidden');
        learningSection.classList.add('hidden');
        errorSection.classList.add('hidden');
        console.log('Loading section shown, learning section hidden');
    } else {
        loadingSection.classList.add('hidden');
        console.log('Loading section hidden');
    }
}

// Show learning section
function showLearning() {
    console.log('showLearning called');
    
    if (!learningSection) {
        console.error('learningSection element not found!');
        return;
    }
    
    learningSection.classList.remove('hidden');
    console.log('Learning section shown');
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
    if (learningSection) {
        learningSection.classList.add('hidden');
    }
}

// Hide error
function hideError() {
    if (errorSection) {
        errorSection.classList.add('hidden');
    }
} 