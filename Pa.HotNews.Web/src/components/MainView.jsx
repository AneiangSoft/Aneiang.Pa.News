import { Spin } from 'antd';
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
  if (view === 'llm' && isFeatureEnabled('llmRanking')) {
    return <LlmRanking siteTitle={siteTitle} theme={theme} />;
  }

  if (isFirstLoading) {
    return (
      <div className="spin-container">
        <Spin size="large" />
      </div>
    );
  }

  return <NewsGrid {...newsGridProps} />;
}

export default MainView;
