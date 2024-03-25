import { useAuthGuard } from "@/providers/AuthProvider";
import AppLayout from "@/layouts/app.layout";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
    useAuthGuard('auth');
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/looks');
    }, []);

    return (
        <AppLayout></AppLayout>
    )
}

export default Home;