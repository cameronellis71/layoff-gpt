import { useState, useRef, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { templates } from './templates.js'
import SidebarButton from "./components/SidebarButton.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Navbar, Nav } from 'react-bootstrap';

const numTemplates = templates.length
let templateToUse = Math.floor(Math.random() * numTemplates)
// gameState is initially set to 'interview' because the first thing that LayoffGPT does
// is ask a question
let gameState = "interview"

function App() {
  const [count, setCount] = useState(0)
  // Track which sidebar button is active
  const [activeButton, setActiveButton] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState("chat");

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Tracks current question
  const [responseMap, setResponseMap] = useState(new Map());
  const [input, setInput] = useState(""); // User input
  const [messages, setMessages] = useState([
    { sender: "bot", text: templates[templateToUse].questions[0].question }, // Initial question
  ]);

  const chatEndRef = useRef(null); // Reference to the end of the chat

  // Scroll to the bottom of the chat when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleSend = (inputText) => {
    if (!inputText.trim()) return;

    // Clear input field
    setInput("");

    if (gameState === "navigate") {
      // Make not case-sensitive
      inputText = inputText.toLowerCase()
      if (inputText === "new email") {
        // Need to hide the suggestions after this
        // Go down and see if the same logic can be recycled and moved to a helper function
        console.log("`new email` was inputted!")
        handleNewEmailButtonClick()
      } else {
        console.log("input not recognized")
      }

      return
    }

    // Add user's response to chat
    setMessages((prev) => [...prev, { sender: "user", text: inputText }]);
    responseMap.set(templates[templateToUse].questions[currentQuestionIndex].answerKey, inputText);

    // Move to next question
    const nextQuestionIndex = currentQuestionIndex + 1;

    if (currentQuestionIndex < templates[templateToUse].questions.length - 1) {
      // Add the next question to chat
      addBotMessage(templates[templateToUse].questions[nextQuestionIndex].question);

    } else {
      // If no more questions, display the generated email
      // Map answerKey to inputText in responseMap
      const generatedEmail = templates[templateToUse].template(responseMap)
      addBotMessage(generatedEmail);

      // Set game state to navigate after the email has been generated
      gameState = "navigate"
    }
    setCurrentQuestionIndex(nextQuestionIndex);
  };

  const handleNewEmailButtonClick = () => {
    // Append a new email conversation to the message history
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: "New Email"},
      { sender: "bot", text: "Can you give me a number?" },
    ]);
    // Determine which email template to use next
    templateToUse = Math.floor(Math.random() * numTemplates)
    setCurrentQuestionIndex(0); // Reset to the first question
    setResponseMap(new Map());

    // Update game state so that it's back in 'interview' mode
    gameState = "interview"
  }

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion); // Submit the suggestion directly
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend(input);
      e.preventDefault(); // Prevents default behavior like form submission
    }
  };

  const handleAboutButtonClick = () => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: "About"},
    ]);
    addBotMessage("LayoffGPT is a generative AI chatbot that creates human-like & engaging layoff emails with the help of user-supplied suggestions.");
  }

  const addBotMessage = (fullText) => {
    let index = 0;

    setMessages((prev) => [...prev, { sender: "bot", text: "", isComplete: false }]); // Add bot message placeholder

    const interval = setInterval(() => {
      setMessages((prev) => {
        // Clone previous messages
        const newMessages = [...prev];

        // Get the last bot message
        const lastMessage = newMessages[newMessages.length - 1];

        // Ensure we're only updating the last bot message
        if (lastMessage.sender === "bot" && !lastMessage.isComplete) {
          lastMessage.text = fullText.slice(0, index + 1);
          lastMessage.isComplete = index + 1 === fullText.length;
        }

        return newMessages;
      });

      index++;
      if (index === fullText.length) clearInterval(interval);
    }, 1); // Adjust typing speed here
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <div
        style={{
          position: isSidebarOpen ? "fixed" : "relative",
          width: isSidebarOpen ? "250px" : "60px",
          background: "#f1f1f1",
          height: "100%",
          overflow: "hidden",
          zIndex: 1000,
          transition: "width 0.3s ease",
        }}
      >
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="open-sidebar-button"
          onMouseEnter={(e) => (e.target.style.background = "#c0c0c0")} // Darker gray on hover
          onMouseLeave={(e) => (e.target.style.background = "#f1f1f1")} // Reset to original color
        >
          ☰
        </button>
        {isSidebarOpen && (
          <div style={{ padding: "10px" }}>
            <SidebarButton
              label="Chat" 
              setCurrentView={setCurrentView} 
              activeButton={activeButton} 
              setActiveButton={setActiveButton} 
            />
            <SidebarButton
              label="About"
              setCurrentView={setCurrentView}
              activeButton={activeButton}
              setActiveButton={setActiveButton}
            />
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Horizontal Navigation Bar */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: isSidebarOpen ? "250px" : "60px",
            right: 0,
            background: "#fff",
            padding: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1000,
            transition: "left 0.3s ease",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "bold",
              color: "#000",
            }}
          >
            LayoffGPT
          </p>
        </div>

        {currentView === "chat" && (
          <>
            {/* Chat history */}
            <div
              style={{
                flex: "1",
                padding: "20px",
                paddingTop: "70px", // Account for the fixed navbar height
                marginLeft: isSidebarOpen ? "250px" : "10px",
                overflowY: "auto", // Enable scrolling for chat history
                fontFamily: "Arial",
                transition: "margin-left 0.3s ease",
              }}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: msg.sender === "bot" ? "flex-start" : "flex-end",
                    marginBottom: "10px", // Adds spacing between messages
                  }}
                >
                  <div
                    style={{
                      background: msg.sender === "bot" ? "#f1f1f1" : "#007bff",
                      color: msg.sender === "bot" ? "#000" : "#fff",
                      padding: "10px",
                      borderRadius: "10px",
                      maxWidth: "70%",
                      wordWrap: "break-word",
                    }}
                  >
                    {msg.text.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < msg.text.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef}></div>
            </div>

            {/* Footer */}
            <div
              style={{
                background: "#fff",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                marginLeft: isSidebarOpen ? "250px" : "10px",
                transition: "margin-left 0.3s ease",
              }}
            >
              <div style={{ marginBottom: "10px" }}>
                {currentQuestionIndex < templates[templateToUse].questions.length &&
                  templates[templateToUse].questions[currentQuestionIndex]?.suggestions?.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      style={{
                        margin: "5px",
                        padding: "10px",
                        background: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        transition: "background 0.3s ease",
                      }}
                      onMouseEnter={(e) => (e.target.style.background = "#0056b3")}
                      onMouseLeave={(e) => (e.target.style.background = "#007bff")}
                    >
                      {suggestion}
                    </button>
                  ))}

                {/* Display suggestions when email is generated */}
                {currentQuestionIndex >= templates[templateToUse].questions.length && (
                  <>
                    <button
                      onClick={() => {
                        handleNewEmailButtonClick()
                      }}
                      style={{
                        margin: "5px",
                        padding: "10px",
                        background: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        transition: "background 0.3s ease",
                      }}
                      onMouseEnter={(e) => (e.target.style.background = "#0056b3")}
                      onMouseLeave={(e) => (e.target.style.background = "#007bff")}
                    >
                      New Email
                    </button>
                    <button
                      onClick={() => {
                        handleAboutButtonClick()
                      }}
                      style={{
                        margin: "5px",
                        padding: "10px",
                        background: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        transition: "background 0.3s ease",
                      }}
                      onMouseEnter={(e) => (e.target.style.background = "#0056b3")}
                      onMouseLeave={(e) => (e.target.style.background = "#007bff")}
                    >
                      About
                    </button>
                    <button
                      onClick={() => window.open("https://www.buymeacoffee.com/layoffgpt", "_blank")}
                      className="send-button"
                      onMouseEnter={(e) => (e.target.style.background = "#0056b3")}
                      onMouseLeave={(e) => (e.target.style.background = "#007bff")}
                      style={{
                        margin: "5px",
                        padding: "10px",
                      }}
                    >
                      Donate
                    </button>
                  </>
                )}
              </div>
              <div style={{ display: "flex", marginBottom: "5px" }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message LayoffGPT"
                  className="input-box"
                />
                <button
                  onClick={() => {
                    handleSend(input);
                    setInput("");
                  }}
                  className="send-button"
                  onMouseEnter={(e) =>
                    (e.target.style.background = "#0056b3")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.background = "#007bff")
                  }
                >
                  Send
                </button>
              </div>
              <p style={{ fontSize: "12px", color: "#888", textAlign: "center" }}>
                LayoffGPT can make mistakes. Check important info.
              </p>
            </div>
          </>
        )}

        {currentView === "about" && (
          <div
            style={{
              flex: 1,
              padding: "20px",
              paddingTop: "50px", // Account for the fixed navbar height
              marginLeft: isSidebarOpen ? "250px" : "10px",
              fontFamily: "Arial",
              transition: "margin-left 0.3s ease",
            }}
          >
            <h2>About</h2>
            <p>
              LayoffGPT is a generative AI chatbot that creates human-like & engaging layoff emails with the help of user-supplied suggestions.<br></br>
            </p>
            <h3>Donate</h3>
            <p>
              The creator of LayoffGPT is currently unemployed because of a layoff. If you'd like to support him while he looks for a new job, please
              consider donating at Buy Me A Coffee
            </p>
            <a href="https://www.buymeacoffee.com/layoffgpt" target="_blank">
              <img
                src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                alt="Buy Me a Coffee"
                style={{
                  height: "50px",
                  width: "auto",
                }}
              />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App
