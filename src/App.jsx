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
<nav class="navbar navbar-expand-sm bg-light">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">LayoffGPT</a>
    
    <div class="collapse navbar-collapse">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link" href="#">Link 1</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Link 2</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Link 3</a>
        </li>
      </ul>
    </div>
  </div>
</nav>


  )
}

export default App
