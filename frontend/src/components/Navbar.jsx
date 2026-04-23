import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const nav = useNavigate();

  return (
    <nav className="bg-green-700 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">🌾 Rural Connect</Link>

      <div className="flex gap-4 items-center">
        <Link to="/schemes">Schemes</Link>

        {user ? (
          <>
            <Link to={profile?.role === 'expert' ? '/expert' : '/dashboard'}>
              Dashboard
            </Link>

            <button
              onClick={() => {
                signOut();
                nav('/');
              }}
              className="bg-red-500 px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup" className="bg-white text-green-700 px-3 py-1 rounded">
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}