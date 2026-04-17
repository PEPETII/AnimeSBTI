// ===================== 全局状态 =====================
let currentQuestion = 0;
let userAnswers = [];
let activeQuestions = [];
const QUIZ_COUNT = 20;
let currentResultCode = '';
let cachedCharDataURL = ''; // 缓存角色图片的 dataURL，用于海报导出

// ===================== 页面导航 =====================
function showPage(pageId) {
    ['page-home', 'page-quiz', 'page-result', 'page-gallery'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(pageId).classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 初始化图鉴页
    if (pageId === 'page-gallery') {
        renderGallery();
    }
    // 初始化首页
    if (pageId === 'page-home') {
        renderHeroCharacters();
        renderPreviewGrid();
        renderArtDemo();
        animateCounters();
    }
}

// ===================== 移动端菜单 =====================
function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('hidden');
    document.getElementById('mobile-menu').classList.toggle('show');
}
function closeMobileMenu() {
    document.getElementById('mobile-menu').classList.add('hidden');
    document.getElementById('mobile-menu').classList.remove('show');
}

// ===================== 导航栏滚动效果 =====================
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===================== 数字动画 =====================
function animateCounters() {
    document.querySelectorAll('.stat-number[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target);
        const duration = 1500;
        const start = performance.now();
        el.textContent = '0';
        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    });
}

// ===================== 角色预览网格（首页） =====================
function renderPreviewGrid() {
    const grid = document.getElementById('preview-grid');
    if (grid.children.length > 0) return; // 已渲染
    const allChars = Object.values(characters);
    // 随机选 16 个有图片的角色
    const withImages = allChars.filter(c => c.image);
    const shuffled = withImages.sort(() => Math.random() - 0.5).slice(0, 16);
    shuffled.forEach(char => {
        const card = document.createElement('div');
        card.className = 'preview-card';
        card.innerHTML = `
            <img src="${char.image}" alt="${char.name}" loading="lazy">
            <div class="preview-name">${char.name}</div>
        `;
        grid.appendChild(card);
    });
}

// ===================== Hero 角色形象展示条 =====================
function renderHeroCharacters() {
    const container = document.getElementById('hero-characters');
    if (!container || container.children.length > 0) return;
    // 展示全部81个角色
    const allChars = Object.values(characters);
    allChars.forEach(ch => {
        if (!ch.image) return;
        const img = document.createElement('img');
        img.src = ch.image;
        img.alt = ch.name;
        img.title = ch.name + ' - ' + ch.anime;
        img.loading = 'lazy';
        container.appendChild(img);
    });
}

// ===================== 插画展示演示（首页） =====================
function renderArtDemo() {
    const demo = document.getElementById('art-demo');
    if (!demo || demo.children.length > 0) return;
    const allChars = Object.values(characters);
    const withImages = allChars.filter(c => c.image);
    // 选4个经典角色
    const picks = ['char-2211-luffy.jpg', 'char-2222-naruto.jpg', 'char-2000-saitama.jpg', 'char-1000-lelouch.jpg'];
    const found = [];
    picks.forEach(p => {
        const ch = withImages.find(c => c.image === p);
        if (ch) found.push(ch);
    });
    // 如果不够4个就随机补
    while (found.length < 4) {
        const r = withImages[Math.floor(Math.random() * withImages.length)];
        if (!found.includes(r)) found.push(r);
    }
    found.slice(0, 4).forEach(ch => {
        const img = document.createElement('img');
        img.src = ch.image;
        img.alt = ch.name;
        img.loading = 'lazy';
        demo.appendChild(img);
    });
}

