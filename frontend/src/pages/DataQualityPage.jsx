import React, { useState, useEffect } from 'react';
import { getDataQualityReport } from '../api/analytics';

export default function DataQualityPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDataQualityReport()
      .then(res => setReport(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !report) {
    return <div className="p-8 text-center font-data-sm text-on-surface-variant">Running data quality checks...</div>;
  }

  const { overall_score, total_records_checked, checks } = report;

  return (
    <div className="flex-1 overflow-y-auto bg-background p-container-padding flex flex-col gap-6">
      <div className="bg-surface p-6 border border-outline-variant flex justify-between items-center">
        <div>
          <h1 className="font-display text-display text-on-surface">SAP Data Quality Audit</h1>
          <p className="font-body-sm text-on-surface-variant">
            Automated evaluation of SAP master data integrity, negative inventory checks, and valuation completeness.
          </p>
        </div>
        <div className="text-right">
          <div className="font-label text-label text-on-surface-variant uppercase">Overall Data Quality Score</div>
          <div className="font-display text-display font-mono text-primary font-bold text-3xl">{overall_score}%</div>
        </div>
      </div>

      <div className="bg-surface border border-outline-variant p-6 flex flex-col gap-4">
        <h2 className="font-headline text-headline text-on-surface uppercase tracking-widest border-b border-outline-variant pb-2">
          Validation Rule Executions ({total_records_checked} Records Evaluated)
        </h2>

        <div className="flex flex-col gap-3">
          {checks.map((c, i) => (
            <div key={i} className="p-4 border border-outline-variant bg-surface-container flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${c.passed ? 'text-primary' : 'text-error'}`}>
                    {c.passed ? 'check_circle' : 'warning'}
                  </span>
                  <span className="font-headline text-headline text-on-surface font-bold">{c.rule_name}</span>
                  <span className="font-label text-[10px] uppercase border border-outline px-1.5 py-0.5 text-outline">
                    {c.category}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{c.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right font-data-sm">
                  {c.failed_count > 0 ? (
                    <span className="text-error font-bold">{c.failed_count} Corrupted Records</span>
                  ) : (
                    <span className="text-primary font-bold">0 Violations</span>
                  )}
                </div>
                <span className={`px-3 py-1 border font-label text-[11px] uppercase tracking-wider ${
                  c.passed ? 'text-primary border-primary/40 bg-primary-container/20' : 'text-error border-error/40 bg-error-container/20'
                }`}>
                  {c.passed ? 'PASSED' : 'ACTION REQUIRED'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
