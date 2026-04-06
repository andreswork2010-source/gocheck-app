import { supabase } from './supabase';
import { type UserProfile } from '../utils/scoring';

/**
 * Saves or updates a user profile in Supabase
 */
export const saveUserProfile = async (uid: string, profile: any) => {
    try {
        // Map camelCase to snake_case for Postgres
        const dbProfile = {
            id: uid,
            first_name: profile.firstName,
            last_name: profile.lastName,
            birth_date: profile.birthDate,
            birth_place: profile.birthPlace,
            civil_status: profile.civilStatus,
            profession: profile.profession,
            income: profile.income,
            destination: profile.destination,
            visa_type: profile.visaType,
            days: profile.days,
            photo_url: profile.photoUrl,
            phone: profile.phone,
            email: profile.email,
            important_dates: profile.importantDates || [],
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('profiles')
            .upsert(dbProfile);

        if (error) {
            console.error("Supabase upsert error detail:", error);
            throw error;
        }
        console.log("Profile successfully saved to Supabase Profiles table.");
    } catch (error) {
        console.error("CRITICAL: Error saving profile to Supabase:", error);
        throw error;
    }
};

/**
 * Retrieves a user profile from Supabase
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
        console.log(`Checking cloud profile for UID: ${uid}...`);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', uid)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                console.warn("No cloud profile record found (PGRST116). User likely new.");
                return null;
            }
            console.error("Supabase select error detail:", error);
            throw error;
        }

        console.log("Cloud profile found and loaded successfully.");
        // Map snake_case to camelCase for JS
        return {
            firstName: data.first_name,
            lastName: data.last_name,
            birthDate: data.birth_date,
            birthPlace: data.birth_place,
            civilStatus: data.civil_status,
            profession: data.profession,
            income: data.income,
            destination: data.destination,
            visaType: data.visa_type,
            days: data.days,
            photoUrl: data.photo_url,
            phone: data.phone,
            email: data.email,
            importantDates: data.important_dates || []
        } as UserProfile;
    } catch (error) {
        console.error("Error getting profile from Supabase:", error);
        return null;
    }
};

// --- NEW: CLOUD SYNC FOR CHAT ---
export const saveChatMessage = async (userId: string, text: string, sender: 'user' | 'bot', payload: any = {}) => {
    try {
        const { error } = await supabase
            .from('chat_messages')
            .insert([{
                user_id: userId,
                text,
                sender,
                payload
            }]);

        if (error) throw error;
        console.log(`Message saved to Supabase for user ${userId}`);
    } catch (error) {
        console.error('Error saving message to cloud:', error);
    }
};

export const getCloudChatMessages = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching chat history from cloud:', error);
        return [];
    }
};

// --- SECURE CLOUD SYNC FOR DOCUMENTS ---
export const uploadUserFile = async (userId: string, file: File, fileId: string) => {
    try {
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/${fileId}.${fileExt}`;

        // Subida al Storage (RLS requerido)
        const { error } = await supabase.storage
            .from('user-documents')
            .upload(filePath, file, {
                upsert: true 
            });

        if (error) throw error;

        // Generamos un link firmado de 1 año (31536000 seg) para que no expire rápido en el dashboard
        // Pero el acceso está protegido por la carpeta propia de usuario.
        const { data, error: signedError } = await supabase.storage
            .from('user-documents')
            .createSignedUrl(filePath, 31536000); 

        if (signedError) throw signedError;
        return data?.signedUrl;
    } catch (error) {
        console.error('Error uploading secure file to storage:', error);
        return null;
    }
};

export const listUserFiles = async (userId: string) => {
    try {
        const { data, error } = await supabase.storage
            .from('user-documents')
            .list(userId);

        if (error) throw error;

        // Recuperamos los archivos existentes
        const filesWithUrls = await Promise.all(data.map(async f => {
            const filePath = `${userId}/${f.name}`;
            const { data: signedData, error: signedError } = await supabase.storage
                .from('user-documents')
                .createSignedUrl(filePath, 31536000); // 1 año

            return {
                name: f.name,
                url: signedData?.signedUrl || '',
                reqId: f.name.split('.')[0]
            };
        }));

        return filesWithUrls;
    } catch (error) {
        console.error('Error listing user files securely:', error);
        return [];
    }
};
