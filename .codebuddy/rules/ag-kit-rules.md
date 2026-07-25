# AG Kit 核心规则（CodeBuddy 版）

## 请求分类

| 请求类型 | 行为 |
|---------|------|
| 问题类（什么是、解释） | 直接回答 |
| 简单代码（修改、添加单个文件） | 直接改 |
| 复杂代码（构建、创建、重构） | 先问至少 3 个问题，再写代码 |
| 调试 | 系统化排查 |
| UI/设计 | 前端代理优先 |

## 编码规范

- 代码简洁、不过度设计（SRP/DRY/KISS/YAGNI）
- 函数不超过 20 行
- 变量/注释用英文
- 按用户语言回复

## 复杂任务流程

1. **Socratic Gate** — 先问 3+ 个问题澄清需求
2. **计划** — 创建 `{task-slug}.md` 计划文件
3. **审批** — 用户确认后再动手
4. **实现** — 并行执行
5. **验证** — 实际运行证明代码有效

## 项目类型路由

- **Web 前端** → frontend-specialist + 前端技能
- **后端/API** → backend-specialist + API/DB 技能
- **移动端** → mobile-developer + 移动端技能
- **数据库** → database-architect
- **安全** → security-auditor
- **测试** → test-engineer

## 可用命令

| 命令 | 用途 |
|------|------|
| `/plan` | 生成计划（不写代码） |
| `/create` | 创建新应用 |
| `/debug` | 系统化调试 |
| `/deploy` | 生产部署 |
| `/test` | 生成并运行测试 |
| `/verify` | 运行验证代码 |
| `/enhance` | 增强现有应用 |
| `/coord` | 多代理协调 |
| `/brainstorm` | 头脑风暴 |
| `/remember` | 保存偏好记忆 |
| `/status` | 项目状态 |
