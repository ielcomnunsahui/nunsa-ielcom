import { useEffect, useState, useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
// NOTE: Removed local supabase and User imports as they are now encapsulated in use-auth.ts
import { Loader2, AlertCircle } from "lucide-react";

// NEW IMPORT: Use the centralized authentication hook
import { useAuth } from "@/hooks/use-auth"; 
import { Link } from "react-router-dom"; // Import Link for the Access Denied message

// 1. Define Role Types (Keep this type definition here or import it from types.ts)
// For now, keep it here for simplicity, assuming the useAuth hook exports the type if it was moved.
// If you moved the type to use-auth.ts, you should import it here.
type UserRole = 'voter' | 'aspirant' | 'admin' | 'unverified' | null;

// 2. The ProtectedRoute Component
interface ProtectedRouteProps {
    allowedRoles?: UserRole[]; // Optional: restrict access to certain roles
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    // 3. USE THE CENTRAL AUTH HOOK
    const { user, role, isLoading } = useAuth();
    const location = useLocation();

    // ------------------------------------
    // 1. Loading State
    // ------------------------------------
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="mt-4 text-gray-600 dark:text-gray-300">Securing session...</p>
            </div>
        );
    }
    
    // ------------------------------------
    // 2. Unauthenticated Check
    // ------------------------------------
    if (!user) {
        // Redirect to login, saving the protected path in state to return later
        return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
    }

    // ------------------------------------
    // 3. Role/Authorization Check
    // ------------------------------------
    if (allowedRoles && role && !allowedRoles.includes(role)) {
        // User is logged in but does not have the required role (e.g., Voter accessing Admin page)
        return (
            <div className="min-h-screen flex flex-col justify-center items-center p-8 text-center bg-red-50 dark:bg-red-900/10">
                <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                    You do not have the required role ({allowedRoles.filter(r => r).join(' or ')}) to view this page.
                </p>
                {/* Ensure Link is imported from 'react-router-dom' if not already */}
                <Link to="/" className="mt-4 text-indigo-600 hover:underline">Go to Home</Link>
            </div>
        );
    }

    // ------------------------------------
    // 4. Authorized: Render Child Routes
    // ------------------------------------
    return <Outlet />;
};

export default ProtectedRoute;