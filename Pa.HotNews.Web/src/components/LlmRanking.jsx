import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Divider,
  Grid,
  Input,
  Segmented,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import {
  CameraOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  SearchOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { getLlmModelsRanking } from '../services/api';
import { nodeToPngBlob, downloadBlob } from '../utils/poster';
import Poster from './Poster';
import PosterModal from './PosterModal';
import './LlmRanking.css';

const { useBreakpoint } = Grid;

const num = v => (v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v));

const fmt = (v, digits = 2) => {
  const n = num(v);
  if (n === null) return '-';
  return n.toFixed(digits);
};

const fmtUsd = v => {
  const n = num(v);
  if (n === null) return '-';
  return `$${n.toFixed(2)}`;
};

const scoreColor = v => {
  const n = num(v);
  if (n === null) return 'var(--text-secondary)';
  if (n >= 70) return '#2f54eb';
  if (n >= 60) return '#1677ff';
  if (n >= 50) return '#13c2c2';
  return 'var(--text-secondary)';
};

const ScoreCell = ({ value }) => {
  const n = num(value);
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: scoreColor(n) }}>
      {fmt(n, 1)}
    </span>
  );
};

const LlmRanking = ({ siteTitle, theme = 'dark' }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [raw, setRaw] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 搜索：匹配 name / slug / creator
  const [query, setQuery] = useState('');

  // 分页（受控）：修复“每页条数”切换无效问题
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // 列模式：移动端默认精简；桌面端默认完整
  const [columnMode, setColumnMode] = useState(isMobile ? 'compact' : 'full');
  useEffect(() => {
    // 当屏幕尺寸变化时，自动切换默认模式
    setColumnMode(isMobile ? 'compact' : 'full');
  }, [isMobile]);

  // 海报
  const posterRef = useRef();
  const [posterVisible, setPosterVisible] = useState(false);
  const [posterLoading, setPosterLoading] = useState(false);

  const handleGeneratePoster = () => {
    setPosterVisible(true);
  };

  const handleDownloadPoster = async () => {
    if (!posterRef.current) return;
    setPosterLoading(true);
    try {
      const themeBgMap = {
        light: '#f6f7fb',
        warm: '#12110f',
        dark: '#0b1220',
      };

      const blob = await nodeToPngBlob(posterRef.current, {
        pixelRatio: 2,
        backgroundColor: themeBgMap[theme] || themeBgMap.dark,
      });
      await downloadBlob(blob, `llm-ranking-poster-${theme || 'dark'}-${Date.now()}.png`);
    } catch (e) {
      console.error('生成海报失败', e);
    } finally {
      setPosterLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;

    return (data || []).filter(item => {
      const name = String(item?.name || '').toLowerCase();
      const slug = String(item?.slug || '').toLowerCase();
      const creator = String(item?.model_creator?.name || '').toLowerCase();
      return name.includes(q) || slug.includes(q) || creator.includes(q);
    });
  }, [data, query]);

  // 搜索/列模式变化后，回到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [query, columnMode]);

  const columns = useMemo(() => {
    const modelCol = {
      title: '模型',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: isMobile ? 240 : 320,
      render: (text, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{text || '-'}</span>
            {row?.release_date ? (
              <Tag color="blue" style={{ marginInlineEnd: 0 }}>
                {row.release_date}
              </Tag>
            ) : null}
          </div>
          {!isMobile && row?.slug ? (
            <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.2 }}>Slug：{row.slug}</div>
          ) : null}
        </div>
      ),
    };

    const creatorCol = {
      title: '创建者',
      key: 'creator',
      width: 140,
      render: (_t, row) => {
        const c = row?.model_creator;
        return c?.name ? <Tag>{c.name}</Tag> : '-';
      },
    };

    const intelligenceCol = {
      title: '智能指数',
      key: 'ai_intelligence',
      width: 120,
      align: 'right',
      sorter: (a, b) =>
        (num(a?.evaluations?.artificial_analysis_intelligence_index) ?? -Infinity) -
        (num(b?.evaluations?.artificial_analysis_intelligence_index) ?? -Infinity),
      defaultSortOrder: 'descend',
      render: (_t, row) => (
        <ScoreCell value={row?.evaluations?.artificial_analysis_intelligence_index} />
      ),
    };

    const codingCol = {
      title: '编程指数',
      key: 'ai_coding',
      width: 120,
      align: 'right',
      sorter: (a, b) =>
        (num(a?.evaluations?.artificial_analysis_coding_index) ?? -Infinity) -
        (num(b?.evaluations?.artificial_analysis_coding_index) ?? -Infinity),
      render: (_t, row) => <ScoreCell value={row?.evaluations?.artificial_analysis_coding_index} />,
    };

    const mathCol = {
      title: '数学指数',
      key: 'ai_math',
      width: 120,
      align: 'right',
      sorter: (a, b) =>
        (num(a?.evaluations?.artificial_analysis_math_index) ?? -Infinity) -
        (num(b?.evaluations?.artificial_analysis_math_index) ?? -Infinity),
      render: (_t, row) => <ScoreCell value={row?.evaluations?.artificial_analysis_math_index} />,
    };

    const blendedPriceCol = {
      title: '综合价格 (USD/1M)',
      key: 'price_blended',
      width: 170,
      align: 'right',
      sorter: (a, b) =>
        (num(a?.pricing?.price_1m_blended_3_to_1) ?? Infinity) -
        (num(b?.pricing?.price_1m_blended_3_to_1) ?? Infinity),
      render: (_t, row) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
          {fmtUsd(row?.pricing?.price_1m_blended_3_to_1)}
        </span>
      ),
    };

    const pricingDetailCol = {
      title: '价格明细 (USD/1M)',
      key: 'pricing',
      width: 260,
      render: (_t, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>综合</span>
            <span style={{ fontWeight: 700 }}>{fmtUsd(row?.pricing?.price_1m_blended_3_to_1)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>输入</span>
            <span style={{ fontWeight: 600 }}>{fmtUsd(row?.pricing?.price_1m_input_tokens)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>输出</span>
            <span style={{ fontWeight: 600 }}>{fmtUsd(row?.pricing?.price_1m_output_tokens)}</span>
          </div>
        </div>
      ),
      sorter: (a, b) =>
        (num(a?.pricing?.price_1m_blended_3_to_1) ?? Infinity) -
        (num(b?.pricing?.price_1m_blended_3_to_1) ?? Infinity),
    };

    const speedCol = {
      title: '输出速度 (tokens/s)',
      key: 'speed',
      width: 170,
      align: 'right',
      sorter: (a, b) =>
        (num(a?.median_output_tokens_per_second) ?? -Infinity) -
        (num(b?.median_output_tokens_per_second) ?? -Infinity),
      render: (_t, row) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
          {fmt(row?.median_output_tokens_per_second, 1)}
        </span>
      ),
    };

    const perfDetailCol = {
      title: '速度/延迟',
      key: 'perf',
      width: 240,
      render: (_t, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>输出速度</span>
            <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {fmt(row?.median_output_tokens_per_second, 1)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>首 token</span>
            <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {fmt(row?.median_time_to_first_token_seconds, 3)}s
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>首答完成</span>
            <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {fmt(row?.median_time_to_first_answer_token, 3)}s
            </span>
          </div>
        </div>
      ),
      sorter: (a, b) =>
        (num(a?.median_output_tokens_per_second) ?? -Infinity) -
        (num(b?.median_output_tokens_per_second) ?? -Infinity),
    };

    const base = [modelCol, creatorCol, intelligenceCol];

    if (columnMode === 'compact') {
      return [...base, blendedPriceCol, speedCol];
    }

    return [...base, codingCol, mathCol, pricingDetailCol, perfDetailCol];
  }, [columnMode, isMobile]);

  const topStats = useMemo(() => {
    if (!Array.isArray(data) || !data.length) return null;

    // 按智能指数排序，取第一名
    const sorted = [...data].sort(
      (a, b) =>
        (num(b?.evaluations?.artificial_analysis_intelligence_index) ?? -Infinity) -
        (num(a?.evaluations?.artificial_analysis_intelligence_index) ?? -Infinity)
    );

    const top = sorted[0];
    const bestPrice = [...data]
      .map(x => num(x?.pricing?.price_1m_blended_3_to_1))
      .filter(x => x !== null)
      .sort((a, b) => a - b)[0];

    const bestSpeed = [...data]
      .map(x => num(x?.median_output_tokens_per_second))
      .filter(x => x !== null)
      .sort((a, b) => b - a)[0];

    return {
      topModelName: top?.name || '-',
      topScore: top?.evaluations?.artificial_analysis_intelligence_index ?? null,
      bestPrice,
      bestSpeed,
      count: data.length,
    };
  }, [data]);

  const posterItems = useMemo(() => {
    if (!Array.isArray(data)) return [];
    // 按智能指数排序
    const sorted = [...data].sort(
      (a, b) =>
        (num(b?.evaluations?.artificial_analysis_intelligence_index) ?? -Infinity) -
        (num(a?.evaluations?.artificial_analysis_intelligence_index) ?? -Infinity)
    );
    return sorted.slice(0, 10).map(item => ({ ...item, title: item.name, url: item.slug }));
  }, [data]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getLlmModelsRanking();
      setRaw(result);

      // 你截图的结构：{ status: 200, prompt_options: {...}, data: [ ... ] }
      const list = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
      setData(list);

      if (!list.length) {
        setError('接口已请求成功，但解析到的数据列表为空：请确认返回结构中 data 是否为数组。');
      }
    } catch (err) {
      setError('获取数据失败，请稍后重试。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // React 18+ StrictMode 在开发环境会触发 effect 二次执行，这里用 ref 避免重复请求
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '70px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert
          title="错误"
          description={
            <div>
              <div style={{ marginBottom: 8 }}>{error}</div>
              {raw ? (
                <pre
                  style={{
                    maxHeight: 220,
                    overflow: 'auto',
                    background: 'rgba(0,0,0,0.04)',
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
                  {JSON.stringify(raw, null, 2)}
                </pre>
              ) : null}
            </div>
          }
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={fetchData}>
              重试
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="llm-page">
      <Card className="llm-shell" bordered={false} styles={{ body: { padding: 18 } }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <TrophyOutlined style={{ color: '#faad14' }} />
              <h2 style={{ margin: 0 }}>大语言模型排行榜</h2>
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              数据来源：
              <a
                href="https://artificialanalysis.ai/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: 4 }}
              >
                https://artificialanalysis.ai/
              </a>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <Input
                allowClear
                value={query}
                onChange={e => setQuery(e.target.value)}
                prefix={<SearchOutlined />}
                placeholder="搜索：模型名 / Slug / 创建者"
                style={{ width: isMobile ? 260 : 320 }}
              />

              <Segmented
                value={columnMode}
                onChange={setColumnMode}
                options={[
                  { label: '精简列', value: 'compact' },
                  { label: '完整列', value: 'full' },
                ]}
              />
            </div>
          </div>

          <Space wrap>
            <Tooltip title="刷新数据">
              <Button icon={<SyncOutlined />} onClick={fetchData} loading={loading}>
                刷新
              </Button>
            </Tooltip>
            <Tooltip title="生成分享海报">
              <Button icon={<CameraOutlined />} onClick={handleGeneratePoster}>
                生成海报
              </Button>
            </Tooltip>
          </Space>
        </div>

        {topStats ? (
          <>
            <Divider style={{ margin: '14px 0 12px' }} />
            <div className="llm-stats-grid">
              <Card size="small" className="llm-stat-card llm-stat-card--gold" style={{ borderRadius: 12 }}>
                <Statistic
                  title="当前榜首（按智能指数）"
                  value={topStats.topModelName}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ fontSize: 16, fontWeight: 700 }}
                />
                <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                  智能指数：<b style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(topStats.topScore, 1)}</b>
                </div>
              </Card>

              <Card size="small" className="llm-stat-card llm-stat-card--green" style={{ borderRadius: 12 }}>
                <Statistic
                  title="最低综合价格（USD/1M）"
                  value={topStats.bestPrice === undefined ? '-' : fmtUsd(topStats.bestPrice)}
                  prefix={<DollarOutlined />}
                  valueStyle={{ fontSize: 16, fontWeight: 700 }}
                />
                <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                  注：综合价格为 blended（3:1）
                </div>
              </Card>

              <Card size="small" className="llm-stat-card llm-stat-card--blue" style={{ borderRadius: 12 }}>
                <Statistic
                  title="最快中位输出速度（tokens/s）"
                  value={topStats.bestSpeed === undefined ? '-' : fmt(topStats.bestSpeed, 1)}
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ fontSize: 16, fontWeight: 700 }}
                />
                <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                  样本数：<b style={{ fontVariantNumeric: 'tabular-nums' }}>{topStats.count}</b>
                </div>
              </Card>

              <Card size="small" className="llm-stat-card llm-stat-card--purple" style={{ borderRadius: 12 }}>
                <Statistic
                  title="延迟说明"
                  value="首 token / 首答完成"
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ fontSize: 16, fontWeight: 700 }}
                />
                <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                  单位：秒（s）
                </div>
              </Card>
            </div>
          </>
        ) : null}

        <Divider style={{ margin: '14px 0 12px' }} />

        <div className="llm-table-wrap">
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey={row => row.id || row.slug || row.name}
            scroll={{ x: columnMode === 'compact' ? 980 : 1200 }}
            pagination={{
              current: currentPage,
              pageSize,
              showSizeChanger: true,
              showQuickJumper: true,
              responsive: true,
              pageSizeOptions: [10, 20, 50, 100].map(String),
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`,
              size: isMobile ? 'small' : 'default',
              locale: {
                items_per_page: '条/页',
                jump_to: '跳至',
                page: '页',
              },
              onChange: (page, size) => {
                setCurrentPage(page);
                if (size && size !== pageSize) setPageSize(size);
              },
              onShowSizeChange: (_page, size) => {
                setPageSize(size);
                setCurrentPage(1);
              },
            }}
            bordered={false}
            size="middle"
            rowClassName={(_record, index) => (index % 2 === 1 ? 'llm-row-alt' : '')}
          />
        </div>

        {isMobile && columnMode === 'compact' ? (
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
            提示：移动端默认展示精简列，你可以切换到“完整列”查看更多指标。
          </div>
        ) : null}
      </Card>

      <PosterModal
        open={posterVisible}
        onClose={() => setPosterVisible(false)}
        onDownload={handleDownloadPoster}
        downloading={posterLoading}
        width={540}
      >
        <Poster
          ref={posterRef}
          title="大语言模型排行榜"
          updatedTimeText={new Date().toLocaleString()}
          items={posterItems}
          siteText={siteTitle || 'Aneiang 热榜聚合'}
          qrText={window.location.href}
          theme={theme}
          size="mobile"
          renderItem={(it, _idx, themeTokens) => {
            const score = num(it?.evaluations?.artificial_analysis_intelligence_index);
            const price = num(it?.pricing?.price_1m_blended_3_to_1);
            const speed = num(it?.median_output_tokens_per_second);

            return (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, minWidth: 0, width: '100%' }}>
                  {/* 左侧：模型信息 */}
                  <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 16,
                        lineHeight: 1.32,
                        fontWeight: 750,
                        wordBreak: 'break-word',
                      }}
                    >
                      {it?.name || it?.title || '-'}
                    </div>

                    {(it?.model_creator?.name || it?.release_date) ? (
                      <div
                        style={{
                          display: 'flex',
                          gap: 10,
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          fontSize: 12,
                          color: themeTokens.sub,
                          marginTop: 6,
                        }}
                      >
                        {it?.model_creator?.name ? <span><b>{it.model_creator.name}</b></span> : null}
                        {it?.release_date ? <span style={{ opacity: 0.9 }}>{it.release_date}</span> : null}
                      </div>
                    ) : null}
                  </div>

                  {/* 右侧：指标（全部靠右，列对齐） */}
                  <div
                    style={{
                      flex: '0 0 240px',
                      width: 240,
                      fontSize: 12,
                      color: themeTokens.sub,
                      lineHeight: 1.35,
                      fontVariantNumeric: 'tabular-nums',
                      display: 'grid',
                      gridTemplateColumns: '52px 88px',
                      gap: '4px 10px',
                      alignItems: 'center',
                      justifyContent: 'end',
                      justifyItems: 'end',
                      textAlign: 'right',
                      minWidth: 160,
                    }}
                  >
                    <span style={{ justifySelf: 'end' }}>智能：</span>
                    <b style={{ color: themeTokens.text, justifySelf: 'end' }}>
                      {score === null ? '-' : fmt(score, 1)}
                    </b>

                    <span style={{ justifySelf: 'end' }}>价格：</span>
                    <b style={{ color: themeTokens.text, justifySelf: 'end' }}>
                      {price === null ? '-' : fmtUsd(price)}
                    </b>

                    <span style={{ justifySelf: 'end' }}>速度：</span>
                    <div style={{ justifySelf: 'end' }}>
                      <b style={{ color: themeTokens.text }}>
                        {speed === null ? '-' : fmt(speed, 1)}
                      </b>
                      <span style={{ opacity: 0.9 }}> t/s</span>
                    </div>
                  </div>
                </div>
              );
          }}
        />
      </PosterModal>
    </div>
  );
};

export default LlmRanking;
