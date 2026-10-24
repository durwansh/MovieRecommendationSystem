import React, { useContext, useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import OnboardingModal from '../components/OnboardingModal';
import { AuthContext } from '../context/AuthContext';
import { updatePreferences } from '../services/authService';

export default function MainLayout({ children }) {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const onboardedKey = `cineai_onboarded_${user._id || user.id}`;
      const alreadyDone = localStorage.getItem(onboardedKey);
      if (!alreadyDone && (!user.preferredGenres || user.preferredGenres.length === 0)) {
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated, user]);

  const handleSavePreferences = async (genres) => {
    try {
      await updatePreferences(genres);
      if (user) {
        localStorage.setItem(`cineai_onboarded_${user._id || user.id}`, 'true');
      }
      setShowOnboarding(false);
      window.location.reload();
    } catch (err) {
      console.error('Failed to update preferences', err);
    }
  };

  const handleCloseOnboarding = () => {
    if (user) {
      localStorage.setItem(`cineai_onboarded_${user._id || user.id}`, 'true');
    }
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-600 selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <Footer />

      {/* Cold Start Personalization Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
        onSavePreferences={handleSavePreferences}
      />
    </div>
  );
}
