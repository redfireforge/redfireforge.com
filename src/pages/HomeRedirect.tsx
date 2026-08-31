import { Navigate } from 'react-router-dom';

/** Until Phase 4 landing page ships, send `/` visitors to `/download`. */
export function HomeRedirect() {
  return <Navigate to="/download" replace />;
}
