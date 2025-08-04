import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { Layout } from "./layout";
import { Dashboard } from "./dashboard";
import { Settings } from "./settings";
import { Projects } from "./projects";
import { Events } from "./events";
import { LogIn } from "./login";
import { SignUp } from "./signup";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
