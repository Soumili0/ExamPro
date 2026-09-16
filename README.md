# 🎓 ExamPro — AI-Powered Online Exam & Interview Platform

> **Made by Soumili Samanta**

A full-stack online examination and AI mock interview platform built with Spring Boot and React. Students can take timed MCQ exams and practice AI-generated mock interviews for any job role or topic — with instant scoring and detailed feedback powered by Groq AI.

---

## ✨ Features

### 🎓 For Students
- **User Authentication** with login and registration
- **JWT-based security** for protected API access
- **Profile Management** for updating user details
- **MCQ Exams** with four answer choices, timer, and auto-submit
- **Instant Scoring** and result display with grade breakdown
- **Aptitude Tests** — Quantitative, Logical Reasoning, Verbal, Data Interpretation
- **Technical Exams** — DSA, Java, Python, DBMS, OS, System Design and more
- **Progress Tracking** — View scores, history, and category-wise performance

### 🤖 AI Mock Interview Coach (3 Modes)
| Mode | Description |
|------|-------------|
| **Job Interview** | Job role based — HR, Technical, and Situational questions |
| **Technical Topics** | 14 CS topics — DSA, Java, DBMS, OS, ML, Cloud and more |
| **Aptitude Practice** | 8 categories — Quantitative, Logical, Verbal, Probability... |

- MCQ questions come with 4 radio-button options
- Open-ended questions have a text area for written answers
- AI evaluates each answer: score out of 10 + detailed feedback + ideal answer

### 👩‍🏫 For Teachers
- Create, edit, and publish exams
- Add MCQ questions and assign them to exams
- View and export student results as CSV
- Monitor AI interview sessions

### ⚙️ For Admins
- Full student management (create, activate, reset password)
- Complete exam and question management
- Platform-wide dashboard stats
- AI interview session overview

---

## 🛠️ Technology Stack

### Backend
| Tech | Details |
|------|---------|
| Spring Boot 3.3 | Java 17, REST API |
| MySQL | JPA / Hibernate, auto schema update |
| Spring Security | Stateless JWT authentication |
| Groq AI (llama3-70b) | Free AI — question generation + evaluation |
| Gemini AI | Secondary fallback provider |
| Lombok | Boilerplate reduction |
| Maven | Build tool |

### Frontend
| Tech | Details |
|------|---------|
| React 18 | Component-based UI |
| Vite | Fast build tool |
| React Router v6 | Client-side routing |
| Axios | HTTP client with JWT interceptor |

---

