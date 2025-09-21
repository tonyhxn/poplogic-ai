/* ===========================================
    POP LOGIC - AI LITERACY EDUCATIONAL GAME
    ===========================================
    
    This JavaScript implements a comprehensive AI literacy educational game
    that teaches students in Years 7-10 about fundamental AI concepts through
    interactive gameplay. The game uses a balloon factory metaphor to make
    complex AI concepts accessible and engaging.
    
    KEY AI CONCEPTS IMPLEMENTED:
    ============================
    1. PATTERN RECOGNITION (Level 1)
        - Students learn to identify patterns in balloon behavior
        - Different colored balloons have different characteristics
        - Teaches data analysis and statistical thinking
        
    2. DATA BIAS DETECTION (Level 1)
        - Global yield data can be misleading
        - Personal experience vs. aggregate data
        - Understanding bias in AI training data
        
    3. HUMAN-IN-THE-LOOP AI TRAINING (Level 2)
        - Students configure AI parameters (pump settings)
        - Can pause and adjust AI behavior mid-simulation
        - Teaches the importance of human oversight in AI systems
        
    4. AI TEMPERATURE CONTROL (Level 3)
        - Temperature controls creativity vs. stability
        - Weather effects represent environmental conditions
        - Teaches about AI parameter tuning and adaptation
        
    5. MODEL PERFORMANCE EVALUATION
        - Real-time performance monitoring
        - Success/failure rate analysis
        - Strategy optimization based on data
        
    TECHNICAL IMPLEMENTATION:
    =========================
    - Pure JavaScript (no frameworks) for maximum compatibility
    - Local storage for game state persistence
    - Chart.js for data visualization
    - CSS animations for engaging user experience
    - Responsive design for various screen sizes
    - WCAG accessibility compliance
*/

// --- DOM Elements - Game Interface Components ---
const screens = document.querySelectorAll('.screen');
const homeBtn = document.getElementById('home-btn');
const helpBtn = document.getElementById('help-btn');
const startGameBtn = document.getElementById('start-game-btn');
const selectL1Btn = document.getElementById('select-l1-btn');
const selectL2Btn = document.getElementById('select-l2-btn');
const selectL3Btn = document.getElementById('select-l3-btn');
const resetProgressBtn = document.getElementById('reset-progress-btn');
const tutorialOverlay = document.getElementById('tutorial-overlay');
const tutorialBox = document.getElementById('tutorial-box');
const tutorialPrevBtn = document.getElementById('tutorial-prev-btn');
const tutorialNextBtn = document.getElementById('tutorial-next-btn');
const customTooltip = document.getElementById('custom-tooltip');
const skipTutorialBtn = document.getElementById('skip-tutorial-btn');
const mainTitle = document.getElementById('main-title');
const mainSubtitle = document.getElementById('main-subtitle');
const mainDescription = document.getElementById('main-description');


// --- Game Config ---
/* ===========================================
    AI TRAINING DATA CONFIGURATION
    ===========================================
    This configuration defines the characteristics of different data types
    (represented as balloon colors) that the AI must learn to process.
    Each color represents a different type of input data with varying
    complexity and risk levels - simulating real-world AI training scenarios.
*/
const BALLOON_CONFIG = {
    // RED BALLOONS: High-value, moderate risk data
    // Represents important but predictable data patterns
    red: { color: 'red-500', range: [6, 12], chartColor: '#EF4444' },
    
    // BLUE BALLOONS: Low-risk, consistent data
    // Represents reliable, stable data patterns
    blue: { color: 'blue-400', range: [4, 6], chartColor: '#60A5FA' },
    
    // GREEN BALLOONS: Variable risk data
    // Represents data with moderate unpredictability
    green: { color: 'green-400', range: [2, 8], chartColor: '#4ADE80' },
    
    // YELLOW BALLOONS: High-risk, unpredictable data
    // Represents noisy, unreliable data that can mislead AI
    yellow: { color: 'yellow-400', range: [1, 20], chartColor: '#FBBF24' },
};

/* ===========================================
    LEVEL 1 TRAINING SEQUENCE - PATTERN RECOGNITION
    ===========================================
    This sequence is designed to teach pattern recognition:
    1. Start with 4 red balloons (high-value, predictable) - builds confidence
    2. Follow with 4 blue balloons (low-risk, consistent) - reinforces patterns
    3. Mix with green and yellow (variable/unpredictable) - challenges assumptions
    This simulates how AI learns from structured training data.
*/
const L1_SEQUENCE = ['red', 'red', 'red', 'red', 'blue', 'blue', 'blue', 'blue', 'green', 'red', 'blue', 'green', 'red', 'blue', 'green'];

// --- Game State Management - AI Learning Progress Tracking ---
let gameState;

/* ===========================================
    GAME STATE STRUCTURE - AI LEARNING TRACKING
    ===========================================
    This function defines the complete state structure for tracking
    AI learning progress across all levels. Each level represents
    a different aspect of AI literacy education.
*/
function getDefaultGameState() {
    return {
        // Level progression tracking
        unlockedLevels: 1,
        
        // Tutorial progress for each level
        tutorial: { l1: 0, l2: 0 },
        // LEVEL 1: Pattern Recognition & Data Bias Detection
        l1: { 
            stats: {},           // Personal performance statistics per color
            balloonIndex: 0,     // Current position in training sequence
            history: [],         // Last 8 balloon interactions for pattern analysis
            isPopping: false,    // Animation state control
            strategy: {},        // Player's learned strategies
            bestScore: 0         // Best performance tracking
        },
        
        // LEVEL 2: Human-in-the-Loop AI Training
        l2: { 
            stats: {},           // AI performance metrics per color
            processedCount: 0,   // Number of balloons processed by AI
            strategy: {},        // AI configuration parameters (pump settings)
            pastStrategies: []  // Historical AI strategies for comparison
        },
        
        // LEVEL 3: AI Temperature Control & Environmental Adaptation
        l3: { 
            stats: {},           // AI performance under different conditions
            totalScore: 0,       // Cumulative score across all conditions
            processedSinceChartUpdate: 0,  // Chart update frequency control
            temperature: 20,     // Current AI temperature (affects creativity/stability)
            strategy: {}         // AI parameters adapted to environmental conditions
        }
    };
}

function resetAllProgress() {
    localStorage.removeItem('popLogicState');
    initGame();
    goToLevelSelect();
}

function saveGameState() {
    const stateToSave = JSON.parse(JSON.stringify(gameState));
    if (stateToSave.l2) delete stateToSave.l2.chart;
    if (stateToSave.l3) delete stateToSave.l3.chart;
    localStorage.setItem('popLogicState', JSON.stringify(stateToSave));
}

function loadGameState() {
    const savedState = localStorage.getItem('popLogicState');
    if (savedState) {
        gameState = JSON.parse(savedState);
        if (!gameState.tutorial) gameState.tutorial = { l1: 0, l2: 0 };
        if (!gameState.l1.bestScore) gameState.l1.bestScore = 0;
        if (!gameState.l2.pastStrategies) gameState.l2.pastStrategies = [];
    } else {
        gameState = getDefaultGameState();
    }
}

function initGame() {
    loadGameState();
    ['l1', 'l2', 'l3'].forEach(level => {
            if (!gameState[level] || !gameState[level].stats || !gameState[level].stats.red) {
            resetStats(level);
            }
    });
    if (gameState.l2) gameState.l2.isRunning = false;
    if (gameState.l3) gameState.l3.isRunning = false;
}

function resetStats(level) {
    const statsTemplate = { score: 0, pops: 0, count: 0, pumps: 0 };
    gameState[level].stats = {
        red: {...statsTemplate},
        blue: {...statsTemplate},
        green: {...statsTemplate},
        yellow: {...statsTemplate}
    };
        gameState[level].strategy = {};
    if (level === 'l1') {
            gameState.l1.history = [];
            gameState.l1.balloonIndex = 0;
            gameState.l1.isPopping = false;
    }
    if (level === 'l2') {
        gameState.l2.processedCount = 0;
    }
        if (level === 'l3') {
        gameState.l3.totalScore = 0;
        gameState.l3.processedSinceChartUpdate = 0;
        gameState.l3.temperature = 20;
    }
}

// --- Utility Functions ---
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- Custom Tooltip Functions ---
function showTooltip(text, x, y) {
    customTooltip.textContent = text;
    customTooltip.style.left = x + 'px';
    customTooltip.style.top = y + 'px';
    customTooltip.style.opacity = '1';
    customTooltip.style.visibility = 'visible';
}

function hideTooltip() {
    customTooltip.style.opacity = '0';
    customTooltip.style.visibility = 'hidden';
}

function updateTooltipPosition(e) {
    if (customTooltip.style.visibility === 'visible') {
        customTooltip.style.left = e.clientX + 'px';
        customTooltip.style.top = e.clientY + 'px';
    }
}