// ===================== 角色图鉴页 =====================
function renderGallery(filter) {
    const grid = document.getElementById('gallery-grid');
    const countEl = document.getElementById('gallery-count');
    grid.innerHTML = '';
    const allChars = Object.values(characters);
    const filtered = filter && filter !== 'all'
        ? allChars.filter(c => {
            const code = Object.keys(characters).find(k => characters[k] === c) || '';
            const a = parseInt(code[0]);
            if (filter === '冷静') return a === 0;
            if (filter === '平和') return a === 1;
            if (filter === '热血') return a === 2;
            return true;
        })
        : allChars;

    if (countEl) countEl.innerText = `共 ${filtered.length} 个角色`;

    filtered.forEach((char, i) => {
        const code = Object.keys(characters).find(k => characters[k] === char) || '';
        const card = document.createElement('div');
        card.className = 'gallery-card';
        card.style.animationDelay = `${i * 30}ms`;
        const tagsHtml = (char.tags || []).slice(0, 3).map(t =>
            `<span class="gallery-card-tag">${t}</span>`
        ).join('');
        const imgHtml = char.image
            ? `<img class="gallery-card-img" src="${char.image}" alt="${char.name}" loading="lazy">`
            : `<div class="gallery-card-img" style="display:flex;align-items:center;justify-content:center;background:${char.color || '#ccc'};font-size:48px;color:#fff;font-weight:900;">${char.name.charAt(0)}</div>`;
        card.innerHTML = `
            ${imgHtml}
            <div class="gallery-card-info">
                <div class="gallery-card-name">${char.name}</div>
                <div class="gallery-card-anime">${char.anime}</div>
                <div class="gallery-card-tags">${tagsHtml}</div>
                <span class="gallery-card-code">${code}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterGallery(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderGallery(filter);
}

// ===================== 随机抽题 =====================
function pickRandomQuestions(allQuestions, count) {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// ===================== 测试逻辑 =====================
function startTest() {
    currentQuestion = 0;
    userAnswers = [];
    activeQuestions = pickRandomQuestions(questions, QUIZ_COUNT);
    showPage('page-quiz');
    renderQuestion();
}

function restartTest() {
    startTest();
}

function renderQuestion() {
    const q = activeQuestions[currentQuestion];
    const total = activeQuestions.length;
    document.getElementById('progress-bar').style.width = `${((currentQuestion) / total) * 100}%`;
    document.getElementById('progress-text').innerText = `${currentQuestion + 1} / ${total}`;
    document.getElementById('question-text').innerText = q.text;

    const btnContainer = document.getElementById('options-container');
    btnContainer.innerHTML = '';

    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt.text;
        btn.onclick = () => selectOption(index);
        btnContainer.appendChild(btn);
    });

    const backBtn = document.getElementById('back-btn');
    backBtn.style.visibility = currentQuestion === 0 ? 'hidden' : 'visible';
}

function selectOption(index) {
    userAnswers[currentQuestion] = index;
    if (currentQuestion < activeQuestions.length - 1) {
        currentQuestion++;
        renderQuestion();
    } else {
        calculateAndShowResult();
    }
}

function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        renderQuestion();
    }
}

function skipQuestion() {
    userAnswers[currentQuestion] = -1; // 标记跳过
    if (currentQuestion < activeQuestions.length - 1) {
        currentQuestion++;
        renderQuestion();
    } else {
        calculateAndShowResult();
    }
}

// ===================== 计分与结果匹配 =====================
function calculateAndShowResult() {
    const scores = { A: 0, S: 0, D: 0, W: 0 };
    userAnswers.forEach((ansIndex, qIndex) => {
        if (ansIndex < 0) return; // 跳过的题不计分
        const opts = activeQuestions[qIndex].options[ansIndex].scores;
        for (let key in opts) {
            scores[key] += opts[key];
        }
    });

    const answeredCount = userAnswers.filter(a => a >= 0).length;
    const maxPossible = Math.max(answeredCount, 1);

    const aRatio = scores.A / maxPossible;
    const sRatio = scores.S / maxPossible;
    const dRatio = scores.D / maxPossible;
    const wRatio = scores.W / maxPossible;

    const a = aRatio >= 0.55 ? 2 : (aRatio >= 0.3 ? 1 : 0);
    const s = sRatio >= 0.55 ? 2 : (sRatio >= 0.3 ? 1 : 0);
    const d = dRatio >= 0.55 ? 2 : (dRatio >= 0.3 ? 1 : 0);
    const w = wRatio >= 0.55 ? 2 : (wRatio >= 0.3 ? 1 : 0);

    currentResultCode = `${a}${s}${d}${w}`;
    const result = characters[currentResultCode] || characters["1111"];

    renderResultPage(result, scores, maxPossible, currentResultCode);
    showPage('page-result');
}

// ===================== 稀有度计算 =====================
function getRarity(code) {
    // 基于维度极端程度计算稀有度
    const digits = code.split('').map(Number);
    const extremes = digits.filter(d => d === 0 || d === 2).length;
    if (extremes >= 4) return 'SSR';
    if (extremes >= 3) return 'SR';
    return 'R';
}

// ===================== 维度颜色映射 =====================
const DIM_COLORS = {
    A: '#E63946', S: '#457B9D', D: '#2A9D8F', W: '#E9C46A'
};
const DIM_LABELS = {
    A: { left: '冷静', right: '热血', leftCode: 'A0', rightCode: 'A2' },
    S: { left: '社恐', right: '社牛', leftCode: 'S0', rightCode: 'S2' },
    D: { left: '纠结', right: '果断', leftCode: 'D0', rightCode: 'D2' },
    W: { left: '现实', right: '理想', leftCode: 'W0', rightCode: 'W2' }
};

// ===================== 结果页渲染 =====================
function renderResultPage(char, scores, maxPossible, code) {
    // 1. 设置动态主题色
    const themeColor = char.color || '#33a474';
    document.getElementById('result-hero').style.setProperty('--result-theme', themeColor);
    document.documentElement.style.setProperty('--result-theme', themeColor);

    // 2. 基本信息
    document.getElementById('char-name').innerText = char.name;
    document.getElementById('char-anime').innerText = char.anime;
    document.getElementById('char-desc').innerText = char.desc;

    // oneLiner
    const onelinerEl = document.getElementById('char-oneliner');
    if (char.oneLiner) {
        onelinerEl.innerText = `「${char.oneLiner}」`;
        onelinerEl.classList.remove('hidden');
    } else {
        onelinerEl.classList.add('hidden');
    }

    // famousQuote
    const quoteTextEl = document.getElementById('char-quote-text');
    const quoteEl = document.getElementById('char-quote');
    if (char.famousQuote) {
        quoteTextEl.innerText = char.famousQuote;
        quoteEl.classList.remove('hidden');
    } else {
        quoteEl.classList.add('hidden');
    }

    const randomMatch = Math.floor(Math.random() * 15) + 85;
    document.getElementById('match-percent').innerText = `${randomMatch}%`;

    // 3. 角色代码
    document.getElementById('result-code-badge').innerText = code;
    document.getElementById('result-code-badge-2').innerText = code;

    // 4. 角色代码（不再显示稀有度）

    // 5. 角色图片（海报框）
    const charImage = document.getElementById('char-image');
    const charInitial = document.getElementById('char-initial');
    cachedCharDataURL = ''; // 清除旧缓存
    if (char.image) {
        charImage.src = char.image;
        charImage.classList.remove('hidden');
        charInitial.classList.add('hidden');
        // 图片加载完成后，将其转换为 dataURL 缓存，供海报导出使用
        const cacheImageAsDataURL = () => {
            if (charImage.complete && charImage.naturalWidth > 0) {
                try {
                    const tmpCanvas = document.createElement('canvas');
                    tmpCanvas.width = charImage.naturalWidth;
                    tmpCanvas.height = charImage.naturalHeight;
                    const tmpCtx = tmpCanvas.getContext('2d');
                    tmpCtx.drawImage(charImage, 0, 0);
                    cachedCharDataURL = tmpCanvas.toDataURL('image/png');
                } catch (e) {
                    // 跨域导致 toDataURL 失败，留空让海报导出时用 fetch 回退
                    cachedCharDataURL = '';
                }
            }
        };
        if (charImage.complete && charImage.naturalWidth > 0) {
            cacheImageAsDataURL();
        } else {
            charImage.onload = cacheImageAsDataURL;
        }
    } else {
        charImage.classList.add('hidden');
        charInitial.classList.remove('hidden');
        charInitial.innerText = char.name.charAt(0);
        charInitial.style.background = themeColor;
    }

    // 6. 标签
    const tagsContainer = document.getElementById('char-tags');
    tagsContainer.innerHTML = '';
    (char.tags || []).forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.innerText = tag;
        tagsContainer.appendChild(span);
    });

    // 7. 侧边栏标签
    const profileTags = document.getElementById('profile-tags');
    profileTags.innerHTML = '';
    (char.tags || []).forEach(tag => {
        const span = document.createElement('span');
        span.className = 'profile-tag';
        span.innerText = tag;
        profileTags.appendChild(span);
    });

    // 8. 16personalities 风格维度滑块
    renderDimensionSliders(scores, maxPossible);

    // 9. 其他可能角色（侧边栏列表）
    renderAltChars(code, char);
}

// ===================== 16personalities 风格维度滑块 =====================
function renderDimensionSliders(scores, maxPossible) {
    const container = document.getElementById('dimension-sliders');
    container.innerHTML = '';

    ['A', 'S', 'D', 'W'].forEach(key => {
        const ratio = scores[key] / maxPossible;
        const percent = Math.round(ratio * 100);
        const color = DIM_COLORS[key];
        const labels = DIM_LABELS[key];

        // 判断主导方向
        const isLeft = ratio < 0.5;
        const dominantPercent = isLeft ? (100 - percent) : percent;
        const dominantLabel = isLeft ? labels.left : labels.right;
        const handlePos = isLeft ? (100 - dominantPercent) : dominantPercent;

        const row = document.createElement('div');
        row.className = 'trait-row';
        row.innerHTML = `
            <div class="trait-percent" style="color:${color};">${dominantPercent}% ${dominantLabel}</div>
            <div class="trait-track">
                <div class="trait-track-bg" style="background:${color};"></div>
                <div class="trait-track-fill" style="background:${color};width:${isLeft ? (100 - dominantPercent) : 100}%;${isLeft ? 'right:0;left:auto;' : ''}"></div>
                <div class="trait-center-marker"></div>
                <div class="trait-handle" style="left:${handlePos}%;border-color:${color};"></div>
            </div>
            <div class="trait-labels">
                <span class="trait-label">${labels.left} <span class="trait-label-dim">${labels.leftCode}</span></span>
                <span class="trait-label">${labels.right} <span class="trait-label-dim">${labels.rightCode}</span></span>
            </div>
        `;
        container.appendChild(row);
    });
}

// ===================== 其他可能角色（侧边栏列表） =====================
function renderAltChars(currentCode, currentChar) {
    const container = document.getElementById('alt-chars');
    container.innerHTML = '';
    const allChars = Object.entries(characters);
    const currentDigits = currentCode.split('').map(Number);
    const distances = allChars
        .filter(([code, ch]) => code !== currentCode && ch.image)
        .map(([code, ch]) => {
            const digits = code.split('').map(Number);
            const dist = digits.reduce((sum, d, i) => sum + Math.abs(d - currentDigits[i]), 0);
            return { code, char: ch, distance: dist };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 4);

    distances.forEach(({ code, char: altChar }) => {
        const item = document.createElement('div');
        item.className = 'alt-char-item';
        item.innerHTML = `
            <img src="${altChar.image}" alt="${altChar.name}" loading="lazy">
            <div class="alt-char-item-info">
                <div class="alt-char-item-name">${altChar.name}</div>
                <div class="alt-char-item-anime">${altChar.anime}</div>
            </div>
        `;
        container.appendChild(item);
    });
}

// ===================== 复制结果 =====================
function copyResult() {
    const name = document.getElementById('char-name').innerText;
    const anime = document.getElementById('char-anime').innerText;
    const match = document.getElementById('match-percent').innerText;
    const code = document.getElementById('result-code-badge').innerText;
    const text = `【AnimeSBTI 测试结果】\n${match}\n角色：${name}（${anime}）\n人格代码：${code}\n\n来测测你的二次元灵魂伴侣吧！`;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => showToast('✅ 结果已复制到剪贴板'));
    } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('✅ 结果已复制到剪贴板');
    }
}

// ===================== Toast 通知 =====================
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.remove('hidden');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 2500);
}

// ===================== 海报生成 =====================
function generateAndSavePoster() {
    const canvas = document.createElement('canvas');
    const W = 750, H = 1334;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // 获取数据
    const charName = document.getElementById('char-name').innerText;
    const charAnime = document.getElementById('char-anime').innerText;
    const charDesc = document.getElementById('char-desc').innerText;
    const charQuote = document.getElementById('char-quote-text')?.innerText || '';
    const charOneliner = document.getElementById('char-oneliner')?.innerText || '';
    const code = document.getElementById('result-code-badge').innerText;
    const matchTxt = document.getElementById('match-percent').innerText;
    const tags = Array.from(document.querySelectorAll('#char-tags .tag')).map(t => t.innerText);

    // 主题色
    const themeColor = document.getElementById('result-hero').style.getPropertyValue('--result-theme') || '#33a474';

    // 1. 背景渐变
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#f7f9fc');
    bgGrad.addColorStop(1, '#fffcf5');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. 顶部主题色条
    ctx.fillStyle = themeColor;
    ctx.fillRect(0, 0, W, 18);

    // 3. 装饰圆（右上角）
    ctx.fillStyle = themeColor + '18';
    ctx.beginPath();
    ctx.arc(W + 40, -40, 200, 0, Math.PI * 2);
    ctx.fill();

    // 4. 品牌标识
    ctx.fillStyle = '#8c9ba5';
    ctx.font = '600 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ANIME SBTI', 40, 58);

    // 5. 角色代码胶囊
    ctx.font = 'bold 16px sans-serif';
    const codeText = code;
    const codeW = ctx.measureText(codeText).width + 28;
    ctx.fillStyle = themeColor + '20';
    ctx.beginPath();
    ctx.roundRect(W - codeW - 40, 40, codeW, 30, 15);
    ctx.fill();
    ctx.fillStyle = themeColor;
    ctx.textAlign = 'center';
    ctx.fillText(codeText, W - codeW / 2 - 40, 61);

    // 6. 角色图片（优先使用缓存的 dataURL，避免 canvas 跨域污染）
    const charImgEl = document.getElementById('char-image');
    const drawImageToCanvas = (img, size, x, y) => {
        // 等比缩放绘制，保持宽高比居中裁剪
        const imgW = img.naturalWidth || img.width;
        const imgH = img.naturalHeight || img.height;
        const scale = Math.max(size / imgW, size / imgH);
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const drawX = x + (size - drawW) / 2;
        const drawY = y + (size - drawH) / 2;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, 20);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, 20);
        ctx.stroke();
    };

    const drawImage = () => {
        return new Promise((resolve) => {
            if (!charImgEl || charImgEl.classList.contains('hidden')) {
                resolve(false);
                return;
            }
            const imgSrc = charImgEl.getAttribute('src');
            if (!imgSrc) { resolve(false); return; }

            const size = 240;
            const x = (W - size) / 2;
            const y = 80;

            const onImgLoaded = (img) => {
                drawImageToCanvas(img, size, x, y);
                resolve(true);
            };

            // 方案1：使用缓存的 dataURL（最可靠，无跨域问题）
            if (cachedCharDataURL) {
                const img = new Image();
                img.onload = () => onImgLoaded(img);
                img.onerror = () => tryFetch();
                img.src = cachedCharDataURL;
                return;
            }

            // 方案2：通过 fetch + blob URL 加载
            const tryFetch = () => {
                fetch(imgSrc)
                    .then(resp => resp.blob())
                    .then(blob => {
                        const blobUrl = URL.createObjectURL(blob);
                        const img = new Image();
                        img.onload = () => {
                            URL.revokeObjectURL(blobUrl);
                            onImgLoaded(img);
                        };
                        img.onerror = () => {
                            URL.revokeObjectURL(blobUrl);
                            resolve(false);
                        };
                        img.src = blobUrl;
                    })
                    .catch(() => resolve(false));
            };

            tryFetch();
        });
    };

    drawImage().then((hasImg) => {
        if (!hasImg) {
            const initial = document.getElementById('char-initial')?.innerText || '?';
            const size = 240;
            const x = (W - size) / 2;
            const y = 80;
            ctx.fillStyle = themeColor;
            ctx.beginPath();
            ctx.roundRect(x, y, size, size, 20);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 100px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(initial, x + size / 2, y + size / 2);
            ctx.textBaseline = 'alphabetic';
        }

        // 7. 角色名称
        let yPos = 360;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#2d3748';
        ctx.font = 'bold 44px sans-serif';
        ctx.fillText(charName, W / 2, yPos);

        // 8. 动漫出处
        yPos += 40;
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#5f6b75';
        ctx.fillText(`来自《${charAnime}》`, W / 2, yPos);

        // 9. 一句话介绍
        if (charOneliner) {
            yPos += 36;
            ctx.font = 'italic 17px sans-serif';
            ctx.fillStyle = '#718096';
            ctx.fillText(charOneliner, W / 2, yPos);
        }

        // 10. 匹配度
        yPos += 40;
        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = themeColor;
        ctx.fillText(matchTxt + ' 匹配', W / 2, yPos);

        // 11. 分隔线
        yPos += 24;
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(60, yPos);
        ctx.lineTo(W - 60, yPos);
        ctx.stroke();

        // 12. 维度分析（从 trait-row 读取）
        yPos += 30;
        const dimColors = ['#E63946', '#457B9D', '#2A9D8F', '#E9C46A'];
        const dimLabels = ['行动力', '社交力', '决策力', '世界观'];
        const traitRows = document.querySelectorAll('.trait-row');
        traitRows.forEach((row, i) => {
            if (i >= 4) return;
            const percentEl = row.querySelector('.trait-percent');
            const fillEl = row.querySelector('.trait-track-fill');
            const handleEl = row.querySelector('.trait-handle');

            // 维度标签
            ctx.fillStyle = '#5f6b75';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(dimLabels[i], 60, yPos);

            // 百分比
            const pctText = percentEl ? percentEl.innerText : '';
            ctx.fillStyle = dimColors[i];
            ctx.font = 'bold 15px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(pctText, W - 60, yPos);

            // 进度条背景
            const barX = 160, barW = W - 280, barH = 12;
            ctx.fillStyle = '#eee';
            ctx.beginPath();
            ctx.roundRect(barX, yPos - 10, barW, barH, 6);
            ctx.fill();

            // 进度条填充
            let fillW = 0;
            if (handleEl) {
                const left = parseFloat(handleEl.style.left) || 50;
                fillW = (left / 100) * barW;
            }
            ctx.fillStyle = dimColors[i];
            ctx.beginPath();
            ctx.roundRect(barX, yPos - 10, Math.max(fillW, 6), barH, 6);
            ctx.fill();

            // 中心标记
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillRect(barX + barW / 2 - 1.5, yPos - 14, 3, 18);

            yPos += 36;
        });

        // 13. 台词引用
        if (charQuote) {
            yPos += 10;
            ctx.fillStyle = '#f4ecdf';
            ctx.beginPath();
            ctx.roundRect(50, yPos - 10, W - 100, 80, 12);
            ctx.fill();
            ctx.strokeStyle = '#2d3748';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(50, yPos - 10, W - 100, 80, 12);
            ctx.stroke();

            ctx.fillStyle = themeColor;
            ctx.font = 'italic 28px Georgia, serif';
            ctx.textAlign = 'left';
            ctx.fillText('❝', 66, yPos + 30);
            ctx.fillStyle = '#2d3748';
            ctx.font = '600 17px sans-serif';
            wrapText(ctx, charQuote, 96, yPos + 20, W - 180, 26);
            yPos += 90;
        }

        // 14. 描述文字
        yPos += 6;
        ctx.textAlign = 'left';
        ctx.fillStyle = '#5f6b75';
        ctx.font = '17px sans-serif';
        yPos = wrapText(ctx, charDesc, 60, yPos, W - 120, 30);

        // 15. 标签
        yPos += 20;
        ctx.textAlign = 'center';
        let tagX = W / 2 - (tags.length - 1) * 55;
        tags.forEach(tag => {
            ctx.font = 'bold 15px sans-serif';
            const tw = ctx.measureText(tag).width + 20;
            ctx.fillStyle = themeColor + '18';
            ctx.beginPath();
            ctx.roundRect(tagX - tw / 2, yPos, tw, 32, 16);
            ctx.fill();
            ctx.fillStyle = themeColor;
            ctx.fillText(tag, tagX, yPos + 22);
            tagX += 110;
        });

        // 16. 底部栏
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(0, H - 64, W, 64);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✦ AnimeSBTI — 测测你的二次元灵魂伴侣', W / 2, H - 26);

        // 17. 下载
        canvas.toBlob(function(blob) {
            if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `AnimeSBTI_${charName}.png`;
                link.href = url;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                showToast('📥 海报已保存');
            } else {
                showToast('⚠️ 导出失败，请截图保存');
            }
        }, 'image/png');
    });
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    let line = '';
    let currentY = y;
    for (let i = 0; i < text.length; i++) {
        const testLine = line + text[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line.length > 0) {
            ctx.fillText(line, x, currentY);
            line = text[i];
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, currentY);
    return currentY;
}

// ===================== 初始化 =====================
document.addEventListener('DOMContentLoaded', () => {
    renderHeroCharacters();
    renderPreviewGrid();
    renderArtDemo();
    animateCounters();
});
