import { Navigate, createHashRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { NoteReadingPage } from '@/features/noteReading';

// Hash routing: GitHub Pages has no fallback for unknown paths (see ADR 0005).
const router = createHashRouter([
  { path: '/', element: <NoteReadingPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export function App() {
  return <RouterProvider router={router} />;
}
