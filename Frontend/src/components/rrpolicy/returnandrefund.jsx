import React from 'react';
import './returnandrefund.css';

const ReturnAndRefund = () => {
  return (
    <div className="policy-wrapper">
      <header className="policy-header">
        <h1 className="policy-title">Return & Refund Policy</h1>
        <p className="policy-date">Effective Date: January 22, 2025</p>
      </header>

      <main className="policy-content">
        <section className="policy-card">
          <h2>Products Eligible for Return</h2>
          <p>
            We accept returns under the following conditions:
          </p>
          <ul>
            <li>
              <strong>Perishable Items:</strong> Returns are accepted if:
              <ul>
                <li>The product is damaged during transit.</li>
                <li>The product is spoiled or contaminated upon delivery.</li>
              </ul>
            </li>
            <li>
              <strong>Non-Perishable Items:</strong> Eligible for return if defective, damaged, or incorrect.
            </li>
          </ul>
        </section>

        <section className="policy-card">
          <h2>Conditions for Return</h2>
          <ul>
            <li>The product must be unused, unopened, and in its original packaging.</li>
            <li>Return requests must be initiated within:
              <ul>
                <li><strong>24 hours</strong> for perishable items.</li>
                <li><strong>7 days</strong> for non-perishable items.</li>
              </ul>
            </li>
            <li>Proof of purchase is required.</li>
          </ul>
        </section>

        <section className="policy-card">
          <h2>Return Process</h2>
          <ol>
            <li>
              <strong>Contact Us:</strong> Email us at <a href="mailto:govardhandairyfarms@gmail.com">govardhandairyfarms@gmail.com</a> or call <strong>+91 96192 24145</strong>.
            </li>
            <li>
              <strong>Provide Details:</strong> Include your order number, the product(s) for return, and the reason.
            </li>
            <li>
              <strong>Approval:</strong> Our team will review your request and respond promptly.
            </li>
            <li>
              <strong>Pickup or Drop-off:</strong> Approved returns will have a pickup arranged or details provided for drop-off.
            </li>
          </ol>
        </section>

        <section className="policy-card">
          <h2>Refunds & Replacements</h2>
          <p>
            Refunds are processed within <strong>7-10 business days</strong> after product inspection. 
            You can also opt for a replacement under the same conditions.
          </p>
          <p>Note: Shipping charges are non-refundable unless the issue was our fault.</p>
        </section>

        <section className="policy-card">
          <h2>Cancellations</h2>
          <ul>
            <li>Orders can be canceled before shipment.</li>
            <li>Refunds for cancellations are processed within <strong>3-5 business days</strong>.</li>
          </ul>
        </section>

        <section className="policy-card">
          <h2>Exceptions</h2>
          <p>We reserve the right to deny returns or refunds in the following cases:</p>
          <ul>
            <li>Repeated or abusive return requests.</li>
            <li>Products misused or not stored as per guidelines.</li>
          </ul>
        </section>
      </main>

      <footer className="policy-footer">
        <p>By purchasing from Govardhan Dairy Farm, you agree to this policy. Terms are subject to change.</p>
      </footer>
    </div>
  );
};

export default ReturnAndRefund;