// --- Cartoony Title Animations ---
function animateTitlePage() {
    // Reset all elements to initial state
    mainTitle.style.opacity = '0';
    mainTitle.style.transform = 'scale(0) rotate(-10deg)';
    // Don't hide the subtitle - keep it visible
    // mainSubtitle.style.opacity = '0';
    // mainSubtitle.style.transform = 'translateY(50px)';
    mainDescription.style.opacity = '0';
    mainDescription.style.transform = 'translateY(30px)';
    
    // Trigger animations with delays
    setTimeout(() => {
        mainTitle.classList.add('title-bounce');
        // Ensure title is visible after animation
        setTimeout(() => {
            mainTitle.style.opacity = '1';
        }, 500);
    }, 100);
    
    // Skip subtitle animation to keep it visible
    // setTimeout(() => {
    //     mainSubtitle.classList.add('subtitle-slide');
    // }, 400);
    
    setTimeout(() => {
        mainDescription.classList.add('description-fade');
    }, 700);
    
    // Don't animate the button to avoid interfering with click functionality
    setTimeout(() => {
        mainDescription.style.opacity = '1';
        mainDescription.style.transform = 'translateY(0)';
    }, 1000);
}

const showScreen = (screenId) => {
    screens.forEach(s => s.classList.remove('active-screen'));
    document.getElementById(screenId).classList.add('active-screen');
    const isLevelScreen = screenId.startsWith('level-');
    const isLevelSelectScreen = screenId === 'level-select';
    homeBtn.style.display = isLevelScreen ? 'block' : 'none';
    helpBtn.style.display = (isLevelScreen && !isLevelSelectScreen) ? 'block' : 'none';
    
    // Trigger title page animation when showing main menu
    if (screenId === 'main-menu') {
        setTimeout(() => {
            animateTitlePage();
        }, 50);
    }
};

// --- Global Banner Update ---
setInterval(() => {
    document.getElementById('global-red').textContent = parseInt(document.getElementById('global-red').textContent) + getRandomInt(1, 5);
    document.getElementById('global-blue').textContent = parseInt(document.getElementById('global-blue').textContent) + getRandomInt(0, 3);
    document.getElementById('global-green').textContent = parseInt(document.getElementById('global-green').textContent) + getRandomInt(0, 2);
    document.getElementById('global-gold').textContent = parseInt(document.getElementById('global-gold').textContent) + getRandomInt(0, 1);
}, 2000);

// --- Explosion Animation ---
function createExplosion(container, color) {
    const PARTICLE_COUNT = 20;
    const colors = [BALLOON_CONFIG[color].chartColor, '#FFFFFF', '#FBBF24'];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 70 + 30;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        particle.style.setProperty('--transform-end', `translate(${x}px, ${y}px)`);
        particle.style.background = colors[i % colors.length];
        container.appendChild(particle);
        setTimeout(() => {
            if (container.contains(particle)) {
                container.removeChild(particle);
            }
        }, 700);
    }
}

// --- Tutorial System ---
const tutorialHighlight = document.getElementById('tutorial-highlight');

function showTutorialStep(steps, level) {
    const stepIndex = gameState.tutorial[level];
    if (stepIndex >= steps.length) {
        tutorialOverlay.style.display = 'none';
        return;
    }
    tutorialOverlay.style.display = 'block';

    const step = steps[stepIndex];
    const targetElement = document.querySelector(step.element);
    
    if (!targetElement) {
            gameState.tutorial[level]++;
            saveGameState();
            showTutorialStep(steps, level);
            return;
    }

    const rect = targetElement.getBoundingClientRect();

    tutorialHighlight.style.left = `${rect.left - 10}px`;
    tutorialHighlight.style.top = `${rect.top - 10}px`;
    tutorialHighlight.style.width = `${rect.width + 20}px`;
    tutorialHighlight.style.height = `${rect.height + 20}px`;

    document.getElementById('tutorial-title').textContent = step.title;
    const textContent = typeof step.text === 'function' ? step.text() : step.text;
    document.getElementById('tutorial-text').innerHTML = textContent;

    const boxWidth = 350; // max-width from CSS
    let boxLeft, boxTop;
    
    // Special positioning for certain tutorial steps
    if (step.title === 'Welcome to Training!' || step.title === 'You are ready to begin!') {
        // Center in the middle of the screen
        boxLeft = (window.innerWidth - boxWidth) / 2;
        boxTop = (window.innerHeight - 200) / 2; // 200px estimated height
    } else if (step.title === "AI's Short-Term Memory") {
        // Center the entire popup in the middle of the screen
        boxLeft = (window.innerWidth - boxWidth) / 2;
        boxTop = (window.innerHeight - 450) / 2; // Slightly higher position
    } else if (step.title === "Build Your AI!") {
        // Position to the right of the highlighting area
        boxLeft = rect.right + 20; // 20px to the right of the highlighted element
        boxTop = rect.top + (rect.height / 2) - 100; // Center vertically with highlighted element
    } else if (step.title === "Live Simulation") {
        // Position to the left of the highlighting area
        boxLeft = rect.left - boxWidth - 20; // 20px to the left of the highlighted element
        boxTop = rect.top + (rect.height / 2) - 100; // Center vertically with highlighted element
    } else {
        // Default positioning relative to target element
        boxLeft = rect.left + (rect.width / 2) - (boxWidth / 2);
        boxTop = rect.bottom + 20;
        
        // Check if box would go off bottom of screen
        if (boxTop + 200 > window.innerHeight) { // 200px estimated height
            boxTop = rect.top - 220; // Position above with some margin
        }
        
        // Check if box would go off top of screen
        if (boxTop < 20) {
            boxTop = 20; // Minimum top margin
        }
    }
    
    // Ensure box stays within horizontal bounds
    const finalLeft = Math.max(10, Math.min(window.innerWidth - boxWidth - 10, boxLeft));
    
    tutorialBox.style.top = `${boxTop}px`;
    tutorialBox.style.left = `${finalLeft}px`;
    
    tutorialPrevBtn.style.display = stepIndex === 0 ? 'none' : 'block';
    tutorialNextBtn.textContent = stepIndex === steps.length - 1 ? 'Finish' : 'Next';
}



function advanceTutorial(direction, steps, level) {
        gameState.tutorial[level] += direction;
        if(gameState.tutorial[level] < 0) gameState.tutorial[level] = 0;
        saveGameState();
        showTutorialStep(steps, level);
}

function skipTutorial() {
    const activeScreenId = document.querySelector('.active-screen').id;
    if (!activeScreenId.startsWith('level-')) return;
    const levelKey = 'l' + activeScreenId.slice(-1);
    
    // Mark tutorial as completed for this level
    const steps = levelKey === 'l1' ? L1_TUTORIAL_STEPS : levelKey === 'l2' ? L2_TUTORIAL_STEPS : L3_TUTORIAL_STEPS;
    gameState.tutorial[levelKey] = steps.length;
    saveGameState();
    
    // Hide tutorial overlay (skip button is part of overlay)
    tutorialOverlay.style.display = 'none';
}

