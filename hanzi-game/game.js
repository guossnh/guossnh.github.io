(() => {
  'use strict';
  const words = window.HANZI_WORDS;
  const lines = window.HANZI_SPEECH;
  const $ = id => document.getElementById(id);
  const key = 'hanzi-light-v1';
  let saved = { stars: 0, words: {} };
  try {
    const value = JSON.parse(localStorage.getItem(key));
    if (value && Number.isSafeInteger(value.stars) && value.stars >= 0 && value.words && typeof value.words === 'object' && !Array.isArray(value.words)) saved = value;
  } catch (_) { /* Learning remains available when storage is blocked. */ }
  let sound = true, phase = 'welcome', batch = [], queue = [], lesson = 0, round = 0, answered = false, missed = false, target;
  let spokenAudio = null, speechVersion = 0;
  const shuffle = list => {
    const result = [...list];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  function persist() {
    try { localStorage.setItem(key, JSON.stringify(saved)); }
    catch (_) { $('storage-note').textContent = '当前浏览器无法保存记录，仍然可以继续玩。'; }
  }
  function stopSpeech() {
    speechVersion++;
    if (spokenAudio) {
      spokenAudio.pause();
      spokenAudio.removeAttribute('src');
      spokenAudio.load();
      spokenAudio = null;
    }
  }
  function speak(text) {
    stopSpeech();
    const version = speechVersion;
    if (!sound) return;
    const source = (window.HANZI_AUDIO || {})[text];
    if (!source) { audioFallback(); return; }
    const clip = new Audio(source);
    spokenAudio = clip;
    const failed = () => { if (version === speechVersion) audioFallback(); };
    clip.addEventListener('error', failed, { once: true });
    clip.addEventListener('playing', () => {
      if (version === speechVersion) $('audio-note').hidden = true;
    }, { once: true });
    clip.play().catch(failed);
  }
  function audioFallback() {
    if (phase === 'quiz' && target) {
      $('audio-note').hidden = false;
      $('audio-note').textContent = `请家长读：找一找，${target.phrase}的“${target.id}”。`;
    }
  }
  function record(word) {
    const item = saved.words[word.id];
    return item && Number.isFinite(item.correct) && Number.isFinite(item.misses) && Number.isFinite(item.seen) ? item : { correct: 0, misses: 0, seen: 0 };
  }
  function newBatch() {
    const simple = words.filter(word => !word.familiar);
    const known = words.filter(word => word.familiar);
    const priority = word => { const item = record(word); return item.seen === 0 ? -100 : item.correct - item.misses * 2; };
    batch = simple.sort((a, b) => priority(a) - priority(b)).slice(0, 2);
    const review = known.sort((a, b) => priority(a) - priority(b))[0];
    if (review) batch.push(review);
    batch = [...batch, ...words.filter(word => !batch.includes(word))].slice(0, Math.min(3, words.length));
    lesson = 0; round = 0;
    $('progress').setAttribute('aria-valuenow', '0'); $('progress').firstElementChild.style.width = '0%';
    showLesson();
  }
  function showLesson() {
    phase = 'learn'; target = batch[lesson];
    $('learn').hidden = false; $('quiz').hidden = true; $('finish').hidden = true;
    $('stage').textContent = `认识朋友 · ${lesson + 1} / ${batch.length}`;
    $('eyebrow').textContent = target.familiar ? '老朋友，也来打个招呼' : '看一看，听一听';
    $('heading').textContent = '认识一个字朋友'; $('subtitle').textContent = '你也可以跟着念一念。';
    $('big-word').textContent = target.id; $('picture').textContent = target.picture;
    $('phrase').textContent = target.phrase; $('sentence').textContent = target.sentence;
    $('word-button').setAttribute('aria-label', `听“${target.id}”`);
    $('feedback').textContent = '慢慢来，我陪着你。';
    $('next').hidden = false; $('next').textContent = lesson < batch.length - 1 ? '认识下一个 →' : '来找找它们 →';
    speak(lines.lesson(target));
  }
  function ask() {
    phase = 'quiz'; target = queue[round]; answered = false; missed = false;
    $('learn').hidden = true; $('quiz').hidden = false; $('finish').hidden = true; $('next').hidden = true;
    $('stage').textContent = `听音找字 · ${round + 1} / 6`;
    $('eyebrow').textContent = '小耳朵，准备好'; $('heading').textContent = '哪个是刚才听到的字？';
    $('subtitle').textContent = '认真听，慢慢找。'; $('feedback').textContent = '相信自己，试试看。';
    $('reward').textContent = ''; $('audio-note').hidden = true;
    const options = shuffle(batch);
    $('choices').replaceChildren(...options.map(word => {
      const button = document.createElement('button'); button.className = 'choice'; button.textContent = word.id;
      button.setAttribute('aria-label', word.id); button.addEventListener('click', () => choose(word, button)); return button;
    }));
    prompt();
  }
  function prompt() {
    if (!sound) audioFallback();
    else speak(lines.prompt(target));
  }
  function choose(word, button) {
    if (answered || button.disabled) return;
    if (word.id !== target.id) {
      missed = true; button.classList.add('tried'); button.disabled = true;
      $('feedback').textContent = '没关系，再听听，你可以的。';
      const correct = [...$('choices').children].find(item => item.textContent === target.id);
      correct.classList.add('hint');
      speak(lines.retry(target)); return;
    }
    answered = true; button.classList.add('correct');
    [...$('choices').children].forEach(item => { item.disabled = true; });
    const item = record(target); item.seen++; if (missed) item.misses++; else item.correct++;
    saved.words[target.id] = item;
    const praise = missed ? lines.retryPraise : lines.praise[round % lines.praise.length];
    $('feedback').textContent = praise; $('reward').textContent = target.picture;
    $('subtitle').textContent = `${target.id}，${target.phrase}。`;
    speak(praise);
    round++; if (round === 6) saved.stars++;
    persist(); $('collection').textContent = `★ ${saved.stars}`;
    $('progress').setAttribute('aria-valuenow', String(round)); $('progress').firstElementChild.style.width = `${round / 6 * 100}%`;
    $('next').hidden = false; $('next').textContent = round === 6 ? '收下小星星 →' : '继续找一找 →';
  }
  function finish() {
    phase = 'finish'; $('quiz').hidden = true; $('finish').hidden = false;
    $('stage').textContent = '这一轮，完成啦'; $('eyebrow').textContent = '一颗星星，送给认真的你';
    $('heading').textContent = '今天又进步了一点点'; $('subtitle').textContent = '这些字朋友，和你一起闪闪发光。';
    $('finish-words').textContent = batch.map(word => word.id).join(' ');
    $('feedback').textContent = '休息一下，也很棒。'; $('next').textContent = '再认识三个字 →';
    speak(lines.finish);
  }
  $('next').addEventListener('click', () => {
    if (phase === 'welcome' || phase === 'finish') newBatch();
    else if (phase === 'learn') {
      lesson++;
      if (lesson < batch.length) showLesson();
      else { queue = [...shuffle(batch), ...shuffle(batch)]; while (queue.length < 6) queue.push(...shuffle(batch)); queue = queue.slice(0, 6); ask(); }
    } else if (answered) { if (round === 6) finish(); else ask(); }
  });
  $('listen').addEventListener('click', prompt);
  $('word-button').addEventListener('click', () => speak(lines.lesson(target || words[0])));
  $('sound').addEventListener('click', () => {
    sound = !sound; if (!sound) stopSpeech();
    $('sound').textContent = sound ? '♪' : '♩'; $('sound').setAttribute('aria-pressed', String(sound));
    $('sound').setAttribute('aria-label', sound ? '关闭声音' : '打开声音'); $('sound').title = sound ? '关闭声音' : '打开声音';
    if (phase === 'quiz') { $('audio-note').hidden = sound; if (!answered) prompt(); }
  });
  $('parent-open').addEventListener('click', () => { stopSpeech(); $('word-list').textContent = words.map(word => word.id).join(' '); $('parent').showModal(); });
  $('parent-close').addEventListener('click', () => { $('parent').close(); $('reset').textContent = '重置学习记录'; });
  $('reset').addEventListener('click', () => {
    if ($('reset').textContent !== '确认重置') { $('reset').textContent = '确认重置'; return; }
    saved = { stars: 0, words: {} }; persist(); $('collection').textContent = '★ 0'; $('parent').close(); $('reset').textContent = '重置学习记录'; newBatch();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopSpeech(); });
  window.addEventListener('pagehide', stopSpeech);
  $('collection').textContent = `★ ${saved.stars}`;
})();
