import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './components/HomePage';
import App from './App.jsx';
import PlayerTest from './components/PlayerTest';
import PlayerBoneViewer from './components/PlayerBoneViewer';
import WebApp from './components/WebApp';
import PlayerAnimation from './components/PlayerAnimation';
import './index.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/simulator",
    element: <App />,
  },
  {
    path: "/webapp",
    element: <WebApp />,
  },
  {
    path: "/player",
    element: <PlayerTest />,
  },
  {
    path: "/bones",
    element: <PlayerBoneViewer />,
  },
  {
    path: "/player-animation",
    element: <PlayerAnimation />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);