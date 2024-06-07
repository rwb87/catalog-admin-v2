import { MUSIC_PROVIDERS } from "@/_config";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { Box, Button, Flex, Grid, Image, Input, Modal, ModalBody, ModalContent, ModalOverlay, Text } from "@chakra-ui/react";
import { IconLoader2 } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

const AddMusicPopup = () => {
    const audioPlayerRef = useRef<HTMLAudioElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [link, setLink] = useState('');
    const [musicDetails, setMusicDetails] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isAddingMusic, setIsAddingMusic] = useState(false);
    const [switchingTrack, setSwitchingTrack] = useState<any>({});
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const togglePopup = (event?: any) => {
            const { music } = event?.detail || {};

            setIsOpen(!isOpen);
            setLink('');
            setMusicDetails({});
            setIsLoading(false);
            setIsAddingMusic(false);

            if(music) setSwitchingTrack(music);
            else setSwitchingTrack({});
        }

        window.addEventListener('modal:add-music', togglePopup);

        return () => {
            window.removeEventListener('modal:add-music', togglePopup);
        }
    }, [isOpen]);

    useEffect(() => {
        const debounce = setTimeout(() => fetchDetails(), 500);
        return () => clearTimeout(debounce);
    }, [link]);

    const fetchDetails = async (isAdding = false) => {
        if(!isAdding) setIsLoading(true);
        const isSwitching = !!switchingTrack?.id;

        if (!link?.trim()?.length || !isOpen) {
            setIsLoading(false);
            setMusicDetails({});
            return;
        }

        try {
            const url = isAdding
                ? isSwitching
                    ? `/musics/${switchingTrack.id}`
                    : `/musics`
                : `/musics/details`;

            const response = await fetch({
                endpoint: url,
                method: isAdding && isSwitching ? 'PUT' : 'POST',
                data: {
                    url: link,
                }
            });

            if(isAdding) {
                if(isSwitching) notify('Music updated');
                else notify('Music added to library');

                setIsOpen(false);
                setLink('');
                setMusicDetails({});
                setIsLoading(false);
                setIsAddingMusic(false);
            } else {
                setMusicDetails(response);
                setIsLoading(false);
                setIsAddingMusic(false);
            }
        } catch (error) {
            setMusicDetails({});
            notify('Not a valid Spotify or Apple Music URL');
        }

        setIsLoading(false);
        setIsPlaying(true);
    }

    const handleAddMusicToLibrary = async () => {
        setIsAddingMusic(true);

        try {
            await fetchDetails(true);

            window.dispatchEvent(new Event('refresh:data'));
        } catch (error) {
            notify('Not a valid Spotify or Apple Music URL');
        }

        setIsAddingMusic(false);
    }

    const handlePreviewPlay = () => {
        if (audioPlayerRef.current) {
            if(isPlaying) {
                audioPlayerRef.current.pause();
                audioPlayerRef.current.currentTime = 0;
                setIsPlaying(false);
            } else {
                audioPlayerRef.current.play();
                setIsPlaying(true);
            }
        }
    }

    return (
        <Modal
            size='xl'
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            closeOnOverlayClick={true}
        >
            <ModalOverlay />

            <ModalContent>
                <ModalBody p={2}>
                    <Input
                        type='text'
                        placeholder='Paste your Spotify or Apple Music URL here...'
                        variant='outline'
                        size='xl'
                        p={4}
                        rounded='lg'
                        backgroundColor='white'
                        value={link}
                        onChange={(event) => setLink(event.target.value)}
                    />

                    {
                        isLoading
                            ? <Box display='block' mx='auto' mt={2} textAlign='center'>
                                <IconLoader2 size={48} className="animate-spin" style={{ margin: '0 auto' }} />
                            </Box>
                            : musicDetails?.name
                                ? <Flex mt={6}>
                                    <Image
                                        src={musicDetails?.smallAlbumImage}
                                        alt={musicDetails?.name}
                                        rounded='lg'
                                        width={40}
                                        height={40}
                                        loading='lazy'
                                        objectFit='cover'
                                        borderWidth={1}
                                        borderStyle='solid'
                                        borderColor='gray.100'
                                    />

                                    <Flex
                                        direction='column'
                                        ml={4}
                                        flex={1}
                                        justifyContent='space-between'
                                        overflow='hidden'
                                    >
                                        <Box>
                                            <Text isTruncated={true} fontSize='lg' fontWeight='bold'>{musicDetails?.name}</Text>
                                            <Text isTruncated={true}>{musicDetails?.artistNames}</Text>

                                            <Image
                                                src={MUSIC_PROVIDERS[musicDetails?.type?.toUpperCase()]?.logo}
                                                alt={musicDetails?.type}
                                                width={10}
                                                height='auto'
                                                mt={4}
                                                loading='lazy'
                                            />
                                        </Box>

                                        {/* Audio Player */}
                                        <audio
                                            ref={audioPlayerRef}
                                            src={musicDetails?.previewUrl}
                                            controls={isPlaying}
                                            autoPlay={isPlaying}
                                            style={{ display: 'none' }}
                                            onEnded={() => setIsPlaying(false)}
                                            onError={() => setIsPlaying(false)}
                                            onPause={() => setIsPlaying(false)}
                                        />

                                        <Grid
                                            templateColumns={musicDetails?.previewUrl ? '1fr 1fr' : '1fr'}
                                            gap={2}
                                        >
                                            {
                                                musicDetails?.previewUrl && <Button
                                                    colorScheme='gray'
                                                    size='sm'
                                                    width='full'
                                                    mt={4}
                                                    onClick={handlePreviewPlay}
                                                >{isPlaying ? 'Stop' : 'Play'}</Button>
                                            }

                                            <Button
                                                colorScheme='green'
                                                size='sm'
                                                width='full'
                                                mt={4}
                                                isLoading={isAddingMusic}
                                                loadingText={switchingTrack?.id ? 'Switching Track...' : 'Adding to library...'}
                                                disabled={isAddingMusic}
                                                onClick={handleAddMusicToLibrary}
                                            >{switchingTrack?.id ? 'Switch Track' : 'Add to library'}</Button>
                                        </Grid>
                                    </Flex>
                                </Flex>
                                : null
                    }
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

export default AddMusicPopup;