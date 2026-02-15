import { useState, useEffect } from 'react';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Analysis from './components/Analysis';
import Assistant from './components/Assistant';
import DocumentList from './components/DocumentList';
import AppointmentRoadmap from './components/AppointmentRoadmap';
import PassportRoadmap from './components/PassportRoadmap';
import FlightRoadmap from './components/FlightRoadmap';
import AccommodationRoadmap from './components/AccommodationRoadmap';
import FinancialRoadmap from './components/FinancialRoadmap';
import PhotoRoadmap from './components/PhotoRoadmap';
import FormRoadmap from './components/FormRoadmap';
import { type UserProfile } from './utils/scoring';

type View = 'login' | 'onboarding' | 'dashboard' | 'analysis' | 'assistant' | 'documents' | 'appointment-roadmap' | 'passport-roadmap' | 'flight-roadmap' | 'accommodation-roadmap' | 'financial-roadmap' | 'photo-roadmap' | 'form-roadmap';

interface TripData {
  destination: string;
  visaType: string;
  days: number;
}

interface UploadedFile {
  file: File | null;
  previewUrl?: string;
  fileName: string;
}

function App() {
  const [currentView, setCurrentView] = useState<View>('login');
  const [userName, setUserName] = useState('');
  const [tripData, setTripData] = useState<TripData>({
    destination: 'es',
    visaType: 'tourist',
    days: 15
  });

  // Complete User Profile for Analysis
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Global State for Uploads (Files in memory + Metadata)
  const [uploads, setUploads] = useState<Record<string, UploadedFile>>({});

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setUserProfile(profile);
        setUserName(`${profile.firstName} ${profile.lastName}`);
        setTripData({
          destination: profile.destination,
          visaType: profile.visaType,
          days: profile.days
        });
      } catch (e) {
        console.error('Failed to load user profile:', e);
      }
    }
  }, []);

  const navigateTo = (view: View) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const handleOnboardingComplete = (data: any) => {
    // Create complete user profile
    const profile: UserProfile = {
      firstName: data.firstName,
      lastName: data.lastName,
      birthDate: data.birthDate,
      birthPlace: data.birthPlace,
      civilStatus: data.civilStatus,
      profession: data.profession,
      income: data.income,
      destination: data.destination,
      visaType: data.visaType,
      days: data.days || 15,
      photoUrl: data.photoPreview
    };

    // Save to state
    setUserProfile(profile);
    setTripData({
      destination: data.destination,
      visaType: data.visaType,
      days: data.days || 15
    });
    setUserName(`${data.firstName} ${data.lastName}`);

    // Persist to localStorage
    localStorage.setItem('userProfile', JSON.stringify(profile));

    // Handle photo if present (add to uploads or separate state?)
    if (data.photo) {
      setUploads(prev => ({
        ...prev,
        'profile_photo': {
          file: data.photo,
          fileName: 'profile_photo.jpg',
          previewUrl: data.photoPreview
        }
      }));
    }
    navigateTo('dashboard');
  };

  return (
    <div className="w-full min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      {currentView === 'login' && (
        <Login onLogin={() => navigateTo(userProfile ? 'dashboard' : 'onboarding')} />
      )}

      {currentView === 'onboarding' && (
        <Onboarding
          onNext={handleOnboardingComplete}
          initialData={userProfile}
          onCancel={userProfile ? () => navigateTo('dashboard') : undefined}
        />
      )}

      {currentView === 'dashboard' && (
        <Dashboard
          onBoost={() => navigateTo('analysis')}
          onNavigate={(view) => navigateTo(view as View)}
          destinationId={tripData.destination}
          visaTypeId={tripData.visaType}
          days={tripData.days}
          userName={userName}
          userProfile={userProfile}
          uploads={uploads}
        />
      )}

      {currentView === 'analysis' && (
        <Analysis
          onBack={() => navigateTo('dashboard')}
          onNavigate={(view) => navigateTo(view as View)}
          userProfile={userProfile}
          uploads={uploads}
        />
      )}

      {currentView === 'assistant' && (
        <Assistant
          onBack={() => navigateTo('dashboard')}
          onNavigate={(view) => navigateTo(view as View)}
          uploads={uploads}
          destinationId={tripData.destination}
          visaTypeId={tripData.visaType}
          userName={userName}
          userProfile={userProfile}
        />
      )}

      {currentView === 'appointment-roadmap' && (
        <AppointmentRoadmap
          onBack={() => navigateTo('assistant')}
          jurisdiction={userProfile?.birthPlace?.toLowerCase().includes('guayaquil') || userProfile?.birthPlace?.toLowerCase().includes('gye') ? 'GYE' : 'UIO'}
        />
      )}

      {currentView === 'passport-roadmap' && (
        <PassportRoadmap
          onBack={() => navigateTo('assistant')}
        />
      )}

      {currentView === 'flight-roadmap' && (
        <FlightRoadmap
          onBack={() => navigateTo('assistant')}
        />
      )}

      {currentView === 'accommodation-roadmap' && (
        <AccommodationRoadmap
          onBack={() => navigateTo('assistant')}
        />
      )}

      {currentView === 'financial-roadmap' && (
        <FinancialRoadmap
          onBack={() => navigateTo('assistant')}
        />
      )}

      {currentView === 'photo-roadmap' && (
        <PhotoRoadmap
          onBack={() => navigateTo('assistant')}
        />
      )}

      {currentView === 'form-roadmap' && (
        <FormRoadmap
          onBack={() => navigateTo('assistant')}
        />
      )}

      {currentView === 'documents' && (
        <DocumentList
          onBack={() => navigateTo('dashboard')}
          onNavigate={(view) => navigateTo(view as View)}
          destinationId={tripData.destination}
          visaTypeId={tripData.visaType}
          files={uploads}
          setFiles={setUploads}
        />
      )}
    </div>
  );
}

export default App;
