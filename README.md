# PopLogic - AI Learning Game

A modular, educational game that teaches AI concepts through interactive balloon economics.

## 🎯 Project Overview

PopLogic is an educational game designed to teach AI literacy concepts to students in Years 7-10. Players learn about pattern recognition, data bias, human-in-the-loop processes, and AI temperature through engaging balloon factory simulations.

## 🏗️ Modular Architecture

The project has been refactored to follow modern JavaScript best practices with a clean, modular structure:

### 📁 File Structure

```
poplogic-ai/
├── index.html                 # Original monolithic version
├── index-modular.html         # New modular version
├── styles.css                 # Centralized CSS styles
├── js/
│   ├── app.js                 # Main application controller
│   ├── gameState.js           # Game state management
│   ├── screenManager.js       # Screen navigation
│   ├── tutorialManager.js     # Tutorial system
│   ├── weatherSystem.js       # Weather effects and temperature
│   ├── balloonRenderer.js     # Balloon creation and animation
│   ├── level1Controller.js    # Level 1 gameplay logic
│   ├── level2Controller.js    # Level 2 gameplay logic
│   ├── level3Controller.js    # Level 3 gameplay logic
│   └── constants.js           # Game constants and configuration
└── README.md                  # This file
```

### 🔧 Module Responsibilities

#### **Core Modules**
- **`app.js`** - Main application controller, coordinates all modules
- **`gameState.js`** - Centralized state management and persistence
- **`screenManager.js`** - Handles navigation between different screens
- **`constants.js`** - Game configuration, balloon settings, tutorial steps

#### **Feature Modules**
- **`tutorialManager.js`** - Educational content and step progression
- **`weatherSystem.js`** - Weather effects, temperature changes, visual animations
- **`balloonRenderer.js`** - Balloon creation, animation, and visual effects

#### **Level Controllers**
- **`level1Controller.js`** - Pattern recognition gameplay
- **`level2Controller.js`** - AI bot training simulation
- **`level3Controller.js`** - Temperature control and adaptive strategies

## 🎮 Game Levels

### Level 1: Pattern Recognition
- **Concept**: Learn to recognize patterns in balloon behavior
- **Mechanics**: Pump balloons to increase value, avoid popping
- **AI Concepts**: Pattern recognition, data bias, context windows

### Level 2: AI Bot Training
- **Concept**: Program an AI bot with pump strategies
- **Mechanics**: Set strategies, watch AI perform, adjust in real-time
- **AI Concepts**: AI training, human-in-the-loop, performance monitoring

### Level 3: Temperature Control
- **Concept**: Master AI temperature and creativity concepts
- **Mechanics**: Adapt strategies to changing weather conditions
- **AI Concepts**: AI temperature, creativity vs. stability, adaptive AI

## 🚀 Getting Started

### Option 1: Modular Version (Recommended)
```bash
# Open the modular version
open index-modular.html
```

### Option 2: Original Version
```bash
# Open the original monolithic version
open index.html
```

The tutorial system teaches:
- **Pattern Recognition**: How AI identifies patterns in data
- **Data Bias**: Personal vs. global data differences
- **Context Windows**: AI memory limitations
- **Human-in-the-Loop**: Human oversight in AI systems
- **AI Temperature**: Creativity vs. stability in AI
- **Adaptive AI**: Systems that change based on conditions

## 🔧 Technical Features

- **Modular Architecture**: Clean separation of concerns
- **State Persistence**: Game progress saved automatically
- **Responsive Design**: Works on desktop and mobile
- **Accessibility**: WCAG compliant design
- **Performance**: Optimized animations and rendering
- **Cross-browser**: Modern browser compatibility

## 🎯 Learning Objectives

Students will learn:
1. How AI recognizes patterns in data
2. The importance of data quality and bias
3. Human oversight in AI systems
4. How AI creativity is controlled
5. Real-world AI applications and limitations

## 📖 Usage

1. **Start with Level 1**: Learn basic pattern recognition
2. **Progress to Level 2**: Understand AI training and oversight
3. **Master Level 3**: Explore AI creativity and adaptation
4. **Review Concepts**: Use the tutorial system for reinforcement

This project is designed for educational purposes. Feel free to use and modify for learning about AI concepts.
