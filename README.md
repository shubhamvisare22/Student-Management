# Student Marksheet Management System

## Overview
This Django-based web application allows users to manage student marksheets efficiently. It offers functionalities to submit marksheet data via web forms and provides a secure REST API for authenticated users.

### Features
- **MarkSheet Submission**: Users can submit student marksheets via web forms.
- **Data Storage**: Marksheet data is stored in the database with fields including Student Name, Roll No, Subjects, Subject Scores, Student Photo, and Class (1 to 12th).
- **Data Table Display**: Students are displayed in a data table that supports sorting by Name, Roll No, and Marks in any subject. Server-side pagination handles the display of remaining students.
- **REST API**: Provides secured endpoints for authenticated users to access student data, filter by class, select specific data fields, and retrieve a list of students ordered by highest scoring student first.
- **User Registration and Login**: JWT-based Authentication is used, allowing users to register, log in, and generate new tokens if the tokens expire.

## Endpoints
### Student Endpoints
- `/students`: GET, POST, PUT, PATCH, DELETE endpoints for student-related operations.
- `/student-list`: Endpoint to fetch students ordered by highest scoring student first, supporting filters by class and data selection.

### Subject and Subject Score Endpoints
- `/subjects`: GET, POST, PUT, PATCH, DELETE endpoints for subject-related operations.
- `/subject-scores`: GET, POST, PUT, PATCH, DELETE endpoints for subject score-related operations.

## Usage
- **Web Forms**: Submit student marksheet data via Ajax calls and store it in the database.
- **Data Table Display**: Students are displayed in a sortable data table in the UI.
- **REST API Access**: Authenticated users can call API endpoints to access and filter student data.

## User Authentication
- JWT-based Authentication ensures secure access to the application's functionalities.
- Users can register, log in, and generate new tokens in case of token expiration.

## Postman Collection
- A collection of API requests is provided in Postman format. Import and use it to explore and interact with the API endpoints effortlessly.


## Usage Flow:
1. Register a user: Create a new user account.
2. Generate Tokens: Obtain authentication tokens (JWT) by logging in.
3. Use Bearer Token: Include the generated token in the 'Authorization' header as a Bearer token.
4. Create Subject: Use the authenticated token to create subjects via API endpoints.
5. Create Student: Use the same authentication token to create students via API endpoints.
6. Create Subject Scores: Finally, create subject scores associated with students using the API endpoints.

---

