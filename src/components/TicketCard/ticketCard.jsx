import React from 'react';
import "./TicketCard.css";

const TicketSuccess = ({ fullName, email, githubUsername, avatar }) => {
  return (
    <div className="ticket-container">
      <div className="event-title">Config Conf</div>

      <h1 className="congrats-heading">
        Congrats, <span className="name-highlight">{fullName}</span>!
        <br />
        Your ticket is ready.
      </h1>

      <p className="confirmation-message">
        We've emailed your ticket to <span className="email-highlight">{email}</span> 
        and will send updates in the run up to the event.
      </p>

      <div className="ticket-card">
        <div className="ticket-main">
          <div className="ticket-content">
            <div className="event-info">
              <div className="event-name">Config Conf</div>
              <p className="event-date-location">Jan 21, 2025 • Austin, TX</p>
            </div>

            <div className="attendee-info">
              <img
                src={avatar || "https://www.shutterstock.com/image-vector/silhouette-man-avatar-profile-picture-260nw-182324009.jpg"}
                alt="Avatar"
                className="attendee-avatar"
              />
              <div>
                <p className="attendee-name">{fullName}</p>
                <p className="github-username">@{githubUsername}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="ticket-stub">
          <div className="stub-notch top-notch"></div>
          <div className="stub-content">ADMIT</div>
          <div className="stub-notch bottom-notch"></div>
        </div>
      </div>
    </div>
  );
};

export default TicketSuccess;