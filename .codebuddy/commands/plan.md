---
description: 为任务生成详细计划文件（不写代码）
argument-hint: "<任务描述>"
allowed-tools: Read, Glob, Grep, Bash
---

# /plan - 生成任务计划

## 流程
1. 先问 3+ 个问题澄清需求
2. 创建 `{task-slug}.md` 计划文件
3. 展示计划给用户确认

## 要求
- 只创建计划文件，不写代码
- 任务分解为 2-5 分钟的子任务
- 每个子任务有明确的验证标准
- 逻辑排序，动态命名（不使用固定模板）

用户请求: $ARGUMENTS
