import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HostCreateGame from "./pages/HostCreateGame";
import Home from "./pages/Home";
import HostLobby from "./pages/HostLobby";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MyQuizzes from "./pages/MyQuizzes";
<<<<<<< HEAD
import JoinGame from "./pages/JoinGame";
=======
import PlayerView from "./pages/Player/PlayerView";
>>>>>>> QUIZ-40

const router = createBrowserRouter([
  { path: "/Login", element: <Login /> },
  { path: "/Register", element: <Register /> },
  {
    path: "/Home",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  { path: "/", element: <Login /> },
  {
    path: "/HostCreateGame",
    element: (
      <ProtectedRoute>
        <HostCreateGame />
      </ProtectedRoute>
    ),
  },
<<<<<<< HEAD
  { 
    path: "/HostLobby/:gamePin",
    element: (
      <ProtectedRoute>
        <HostLobby /> 
      </ProtectedRoute>
    )
  },
  { path: "/MyQuizzes", element: <ProtectedRoute><MyQuizzes /></ProtectedRoute> },
  { path: "/game/:gamePin", element: <JoinGame /> },
=======
  { path: "/HostLobby", element: <HostLobby /> },
  {
    path: "/MyQuizzes",
    element: (
      <ProtectedRoute>
        <MyQuizzes />
      </ProtectedRoute>
    ),
  },
  { path: "/Player", element: <PlayerView /> },
>>>>>>> QUIZ-40
]);

function App() {
  return <RouterProvider router={router} />;
}
console.log(PlayerView);
export default App;
