// Configuration for shared hosting deployment
window.APP_CONFIG = {
    // Replace with your backend URL when deployed
    API_BASE_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3002' 
        : 'https://exam-ai-backend.onrender.com',
    
    // Environment
    ENVIRONMENT: window.location.hostname === 'localhost' ? 'development' : 'production',
    
    // Features
    FEATURES: {
        OPENAI_INTEGRATION: true,
        TOKEN_SYSTEM: true,
        PAYMENT_SYSTEM: true,
        EMAIL_VERIFICATION: true
    },
    
    // API Endpoints
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            LOGOUT: '/auth/logout',
            VERIFY: '/auth/verify',
            RESET_PASSWORD: '/auth/reset-password'
        },
        USER: {
            PROFILE: '/auth/profile',
            UPDATE: '/auth/update-profile',
            ONBOARDING: '/auth/onboarding'
        },
        TOKENS: {
            BALANCE: '/tokens/balance',
            PURCHASE: '/payment/purchase',
            HISTORY: '/tokens/history'
        },
        EXAMS: {
            VALIDATE: '/auth/validate-exam',
            ANALYZE: '/auth/analyze-exam',
            SUBJECTS: '/auth/subjects'
        }
    },
    
    // Default settings
    DEFAULTS: {
        TOKENS_PER_ACTION: 10,
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        SESSION_TIMEOUT: 24 * 60 * 60 * 1000 // 24 hours
    }
};

// Helper function to get full API URL
window.getApiUrl = function(endpoint) {
    return APP_CONFIG.API_BASE_URL + endpoint;
};

// Helper function to make API calls
window.apiCall = async function(endpoint, options = {}) {
    const url = getApiUrl(endpoint);
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include'
    };
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, finalOptions);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
};

// Helper function to handle authentication
window.handleAuthError = function(error) {
    if (error.message.includes('401') || error.message.includes('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth.html';
    }
};

// Helper function to show notifications
window.showNotification = function(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#4CAF50';
            break;
        case 'error':
            notification.style.backgroundColor = '#f44336';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ff9800';
            break;
        default:
            notification.style.backgroundColor = '#2196F3';
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize configuration
console.log('App configuration loaded:', APP_CONFIG); 