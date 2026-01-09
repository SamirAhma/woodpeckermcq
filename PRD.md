# Woodpecker - Product Requirements Document

## Executive Summary

**Woodpecker** is a spaced repetition MCQ (Multiple Choice Question) training application designed to build intuitive pattern recognition through progressive time pressure. Inspired by chess training methodologies, it uses a "halving" technique where users must complete rounds in progressively shorter time periods while maintaining perfect accuracy.

---

## Product Vision

Enable users to internalize knowledge patterns so deeply that answers become intuitive rather than analytical, achieved through systematic time-compressed repetition with enforced rest periods for memory consolidation.

---

## Core Concepts

### The Woodpecker Method
1. **Progressive Time Compression**: Each successful round must be completed in half the time of the previous round
2. **Perfect Accuracy Requirement**: 100% accuracy required to advance
3. **Enforced Rest Periods**: 24-hour mandatory rest between passed rounds for memory consolidation
4. **Immediate Retry on Failure**: Failed rounds can be retried immediately without rest period
5. **Pattern Recognition Focus**: Questions tagged by pattern/topic for targeted learning

---

## User Personas

### Primary: Self-Learners
- Students preparing for exams
- Professionals studying for certifications
- Anyone building deep knowledge in a subject

### Secondary: Educators
- Teachers creating practice sets for students
- Trainers developing certification materials

---

## Key Features

### 1. Set Management

#### 1.1 Create & Upload Sets
**User Story**: As a user, I want to create question sets so I can practice specific topics.

**Acceptance Criteria**:
- Support multiple input formats:
  - Full JSON with metadata
  - Minified JSON (compact format)
  - TOON (Token-Oriented Object Notation) for LLM generation
- Configure target rounds (default: 7)
- Set title and metadata
- Bulk upload questions

**Technical Details**:
```json
{
  "title": "React Advanced Patterns",
  "targetRounds": 7,
  "questions": [
    {
      "question": "What is a Higher-Order Component?",
      "options": ["A function", "A class", "A component"],
      "answer": "A function",
      "explanation": "HOCs are functions that take a component and return a new component",
      "patternTag": "React Patterns"
    }
  ]
}
```

#### 1.2 Browse & Filter Sets
**User Story**: As a user, I want to browse my question sets so I can choose what to study.

**Acceptance Criteria**:
- Grid view of all sets
- Search by title
- Filter by favorites
- Display metadata: question count, creation date
- Visual indicators for rest period status

#### 1.3 Set Actions
- Mark as favorite
- Download set (JSON/TOON format)
- Add questions to existing set
- Delete set
- View analytics

---

### 2. Training Flow

#### 2.1 Session Initialization
**User Story**: As a user, I want to start a training session so I can practice questions.

**Acceptance Criteria**:
- Create new session or resume existing
- Randomize question order for first round
- Initialize timer (no time limit for Round 1)
- Track session state for persistence

#### 2.2 Question Presentation
**User Story**: As a user, I want to answer questions with immediate feedback.

**Acceptance Criteria**:
- Display question with shuffled options
- Show current progress (question X of Y)
- Display round number and target rounds
- Show target time (if applicable)
- Real-time timer for current question
- Color-coded timing feedback:
  - Green: < 2 seconds
  - Yellow: 2-5 seconds
  - Red: > 5 seconds

#### 2.3 Answer Feedback
**User Story**: As a user, I want immediate feedback so I can learn from mistakes.

**Acceptance Criteria**:
- Highlight correct answer (green)
- Highlight incorrect selection (red)
- Display explanation and pattern tag
- Auto-advance after 300ms on correct answer
- Manual advance on incorrect answer
- Track incorrect questions for re-run

#### 2.4 Round Completion
**User Story**: As a user, I want to see my performance so I can track progress.

**Acceptance Criteria**:
- Display final score
- Show accuracy percentage
- Show time taken vs target time
- Calculate pass/fail status:
  - **Pass**: 100% accuracy AND (no target OR beat target time)
  - **Fail**: < 100% accuracy OR exceeded target time
- Show next round target time (current time ÷ 2)
- Display appropriate action:
  - **Passed + Not Complete**: "Start Round X" (after rest period)
  - **Passed + Complete**: "Back to Dashboard"
  - **Failed**: "Retry Round X" (immediate)

---

### 3. Rest Period Enforcement

#### 3.1 24-Hour Consolidation
**User Story**: As a user, I need enforced rest periods so my brain can consolidate patterns.

**Acceptance Criteria**:
- Trigger only after PASSED rounds
- 24-hour countdown from round completion
- Multiple enforcement layers:
  - Home page: Grayed out card with timer badge
  - Study page: Disabled start button
  - Quiz page: Blocked question access
- Real-time countdown display (HH:MM:SS)
- Explanatory message: "🧠 Consolidation period - your brain is processing patterns"

#### 3.2 Visual Feedback
**Acceptance Criteria**:
- Blue-tinted card background
- Timer badge in top-right corner
- "Resting" button state
- Informational message about consolidation

---

### 4. Analytics & Progress Tracking

