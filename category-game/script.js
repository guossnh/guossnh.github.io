class CategoryGame {
    constructor() {
        this.level = 1;
        this.score = 0;
        this.soundEnabled = true;
        this.audioContext = null;
        this.currentTask = null;
        this.selectedIds = new Set();

        this.items = [
            { id: "apple", name: "苹果", emoji: "🍎", kind: "水果", color: "红色", shape: "圆圆的" },
            { id: "banana", name: "香蕉", emoji: "🍌", kind: "水果", color: "黄色", shape: "弯弯的" },
            { id: "grape", name: "葡萄", emoji: "🍇", kind: "水果", color: "紫色", shape: "圆圆的" },
            { id: "carrot", name: "胡萝卜", emoji: "🥕", kind: "蔬菜", color: "橙色", shape: "长长的" },
            { id: "corn", name: "玉米", emoji: "🌽", kind: "蔬菜", color: "黄色", shape: "长长的" },
            { id: "book", name: "图画书", emoji: "📘", kind: "文具", color: "蓝色", shape: "方方的" },
            { id: "pencil", name: "铅笔", emoji: "✏️", kind: "文具", color: "黄色", shape: "长长的" },
            { id: "crayon", name: "蜡笔", emoji: "🖍️", kind: "文具", color: "红色", shape: "长长的" },
            { id: "bear", name: "小熊", emoji: "🧸", kind: "玩具", color: "棕色", shape: "软软的" },
            { id: "car", name: "小汽车", emoji: "🚗", kind: "玩具", color: "红色", shape: "会跑的" },
            { id: "ball", name: "皮球", emoji: "⚽", kind: "玩具", color: "白色", shape: "圆圆的" },
            { id: "milk", name: "牛奶", emoji: "🥛", kind: "饮料", color: "白色", shape: "杯子里" },
            { id: "juice", name: "果汁", emoji: "🧃", kind: "饮料", color: "橙色", shape: "盒子里" },
            { id: "star", name: "星星", emoji: "⭐", kind: "图形", color: "黄色", shape: "尖尖的" },
            { id: "heart", name: "爱心", emoji: "❤️", kind: "图形", color: "红色", shape: "爱心形" },
            { id: "circle", name: "圆形", emoji: "🔵", kind: "图形", color: "蓝色", shape: "圆圆的" }
        ];

        this.taskText = document.getElementById("taskText");
        this.hintText = document.getElementById("hintText");
        this.levelText = document.getElementById("levelText");
        this.scoreText = document.getElementById("scoreText");
        this.foundText = document.getElementById("foundText");
        this.itemGrid = document.getElementById("itemGrid");
        this.feedback = document.getElementById("feedback");
        this.checkBtn = document.getElementById("checkBtn");
        this.clearBtn = document.getElementById("clearBtn");
        this.nextBtn = document.getElementById("nextBtn");
        this.listenBtn = document.getElementById("listenBtn");
        this.soundBtn = document.getElementById("soundBtn");

        this.bindEvents();
        this.startLevel();
    }

    bindEvents() {
        this.checkBtn.addEventListener("click", () => this.checkAnswer());
        this.clearBtn.addEventListener("click", () => this.clearSelection());
        this.nextBtn.addEventListener("click", () => {
            this.level += 1;
            this.startLevel();
        });
        this.listenBtn.addEventListener("click", () => this.speakTask());
        this.soundBtn.addEventListener("click", () => {
            this.soundEnabled = !this.soundEnabled;
            this.soundBtn.textContent = this.soundEnabled ? "🔊" : "🔇";
            if (this.soundEnabled) this.playChime([520]);
        });
    }

    startLevel() {
        this.selectedIds.clear();
        this.currentTask = this.createTask();
        this.levelText.textContent = `第 ${this.level} 关`;
        this.scoreText.textContent = `${this.score} 分`;
        this.taskText.textContent = this.currentTask.label;
        this.hintText.textContent = this.currentTask.hint;
        this.setFeedback("先找一找，再点“检查”。", "");
        this.checkBtn.style.display = "inline-flex";
        this.nextBtn.style.display = "none";
        this.renderItems();
        this.updateProgress();
    }

    createTask() {
        const kindTasks = [
            { prop: "kind", value: "水果", label: "找出所有水果", hint: "水果可以吃，通常甜甜的。" },
            { prop: "kind", value: "文具", label: "找出所有文具", hint: "文具是画画、写字、看书会用到的。" },
            { prop: "kind", value: "玩具", label: "找出所有玩具", hint: "玩具是可以拿来玩的东西。" },
            { prop: "kind", value: "饮料", label: "找出所有饮料", hint: "饮料是可以喝的东西。" }
        ];

        const colorTasks = [
            { prop: "color", value: "红色", label: "找出红色的东西", hint: "看颜色，红红的就点一下。" },
            { prop: "color", value: "黄色", label: "找出黄色的东西", hint: "像香蕉、星星那样黄黄的。" },
            { prop: "color", value: "蓝色", label: "找出蓝色的东西", hint: "像天空一样蓝的东西。" }
        ];

        const shapeTasks = [
            { prop: "shape", value: "圆圆的", label: "找出圆圆的东西", hint: "像球一样圆圆的。" },
            { prop: "shape", value: "长长的", label: "找出长长的东西", hint: "比一比，长长的就点一下。" }
        ];

        const pool = this.level < 3
            ? kindTasks
            : this.level < 6
                ? [...kindTasks, ...colorTasks]
                : [...kindTasks, ...colorTasks, ...shapeTasks];

        return pool[(this.level - 1) % pool.length];
    }

    renderItems() {
        const rightItems = this.items.filter(item => item[this.currentTask.prop] === this.currentTask.value);
        const otherItems = this.shuffle(this.items.filter(item => item[this.currentTask.prop] !== this.currentTask.value));
        const visibleItems = this.shuffle([...rightItems, ...otherItems.slice(0, 8)]).slice(0, 12);

        this.itemGrid.innerHTML = "";
        visibleItems.forEach(item => {
            const button = document.createElement("button");
            button.className = "item-card";
            button.type = "button";
            button.dataset.id = item.id;
            button.dataset.right = item[this.currentTask.prop] === this.currentTask.value ? "true" : "false";
            button.innerHTML = `
                <div class="item-emoji">${item.emoji}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-desc">${item.kind}</div>
            `;
            button.addEventListener("click", () => this.toggleItem(button, item));
            this.itemGrid.appendChild(button);
        });
    }

    toggleItem(button, item) {
        button.classList.remove("right", "wrong");
        if (this.selectedIds.has(item.id)) {
            this.selectedIds.delete(item.id);
            button.classList.remove("selected");
        } else {
            this.selectedIds.add(item.id);
            button.classList.add("selected");
            this.playChime([620]);
        }
        this.updateProgress();
    }

    updateProgress() {
        const total = this.itemGrid.querySelectorAll('[data-right="true"]').length;
        const found = [...this.itemGrid.querySelectorAll('[data-right="true"]')]
            .filter(card => this.selectedIds.has(card.dataset.id)).length;
        this.foundText.textContent = `${found} / ${total}`;
    }

    checkAnswer() {
        const cards = [...this.itemGrid.querySelectorAll(".item-card")];
        const wrongSelected = cards.filter(card => card.dataset.right === "false" && this.selectedIds.has(card.dataset.id));
        const missed = cards.filter(card => card.dataset.right === "true" && !this.selectedIds.has(card.dataset.id));

        cards.forEach(card => {
            card.classList.remove("right", "wrong");
            if (card.dataset.right === "true" && this.selectedIds.has(card.dataset.id)) {
                card.classList.add("right");
            }
            if (card.dataset.right === "false" && this.selectedIds.has(card.dataset.id)) {
                card.classList.add("wrong");
            }
        });

        if (wrongSelected.length === 0 && missed.length === 0) {
            this.score += 10 + this.level;
            this.scoreText.textContent = `${this.score} 分`;
            this.setFeedback("全找对啦！观察得很仔细。", "good");
            this.checkBtn.style.display = "none";
            this.nextBtn.style.display = "inline-flex";
            this.playChime([520, 660, 780]);
            this.speak("全找对啦，观察得真仔细！");
            return;
        }

        if (missed.length > 0) {
            this.setFeedback(`还少 ${missed.length} 个，再找一找。`, "try");
        } else {
            this.setFeedback("有一个不符合条件，试着把它拿掉。", "try");
        }
        this.playChime([260]);
        this.speak("再看一看题目。");
    }

    clearSelection() {
        this.selectedIds.clear();
        this.itemGrid.querySelectorAll(".item-card").forEach(card => {
            card.classList.remove("selected", "right", "wrong");
        });
        this.updateProgress();
        this.setFeedback("已经重选，可以再试一次。", "");
        this.playChime([420]);
    }

    setFeedback(message, type) {
        this.feedback.textContent = message;
        this.feedback.className = type ? `feedback ${type}` : "feedback";
    }

    speakTask() {
        this.speak(this.currentTask.label);
    }

    speak(message) {
        if (!this.soundEnabled || !("speechSynthesis" in window)) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = "zh-CN";
        utterance.rate = 0.72;
        utterance.pitch = 1.05;
        utterance.volume = 0.9;

        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(item => item.lang === "zh-CN")
            || voices.find(item => item.lang && item.lang.startsWith("zh"));
        if (voice) utterance.voice = voice;

        window.speechSynthesis.speak(utterance);
    }

    getAudioContext() {
        if (!this.audioContext) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return null;
            this.audioContext = new AudioContext();
        }
        return this.audioContext;
    }

    playChime(notes) {
        if (!this.soundEnabled) return;

        const audioContext = this.getAudioContext();
        if (!audioContext) return;

        notes.forEach((frequency, index) => {
            const start = audioContext.currentTime + index * 0.13;
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(frequency, start);
            gain.gain.setValueAtTime(0.001, start);
            gain.gain.linearRampToValueAtTime(0.09, start + 0.025);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
            oscillator.start(start);
            oscillator.stop(start + 0.3);
        });
    }

    shuffle(list) {
        return [...list].sort(() => Math.random() - 0.5);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new CategoryGame();
});
