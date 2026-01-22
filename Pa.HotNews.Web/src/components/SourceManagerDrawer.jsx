import { useMemo, useState } from 'react';
import { Drawer, Button, Checkbox, List, Divider } from 'antd';
import { ArrowUpOutlined as UpOutlined, ArrowDownOutlined as DownOutlined, MenuOutlined } from '@ant-design/icons';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './SourceManagerDrawer.css';

function SortableRow({ id, children, disabled }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'source-mgr-dragging' : undefined}>
      {children({ attributes, listeners, isDragging })}
    </div>
  );
}

function SourceRowContent({
  src,
  idx,
  lastIdx,
  visible,
  getChineseSourceName,
  setSourceVisible,
  moveSource,
  handleProps,
  dragging,
  showActions,
}) {
  return (
    <div className={`source-mgr-row${dragging ? ' is-dragging' : ''}`}>
      <span className="source-mgr-handle" {...handleProps} title="拖拽排序">
        <MenuOutlined />
      </span>

      <Checkbox checked={visible} onChange={e => setSourceVisible(src, e.target.checked)}>
        {getChineseSourceName(src)}
      </Checkbox>

      {showActions ? (
        <span className="source-mgr-actions">
          <Button
            key="up"
            type="text"
            icon={<UpOutlined />}
            disabled={idx === 0}
            onClick={() => moveSource(src, 'up')}
          />
          <Button
            key="down"
            type="text"
            icon={<DownOutlined />}
            disabled={idx === lastIdx}
            onClick={() => moveSource(src, 'down')}
          />
        </span>
      ) : (
        <span className="source-mgr-actions" aria-hidden="true" />
      )}
    </div>
  );
}

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
  setSourceOrder,
}) {
  const dataSource = (sourceCfg.order || []).length ? sourceCfg.order : allSources;

  const totalCount = dataSource.length;
  const hiddenCount = (sourceCfg.hidden || []).length;

  const indeterminate = totalCount
    ? hiddenCount > 0 && hiddenCount < totalCount
    : false;

  const checked = totalCount ? hiddenCount === 0 : true;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  const items = useMemo(() => (dataSource || []).map(s => String(s).toLowerCase()), [dataSource]);

  const [activeId, setActiveId] = useState(null);

  const onDragStart = (event) => {
    setActiveId(event?.active?.id ?? null);
  };

  const onDragCancel = () => {
    setActiveId(null);
  };

  const onDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!active?.id || !over?.id) return;
    if (active.id === over.id) return;

    const oldIndex = items.indexOf(active.id);
    const newIndex = items.indexOf(over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(items, oldIndex, newIndex);
    if (typeof setSourceOrder === 'function') {
      setSourceOrder(next);
    }
  };

  const overlaySrc = activeId ? String(activeId).toLowerCase() : null;

  // 固定为浅色视觉（不随主题变化）
  const lightContentBg = '#ffffff';
  const lightHeaderBg = '#ffffff';
  const lightBorder = 'rgba(15, 23, 42, 0.10)';
  const lightText = 'rgba(15, 23, 42, 0.92)';
  const lightTextSecondary = 'rgba(51, 65, 85, 0.86)';

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
      styles={{
        content: {
          background: lightContentBg,
        },
        header: {
          background: lightHeaderBg,
          borderBottom: `1px solid ${lightBorder}`,
        },
        body: {
          background: lightContentBg,
          color: lightText,
        },
      }}
    >
      <div className="source-mgr-tip" style={{ color: lightTextSecondary }}>
        勾选显示/隐藏来源；拖拽手柄调整卡片顺序（也可用上下箭头微调）。
      </div>

      <div className="source-mgr-selectall" style={{ color: lightText }}>
        <Checkbox
          indeterminate={indeterminate}
          checked={checked}
          onChange={e => {
            const nextChecked = e.target.checked;
            if (nextChecked) {
              items.forEach(s => setSourceVisible(String(s).toLowerCase(), true));
            } else {
              items.forEach(s => setSourceVisible(String(s).toLowerCase(), false));
            }
          }}
        >
          全选
        </Checkbox>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragCancel={onDragCancel}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <List
            className="source-mgr-list"
            dataSource={items}
            renderItem={(src, idx) => {
              const visible = !hiddenSet.has(src);
              const lastIdx = items.length - 1;

              return (
                <SortableRow id={src}>
                  {({ attributes, listeners, isDragging }) => (
                    <List.Item className="source-mgr-item">
                      <SourceRowContent
                        src={src}
                        idx={idx}
                        lastIdx={lastIdx}
                        visible={visible}
                        getChineseSourceName={getChineseSourceName}
                        setSourceVisible={setSourceVisible}
                        moveSource={moveSource}
                        handleProps={{ ...attributes, ...listeners }}
                        dragging={isDragging}
                        showActions
                      />
                    </List.Item>
                  )}
                </SortableRow>
              );
            }}
          />
        </SortableContext>

        <DragOverlay dropAnimation={null}>
          {overlaySrc ? (
            <div className="source-mgr-ghost" aria-hidden="true">
              <div className="source-mgr-item">
                <SourceRowContent
                  src={overlaySrc}
                  idx={-1}
                  lastIdx={-1}
                  visible={!hiddenSet.has(overlaySrc)}
                  getChineseSourceName={getChineseSourceName}
                  setSourceVisible={() => {}}
                  moveSource={() => {}}
                  handleProps={{}}
                  dragging
                  showActions={false}
                />
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Divider />
      <div className="source-mgr-footer-tip" style={{ color: lightTextSecondary }}>
        提示：隐藏来源不会删除数据，只是不在首页展示。
      </div>
    </Drawer>
  );
}

export default SourceManagerDrawer;
