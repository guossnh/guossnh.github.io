// 页面和音频生成脚本共用文案，修改后重新生成音频。
window.HANZI_SPEECH = {
  lesson: word => `${word.id}，${word.phrase}。${word.sentence}`,
  prompt: word => `找一找，${word.phrase}的${word.id}。`,
  retry: word => `没关系，咱们再听一遍。找一找，${word.phrase}的${word.id}。`,
  praise: ['听得真仔细，找到啦！', '对啦，你找到这个字啦！', '认真观察的你，好棒！'],
  retryPraise: '你没有放弃，终于找到啦！',
  finish: '完成啦！这颗小星星，送给认真的你。休息一下，也很棒。'
};
