// Global variables
let currentExamType = '';
let currentSubject = '';

// DOM elements
const analysisForm = document.getElementById('analysisForm');
const examTypeInput = document.getElementById('examType');
const subjectInput = document.getElementById('subject');
const analyzeBtn = document.getElementById('analyzeBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadSavedData();
});

// Setup event listeners
function setupEventListeners() {
    // Form submission
    analysisForm.addEventListener('submit', function(e) {
        e.preventDefault();
        analyzeSyllabus();
    });
    
    // Input validation
    examTypeInput.addEventListener('input', handleInputChange);
    subjectInput.addEventListener('input', handleInputChange);
    
    // Real-time validation
    examTypeInput.addEventListener('blur', validateInput);
    subjectInput.addEventListener('blur', validateInput);
}

// Load saved data from session storage
function loadSavedData() {
    const savedExamType = sessionStorage.getItem('examType');
    const savedSubject = sessionStorage.getItem('subject');
    
    if (savedExamType) {
        examTypeInput.value = savedExamType;
        currentExamType = savedExamType;
    }
    
    if (savedSubject) {
        subjectInput.value = savedSubject;
        currentSubject = savedSubject;
    }
    
    updateAnalyzeButton();
}

// Handle input changes
function handleInputChange() {
    currentExamType = examTypeInput.value.trim();
    currentSubject = subjectInput.value.trim();
    updateAnalyzeButton();
    hideError();
}

// Validate input
function validateInput() {
    const examType = examTypeInput.value.trim();
    const subject = subjectInput.value.trim();
    
    if (!examType) {
        examTypeInput.style.borderColor = '#dc3545';
        return false;
    } else {
        examTypeInput.style.borderColor = '#e9ecef';
    }
    
    if (!subject) {
        subjectInput.style.borderColor = '#dc3545';
        return false;
    } else {
        subjectInput.style.borderColor = '#e9ecef';
    }
    
    return true;
}

// Update analyze button state
function updateAnalyzeButton() {
    analyzeBtn.disabled = !(currentExamType && currentSubject);
}

// Analyze syllabus - directly open heatmap page
async function analyzeSyllabus() {
    if (!validateInput()) {
        showError('Please enter both exam type and subject');
        return;
    }
    
    // Save data to session storage
    sessionStorage.setItem('examType', currentExamType);
    sessionStorage.setItem('subject', currentSubject);
    
    showLoading(true);
    hideError();
    
    try {
        // Directly open the heatmap analysis page
        const params = new URLSearchParams({
            exam: currentExamType,
            subject: currentSubject
        });
        window.location.href = `/heatmap.html?${params.toString()}`;
    } catch (error) {
        console.error('Error:', error);
        showError('An error occurred. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Show loading
function showLoading(show) {
    if (show) {
        loading.style.display = 'block';
        analyzeBtn.disabled = true;
    } else {
        loading.style.display = 'none';
        analyzeBtn.disabled = false;
    }
}

// Show error
function showError(message) {
    error.textContent = message;
    error.style.display = 'block';
    loading.style.display = 'none';
}

// Hide error
function hideError() {
    error.style.display = 'none';
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Enter key to submit form when inputs are valid
    if (e.key === 'Enter' && !analyzeBtn.disabled) {
        if (document.activeElement === examTypeInput || document.activeElement === subjectInput) {
            e.preventDefault();
            analyzeSyllabus();
        }
    }
});

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Performance optimization: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced window resize handler
const debouncedResize = debounce(function() {
    // Handle responsive adjustments if needed
    console.log('Window resized');
}, 250);

window.addEventListener('resize', debouncedResize); 