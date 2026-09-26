# 字里有光

直接用浏览器打开 `index.html`，或访问网站的 `/hanzi-game/` 路径。不需要安装依赖。

## 添加汉字

编辑同文件夹中的 `words.js`，在数组中添加一项：

```js
{ id: '田', phrase: '田地', sentence: '田地里长出了小苗。', picture: '🌱' },
```

`id` 为单个汉字且不要重复；`phrase` 应包含这个字；`picture` 为认识阶段和答对后显示的图案。已经认识的字添加 `familiar: true`。字库请至少保留三个不同的字。

每轮选择两个简单字和一个已认识的字（如有），先逐字认识，再找字六次。优先选未接触的字，之后增加认错较多字的练习。星星和练习次数存储在当前浏览器 localStorage，不能跨设备同步，也不表示已经掌握。

语音采用提前生成并保存在 `audio/` 中的中文 AI 配音，统一使用微软晓晓神经网络语音（zh-CN-XiaoxiaoNeural），语速 -8%。认识汉字、找字引导、重试提示和鼓励均按完整句子生成，网页无需在线调用配音服务。没有可用音频或关闭声音时，找字阶段显示供家长朗读的题目，不再切换到系统朗读。支持减少动态效果的系统设置。

## 更新配音

添加汉字或修改 `voice-lines.js` 文案后，在项目根目录运行：

```sh
python3 -m venv /tmp/hanzi-voice-env
/tmp/hanzi-voice-env/bin/pip install edge-tts==7.2.8
/tmp/hanzi-voice-env/bin/python hanzi-game/generate-audio.py
```

生成步骤需要网络和 Node.js，通过 [edge-tts](https://github.com/rany2/edge-tts) 使用微软 Edge 在线语音服务。脚本根据文案、声音和语速生成文件名，跳过已有音频，只在全部成功后更新 `audio-manifest.js`。发布时带上字库、文案、音频索引及 `audio/` 文件夹。改音色或语速会生成新的文件；旧音频不会自动删除。
