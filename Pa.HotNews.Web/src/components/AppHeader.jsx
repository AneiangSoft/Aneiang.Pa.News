import {
  Dropdown,
  Input,
  Segmented,
  Tooltip,
  Button,
  Badge,
  Menu,
} from 'antd';
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
  SettingOutlined as MoreActionOutlined, // “更多/设置”入口（更明显）
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
  // 桌面端“更多”菜单项
  const desktopMoreMenu = {
    items: [
      {
        key: 'section-settings',
        label: <span className="more-menu-section">设置</span>,
        disabled: true,
      },
      {
        key: 'linkBehavior',
        label: (
          <div className="more-menu-item">
            <span className="more-menu-label">打开方式</span>
            <Segmented
              size="small"
              value={linkBehavior}
              onChange={setLinkBehavior}
              options={[
                { label: '站内', value: 'in-app' },
                { label: '新标签', value: 'new-tab' },
              ]}
            />
          </div>
        ),
      },
      { type: 'divider' },
      {
        key: 'section-tools',
        label: <span className="more-menu-section">工具</span>,
        disabled: true,
      },
      {
        key: 'copy',
        label: '复制筛选链接',
        icon: <CopyOutlined />,
        onClick: copyFilterLink,
      },
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
      { type: 'divider' },
      {
        key: 'section-about',
        label: <span className="more-menu-section">关于</span>,
        disabled: true,
      },
      {
        key: 'github',
        label: 'GitHub',
        icon: <GithubOutlined />,
        onClick: () =>
          window.open(
            'https://github.com/AneiangSoft/Aneiang.Pa.News',
            '_blank',
            'noopener,noreferrer'
          ),
      },
    ],
  };

  // 移动端菜单项（信息架构更清晰）
  const mobileMenu = {
    items: [
      // 1. 频道切换
      ...(availableViews.length > 1
        ? [
            {
              key: 'views-title',
              label: <span className="more-menu-section">频道</span>,
              disabled: true,
            },
            ...availableViews.map(v => ({
              key: `view-${v.key}`,
              label: v.label,
              className: view === v.key ? 'is-selected' : '',
              onClick: () => handleViewChange(v.key),
            })),
            { type: 'divider' },
          ]
        : []),

      // 2. 主题
      {
        key: 'theme-title',
        label: <span className="more-menu-section">主题</span>,
        disabled: true,
      },
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

      // 3. 设置与工具
      {
        key: 'linkBehavior',
        label: (
          <div className="more-menu-item">
            <span className="more-menu-label">打开方式</span>
            <Segmented
              size="small"
              value={linkBehavior}
              onChange={setLinkBehavior}
              options={[
                { label: '站内', value: 'in-app' },
                { label: '新标签', value: 'new-tab' },
              ]}
            />
          </div>
        ),
      },
      { type: 'divider' },
      {
        key: 'fav',
        label: `收藏${favoriteCount ? `（${favoriteCount}）` : ''}`,
        icon: <BookOutlined />,
        onClick: onOpenFavorites,
      },
      {
        key: 'source',
        label: '来源管理',
        icon: <SettingOutlined />,
        onClick: onOpenSourceMgr,
      },
      {
        key: 'copy',
        label: '复制筛选链接',
        icon: <CopyOutlined />,
        onClick: copyFilterLink,
      },
      {
        key: 'share',
        label: '分享本站',
        icon: <ShareAltOutlined />,
        onClick: sharePage,
      },
      { type: 'divider' },

      // 4. 关于
      {
        key: 'github',
        label: 'GitHub',
        icon: <GithubOutlined />,
        onClick: () =>
          window.open(
            'https://github.com/AneiangSoft/Aneiang.Pa',
            '_blank',
            'noopener,noreferrer'
          ),
      },
    ],
  };

  return (
    <header className="app-header">
      {/* --- 左侧：品牌 Logo --- */}
      <div className="header-left">
        <img
          className="logo-img"
          src={{ dark: LogoDark, light: LogoLight, warm: LogoWarm }[theme]}
          alt="热榜聚合 Logo"
        />
        <h1 className="site-title">{siteTitle || '热榜聚合'}</h1>
      </div>

      {/* --- 中间：主导航 + 搜索 --- */}
      <div className="header-center">
        {availableViews.length > 1 && !isMobile && (
          <Menu
            mode="horizontal"
            selectedKeys={[view]}
            className="main-nav"
            items={availableViews.map(v => ({
              key: v.key,
              label: v.label,
              className: 'nav-item',
              onClick: () => handleViewChange(v.key)
            }))}
          />
        )}

        <Input
          allowClear
          className="search-input"
          placeholder={isMobile ? '搜索...' : '搜索所有热榜标题...'}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {/* --- 右侧：操作区 --- */}
      <div className="header-right">
        {/* 桌面端操作区 */}
        {!isMobile && (
          <div className="actions">
            <Tooltip title="主题切换">
              <Segmented
                value={theme}
                onChange={setTheme}
                options={[
                  { value: 'dark', icon: <MoonOutlined /> },
                  { value: 'light', icon: <SunOutlined /> },
                  { value: 'warm', icon: <BulbOutlined /> },
                ]}
              />
            </Tooltip>

            <Tooltip title="收藏">
              <Badge count={favoriteCount} size="small" offset={[-2, 2]}>
                <Button type="text" icon={<BookOutlined />} onClick={onOpenFavorites} />
              </Badge>
            </Tooltip>

            <Dropdown menu={desktopMoreMenu} trigger={['click']}>
              <Tooltip title="更多">
                <Button type="text" icon={<MoreActionOutlined />} />
              </Tooltip>
            </Dropdown>
          </div>
        )}

        {/* 移动端汉堡菜单 */}
        {isMobile && (
          <div className="actions-mobile">
            <Tooltip title="收藏">
              <Badge count={favoriteCount} size="small" offset={[-2, 2]}>
                <Button type="text" icon={<BookOutlined />} onClick={onOpenFavorites} />
              </Badge>
            </Tooltip>

            <Dropdown
              trigger={['click']}
              open={mobileMenuOpen}
              onOpenChange={setMobileMenuOpen}
              menu={mobileMenu}
            >
              <Button type="text" icon={<MenuOutlined />} />
            </Dropdown>
          </div>
        )}
      </div>
    </header>
  );
}

export default AppHeader;