#### 4.1 Performance Metrics
**User Story**: As a user, I want to see my progress so I can understand my improvement.

**Acceptance Criteria**:
- **Acceleration Factor**: Speed improvement from first to last round
- **Learning Velocity**: Improvement in Round 1 speed across sessions
- **Session Evolution**: Visual comparison of recent sessions
- **Convergence Chart**: Mean vs Median times by round
- **Knowledge Gaps**: Topics with slowest response times
- **Question Difficulty**: Hardest questions by accuracy

#### 4.2 Visualization
- Slope charts for session progression
- Bar charts for convergence data
- Sorted lists for difficulty analysis
- Color-coded performance indicators

---

### 5. Navigation & UX

#### 5.1 Global Navigation
**User Story**: As a user, I want consistent navigation so I can easily move between pages.

**Acceptance Criteria**:
- Sticky navbar on all pages
- Logo link to home
- Search bar (desktop)
- Home link (🏠 icon on mobile, "🏠 Home" on desktop)
- Create button
- Logout button

#### 5.2 Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly buttons
- Optimized for both portrait and landscape

---

## Technical Specifications

### Architecture
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Runtime**: Bun
- **Styling**: Tailwind CSS
- **Language**: TypeScript

### Data Models

#### MCQSet
```prisma
model MCQSet {
  id           String
  title        String
  targetRounds Int (default: 7)
  isFavorite   Boolean (default: false)
  questions    Question[]
  sessions     StudySession[]
}
```

#### Question
```prisma
model Question {
  id          String
  question    String
  options     String[]
  answer      String
  explanation String?
  patternTag  String?
}
```

#### StudySession
```prisma
model StudySession {
  id           String
  currentRound Int (default: 1)
  targetRounds Int (default: 7)
  activeState  Json? // Persistence for in-progress rounds
  rounds       Round[]
}
```

#### Round
```prisma
model Round {
  roundNumber    Int
  score          Int
  totalQuestions Int
  startTime      DateTime
  endTime        DateTime?
  targetTime     Int? // in seconds
}
```

#### Attempt
```prisma
model Attempt {
  questionId  String
  roundNumber Int
  isCorrect   Boolean
  timeTaken   Float? // in seconds
}
```

### Configuration Constants

Located in `src/lib/config.ts`:

```typescript
export const WOODPECKER_CONFIG = {
  DEFAULT_TARGET_ROUNDS: 7,
  REST_PERIOD_MS: 24 * 60 * 60 * 1000, // 24 hours
  AUTO_ADVANCE_DELAY_MS: 300,
  TARGET_TIME_HALVING_FACTOR: 2,
  MIN_TARGET_TIME_SECONDS: 1,
  MASTERY_TARGET_TIME_SECONDS: 5,
  QUESTION_TIME_FAST_THRESHOLD: 2,
  QUESTION_TIME_MEDIUM_THRESHOLD: 5,
  KNOWLEDGE_GAP_TIME_THRESHOLD: 10,
}
```

---

## User Flows

### Flow 1: First-Time User
1. Login
2. Create or upload question set
3. Start training session
4. Complete Round 1 (no time limit)
5. View results and next target time
6. Enter 24-hour rest period
7. Return after rest to continue

### Flow 2: Returning User (Active Session)
1. Login
2. See sets with rest period status
3. Click on available set
4. Resume or start new round
5. Complete round with time pressure
6. Either advance or retry

### Flow 3: Failed Round
1. Complete round with errors
2. See failure message
3. Click "Retry Round X"
4. Immediately restart (no rest period)
5. Repeat until passed

---

## Success Metrics

### User Engagement
- Session completion rate
- Average rounds per set
- Return rate after rest periods

### Learning Effectiveness
- Accuracy improvement over rounds
- Time reduction across sessions
- Pattern mastery (< 5s final round time)

### System Performance
- Page load times < 2s
- Real-time timer accuracy
- Data persistence reliability

---

## Future Enhancements

### Phase 2
- [ ] Spaced repetition scheduling across sets
- [ ] Collaborative sets (sharing)
- [ ] Mobile native apps
- [ ] Offline mode
- [ ] Custom rest period durations

### Phase 3
- [ ] AI-generated questions
- [ ] Adaptive difficulty
- [ ] Gamification (achievements, streaks)
- [ ] Social features (leaderboards)
- [ ] Export progress reports

---

## Constraints & Assumptions

### Constraints
- Requires internet connection
- 24-hour rest period is fixed
- Perfect accuracy required to advance
- Minimum 1 second target time

### Assumptions
- Users have consistent access to device
- Users understand spaced repetition benefits
- Questions are well-formed and accurate
- Users can commit to multi-day training cycles

---

## Appendix

### Glossary
- **Round**: One complete pass through all questions in a set
- **Session**: A series of rounds for a single set
- **Target Time**: Maximum time allowed to complete a round
- **Halving**: Dividing previous round time by 2
- **Consolidation Period**: 24-hour rest for memory formation
- **Pattern Tag**: Category/topic label for questions

### References
- Spaced Repetition Research
- Chess Training Methodologies
- Cognitive Load Theory
- Memory Consolidation Studies
