"use client";
import React, { useState } from "react";
import InputField from "@/components/Input/input";
import UploadBox from "@/components/upload/uploadfield";
import TicketSuccess from "@/components/TicketCard/ticketCard";
import "./page.css";

const Page = () => {
  const [showTicket, setShowTicket] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    githubUsername: "",
    avatar: null,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateTicket = () => {
    setShowTicket(true);
  };

  return (
    <div className="page-container">
      {/* Header / Logo */}
      <header className="page-header">
        <span className="logo-icon">🚀</span>
        <span className="logo-text">Coding Conf</span>
      </header>

      {/* Form or Success Screen */}
      {!showTicket ? (
        <div className="form-card">
          <h1 className="form-heading">
            Your Journey to Coding Conf 2025 Starts Here!
          </h1>
          <p className="form-subtext">
            Secure your spot at next year’s biggest coding conference.
          </p>

          <UploadBox
            onUpload={(url) => handleInputChange("avatar", url)}
          />

          <InputField
            label="Full Name"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={(e) =>
              handleInputChange("fullName", e.target.value)
            }
          />

          <InputField
            label="Email Address"
            type="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={(e) =>
              handleInputChange("email", e.target.value)
            }
          />

          <InputField
            label="GitHub Username"
            placeholder="your username"
            value={formData.githubUsername}
            onChange={(e) =>
              handleInputChange("githubUsername", e.target.value)
            }
          />

          <button
            className="form-button"
            onClick={handleGenerateTicket}
          >
            Generate My Ticket
          </button>
        </div>
      ) : (
        <TicketSuccess
          fullName={formData.fullName}
          email={formData.email}
          githubUsername={formData.githubUsername}
          avatar={formData.avatar}
        />
      )}
    </div>
  );
};

export default Page;
