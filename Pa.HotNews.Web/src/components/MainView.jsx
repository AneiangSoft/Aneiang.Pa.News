import { Skeleton } from 'antd';
import LlmRanking from './LlmRanking';
import NewsGrid from './NewsGrid';

function MainView({
  view,
  isFeatureEnabled,
  isFirstLoading,
  siteTitle,
  theme,
  // NewsGrid props
  newsGridProps,
}) {
  const llmEnabled = isFeatureEnabled('llmRanking');
  const showLlm = view === 'llm' && llmEnabled;

  if (isFirstLoading) {
    return (
      <div className="global-skeleton">
        <div className="global-skeleton-grid">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="global-skeleton-card">
              <div className="global-skeleton-card-head">
                <Skeleton.Input active size="small" style={{ width: 140 }} />
                <Skeleton.Input active size="small" style={{ width: 80 }} />
              </div>
              <Skeleton active title={false} paragraph={{ rows: 8 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: showLlm ? 'none' : 'block' }}>
        <NewsGrid {...newsGridProps} />
      </div>

      {llmEnabled ? (
        <div style={{ display: showLlm ? 'block' : 'none' }}>
          <LlmRanking siteTitle={siteTitle} theme={theme} />
        </div>
      ) : null}
    </>
  );
}

export default MainView;
