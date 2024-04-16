import { useAuthGuard } from "@/providers/AuthProvider";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
    useAuthGuard('auth');
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/looks');
    }, []);

    return null;
}

export default Home;