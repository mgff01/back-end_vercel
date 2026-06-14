# Student Internship Management System (PBE)

**Course Code**: IBM8936  
**Group 1**: Gianluca, Marcos, Maurício, Micael, Bruno, and Christian  

---

## Deployed Applications

- **Frontend (Next.js)**: https://front-endvercel.vercel.app/ 
- **Backend API (Django)**: https://back-end-vercel-ten.vercel.app/admin/

---

## About the Project

This project is a comprehensive **Student Internship Management System** designed to streamline and automate the process of submitting, reviewing, and generating internship documents (TCE - Termo de Compromisso de Estágio, Relatórios, and Apólices). 

### Key Features
- **Student Dashboard**: Request internships, fill out forms, generate documents, and track approval status.
- **Coordinator Dashboard**: Review student requests, request rectifications, and approve/reject submissions.
- **Dynamic Document Generation**: Templates (`.docx`) are rendered dynamically with student data and converted to `.pdf` in the cloud using **ConvertAPI** (or locally on Windows).
- **Persistent Cloud Database**: Powered by **Supabase PostgreSQL** utilizing connection pooling for Vercel serverless functions.
- **JWT Authentication**: Secure login via email and password with role-based dashboard redirection.

---

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS / Vanilla CSS
- **Backend**: Django 5.2, Django REST Framework, SimpleJWT
- **Database**: PostgreSQL (Supabase)
- **PDF Conversion**: ConvertAPI (Production / Linux) & docx2pdf (Local Development / Windows)

---

## Environment Setup

### 1) Clone the Repository

Clone this repository to your local machine using git:
```bash
git clone https://github.com/mgff01/back-end_vercel.git
cd back-end_vercel
```

### 2) Create the Virtual Environment

Create and activate a Python virtual environment:

**On Windows:**
```bash
python -m venv .venv
.\.venv\Scripts\activate
```

**On Mac/Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

### 3) Running the Project

#### a) Frontend (Next.js)
Navigate to the `frontend` directory, install Node dependencies, and run the development server:
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at [http://localhost:3000/](http://localhost:3000/).

#### b) Backend (Django)
Activate the virtual environment, run migrations, and start the development server:
```bash
cd src/Estagio
python manage.py migrate
python manage.py runserver
```
The backend will be available at [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

> [!NOTE]
> You can seed the database with initial coordinator and student accounts by running:
> ```bash
> python populate_db.py
> ```

#### c) Documentation (MkDocs)
To run the documentation server:
```bash
mkdocs serve
```
If both Django and MkDocs attempt to use port 8000, you can assign different ports:
```bash
# Terminal 1 (Django)
python manage.py runserver 8000

# Terminal 2 (MkDocs)
mkdocs serve -a localhost:8001
```

---

## Diagrams
Diagrams are stored under `mkdocs/docs/` and generated using **PlantUML**. To create/view diagrams, ensure you have Java (JRE/JDK) and Graphviz installed on your machine.
