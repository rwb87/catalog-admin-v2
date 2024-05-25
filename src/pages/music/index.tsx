import { MUSIC_PROVIDERS } from "@/_config";
import MusicsTable from "@/components/music/MusicTable";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { Content } from "@/layouts/app.layout"
import { useAuthGuard } from "@/providers/AuthProvider";
import { Box, Button, Flex, IconButton, Image, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalContent, ModalOverlay, Text, Tooltip } from "@chakra-ui/react";
import { IconLoader2, IconPlus, IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const MusicView = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [data, setData] = useState<any>([]);
    const [search, setSearch] = useState<string>('');

    const [pagination, setPagination] = useState({
        page: 1,
        offset: 0,
        limit: 50,
        total: 0,
    });

    useAuthGuard('auth');

    useEffect(() => {
        setIsLoading(true);

        getData();

        window?.addEventListener('refresh:data', getData);

        return () => window?.removeEventListener('refresh:data', getData);
    }, [pagination?.offset]);

    useEffect(() => {
        const debounce = setTimeout(() => getData(), 500);
        return () => clearTimeout(debounce);
    }, [search]);

    const getData = async () => {
        try {
            const response = await fetch({
                endpoint: `/musics?search=${search}&offset=${pagination.offset}&limit=${pagination.limit}`,
                method: 'GET',
            });

            setData(response?.musics);
            setPagination({
                ...pagination,
                total: response?.count,
            });
        } catch (error) {
            console.log(error);
        }

        setIsLoading(false);
    }

    return (
        <Content activePage="Music">

            {/* Search and Options */}
            <Flex
                direction={{
                    base: 'column',
                    lg: 'row',
                }}
                justifyContent='space-between'
                alignItems={{
                    base: 'flex-start',
                    lg: 'center',
                }}
                mb={{
                    base: 4,
                    md: 8,
                    xl: 16,
                }}
                gap={2}
                width='full'
            >

                {/* Page Heading */}
                <Flex
                    justifyContent={{
                        base: 'space-between',
                        lg: 'flex-start',
                    }}
                    alignItems='center'
                    width={{
                        base: 'full',
                        lg: 'auto',
                    }}
                    gap={2}
                >
                    <h1 className="page-heading">Music</h1>
                </Flex>

                {/* Search and Actions */}
                <Flex
                    direction={{
                        base: 'column',
                        md: 'row',
                    }}
                    gap={2}
                    alignItems='center'
                    justifyContent={{
                        base: 'flex-end',
                        md: 'space-between',
                    }}
                    width={{
                        base: 'full',
                        lg: 'auto',
                    }}
                >

                    {/* Search */}
                    <InputGroup
                        width={{
                            base: 'full',
                            lg: '250px',
                        }}
                    >
                        <InputLeftElement
                            pointerEvents='none'
                            color='gray.300'
                            borderWidth={2}
                            borderColor='gray.100'
                            rounded='full'
                            width='2rem'
                            height='2rem'
                        >
                            <IconSearch size={16} strokeWidth={1.5} />
                        </InputLeftElement>

                        <Input
                            type='search'
                            placeholder='Search'
                            variant='outline'
                            width={{
                                base: 'full',
                                lg: '250px',
                            }}
                            size='sm'
                            rounded='full'
                            bgColor='white'
                            borderWidth={2}
                            borderColor='gray.100'
                            pl={10}
                            fontWeight='medium'
                            _focusVisible={{
                                borderColor: 'gray.200 !important',
                                boxShadow: 'none !important',
                            }}
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </InputGroup>

                    {/* Create button for Desktop */}
                    <Tooltip label='Add new music' placement="left">
                        <IconButton
                            aria-label="Add new music"
                            variant='solid'
                            rounded='full'
                            borderWidth={2}
                            borderColor='gray.100'
                            display={{
                                base: 'none',
                                lg: 'inline-flex',
                            }}
                            size='sm'
                            icon={<IconPlus size={20} />}
                            onClick={() => window.dispatchEvent(new Event('action:modal-open'))}
                        />
                    </Tooltip>
                </Flex>
            </Flex>

            {/* Content */}
            <MusicsTable
                data={data}
                isLoading={isLoading}
                pagination={pagination}
                onPaginate={(pageNumber: number) => setPagination({
                    ...pagination,
                    page: pageNumber,
                    offset: (pageNumber - 1) * pagination.limit,
                })}
                onEdit={(id) => console.log('Edit', id)}
                onDelete={getData}
            />

            <AddMusicPopup />
        </Content>
    )
}

const AddMusicPopup = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [link, setLink] = useState('');
    const [musicDetails, setMusicDetails] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isAddingMusic, setIsAddingMusic] = useState(false);

    useEffect(() => {
        const togglePopup = () => {
            setIsOpen(!isOpen);
            setLink('');
            setMusicDetails({});
            setIsLoading(false);
            setIsAddingMusic(false);
        }

        window.addEventListener('action:modal-open', togglePopup);

        return () => {
            window.removeEventListener('action:modal-open', togglePopup);
        }
    }, [isOpen]);

    useEffect(() => {
        const debounce = setTimeout(() => fetchDetails(), 500);
        return () => clearTimeout(debounce);
    }, [link]);

    const fetchDetails = async (isAdding = false) => {
        if(!isAdding) setIsLoading(true);

        if (!link?.trim()?.length || !isOpen) {
            setIsLoading(false);
            setMusicDetails({});
            return;
        }

        try {
            const response = await fetch({
                endpoint: `/musics${isAdding ? '' : '/details'}`,
                method: 'POST',
                data: {
                    url: link,
                }
            });

            if(isAdding) {
                notify('Music added to library');

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
                                                width={24}
                                                height='auto'
                                                mt={4}
                                                loading='lazy'
                                            />
                                        </Box>

                                        <Button
                                            colorScheme='green'
                                            size='sm'
                                            width='full'
                                            mt={4}
                                            isLoading={isAddingMusic}
                                            loadingText='Adding music...'
                                            disabled={isAddingMusic}
                                            onClick={handleAddMusicToLibrary}
                                        >Add Music</Button>
                                    </Flex>
                                </Flex>
                                : null
                    }
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

export default MusicView;