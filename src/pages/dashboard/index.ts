import React from "react";

export type TrackStatus = "completed" | "in-progress" | "locked";

export interface Track {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  modules: number;
  units: number;
  progress: number;
  status: TrackStatus;
}

export interface ActivityItem {
  label: string;
  time: string;
  done: boolean;
}