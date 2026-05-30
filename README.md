# Leave Management System

A full-stack Leave Management System built with **Flask (Python)** and **React (Vite)**, designed to support role-based workflows for managing staff leave applications, approvals, and balance tracking.

---

## Live Demo

- **Frontend (React):**  
  https://leave-management-system-y0gy.onrender.com

- **Backend (Flask API):**  
  https://leave-management-backend-sm16.onrender.com

- **Sample Login Credentials**

### Admin
- Username: eve
- Password: Password123!

### Head of Unit
- Username: carol
- Password: Password123!

### Supervisor
- Username: bob
- Password: Password123!

### Staff
- Username: alice
- Password: Password123!

---

## Features

### Authentication & Authorization
- Secure login using JWT (access + refresh tokens)
- Role-based access control
- Automatic token refresh for expired access tokens
- Session persistence using localStorage

---

### Role-Based Workflows

The system supports multiple roles StaffThe system supports multiple roles:
- Apply for leave
- View leave requests
- View leave balances

### Staff
- Applies for leave

#### Supervisor
- Review and approve/reject leave requests

#### Head of Unit
- Final approval of leave requests
- Dashboard includes staff capabilities

#### Admin
- Manage users, roles, and units
- Configure leave types
- Monitor and update leave balances

---

## System Architecture

## Technologies Used

### Frontend
- React (Vite)
- React Router
- Axios
- Tailwind CSS
- React Toastify
- React Icons

### Backend
- Flask
- Flask-SQLAlchemy
- Flask-Migrate
- Flask-JWT-Extended
- Flask-CORS
- PostgreSQL (psycopg2)

---

## Local Setup Instructions


### Backend Setup (Flask)

### 1. Clone repository

```
git clone https://github.com/pesh26/leave-management-system.git
cd leave-management-system

```

### 2. Create virtual environment

```
python -m venv venv
source venv/bin/activate      # Linux / Mac
venv\Scripts\activate         # Windows
```
### 3. Install dependencies
```
pip install -r requirements.txt
```

### 4. Configure environment variables
Create .env file:
```
DATABASE_URL=your_postgres_url
JWT_SECRET_KEY=your_secret_key
SECRET_KEY=your_secret_key
```

### 5. Run database migrations
Run database migrations
```
flask db upgrade
```
### 6. Seed database
```
python seed.py
```

### 7. Run backend server
```
flask run
```

## Frontend Setup (React)

### 1. Navigate to client folder
```
cd client
```
### 2. Install dependencies

```
npm install
```
### 3. Create environment file
client/.env
```
VITE_API_URL=http://localhost:5000
```
### 4. Run development server
```
npm run dev
```

---

## Authentication Flow

1. User logs in via /login <br>
2. Flask backend validates credentials <br>
3. Backend returns:<br>

    * access_token <br>
    * refresh_token<br>
    * user<br>

4. Frontend stores tokens in localStorage<br>
5. Axios attaches access token to requests<br>
6. Expired tokens are automatically refreshed<br>

---

## Navigation & Role Routing
After login, users are redirected based on role priority:

`Admin > Head of Unit > Supervisor > Staff`

**Examples:<br>**
Staff + Head of Unit -> Head dashboard<br>
Admin -> Admin dashboard<br>

## Database Management
* Uses Flask-Migrate (Alembic)
* Tracks schema versions
* Production database setup requires:

```
flask db upgrade
```

---
## Deployment

**Backend (Render Web Service)**

* Built with Flask + Gunicorn
* Connected to PostgreSQL
* Uses environment variables:

```
DATABASE_URL
JWT_SECRET_KEY
SECRET_KEY
```

**Frontend (Render Static Site)**

Built with Vite → outputs to dist/
Uses:
```
VITE_API_URL= https://leave-management-backend-sm16.onrender.com
```

## Screenshots 

* Login page
![alt text](image-3.png)
* Admin dashboard
![alt text](image-2.png)
* Leave requests
![alt text](image.png)
* Supervisor Leave Edorsements
![alt text](image-1.png)

## Future Improvements

* Sidebar navigation instead of navbar
* Real-time notifications
* Email alerts
* Audit logging
* Pagination & advanced filtering
* Improved mobile responsiveness

## Author
Penina Wanyama
IT Operations|Data Solutions
