# 统计API使用说明

## 概述

本项目已集成了StatisticsController的统计接口，用于获取用户的账单统计信息。前端页面现在会调用真实的统计接口来显示数据，而不是使用模拟数据。

## 集成的统计接口

### 1. 月度收支统计
- **接口**: `GET /api/statistics/monthly/{userId}`
- **参数**: 
  - `userId`: 用户ID
  - `month`: 统计月份 (格式: yyyy-MM)
- **用途**: 获取指定月份的收支统计

### 2. 年度收支统计
- **接口**: `GET /api/statistics/yearly/{userId}`
- **参数**:
  - `userId`: 用户ID
  - `year`: 统计年份
- **用途**: 获取指定年份的收支统计

### 3. 用户总资产统计
- **接口**: `GET /api/statistics/total-assets/{userId}`
- **参数**:
  - `userId`: 用户ID
- **用途**: 获取用户的总资产（包括现金账户、投资资产、固定资产）

## 前端实现

### 文件结构
```
src/
├── api/
│   └── statistics.ts          # 统计API服务
├── services/
│   └── types.ts              # 包含StatisticsDto类型定义
└── pages/
    └── Transactions.tsx      # 交易页面，集成了统计功能
```

### 主要功能

1. **统计卡片显示**:
   - 本月收入/支出/净收入
   - 总资产
   - 年度收入/支出/净收入

2. **数据加载状态**:
   - 使用Spin组件显示加载状态
   - 接口调用失败时自动降级到模拟数据

3. **错误处理**:
   - 接口调用失败时会在控制台输出日志
   - 自动使用模拟数据保证页面正常显示

## 使用方法

### 1. 启动前端服务
```bash
npm run dev
```

### 2. 访问交易页面
打开浏览器访问交易记录页面，统计卡片会自动调用后端接口获取数据。

### 3. 查看统计信息
页面会显示：
- 本月收支统计（来自月度统计接口）
- 年度收支统计（来自年度统计接口）
- 总资产统计（来自总资产统计接口）

## 配置说明

### 用户ID配置
当前代码中用户ID硬编码为1，实际使用时应该：
1. 从用户登录状态获取
2. 从URL参数获取
3. 从全局状态管理获取

### 日期格式
- 月度统计使用 `yyyy-MM` 格式
- 年度统计使用数字年份
- 日期参数使用 `yyyy-MM-dd` 格式

## 其他可用接口

除了已集成的接口外，StatisticsController还提供了以下接口：

1. **分类统计**: `GET /api/statistics/category/{userId}`
2. **账户余额统计**: `GET /api/statistics/account-balance/{userId}`
3. **投资资产统计**: `GET /api/statistics/investment/{userId}`
4. **固定资产统计**: `GET /api/statistics/fixed-asset/{userId}`
5. **趋势统计**: `GET /api/statistics/trend/{userId}`
6. **预算执行情况**: `GET /api/statistics/budget/{userId}`

这些接口可以根据需要在其他页面中集成使用。

## 注意事项

1. **接口兼容性**: 确保后端StatisticsController正常运行
2. **数据格式**: 确保后端返回的数据格式与前端StatisticsDto类型定义一致
3. **错误处理**: 前端已实现降级机制，接口失败时使用模拟数据
4. **性能优化**: 使用React Query进行数据缓存和状态管理
