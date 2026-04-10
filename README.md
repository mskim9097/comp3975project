# COMP 3975 Project

---

## Backend Setup (Laravel)

Open a new terminal and run:

cd backend  
composer install  
npm install  
cp .env.example .env  
php artisan key:generate  
touch database/database.sqlite  
php artisan migrate --seed  
npm run build  
php artisan serve  

---

## Frontend Setup (React)

Open a new terminal and run:

cd frontend  
npm install  
npm run dev  

---

## Application URLs

- Laravel Backend / Admin: http://127.0.0.1:8000  
- React Frontend: http://localhost:5173  

Make sure the backend server is running BEFORE starting the frontend.

---

## Seed Account Info

For admin:
Email: admin@bcit.ca  
Password: password  

For Students:
Email: a@bcit.ca  
Password: password  
Email: b@bcit.ca  
Password: password  

---

## REST API Test

Base URL:
http://127.0.0.1:8000/api

Use the following headers in Postman when needed:
Content-Type: application/json
Accept: application/json

---

### 1. Users

READ
GET http://127.0.0.1:8000/api/users
GET http://127.0.0.1:8000/api/users/1

CREATE
POST http://127.0.0.1:8000/api/users

Body (JSON):
{
  "student_id": "A33333333",
  "first_name": "Test",
  "last_name": "User",
  "email": "test@bcit.ca",
  "password": "1234",
  "is_admin": false
}

UPDATE
PUT http://127.0.0.1:8000/api/users/2

Body (JSON):
{
  "student_id": "A11111111",
  "first_name": "Updated",
  "last_name": "User",
  "email": "updated@bcit.ca",
  "password": "9999",
  "is_admin": false
}

DELETE
DELETE http://127.0.0.1:8000/api/users/2

NOT FOUND TEST
GET http://127.0.0.1:8000/api/users/999
Expected result: 404 User not found

VALIDATION TEST
POST http://127.0.0.1:8000/api/users

Body (JSON):
{
  "student_id": "",
  "first_name": "",
  "last_name": "",
  "email": "",
  "password": "",
  "is_admin": false
}

Expected result: 422 validation error

---

### 2. Items

READ
GET http://127.0.0.1:8000/api/items
GET http://127.0.0.1:8000/api/items/1

CREATE
POST http://127.0.0.1:8000/api/items

Body (JSON):
{
  "name": "Black Wallet",
  "description": "Found near the library entrance.",
  "category": "Wallet",
  "color": "Black",
  "brand": "Gucci",
  "location": "Library",
  "finder_id": 3,
  "owner_id": null,
  "status": "active"
}

UPDATE
PUT http://127.0.0.1:8000/api/items/1

Body (JSON):
{
  "name": "Black Wallet",
  "description": "Returned to the owner.",
  "category": "Wallet",
  "color": "Black",
  "brand": "Gucci",
  "location": "Library",
  "finder_id": 4,
  "owner_id": 3,
  "status": "returned"
}

DELETE
DELETE http://127.0.0.1:8000/api/items/1

NOT FOUND TEST
GET http://127.0.0.1:8000/api/items/999
Expected result: 404 Item not found

VALIDATION TEST
POST http://127.0.0.1:8000/api/items

Body (JSON):
{
  "name": "",
  "description": "",
  "category": "",
  "color": "",
  "brand": "",
  "location": "",
  "finder_id": 999,
  "owner_id": null,
  "status": "wrong_status"
}

Expected result: 422 validation error

---

### 3. Return Logs

READ
GET http://127.0.0.1:8000/api/return-logs
GET http://127.0.0.1:8000/api/return-logs/1

NOT FOUND TEST
GET http://127.0.0.1:8000/api/return-logs/999
Expected result: 404 Log not found

Note:
- Return logs are created automatically when an item is updated to:
  - "status": "returned"
  - with a valid "owner_id"

---