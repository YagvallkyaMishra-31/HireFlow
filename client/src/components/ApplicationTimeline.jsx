import React from "react";

const STATUS_ORDER = [
  "Applied",
  "Screening",
  "Interview",
  "Technical",
  "HR",
  "Offer",
  "Hired"
];

const ApplicationTimeline = ({ history = [], currentStatus }) => {
  const completedStatuses = history.map((h) => h.status);

  return (
    <div className="timeline">
      {STATUS_ORDER.map((status, index) => {
        const isCompleted = completedStatuses.includes(status);
        const isCurrent = currentStatus === status;

        return (
          <div key={status} className="timeline-item">
            <div
              className={`timeline-circle ${
                isCompleted ? "completed" : ""
              } ${isCurrent ? "current" : ""}`}
            />
            <div className="timeline-content">
              <p className="timeline-status">{status}</p>
              {isCompleted && (
                <p className="timeline-date">
                  {
                    history.find((h) => h.status === status)?.changedAt
                      ? new Date(
                          history.find((h) => h.status === status).changedAt
                        ).toLocaleDateString()
                      : ""
                  }
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ApplicationTimeline;