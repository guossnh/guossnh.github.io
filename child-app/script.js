class CountingGame {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.currentQuestion = null;
        this.soundEnabled = true;
        this.objects = [];
        this.correctAnswer = 0;
        
        // 音效使用Web Audio API创建
        this.audioContext = null;
        this.initAudio();
        
        // 可爱的物品emoji数组
        this.objectTypes = [
            '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
            '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆',
            '🐝', '🐛', '🦋', '🐌', '🐞', '🐢', '🐍', '🦎', '🐙', '🦑',
            '🌸', '🌺', '🌻', '🌷', '🌹', '🍎', '🍌', '🍊', '🍓', '🍇',
            '🌟', '⭐', '💫', '✨', '🎈', '🎁', '🎨', '🎵', '🌈', '🦄'
        ];
        
        this.initializeElements();
        this.bindEvents();
        this.generateQuestion();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    // 创建简单的音效
    playSound(type) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        switch (type) {
            case 'correct':
                oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2); // G5
                break;
            case 'wrong':
                oscillator.frequency.setValueAtTime(392, this.audioContext.currentTime); // G4
                oscillator.frequency.setValueAtTime(349.23, this.audioContext.currentTime + 0.1); // F4
                oscillator.frequency.setValueAtTime(293.66, this.audioContext.currentTime + 0.2); // D4
                break;
            case 'click':
                oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
                break;
        }
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    initializeElements() {
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.questionElement = document.getElementById('question');
        this.objectsContainer = document.getElementById('objectsContainer');
        this.answerOptions = document.getElementById('answerOptions');
        this.feedbackArea = document.getElementById('feedbackArea');
        this.feedbackMessage = document.getElementById('feedbackMessage');
        this.nextBtn = document.getElementById('nextBtn');
        this.soundToggle = document.getElementById('soundToggle');
        this.resetBtn = document.getElementById('resetBtn');
    }
    
    bindEvents() {
        // 声音开关
        this.soundToggle.addEventListener('click', () => {
            this.soundEnabled = !this.soundEnabled;
            this.soundToggle.textContent = this.soundEnabled ? '🔊 声音' : '🔇 静音';
            this.playSound('click');
        });
        
        // 重新开始
        this.resetBtn.addEventListener('click', () => {
            this.score = 0;
            this.level = 1;
            this.updateDisplay();
            this.generateQuestion();
            this.playSound('click');
        });
        
        // 下一题按钮
        this.nextBtn.addEventListener('click', () => {
            this.generateQuestion();
            this.playSound('click');
        });
        
        // 防止双击缩放
        document.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(e) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
    
    generateQuestion() {
        // 根据关卡决定难度
        const maxCount = Math.min(5 + this.level * 2, 15);
        this.correctAnswer = Math.floor(Math.random() * maxCount) + 1;
        
        // 随机选择物品类型
        const objectType = this.objectTypes[Math.floor(Math.random() * this.objectTypes.length)];
        
        // 清除之前的状态
        this.objectsContainer.innerHTML = '';
        this.answerOptions.innerHTML = '';
        this.feedbackArea.style.display = 'none';
        this.nextBtn.style.display = 'none';
        
        // 生成物品
        this.objects = [];
        for (let i = 0; i < this.correctAnswer; i++) {
            const objectElement = document.createElement('div');
            objectElement.className = 'object-item';
            objectElement.textContent = objectType;
            objectElement.style.background = this.getRandomColor();
            
            // 添加触屏事件
            objectElement.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleObjectTouch(objectElement);
            });
            
            objectElement.addEventListener('click', () => {
                this.handleObjectTouch(objectElement);
            });
            
            // 添加进入动画
            setTimeout(() => {
                objectElement.style.animation = `bounceIn 0.5s ease ${i * 0.1}s both`;
            }, i * 100);
            
            this.objectsContainer.appendChild(objectElement);
            this.objects.push(objectElement);
        }
        
        // 生成答案选项
        const options = this.generateAnswerOptions();
        options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = option;
            button.addEventListener('click', () => this.checkAnswer(option));
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.checkAnswer(option);
            });
            
            // 添加延迟动画
            setTimeout(() => {
                button.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s both`;
            }, 500 + index * 100);
            
            this.answerOptions.appendChild(button);
        });
        
        // 更新问题文本
        this.questionElement.textContent = `数一数有几个${objectType}？`;
    }
    
    generateAnswerOptions() {
        const options = [this.correctAnswer];
        const maxOption = Math.max(8, this.correctAnswer + 3);
        
        while (options.length < 4) {
            const wrongAnswer = Math.floor(Math.random() * maxOption) + 1;
            if (!options.includes(wrongAnswer) && wrongAnswer !== this.correctAnswer) {
                options.push(wrongAnswer);
            }
        }
        
        // 随机打乱选项
        return options.sort(() => Math.random() - 0.5);
    }
    
    handleObjectTouch(objectElement) {
        if (objectElement.classList.contains('touched')) return;
        
        objectElement.classList.add('touched');
        this.playSound('click');
        
        // 显示计数
        const touchedCount = this.objects.filter(obj => obj.classList.contains('touched')).length;
        this.showCountFeedback(touchedCount);
    }
    
    showCountFeedback(count) {
        const feedback = document.createElement('div');
        feedback.textContent = `已经点了 ${count} 个！`;
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 193, 7, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 1.2rem;
            font-weight: bold;
            z-index: 1000;
            animation: fadeInOut 1s ease;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            document.body.removeChild(feedback);
        }, 1000);
    }
    
    checkAnswer(selectedAnswer) {
        const answerBtns = this.answerOptions.querySelectorAll('.answer-btn');
        answerBtns.forEach(btn => {
            btn.disabled = true;
            if (parseInt(btn.textContent) === this.correctAnswer) {
                btn.classList.add('correct');
            } else if (parseInt(btn.textContent) === selectedAnswer && selectedAnswer !== this.correctAnswer) {
                btn.classList.add('wrong');
            }
        });
        
        this.feedbackArea.style.display = 'block';
        
        if (selectedAnswer === this.correctAnswer) {
            this.score += 10 * this.level;
            this.feedbackMessage.textContent = '🎉 太棒了！答对了！';
            this.feedbackMessage.className = 'feedback-message success';
            this.playSound('correct');
            
            // 升级逻辑
            if (this.score >= this.level * 50) {
                this.level++;
                setTimeout(() => {
                    alert(`🎊 恭喜升级到第 ${this.level} 关！`);
                }, 1000);
            }
        } else {
            this.feedbackMessage.textContent = `😊 再试试！正确答案是 ${this.correctAnswer} 个`;
            this.feedbackMessage.className = 'feedback-message error';
            this.playSound('wrong');
        }
        
        this.updateDisplay();
        this.nextBtn.style.display = 'inline-block';
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
    }
    
    getRandomColor() {
        const colors = [
            'linear-gradient(135deg, #ff6b6b, #ee5a24)',
            'linear-gradient(135deg, #2ed573, #1e90ff)',
            'linear-gradient(135deg, #ffa502, #ff6348)',
            'linear-gradient(135deg, #3742fa, #2f3542)',
            'linear-gradient(135deg, #ff3838, #ff9ff3)',
            'linear-gradient(135deg, #7bed9f, #70a1ff)',
            'linear-gradient(135deg, #ffb142, #ff5252)',
            'linear-gradient(135deg, #34e7e4, #3d5afe)'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

// 添加CSS动画
const additionalStyles = `
@keyframes bounceIn {
    0% {
        opacity: 0;
        transform: scale(0.3);
    }
    50% {
        opacity: 1;
        transform: scale(1.05);
    }
    70% {
        transform: scale(0.9);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes fadeInUp {
    0% {
        opacity: 0;
        transform: translateY(30px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
}
`;

// 添加样式到页面
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new CountingGame();
});

// 处理页面可见性变化，优化性能
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面隐藏时暂停游戏
        console.log('游戏暂停');
    } else {
        // 页面显示时恢复游戏
        console.log('游戏继续');
    }
});