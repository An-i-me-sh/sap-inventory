import React, { useState } from 'react';
import { queryAi } from '../api/analytics';

export default function AiInsightsPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');

  const sampleQuestions = [
    "Which materials are at risk of stockout?",
    "Which purchase orders have critical delivery delays?",
    "Provide a general inventory health summary."
  ];

  const handleQuery = (qToSubmit) => {
    const targetQ = qToSubmit || question;
    if (!targetQ.trim()) return;

    setLoading(true);
    setError('');
    queryAi(targetQ)
      .then(res => setResponse(res))
      .catch(err => setError(err.message || 'Failed to process AI query.'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-container-padding flex flex-col gap-6">
      <div className="bg-surface p-6 border border-outline-variant">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[28px]">psychology</span>
          <div>
            <h1 className="font-display text-display text-on-surface">AI Business Intelligence & Insights</h1>
            <p className="font-body-sm text-on-surface-variant">
              Ask natural-language business questions. The backend executes controlled queries against verified SAP data and explains results with Groq AI.
            </p>
          </div>
        </div>
      </div>

      {/* SAMPLE PROMPTS & SEARCH BAR */}
      <div className="bg-surface p-6 border border-outline-variant flex flex-col gap-4">
        <label className="font-label text-label text-on-surface-variant uppercase tracking-wider">
          Suggested Business Queries
        </label>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q) => (
            <button
              key={q}
              onClick={() => { setQuestion(q); handleQuery(q); }}
              className="bg-surface-container hover:bg-surface-container-highest border border-outline-variant px-3 py-1.5 font-data-sm text-data-sm text-primary transition-colors"
            >
              "{q}"
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleQuery(); }} className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="Type your inventory or procurement question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 bg-surface-container border border-outline-variant text-on-surface font-data-sm px-4 py-2.5 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary-container text-on-primary font-label text-[11px] uppercase tracking-wider px-6 py-2.5 font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>
              send
            </span>
            <span>{loading ? 'Analyzing...' : 'Ask AI'}</span>
          </button>
        </form>
        {error && <div className="text-error font-data-sm">{error}</div>}
      </div>

      {/* ANSWER OUTPUT CARD */}
      {response && (
        <div className="bg-surface p-6 border-2 border-primary/40 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-outline-variant pb-3">
            <h2 className="font-headline text-headline text-on-surface font-bold">
              AI Natural-Language Explanation
            </h2>
            <span className="font-data-sm text-data-sm text-primary border border-primary/30 px-2 py-0.5 font-mono">
              Engine: {response.provider}
            </span>
          </div>

          <div className="bg-primary-container/10 p-4 border border-primary/20 text-body-sm text-on-surface font-body-sm leading-relaxed">
            {response.answer}
          </div>

          <div>
            <h3 className="font-label text-label text-on-surface-variant uppercase tracking-widest mb-2">
              Verified Underlying SAP Source Data
            </h3>
            <pre className="bg-surface-container p-4 border border-outline-variant text-on-surface font-data-sm text-[12px] overflow-x-auto">
              {JSON.stringify(response.source_data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
