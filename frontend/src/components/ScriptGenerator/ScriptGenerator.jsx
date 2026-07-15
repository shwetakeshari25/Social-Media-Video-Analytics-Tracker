import React, { useState, useEffect } from 'react';

export default function ScriptGenerator({ selectedIds, scriptLength, onBackToDashboard, scriptData, analysisData, loading, error }) {
  const [activeStep, setActiveStep] = useState(0);
  const [showScript, setShowScript] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [selectedAnalysisTab, setSelectedAnalysisTab] = useState(0);

  const loadingSteps = [
    'Reading Selected Videos...',
    'Analyzing Hooks...',
    'Finding Common Pattern...',
    'Generating Script...'
  ];

  // Visual simulation of progress steps
  useEffect(() => {
    if (loading) {
      setActiveStep(0);
      setShowScript(false);
      
      const interval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev < loadingSteps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 1200);

      return () => clearInterval(interval);
    }
  }, [loading]);

  // Once loading finishes and we are at the final step, show the script
  useEffect(() => {
    if (!loading && scriptData) {
      // Hold briefly at the final step to make it feel deliberate and premium
      const timeout = setTimeout(() => {
        setShowScript(true);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [loading, scriptData]);

  const handleCopy = () => {
    if (!scriptData) return;

    const formattedText = `
TITLE: ${scriptData.title}

BEST HOOK:
${scriptData.bestHook}

INTRODUCTION:
${scriptData.introduction}

MAIN CONTENT:
${scriptData.mainContent}

STORY / CASE STUDY:
${scriptData.story}

CALL TO ACTION:
${scriptData.callToAction}

ENDING:
${scriptData.ending}

----------------------------------------------------
SOCIAL MEDIA CAPTION:
${scriptData.caption}

HASHTAGS:
${scriptData.hashtags}
    `.trim();

    navigator.clipboard.writeText(formattedText).then(
      () => {
        setCopySuccess('Copied to clipboard! ✓');
        setTimeout(() => setCopySuccess(''), 3000);
      },
      (err) => {
        console.error('Failed to copy text: ', err);
      }
    );
  };

  const handleDownloadPDF = () => {
    if (!scriptData) return;

    // Create a new iframe/window for printing to avoid messing up main dashboard view
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${scriptData.title}</title>
          <style>
            body {
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #3E3125;
              padding: 40px;
              line-height: 1.6;
              background-color: #FFFDFB;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #E6DDD3;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            h1 { font-size: 26px; color: #A67C52; margin: 0; }
            .meta { font-size: 14px; color: #7B6A58; margin-top: 8px; }
            .section { margin-bottom: 24px; }
            .section-title { font-weight: bold; color: #A67C52; font-size: 14px; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #E6DDD3; padding-bottom: 4px; }
            .content { font-size: 15px; white-space: pre-line; }
            .footer { border-top: 1px solid #E6DDD3; margin-top: 40px; padding-top: 20px; font-size: 12px; text-align: center; color: #7B6A58; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${scriptData.title}</h1>
            <div class="meta">AI Generated Script • Length: ${scriptLength} • Social Media Tracker</div>
          </div>
          
          <div class="section">
            <div class="section-title">Best Hook</div>
            <div class="content">${scriptData.bestHook}</div>
          </div>

          <div class="section">
            <div class="section-title">Introduction</div>
            <div class="content">${scriptData.introduction}</div>
          </div>

          <div class="section">
            <div class="section-title">Main Content</div>
            <div class="content">${scriptData.mainContent}</div>
          </div>

          <div class="section">
            <div class="section-title">Story / Case Study</div>
            <div class="content">${scriptData.story}</div>
          </div>

          <div class="section">
            <div class="section-title">Call To Action</div>
            <div class="content">${scriptData.callToAction}</div>
          </div>

          <div class="section">
            <div class="section-title">Ending</div>
            <div class="content">${scriptData.ending}</div>
          </div>

          <div class="section" style="page-break-before: always;">
            <div class="section-title">Social Caption</div>
            <div class="content">${scriptData.caption}</div>
          </div>

          <div class="section">
            <div class="section-title">Hashtags</div>
            <div class="content" style="color: #7B6A58;">${scriptData.hashtags}</div>
          </div>

          <div class="footer">
            Generated with Social Media Video Analytics Tracker & AI Script Generator
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    // Delay slightly to ensure browser rendering before print dialog opens
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleDownloadDOCX = () => {
    if (!scriptData) return;

    // Build Word-compatible HTML file
    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${scriptData.title}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.5; color: #3E3125; }
          h1 { color: #A67C52; font-size: 24pt; border-bottom: 2px solid #E6DDD3; padding-bottom: 6px; }
          h2 { color: #A67C52; font-size: 16pt; margin-top: 18pt; border-bottom: 1px solid #E6DDD3; }
          p { font-size: 11pt; margin-bottom: 10pt; }
        </style>
      </head>
      <body>
        <h1>${scriptData.title}</h1>
        <p><strong>Script Length:</strong> ${scriptLength}</p>
        <p><strong>Date Generated:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h2>BEST HOOK</h2>
        <p>${scriptData.bestHook.replace(/\n/g, '<br>')}</p>
        
        <h2>INTRODUCTION</h2>
        <p>${scriptData.introduction.replace(/\n/g, '<br>')}</p>
        
        <h2>MAIN CONTENT</h2>
        <p>${scriptData.mainContent.replace(/\n/g, '<br>')}</p>
        
        <h2>STORY</h2>
        <p>${scriptData.story.replace(/\n/g, '<br>')}</p>
        
        <h2>CALL TO ACTION</h2>
        <p>${scriptData.callToAction.replace(/\n/g, '<br>')}</p>
        
        <h2>ENDING</h2>
        <p>${scriptData.ending.replace(/\n/g, '<br>')}</p>
        
        <h2>SOCIAL MEDIA CAPTION</h2>
        <p>${scriptData.caption.replace(/\n/g, '<br>')}</p>
        
        <h2>HASHTAGS</h2>
        <p style="color:#7B6A58;">${scriptData.hashtags}</p>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + docHtml], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${scriptData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-script.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderAnalysisSection = () => {
    if (!analysisData) return null;

    const { individual = [], combined = {} } = analysisData;

    return (
      <div className="card animate-fade-in" style={styles.analysisCard}>
        <h3 style={styles.analysisHeader}>📊 Video Intelligence & Analysis Summary</h3>
        <p style={styles.analysisSub}>Detailed pattern extraction and individual insights from selected videos</p>

        {/* Tab switcher */}
        <div style={styles.tabBar}>
          <button
            onClick={() => setSelectedAnalysisTab(0)}
            style={{
              ...styles.tabButton,
              borderBottomColor: selectedAnalysisTab === 0 ? 'var(--primary-color)' : 'transparent',
              color: selectedAnalysisTab === 0 ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: selectedAnalysisTab === 0 ? '700' : '500'
            }}
          >
            Combined Summary
          </button>
          {individual.map((ind, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedAnalysisTab(idx + 1)}
              style={{
                ...styles.tabButton,
                borderBottomColor: selectedAnalysisTab === idx + 1 ? 'var(--primary-color)' : 'transparent',
                color: selectedAnalysisTab === idx + 1 ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: selectedAnalysisTab === idx + 1 ? '700' : '500'
              }}
            >
              Video #{idx + 1}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={styles.tabContent}>
          {selectedAnalysisTab === 0 ? (
            <div style={styles.combinedAnalysisGrid}>
              <div style={styles.analysisItem}>
                <span style={styles.analysisItemLabel}>💡 Common Ideas & Topics</span>
                <p style={styles.analysisItemValue}>{combined.commonIdeas}</p>
              </div>
              <div style={styles.analysisItem}>
                <span style={styles.analysisItemLabel}>🎭 Content Style & Speaking Style</span>
                <p style={styles.analysisItemValue}>{combined.contentStyle}</p>
              </div>
              <div style={styles.analysisItem}>
                <span style={styles.analysisItemLabel}>👥 Target Audience Interest</span>
                <p style={styles.analysisItemValue}>{combined.audienceInterest}</p>
              </div>
            </div>
          ) : (
            (() => {
              const video = individual[selectedAnalysisTab - 1];
              if (!video) return null;
              return (
                <div style={styles.individualAnalysisGrid}>
                  <div style={{ gridColumn: '1 / -1', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, color: 'var(--text-color)', fontSize: '15px' }}>{video.title}</h4>
                  </div>
                  <div style={styles.analysisItem}>
                    <span style={styles.analysisItemLabel}>Main Topic</span>
                    <p style={styles.analysisItemValue}>{video.mainTopic}</p>
                  </div>
                  <div style={styles.analysisItem}>
                    <span style={styles.analysisItemLabel}>Speaking Style</span>
                    <p style={styles.analysisItemValue}>{video.speakingStyle}</p>
                  </div>
                  <div style={styles.analysisItem}>
                    <span style={styles.analysisItemLabel}>Tone</span>
                    <p style={styles.analysisItemValue}>{video.tone}</p>
                  </div>
                  <div style={styles.analysisItem}>
                    <span style={styles.analysisItemLabel}>Audience Type</span>
                    <p style={styles.analysisItemValue}>{video.audienceType}</p>
                  </div>
                  <div style={styles.analysisItem}>
                    <span style={styles.analysisItemLabel}>Structure</span>
                    <p style={styles.analysisItemValue}>{video.structure}</p>
                  </div>
                  <div style={styles.analysisItem}>
                    <span style={styles.analysisItemLabel}>Key Points</span>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-color)', fontSize: '14px' }}>
                      {(video.keyPoints || []).map((pt, pIdx) => (
                        <li key={pIdx} style={{ marginBottom: '4px' }}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ ...styles.analysisItem, gridColumn: '1 / -1' }}>
                    <span style={styles.analysisItemLabel}>Description</span>
                    <p style={{ ...styles.analysisItemValue, fontSize: '13px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>{video.description}</p>
                  </div>
                  <div style={{ ...styles.analysisItem, gridColumn: '1 / -1' }}>
                    <span style={styles.analysisItemLabel}>Transcript (if available)</span>
                    <p style={{ ...styles.analysisItemValue, fontSize: '13px', color: 'var(--text-secondary)' }}>{video.transcript}</p>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
    );
  };

  // 1. Error view
  if (error) {
    return (
      <div style={styles.container} className="animate-fade-in">
        <div className="card" style={styles.errorCard}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3>Generation Failed</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
            {error}
          </p>
          <button className="btn btn-primary" onClick={onBackToDashboard}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // 2. Loading view (Step-by-step progress checklist)
  if (loading || !showScript) {
    return (
      <div style={styles.container} className="animate-fade-in">
        <div className="card" style={styles.loadingCard}>
          <h2 style={styles.loadingTitle}>Analyzing & Compiling Videos...</h2>
          <p style={styles.loadingSubtitle}>AI Engine is structuring your custom viral script</p>

          <div style={styles.stepsContainer}>
            {loadingSteps.map((step, index) => {
              const isDone = activeStep > index;
              const isActive = activeStep === index;
              
              return (
                <div key={index} style={{
                  ...styles.stepRow,
                  opacity: isActive || isDone ? 1 : 0.4
                }}>
                  <div style={{
                    ...styles.stepIndicator,
                    backgroundColor: isDone ? 'var(--success-color)' :
                                     isActive ? 'var(--primary-color)' : 'transparent',
                    borderColor: isDone ? 'var(--success-color)' :
                                 isActive ? 'var(--primary-color)' : 'var(--border-color)',
                  }}>
                    {isDone ? (
                      <span style={styles.checkmark}>✓</span>
                    ) : isActive ? (
                      <span className="spinner" style={styles.loaderSpinner}></span>
                    ) : null}
                  </div>
                  <span style={{
                    ...styles.stepText,
                    fontWeight: isActive || isDone ? '700' : '400',
                    color: isActive ? 'var(--primary-color)' : 'var(--text-color)'
                  }}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={styles.progressBarWrapper}>
            <div style={{
              ...styles.progressBarFill,
              width: `${((activeStep + (loading ? 0.5 : 1)) / loadingSteps.length) * 100}%`
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Complete script view
  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={onBackToDashboard} style={styles.backBtn}>
            ← Back to Dashboard
          </button>
          <h2 style={styles.title}>{scriptData.title}</h2>
          <p style={styles.subtitle}>Derived from selected analytics • Length: {scriptLength}</p>
        </div>

        <div style={styles.headerRight}>
          <button onClick={handleCopy} className="btn btn-secondary">
            📋 {copySuccess || 'Copy Script'}
          </button>
          <button onClick={handleDownloadPDF} className="btn btn-secondary">
            📄 Download PDF
          </button>
          <button onClick={handleDownloadDOCX} className="btn btn-primary">
            📝 Download DOCX
          </button>
        </div>
      </div>

      {renderAnalysisSection()}

      <div style={styles.scriptLayout}>
        {/* Left main script contents */}
        <div style={styles.mainScript}>
          {[
            { key: 'bestHook', label: '🪝 Hook' },
            { key: 'introduction', label: '👋 Introduction' },
            { key: 'mainContent', label: '📖 Main Content' },
            { key: 'story', label: '💡 Examples & Case Study' },
            { key: 'callToAction', label: '📣 Call to Action' },
            { key: 'ending', label: '🚪 Sign-off Ending' }
          ].map((sec) => (
            <div key={sec.key} className="card" style={styles.sectionCard}>
              <h4 style={styles.scriptSectionHeader}>{sec.label}</h4>
              <div style={styles.scriptSectionText}>{scriptData[sec.key]}</div>
            </div>
          ))}
        </div>

        {/* Right side social caption details */}
        <div style={styles.sidebar}>
          <div className="card" style={styles.sidebarCard}>
            <h4 style={styles.sidebarTitle}>💬 Generated Social Caption</h4>
            <div style={styles.captionText}>{scriptData.caption}</div>
            
            <div style={styles.sidebarDivider}></div>
            
            <h4 style={styles.sidebarTitle}>#️⃣ Optimized Hashtags</h4>
            <div style={styles.hashtagsText}>{scriptData.hashtags}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '24px',
    marginBottom: '32px',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  headerRight: {
    display: 'flex',
    gap: '12px',
    alignSelf: 'center',
    flexWrap: 'wrap',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary-color)',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '13px',
    alignSelf: 'flex-start',
    marginBottom: '8px',
    fontFamily: 'var(--font-family)',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text-color)',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  errorCard: {
    textAlign: 'center',
    padding: '48px',
    maxWidth: '500px',
    margin: '80px auto',
  },
  loadingCard: {
    maxWidth: '540px',
    margin: '80px auto',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 8px 30px rgba(62, 49, 37, 0.08)',
  },
  loadingTitle: {
    fontSize: '20px',
    fontWeight: '800',
    marginBottom: '6px',
  },
  loadingSubtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '32px',
  },
  stepsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    textAlign: 'left',
    maxWidth: '300px',
    margin: '0 auto 32px auto',
  },
  stepRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'opacity var(--transition-fast)',
  },
  stepIndicator: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  checkmark: {
    color: '#FFFDFB',
    fontSize: '12px',
    fontWeight: '800',
  },
  loaderSpinner: {
    display: 'inline-block',
    width: '12px',
    height: '12px',
    border: '2px solid rgba(166, 124, 82, 0.2)',
    borderTopColor: 'var(--primary-color)',
    borderRadius: '50%',
  },
  stepText: {
    fontSize: '14px',
  },
  progressBarWrapper: {
    height: '6px',
    backgroundColor: 'var(--border-color)',
    borderRadius: '3px',
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'var(--primary-color)',
    transition: 'width 0.4s ease',
  },
  scriptLayout: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
    alignItems: 'flex-start',
  },
  mainScript: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sectionCard: {
    padding: '24px',
  },
  scriptSectionHeader: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--primary-color)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '12px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px',
  },
  scriptSectionText: {
    fontSize: '15px',
    color: 'var(--text-color)',
    lineHeight: '1.7',
    whiteSpace: 'pre-wrap',
  },
  sidebar: {
    position: 'sticky',
    top: '24px',
  },
  sidebarCard: {
    padding: '24px',
    boxShadow: '0 4px 20px rgba(62, 49, 37, 0.04)',
  },
  sidebarTitle: {
    fontSize: '14px',
    fontWeight: '700',
    marginBottom: '12px',
    color: 'var(--text-color)',
  },
  captionText: {
    fontSize: '13px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    backgroundColor: 'var(--bg-color)',
    padding: '16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  sidebarDivider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '20px 0',
  },
  hashtagsText: {
    fontSize: '13px',
    color: 'var(--primary-color)',
    fontWeight: '600',
    lineHeight: '1.6',
    backgroundColor: 'var(--bg-color)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  analysisCard: {
    padding: '24px',
    marginBottom: '28px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 4px 15px rgba(62, 49, 37, 0.03)',
  },
  analysisHeader: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-color)',
    margin: '0 0 4px 0',
  },
  analysisSub: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: '0 0 20px 0',
  },
  tabBar: {
    display: 'flex',
    gap: '12px',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '20px',
    overflowX: 'auto',
  },
  tabButton: {
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    padding: '8px 16px 12px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'var(--font-family)',
    whiteSpace: 'nowrap',
    transition: 'all var(--transition-fast)',
  },
  tabContent: {
    padding: '4px 0',
  },
  combinedAnalysisGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  individualAnalysisGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
  },
  analysisItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  analysisItemLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--primary-color)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  analysisItemValue: {
    fontSize: '14px',
    color: 'var(--text-color)',
    margin: 0,
    lineHeight: '1.5',
  },
};
