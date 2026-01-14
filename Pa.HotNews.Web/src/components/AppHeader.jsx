import { Grid, Dropdown, Input, Segmented, Tooltip, Button, Badge } from 'antd';
import {
  MenuOutlined,
  GithubOutlined,
  BulbOutlined,
  MoonOutlined,
  SunOutlined,
  ShareAltOutlined,
  CopyOutlined,
  SettingOutlined,
  BookOutlined,
} from '@ant-design/icons';

import LogoDark from '../assets/logo-dark.svg';
import LogoLight from '../assets/logo-light.svg';
import LogoWarm from '../assets/logo-warm.svg';

import './AppHeader.css';

function AppHeader({
  siteTitle,
  theme,
  setTheme,
  view,
  availableViews,
  handleViewChange,
  query,
  setQuery,
  linkBehavior,
  setLinkBehavior,
  copyFilterLink,
  sharePage,
  onOpenSourceMgr,
  favoriteCount,
  onOpenFavorites,
  isMobile,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  return (
    <header className="app-header">
      <div className="logo">
        <img
          className="logo-img"
          src={{ dark: LogoDark, light: LogoLight, warm: LogoWarm }[theme]}
          alt="热榜聚合 Logo"
        />
        <h1>{siteTitle || '热榜聚合'}</h1>

        {availableViews.length > 1 && (
          <Segmented
            value={view}
            onChange={handleViewChange}
            options={availableViews.map(v => ({ label: v.label, value: v.key }))}
          />
        )}
      </div>

      {/* 桌面端：原来的导航 */}
      {!isMobile && (
        <div className="actions">
          <Input
            allowClear
            className="search-input"
            placeholder="搜索所有热榜标题..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />

          <Tooltip title="主题切换（深色 / 浅色 / 护眼暖色）">
            <Segmented
              value={theme}
              onChange={setTheme}
              options={[
                { label: '深色', value: 'dark', icon: <MoonOutlined /> },
                { label: '浅色', value: 'light', icon: <SunOutlined /> },
                { label: '护眼', value: 'warm', icon: <BulbOutlined /> },
              ]}
            />
          </Tooltip>

          <Tooltip title="链接打开方式（站内阅读 / 新标签页）">
            <Segmented
              value={linkBehavior}
              onChange={setLinkBehavior}
              options={[
                { label: '站内阅读', value: 'in-app' },
                { label: '新标签页', value: 'new-tab' },
              ]}
            />
          </Tooltip>

          <Tooltip title="复制当前筛选链接">
            <Button type="default" icon={<CopyOutlined />} onClick={copyFilterLink} />
          </Tooltip>

          <Tooltip title="分享本站">
            <Button type="default" icon={<ShareAltOutlined />} onClick={sharePage} />
          </Tooltip>

          <Tooltip title="来源管理">
            <Button type="default" icon={<SettingOutlined />} onClick={onOpenSourceMgr} />
          </Tooltip>

          <Tooltip title="收藏">
            <Badge count={favoriteCount} size="small" offset={[-2, 2]}>
              <Button type="default" icon={<BookOutlined />} onClick={onOpenFavorites} />
            </Badge>
          </Tooltip>

          <Tooltip title="GitHub">
            <Button
              type="default"
              icon={<GithubOutlined />}
              onClick={() =>
                window.open(
                  'https://github.com/AneiangSoft/Aneiang.Pa.News',
                  '_blank',
                  'noopener,noreferrer'
                )
              }
            />
          </Tooltip>
        </div>
      )}

      {/* 移动端：下拉菜单 */}
      {isMobile && (
        <div className="actions mobile-actions">
          <Input
            allowClear
            className="search-input"
            placeholder="搜索所有热榜标题..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />

          <Dropdown
            trigger={['click']}
            open={mobileMenuOpen}
            onOpenChange={setMobileMenuOpen}
            menu={{
              items: [
                {
                  key: 'theme-dark',
                  label: '深色主题',
                  icon: <MoonOutlined />,
                  onClick: () => setTheme('dark'),
                },
                {
                  key: 'theme-light',
                  label: '浅色主题',
                  icon: <SunOutlined />,
                  onClick: () => setTheme('light'),
                },
                {
                  key: 'theme-warm',
                  label: '护眼主题',
                  icon: <BulbOutlined />,
                  onClick: () => setTheme('warm'),
                },
                { type: 'divider' },
                {
                  key: 'share',
                  label: '分享本站',
                  icon: <ShareAltOutlined />,
                  onClick: sharePage,
                },
                {
                  key: 'source',
                  label: '来源管理',
                  icon: <SettingOutlined />,
                  onClick: onOpenSourceMgr,
                },
                {
                  key: 'fav',
                  label: `收藏${favoriteCount ? `（${favoriteCount}）` : ''}`,
                  icon: <BookOutlined />,
                  onClick: onOpenFavorites,
                },
                {
                  key: 'github',
                  label: 'Github',
                  icon: <GithubOutlined />,
                  onClick: () =>
                    window.open(
                      'https://github.com/AneiangSoft/Aneiang.Pa',
                      '_blank',
                      'noopener,noreferrer'
                    ),
                },
              ],
            }}
          >
            <Button type="default" icon={<MenuOutlined />} />
          </Dropdown>
        </div>
      )}
    </header>
  );
}

export default AppHeader;
