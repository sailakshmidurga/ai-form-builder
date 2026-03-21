import React, { useState } from "react";
import axios from "axios";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [schema, setSchema] = useState(null);
  const [prevSchema, setPrevSchema] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [formData, setFormData] = useState({});

  const API = "http://localhost:8080";

  function getSchemaDiff(oldSchema, newSchema) {
    if (!oldSchema) return "No changes yet";

    const changes = {};

    for (let key in newSchema.properties) {
      if (!oldSchema.properties[key]) changes[key] = "Added";
    }

    for (let key in oldSchema.properties) {
      if (!newSchema.properties[key]) changes[key] = "Removed";
    }

    return changes;
  }

  const sendMessage = async () => {
    if (!input.trim()) return;

    const text = input;
    setInput("");

    setMessages((p) => [...p, { type: "user", text }]);

    try {
      const res = await axios.post(`${API}/api/form/generate`, {
        prompt: text,
        conversationId
      });

      if (res.data.status === "clarification_needed") {
        setMessages((p) => [
          ...p,
          { type: "bot", text: res.data.questions.join("\n") }
        ]);
        setConversationId(res.data.conversationId);
        return;
      }

      setPrevSchema(schema);
      setSchema(res.data.schema);
      setConversationId(res.data.conversationId);

      setMessages((p) => [...p, { type: "bot", text: "Form updated ✅" }]);

    } catch {
      setMessages((p) => [...p, { type: "bot", text: "Error ❌" }]);
    }
  };

  const handleSubmit = () => {
    alert("Form submitted ✅");
  };

  const exportSchema = () => {
    const blob = new Blob([JSON.stringify(schema, null, 2)]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "schema.json";
    a.click();
  };

  const filteredSchema = schema && {
    ...schema,
    properties: Object.fromEntries(
      Object.entries(schema.properties).filter(([k, v]) => {
        if (!v["x-show-when"]) return true;
        return formData[v["x-show-when"].field] === v["x-show-when"].equals;
      })
    )
  };

  return (
    <div style={styles.container}>

      {/* CHAT */}
      <div style={styles.chatPane} data-testid="chat-pane">
        <h2>💬 AI Assistant</h2>

        <div style={styles.chatBox}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                ...styles.message,
                alignSelf: m.type === "user" ? "flex-end" : "flex-start",
                background: m.type === "user" ? "#007bff" : "#2c2c2c"
              }}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div style={styles.inputArea}>
          <input
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your request..."
          />
          <button style={styles.button} onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>

      {/* FORM */}
      <div style={styles.formPane} data-testid="form-renderer-pane">
        <h2>📝 Generated Form</h2>

        {schema ? (
          <div style={styles.formCard}>
            <Form
              schema={filteredSchema}
              formData={formData}
              onChange={(e) => setFormData(e.formData)}
              validator={validator}
              onSubmit={handleSubmit}
            />

            <button style={styles.exportBtn} onClick={exportSchema}>
              Export Schema
            </button>

            <div style={styles.diffPanel} data-testid="schema-diff-panel">
              <h3>Schema Changes</h3>
              <pre>
                {JSON.stringify(getSchemaDiff(prevSchema, schema), null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p>No form generated yet</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial",
    background: "#121212",
    color: "white"
  },
  chatPane: {
    width: "35%",
    padding: "20px",
    borderRight: "1px solid #333",
    display: "flex",
    flexDirection: "column"
  },
  formPane: {
    width: "65%",
    padding: "20px"
  },
  chatBox: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column"
  },
  message: {
    padding: "10px 14px",
    borderRadius: "12px",
    margin: "6px 0",
    maxWidth: "75%",
    fontSize: "14px"
  },
  inputArea: {
    display: "flex",
    marginTop: "10px"
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "none"
  },
  button: {
    padding: "10px 15px",
    marginLeft: "8px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  formCard: {
    background: "#1e1e1e",
    padding: "20px",
    borderRadius: "10px"
  },
  exportBtn: {
    marginTop: "10px",
    padding: "8px 12px",
    background: "green",
    border: "none",
    color: "white",
    borderRadius: "6px"
  },
  diffPanel: {
    marginTop: "15px",
    background: "#2c2c2c",
    padding: "10px",
    borderRadius: "8px"
  }
};

export default App;