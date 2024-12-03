import React, { useState } from 'react';

function FinanceCalculator({ carPrice, onClose, onContactDealer }) {
  const [loanTerms, setLoanTerms] = useState({
    downPayment: 0,
    loanTerm: 60, // months
  });

  const calculateMonthlyPayment = () => {
    const principal = carPrice - loanTerms.downPayment;
    const monthlyPayment = principal / loanTerms.loanTerm;
    return isNaN(monthlyPayment) ? 0 : monthlyPayment;
  };

  const handleContactDealer = () => {
    const monthlyPayment = calculateMonthlyPayment();
    const totalCost = monthlyPayment * loanTerms.loanTerm;
    
    const financingDetails = {
      downPayment: loanTerms.downPayment,
      loanTerm: loanTerms.loanTerm,
      monthlyPayment: monthlyPayment,
      totalCost: totalCost
    };
    
    onContactDealer(financingDetails);
    onClose(); // Close the calculator after sending
  };

  return (
    <div className="finance-calculator">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        position: 'relative'
      }}>
        <h3 style={{ margin: 0 }}>Finance Calculator</h3>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '5px 10px',
            position: 'absolute',
            right: 0,
            top: 0,
            color: '#333'
          }}
        >
          ×
        </button>
      </div>

      <div className="calculator-inputs">
        <div className="form-group">
          <label>Down Payment ($)</label>
          <input
            type="number"
            value={loanTerms.downPayment}
            onChange={(e) => setLoanTerms({...loanTerms, downPayment: Number(e.target.value)})}
            min="0"
            max={carPrice}
          />
        </div>

        <div className="form-group">
          <label>Loan Term (months)</label>
          <select
            value={loanTerms.loanTerm}
            onChange={(e) => setLoanTerms({...loanTerms, loanTerm: Number(e.target.value)})}
          >
            <option value={36}>36 months</option>
            <option value={48}>48 months</option>
            <option value={60}>60 months</option>
            <option value={72}>72 months</option>
            <option value={84}>84 months</option>
          </select>
        </div>
      </div>

      <div className="calculator-results">
        <div className="result-item">
          <span>Monthly Payment:</span>
          <span className="amount">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(calculateMonthlyPayment())}
          </span>
        </div>
        <div className="result-item">
          <span>Total Cost:</span>
          <span className="amount">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(calculateMonthlyPayment() * loanTerms.loanTerm)}
          </span>
        </div>
      </div>

      <button
        onClick={handleContactDealer}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          marginTop: '20px',
          cursor: 'pointer'
        }}
      >
        Contact Dealer with this Option
      </button>
    </div>
  );
}

export default FinanceCalculator; 