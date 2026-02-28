**Identity Reconciliation API:**
This project is a backend service that identifies and reconciles customer identities based on email and phone number.
It intelligently links multiple contacts belonging to the same individual while maintaining a single primary contact.

---

**Hosted API Endpoint:**

## Base URL
https://bitespeed-identity-recocilation.onrender.com/

## Identify Endpoint
POST /identify

## Example
POST https://YOUR-RENDER-URL.onrender.com/identify

---

## Tech Stack
- Node.js
- Express.js
- MySQL 8.0.45
- Hosted MySQL on Aiven
- Deployed on Render

---

## API Usage

### Request Format

Send JSON body (NOT form-data):

**json:**
{
  "email": "test@example.com",
  "phoneNumber": "9999999999"
}


Both fields are optional, but at least one must be provided.

---

### Response Format

**json:**
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["test@example.com", "another@example.com"],
    "phoneNumbers": ["9999999999"],
    "secondaryContactIds": [2, 3]
  }
}

---

## How It Works
- If no matching contact exists → creates a new primary contact.
- If one matching primary exists → links new information as secondary.
- If multiple primary contacts are detected → merges them:
  - The oldest contact remains primary.
  - Others are converted to secondary.
  - All linked records are updated accordingly.



## Running Locally
1. Clone the repository:

```
git clone <your-repo-url>
cd <project-folder>
```

2. Install dependencies:

```
npm install
```

3. Create a `.env` file in root:

```
DB_HOST=your_host
DB_USER=your_user
DB_PASS=your_password
DB_NAME=your_database
DB_PORT=your_port
```

4. Start server:

```
npm start
```

Server runs at:

```
http://localhost:3000
```

---

## Database Schema

Table: `contacts`

|     Column     |             Type            |
|----------------|-----------------------------|
| id             | INT (Primary Key)           |
| email          | VARCHAR                     |
| phoneNumber    | VARCHAR                     |
| linkedId       | INT (Nullable)              |
| linkPrecedence | ENUM('primary','secondary') |
| createdAt      | DATETIME                    |
| updatedAt      | DATETIME                    |
| deletedAt      | DATETIME (Nullable)         |

---

## Edge Cases Handled
- Duplicate contact prevention
- Secondary contact resolution
- Multi-primary merge logic
- Oldest primary preservation
- Empty input validation
- Safe trimming of optional fields
- SQL empty IN() bug prevention
- SSL configuration for production

---

## Notes
- The API expects `Content-Type: application/json`.
- Render free tier may take ~20–30 seconds on the first request after inactivity.
- Database credentials are not included for security reasons.
- Environment variables must be configured separately.
---



## Author
Prabal Singh
