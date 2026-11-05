import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { useAppStore } from "./store/useAppStore";
import { api } from "./utils/api";

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Timeline from "./pages/Timeline";
import Board from "./pages/Board";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Team from "./pages/Team";

export default function App() {
  const syncWithBackend = useAppStore((s) => s.syncWithBackend);
  const projects = useAppStore((s) => s.projects);
  const tasks = useAppStore((s) => s.tasks);

  useEffect(() => {
    // Seed backend database if empty, then sync
    api.seedIfEmpty(projects, tasks).then(() => {
      syncWithBackend();
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="board" element={<Board />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="team" element={<Team />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
