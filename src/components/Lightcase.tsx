import { Box, IconButton, Image } from "@chakra-ui/react"
import { IconLoader2, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const Lightcase = () => {
    const [lightcase, setLightcase] = useState<any>({
        open: false,
        isLoading: true,
        src: null,
    });

    useEffect(() => {
        const onLightcase = (event: any) => {
            if(!event?.detail?.image) return;

            setLightcase({
                open: true,
                isLoading: true,
                src: event?.detail?.image,
            });
        }

        window?.addEventListener('lightcase', onLightcase);

        return () => {
            window?.removeEventListener('lightcase', onLightcase);
        }
    }, []);

    const handleCloseLightcase = () => {
        setLightcase({
            open: false,
            isLoading: true,
            src: null,
        });
    }

    return (
        <Box
            id='lightcase'
            position='fixed'
            zIndex={1000}
            top={0}
            left={0}
            width='100vw'
            height='100vh'
            bgColor='rgba(0, 0, 0, 0.5)'
            backdropFilter='blur(4px)'
            p={4}
            display={lightcase.open ? 'grid' : 'none'}
            placeItems='center'
            onClick={handleCloseLightcase}
        >
            <IconButton
                aria-label='Close Lightcase'
                variant='ghost'
                position='fixed'
                colorScheme="whiteAlpha"
                color='white'
                top={2}
                right={2}
                size='sm'
                icon={<IconX size={22} />}
                onClick={handleCloseLightcase}
            />

            <Box
                display={lightcase.isLoading ? 'grid' : 'none'}
                placeSelf='center'
                position='absolute'
                zIndex={1001}
                className="animate-spin"
                onClick={handleCloseLightcase}
            >
                <IconLoader2
                    size={64}
                    color='white'
                />
            </Box>

            <Image
                src={typeof lightcase.src === 'string' ? lightcase.src : ''}
                alt='Lightcase'
                width='auto'
                height='auto'
                maxWidth='calc(100vw - 2rem)'
                maxHeight='calc(100dvh - 2rem)'
                objectFit='contain'
                rounded='10px'
                display={lightcase.isLoading ? 'none' : 'block'}
                onLoad={() => setLightcase({ ...lightcase, isLoading: false })}
            />
        </Box>
    )
}

export default Lightcase;