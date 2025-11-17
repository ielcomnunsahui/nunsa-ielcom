import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

// Define Role Types
type UserRole = 'voter' | 'aspirant' | 'admin' | 'unverified' | null;

// --- The Central useAuth Hook ---
export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserAndRole = async () => {
        setIsLoading(true);
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser(authUser);

        if (!authUser) {
            setRole(null);
            setIsLoading(false);
            return;
        }

        // --- Fetch Role Information ---
        let userRole: UserRole = 'unverified';

        // Check for Admin (Highest privilege)
        const { data: adminData } = await supabase
            .from('admin_users')
            .select('id')
            .eq('user_id', authUser.id)
            .limit(1)
            .single();
        if (adminData) {
            userRole = 'admin';
        } 
        
        // Check for Aspirant
        else {
            const { data: aspirantData } = await supabase
                .from('aspirants')
                .select('id')
                .eq('user_id', authUser.id)
                .limit(1)
                .single();
            if (aspirantData) {
                userRole = 'aspirant';
            }
        }
        
        // Check for Voter (General privilege)
        if (userRole === 'unverified') {
            const { data: voterData } = await supabase
                .from('voters')
                .select('id')
                .eq('user_id', authUser.id)
                .limit(1)
                .single();
            if (voterData) {
                userRole = 'voter';
            }
        }

        setRole(userRole);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchUserAndRole();

        // Listen for Auth State Changes
        const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                fetchUserAndRole();
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return { user, role, isLoading };
};