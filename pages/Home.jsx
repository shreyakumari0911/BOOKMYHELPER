import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BrutalButton from '../components/BrutalButton';

const roleToPath = {
  CUSTOMER: '/customer',
  PROVIDER: '/provider',
  ADMIN: '/admin',
};

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('role');
    if (stored && roleToPath[stored]) {
      navigate(roleToPath[stored], { replace: true });
    }
  }, [navigate]);

  const chooseRole = (role) => {
    localStorage.setItem('role', role);
    navigate(roleToPath[role]);
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-black flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white border-8 border-black p-8 neobrutal-shadow">
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-6 text-center">
          Choose Your Role
        </h1>
        <p className="text-center font-bold mb-8">Continue as one of the roles below</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BrutalButton size="lg" className="w-full" onClick={() => chooseRole('CUSTOMER')}>
            Continue as Customer
          </BrutalButton>
          <BrutalButton size="lg" className="w-full" onClick={() => chooseRole('PROVIDER')}>
            Continue as Provider
          </BrutalButton>
          <BrutalButton size="lg" className="w-full" onClick={() => chooseRole('ADMIN')}>
            Continue as Admin
          </BrutalButton>
        </div>
      </div>
    </div>
  );
}
