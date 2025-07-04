// Global variables
let examType = '';
let subject = '';
let topicName = '';
let subtopicName = '';
let questionTypeName = '';
let cachedNotesData = null;

// DOM elements
let loadingSection, errorSection, notesSection, notesTitle, notesSubtitle, notesContent, errorMessage, breadcrumb;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Short Notes page loaded');
    
    // Initialize DOM elements
    loadingSection = document.getElementById('loadingSection');
    errorSection = document.getElementById('errorSection');
    notesSection = document.getElementById('notesSection');
    notesTitle = document.getElementById('notesTitle');
    notesSubtitle = document.getElementById('notesSubtitle');
    notesContent = document.getElementById('notesContent');
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
    if (notesTitle) {
        notesTitle.textContent = `Short Notes - ${questionTypeName}`;
    }
    if (notesSubtitle) {
        notesSubtitle.textContent = `Quick reference guide for ${questionTypeName}`;
    }
    
    // Update breadcrumb
    if (breadcrumb) {
        const activeBreadcrumbItem = breadcrumb.querySelector('.breadcrumb-item.active');
        if (activeBreadcrumbItem) {
            activeBreadcrumbItem.innerHTML = `<i class="fas fa-sticky-note"></i> ${questionTypeName}`;
        }
        breadcrumb.classList.remove('hidden');
    }
    
    // Check if we have cached data
    const cacheKey = `short_notes_${examType}_${subject}_${topicName}_${subtopicName}_${questionTypeName}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    console.log('Cache key:', cacheKey);
    console.log('Cached data exists:', !!cachedData);
    
    if (cachedData) {
        try {
            // Show loading message for cached data
            showLoadingMessage('Loading saved notes...', 'Retrieving previously generated short notes');
            cachedNotesData = JSON.parse(cachedData);
            console.log('Parsed cached data:', cachedNotesData);
            
            // Simulate a brief loading time for better UX
            setTimeout(() => {
                console.log('Displaying cached data...');
                displayShortNotes(cachedNotesData);
                showNotes();
                showLoading(false);
                console.log('Cached data displayed successfully');
            }, 500);
        } catch (e) {
            console.error('Error parsing cached data:', e);
            generateShortNotes();
        }
    } else {
        // Generate short notes data
        console.log('No cached data, generating new data...');
        generateShortNotes();
    }
    
    // Add a safety timeout to prevent infinite loading
    setTimeout(() => {
        if (loadingSection && !loadingSection.classList.contains('hidden')) {
            console.log('Safety timeout triggered - forcing fallback data');
            const fallbackData = generateFallbackShortNotes();
            displayShortNotes(fallbackData);
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

// Generate short notes data using OpenAI
async function generateShortNotes() {
    console.log('generateShortNotes started');
    showLoadingMessage('Generating short notes...', 'Creating comprehensive quick reference notes');
    hideError();
    
    try {
        const response = await fetch('/api/generate-short-notes', {
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
        
        if (data.success && data.notes && Array.isArray(data.notes)) {
            console.log('Valid response received, caching data...');
            // Cache the data
            const cacheKey = `short_notes_${examType}_${subject}_${topicName}_${subtopicName}_${questionTypeName}`;
            sessionStorage.setItem(cacheKey, JSON.stringify(data.notes));
            cachedNotesData = data.notes;
            
            console.log('Calling displayShortNotes...');
            displayShortNotes(data.notes);
            console.log('displayShortNotes completed');
        } else {
            console.error('Invalid response structure:', data);
            throw new Error(data.error || 'Invalid response structure');
        }
        
    } catch (error) {
        console.error('Error generating short notes:', error);
        console.log('Using fallback data...');
        // Use fallback data
        const fallbackData = generateFallbackShortNotes();
        console.log('Fallback data generated:', fallbackData);
        displayShortNotes(fallbackData);
    } finally {
        console.log('Setting loading to false...');
        showLoading(false);
        console.log('Loading set to false');
    }
}

// Generate fallback short notes data
function generateFallbackShortNotes() {
    // Set default values if not available
    if (!examType) examType = 'General Exam';
    if (!subject) subject = 'General Subject';
    if (!topicName) topicName = 'General Topics';
    if (!subtopicName) subtopicName = 'Core Concepts';
    if (!questionTypeName) questionTypeName = 'General Questions';
    
    const fallbackNotes = [
        {
            noteNumber: 1,
            title: "Core Concepts",
            content: "Understand the fundamental principles and definitions. Focus on the basic building blocks that form the foundation of this topic. Master these before moving to advanced applications.",
            icon: "🎯"
        },
        {
            noteNumber: 2,
            title: "Key Formulas",
            content: "Memorize essential formulas and equations. Practice applying them to different scenarios. Create your own examples to reinforce understanding.",
            icon: "📐"
        },
        {
            noteNumber: 3,
            title: "Common Mistakes",
            content: "Be aware of typical errors students make. Pay attention to units, signs, and order of operations. Double-check your work to avoid careless mistakes.",
            icon: "⚠️"
        },
        {
            noteNumber: 4,
            title: "Problem-Solving Steps",
            content: "Follow a systematic approach: read carefully, identify given information, choose appropriate method, solve step by step, verify your answer.",
            icon: "🔍"
        },
        {
            noteNumber: 5,
            title: "Important Definitions",
            content: "Learn precise definitions and terminology. Understanding the language of the subject is crucial for both comprehension and communication.",
            icon: "📖"
        },
        {
            noteNumber: 6,
            title: "Practice Strategies",
            content: "Start with simple problems and gradually increase difficulty. Focus on quality over quantity. Review mistakes to learn from them.",
            icon: "🎯"
        },
        {
            noteNumber: 7,
            title: "Time Management",
            content: "Allocate time wisely during exams. Don't spend too long on any single question. Mark difficult questions to return to later.",
            icon: "⏰"
        },
        {
            noteNumber: 8,
            title: "Visual Aids",
            content: "Use diagrams, graphs, and charts to understand concepts. Drawing helps visualize problems and can reveal solutions.",
            icon: "📊"
        },
        {
            noteNumber: 9,
            title: "Real-World Applications",
            content: "Connect theoretical concepts to practical situations. This helps with understanding and retention of information.",
            icon: "🌍"
        },
        {
            noteNumber: 10,
            title: "Review Techniques",
            content: "Regular review is essential for long-term retention. Use spaced repetition and active recall methods for effective studying.",
            icon: "🔄"
        }
    ];
    
    // Cache fallback data
    const cacheKey = `short_notes_${examType}_${subject}_${topicName}_${subtopicName}_${questionTypeName}`;
    sessionStorage.setItem(cacheKey, JSON.stringify(fallbackNotes));
    cachedNotesData = fallbackNotes;
    
    console.log('Generated fallback data:', fallbackNotes);
    
    return fallbackNotes;
}

// Display short notes
function displayShortNotes(notes) {
    console.log('displayShortNotes called with:', notes);
    
    if (!notesContent) {
        console.error('notesContent element not found!');
        return;
    }
    
    notesContent.innerHTML = '';
    console.log('Cleared notes content');
    
    // Create key points section
    const keyPointsSection = document.createElement('div');
    keyPointsSection.className = 'key-points';
    
    const keyPointsTitle = document.createElement('div');
    keyPointsTitle.className = 'key-points-title';
    keyPointsTitle.innerHTML = '<i class="fas fa-star"></i> Key Points to Remember';
    
    const keyPointsList = document.createElement('ul');
    keyPointsList.className = 'key-points-list';
    
    const keyPoints = [
        "Always read the question carefully and identify what is being asked",
        "Show your work step by step for partial credit",
        "Check your units and make sure they make sense",
        "Use estimation to verify if your answer is reasonable",
        "Practice regularly to build confidence and speed"
    ];
    
    keyPoints.forEach(point => {
        const li = document.createElement('li');
        li.textContent = point;
        keyPointsList.appendChild(li);
    });
    
    keyPointsSection.appendChild(keyPointsTitle);
    keyPointsSection.appendChild(keyPointsList);
    notesContent.appendChild(keyPointsSection);
    
    // Create formula section
    const formulaSection = document.createElement('div');
    formulaSection.className = 'formula-section';
    
    const formulaTitle = document.createElement('div');
    formulaTitle.className = 'formula-title';
    formulaTitle.innerHTML = '<i class="fas fa-calculator"></i> Important Formulas & Rules';
    
    const formulaContent = document.createElement('div');
    formulaContent.className = 'formula-content';
    formulaContent.innerHTML = `
        <strong>Basic Formula:</strong> Always start with the fundamental equation<br><br>
        <strong>Derivative Rules:</strong> Power rule, product rule, chain rule<br><br>
        <strong>Integration Rules:</strong> Power rule, substitution, parts<br><br>
        <strong>Special Cases:</strong> Remember exceptions and special conditions
    `;
    
    formulaSection.appendChild(formulaTitle);
    formulaSection.appendChild(formulaContent);
    notesContent.appendChild(formulaSection);
    
    // Create individual note cards
    notes.forEach((note, index) => {
        console.log(`Creating note ${index + 1}:`, note);
        
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        
        const noteNumber = document.createElement('div');
        noteNumber.className = 'note-number';
        noteNumber.textContent = `Note ${note.noteNumber || index + 1}`;
        
        const noteTitle = document.createElement('div');
        noteTitle.className = 'note-title';
        noteTitle.innerHTML = `<span class="note-icon">${note.icon || '📝'}</span> ${note.title}`;
        
        const noteContent = document.createElement('div');
        noteContent.className = 'note-content';
        noteContent.textContent = note.content;
        
        noteCard.appendChild(noteNumber);
        noteCard.appendChild(noteTitle);
        noteCard.appendChild(noteContent);
        
        notesContent.appendChild(noteCard);
    });
    
    console.log(`Created ${notes.length} note cards`);
    showNotes();
}

// Show loading state
function showLoading(show) {
    console.log('showLoading called with:', show);
    
    if (!loadingSection) {
        console.error('loadingSection element not found!');
        return;
    }
    
    if (!notesSection) {
        console.error('notesSection element not found!');
        return;
    }
    
    if (show) {
        loadingSection.classList.remove('hidden');
        notesSection.classList.add('hidden');
        errorSection.classList.add('hidden');
        console.log('Loading section shown, notes section hidden');
    } else {
        loadingSection.classList.add('hidden');
        console.log('Loading section hidden');
    }
}

// Show notes section
function showNotes() {
    console.log('showNotes called');
    
    if (!notesSection) {
        console.error('notesSection element not found!');
        return;
    }
    
    notesSection.classList.remove('hidden');
    console.log('Notes section shown');
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
    if (notesSection) {
        notesSection.classList.add('hidden');
    }
}

// Hide error
function hideError() {
    if (errorSection) {
        errorSection.classList.add('hidden');
    }
} 