## 📋 Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- MySQL server running locally
- Maven 3.6 or higher
- A free Groq API key from [console.groq.com](https://console.groq.com)

---

## ⚙️ Setup Instructions

### 1. Database Setup

```sql
CREATE DATABASE IF NOT EXISTS online_exam;
USE online_exam;
```

---

### 2. Backend Setup

```bash
cd online-exam-system-backend/online-exam-system
```

Configure `src/main/resources/application.properties`:

```properties
spring.application.name=online-exam-system

spring.datasource.url=jdbc:mysql://localhost:3306/online_exam
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# AI Keys — Groq is free and primary
groq.api.key=gsk_YOUR_GROQ_KEY        # Free at https://console.groq.com
gemini.api.key=YOUR_GEMINI_KEY         # https://aistudio.google.com/apikey
openai.api.key=                        # Optional fallback
```

Run the backend:

```bash
.\mvnw.cmd spring-boot:run
```

Backend runs at: **http://localhost:8080**

---

### 3. Frontend Setup

```bash
cd online-exam-system-frontend/online-exam-frontend
npm install
npm run dev
```

Set the API base URL in `src/utils/constants.js` if needed:

```javascript
export const API_BASE_URL = 'http://localhost:8080/api';
```

Frontend runs at: **http://localhost:5173**

---

## 📁 Project Structure

```
online-exam-system/
├── README.md
│
├── online-exam-system-backend/
│   └── online-exam-system/
│       ├── pom.xml
│       └── src/main/
│           ├── java/com/exam/online_exam_system/
│           │   ├── OnlineExamSystemApplication.java
│           │   │
│           │   ├── config/
│           │   │   ├── CorsConfig.java
│           │   │   └── SecurityConfig.java
│           │   │
│           │   ├── controller/
│           │   │   ├── AdminController.java
│           │   │   ├── AuthController.java
│           │   │   ├── ExamController.java
│           │   │   ├── MockInterviewController.java
│           │   │   ├── QuestionController.java
│           │   │   └── UserController.java
│           │   │
│           │   ├── dto/
│           │   │   ├── AdminResultDto.java
│           │   │   ├── DashboardStatsDto.java
│           │   │   ├── ExamRequest.java
│           │   │   ├── ExamSubmitRequest.java
│           │   │   ├── InterviewEvaluateRequest.java
│           │   │   ├── InterviewEvaluateResponse.java
│           │   │   ├── InterviewGenerateRequest.java
│           │   │   ├── InterviewGenerateResponse.java
│           │   │   ├── InterviewQuestionDto.java
│           │   │   ├── InterviewSessionDto.java
│           │   │   ├── LoginRequest.java
│           │   │   ├── LoginResponse.java
│           │   │   ├── QuestionDTO.java
│           │   │   ├── QuestionRequest.java
│           │   │   ├── RegisterRequest.java
│           │   │   ├── ResetPasswordRequest.java
│           │   │   ├── StudentRequest.java
│           │   │   └── UpdateProfileRequest.java
│           │   │
│           │   ├── entity/
│           │   │   ├── Answer.java
│           │   │   ├── Exam.java
│           │   │   ├── InterviewAnswer.java
│           │   │   ├── InterviewSession.java
│           │   │   ├── Question.java
│           │   │   ├── Result.java
│           │   │   └── User.java
│           │   │
│           │   ├── repository/
│           │   │   ├── AnswerRepository.java
│           │   │   ├── ExamRepository.java
│           │   │   ├── InterviewAnswerRepository.java
│           │   │   ├── InterviewSessionRepository.java
│           │   │   ├── QuestionRepository.java
│           │   │   ├── ResultRepository.java
│           │   │   └── UserRepository.java
│           │   │
│           │   ├── security/
│           │   │   ├── CustomUserDetailsService.java
│           │   │   ├── JwtRequestFilter.java
│           │   │   └── JwtUtil.java
│           │   │
│           │   └── service/
│           │       ├── AuthService.java
│           │       ├── CustomUserDetailsService.java
│           │       ├── ExamService.java
│           │       ├── QuestionService.java
│           │       ├── UserService.java
│           │       └── interview/
│           │           ├── GeminiAIService.java
│           │           ├── GroqAIService.java
│           │           ├── MockInterviewService.java
│           │           └── OpenAIService.java
│           │
│           └── resources/
│               └── application.properties
│
└── online-exam-system-frontend/
    └── online-exam-frontend/
        ├── package.json
        ├── vite.config.js
        └── src/
            ├── App.jsx
            ├── main.jsx
            ├── index.css
            │
            ├── components/
            │   └── ProtectedRoute.jsx
            │
            ├── context/
            │   └── AuthContext.jsx
            │
            ├── pages/
            │   ├── admin/
            │   │   ├── AddCategory.jsx
            │   │   ├── AddQuiz.jsx
            │   │   ├── AdminDashboard.jsx
            │   │   ├── Results.jsx
            │   │   ├── TeacherDashboard.jsx
            │   │   ├── ViewQuizzes.jsx
            │   │   └── ViewUsers.jsx
            │   ├── auth/
            │   │   ├── Login.jsx
            │   │   └── Register.jsx
            │   ├── common/
            │   │   ├── About.jsx
            │   │   ├── Home.jsx
            │   │   └── NotFound.jsx
            │   └── user/
            │       ├── InterviewResult.jsx
            │       ├── MockInterview.jsx
            │       ├── Profile.jsx
            │       ├── QuizInstructions.jsx
            │       ├── StartQuiz.jsx
            │       ├── UserDashboard.jsx
            │       └── UserResult.jsx
            │
            ├── routes/
            │   └── AppRoutes.jsx
            │
            ├── services/
            │   ├── adminService.js
            │   ├── authService.js
            │   ├── interviewService.js
            │   ├── quizService.js
            │   └── userService.js
            │
            └── utils/
                ├── api.js
                └── constants.js
```

---

## 🔑 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (role: student / teacher / admin) |
| POST | `/api/auth/login` | Login — returns JWT token |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile?userId={id}` | Fetch profile details |
| PUT | `/api/user/profile` | Update profile information |
| GET | `/api/user/exams` | Fetch published exams |
| GET | `/api/user/results/{userId}` | Fetch user exam results |

### Questions and Exams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/questions` | Get all questions |
| GET | `/api/questions/exam/{examId}` | Get questions by exam |
| POST | `/api/questions` | Add a new question (admin/teacher) |
| POST | `/api/exam/submit` | Submit an exam answer |
| GET | `/api/exam/score/{userId}` | Get user score |

### AI Interview
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interview/generate` | Generate AI questions |
| POST | `/api/interview/evaluate` | Evaluate answers + get feedback |
| GET | `/api/interview/history/{userId}` | Past interview sessions |
| GET | `/api/interview/admin/all` | All sessions (admin/teacher) |
| GET | `/api/interview/test-ai` | Test AI connectivity |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/admin/students` | List / create students |
| PUT/DELETE | `/api/admin/students/{id}` | Edit / delete student |
| GET/POST | `/api/admin/exams` | Exam management |
| GET/POST | `/api/admin/questions` | Question management |
| GET | `/api/admin/results` | All student results |

---

## 👤 User Roles

| Role | Dashboard | Permissions |
|------|-----------|-------------|
| `student` | `/user/dashboard` | Take exams, AI interviews, view own history |
| `teacher` | `/teacher/dashboard` | Manage exams/questions, view all results |
| `admin` | `/admin/dashboard` | Everything including student management |

---

## 🔄 Application Flow

```
Register → Login → Dashboard
                      |
        +-------------+-------------+
        ↓             ↓             ↓
   Aptitude       Technical    AI Interview
   (MCQ exam)     (MCQ exam)     Coach
        ↓             ↓             ↓
     Submit        Submit      Answer questions
        ↓             ↓             ↓
    Results       Results     Score + AI Feedback
```

---

## 🗄️ Key Components

### Backend
- `AuthController` — Handles registration and login
- `UserController` — Manages user profile and student data
- `ExamController` — Handles exam submission and scoring
- `QuestionController` — Manages quiz questions
- `MockInterviewController` — AI interview endpoints
- `GeminiAIService` — Multi-provider AI with fallback chain (Groq → Gemini → OpenAI)
- `GroqAIService` — Free Groq AI (primary provider)
- `JwtUtil` — Handles JWT generation and validation

### Frontend
- `Login` / `Register` — User authentication with role selection
- `UserDashboard` — Student dashboard with Aptitude, Technical, AI Interview tabs
- `QuizInstructions` — Exam instructions with consent checkbox
- `StartQuiz` — Quiz interface with question navigator and countdown timer
- `UserResult` — Result card with grade (A/B/C/F) and performance breakdown
- `MockInterview` — 3-mode AI interview: mode select → topic search → MCQ/text questions
- `InterviewResult` — Per-question AI feedback, score ring, ideal answers
- `AdminDashboard` — Full admin panel with AI interview session tab
- `TeacherDashboard` — Teacher-specific panel (no student deletion)
- `ProtectedRoute` — Role-based route guard

---

## �️ Database Tables

### User
```sql
CREATE TABLE user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role VARCHAR(50),
  roll VARCHAR(100),
  department VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Exam
```sql
CREATE TABLE exam (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  subject VARCHAR(255),
  duration_minutes INT,
  total_marks INT,
  published BOOLEAN,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Question
```sql
CREATE TABLE question (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_title VARCHAR(500),
  option1 VARCHAR(255),
  option2 VARCHAR(255),
  option3 VARCHAR(255),
  option4 VARCHAR(255),
  correct_answer VARCHAR(255),
  exam_id BIGINT,
  FOREIGN KEY (exam_id) REFERENCES exam(id)
);
```

### Answer
```sql
CREATE TABLE answer (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  exam_id BIGINT,
  question_id BIGINT,
  selected_answer VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (question_id) REFERENCES question(id)
);
```

### Interview Session
```sql
CREATE TABLE interview_session (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  job_role VARCHAR(255),
  total_questions INT,
  overall_score DOUBLE,
  completed BOOLEAN,
  questions_json TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Interview Answer
```sql
CREATE TABLE interview_answer (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  session_id BIGINT,
  user_id BIGINT,
  question TEXT,
  user_answer TEXT,
  ai_feedback TEXT,
  ideal_answer TEXT,
  score INT,
  category VARCHAR(100)
);
```

> All tables are auto-created by Hibernate — no manual SQL needed.

---

## 🤖 AI Provider Chain

The app uses a 3-provider fallback chain:

```
Groq (llama3-70b) → Gemini → OpenAI
```

**Groq is free** — no credit card needed. Get your key at [console.groq.com](https://console.groq.com).

---

## 🔒 Security

- All endpoints except `/api/auth/**` require a valid JWT token
- Tokens are stored in `localStorage` and sent via `Authorization: Bearer` header
- Passwords are hashed with BCrypt
- CORS configured for `localhost:5173` and `localhost:5174`
- Stateless session management (no server-side sessions)

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| 403 on all requests after login | Clear `localStorage` in browser console, then re-login |
| AI questions not generating | Check Groq key in `application.properties` starts with `gsk_` |
| Backend won't start | Check MySQL is running and database `online_exam` exists |
| Frontend API errors | Confirm backend is running on port 8080 |
| Same fallback question repeated | Restart backend — prompt response was truncated |
| Backend connection issues | Verify MySQL credentials in `application.properties` |
| Login or registration issues | Register before logging in; check email/password carefully |

---

## 📈 Future Improvements

- Email notifications on exam results
- Question difficulty levels
- Detailed analytics and reporting charts
- Responsive mobile design
- Export results as PDF
- Question bank with tagging
- Proctoring / anti-cheat features

---

## 🔐 Security Notes

This is a learning project. For production:

- Store secrets in environment variables, not in `application.properties`
- Enable HTTPS
- Add rate limiting on auth endpoints
- Validate all user input
- Keep dependencies updated regularly

---

## 📄 License

This project is provided for educational use only.

---

*Made with ❤️ by **Soumili Samanta***
