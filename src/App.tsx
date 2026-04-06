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
import VisaCalendar from './components/VisaCalendar';
import { type UserProfile, type ImportantDate } from './utils/scoring';
import { getAllFilesLocal, saveFileLocal, deleteFileLocal, clearAllFilesLocal } from './utils/persistence';

import { supabase } from './lib/supabase';
import { type User } from '@supabase/supabase-js';
import { saveUserProfile, getUserProfile, uploadUserFile, listUserFiles } from './lib/userService';
import { sendWelcomeEmail } from './lib/mailService';

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

type View = 'login' | 'onboarding' | 'dashboard' | 'analysis' | 'assistant' | 'documents' | 'appointment-roadmap' | 'passport-roadmap' | 'flight-roadmap' | 'accommodation-roadmap' | 'financial-roadmap' | 'photo-roadmap' | 'form-roadmap' | 'calendar';

function App() {
  const [currentView, setCurrentView] = useState<View>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [tripData, setTripData] = useState<TripData>({
    destination: 'es',
    visaType: 'tourist',
    days: 15
  });

  // Global State for Uploads (Files in memory + Metadata)
  const [uploads, setUploads] = useState<Record<string, UploadedFile>>({});

  // 1. Listen for Auth State Changes
  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleUserChange(session?.user ?? null);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      handleUserChange(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserChange = async (user: User | null) => {
    setIsAuthLoading(true);
    if (user) {
      setCurrentUser(user);
      // Load Profile from Supabase
      let profile = await getUserProfile(user.id);

      if (profile) {
        setUserProfile(profile);
        setUserName(`${profile.firstName} ${profile.lastName}`);
        setTripData({
          destination: profile.destination,
          visaType: profile.visaType,
          days: profile.days
        });

        // RECOVER FILES: Try to load cloud files if local is empty
        const localFiles = await getAllFilesLocal();
        if (Object.keys(localFiles).length === 0) {
          const cloudFiles = await listUserFiles(user.id);
          if (cloudFiles.length > 0) {
            const mapped: Record<string, UploadedFile> = {};
            cloudFiles.forEach(cf => {
              if (cf.reqId !== 'profile_photo') {
                mapped[cf.reqId] = {
                  file: null,
                  fileName: cf.name,
                  previewUrl: cf.url
                };
              }
            });
            setUploads(mapped);
          }
        }

        // Always navigate to dashboard
        setCurrentView(prev => (prev === 'login' || prev === 'onboarding') ? 'dashboard' : prev);
      } else {
        // --- FIX: SI ES UN USUARIO NUEVO, LIMPÌA EL RASTRO DEL ANTERIOR ---
        console.warn("Switch a usuario nuevo detectado. Limpiando datos locales...");
        localStorage.clear(); // Limpia perfiles viejos en LocalStorage
        setUploads({});    // Limpia archivos en memoria
        // IndexedDB se limpia al cerrar sesión o al intentar guardar archivos nuevos con ID distinto

        setUserProfile(null);
        setUserName('');
        setCurrentView('onboarding');
      }
    } else {
      setCurrentUser(null);
      setCurrentView('login');
      // Clear local state
      setUserProfile(null);
      setUserName('');
      setUploads({});
      localStorage.clear();
      clearAllFilesLocal().catch(err => console.error("Could not clear IDB", err));
    }
    setIsAuthLoading(false);
  };

  // 2. Load Local Files from IndexedDB on mount
  useEffect(() => {
    const loadFiles = async () => {
      const storedFiles = await getAllFilesLocal();
      if (Object.keys(storedFiles).length > 0) {
        setUploads(storedFiles as any);
      }
    };
    loadFiles();
  }, []);

  // Persistence Wrapper for Uploads
  const updateUploads = async (newUploads: Record<string, UploadedFile> | ((prev: Record<string, UploadedFile>) => Record<string, UploadedFile>)) => {
    const nextUploads = typeof newUploads === 'function' ? newUploads(uploads) : newUploads;

    // Check for changes (added or removed)
    const currentKeys = Object.keys(uploads);
    const nextKeys = Object.keys(nextUploads);

    // Handle Added/Updated
    for (const key of nextKeys) {
      if (nextUploads[key].file && nextUploads[key].file !== uploads[key]?.file) {
        // Save Local
        await saveFileLocal(key, nextUploads[key].file as File, nextUploads[key].fileName);

        // Sync to Cloud Storage if logged in
        if (currentUser) {
          try {
            const publicUrl = await uploadUserFile(currentUser.id, nextUploads[key].file as File, key);
            console.log(`File ${key} synced to cloud: ${publicUrl}`);
          } catch (e) {
            console.error(`Error syncing file ${key} to cloud:`, e);
          }
        }
      }
    }

    // Handle Deleted
    for (const key of currentKeys) {
      if (!nextUploads[key]) {
        await deleteFileLocal(key);
      }
    }

    setUploads(nextUploads);
  };

  const navigateTo = (view: View) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const handleOnboardingComplete = async (data: any) => {
    // Send welcome email
    const targetEmail = data.email || currentUser?.email;
    if (targetEmail) {
      console.log("Intentando enviar email de bienvenida a:", targetEmail);
      sendWelcomeEmail(targetEmail, data.firstName, data.destination)
        .then(res => {
          if (!res) console.error("El envío de email falló (ver consola de red o logs de MailService)");
        })
        .catch(err => console.error("Error capturado en App.tsx:", err));
    }

    let finalPhotoUrl = data.photoPreview;

    // Upload Photo if is a new File
    if (currentUser && data.photo instanceof File) {
      try {
        console.log("Uploading profile photo...");
        const uploadedUrl = await uploadUserFile(currentUser.id, data.photo, 'profile_photo');
        if (uploadedUrl) finalPhotoUrl = uploadedUrl;
      } catch (e) {
        console.error("Error uploading profile photo:", e);
      }
    }

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
      photoUrl: finalPhotoUrl,
      phone: data.phone,
      email: data.email
    };

    // Save to state
    setUserProfile(profile);
    setTripData({
      destination: data.destination,
      visaType: data.visaType,
      days: data.days || 15
    });
    setUserName(`${data.firstName} ${data.lastName}`);

    // Persist to Supabase if logged in
    if (currentUser) {
      try {
        console.log("Saving profile to Supabase...");
        await saveUserProfile(currentUser.id, profile);
        console.log("Profile saved successfully.");
      } catch (err) {
        console.error("Cloud save failed, continuing with local data:", err);
      }
    }

    // Fallback to localStorage
    localStorage.setItem('userProfile', JSON.stringify(profile));

    // Handle photo if present 
    if (data.photo) {
      // Not awaiting this as it can happen in background
      updateUploads({
        ...uploads,
        'profile_photo': {
          file: data.photo,
          fileName: 'profile_photo.jpg',
          previewUrl: data.photoPreview
        }
      });
    }

    navigateTo('dashboard');
  };

  const handleAddDate = async (newDate: ImportantDate) => {
    if (!userProfile) return;
    
    const updatedProfile = {
      ...userProfile,
      importantDates: [...(userProfile.importantDates || []), newDate]
    };
    
    setUserProfile(updatedProfile);
    
    if (currentUser) {
      await saveUserProfile(currentUser.id, updatedProfile);
    }
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
  };

  const handleDeleteDate = async (id: string) => {
    if (!userProfile) return;
    
    const updatedProfile = {
      ...userProfile,
      importantDates: (userProfile.importantDates || []).filter(d => d.id !== id)
    };
    
    setUserProfile(updatedProfile);
    
    if (currentUser) {
      await saveUserProfile(currentUser.id, updatedProfile);
    }
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
  };

  return (
    <div className="w-full min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      {isAuthLoading ? (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-primary">G</div>
          </div>
          <div className="mt-6 text-3xl font-bold tracking-widest flex items-center justify-center gap-1">
            <span className="text-primary animate-pulse">Go</span><span className="text-white">-Check</span>
          </div>
          <p className="mt-2 text-slate-400 text-sm">Asegurando tu sesión...</p>
        </div>
      ) : (
        <>
          {currentView === 'login' && (
            <Login />
          )}

          {currentView === 'onboarding' && (
            <Onboarding
              onNext={handleOnboardingComplete}
              initialData={userProfile || (currentUser ? { email: currentUser.email } : null)}
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
              userId={currentUser?.id || 'guest'}
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
              destinationId={tripData.destination}
              visaTypeId={tripData.visaType}
              files={uploads}
              setFiles={updateUploads}
              userProfile={userProfile}
            />
          )}

          {currentView === 'calendar' && (
            <VisaCalendar
              onBack={() => navigateTo('dashboard')}
              importantDates={userProfile?.importantDates || []}
              onAddDate={handleAddDate}
              onDeleteDate={handleDeleteDate}
              companions={userProfile?.companions || []}
            />
          )}
        </>

      )}
    </div>
  );
}

export default App;
