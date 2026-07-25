---
description: 生产部署
argument-hint: "<环境: production/staging>"
allowed-tools: Read, Glob, Grep, Bash
---

# /deploy - 部署

## 子命令
- `/deploy check` - 部署前检查
- `/deploy preview` - 预览
- `/deploy production` - 生产部署
- `/deploy rollback` - 回滚

## 流程
1. 预检清单（安全检查、lint、测试）
2. 构建
3. 部署
4. 健康检查
5. 如失败执行回滚

部署参数: $ARGUMENTS