/* ===========================================
    LEVEL 1 TUTORIAL STEPS - PATTERN RECOGNITION EDUCATION
    ===========================================
    These tutorial steps guide students through fundamental AI concepts
    using the balloon factory metaphor. Each step builds understanding
    of how AI systems learn from data and make decisions.
*/
const L1_TUTORIAL_STEPS = [
    // Step 1: Basic interaction mechanics
    { element: '#l1-game-area', title: 'Welcome to Training!', text: "Your goal is simple: PUMP the balloon to increase its value, but CASH OUT the score before it pops!"},
    { element: '#global-banner', title: 'Global Player Data', text: "Here's what players around the world are earning. This data might offer a clue... or it might show you a biased strategy. An AI must learn to evaluate if external data is useful or misleading. Should you trust it?"},
    { element: '#l1-data-panel', title: 'Your Personal Data', text: "As you play, your results will appear here. This is your AI's 'memory'. Use it to learn the balloon behaviors."},
    { element: '#l1-data-panel .text-red-400', title: '🎯 Pattern Recognition & Strategy Building', text: "After a few successful runs, the <strong>Avg. Pumps</strong> stat appears for each color. This is your personal data!<br><br><strong>Think about it:</strong> Do you notice patterns? Are some colors consistently allowing more pumps before popping? <br><br>This is how AI learns! By analyzing patterns in data, you can develop strategies. <br><br><em>💡 Pro tip: If Red balloons average 8 pumps safely, maybe try 7 pumps next time to be safer, or 9 pumps to be more aggressive!</em>"},
    { element: 'body', title: "AI's Short-Term Memory", text: "This panel shows your last 8 results. Think of this as an AI's <strong>Context Window</strong>. Like this panel, a GenAI model can only 'remember' a limited amount of recent information to make its next decision. Information that scrolls off is forgotten!<br><br><div class='mt-4 p-3 bg-indigo-800/50 rounded-lg'><div class='grid grid-cols-8 gap-2 justify-items-center text-center text-sm'><div class='w-12 h-14 rounded-[50%/60%_60%_40%_40%] bg-red-400 flex flex-col items-center justify-center text-white font-bold text-xs relative shadow-md' style='color: var(--tw-bg-red-400);'><span class='text-white'>7</span><span class='text-lg'>💰</span><div class='absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent' style='border-top-color: var(--tw-bg-red-400);'></div></div><div class='w-12 h-14 rounded-[50%/60%_60%_40%_40%] bg-blue-400 flex flex-col items-center justify-center text-white font-bold text-xs relative shadow-md' style='color: var(--tw-bg-blue-400);'><span class='text-white'>4</span><span class='text-lg'>💰</span><div class='absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent' style='border-top-color: var(--tw-bg-blue-400);'></div></div><div class='w-12 h-14 rounded-[50%/60%_60%_40%_40%] bg-green-400 flex flex-col items-center justify-center text-white font-bold text-xs relative shadow-md' style='color: var(--tw-bg-green-400);'><span class='text-white'>3</span><span class='text-lg'>💥</span><div class='absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent' style='border-top-color: var(--tw-bg-green-400);'></div></div><div class='w-12 h-14 rounded-[50%/60%_60%_40%_40%] bg-red-400 flex flex-col items-center justify-center text-white font-bold text-xs relative shadow-md' style='color: var(--tw-bg-red-400);'><span class='text-white'>9</span><span class='text-lg'>💰</span><div class='absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent' style='border-top-color: var(--tw-bg-red-400);'></div></div><div class='w-12 h-14 rounded-[50%/60%_60%_40%_40%] bg-blue-400 flex flex-col items-center justify-center text-white font-bold text-xs relative shadow-md' style='color: var(--tw-bg-blue-400);'><span class='text-white'>5</span><span class='text-lg'>💰</span><div class='absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent' style='border-top-color: var(--tw-bg-blue-400);'></div></div><div class='w-12 h-14 rounded-[50%/60%_60%_40%_40%] bg-green-400 flex flex-col items-center justify-center text-white font-bold text-xs relative shadow-md' style='color: var(--tw-bg-green-400);'><span class='text-white'>6</span><span class='text-lg'>💥</span><div class='absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent' style='border-top-color: var(--tw-bg-green-400);'></div></div><div class='w-12 h-14 rounded-[50%/60%_60%_40%_40%] bg-red-400 flex flex-col items-center justify-center text-white font-bold text-xs relative shadow-md' style='color: var(--tw-bg-red-400);'><span class='text-white'>8</span><span class='text-lg'>💰</span><div class='absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent' style='border-top-color: var(--tw-bg-red-400);'></div></div><div class='w-12 h-14 rounded-[50%/60%_60%_40%_40%] bg-blue-400 flex flex-col items-center justify-center text-white font-bold text-xs relative shadow-md' style='color: var(--tw-bg-blue-400);'><span class='text-white'>3</span><span class='text-lg'>💰</span><div class='absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent' style='border-top-color: var(--tw-bg-blue-400);'></div></div></div><p class='text-xs text-indigo-300 mt-2'>Example: Last 8 balloon results (💰 = cashed out, 💥 = popped)</p></div>"},
    { element: '#l1-data-panel .text-green-400', title: 'Noisy Data!', text: "Watch out! Green balloons are highly unpredictable. In AI, this is called 'noisy data', and it's very difficult to make accurate predictions from it."},
    { element: 'body', title: 'You are ready to begin!', text: "You've learned the basics! Time to test your knowledge. Good luck!"},
];
/* ===========================================
    LEVEL 2 TUTORIAL STEPS - HUMAN-IN-THE-LOOP AI TRAINING
    ===========================================
    These steps teach students about AI model training and the critical
    role of human oversight in AI systems. Students learn to configure
    AI parameters and monitor performance in real-time.
*/
const L2_TUTORIAL_STEPS = [
    // Step 1: AI parameter configuration
    { element: '#l2-control-panel', title: 'Build Your AI!', text: "Now you're the teacher. Use the sliders to set rules for your AI based on what you learned in Level 1. The AI will automatically cash in after this many pumps of each balloon type."},
    { element: 'body', title: 'AI Insights', text: "This section will show you real-time insights about your AI's performance. Watch for patterns and learn from the data to improve your strategy!"},
    { element: '#l2-simulation-panel', title: 'Live Simulation', text: "Your AI will now process 100 balloons based on your rules. Watch the performance monitor to see how it performs."},
    { element: '#l2-start-stop-btn', title: 'Human-in-the-Loop', text: "Things not going well? You can PAUSE the simulation at any time to adjust your AI's rules. This is your role as a Human Supervisor!"},
];

/* ===========================================
    LEVEL 3 TUTORIAL STEPS - AI TEMPERATURE CONTROL EDUCATION
    ===========================================
    These steps teach students about AI temperature - a crucial parameter
    that controls creativity vs. stability in AI models. Students learn
    to recognize how environmental conditions affect AI behavior and
    how to adapt AI parameters accordingly.
*/
const L3_TUTORIAL_STEPS = [
    // Step 1: Introduction to AI temperature concept
    { element: '#level-3 .bg-gradient-to-br', title: '🌡️ AI Temperature Control', text: "Welcome to the Production Floor! Here you'll learn about <strong>AI Temperature</strong> - one of the most important concepts in modern AI. Temperature controls how 'creative' or 'conservative' your AI behaves."},
    { element: '#l3-temp-display', title: 'Temperature Display', text: "This shows the current factory temperature. In AI terms, <strong>low temperature = stable, predictable behavior</strong> while <strong>high temperature = creative, risky behavior</strong>. Watch how it affects balloon stability!"},
    { element: '#l3-start-stop-btn', title: '🚀 Start Production', text: "Click this to begin continuous balloon production. Your AI will process balloons forever, but the weather will change every 15-60 seconds, affecting balloon behavior!"},
    { element: 'body', title: '🌤️ Weather Patterns', text: "Notice the weather effects? <strong>Hot weather = balloons pop easier</strong> (high temperature = risky AI). <strong>Cold weather = balloons more stable</strong> (low temperature = conservative AI). This is exactly how AI temperature works!"},
    { element: 'body', title: '🎯 Pattern Recognition', text: "As you play, ask yourself: <strong>Do you notice the tendency of balloons to pop more in hot weather?</strong> This is the key insight - temperature directly affects AI behavior and decision-making!"},
    { element: 'body', title: '🤖 AI Temperature in Real Life', text: "In real AI systems, temperature controls creativity vs stability. <strong>Low temp (0.1-0.3):</strong> Conservative, factual responses. <strong>High temp (0.7-1.0):</strong> Creative, varied responses. Your balloon factory simulates this perfectly!"},
    { element: 'body', title: '🎮 Your Mission', text: "Adapt your pump settings based on the weather! When it's hot, reduce pumps to avoid losses. When it's cold, increase pumps for higher profits. This teaches you to tune AI temperature for optimal performance!"},
];

// --- Navigation ---
function goToLevelSelect() {
    showScreen('level-select');
}

function setInsight(text, level) {
    const insightEl = document.getElementById(`l${level}-insights`);
    if (!insightEl) return;
    insightEl.style.opacity = '0';
    setTimeout(() => {
        insightEl.innerHTML = text;
        insightEl.style.opacity = '1';
    }, 300);
}

// =================================
// ========= LEVEL 1 LOGIC =========
// =================================
const l1PumpBtn = document.getElementById('l1-pump-btn');
const l1BankBtn = document.getElementById('l1-bank-btn');
const l1BalloonArea = document.getElementById('l1-balloon-area');

function startLevel1() {
    showScreen('level-1');
    document.getElementById('l1-insights-title').textContent = "AI Insights";
    if (gameState.l1.balloonIndex >= L1_SEQUENCE.length) {
        endLevel1(true); 
    } else {
        document.getElementById('l1-controls').style.display = 'flex';
        document.getElementById('l1-summary-area').style.display = 'none';
        l1BalloonArea.style.display = 'flex';
        document.getElementById('l1-progress').style.display = 'block';
        setupNextL1Balloon();
        showTutorialStep(L1_TUTORIAL_STEPS, 'l1');
    }
}

function replayLevel1() {
    resetStats('l1');
    gameState.tutorial.l1 = 0;
    saveGameState();
    startLevel1();
}

function setupNextL1Balloon() {
    gameState.l1.isPopping = false;
    if (gameState.l1.balloonIndex >= L1_SEQUENCE.length) { endLevel1(); return; }
    const type = L1_SEQUENCE[gameState.l1.balloonIndex];
    gameState.l1.currentBalloon = { type: type, maxPumps: getRandomInt(...BALLOON_CONFIG[type].range), colorClass: BALLOON_CONFIG[type].color };
    gameState.l1.currentPumps = 0;
    renderL1();

    const index = gameState.l1.balloonIndex;
    if (index === 0) setInsight("Every pump adds to the score, but also risk. How far will you push it?", 1);
    else if (index === 4) setInsight("You've seen a few red balloons now. Have you developed a strategy? 🤔", 1);
    else if (index === 8) setInsight("The data is changing. A good AI must adapt its strategy constantly.", 1);
    else if (index === 12) setInsight("Trusting the global data can be misleading. What does YOUR data tell you?", 1);
    
    if(gameState.tutorial.l1 === 5 && type === 'green') showTutorialStep(L1_TUTORIAL_STEPS, 'l1');
}

