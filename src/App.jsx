import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Products from './pages/Products';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
