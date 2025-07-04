// Global variables
let examType = '';
let subject = '';
let topicName = '';
let cachedTopicData = null;

// DOM elements - will be initialized after DOM loads
let loadingSection, errorSection, topicAnalysisSection, topicAnalysisTitle, topicAnalysisSubtitle, topicAnalysisTableBody, errorMessage, breadcrumb;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Topic Analysis page loaded');
    
    // Initialize DOM elements
    loadingSection = document.getElementById('loadingSection');
    errorSection = document.getElementById('errorSection');
    topicAnalysisSection = document.getElementById('topicAnalysisSection');
    topicAnalysisTitle = document.getElementById('topicAnalysisTitle');
    topicAnalysisSubtitle = document.getElementById('topicAnalysisSubtitle');
    topicAnalysisTableBody = document.getElementById('topicAnalysisTableBody');
    errorMessage = document.getElementById('errorMessage');
    breadcrumb = document.getElementById('breadcrumb');
    
    // Check if all required elements are found
    console.log('DOM Elements check:', {
        loadingSection: !!loadingSection,
        errorSection: !!errorSection,
        topicAnalysisSection: !!topicAnalysisSection,
        topicAnalysisTitle: !!topicAnalysisTitle,
        topicAnalysisSubtitle: !!topicAnalysisSubtitle,
        topicAnalysisTableBody: !!topicAnalysisTableBody,
        errorMessage: !!errorMessage,
        breadcrumb: !!breadcrumb
    });
    
    // Verify all required elements exist
    if (!loadingSection || !topicAnalysisSection || !topicAnalysisTableBody) {
        console.error('Required DOM elements not found!');
        showError('Page elements not found. Please refresh the page.');
        return;
    }
    
    // Get parameters from URL first, then fallback to session storage
    const urlParams = new URLSearchParams(window.location.search);
    examType = urlParams.get('exam') || sessionStorage.getItem('examType');
    subject = urlParams.get('subject') || sessionStorage.getItem('subject');
    topicName = urlParams.get('topic') || 'General Topics';
    
    console.log('Parameters:', { examType, subject, topicName });
    
    // Set default values if not available
    if (!examType) examType = 'JEE';
    if (!subject) subject = 'Mathematics';
    if (!topicName) topicName = 'Calculus';
    
    // Save to session storage
    sessionStorage.setItem('examType', examType);
    sessionStorage.setItem('subject', subject);
    
    console.log('Final parameters:', { examType, subject, topicName });
    
    // Update page title and subtitle
    if (topicAnalysisTitle) {
        topicAnalysisTitle.textContent = `${topicName} - Subtopic Analysis`;
    }
    if (topicAnalysisSubtitle) {
        topicAnalysisSubtitle.textContent = `Detailed frequency analysis of subtopics for ${examType} - ${subject}`;
    }
    
    // Update breadcrumb - find the active breadcrumb item and update it
    if (breadcrumb) {
        const activeBreadcrumbItem = breadcrumb.querySelector('.breadcrumb-item.active');
        if (activeBreadcrumbItem) {
            activeBreadcrumbItem.innerHTML = `<i class="fas fa-layer-group"></i> ${topicName}`;
        }
        breadcrumb.classList.remove('hidden');
    }
    
    // Check if we have cached data
    const cacheKey = `topic_analysis_${examType}_${subject}_${topicName}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    console.log('Cache key:', cacheKey);
    console.log('Cached data exists:', !!cachedData);
    
    if (cachedData) {
        try {
            // Show loading message for cached data
            showLoadingMessage('Loading saved data...', 'Retrieving previously generated topic analysis');
            cachedTopicData = JSON.parse(cachedData);
            console.log('Parsed cached data:', cachedTopicData);
            
            // Simulate a brief loading time for better UX
            setTimeout(() => {
                console.log('Displaying cached data...');
                displayTopicAnalysisData(cachedTopicData);
                showTopicAnalysis();
                showLoading(false);
                console.log('Cached data displayed successfully');
            }, 500);
        } catch (e) {
            console.error('Error parsing cached data:', e);
            generateTopicAnalysisData();
        }
    } else {
        // Generate topic analysis data
        console.log('No cached data, generating new data...');
        generateTopicAnalysisData();
    }
    
    // Add a safety timeout to prevent infinite loading
    setTimeout(() => {
        if (loadingSection && !loadingSection.classList.contains('hidden')) {
            console.log('Safety timeout triggered - forcing fallback data');
            const fallbackData = generateFallbackTopicData();
            displayTopicAnalysisData(fallbackData);
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

// Generate topic analysis data using OpenAI
async function generateTopicAnalysisData() {
    console.log('generateTopicAnalysisData started');
    showLoadingMessage('Analyzing topic patterns...', 'Generating detailed subtopic analysis using AI');
    hideError();
    
    console.log('Generating topic analysis data for:', { examType, subject, topicName });
    
    try {
        const requestBody = {
            examType: examType,
            subject: subject,
            topic: topicName
        };
        
        console.log('Request body:', requestBody);
        
        const response = await fetch('/api/generate-topic-analysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success && data.subtopics && Array.isArray(data.subtopics)) {
            console.log('Valid response received, caching data...');
            // Cache the data
            const cacheKey = `topic_analysis_${examType}_${subject}_${topicName}`;
            sessionStorage.setItem(cacheKey, JSON.stringify(data.subtopics));
            cachedTopicData = data.subtopics;
            
            console.log('Calling displayTopicAnalysisData...');
            displayTopicAnalysisData(data.subtopics);
            console.log('displayTopicAnalysisData completed');
        } else {
            console.error('Invalid response structure:', data);
            throw new Error(data.error || 'Invalid response structure');
        }
        
    } catch (error) {
        console.error('Error generating topic analysis data:', error);
        console.log('Using fallback data...');
        // Use fallback data
        const fallbackData = generateFallbackTopicData();
        console.log('Fallback data generated:', fallbackData);
        displayTopicAnalysisData(fallbackData);
    } finally {
        console.log('Setting loading to false...');
        showLoading(false);
        console.log('Loading set to false');
    }
}

// Generate fallback topic analysis data
function generateFallbackTopicData() {
    // Set default values if not available
    if (!examType) examType = 'General Exam';
    if (!subject) subject = 'General Subject';
    if (!topicName) topicName = 'General Topics';
    
    // Generate topic-specific fallback data
    const fallbackSubtopics = {
        'Calculus': [
            { name: "Differential Calculus", percentage: 30, description: "Derivatives, rate of change, and applications" },
            { name: "Integral Calculus", percentage: 25, description: "Integration techniques and applications" },
            { name: "Applications of Derivatives", percentage: 20, description: "Maxima/minima, optimization problems" },
            { name: "Applications of Integrals", percentage: 15, description: "Area, volume, and work calculations" },
            { name: "Differential Equations", percentage: 10, description: "Basic differential equations and solutions" }
        ],
        'Algebra': [
            { name: "Linear Equations", percentage: 25, description: "Solving linear equations and systems" },
            { name: "Quadratic Equations", percentage: 20, description: "Quadratic functions and solutions" },
            { name: "Polynomials", percentage: 18, description: "Polynomial functions and factorization" },
            { name: "Sequences and Series", percentage: 15, description: "Arithmetic and geometric progressions" },
            { name: "Matrices and Determinants", percentage: 12, description: "Matrix operations and determinants" },
            { name: "Complex Numbers", percentage: 10, description: "Complex number operations and properties" }
        ],
        'Mechanics': [
            { name: "Newton's Laws of Motion", percentage: 30, description: "Force, mass, and acceleration relationships" },
            { name: "Work, Energy, and Power", percentage: 25, description: "Energy conservation and work calculations" },
            { name: "Momentum and Collisions", percentage: 20, description: "Linear momentum and collision analysis" },
            { name: "Circular Motion", percentage: 15, description: "Uniform circular motion and centripetal force" },
            { name: "Gravitation", percentage: 10, description: "Gravitational force and orbital motion" }
        ],
        'Electromagnetism': [
            { name: "Electric Charges and Fields", percentage: 25, description: "Electric charge and field calculations" },
            { name: "Electric Potential", percentage: 20, description: "Electric potential and potential difference" },
            { name: "Current Electricity", percentage: 20, description: "Current, resistance, and circuit analysis" },
            { name: "Magnetic Fields", percentage: 18, description: "Magnetic field and force calculations" },
            { name: "Electromagnetic Induction", percentage: 12, description: "Faraday's law and induced EMF" },
            { name: "AC Circuits", percentage: 5, description: "Alternating current and impedance" }
        ],
        'Organic Chemistry': [
            { name: "Hydrocarbons", percentage: 25, description: "Alkanes, alkenes, and alkynes" },
            { name: "Functional Groups", percentage: 22, description: "Alcohols, aldehydes, ketones, and acids" },
            { name: "Reaction Mechanisms", percentage: 20, description: "Substitution, elimination, and addition reactions" },
            { name: "Stereochemistry", percentage: 15, description: "Isomerism and stereoisomers" },
            { name: "Biomolecules", percentage: 10, description: "Carbohydrates, proteins, and nucleic acids" },
            { name: "Polymers", percentage: 8, description: "Synthetic and natural polymers" }
        ],
        'Physical Chemistry': [
            { name: "Chemical Kinetics", percentage: 25, description: "Reaction rates and rate laws" },
            { name: "Thermodynamics", percentage: 22, description: "Enthalpy, entropy, and free energy" },
            { name: "Chemical Equilibrium", percentage: 20, description: "Equilibrium constants and Le Chatelier's principle" },
            { name: "Electrochemistry", percentage: 18, description: "Redox reactions and electrochemical cells" },
            { name: "Solutions", percentage: 10, description: "Colligative properties and solution behavior" },
            { name: "Surface Chemistry", percentage: 5, description: "Adsorption and catalysis" }
        ],
        'Human Physiology': [
            { name: "Cardiovascular System", percentage: 25, description: "Heart, blood vessels, and circulation" },
            { name: "Respiratory System", percentage: 20, description: "Lungs and gas exchange mechanisms" },
            { name: "Digestive System", percentage: 18, description: "Digestion and nutrient absorption" },
            { name: "Nervous System", percentage: 15, description: "Brain, spinal cord, and neural pathways" },
            { name: "Endocrine System", percentage: 12, description: "Hormones and endocrine glands" },
            { name: "Excretory System", percentage: 10, description: "Kidneys and waste elimination" }
        ]
    };
    
    // Try to get topic-specific data
    let subtopics = fallbackSubtopics[topicName];
    
    // If no specific data, generate generic data
    if (!subtopics) {
        subtopics = [
            { name: "Core Concepts", percentage: 35, description: "Fundamental principles and basic concepts" },
            { name: "Problem Solving", percentage: 25, description: "Application-based questions and problem-solving techniques" },
            { name: "Advanced Applications", percentage: 20, description: "Complex scenarios and advanced applications" },
            { name: "Theoretical Analysis", percentage: 15, description: "Theoretical questions and analytical problems" },
            { name: "Practical Examples", percentage: 5, description: "Real-world examples and case studies" }
        ];
    }
    
    // Cache fallback data
    const cacheKey = `topic_analysis_${examType}_${subject}_${topicName}`;
    sessionStorage.setItem(cacheKey, JSON.stringify(subtopics));
    cachedTopicData = subtopics;
    
    console.log('Generated fallback data:', subtopics);
    
    return subtopics;
}

// Display topic analysis data in table
function displayTopicAnalysisData(subtopics) {
    console.log('displayTopicAnalysisData called with:', subtopics);
    
    if (!topicAnalysisTableBody) {
        console.error('topicAnalysisTableBody element not found!');
        return;
    }
    
    topicAnalysisTableBody.innerHTML = '';
    console.log('Cleared table body');
    
    subtopics.forEach((subtopic, index) => {
        console.log(`Creating row ${index + 1} for subtopic:`, subtopic);
        
        const row = document.createElement('tr');
        
        // Create rank badge
        const rankCell = document.createElement('td');
        const rankBadge = document.createElement('div');
        rankBadge.className = 'rank-badge';
        rankBadge.textContent = index + 1;
        rankCell.appendChild(rankBadge);
        
        // Create subtopic name cell
        const subtopicCell = document.createElement('td');
        const subtopicName = document.createElement('div');
        subtopicName.className = 'subtopic-name';
        subtopicName.textContent = subtopic.name;
        subtopicCell.appendChild(subtopicName);
        
        // Create percentage cell
        const percentageCell = document.createElement('td');
        const percentageDisplay = document.createElement('div');
        percentageDisplay.className = 'percentage-display';
        
        const percentageBar = document.createElement('div');
        percentageBar.className = 'percentage-bar';
        
        const percentageFill = document.createElement('div');
        percentageFill.className = 'percentage-fill';
        percentageFill.style.width = `${subtopic.percentage}%`;
        
        const percentageText = document.createElement('div');
        percentageText.className = 'percentage-text';
        percentageText.textContent = `${subtopic.percentage}%`;
        
        percentageBar.appendChild(percentageFill);
        percentageDisplay.appendChild(percentageBar);
        percentageDisplay.appendChild(percentageText);
        percentageCell.appendChild(percentageDisplay);
        
        // Create analysis button cell
        const analysisCell = document.createElement('td');
        const analysisBtn = document.createElement('button');
        analysisBtn.className = 'analysis-btn';
        analysisBtn.innerHTML = '<i class="fas fa-chart-line"></i> In-depth Analysis';
        analysisBtn.onclick = () => openQuestionTypesAnalysis(subtopic.name);
        analysisCell.appendChild(analysisBtn);
        
        // Add cells to row
        row.appendChild(rankCell);
        row.appendChild(subtopicCell);
        row.appendChild(percentageCell);
        row.appendChild(analysisCell);
        
        // Add row to table
        topicAnalysisTableBody.appendChild(row);
    });
    
    console.log(`Created ${subtopics.length} rows in table`);
    showTopicAnalysis();
}

// Show loading state
function showLoading(show) {
    console.log('showLoading called with:', show);
    
    if (!loadingSection) {
        console.error('loadingSection element not found!');
        return;
    }
    
    if (!topicAnalysisSection) {
        console.error('topicAnalysisSection element not found!');
        return;
    }
    
    if (show) {
        loadingSection.classList.remove('hidden');
        topicAnalysisSection.classList.add('hidden');
        errorSection.classList.add('hidden');
        console.log('Loading section shown, topic analysis section hidden');
    } else {
        loadingSection.classList.add('hidden');
        console.log('Loading section hidden');
    }
}

// Show topic analysis section
function showTopicAnalysis() {
    console.log('showTopicAnalysis called');
    
    if (!topicAnalysisSection) {
        console.error('topicAnalysisSection element not found!');
        return;
    }
    
    topicAnalysisSection.classList.remove('hidden');
    console.log('Topic analysis section shown');
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
    loadingSection.classList.add('hidden');
    topicAnalysisSection.classList.add('hidden');
}

// Hide error
function hideError() {
    errorSection.classList.add('hidden');
}

// Open question types analysis page
function openQuestionTypesAnalysis(subtopicName) {
    const params = new URLSearchParams({
        exam: examType,
        subject: subject,
        topic: topicName,
        subtopic: subtopicName
    });
    window.open(`/question-types.html?${params.toString()}`, '_blank');
} 