function renderL1() {
    const { currentBalloon, currentPumps } = gameState.l1;
    const scale = 1 + currentPumps * 0.08;
    l1BalloonArea.innerHTML = `<div class="balloon bg-${currentBalloon.colorClass}" style="--scale: ${scale}; transform: scale(${scale}); color: var(--tw-bg-${currentBalloon.colorClass})"><div class="balloon-face"><div class="eye left" style="transform: scaleY(${1 + currentPumps * 0.05})"></div><div class="eye right" style="transform: scaleY(${1 + currentPumps * 0.05})"></div><div class="mouth"></div></div><div class="balloon-string"></div></div>`;
    document.getElementById('l1-progress').textContent = `Balloon ${gameState.l1.balloonIndex + 1} of ${L1_SEQUENCE.length}`;
    document.getElementById('l1-current-score').textContent = currentPumps;
    
    Object.keys(gameState.l1.stats).forEach(color => {
        if (document.getElementById(`l1-${color}-score`)) {
            const stat = gameState.l1.stats[color] || { score: 0, pumps: 0, count: 0};
            document.getElementById(`l1-${color}-score`).textContent = `$${stat.score}`;
            const avg = stat.count > 0 ? (stat.pumps / stat.count).toFixed(1) : '0.0';
            document.getElementById(`l1-${color}-avg`).textContent = avg;
        }
    });

    const historyEl = document.getElementById('l1-history');
    historyEl.innerHTML = (gameState.l1.history || []).map(h => {
        const colorClass = BALLOON_CONFIG[h.type].color;
        const popClass = h.popped ? 'opacity-60' : '';
        return `<div class="w-12 h-14 rounded-[50%/60%_60%_40%_40%] bg-${colorClass} ${popClass} flex flex-col items-center justify-center text-white font-bold text-xs relative shadow-md" style="color: var(--tw-bg-${colorClass});"><span class="text-white">${h.pumps}</span><span class="text-lg">${h.popped ? '💥' : '💰'}</span><div class="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent" style="border-top-color: var(--tw-bg-${colorClass});"></div></div>`;
    }).join('');
}

/* ===========================================
    LEVEL 1: PATTERN RECOGNITION GAMEPLAY
    ===========================================
    These functions implement the core pattern recognition mechanics
    that teach students how AI systems learn from data patterns.
*/

/**
 * Handles balloon pumping - simulates AI parameter tuning
 * Each pump increases the potential reward but also the risk
 * This teaches students about risk vs. reward in AI decision-making
 */
function handleL1Pump() {
    if (gameState.l1.isPopping) return; // Prevent interaction during animation
    
    // Visual feedback for user interaction
    const balloonEl = l1BalloonArea.querySelector('.balloon');
    if (balloonEl) { 
        balloonEl.classList.remove('pump-jiggle'); 
        void balloonEl.offsetWidth; // Force reflow
        balloonEl.classList.add('pump-jiggle'); 
    }
    
    // Increment pump count (simulating AI parameter adjustment)
    gameState.l1.currentPumps++;
    
    // Check if balloon exceeds maximum capacity (AI overfitting/overconfidence)
    if (gameState.l1.currentPumps > gameState.l1.currentBalloon.maxPumps) { 
        handleL1Pop(); // Balloon pops - AI failure
    } else { 
        renderL1(); // Update display - continue learning
    }
}

function handleL1Bank() {
    if (gameState.l1.isPopping) return;
    const { type } = gameState.l1.currentBalloon;
    const pumps = gameState.l1.currentPumps;
    gameState.l1.stats[type].score += pumps;
    gameState.l1.stats[type].pumps += pumps;
    gameState.l1.stats[type].count++;
    addToL1History(type, pumps, false);
    gameState.l1.balloonIndex++;
    saveGameState();
    
    if (gameState.tutorial.l1 <= 2) showTutorialStep(L1_TUTORIAL_STEPS, 'l1');
    if (gameState.tutorial.l1 === 3 && gameState.l1.stats.red.count > 1) {
            showTutorialStep(L1_TUTORIAL_STEPS, 'l1');
    }
    setupNextL1Balloon();
}

function handleL1Pop() {
    gameState.l1.isPopping = true;
    const { type, maxPumps } = gameState.l1.currentBalloon;
    const balloonEl = l1BalloonArea.querySelector('.balloon');
    if (balloonEl) { createExplosion(l1BalloonArea, type); balloonEl.style.display = 'none'; }
    gameState.l1.stats[type].count++;
    addToL1History(type, maxPumps, true);
    saveGameState();
    setTimeout(() => { gameState.l1.balloonIndex++; setupNextL1Balloon(); }, 500);
}

function addToL1History(type, pumps, popped) {
    if(!gameState.l1.history) gameState.l1.history = [];
    gameState.l1.history.unshift({ type, pumps, popped });
    if (gameState.l1.history.length > 8) gameState.l1.history.pop();
    if (gameState.tutorial.l1 === 4) showTutorialStep(L1_TUTORIAL_STEPS, 'l1');
}

function endLevel1(isReview = false) {
    let totalScore = 0;
    if (!isReview) {
        gameState.unlockedLevels = Math.max(gameState.unlockedLevels, 2);
        totalScore = Object.values(gameState.l1.stats).reduce((sum, s) => sum + s.score, 0);
        if (totalScore > (gameState.l1.bestScore || 0)) {
            gameState.l1.bestScore = totalScore;
        }
        saveGameState();
    }
    
    totalScore = Object.values(gameState.l1.stats).reduce((sum, s) => sum + s.score, 0);
    const isNewBest = totalScore === gameState.l1.bestScore && !isReview;

    renderL1();
    l1BalloonArea.style.display = 'none';
    document.getElementById('l1-progress').style.display = 'none';
    document.getElementById('l1-controls').style.display = 'none';
    
    document.getElementById('l1-score-summary').innerHTML = `
        <p class="text-2xl font-semibold text-indigo-200">YOU EARNED</p>
        <p class="text-6xl font-bold text-yellow-300 my-2">$${totalScore}</p>
        <p class="text-lg font-semibold ${isNewBest ? 'text-green-400' : 'text-indigo-300'}">
            ${isNewBest ? 'New Best Score!' : `Best Score: $${gameState.l1.bestScore}`}
        </p>
    `;

    document.getElementById('l1-summary-area').style.display = 'block';
    document.getElementById('l1-insights-title').textContent = "Final Data Insights";
    setInsight(`<div class="text-left text-sm space-y-1">
            <p><strong><span class="text-red-400">Red:</span></strong> High risk, high reward. A tempting but dangerous choice.</p>
            <p><strong><span class="text-blue-400">Blue:</span></strong> Very predictable. Low risk, but the profits are smaller.</p>
            <p><strong><span class="text-green-400">Green:</span></strong> Highly unpredictable 'noisy data'. It's tough to form a reliable strategy here.</p>
        </div>`, 1);
    renderEducationalSlides('l1', 0);
}

// --- Educational Slides ---
const EDUCATIONAL_SLIDES = {
    l1: [
        { title: "You Are The AI!", text: "You just performed <strong>Pattern Recognition</strong>. By observing data (balloons popping), your brain created a mental model to predict future outcomes. This is the fundamental concept behind most AI systems!" },
        { title: "Beware of Bias!", text: "Did the first four Red balloons make you feel overconfident? This is a form of <strong>Selection Bias</strong>, where early data skews your model. An AI trained only on this data might make dangerously risky decisions." },
        { title: "Handling 'Noisy' Data", text: "Green balloons were chaotic, right? This represents <strong>'Noisy Data'</strong> in AI. It's difficult to find a reliable pattern in noisy data, which can lead to poor predictions and overfitting." }
    ]
};

let currentSlideIndex = 0;
function renderEducationalSlides(level, index) {
    currentSlideIndex = index;
    const slides = EDUCATIONAL_SLIDES[level];
    const slide = slides[index];
    const contentEl = document.getElementById('slide-content');
    contentEl.innerHTML = `<h3 class="text-2xl font-bold mb-2">${slide.title}</h3><p class="text-indigo-200">${slide.text}</p>`;
    document.getElementById('slide-indicator').textContent = `${index + 1} / ${slides.length}`;
    document.getElementById('prev-slide-btn').disabled = index === 0;
    document.getElementById('next-slide-btn').disabled = index === slides.length - 1;
}

// =================================
// ========= LEVEL 2 LOGIC =========
// =================================
const l2StartStopBtn = document.getElementById('l2-start-stop-btn');
const conveyor2 = document.getElementById('l2-conveyor');
const l2OpenGameBtn = document.getElementById('l2-open-game-btn');
const l2CompletionModal = document.getElementById('l2-completion-modal');
const l2ModalCloseBtn = document.getElementById('l2-modal-close');

function startLevel2() {
    showScreen('level-2');
    if (gameState.l2.processedCount >= 100) {
        endLevel2(true);
    } else {
        buildPerformanceMonitor('l2');
        updateL2Stats();
        displayPastStrategies(); // Show past strategies
        showTutorialStep(L2_TUTORIAL_STEPS, 'l2');
    }
}

function replayLevel2() {
    resetStats('l2');
    gameState.tutorial.l2 = 0;
    saveGameState();
    startLevel2();
}

