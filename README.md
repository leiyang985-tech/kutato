# 智能错题本（kutato）

给孩子用的智能错题本 App。拍照或手动录入错题，AI 帮忙整理、讲解、举一反三，并按记忆曲线安排复习、出测验检验掌握情况。

- 📸 **录入错题**：拍照自动识别（OCR）或手动输入
- 🤖 **AI 讲解**：讲清楚每道错题的思路与易错点
- ✨ **举一反三**：根据错题生成同类型新题
- 📝 **测验**：围绕错题知识点出新题，检验是否真正掌握
- 🔁 **复习**：基于间隔重复（记忆曲线）安排复习
- 🔒 **隐私**：错题与 API Key 只存在手机本地

## 技术栈

- **Expo（React Native + TypeScript）** + **expo-router**（文件路由）
- 本地存储：`@react-native-async-storage/async-storage`
- 拍照 / 选图：`expo-image-picker`
- AI：**Claude API**（`claude-opus-4-8`），同时承担图像识别（OCR）、讲解、出题

## 运行

需要 Node 18+。

```bash
npm install
npx expo start
```

然后用手机安装 **Expo Go**（App Store / 应用商店搜索），扫描终端里的二维码即可在自己的 iPhone 上打开预览，无需 Mac 或苹果开发者账号。

> 也可以按 `i` 启动 iOS 模拟器（需 macOS + Xcode），或按 `w` 在浏览器中预览。

## 配置 API Key

1. 到 [Anthropic 控制台](https://console.anthropic.com/settings/keys) 创建一个 API Key。
2. 打开 App → 「设置」标签 → 填入 API Key → 保存。

未配置 Key 时，手动录入、复习等功能照常使用；拍照识别、AI 讲解、举一反三、测验需要 Key。

## 项目结构

```
app/
  _layout.tsx            根布局（导航 + 全局 Provider）
  (tabs)/
    _layout.tsx          底部 4 个标签
    index.tsx            错题本列表
    review.tsx           复习（间隔重复）
    quiz.tsx             测验
    settings.tsx         设置
  problem/
    new.tsx              录入错题（拍照/OCR/手动）
    [id].tsx             错题详情 + AI 讲解 + 举一反三
src/
  types.ts               数据模型与复习算法
  store.tsx              全局状态 + 本地持久化
  ai.ts                  Claude API 封装
  theme.ts               配色与样式常量
```

## 说明与后续

- 当前 App 直接从手机端调用 Anthropic API，API Key 保存在本机。这适合**给自己孩子用的个人 App**。若要上架公开发布，应改为通过自建后端中转请求，避免 Key 暴露。
- 数据保存在本机，换设备不会同步。如需多设备同步，可后续接入云端存储。
