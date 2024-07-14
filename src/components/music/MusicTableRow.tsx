import { MUSIC_PROVIDERS } from "@/_config";
import { Flex, IconButton, Image, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from "@chakra-ui/react";
import { IconExternalLink, IconHanger, IconPlayerPlay, IconPlayerStop, IconSwitch, IconTrash, IconWorldWww } from "@tabler/icons-react";
import { useRef, useState } from "react";
import Avatar from "@/components/Avatar";
import LooksTableRow from "@/components/looks/LooksTableRow";

type TableRowProps = {
    item: any,
    onEdit?: (item: any) => void,
    onDelete: (item: any) => void,
    isLookMusic?: boolean,
}
export default function MusicTableRow({ item, onDelete, isLookMusic = false }: TableRowProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isLooksExpanded, setIsLooksExpanded] = useState<boolean>(false);
    const audioPlayerRef = useRef<HTMLAudioElement>(null);

    const handlePlay = (isExternal: boolean = false) => {
        if(isExternal) return window.open(item?.externalUrl, '_blank');

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

    const handleSwitchTrack = () => {
        window.dispatchEvent(new CustomEvent('modal:add-music', { detail: { music: item } }));
    }

    const handleOnOpenImage = (link: string) => {
        window?.dispatchEvent(new CustomEvent('lightcase', { detail: { image: link } }));
    }

    return (
        <>
            <Tr key={item?.id}>
                <Td>
                    <img
                        src={item?.smallAlbumImage}
                        alt={item?.name}
                        style={{
                            cursor: 'pointer',
                            borderRadius: '0.5rem',
                            width: '7rem',
                            height: '7rem',
                            objectFit: 'cover',
                            borderWidth: 1,
                        }}
                        onClick={() => handleOnOpenImage(item?.largeAlbumImage)}
                    />
                </Td>
                <Td>{item?.artistNames || '-'}</Td>
                <Td>{item?.name || '-'}</Td>
                <Td textAlign='center'>
                    <IconButton
                        aria-label='Preview'
                        colorScheme='gray'
                        variant='solid'
                        size='sm'
                        rounded='full'
                        icon={
                            !item?.previewUrl?.toString()?.trim()?.length
                                ? <IconExternalLink size={20} />
                                : isPlaying
                                    ? <IconPlayerStop fill="#000" size={20} />
                                    : <IconPlayerPlay size={20} />
                        }
                        onClick={() => handlePlay(!item?.previewUrl?.toString()?.trim()?.length ? true : false)}
                    />

                    <audio
                        ref={audioPlayerRef}
                        src={item?.previewUrl}
                        controls={isPlaying}
                        autoPlay={isPlaying}
                        style={{ display: 'none' }}
                        onEnded={() => setIsPlaying(false)}
                        onError={() => setIsPlaying(false)}
                        onPause={() => setIsPlaying(false)}
                    />
                </Td>
                <Td textAlign='center'>
                    <IconButton
                        aria-label='External Link'
                        colorScheme='gray'
                        variant='solid'
                        size='sm'
                        rounded='full'
                        icon={<IconWorldWww size={20} stroke={1.2} />}
                        onClick={() => window.open(item?.externalUrl, '_blank')}
                    />
                </Td>
                {
                    !isLookMusic
                        ? <Td textAlign='center'>
                            <IconButton
                                aria-label='Looks'
                                colorScheme='gray'
                                variant='solid'
                                size='sm'
                                rounded='full'
                                icon={<IconHanger size={22} />}
                                onClick={() => setIsLooksExpanded(!isLooksExpanded)}
                            />
                        </Td>
                        : null
                }
                <Td textAlign='center'>
                    <Image
                        src={MUSIC_PROVIDERS[item?.type?.toUpperCase()]?.logo}
                        alt={item?.type}
                        title={MUSIC_PROVIDERS[item?.type?.toUpperCase()]?.name}
                        width={8}
                        height='auto'
                        loading='lazy'
                        mx='auto'
                    />
                </Td>
                {
                    !isLookMusic
                        ? <Td textAlign='center'>
                            <Flex alignItems='center' gap={2} justifyContent='center'>
                                {
                                    item?.user
                                        ? <Avatar
                                            src={item?.user?.smallPictureURL}
                                            name={item?.user?.username || '-'}
                                            showName={true}
                                            size="2rem"
                                        />
                                    : <Text color='gray.500' fontSize='sm' opacity={0.5} fontStyle='italic'>N/A</Text>
                                }
                            </Flex>
                        </Td>
                        : null
                }
                <Td textAlign='center' color='green.500'>{item?.clickouts || 0}</Td>
                <Td textAlign='right' whiteSpace='nowrap'>
                    {
                        !isLookMusic
                            ? <Tooltip label='Switch track'>
                                <IconButton
                                    aria-label='Switch'
                                    variant='ghost'
                                    colorScheme='gray'
                                    rounded='full'
                                    size='sm'
                                    icon={<IconSwitch size={22} />}
                                    onClick={handleSwitchTrack}
                                />
                            </Tooltip>
                            : null
                    }

                    <IconButton
                        aria-label='Delete'
                        variant='ghost'
                        colorScheme='red'
                        rounded='full'
                        size='sm'
                        ml={4}
                        icon={<IconTrash size={22} />}
                        onClick={() => onDelete?.(item)}
                    />
                </Td>
            </Tr>

            {/* Looks */}
            <Tr display={isLooksExpanded? 'table-row' : 'none'}>
                <Td colSpan={20} p={4} bgColor='gray.50'>
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>Thumbnail</Th>
                                <Th>Creator</Th>
                                <Th textAlign='center'>Created At</Th>
                                <Th textAlign='center'>Platform</Th>
                                <Th textAlign='center'>Featured</Th>
                                <Th textAlign='center'>Priority</Th>
                                <Th textAlign='center' color='blue.500'>Incoming Discovers</Th>
                                <Th textAlign='center'>Status</Th>
                                <Th textAlign='right' color='blue.500'>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {
                                item?.tags?.length && item?.tags?.filter((tag: any) => tag?.look).length
                                    ? item?.tags?.map((tag: any, index: number) => <LooksTableRow
                                        key={index}
                                        item={tag?.look}
                                        isUserChangeAllowed={false}
                                        isResourcesExpandable={false}
                                        showStatus={true}
                                    />)
                                    : <Tr>
                                        <Td colSpan={20} textAlign='center'>
                                            <Text fontStyle='italic' opacity={0.5}>Not featured in any look</Text>
                                        </Td>
                                    </Tr>
                            }
                        </Tbody>
                    </Table>
                </Td>
            </Tr>
        </>
    )
}