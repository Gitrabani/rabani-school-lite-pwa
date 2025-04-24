
import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  schoolName: string;
  academicYear: string;
  setSchoolName: (name: string) => void;
  setAcademicYear: (year: string) => void;
  saveSettings: () => void;
}

const defaultSettings = {
  schoolName: 'Rabani School',
  academicYear: '2025-2026',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schoolName, setSchoolName] = useState<string>(defaultSettings.schoolName);
  const [academicYear, setAcademicYear] = useState<string>(defaultSettings.academicYear);
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSchoolName(parsedSettings.schoolName || defaultSettings.schoolName);
        setAcademicYear(parsedSettings.academicYear || defaultSettings.academicYear);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  const saveSettings = () => {
    try {
      const settingsToSave = {
        schoolName,
        academicYear,
      };
      localStorage.setItem('appSettings', JSON.stringify(settingsToSave));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  };

  const value = {
    schoolName,
    academicYear,
    setSchoolName,
    setAcademicYear,
    saveSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
