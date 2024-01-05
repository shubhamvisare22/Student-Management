# Student Marsheet

Student Marsheet is a web application designed to manage student information, including CRUD operations for students and subjects, detailed student lists, and a secure REST API endpoint.

## Features

### 1. CRUD Operations for Students
- Allows creating, reading, updating, and deleting student information.
- Student details include name, photo, class, subjects, marks, and a unique roll number.

### 2. Detailed Student List
- Presented in a table format with pagination (10 students per page).
- Live search functionality for quick and efficient data retrieval.
- Features update, delete, and view score buttons.
- 'View Score' button opens a modal displaying scores for corresponding subjects.

### 3. Utilization of JS, AJAX, and jQuery
- Entire application built using these technologies for dynamic and responsive functionality.

### 4. Subjects Table
- Similar CRUD features available for managing subjects.
- Maintains consistency and usability akin to student management.

## REST API Endpoint
- A secured REST API endpoint providing:
  - A list of students
  - Query support for custom data retrieval
  
### Endpoint Usage

Endpoint: http://127.0.0.1:8000/api/v1/getstudents/

1. Register and Obtain Tokens
   - **Step 1**: Register and get both a refresh token and an access token.
   
2. Using Refresh Token to Access Endpoint
   - **Step 2**: Use the refresh token to access the endpoint `getstudents/`.
   
3. Token Expiry Handling
   - **Step 3**: If either token expires, use the username and password to log in and obtain new tokens.

## Technologies Used
- Python
- Django
- Django Rest Framework
- JavaScript (JS)
- AJAX
- jQuery