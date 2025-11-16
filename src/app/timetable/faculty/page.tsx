"use client";

import React from "react";
import TimetableGAPlatform from "../page";

const FacultyTimetablePage: React.FC = () => {
  // We rely on currentUserRole.role === "faculty" from login;
  // TimetableGAPlatform will read it and show the full UI with faculty permissions.
  return <TimetableGAPlatform />;
};

export default FacultyTimetablePage;
