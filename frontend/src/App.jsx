import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HostCreateGame from "./pages/HostCreateGame";
import HostLobby from "./pages/HostLobby";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MyQuizzes from "./pages/MyQuizzes";

const router = createBrowserRouter([
  { path: "/Login", element: <Login /> },
  { path: "/Register", element: <Register /> },
  { path: "/", element: <Login /> },
  { 
    path: "/HostCreateGame", 
    element: (
      <ProtectedRoute>
        <HostCreateGame />
      </ProtectedRoute>
    ) 
  },
  { path: "/HostLobby", element: <HostLobby /> },
  { path: "/MyQuizzes", element: <ProtectedRoute><MyQuizzes /></ProtectedRoute> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;