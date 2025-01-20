import { useContext } from 'react';
import { UserContext } from '../components/UserContext.jsx';

const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export default useUserContext;