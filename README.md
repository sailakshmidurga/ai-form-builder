# 🧠 AI Conversational Form Builder

## 📌 Overview

This project is a full-stack AI-powered form builder that converts natural language prompts into structured JSON forms. Users interact through a chat interface, and the system dynamically generates and updates forms in real-time.

The application is fully containerized using Docker and follows a clean separation between frontend and backend.

---

## 🚀 Features

### 🔹 1. Conversational Form Generation

* Users can type prompts like:

  * "Create a form with name and email"
  * "Add password"
* The system updates the form dynamically.

---

### 🔹 2. Multi-turn Conversation Support

* Maintains `conversationId`
* Supports iterative updates to the same form
* Versioning is implemented for tracking changes

---

### 🔹 3. Ambiguity Handling

* Detects unclear prompts such as:

  * "Make a form for booking a meeting room"
* Responds with clarification questions instead of generating incorrect schema

---

### 🔹 4. Explicit Field Mapping (Important Requirement)

The system uses a predefined field configuration to ensure deterministic behavior.

```js
const FIELD_MAP = {
  name: { type: "string", title: "Name" },
  email: { type: "string", title: "Email" },
  password: { type: "string", title: "Password" },
  id: { type: "string", title: "ID" },
  school: { type: "string", title: "School Name" }
};
```

* Prompts are parsed using keyword matching
* Schema is generated explicitly using this mapping

---

### 🔹 5. JSON Schema Generation

* Outputs valid JSON schema
* Compatible with `@rjsf/core`
* Includes:

  * `type`
  * `properties`
  * `required`

---

### 🔹 6. Retry Logic with Validation

* Implements retry mechanism (up to 3 attempts)
* Handles simulated LLM failures using:

  * `mock_llm_failure` parameter
* Ensures robust schema generation

---

### 🔹 7. Dynamic Form Rendering

* Uses `@rjsf/core` to render forms
* Automatically updates UI when schema changes

---

### 🔹 8. Conditional Logic (x-show-when)

* Fields can appear based on user input
* Example:

  * Email frequency appears only if "Subscribe" is checked

---

### 🔹 9. Schema Diff Panel

* Displays changes between previous and current schema
* Helps track incremental updates

---

### 🔹 10. Export Feature

* Users can download generated schema as `schema.json`

---

## 🏗️ Tech Stack

### Frontend

* React.js
* Axios
* @rjsf/core
* @rjsf/validator-ajv8

### Backend

* Node.js
* Express.js

### DevOps

* Docker
* Docker Compose

---

## 📂 Project Structure

```
ai-form-builder/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   └── App.js
│   ├── package.json
│   └── Dockerfile
│
└── docker-compose.yml
```

---

## ⚙️ Setup Instructions

### 🔹 Using Docker (Recommended)

```bash
docker-compose up --build
```

* Frontend → http://localhost:3000
* Backend → http://localhost:8080

---

### 🔹 Manual Setup

#### Backend

```bash
cd backend
npm install
node server.js
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

---

## 🧪 Testing

### Health Check

```
GET /health
```

### Generate Form

```
POST /api/form/generate
```

### Retry Testing

```
/api/form/generate?mock_llm_failure=1
```

---

## 🧠 Design Decisions

* Used explicit field mapping for predictable schema generation
* Implemented retry logic to simulate LLM robustness
* Used in-memory storage for simplicity
* Modular UI design for scalability

---

## 📈 Future Improvements

* Integrate real LLM (OpenAI / Gemini)
* Add authentication
* Persist forms in database
* Improve NLP parsing

---

## 🏆 Conclusion

This project demonstrates:

* Full-stack development
* AI-driven UI generation
* Robust backend design
* Modern frontend UX

---

## 👨‍💻 Author

Sai Lakshmi Durga Koneti
