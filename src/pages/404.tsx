import { Button, Flex, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function FourOhFour() {
    const navigate = useNavigate();

    return (
        <Flex
            direction="column"
            alignItems="center"
            justifyContent="center"
            gap={4}
            minHeight="100vh"
        >
            <Heading>404</Heading>

            <Heading>Page not found!</Heading>

            <Button
                size='lg'
                className="font-bold"
                onClick={() => navigate('/login')}
            >Home</Button>
        </Flex>
    )
}