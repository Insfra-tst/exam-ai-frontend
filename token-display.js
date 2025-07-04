// Token Display and Management Module
class TokenDisplay {
    constructor() {
        this.tokenBalance = 0;
        this.tokenPricing = null;
        this.init();
    }

    async init() {
        await this.loadTokenBalance();
        this.createTokenDisplay();
        this.setupEventListeners();
    }

    async loadTokenBalance() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No authentication token found');
                return;
            }

            const response = await fetch('/payment/tokens', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.tokenBalance = data.tokens.tokens_available;
                this.tokenPricing = data.pricing;
                this.updateDisplay();
            } else if (response.status === 401) {
                console.log('User not authenticated');
            } else {
                console.error('Failed to load token balance');
            }
        } catch (error) {
            console.error('Error loading token balance:', error);
        }
    }

    createTokenDisplay() {
        // Create token display container
        const tokenContainer = document.createElement('div');
        tokenContainer.id = 'token-display';
        tokenContainer.className = 'token-display';
        tokenContainer.innerHTML = `
            <div class="token-info">
                <span class="token-icon">🪙</span>
                <span class="token-balance" id="token-balance">0</span>
                <span class="token-label">tokens</span>
            </div>
            <button class="buy-tokens-btn" id="buy-tokens-btn">Buy Tokens</button>
        `;

        // Add styles
        const styles = `
            <style>
                .token-display {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 12px 20px;
                    border-radius: 25px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .token-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .token-icon {
                    font-size: 20px;
                }

                .token-balance {
                    font-weight: bold;
                    font-size: 18px;
                }

                .token-label {
                    font-size: 14px;
                    opacity: 0.9;
                }

                .buy-tokens-btn {
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s ease;
                }

                .buy-tokens-btn:hover {
                    background: rgba(255,255,255,0.3);
                    transform: translateY(-2px);
                }

                .token-modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    z-index: 2000;
                    align-items: center;
                    justify-content: center;
                }

                .token-modal-content {
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                }

                .token-modal h2 {
                    color: #333;
                    margin-bottom: 20px;
                    text-align: center;
                }

                .token-pricing {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    text-align: center;
                }

                .token-price {
                    font-size: 24px;
                    font-weight: bold;
                    color: #667eea;
                }

                .payment-form {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .form-group label {
                    font-weight: 500;
                    color: #333;
                }

                .form-group input {
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    font-size: 16px;
                }

                .card-row {
                    display: flex;
                    gap: 10px;
                }

                .card-row .form-group {
                    flex: 1;
                }

                .test-cards {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }

                .test-cards h4 {
                    margin: 0 0 10px 0;
                    color: #856404;
                }

                .test-card {
                    background: #f8f9fa;
                    padding: 10px;
                    border-radius: 5px;
                    margin-bottom: 8px;
                    font-family: monospace;
                    font-size: 12px;
                }

                .purchase-btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 15px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .purchase-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }

                .purchase-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .close-btn {
                    position: absolute;
                    top: 15px;
                    right: 20px;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                }

                .insufficient-tokens {
                    background: #f8d7da;
                    border: 1px solid #f5c6cb;
                    color: #721c24;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                    text-align: center;
                }

                .insufficient-tokens h3 {
                    margin: 0 0 10px 0;
                }

                .insufficient-tokens .buy-tokens-btn {
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                }
            </style>
        `;

        // Add to document
        document.head.insertAdjacentHTML('beforeend', styles);
        document.body.appendChild(tokenContainer);
    }

    updateDisplay() {
        const balanceElement = document.getElementById('token-balance');
        if (balanceElement) {
            balanceElement.textContent = this.tokenBalance;
        }
    }

    setupEventListeners() {
        const buyTokensBtn = document.getElementById('buy-tokens-btn');
        if (buyTokensBtn) {
            buyTokensBtn.addEventListener('click', () => this.showPurchaseModal());
        }
    }

    async showPurchaseModal() {
        const modal = document.createElement('div');
        modal.className = 'token-modal';
        modal.innerHTML = `
            <div class="token-modal-content">
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">&times;</button>
                <h2>Purchase Tokens</h2>
                
                <div class="token-pricing">
                    <div class="token-price">$${this.tokenPricing?.price_usd || 10.00}</div>
                    <div>for ${this.tokenPricing?.tokens_per_purchase || 300} tokens</div>
                    <div style="font-size: 14px; color: #666; margin-top: 5px;">
                        Valid for ${this.tokenPricing?.validity_days || 365} days
                    </div>
                </div>

                <div class="test-cards">
                    <h4>🧪 Test Credit Cards (Development Only)</h4>
                    <div class="test-card">
                        <strong>Visa:</strong> 4242 4242 4242 4242 | Exp: 12/25 | CVC: 123
                    </div>
                    <div class="test-card">
                        <strong>Mastercard:</strong> 5555 5555 5555 4444 | Exp: 12/25 | CVC: 123
                    </div>
                    <div class="test-card">
                        <strong>American Express:</strong> 3782 822463 10005 | Exp: 12/25 | CVC: 1234
                    </div>
                </div>

                <form class="payment-form" id="payment-form">
                    <div class="form-group">
                        <label for="cardholder-name">Cardholder Name</label>
                        <input type="text" id="cardholder-name" required placeholder="John Doe">
                    </div>
                    
                    <div class="form-group">
                        <label for="card-number">Card Number</label>
                        <input type="text" id="card-number" required placeholder="4242 4242 4242 4242" maxlength="19">
                    </div>
                    
                    <div class="card-row">
                        <div class="form-group">
                            <label for="exp-month">Expiry Month</label>
                            <input type="text" id="exp-month" required placeholder="12" maxlength="2">
                        </div>
                        <div class="form-group">
                            <label for="exp-year">Expiry Year</label>
                            <input type="text" id="exp-year" required placeholder="2025" maxlength="4">
                        </div>
                        <div class="form-group">
                            <label for="cvc">CVC</label>
                            <input type="text" id="cvc" required placeholder="123" maxlength="4">
                        </div>
                    </div>
                    
                    <button type="submit" class="purchase-btn" id="purchase-btn">
                        Purchase Tokens - $${this.tokenPricing?.price_usd || 10.00}
                    </button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        // Setup form submission
        const form = document.getElementById('payment-form');
        form.addEventListener('submit', (e) => this.handlePurchase(e));

        // Setup input formatting
        this.setupInputFormatting();
    }

    setupInputFormatting() {
        const cardNumber = document.getElementById('card-number');
        const expMonth = document.getElementById('exp-month');
        const expYear = document.getElementById('exp-year');
        const cvc = document.getElementById('cvc');

        // Card number formatting
        cardNumber.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.replace(/\s+/g, '').replace(/(\d{4})/g, '$1 ').trim();
            e.target.value = formattedValue;
        });

        // Expiry month
        expMonth.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            if (parseInt(e.target.value) > 12) e.target.value = '12';
        });

        // Expiry year
        expYear.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });

        // CVC
        cvc.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }

    async handlePurchase(e) {
        e.preventDefault();
        
        const purchaseBtn = document.getElementById('purchase-btn');
        purchaseBtn.disabled = true;
        purchaseBtn.textContent = 'Processing...';

        try {
            const formData = {
                cardholderName: document.getElementById('cardholder-name').value,
                cardNumber: document.getElementById('card-number').value,
                expMonth: document.getElementById('exp-month').value,
                expYear: document.getElementById('exp-year').value,
                cvc: document.getElementById('cvc').value
            };

            const token = localStorage.getItem('token');
            const response = await fetch('/payment/purchase', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Payment successful! Tokens have been added to your account.');
                await this.loadTokenBalance();
                document.querySelector('.token-modal').remove();
            } else {
                alert(`Payment failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Purchase error:', error);
            alert('Payment failed. Please try again.');
        } finally {
            purchaseBtn.disabled = false;
            purchaseBtn.textContent = `Purchase Tokens - $${this.tokenPricing?.price_usd || 10.00}`;
        }
    }

    showInsufficientTokensModal(required, available, actionType) {
        const modal = document.createElement('div');
        modal.className = 'token-modal';
        modal.innerHTML = `
            <div class="token-modal-content">
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">&times;</button>
                <div class="insufficient-tokens">
                    <h3>🪙 Insufficient Tokens</h3>
                    <p>You need <strong>${required}</strong> tokens for this action.</p>
                    <p>You currently have <strong>${available}</strong> tokens available.</p>
                    <p>Action: ${actionType}</p>
                    <button class="buy-tokens-btn" onclick="tokenDisplay.showPurchaseModal(); this.parentElement.parentElement.parentElement.remove();">
                        Buy More Tokens
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    // Method to check tokens before API calls
    async checkTokens(actionType) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch('/payment/check-tokens', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ actionType })
            });

            const result = await response.json();

            if (response.ok) {
                if (!result.hasEnough) {
                    this.showInsufficientTokensModal(result.required, result.available, result.actionType);
                    return false;
                }
                return true;
            } else {
                console.error('Token check failed:', result.error);
                return false;
            }
        } catch (error) {
            console.error('Error checking tokens:', error);
            return false;
        }
    }
}

// Initialize token display
let tokenDisplay;
document.addEventListener('DOMContentLoaded', () => {
    tokenDisplay = new TokenDisplay();
});

// Export for use in other scripts
window.tokenDisplay = tokenDisplay; 