// Global variables
let currentExamType = '';
let currentSubject = '';
let topicsData = [];

// DOM elements
const loadingSection = document.getElementById('loadingSection');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const topicsSection = document.getElementById('topicsSection');
const topicsTitle = document.getElementById('topicsTitle');
const topicsSubtitle = document.getElementById('topicsSubtitle');
const topicsTableBody = document.getElementById('topicsTableBody');

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
    
    // Update page title and subtitle
    topicsTitle.textContent = `${currentExamType} - ${currentSubject}`;
    topicsSubtitle.textContent = `Complete syllabus breakdown for ${currentExamType} ${currentSubject}`;
    
    // Generate topics and subtopics
    generateTopicsAndSubtopics();
});

// Generate topics and subtopics
async function generateTopicsAndSubtopics() {
    showLoading(true);
    
    try {
        // Generate main topics
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
            throw new Error('Failed to generate topics');
        }
        
        const topicsData = await topicsResponse.json();
        const topics = topicsData.topics;
        
        // Generate subtopics for each topic
        const topicsWithSubtopics = [];
        
        for (const topic of topics) {
            try {
                const subtopicsResponse = await fetch('/api/generate-subtopics', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        examType: currentExamType,
                        subject: currentSubject,
                        mainTopic: topic
                    })
                });
                
                if (subtopicsResponse.ok) {
                    const subtopicsData = await subtopicsResponse.json();
                    topicsWithSubtopics.push({
                        topic: topic,
                        subtopics: subtopicsData.subtopics
                    });
                } else {
                    // Fallback subtopics
                    topicsWithSubtopics.push({
                        topic: topic,
                        subtopics: generateFallbackSubtopics(topic)
                    });
                }
            } catch (error) {
                console.error(`Error generating subtopics for ${topic}:`, error);
                // Fallback subtopics
                topicsWithSubtopics.push({
                    topic: topic,
                    subtopics: generateFallbackSubtopics(topic)
                });
            }
        }
        
        displayTopicsTable(topicsWithSubtopics);
        
    } catch (error) {
        console.error('Error generating topics and subtopics:', error);
        showError('Failed to generate topics and subtopics. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Display topics table
function displayTopicsTable(topicsWithSubtopics) {
    topicsTableBody.innerHTML = '';
    
    topicsWithSubtopics.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // Create subtopics list
        const subtopicsList = item.subtopics.map(subtopic => 
            `<li>${subtopic}</li>`
        ).join('');
        
        row.innerHTML = `
            <td>
                <div class="topic-name">${item.topic}</div>
            </td>
            <td>
                <ul class="subtopics-list">
                    ${subtopicsList}
                </ul>
            </td>
            <td>
                <button class="analysis-btn" onclick="openAnalysis('${item.topic}')">
                    <i class="fas fa-search"></i>
                    In-Depth Analysis
                </button>
            </td>
        `;
        
        topicsTableBody.appendChild(row);
    });
    
    showTopics();
}

// Generate fallback subtopics
function generateFallbackSubtopics(topic) {
    const fallbackSubtopics = {
        'Mechanics': [
            'Newton\'s Laws of Motion', 'Work and Energy', 'Momentum and Collisions',
            'Circular Motion', 'Gravitation', 'Simple Harmonic Motion'
        ],
        'Thermodynamics': [
            'Laws of Thermodynamics', 'Heat Transfer', 'Thermal Properties',
            'Kinetic Theory', 'Entropy', 'Heat Engines'
        ],
        'Electromagnetism': [
            'Electric Field', 'Magnetic Field', 'Electromagnetic Induction',
            'AC Circuits', 'Electromagnetic Waves', 'Capacitance'
        ],
        'Optics': [
            'Geometric Optics', 'Wave Optics', 'Reflection and Refraction',
            'Lenses and Mirrors', 'Interference', 'Diffraction'
        ],
        'Modern Physics': [
            'Quantum Mechanics', 'Atomic Physics', 'Nuclear Physics',
            'Relativity', 'Photoelectric Effect', 'Radioactivity'
        ],
        'Physical Chemistry': [
            'Chemical Kinetics', 'Thermodynamics', 'Electrochemistry',
            'Surface Chemistry', 'Nuclear Chemistry', 'Solutions'
        ],
        'Organic Chemistry': [
            'Alkanes and Alkenes', 'Alcohols and Ethers', 'Aldehydes and Ketones',
            'Carboxylic Acids', 'Amines', 'Polymers'
        ],
        'Inorganic Chemistry': [
            'Chemical Bonding', 'Coordination Chemistry', 'Periodic Table',
            'Acids and Bases', 'Redox Reactions', 'Metallurgy'
        ]
    };
    
    return fallbackSubtopics[topic] || [
        'Basic Concepts', 'Advanced Applications', 'Problem Types',
        'Study Strategies', 'Key Formulas', 'Practice Methods'
    ];
}

// Open analysis page for a specific topic
function openAnalysis(topic) {
    const params = new URLSearchParams({
        exam: currentExamType,
        subject: currentSubject,
        topic: topic
    });
    window.open(`/analysis.html?${params.toString()}`, '_blank');
}

// Show loading
function showLoading(show) {
    if (show) {
        loadingSection.classList.remove('hidden');
        topicsSection.classList.add('hidden');
        errorSection.classList.add('hidden');
    } else {
        loadingSection.classList.add('hidden');
    }
}

// Show topics
function showTopics() {
    topicsSection.classList.remove('hidden');
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
    loadingSection.classList.add('hidden');
    topicsSection.classList.add('hidden');
}

// Go back to main page
function goBack() {
    window.location.href = '/';
} 