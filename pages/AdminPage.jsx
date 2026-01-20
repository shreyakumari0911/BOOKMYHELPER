import React from 'react';
import { useNavigate } from 'react-router-dom';
import App from '../App';
import BrutalButton from '../components/BrutalButton';

export default function AdminPage() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0]">
      <div className="p-3 flex justify-end">
        <BrutalButton size="sm" variant="secondary" onClick={logout}>
          Logout / Switch Role
        </BrutalButton>
      </div>
      <App initialViewMode="ADMIN" lockViewMode />
    </div>
  );
}
