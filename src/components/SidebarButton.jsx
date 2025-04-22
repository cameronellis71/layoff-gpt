import { useState } from "react";

const SidebarButton = ({ label, setCurrentView, activeButton, setActiveButton }) => {
  return (
    <div style={{ padding: "10px" }}>
      <button
        onClick={() => {
          setActiveButton(label); // Track the clicked button
          setCurrentView(label.toLowerCase()); // Set the view based on label
        }}
        className="sidebar-options"
        onMouseEnter={(e) => (e.target.style.background = "#c0c0c0")} // Darker gray on hover
        onMouseLeave={(e) =>
          (e.target.style.background = activeButton === label ? "#c0c0c0" : "#e0e0e0")
        } // Reset color unless this button is active
        style={{ background: activeButton === label ? "#c0c0c0" : "#e0e0e0" }} // Keep selected button highlighted
      >
        {label}
      </button>
    </div>
  );
};

export default SidebarButton;
