import { Drawer, Button, Checkbox, List, Divider } from 'antd';
import { ArrowUpOutlined as UpOutlined, ArrowDownOutlined as DownOutlined } from '@ant-design/icons';
import './SourceManagerDrawer.css';

function SourceManagerDrawer({
  open,
  onClose,
  width = 420,
  allSources,
  sourceCfg,
  hiddenSet,
  getChineseSourceName,
  resetSourceCfg,
  setSourceVisible,
  moveSource,
}) {
  const dataSource = (sourceCfg.order || []).length ? sourceCfg.order : allSources;

  const totalCount = dataSource.length;
  const hiddenCount = (sourceCfg.hidden || []).length;

  const indeterminate = totalCount
    ? hiddenCount > 0 && hiddenCount < totalCount
    : false;

  const checked = totalCount ? hiddenCount === 0 : true;

  return (
    <Drawer
      className="source-mgr-drawer"
      title="来源管理"
      placement="right"
      width={width}
      open={open}
      onClose={onClose}
      extra={
        <Button type="default" onClick={resetSourceCfg}>
          重置
        </Button>
      }
    >
      <div className="source-mgr-tip">
        勾选显示/隐藏来源；使用上下箭头调整卡片顺序。
      </div>

      <div className="source-mgr-selectall">
        <Checkbox
          indeterminate={indeterminate}
          checked={checked}
          onChange={e => {
            const nextChecked = e.target.checked;
            if (nextChecked) {
              // 全选：清空 hidden
              // 交给父组件处理更稳，这里用 setSourceVisible 批量操作
              // 但为了保持与原逻辑一致，我们直接模拟“隐藏清空”行为：
              // 父组件当前实现是 setSourceCfg(prev => ({...prev, hidden: []}))，
              // 这里无法直接访问 setSourceCfg，所以退回逐个设为可见。
              dataSource.forEach(s => setSourceVisible(String(s).toLowerCase(), true));
            } else {
              // 全部隐藏
              dataSource.forEach(s => setSourceVisible(String(s).toLowerCase(), false));
            }
          }}
        >
          全选
        </Checkbox>
      </div>

      <List
        dataSource={dataSource}
        renderItem={(s, idx) => {
          const src = String(s).toLowerCase();
          const visible = !hiddenSet.has(src);
          const lastIdx = dataSource.length - 1;

          return (
            <List.Item
              className="source-mgr-item"
              actions={[
                <Button
                  key="up"
                  type="text"
                  icon={<UpOutlined />}
                  disabled={idx === 0}
                  onClick={() => moveSource(src, 'up')}
                />,
                <Button
                  key="down"
                  type="text"
                  icon={<DownOutlined />}
                  disabled={idx === lastIdx}
                  onClick={() => moveSource(src, 'down')}
                />,
              ]}
            >
              <Checkbox checked={visible} onChange={e => setSourceVisible(src, e.target.checked)}>
                {getChineseSourceName(src)}
              </Checkbox>
            </List.Item>
          );
        }}
      />

      <Divider />
      <div className="source-mgr-footer-tip">提示：隐藏来源不会删除数据，只是不在首页展示。</div>
    </Drawer>
  );
}

export default SourceManagerDrawer;
