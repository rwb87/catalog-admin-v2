import { Box, Button, Flex, Heading } from "@chakra-ui/react";
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
            <img
                src="/images/404.webp"
                alt="404"
                width={400}
                height='auto'
                loading="lazy"
            />

            <Heading mt={4} className="font-secondary">Error 404</Heading>
            <Heading fontSize='md' className="font-secondary">Looks like you have followed a broken link.</Heading>

            <Box mt={6}>
                <Button
                    size='lg'
                    className="font-bold"
                    onClick={() => navigate('/looks')}
                >Home</Button>
            </Box>
        </Flex>
    )
}