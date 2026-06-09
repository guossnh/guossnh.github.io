class CountingGame {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.currentQuestion = null;
        this.soundEnabled = true;
        this.objects = [];
        this.correctAnswer = 0;
        this.dragMode = false; // 拖拽模式
        this.draggedCount = 0; // 已拖拽计数
        this.draggedItems = []; // 已拖拽的物品列表
        
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
        this.createDragElements();
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
                // 成功音效：先播放上升音调，然后添加鼓掌声
                const correctNow = this.audioContext.currentTime;
                
                // 第一部分：上升音调（类似胜利的号角）
                oscillator.frequency.setValueAtTime(523.25, correctNow); // C5
                oscillator.frequency.setValueAtTime(659.25, correctNow + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, correctNow + 0.2); // G5
                oscillator.frequency.setValueAtTime(1046.50, correctNow + 0.3); // C6
                
                // 第二部分：添加轻柔的鼓掌声（在音调之后）
                setTimeout(() => {
                    if (this.soundEnabled && this.audioContext) {
                        // 创建3个轻柔的掌声
                        for (let i = 0; i < 3; i++) {
                            const osc = this.audioContext.createOscillator();
                            const gain = this.audioContext.createGain();
                            
                            osc.connect(gain);
                            gain.connect(this.audioContext.destination);
                            
                            // 比encourage更轻柔的频率
                            const freq = 150 + Math.random() * 300; // 150-450Hz
                            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * 0.08);
                            osc.type = 'square';
                            
                            // 更轻柔的音量
                            gain.gain.setValueAtTime(0.08, this.audioContext.currentTime + i * 0.08);
                            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.08 + 0.1);
                            
                            osc.start(this.audioContext.currentTime + i * 0.08);
                            osc.stop(this.audioContext.currentTime + i * 0.08 + 0.1);
                        }
                    }
                }, 400); // 在音调音效之后400ms开始
                break;
            case 'wrong':
                // 更温和的提示音效 - 下降音调
                oscillator.frequency.setValueAtTime(392, this.audioContext.currentTime); // G4
                oscillator.frequency.setValueAtTime(349.23, this.audioContext.currentTime + 0.1); // F4
                oscillator.frequency.setValueAtTime(293.66, this.audioContext.currentTime + 0.2); // D4
                oscillator.frequency.setValueAtTime(261.63, this.audioContext.currentTime + 0.3); // C4
                break;
            case 'click':
                oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
                break;
            case 'drag':
                oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime); // 拖拽音效
                oscillator.type = 'sine';
                break;
            case 'drop':
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime); // 放置音效
                oscillator.type = 'triangle';
                break;
            case 'encourage':
                // 鼓掌音效 - 模拟掌声的随机频率
                const now = this.audioContext.currentTime;
                // 创建多个快速的声音来模拟掌声
                for (let i = 0; i < 5; i++) {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    
                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);
                    
                    // 随机频率来模拟手掌碰撞的声音
                    const freq = 200 + Math.random() * 400; // 200-600Hz的随机频率
                    osc.frequency.setValueAtTime(freq, now + i * 0.05);
                    
                    // 使用噪声类型来更像掌声
                    osc.type = 'square';
                    
                    // 快速衰减
                    gain.gain.setValueAtTime(0.1, now + i * 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.1);
                    
                    osc.start(now + i * 0.05);
                    osc.stop(now + i * 0.05 + 0.1);
                }
                return; // 提前返回，避免重复设置
        }
        
        gainNode.gain.setValueAtTime(0.16, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.6);
    }
    
    // 语音鼓励消息
    speak(message) {
        if ('speechSynthesis' in window && this.soundEnabled) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.72; // 更慢一点，适合小朋友听清楚
            utterance.pitch = 1.05; // 不要太尖，听起来更柔和
            utterance.volume = 0.85;
            
            // 使用女声
            const voices = speechSynthesis.getVoices();
            const femaleVoice = voices.find(voice => voice.lang.includes('zh') && voice.name.includes('女'));
            if (femaleVoice) {
                utterance.voice = femaleVoice;
            }
            
            speechSynthesis.speak(utterance);
        }
    }
    
    // 获取鼓励消息
    getEncouragementMessage(isCorrect) {
        const correctMessages = [
            '太棒了！你真聪明！',
            '答对了！继续加油！',
            '你真是个小天才！',
            '太厉害了！',
            '完全正确！',
            '你真棒！妈妈为你骄傲！',
            '好样的！爸爸很高兴！',
            '你真是个数学小能手！'
        ];
        
        const wrongMessages = [
            '没关系，再试试看！',
            '别灰心，你可以的！',
            '再数一遍，慢慢来！',
            '加油！你一定能做到！',
            '再试一次，相信自己！',
            '慢慢来，细心一点！',
            '很棒的努力，继续加油！'
        ];
        
        const messages = isCorrect ? correctMessages : wrongMessages;
        return messages[Math.floor(Math.random() * messages.length)];
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
        this.modeToggle = document.getElementById('modeToggle');
    }
    
    // 创建自由拖拽区域
    createDragElements() {
        // 创建自由拖拽区域
        this.dragArea = document.createElement('div');
        this.dragArea.className = 'drag-area';
        this.dragArea.innerHTML = `
            <div class="drag-counter">已移动：<span id="dragCount">0</span> 个</div>
        `;
        this.objectsContainer.parentNode.insertBefore(this.dragArea, this.objectsContainer.nextSibling);
        
        // 拖拽计数器
        this.dragCounter = document.getElementById('dragCount');
        
        // 拖拽区域的位置信息
        this.dragAreaRect = null;
        
        // 更新拖拽区域位置信息
        setTimeout(() => {
            this.dragAreaRect = this.dragArea.getBoundingClientRect();
        }, 100);
    }
    
    bindEvents() {
        // 模式切换
        this.modeToggle.addEventListener('click', () => {
            this.dragMode = !this.dragMode;
            this.modeToggle.textContent = this.dragMode ? '👆 点击模式' : '🖐️ 拖拽模式';
            this.modeToggle.classList.toggle('active', this.dragMode);
            this.playSound('click');
            
            // 重新生成题目以应用新模式
            this.generateQuestion();
            
            // 显示模式切换提示
            this.showModeFeedback();
        });
        
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
        
        // 拖拽事件绑定
        this.bindDragEvents();
        
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
    
    showModeFeedback() {
        const modeText = this.dragMode ? '拖拽模式' : '点击模式';
        this.feedbackMessage.textContent = `已切换到${modeText}！`;
        this.feedbackMessage.style.backgroundColor = '#4CAF50';
        this.feedbackMessage.style.color = 'white';
        this.feedbackArea.style.display = 'block';
        
        // 语音反馈
        if (this.soundEnabled) {
            setTimeout(() => {
                this.speak(`已切换到${modeText}`);
            }, 200);
        }
        
        // 3秒后自动隐藏
        setTimeout(() => {
            this.feedbackArea.style.display = 'none';
        }, 3000);
    }
    
    // 绑定自由拖拽事件 - 简化版本，主要处理窗口大小变化
    bindDragEvents() {
        // 触摸事件处理 - 使用实例变量而不是局部变量
        this.touchItem = null;
        this.touchOffset = { x: 0, y: 0 };
        this.originalPosition = { x: 0, y: 0 };
        
        // 窗口大小改变时更新拖拽区域信息
        window.addEventListener('resize', () => {
            if (this.dragArea) {
                this.dragAreaRect = this.dragArea.getBoundingClientRect();
            }
        });
    }
    
    // 处理自由拖拽
    handleFreeDrag(item) {
        if (!this.dragMode) return;

        // 如果是第一次拖拽这个物品，增加计数
        if (!item.classList.contains('dragged')) {
            item.classList.add('dragged');
            this.draggedCount++;
            this.dragCounter.textContent = this.draggedCount;
            this.dragCounter.parentElement.classList.add('show');
            
            // 每拖拽3个物品播放一次鼓励音效
            if (this.draggedCount % 3 === 0) {
                this.playSound('encourage');
            }
        }

        // 播放拖拽音效
        this.playSound('drop');

        // 显示拖拽计数
        this.dragArea.classList.add('active');

        // 检查是否所有物品都被拖拽过
        if (this.draggedCount === this.correctAnswer) {
            // 不再语音提示，让小朋友安静地选择答案
            // 可以添加温和的视觉反馈
        }
    }
    
    // 添加点击事件（非拖拽模式）
    addClickEvents(objectElement) {
        objectElement.addEventListener('click', () => {
            if (objectElement.classList.contains('clicked')) return;
            
            objectElement.classList.add('clicked');
            objectElement.style.opacity = '0.5';
            this.playSound('click');
            
            // 简单的计数逻辑 - 只显示计数，不自动提交答案
            const clickedCount = this.objects.filter(obj => obj.classList.contains('clicked')).length;
            
            // 显示计数提示，但不自动提交
            if (clickedCount === this.correctAnswer) {
                // 只是视觉提示，让小朋友自己选择答案，不再语音播报
                // 可以添加一个温和的视觉反馈
            }
        });
        
        objectElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!objectElement.classList.contains('clicked')) {
                objectElement.click();
            }
        });
    }
    
    // 添加自由拖拽事件
    addDragEvents(objectElement) {
        let isDragging = false;
        let startX, startY, initialX, initialY;
        
        // 统一的拖拽处理函数
        const handleDragStart = (clientX, clientY) => {
            isDragging = true;
            startX = clientX;
            startY = clientY;
            initialX = parseInt(objectElement.style.left) || 0;
            initialY = parseInt(objectElement.style.top) || 0;
            
            // 确保拖拽元素在最上层
            objectElement.style.zIndex = '1000';
            
            this.playSound('drag');
            objectElement.classList.add('dragging');
            this.dragArea.classList.add('dragging');
        };
        
        const handleDragMove = (clientX, clientY) => {
            if (!isDragging) return;
            
            const deltaX = clientX - startX;
            const deltaY = clientY - startY;
            
            let newX = initialX + deltaX;
            let newY = initialY + deltaY;
            
            // 约束在拖拽区域内
            const dragAreaRect = this.dragArea.getBoundingClientRect();
            const itemSize = 100;
            
            newX = Math.max(0, Math.min(newX, dragAreaRect.width - itemSize));
            newY = Math.max(0, Math.min(newY, dragAreaRect.height - itemSize));
            
            objectElement.style.left = newX + 'px';
            objectElement.style.top = newY + 'px';
        };
        
        const handleDragEnd = () => {
            if (!isDragging) return;
            
            isDragging = false;
            objectElement.classList.remove('dragging');
            this.dragArea.classList.remove('dragging');
            
            // 恢复元素的z-index
            objectElement.style.zIndex = '15';
            
            // 处理拖拽逻辑
            this.handleFreeDrag(objectElement);
        };
        
        // 触摸事件
        objectElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            handleDragStart(touch.clientX, touch.clientY);
        });
        
        objectElement.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const touch = e.touches[0];
            handleDragMove(touch.clientX, touch.clientY);
        });
        
        objectElement.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleDragEnd();
        });
        
        // 鼠标事件（桌面设备支持）
        objectElement.addEventListener('mousedown', (e) => {
            e.preventDefault();
            handleDragStart(e.clientX, e.clientY);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            handleDragMove(e.clientX, e.clientY);
        });
        
        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            handleDragEnd();
        });
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
        
        // 确保答案区域可见
        this.answerOptions.style.display = 'grid';
        console.log('答案选项区域已清空并设置为grid显示');
        
        // 重置拖拽状态
        this.draggedCount = 0;
        this.draggedItems = [];
        
        // 重置点击状态（如果有的话）
        this.clickedCount = 0;
        
        // 根据模式显示或隐藏容器
        if (this.dragMode) {
            this.dragArea.style.display = 'block';
            this.dragArea.classList.remove('active');
            this.dragCounter.textContent = '0';
            // 清空拖拽区域
            const existingItems = this.dragArea.querySelectorAll('.draggable-item');
            existingItems.forEach(item => item.remove());
            // 隐藏点击模式容器
            this.objectsContainer.style.display = 'none';
        } else {
            // 确保在点击模式下拖拽区域完全隐藏
            this.dragArea.style.display = 'none';
            // 显示点击模式容器
            this.objectsContainer.style.display = 'flex';
        }
        
        // 生成物品
        this.objects = [];
        for (let i = 0; i < this.correctAnswer; i++) {
            const objectElement = document.createElement('div');
            objectElement.className = 'object-item';
            objectElement.textContent = objectType;
            objectElement.style.background = this.getRandomColor();
            
            // 根据模式添加不同的事件
            if (this.dragMode) {
                this.addDragEvents(objectElement);
                // 将物品添加到拖拽区域
                this.dragArea.appendChild(objectElement);
                
                // 立即设置元素为可拖拽并添加初始位置
                objectElement.classList.add('draggable-item');
                objectElement.style.position = 'absolute';
                
                // 使用双重requestAnimationFrame确保拖拽区域完全渲染后再计算位置
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        const areaRect = this.dragArea.getBoundingClientRect();
                        const itemSize = 80; // 预估物品大小
                        const padding = 20;
                        
                        // 确保在拖拽区域内生成，避免遮挡
                        const maxX = Math.max(0, areaRect.width - itemSize - padding * 2);
                        const maxY = Math.max(0, areaRect.height - itemSize - padding * 2 - 60); // 减去计数器高度和较小边距
                        
                        // 如果区域太小或元素太多，使用网格布局
                        if (maxX < 80 || maxY < 80 || this.correctAnswer > 8) {
                            // 网格布局，确保元素不会重叠
                            const cols = Math.min(Math.floor(Math.sqrt(this.correctAnswer)), Math.floor(maxX / (itemSize + 10)));
                            const rows = Math.ceil(this.correctAnswer / Math.max(cols, 1));
                            const col = i % Math.max(cols, 1);
                            const row = Math.floor(i / Math.max(cols, 1));
                            
                            const cellWidth = maxX / Math.max(cols, 1);
                            const cellHeight = maxY / Math.max(rows, 1);
                            
                            const gridX = col * cellWidth + Math.max(10, (cellWidth - itemSize) / 2) + padding;
                            const gridY = row * cellHeight + Math.max(10, (cellHeight - itemSize) / 2) + padding + 60;
                            
                            objectElement.style.left = Math.min(gridX, maxX) + 'px';
                            objectElement.style.top = Math.min(gridY, maxY) + 'px';
                        } else {
                            // 随机位置，但确保在有效区域内，并避免边缘
                            const safePadding = padding + 10;
                            const randomX = Math.random() * Math.max(0, maxX - safePadding) + safePadding;
                            const randomY = Math.random() * Math.max(0, maxY - safePadding) + safePadding + 60;
                            
                            objectElement.style.left = randomX + 'px';
                            objectElement.style.top = randomY + 'px';
                        }
                    });
                });
            } else {
                this.addClickEvents(objectElement);
                this.objectsContainer.appendChild(objectElement);
            }
            
            // 添加进入动画
            setTimeout(() => {
                objectElement.style.animation = `bounceIn 0.5s ease ${i * 0.1}s both`;
            }, i * 100);
            
            this.objects.push(objectElement);
        }
        
        // 生成答案选项
        const options = this.generateAnswerOptions();
        console.log('生成答案选项，数量:', options.length);
        
        // 强制清除所有现有按钮和事件监听器
        this.answerOptions.innerHTML = '';
        
        options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = option;
            button.disabled = false; // 确保按钮是可点击的
            console.log('创建按钮:', option, 'disabled状态:', button.disabled);
            
            // 使用具名函数而不是箭头函数，确保事件监听器正确绑定
            const handleClick = () => {
                console.log('按钮被点击:', option);
                this.checkAnswer(option);
            };
            
            const handleTouch = (e) => {
                e.preventDefault();
                console.log('按钮被触摸:', option);
                this.checkAnswer(option);
            };
            
            button.addEventListener('click', handleClick);
            button.addEventListener('touchstart', handleTouch);
            
            // 添加延迟动画
            setTimeout(() => {
                button.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s both`;
            }, 500 + index * 100);
            
            this.answerOptions.appendChild(button);
        });
        
        // 更新问题文本 - 不直接显示数量，让小朋友自己数
        const modeText = this.dragMode ? '拖拽' : '点击';
        this.questionElement.textContent = `${modeText}${objectType}，数一数有多少个？`;
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
    
    checkAnswer(selectedAnswer) {
        const answerBtns = this.answerOptions.querySelectorAll('.answer-btn');
        console.log('检查答案，当前选择:', selectedAnswer, '正确答案:', this.correctAnswer);
        
        if (answerBtns.length === 0) {
            console.log('警告：没有找到答案按钮！');
            return;
        }
        
        // 清除之前的状态
        answerBtns.forEach(btn => {
            btn.classList.remove('correct', 'wrong');
        });
        
        if (selectedAnswer === this.correctAnswer) {
            // 答对了
            answerBtns.forEach(btn => {
                btn.disabled = true; // 答对了就禁用所有按钮
                if (parseInt(btn.textContent) === this.correctAnswer) {
                    btn.classList.add('correct');
                }
            });
            
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
            
            // 显示下一题按钮
            this.nextBtn.style.display = 'inline-block';
            this.feedbackArea.style.display = 'block';
            
        } else {
            // 答错了，允许继续选择
            answerBtns.forEach(btn => {
                btn.disabled = false; // 保持按钮可点击
                if (parseInt(btn.textContent) === selectedAnswer) {
                    btn.classList.add('wrong'); // 标记错误选择
                }
            });
            
            this.feedbackMessage.textContent = `😊 再试试！还有${this.correctAnswer}个哦`;
            this.feedbackMessage.className = 'feedback-message error';
            this.playSound('wrong');
            
            // 错误时播放温和的鼓励音效
            setTimeout(() => {
                this.playSound('encourage');
            }, 300);
            
            // 显示反馈但不显示下一题按钮
            this.nextBtn.style.display = 'none';
            this.feedbackArea.style.display = 'block';
        }
        
        this.updateDisplay();
        
        // 只在点击模式下且答对时隐藏拖拽区域
        if (!this.dragMode && selectedAnswer === this.correctAnswer) {
            this.dragArea.style.display = 'none';
        }
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
