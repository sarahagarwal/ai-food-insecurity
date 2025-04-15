'use client';

import { useState, useEffect } from 'react';

const FeedbackForm = ({ foodbankId }: { foodbankId: string | number }) => {
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Optional: persist data in localStorage (remove if not needed)
  useEffect(() => {
    const saved = localStorage.getItem(`feedback-${foodbankId}`);
    if (saved) {
      setSubmitted(true);
    }
  }, [foodbankId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const feedback = {
      foodbankId,
      rating,
      comment,
      timestamp: new Date().toISOString(),
    };

    console.log("🔹 Feedback submitted:", feedback); // ← Logs to console

    localStorage.setItem(`feedback-${foodbankId}`, JSON.stringify(feedback)); // optional

    setSubmitted(true);
  };

  if (submitted) return <p>✅ Thank you for your feedback!</p>;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '1rem' }}>
      <label>
        Rating:
        <select value={rating} onChange={(e) => setRating(e.target.value)} required>
          <option value="">--Select--</option>
          <option value="👍 Helpful">👍 Helpful</option>
          <option value="😐 Okay">😐 Okay</option>
          <option value="👎 Not Helpful">👎 Not Helpful</option>
        </select>
      </label>
      <label>
        Comment:
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
        />
      </label>
      <button
        type="submit"
        style={{
          backgroundColor: '#2c5f2d',
          color: 'white',
          border: 'none',
          padding: '6px',
          borderRadius: '6px',
        }}
      >
        Submit Feedback
      </button>
    </form>
  );
};

export default FeedbackForm;