function buildPerformanceMonitor(level) {
    const monitorEl = document.getElementById(`${level}-performance-monitor`);
    if(!monitorEl) return;
    monitorEl.innerHTML = Object.keys(BALLOON_CONFIG).map(color => `
        <div>
            <div class="flex justify-between items-baseline mb-1">
                <span class="font-bold text-${BALLOON_CONFIG[color].color}">${color.charAt(0).toUpperCase() + color.slice(1)}</span>
                <div class="text-right">
                    <span id="${level}-${color}-avg-score" class="font-mono text-lg">$0.0</span>
                    <span class="text-xs text-indigo-300 block">Avg. Score</span>
                </div>
                <div class="text-right">
                    <span id="${level}-${color}-pop-rate" class="font-mono text-lg">0%</span>
                        <span class="text-xs text-indigo-300 block">Pop Rate</span>
                </div>
            </div>
            <div class="performance-bar"><div id="${level}-${color}-perf-bar" class="performance-bar-inner"></div></div>
        </div>
    `).join('');
}

function updatePerformanceMonitor(level) {
        Object.keys(BALLOON_CONFIG).forEach(color => {
        const stats = gameState[level].stats[color];
        const avgScore = stats.count > 0 ? (stats.score / stats.count) : 0;
        const popRate = stats.count > 0 ? (stats.pops / stats.count) * 100 : 0;
        
        document.getElementById(`${level}-${color}-avg-score`).textContent = `$${avgScore.toFixed(1)}`;
        document.getElementById(`${level}-${color}-pop-rate`).textContent = `${popRate.toFixed(0)}%`;
        
        const bar = document.getElementById(`${level}-${color}-perf-bar`);
        const maxAvg = BALLOON_CONFIG[color].range[1];
        const perfPercent = Math.min(100, (avgScore / maxAvg) * 100);

        bar.style.width = `${perfPercent}%`;
        // Use balloon colors instead of performance colors
        if (color === 'red') {
            bar.className = 'performance-bar-inner bg-red-500';
        } else if (color === 'blue') {
            bar.className = 'performance-bar-inner bg-blue-400';
        } else if (color === 'green') {
            bar.className = 'performance-bar-inner bg-green-400';
        } else if (color === 'yellow') {
            bar.className = 'performance-bar-inner bg-yellow-400';
        }
        });
}

function setupL2Controls() { ['red', 'blue', 'green', 'yellow'].forEach(color => { const slider = document.getElementById(`l2-${color}-pumps`); const valSpan = document.getElementById(`l2-${color}-val`); slider.addEventListener('input', () => { valSpan.textContent = slider.value; if (!gameState.l2.isRunning) updateL2Strategy(); }); }); }
function updateL2Strategy() { ['red', 'blue', 'green', 'yellow'].forEach(color => { gameState.l2.strategy[color] = parseInt(document.getElementById(`l2-${color}-pumps`).value); }); }

function disableL2Sliders() {
    ['red', 'blue', 'green', 'yellow'].forEach(color => {
        const slider = document.getElementById(`l2-${color}-pumps`);
        slider.disabled = true;
        slider.style.opacity = '0.5';
        slider.style.cursor = 'not-allowed';
    });
}

function enableL2Sliders() {
    ['red', 'blue', 'green', 'yellow'].forEach(color => {
        const slider = document.getElementById(`l2-${color}-pumps`);
        slider.disabled = false;
        slider.style.opacity = '1';
        slider.style.cursor = 'pointer';
    });
}

function resetL2Simulation() {
    // Reset processed count
    gameState.l2.processedCount = 0;
    
    // Reset earned amount
    gameState.l2.totalEarned = 0;
    document.getElementById('l2-earned-amount').textContent = '0';
    
    // Reset stats
    const statsTemplate = { score: 0, pops: 0, count: 0, pumps: 0 };
    gameState.l2.stats = {
        red: {...statsTemplate},
        blue: {...statsTemplate},
        green: {...statsTemplate},
        yellow: {...statsTemplate}
    };
    
    // Clear conveyor belt
    const conveyor2 = document.getElementById('l2-conveyor');
    if (conveyor2) {
        conveyor2.innerHTML = '';
    }
    
    // Update display
    updateL2Stats();
    updatePerformanceMonitor('l2');
}

function saveL2Strategy() {
    // Calculate performance summary
    const performance = {};
    let totalScore = 0;
    let totalPops = 0;
    let totalCount = 0;
    
    ['red', 'blue', 'green', 'yellow'].forEach(color => {
        const stats = gameState.l2.stats[color];
        const avgScore = stats.count > 0 ? (stats.score / stats.count) : 0;
        const popRate = stats.count > 0 ? (stats.pops / stats.count) * 100 : 0;
        
        performance[color] = {
            avgScore: avgScore,
            popRate: popRate,
            count: stats.count
        };
        
        totalScore += stats.score;
        totalPops += stats.pops;
        totalCount += stats.count;
    });
    
    const overallPopRate = totalCount > 0 ? (totalPops / totalCount) * 100 : 0;
    const overallAvgScore = totalCount > 0 ? totalScore / totalCount : 0;
    
    // Create strategy record
    const strategyRecord = {
        timestamp: Date.now(),
        strategy: { ...gameState.l2.strategy },
        performance: performance,
        overallPopRate: overallPopRate,
        overallAvgScore: overallAvgScore,
        totalProcessed: gameState.l2.processedCount
    };
    
    // Add to past strategies (keep only last 3)
    if (!gameState.l2.pastStrategies) {
        gameState.l2.pastStrategies = [];
    }
    gameState.l2.pastStrategies.unshift(strategyRecord);
    if (gameState.l2.pastStrategies.length > 3) {
        gameState.l2.pastStrategies = gameState.l2.pastStrategies.slice(0, 3);
    }
    
    // Save to localStorage
    saveGameState();
    
    // Update display
    displayPastStrategies();
}

