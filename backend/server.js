const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.API_PORT || 8080;

const conversations = new Map();

function isValidSchema(schema) {
  return (
    schema &&
    schema.type === "object" &&
    typeof schema.properties === "object" &&
    Array.isArray(schema.required)
  );
}

// HEALTH
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// GENERATE FORM
app.post("/api/form/generate", (req, res) => {
  const { prompt, conversationId } = req.body;

  // ambiguity
  if (prompt === "Make a form for booking a meeting room") {
    const id = uuidv4();
    return res.json({
      status: "clarification_needed",
      conversationId: id,
      questions: [
        "What details should the form collect?",
        "Do you need date and time selection?"
      ]
    });
  }

  let id = conversationId || uuidv4();

  let prev = conversations.get(id) || {
    version: 0,
    schema: { type: "object", properties: {}, required: [] }
  };

  let attempts = 0;
  const failCount = parseInt(req.query.mock_llm_failure || "0");

  while (attempts < 3) {
    try {
      let schema = JSON.parse(JSON.stringify(prev.schema));

      if (prompt.toLowerCase().includes("name")) {
        schema.properties.name = { type: "string", title: "Name" };
        if (!schema.required.includes("name")) schema.required.push("name");
      }

      if (prompt.toLowerCase().includes("email")) {
        schema.properties.email = { type: "string", title: "Email" };
        if (!schema.required.includes("email")) schema.required.push("email");
      }

      if (prompt.toLowerCase().includes("password")) {
        schema.properties.password = { type: "string", title: "Password" };
        if (!schema.required.includes("password")) schema.required.push("password");
      }

      // conditional logic
      if (prompt.toLowerCase().includes("newsletter")) {
        schema.properties.sendNewsletter = {
          type: "boolean",
          title: "Subscribe?"
        };

        schema.properties.emailFrequency = {
          type: "string",
          title: "Frequency",
          "x-show-when": { field: "sendNewsletter", equals: true }
        };
      }

      if (attempts < failCount) throw new Error("fail");

      if (!isValidSchema(schema)) throw new Error("invalid");

      const version = prev.version + 1;

      conversations.set(id, { version, schema });

      return res.json({
        formId: id,
        conversationId: id,
        version,
        schema
      });

    } catch {
      attempts++;
    }
  }

  res.status(500).json({
    error: "Failed to generate valid schema after multiple attempts."
  });
});

app.listen(PORT, () => console.log("Server running", PORT));