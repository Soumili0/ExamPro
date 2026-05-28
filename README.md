# Online Examination System

A complete online exam management platform with user authentication, profile management, multiple-choice quizzes, timer support, and auto-submit functionality.

## Features

- **User Authentication** with login and registration
- **JWT-based security** for protected API access
- **Profile Management** for updating user details
- **MCQ Exams** with four answer choices
- **Timer and Auto-Submit** to finish exams automatically
- **Instant Scoring** and result display
- **Admin and Student roles** for separate workflows

## Technology Stack

### Backend
- Spring Boot 3.3.0
- MySQL
- JWT Authentication
- Lombok
- Maven

### Frontend
- React 18
- Vite
- React Router
- Axios

## Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- MySQL server running
- Maven 3.6 or higher

## Setup Instructions

### Backend

1. Open the backend folder:
   ```bash
   cd online-exam-system-backend/online-exam-system
   ```

2. Configure the database in `src/main/resources/application.properties`:
   ```properties
   spring.application.name=online-exam-system
   spring.datasource.url=jdbc:mysql://localhost:3306/online_exam
   spring.datasource.username=root
   spring.datasource.password=YOUR_PASSWORD
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   ```

3. Create the database in MySQL:
   ```sql
   CREATE DATABASE IF NOT EXISTS online_exam;
   USE online_exam;
   ```

4. Build and run the backend:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

The backend will run at `http://localhost:8080`.

### Frontend

1. Open the frontend folder:
   ```bash
   cd online-exam-system-frontend/online-exam-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set the API base URL if needed in `src/utils/constants.js`:
   ```javascript
   export const API_BASE_URL = 'http://localhost:8080/api';
   ```

4. Start the frontend:
   ```bash
   npm run dev
   ```

The frontend will run at `http://localhost:5173`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login

### User
- `PUT /api/user/profile` - Update profile information
- `GET /api/user/profile?userId={userId}` - Fetch profile details
- `GET /api/user/exams` - Fetch published exams
- `GET /api/user/results/{userId}` - Fetch user exam results

### Questions and Exams
- `GET /api/questions` - Get all questions
- `GET /api/questions/exam/{examId}` - Get questions by exam
- `POST /api/questions` - Add a new question (admin)
- `POST /api/exam/submit` - Submit exam answer
- `GET /api/exam/score/{userId}` - Get user score

## Application Flow

1. Register a new account
2. Login
3. Access the dashboard
4. Read quiz instructions
5. Start the exam
6. Complete questions
7. Submit answers or let the timer auto-submit
8. View results
9. Logout

## Project Structure

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
│       └── src/main/resources/application.properties
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

### Backend
- `AuthController` - Handles registration and login
- `UserController` - Manages user profile and student data
- `ExamController` - Handles exam submission and scoring
- `QuestionController` - Manages quiz questions
- `JwtUtil` - Handles JWT generation and validation

### Frontend
- `Login` / `Register` - User authentication
- `UserDashboard` - Student dashboard and exam cards
- `QuizInstructions` - Exam instructions screen
- `StartQuiz` - Quiz interface with timer
- `UserResult` - Result display screen
- `Timer` - Countdown timer component

## Database Model

### User table
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

### Question table
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

### Answer table
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

## Troubleshooting

### Backend connection issues
- Verify MySQL is running
- Confirm database credentials in `application.properties`
- Confirm the database exists

### Frontend API errors
- Confirm backend is running on port 8080
- Verify CORS settings
- Check browser network tab

### Login or registration issues
- Register before logging in
- Ensure correct email and password
- Confirm JWT authentication is functioning

## Security Notes

This is a learning project. For production readiness, consider:

- Securing secrets with environment variables
- Using HTTPS
- Enabling CSRF protection
- Applying rate limiting
- Validating all user input
- Keeping dependencies updated

## Future Improvements

- Admin dashboard for managing exams and questions
- Multiple exam categories
- Question difficulty levels
- Analytics and reporting
- Email notifications
- Responsive mobile design
- Dark mode support

## License

This project is provided for educational use.

## Support

For questions or issues, contact the development team.
