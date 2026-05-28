# Online Examination System

একটি সম্পূর্ণ অনলাইন পরীক্ষা ব্যবস্থাপনা প্ল্যাটফর্ম যা Login, Profile Management, MCQs, Timer এবং Auto-Submit ফিচার সহ।

## Features

✅ **User Authentication** - Registration এবং Login with JWT tokens  
✅ **Profile Management** - Name, Email এবং Password আপডেট করুন  
✅ **Multiple Choice Questions** - MCQ based exams with 4 options  
✅ **Timer & Auto-Submit** - স্বয়ংক্রিয়ভাবে সময় শেষ হলে জমা দেয়  
✅ **Instant Scoring** - সঠিক এবং ভুল উত্তর গণনা  
✅ **Session Management** - Token based session tracking  

## Tech Stack

### Backend
- **Spring Boot 3.3.0** - REST API
- **MySQL 8.0** - Database
- **JWT** - Authentication
- **Lombok** - Code generation
- **Maven** - Build tool

### Frontend
- **React 18** - UI Framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP Client

## Prerequisites

- Java 17+
- Node.js 16+
- MySQL Server running
- Maven 3.6+

## Setup Instructions

### Backend Setup

1. **Database Configuration** (Backend)
```bash
cd online-exam-system-backend/online-exam-system
```

2. Edit `src/main/resources/application.properties`:
```properties
spring.application.name=online-exam-system
spring.datasource.url=jdbc:mysql://localhost:3306/online_exam
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

3. **Create MySQL Database**:
```sql
CREATE DATABASE IF NOT EXISTS online_exam;
USE online_exam;
```

4. **Build & Run**:
```bash
mvn clean install
mvn spring-boot:run
```

Backend will start at: `http://localhost:8080`

### Frontend Setup

1. **Install Dependencies**:
```bash
cd online-exam-system-frontend/online-exam-frontend
npm install
```

2. **Configure API Base URL** in `.env` or `src/utils/constants.js`:
```javascript
export const API_BASE_URL = 'http://localhost:8080/api';
```

3. **Start Development Server**:
```bash
npm run dev
```

Frontend will start at: `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User Management
- `PUT /api/user/profile` - Update profile (requires userId param)

### Questions & Exams
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Add new question (admin)
- `POST /api/exam/submit` - Submit answer
- `GET /api/exam/score/{userId}` - Get user score

## Usage Flow

1. **Register** → Create new account
2. **Login** → Sign in with credentials
3. **Dashboard** → View available exams
4. **Quiz Instructions** → Read exam rules
5. **Start Exam** → Answer MCQs (60 minute timer)
6. **Auto-Submit** → Timer reaches 0 or manual submit
7. **Results** → View score and performance
8. **Logout** → End session

## Default Credentials (if preloaded)

- Email: `student@example.com`
- Password: `password123`

## File Structure

```
online-exam-system/
├── online-exam-system-backend/
│   └── online-exam-system/
│       ├── src/main/java/com/exam/online_exam_system/
│       │   ├── controller/
│       │   ├── service/
│       │   ├── entity/
│       │   ├── repository/
│       │   ├── dto/
│       │   ├── security/
│       │   └── config/
│       └── src/main/resources/
│           └── application.properties
└── online-exam-system-frontend/
    └── online-exam-frontend/
        ├── src/
        │   ├── pages/
        │   ├── components/
        │   ├── services/
        │   ├── context/
        │   └── utils/
        └── package.json
```

## Key Components

### Backend Components
- **AuthController** - Handles login/register
- **UserController** - Profile management
- **ExamController** - Answer submission & scoring
- **QuestionController** - Question management
- **JwtUtil** - JWT token generation & validation

### Frontend Components
- **Login/Register** - Authentication
- **UserDashboard** - Exam listing
- **QuizInstructions** - Exam guidelines
- **StartQuiz** - MCQ interface with timer
- **UserResult** - Score display
- **Timer** - Countdown component

## Database Schema

### Users Table
```sql
CREATE TABLE user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Questions Table
```sql
CREATE TABLE question (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    question_title VARCHAR(500),
    option1 VARCHAR(255),
    option2 VARCHAR(255),
    option3 VARCHAR(255),
    option4 VARCHAR(255),
    correct_answer VARCHAR(255)
);
```

### Answers Table
```sql
CREATE TABLE answer (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    question_id BIGINT,
    selected_answer VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (question_id) REFERENCES question(id)
);
```

## Common Issues & Solutions

### Issue: Backend not connecting
- Check MySQL is running
- Verify database credentials in `application.properties`
- Ensure database exists

### Issue: Frontend API calls failing
- Check backend is running on port 8080
- Verify CORS configuration
- Check network in browser DevTools

### Issue: Login not working
- Ensure user is registered first
- Check password is correct
- Verify JWT configuration

## Security Notes

⚠️ **Warning**: This is a learning project. For production:
- Hash passwords with BCrypt
- Use environment variables for secrets
- Add rate limiting
- Implement CSRF protection
- Use HTTPS
- Add comprehensive input validation

## Future Enhancements

- Admin dashboard for question management
- Multiple exams/categories
- Question banks and difficulty levels
- User analytics and reports
- Email notifications
- Mobile responsive design
- Dark mode support

## License

This project is for educational purposes.

## Support

For issues or questions, contact the development team.
