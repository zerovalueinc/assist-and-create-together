
import { useAuth } from '@/context/AuthContext';

export const useUserData = () => {
  const { user, profile } = useAuth();
  
  return {
    email: user?.email || '',
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    company: profile?.company || '',
    fullName: profile?.first_name && profile?.last_name 
      ? `${profile.first_name} ${profile.last_name}`
      : user?.email || '',
    initials: profile?.first_name && profile?.last_name
      ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
      : user?.email?.[0]?.toUpperCase() || 'U'
  };
};