function displayPastStrategies() {
    const strategiesList = document.getElementById('l2-strategies-list');
    if (!strategiesList || !gameState.l2.pastStrategies) return;
    
    if (gameState.l2.pastStrategies.length === 0) {
        strategiesList.innerHTML = `
            <div class="bg-indigo-900/20 p-4 rounded-lg border border-indigo-600 min-w-[320px] flex-shrink-0 flex flex-col justify-center strategy-item">
                <div class="text-center">
                    <div class="text-indigo-400 text-sm mb-2">No strategies yet</div>
                    <div class="text-xs text-indigo-500">Run a test to see your strategies here</div>
                </div>
            </div>
        `;
        return;
    }
    
    strategiesList.innerHTML = gameState.l2.pastStrategies.map((strategy, index) => {
        const strategyNum = gameState.l2.pastStrategies.length - index;
        const timeAgo = Math.round((Date.now() - strategy.timestamp) / 1000);
        
        return `
            <div class="bg-indigo-900/30 p-4 rounded-lg border border-indigo-600 min-w-[320px] flex-shrink-0">
            <div class="flex justify-between items-center mb-3">
                <span class="text-sm font-bold text-indigo-200">Strategy ${strategyNum}</span>
                <button class="delete-strategy-btn text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 py-1 rounded transition" data-index="${index}">
                    ×
                </button>
            </div>
                
                <!-- Strategy Settings -->
                <div class="mb-3">
                    <div class="text-xs font-bold text-indigo-300 mb-2">Your Strategy:</div>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                        ${['red', 'blue', 'green', 'yellow'].map(color => `
                            <div class="flex justify-between items-center">
                                <div class="flex items-center gap-1">
                                    <div class="w-2 h-2 rounded-full bg-${color}-400"></div>
                                    <span class="text-${color}-400 font-bold">${color.toUpperCase()}:</span>
                                </div>
                                <span class="text-white font-mono">${strategy.strategy[color] || 0} pumps</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Performance Data by Color -->
                <div class="mb-3">
                    <div class="text-xs font-bold text-indigo-300 mb-2">Pop Rates by Color:</div>
                    <div class="space-y-1 text-xs">
                        ${['red', 'blue', 'green', 'yellow'].map(color => `
                            <div class="flex justify-between items-center">
                                <div class="flex items-center gap-1">
                                    <div class="w-2 h-2 rounded-full bg-${color}-400"></div>
                                    <span class="text-${color}-400">${color.toUpperCase()}:</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-white">${strategy.performance[color].count} balloons</span>
                                    <span class="text-red-400 font-bold">${strategy.performance[color].popRate.toFixed(0)}%</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Overall Summary -->
                <div class="pt-2 border-t border-indigo-600 text-xs">
                    <div class="flex justify-between mb-1">
                        <span class="text-indigo-300">Overall Pop Rate:</span>
                        <span class="text-red-400 font-bold">${strategy.overallPopRate.toFixed(0)}%</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-indigo-300">Total Earned:</span>
                        <span class="text-green-400 font-bold">$${strategy.overallAvgScore * strategy.totalProcessed}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add event listeners for delete buttons
    strategiesList.querySelectorAll('.delete-strategy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            deleteL2Strategy(index);
        });
    });
}

function deleteL2Strategy(index) {
    if (index >= 0 && index < gameState.l2.pastStrategies.length) {
        gameState.l2.pastStrategies.splice(index, 1);
        saveGameState();
        displayPastStrategies();
    }
}

function clearAllL2Strategies() {
    gameState.l2.pastStrategies = [];
    saveGameState();
    displayPastStrategies();
}

function skipL2ToEnd() {
    if (!gameState.l2.isRunning) return;
    
    // Stop the current simulation
    clearInterval(gameState.l2.interval);
    
    // Simulate processing remaining balloons instantly
    const remaining = 100 - gameState.l2.processedCount;
    for (let i = 0; i < remaining; i++) {
        const color = getL2RandomBalloon();
        const config = BALLOON_CONFIG[color];
        const maxPumps = getRandomInt(...config.range);
        const strategyPumps = gameState.l2.strategy[color];
        
        // Calculate if balloon pops (same logic as normal simulation)
        let scoreVal = 0;
        if (strategyPumps > maxPumps) {
            gameState.l2.stats[color].pops++;
        } else {
            scoreVal = strategyPumps;
            gameState.l2.stats[color].score += scoreVal;
        }
        
        // Update stats
        gameState.l2.stats[color].count++;
        gameState.l2.processedCount++;
        
        // Update earned amount
        gameState.l2.totalEarned = (gameState.l2.totalEarned || 0) + scoreVal;
    }
    
    // Update display
    updateL2Stats();
    document.getElementById('l2-earned-amount').textContent = gameState.l2.totalEarned;
    
    // Save the strategy
    saveL2Strategy();
    
    // Small delay to ensure performance monitor updates are visible
    setTimeout(() => {
        endLevel2(true);
    }, 100);
}

function toggleL2Simulation() {
    gameState.l2.isRunning = !gameState.l2.isRunning;
    const skipBtn = document.getElementById('l2-skip-to-end-btn');
    
    if (gameState.l2.isRunning) {
        if (gameState.tutorial.l2 < L2_TUTORIAL_STEPS.length) showTutorialStep(L2_TUTORIAL_STEPS, 'l2');
        l2StartStopBtn.textContent = 'FINISH TEST';
        l2StartStopBtn.classList.remove('bg-indigo-500', 'hover:bg-indigo-600');
        l2StartStopBtn.classList.add('bg-red-500', 'hover:bg-red-600');
        updateL2Strategy();
        disableL2Sliders();
        resetL2Simulation(); // Reset when starting
        runL2Simulation();
        skipBtn.classList.remove('hidden'); // Show skip button
    } else {
        if (gameState.tutorial.l2 < L2_TUTORIAL_STEPS.length) showTutorialStep(L2_TUTORIAL_STEPS, 'l2');
        l2StartStopBtn.textContent = 'RUN TEST';
        l2StartStopBtn.classList.add('bg-indigo-500', 'hover:bg-indigo-600');
        l2StartStopBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
        enableL2Sliders();
        saveL2Strategy(); // Save strategy when pausing
        clearInterval(gameState.l2.interval);
        skipBtn.classList.add('hidden'); // Hide skip button when paused
    }
}

function getL2RandomBalloon() { const rand = Math.random(); if (rand < 0.3) return 'red'; if (rand < 0.6) return 'blue'; if (rand < 0.8) return 'green'; return 'yellow'; }

/* ===========================================
    LEVEL 2: HUMAN-IN-THE-LOOP AI SIMULATION
    ===========================================
    This function simulates AI model training and deployment,
    teaching students about automated decision-making and
    the importance of human oversight in AI systems.
*/

/**
 * Runs the AI simulation - processes 100 balloons using configured strategy
 * This simulates how AI models process large datasets automatically
 * Students learn about AI performance monitoring and optimization
 */
function runL2Simulation() {
    gameState.l2.interval = setInterval(() => {
        // Stop after processing 100 balloons (simulating batch processing)
        if (gameState.l2.processedCount >= 100) { endLevel2(); return; }
        
        // Select random balloon type (simulating diverse input data)
        const type = getL2RandomBalloon();
        const config = BALLOON_CONFIG[type];
        
        // Generate random maximum capacity (simulating data variability)
        const maxPumps = getRandomInt(...config.range);
        
        // Apply AI strategy (simulating model prediction)
        const strategyPumps = gameState.l2.strategy[type];
        
        // Calculate result (simulating model performance evaluation)
        let scoreVal = 0;
        if (strategyPumps > maxPumps) { 
            gameState.l2.stats[type].pops++; // AI overconfidence - model failure
        } else { 
            scoreVal = strategyPumps; 
            gameState.l2.stats[type].score += scoreVal; // Successful prediction
        }
        
        // Update statistics (simulating performance monitoring)
        gameState.l2.stats[type].count++; 
        gameState.l2.processedCount++;
        
        // Update earned amount
        gameState.l2.totalEarned = (gameState.l2.totalEarned || 0) + scoreVal;
        document.getElementById('l2-earned-amount').textContent = gameState.l2.totalEarned;
        const balloonItem = document.createElement('div');
        balloonItem.className = 'absolute top-1/2 left-1/2 conveyor-belt-item';
        const balloonEl = document.createElement('div');
        balloonEl.className = `balloon bg-${config.color}`;
        balloonEl.style.transform = 'scale(0.5)';
        balloonEl.style.color = `var(--tw-bg-${config.color})`;
        balloonItem.appendChild(balloonEl);
        if (scoreVal === 0) { 
            setTimeout(() => { 
                balloonEl.classList.add('pre-explode');
                setTimeout(() => { 
                    createExplosion(balloonItem, type); 
                    balloonEl.style.display = 'none'; 
                }, 500);
            }, 1500); 
        }
        conveyor2.appendChild(balloonItem);
        setTimeout(() => { if (conveyor2.contains(balloonItem)) conveyor2.removeChild(balloonItem); }, 4000);
        updateL2Stats();
        if (gameState.l2.processedCount === 25) setInsight("Your model is running. Are the pop rates acceptable? Pause and adjust!", 2);
        if (gameState.l2.processedCount === 60) setInsight("The performance monitor gives you live feedback. Are any of your strategies unprofitable?", 2);
    }, 400); // Slower pace
}

function updateL2Stats() {
    document.getElementById('l2-processed-count').textContent = gameState.l2.processedCount;
    updatePerformanceMonitor('l2');
}

function endLevel2(isReview = false) {
    if (!isReview) {
        clearInterval(gameState.l2.interval);
        gameState.l2.isRunning = false;
        gameState.unlockedLevels = Math.max(gameState.unlockedLevels, 3);
        saveGameState();
    }
    updateL2Stats();
    
    // Reset button to RUN TEST state
    l2StartStopBtn.textContent = 'RUN TEST';
    l2StartStopBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
    l2StartStopBtn.classList.add('bg-indigo-500', 'hover:bg-indigo-600');
    enableL2Sliders();
    
    // Show completion modal instead of summary area
    l2CompletionModal.classList.remove('hidden');
}

// =================================
// ========= LEVEL 3 LOGIC =========
// =================================
const l3StartStopBtn = document.getElementById('l3-start-stop-btn');
const l3Conveyor = document.getElementById('l3-conveyor');
const l3TempDisplay = document.getElementById('l3-temp-display');

function startLevel3() {
    showScreen('level-3');
    updateL3Strategy();
    buildPerformanceMonitor('l3');
    updateL3Stats();
    updateWeatherDisplay();
    showTutorialStep(L3_TUTORIAL_STEPS, 'l3');
}

function setupL3Controls() { ['red', 'blue', 'green', 'yellow'].forEach(color => { const slider = document.getElementById(`l3-${color}-pumps`); const valSpan = document.getElementById(`l3-${color}-val`); slider.addEventListener('input', () => { valSpan.textContent = slider.value; updateL3Strategy(); }); }); }
function updateL3Strategy() { ['red', 'blue', 'green', 'yellow'].forEach(color => { gameState.l3.strategy[color] = parseInt(document.getElementById(`l3-${color}-pumps`).value); }); }

function toggleL3Simulation() {
    gameState.l3.isRunning = !gameState.l3.isRunning;
    if (gameState.l3.isRunning) {
        l3StartStopBtn.textContent = '⏸️ PAUSE PRODUCTION';
        l3StartStopBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
        l3StartStopBtn.classList.add('bg-amber-500', 'hover:bg-amber-600');
        runL3Simulation();
        runL3TempChanges();
    } else {
        l3StartStopBtn.textContent = '🚀 START PRODUCTION';
        l3StartStopBtn.classList.add('bg-green-500', 'hover:bg-green-600');
        l3StartStopBtn.classList.remove('bg-amber-500', 'hover:bg-amber-600');
        clearInterval(gameState.l3.interval);
        clearTimeout(gameState.l3.tempInterval);
        hideWeatherEffects();
    }
}

function updateWeatherDisplay() {
    const temp = gameState.l3.temperature;
    const weatherIcon = document.getElementById('weather-icon');
    const weatherStatus = document.getElementById('weather-status');
    const tempBar = document.getElementById('temp-bar');
    
    // Update temperature display
    l3TempDisplay.textContent = `${temp}°C`;
    
    // Update weather icon and status with more dramatic conditions
    if (temp > 35) {
        weatherIcon.innerHTML = '🔥<div class="sun-effect extreme-heat"></div>';
        weatherStatus.textContent = 'EXTREME HEAT - CRITICAL RISK';
        l3TempDisplay.className = 'text-4xl font-black transition-all duration-1000 mb-2 text-red-600 animate-pulse';
        tempBar.style.width = '100%';
        tempBar.className = 'h-full bg-gradient-to-r from-red-500 to-red-700 transition-all duration-1000';
        showWeatherEffect('extreme-heat');
    } else if (temp > 30) {
        weatherIcon.innerHTML = '🌡️<div class="sun-effect heat-wave"></div>';
        weatherStatus.textContent = 'Heat Wave - HIGH RISK';
        l3TempDisplay.className = 'text-4xl font-black transition-all duration-1000 mb-2 text-red-500';
        tempBar.style.width = '90%';
        tempBar.className = 'h-full bg-gradient-to-r from-yellow-400 to-red-500 transition-all duration-1000';
        showWeatherEffect('heat');
    } else if (temp > 25) {
        weatherIcon.innerHTML = '☀️<div class="sun-effect warm"></div>';
        weatherStatus.textContent = 'Warm - Moderate Risk';
        l3TempDisplay.className = 'text-4xl font-black transition-all duration-1000 mb-2 text-orange-400';
        tempBar.style.width = '70%';
        tempBar.className = 'h-full bg-gradient-to-r from-orange-400 to-red-400 transition-all duration-1000';
        hideWeatherEffects();
    } else if (temp < 5) {
        weatherIcon.textContent = '🧊';
        weatherStatus.textContent = 'BLIZZARD - EXTREME COLD';
        l3TempDisplay.className = 'text-4xl font-black transition-all duration-1000 mb-2 text-blue-600 animate-pulse';
        tempBar.style.width = '10%';
        tempBar.className = 'h-full bg-gradient-to-r from-blue-600 to-blue-800 transition-all duration-1000';
        showWeatherEffect('blizzard');
    } else if (temp < 10) {
        weatherIcon.textContent = '❄️';
        weatherStatus.textContent = 'Cold Snap - Low Risk';
        l3TempDisplay.className = 'text-4xl font-black transition-all duration-1000 mb-2 text-blue-400';
        tempBar.style.width = '20%';
        tempBar.className = 'h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000';
        showWeatherEffect('snow');
    } else if (temp < 15) {
        weatherIcon.textContent = '⛈️';
        weatherStatus.textContent = 'Storm - Unstable Conditions';
        l3TempDisplay.className = 'text-4xl font-black transition-all duration-1000 mb-2 text-purple-400';
        tempBar.style.width = '30%';
        tempBar.className = 'h-full bg-gradient-to-r from-purple-400 to-blue-500 transition-all duration-1000';
        showWeatherEffect('storm');
    } else if (temp < 20) {
        weatherIcon.textContent = '🌧️';
        weatherStatus.textContent = 'Cool - Stable Conditions';
        l3TempDisplay.className = 'text-4xl font-black transition-all duration-1000 mb-2 text-blue-300';
        tempBar.style.width = '40%';
        tempBar.className = 'h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-1000';
        showWeatherEffect('rain');
    } else {
        weatherIcon.textContent = '🌤️';
        weatherStatus.textContent = 'Perfect Conditions';
        l3TempDisplay.className = 'text-4xl font-black transition-all duration-1000 mb-2 text-green-400';
        tempBar.style.width = '50%';
        tempBar.className = 'h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-1000';
        hideWeatherEffects();
    }
}

function showWeatherEffect(type) {
    hideWeatherEffects();
    const container = document.getElementById('weather-effects');
    let effectDiv;
    
    // Determine which effect container to use
    if (type === 'extreme-heat' || type === 'heat') {
        effectDiv = document.getElementById('heat-waves');
    } else if (type === 'blizzard' || type === 'snow') {
        effectDiv = document.getElementById('snow-flakes');
    } else if (type === 'storm' || type === 'rain') {
        effectDiv = document.getElementById('rain-drops');
    }
    
    effectDiv.classList.remove('hidden');
    
    // Start continuous weather animation
    startContinuousWeatherEffect(type, effectDiv);
    
}

function hideWeatherEffects() {
    document.getElementById('rain-drops').classList.add('hidden');
    document.getElementById('snow-flakes').classList.add('hidden');
    document.getElementById('heat-waves').classList.add('hidden');
    document.getElementById('rain-drops').innerHTML = '';
    document.getElementById('snow-flakes').innerHTML = '';
    document.getElementById('heat-waves').innerHTML = '';
    // Clear any ongoing weather intervals
    if (gameState.l3.weatherInterval) {
        clearInterval(gameState.l3.weatherInterval);
        gameState.l3.weatherInterval = null;
    }
}

function startContinuousWeatherEffect(type, effectDiv) {
    // Clear any existing weather interval
    if (gameState.l3.weatherInterval) {
        clearInterval(gameState.l3.weatherInterval);
    }
    
    // Start continuous weather based on type
    if (type === 'rain') {
        gameState.l3.weatherInterval = setInterval(() => {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = Math.random() * 100 + '%';
            drop.style.animationDelay = Math.random() * 2 + 's';
            effectDiv.appendChild(drop);
            setTimeout(() => drop.remove(), 2000);
        }, 100);
    } else if (type === 'storm') {
        gameState.l3.weatherInterval = setInterval(() => {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = Math.random() * 100 + '%';
            drop.style.animationDelay = Math.random() * 1 + 's';
            effectDiv.appendChild(drop);
            setTimeout(() => drop.remove(), 1500);
        }, 50);
    } else if (type === 'snow') {
        gameState.l3.weatherInterval = setInterval(() => {
            const flake = document.createElement('div');
            flake.className = 'snow-flake';
            flake.style.left = Math.random() * 100 + '%';
            flake.style.animationDelay = Math.random() * 3 + 's';
            effectDiv.appendChild(flake);
            setTimeout(() => flake.remove(), 4000);
        }, 200);
    } else if (type === 'blizzard') {
        gameState.l3.weatherInterval = setInterval(() => {
            const flake = document.createElement('div');
            flake.className = 'snow-flake';
            flake.style.left = Math.random() * 100 + '%';
            flake.style.animationDelay = Math.random() * 1 + 's';
            effectDiv.appendChild(flake);
            setTimeout(() => flake.remove(), 2000);
        }, 80);
    } else if (type === 'heat' || type === 'extreme-heat') {
        gameState.l3.weatherInterval = setInterval(() => {
            const wave = document.createElement('div');
            wave.className = 'heat-wave';
            wave.style.left = Math.random() * 100 + '%';
            wave.style.animationDelay = Math.random() * 2 + 's';
            effectDiv.appendChild(wave);
            setTimeout(() => wave.remove(), 3000);
        }, 150);
    }
}

/* ===========================================
    LEVEL 3: AI TEMPERATURE CONTROL SYSTEM
    ===========================================
    This function implements AI temperature control mechanics,
    teaching students how environmental conditions affect AI behavior
    and the importance of adaptive AI systems.
*/

/**
 * Manages AI temperature changes - simulates environmental conditions
 * affecting AI model behavior. Temperature directly impacts:
 * - Creativity vs. Stability (high temp = creative/risky, low temp = stable/conservative)
 * - Model confidence and decision-making
 * - Risk tolerance and output variability
 */
function runL3TempChanges() {
    const updateTemp = () => {
        // Random temperature change (simulating environmental variability)
        const change = getRandomInt(-5, 5);
        gameState.l3.temperature += change;
        
        // Clamp temperature to realistic range (0-40°C)
        if (gameState.l3.temperature > 40) gameState.l3.temperature = 40;
        if (gameState.l3.temperature < 0) gameState.l3.temperature = 0;
        
        updateWeatherDisplay();
        
        if (gameState.l3.temperature > 35) {
            setInsight("🔥 CRITICAL ALERT! Extreme heat detected! Balloons are extremely fragile - reduce all pump settings immediately!", 3);
        } else if (gameState.l3.temperature > 30) {
            setInsight("🌡️ Heat wave warning! Balloons are more fragile. Consider reducing pump settings to avoid catastrophic losses!", 3);
        } else if (gameState.l3.temperature > 25) {
            setInsight("☀️ Warm conditions detected. Balloons are slightly more fragile. Monitor your settings carefully!", 3);
        } else if (gameState.l3.temperature < 5) {
            setInsight("🧊 BLIZZARD CONDITIONS! Extreme cold makes balloons ultra-stable. You can maximize pump settings for massive profits!", 3);
        } else if (gameState.l3.temperature < 10) {
            setInsight("❄️ Cold snap detected! Balloons are very stable. Increase pump settings for higher profits!", 3);
        } else if (gameState.l3.temperature < 15) {
            setInsight("⛈️ Storm conditions! Unstable weather affects balloon behavior. Adjust settings carefully!", 3);
        } else if (gameState.l3.temperature < 20) {
            setInsight("🌧️ Cool conditions detected. Balloons are stable. Good time to optimize your strategy!", 3);
        } else {
            setInsight("🌤️ Perfect factory conditions! Your AI is performing optimally in ideal weather.", 3);
        }
        
        gameState.l3.tempInterval = setTimeout(updateTemp, getRandomInt(15000, 60000));
    };
    updateTemp();
}

function runL3Simulation() {
        gameState.l3.interval = setInterval(() => {
        const type = getL2RandomBalloon();
        const config = BALLOON_CONFIG[type];
        const strategyPumps = gameState.l3.strategy[type];
        const tempDiff = gameState.l3.temperature - 20;
        const percentChange = Math.round(tempDiff / 2);
        let [min, max] = [...config.range];
        min = Math.max(1, Math.round(min * (1 - percentChange / 100)));
        max = Math.max(min + 1, Math.round(max * (1 - percentChange / 100)));
        const maxPumps = getRandomInt(min, max);
        let scoreVal = 0;
        if (strategyPumps > maxPumps) { gameState.l3.stats[type].pops++; } else { scoreVal = strategyPumps; gameState.l3.stats[type].score += scoreVal; gameState.l3.totalScore += scoreVal; }
        gameState.l3.stats[type].count++;
        gameState.l3.processedCount = (gameState.l3.processedCount || 0) + 1;
        document.getElementById('l3-balloons-processed').textContent = gameState.l3.processedCount;
        const balloonItem = document.createElement('div');
        balloonItem.className = 'absolute top-1/2 left-1/2 conveyor-belt-item';
        const balloonEl = document.createElement('div');
        balloonEl.className = `balloon bg-${config.color}`;
        balloonEl.style.transform = 'scale(0.5)'; balloonEl.style.color = `var(--tw-bg-${config.color})`;
        balloonItem.appendChild(balloonEl);
        if (scoreVal === 0) { setTimeout(() => { createExplosion(balloonItem, type); balloonEl.style.display = 'none'; }, 2000); }
        l3Conveyor.appendChild(balloonItem);
        setTimeout(() => { if (l3Conveyor.contains(balloonItem)) l3Conveyor.removeChild(balloonItem); }, 4000);
        updateL3Stats();
        saveGameState();
        }, 400);
}

function updateL3Stats() {
    document.getElementById('l3-total-score').textContent = gameState.l3.totalScore;
    updatePerformanceMonitor('l3');
}

function resetL3Production() {
    if (confirm('Are you sure you want to reset production? This will stop the current production and reset all statistics.')) {
        // Stop the simulation
        if (gameState.l3.isRunning) {
            toggleL3Simulation();
        }
        
        // Clear intervals
        if (gameState.l3.interval) {
            clearInterval(gameState.l3.interval);
            gameState.l3.interval = null;
        }
        if (gameState.l3.tempInterval) {
            clearInterval(gameState.l3.tempInterval);
            gameState.l3.tempInterval = null;
        }
        if (gameState.l3.weatherInterval) {
            clearInterval(gameState.l3.weatherInterval);
            gameState.l3.weatherInterval = null;
        }
        
        // Reset Level 3 stats
        gameState.l3.totalScore = 0;
        gameState.l3.processedCount = 0;
        gameState.l3.temperature = 20;
        gameState.l3.isRunning = false;
        
        // Reset individual color stats
        Object.keys(gameState.l3.stats).forEach(color => {
            gameState.l3.stats[color] = { score: 0, pumps: 0, count: 0, pops: 0 };
        });
        
        // Reset strategy to default values
        gameState.l3.strategy = { red: 8, blue: 5, green: 6, yellow: 10 };
        
        // Update UI
        updateL3Stats();
        updateWeatherDisplay();
        updateL3Strategy();
        
        // Reset sliders to default values
        document.getElementById('l3-red-pumps').value = 8;
        document.getElementById('l3-blue-pumps').value = 5;
        document.getElementById('l3-green-pumps').value = 6;
        document.getElementById('l3-yellow-pumps').value = 10;
        
        // Update slider display values
        document.getElementById('l3-red-val').textContent = '8';
        document.getElementById('l3-blue-val').textContent = '5';
        document.getElementById('l3-green-val').textContent = '6';
        document.getElementById('l3-yellow-val').textContent = '10';
        
        // Reset button text
        l3StartStopBtn.textContent = '🚀 START PRODUCTION';
        l3StartStopBtn.classList.remove('bg-amber-500', 'hover:bg-amber-600');
        l3StartStopBtn.classList.add('bg-green-500', 'hover:bg-green-600');
        
        // Clear conveyor belt
        if (l3Conveyor) {
            l3Conveyor.innerHTML = '';
        }
        
        // Clear insights
        const insightsElement = document.getElementById('l3-insights');
        if (insightsElement) {
            insightsElement.textContent = 'Production reset. Ready to start fresh!';
        }
        
        // Save state
        saveGameState();
    }
}

// --- Initial Event Listeners ---
homeBtn.addEventListener('click', () => showScreen('main-menu'));
helpBtn.addEventListener('click', () => {
    const activeScreenId = document.querySelector('.active-screen').id;
    if (activeScreenId === 'level-1') { gameState.tutorial.l1 = 0; showTutorialStep(L1_TUTORIAL_STEPS, 'l1'); }
    if (activeScreenId === 'level-2') { gameState.tutorial.l2 = 0; showTutorialStep(L2_TUTORIAL_STEPS, 'l2'); }
    if (activeScreenId === 'level-3') { gameState.tutorial.l3 = 0; showTutorialStep(L3_TUTORIAL_STEPS, 'l3'); }
});
startGameBtn.addEventListener('click', goToLevelSelect);
selectL1Btn.addEventListener('click', startLevel1);
selectL2Btn.addEventListener('click', startLevel2);
selectL3Btn.addEventListener('click', startLevel3);
resetProgressBtn.addEventListener('click', resetAllProgress);
l1PumpBtn.addEventListener('click', handleL1Pump);
l1BankBtn.addEventListener('click', handleL1Bank);
document.getElementById('l1-summary-next-btn').addEventListener('click', startLevel2);
document.getElementById('l1-summary-replay-btn').addEventListener('click', replayLevel1);
document.getElementById('prev-slide-btn').addEventListener('click', () => renderEducationalSlides('l1', currentSlideIndex - 1));
document.getElementById('next-slide-btn').addEventListener('click', () => renderEducationalSlides('l1', currentSlideIndex + 1));

l2StartStopBtn.addEventListener('click', toggleL2Simulation);
document.getElementById('l2-clear-all-strategies').addEventListener('click', clearAllL2Strategies);
document.getElementById('l2-skip-to-end-btn').addEventListener('click', skipL2ToEnd);
document.getElementById('l2-back-to-learn-btn').addEventListener('click', () => showScreen('level-1'));
l2ModalCloseBtn.addEventListener('click', () => {
    l2CompletionModal.classList.add('hidden');
});
l2OpenGameBtn.addEventListener('click', () => {
    startLevel3();
    l2CompletionModal.classList.add('hidden');
});
setupL2Controls();
l3StartStopBtn.addEventListener('click', toggleL3Simulation);
document.getElementById('l3-reset-production-btn').addEventListener('click', resetL3Production);
setupL3Controls();

// --- Custom Tooltip Event Listeners ---
selectL2Btn.addEventListener('mouseenter', (e) => {
    if (selectL2Btn.disabled) {
        showTooltip('Level 1 must be completed first', e.clientX, e.clientY);
    }
});
selectL2Btn.addEventListener('mouseleave', hideTooltip);
selectL2Btn.addEventListener('mousemove', updateTooltipPosition);

selectL3Btn.addEventListener('mouseenter', (e) => {
    if (selectL3Btn.disabled) {
        showTooltip('Level 2 must be completed first', e.clientX, e.clientY);
    }
});
selectL3Btn.addEventListener('mouseleave', hideTooltip);
selectL3Btn.addEventListener('mousemove', updateTooltipPosition);

// --- Skip Tutorial Event Listener ---
skipTutorialBtn.addEventListener('click', skipTutorial);

tutorialBox.addEventListener('click', (e) => e.stopPropagation());
tutorialNextBtn.addEventListener('click', () => {
    const activeScreenId = document.querySelector('.active-screen').id;
    if (!activeScreenId.startsWith('level-')) return;
    const levelKey = 'l' + activeScreenId.slice(-1);
    const steps = levelKey === 'l1' ? L1_TUTORIAL_STEPS : levelKey === 'l2' ? L2_TUTORIAL_STEPS : L3_TUTORIAL_STEPS;
    advanceTutorial(1, steps, levelKey);
});
tutorialPrevBtn.addEventListener('click', () => {
    const activeScreenId = document.querySelector('.active-screen').id;
    if (!activeScreenId.startsWith('level-')) return;
    const levelKey = 'l' + activeScreenId.slice(-1);
    const steps = levelKey === 'l1' ? L1_TUTORIAL_STEPS : levelKey === 'l2' ? L2_TUTORIAL_STEPS : L3_TUTORIAL_STEPS;
    advanceTutorial(-1, steps, levelKey);
});

/* ===========================================
    GAME INITIALIZATION & STARTUP
    ===========================================
    The game initializes with comprehensive AI literacy education
    through interactive gameplay. Students progress through three levels:
    
    1. PATTERN RECOGNITION (Level 1)
        - Learn to identify data patterns
        - Understand data bias and reliability
        - Develop statistical thinking skills
        
    2. HUMAN-IN-THE-LOOP AI TRAINING (Level 2)
        - Configure AI parameters
        - Monitor AI performance in real-time
        - Learn the importance of human oversight
        
    3. AI TEMPERATURE CONTROL (Level 3)
        - Understand creativity vs. stability trade-offs
        - Learn to adapt AI to changing conditions
        - Experience continuous AI deployment scenarios
        
    This implementation demonstrates how complex AI concepts can be
    made accessible and engaging for students in Years 7-10 through
    gamification and visual metaphors.
*/

// --- Load Game on Startup ---
initGame();
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    // Trigger initial title animation for engaging user experience
    setTimeout(() => {
        animateTitlePage();
    }, 200);
});