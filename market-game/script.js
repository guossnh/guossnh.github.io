class MarketGame {
    constructor() {
        this.round = 1;
        this.score = 0;
        this.stars = 0;
        this.soundEnabled = true;
        this.audioContext = null;
        this.selected = [];
        this.currentMission = null;

        this.items = [
            { id: "apple", name: "苹果", kind: "水果", emoji: "🍎" },
            { id: "banana", name: "香蕉", kind: "水果", emoji: "🍌" },
            { id: "orange", name: "橘子", kind: "水果", emoji: "🍊" },
            { id: "grape", name: "葡萄", kind: "水果", emoji: "🍇" },
            { id: "carrot", name: "胡萝卜", kind: "蔬菜", emoji: "🥕" },
            { id: "corn", name: "玉米", kind: "蔬菜", emoji: "🌽" },
            { id: "book", name: "图画书", kind: "文具", emoji: "📘" },
            { id: "pencil", name: "铅笔", kind: "文具", emoji: "✏️" },
            { id: "crayon", name: "蜡笔", kind: "文具", emoji: "🖍️" },
            { id: "milk", name: "牛奶", kind: "饮料", emoji: "🥛" },
            { id: "juice", name: "果汁", kind: "饮料", emoji: "🧃" },
            { id: "bear", name: "小熊", kind: "玩具", emoji: "🧸" },
            { id: "car", name: "小汽车", kind: "玩具", emoji: "🚗" },
            { id: "ball", name: "皮球", kind: "玩具", emoji: "⚽" }
        ];

        this.missionText = document.getElementById("missionText");
        this.missionChips = document.getElementById("missionChips");
        this.roundText = document.getElementById("roundText");
        this.scoreText = document.getElementById("scoreText");
        this.starText = document.getElementById("starText");
        this.shelfGrid = document.getElementById("shelfGrid");
        this.basketGrid = document.getElementById("basketGrid");
        this.feedback = document.getElementById("feedback");
        this.checkBtn = document.getElementById("checkBtn");
        this.nextBtn = document.getElementById("nextBtn");
        this.clearBtn = document.getElementById("clearBtn");
        this.listenBtn = document.getElementById("listenBtn");
        this.soundBtn = document.getElementById("soundBtn");

        this.bindEvents();
        this.startRound();
    }

    bindEvents() {
        this.checkBtn.addEventListener("click", () => this.checkBasket());
        this.nextBtn.addEventListener("click", () => this.nextRound());
        this.clearBtn.addEventListener("click", () => this.clearBasket());
        this.listenBtn.addEventListener("click", () => this.speakMission());
        this.soundBtn.addEventListener("click", () => {
            this.soundEnabled = !this.soundEnabled;
            this.soundBtn.textContent = this.soundEnabled ? "🔊" : "🔇";
            if (this.soundEnabled) this.playChime([520]);
        });
    }

    startRound() {
        this.selected = [];
        this.currentMission = this.createMission();
        this.renderMission();
        this.renderShelf();
        this.renderBasket();
        this.setFeedback("选好以后点“检查购物篮”。", "");
        this.nextBtn.style.display = "none";
        this.checkBtn.style.display = "inline-flex";
        this.updateStats();
        setTimeout(() => this.speakMission(), 350);
    }

    createMission() {
        const kindMissions = [
            { kind: "水果", count: this.randomCount(2, 4) },
            { kind: "文具", count: this.randomCount(1, 3) },
            { kind: "玩具", count: this.randomCount(1, 3) },
            { kind: "蔬菜", count: this.randomCount(1, 3) },
            { kind: "饮料", count: this.randomCount(1, 2) }
        ];

        const mixedMissions = [
            [{ kind: "水果", count: 2 }, { kind: "文具", count: 1 }],
            [{ kind: "水果", count: 1 }, { kind: "玩具", count: 2 }],
            [{ kind: "蔬菜", count: 2 }, { kind: "饮料", count: 1 }],
            [{ kind: "文具", count: 2 }, { kind: "玩具", count: 1 }],
            [{ kind: "水果", count: 2 }, { kind: "饮料", count: 1 }]
        ];

        if (this.round < 3) {
            return { goals: [kindMissions[(this.round - 1) % kindMissions.length]] };
        }

        const mission = mixedMissions[(this.round - 3) % mixedMissions.length];
        const bonus = this.round > 6 && this.round % 2 === 0
            ? [{ kind: "蔬菜", count: 1 }]
            : [];
        return { goals: [...mission, ...bonus] };
    }

    randomCount(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    renderMission() {
        const parts = this.currentMission.goals.map(goal => `${goal.count}个${goal.kind}`);
        this.roundText.textContent = `第 ${this.round} 关`;
        this.missionText.textContent = `请买：${parts.join(" + ")}`;
        this.missionChips.innerHTML = "";

        this.currentMission.goals.forEach(goal => {
            const chip = document.createElement("div");
            chip.className = "mission-chip";
            chip.dataset.kind = goal.kind;
            chip.innerHTML = `<span>${goal.kind}</span><strong>0 / ${goal.count}</strong>`;
            this.missionChips.appendChild(chip);
        });
    }

    renderShelf() {
        const missionKinds = this.currentMission.goals.map(goal => goal.kind);
        const usefulItems = this.items.filter(item => missionKinds.includes(item.kind));
        const distractors = this.shuffle(this.items.filter(item => !missionKinds.includes(item.kind))).slice(0, 6);
        const shelfItems = this.shuffle([...usefulItems, ...distractors]).slice(0, 12);

        this.shelfGrid.innerHTML = "";
        shelfItems.forEach(item => {
            const button = document.createElement("button");
            button.className = "item-card";
            button.type = "button";
            button.dataset.id = item.id;
            button.innerHTML = `
                <div class="item-emoji">${item.emoji}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-kind">${item.kind}</div>
            `;
            button.addEventListener("click", () => this.toggleItem(item));
            this.shelfGrid.appendChild(button);
        });
    }

    renderBasket() {
        const totalNeeded = this.currentMission.goals.reduce((sum, goal) => sum + goal.count, 0);
        this.basketGrid.innerHTML = "";

        for (let i = 0; i < totalNeeded; i++) {
            const slot = document.createElement("div");
            const item = this.selected[i];
            slot.className = item ? "basket-slot filled" : "basket-slot";
            slot.textContent = item ? item.emoji : "+";
            this.basketGrid.appendChild(slot);
        }

        this.updateMissionProgress();
    }

    toggleItem(item) {
        const totalNeeded = this.currentMission.goals.reduce((sum, goal) => sum + goal.count, 0);
        const existingIndex = this.selected.findIndex(selectedItem => selectedItem.id === item.id);
        const shelfButton = this.shelfGrid.querySelector(`[data-id="${item.id}"]`);

        if (existingIndex >= 0) {
            this.selected.splice(existingIndex, 1);
            shelfButton.classList.remove("selected");
        } else {
            if (this.selected.length >= totalNeeded) {
                this.setFeedback("购物篮满了，先检查一下，或者清空重选。", "try");
                this.playChime([260]);
                return;
            }
            this.selected.push(item);
            shelfButton.classList.add("selected");
            this.playChime([620]);
        }

        this.renderBasket();
    }

    clearBasket() {
        this.selected = [];
        this.shelfGrid.querySelectorAll(".item-card").forEach(card => card.classList.remove("selected"));
        this.renderBasket();
        this.setFeedback("购物篮已经清空，可以重新选择。", "");
        this.playChime([420]);
    }

    checkBasket() {
        const result = this.getMissionResult();
        const totalNeeded = this.currentMission.goals.reduce((sum, goal) => sum + goal.count, 0);

        if (this.selected.length < totalNeeded) {
            this.setFeedback(`还少 ${totalNeeded - this.selected.length} 个东西，再找找货架。`, "try");
            this.playChime([260]);
            return;
        }

        if (result.ok) {
            this.score += 10 + this.round * 2;
            this.stars += 1;
            this.updateStats();
            this.setFeedback("买对啦！你会看购物单，也会数数量。", "good");
            this.checkBtn.style.display = "none";
            this.nextBtn.style.display = "inline-flex";
            this.markMissionDone();
            this.playChime([520, 660, 780]);
            this.speak("买对啦，真棒！");
        } else {
            this.setFeedback(result.message, "try");
            this.playChime([260]);
            this.speak("再看一看购物单。");
        }
    }

    getMissionResult() {
        const counts = this.countSelectedByKind();

        for (const goal of this.currentMission.goals) {
            const current = counts[goal.kind] || 0;
            if (current < goal.count) {
                return { ok: false, message: `${goal.kind}还少 ${goal.count - current} 个。` };
            }
            if (current > goal.count) {
                return { ok: false, message: `${goal.kind}多了 ${current - goal.count} 个。` };
            }
        }

        const allowedKinds = this.currentMission.goals.map(goal => goal.kind);
        const extra = this.selected.find(item => !allowedKinds.includes(item.kind));
        if (extra) {
            return { ok: false, message: `${extra.name}不是这次购物单里的东西。` };
        }

        return { ok: true };
    }

    countSelectedByKind() {
        return this.selected.reduce((counts, item) => {
            counts[item.kind] = (counts[item.kind] || 0) + 1;
            return counts;
        }, {});
    }

    updateMissionProgress() {
        const counts = this.countSelectedByKind();
        this.currentMission.goals.forEach(goal => {
            const chip = this.missionChips.querySelector(`[data-kind="${goal.kind}"]`);
            const current = Math.min(counts[goal.kind] || 0, goal.count);
            chip.querySelector("strong").textContent = `${current} / ${goal.count}`;
            chip.classList.toggle("done", current === goal.count);
        });
    }

    markMissionDone() {
        this.missionChips.querySelectorAll(".mission-chip").forEach(chip => chip.classList.add("done"));
    }

    nextRound() {
        this.round += 1;
        this.startRound();
    }

    updateStats() {
        this.scoreText.textContent = this.score;
        this.starText.textContent = this.stars;
    }

    setFeedback(message, type) {
        this.feedback.textContent = message;
        this.feedback.className = type ? `feedback ${type}` : "feedback";
    }

    speakMission() {
        const parts = this.currentMission.goals.map(goal => `${goal.count}个${goal.kind}`);
        this.speak(`请买${parts.join("，")}`);
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
    new MarketGame();
});
