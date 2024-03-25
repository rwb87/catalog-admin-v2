import { Box, Button, Flex, FormControl, FormLabel, Input } from "@chakra-ui/react";
import React, { useState } from "react";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { useUser } from "@/_store";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/providers/AuthProvider";

const Login = () => {
    const {setToken, setUser, setUserPermissions} = useUser() as any;
    const navigate = useNavigate();

    useAuthGuard('guest');

    const [isProcessing, setIsProcessing] = useState(false);
    const [payload, setPayload] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (isProcessing) return;

        if (payload?.email?.trim() === '') return notify('Email is required', 3000);
        if (payload?.password?.trim() === '') return notify('Password is required', 3000);

        setIsProcessing(true);

        try {
            const response = await fetch({
                endpoint: '/users/login',
                method: 'POST',
                data: payload
            });

            const { token, user, userPermissions } = response;
            setToken(token);
            setUser(user);
            setUserPermissions(userPermissions);

            // Redirect to dashboard
            setTimeout(() => {
                navigate('/');
            }, 100)
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsProcessing(false);
    };

    return (
        <Box background='linear-gradient(#000, #000f1c)'>
            <Flex
                direction='column'
                gap={4}
                justifyContent='center'
                alignItems='center'
                maxWidth="md"
                width='full'
                mx="auto"
                minHeight='100dvh'
                color='white'
            >
                <form onSubmit={handleSubmit} style={{ display: 'contents'}}>

                    {/* Logo */}
                    <Box mb={6}>
                        <img
                            src="/favicon.ico"
                            alt="logo"
                            width={100}
                            height={100}
                            loading="lazy"
                        />
                    </Box>

                    {/* Email */}
                    <FormControl id="email">
                        <FormLabel>Email address</FormLabel>
                        <Input
                            type="email"
                            required
                            autoComplete="email"
                            color="white"
                            value={payload.email}
                            onChange={(e) => setPayload({ ...payload, email: e.target.value })}
                        />
                    </FormControl>

                    {/* Password */}
                    <FormControl id="password">
                        <FormLabel>Password</FormLabel>
                        <Input
                            type="password"
                            required
                            autoComplete="current-password"
                            color="white"
                            value={payload.password}
                            onChange={(e) => setPayload({ ...payload, password: e.target.value })}
                        />
                    </FormControl>

                    {/* Submit */}
                    <Button
                        type="submit"
                        background='white'
                        size="lg"
                        fontSize="md"
                        width="full"
                        isLoading={isProcessing}
                        spinnerPlacement='start'
                        loadingText='Signing in...'
                    >
                        Sign In
                    </Button>
                </form>
            </Flex>
        </Box>
    );
};

export default Login;