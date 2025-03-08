import { Navigate } from "react-router-dom";
import { useFirebase } from "./context/Firebase";

const AppWrapper = ({ children, status }) => {
    const firebase = useFirebase();
    const requiresAdmin = status?.requiresAdmin || false;
    const requiresLogin = status?.requiresLogin || false;

    if (requiresAdmin && firebase.isAdmin) {
        return children; // Admin access granted
    }

    if (requiresLogin && firebase.user) {
        return children; // Logged-in user access granted
    }

    if(!requiresAdmin && !requiresLogin){
        return children; // Logged-in user access granted
    }

    // No access logic
    return (
        <div className="text-center mt-5">
            <h3>Please Login to view content</h3>
        </div>
    );

    // Optionally redirect unauthorized users to login
    // return <Navigate to="/login" replace />;
};

export default AppWrapper;
