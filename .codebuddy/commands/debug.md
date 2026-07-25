---
description: 系统化排查和修复问题
argument-hint: "<问题描述>"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# /debug - 系统化调试

## 流程
1. 收集信息：复现步骤、错误信息、环境
2. 提出假设（至少 2 个）
3. 逐一验证排除
4. 修复并添加测试防止复发
5. 文档记录根因

问题: $ARGUMENTS
