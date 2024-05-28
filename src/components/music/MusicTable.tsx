import { Avatar, Box, Flex, IconButton, Image, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from "@chakra-ui/react";
import { IconExternalLink, IconLoader2, IconPlayerPlay, IconPlayerStop, IconSwitch, IconTrash, IconWorldWww } from "@tabler/icons-react";
import { useRef, useState } from "react";
import Pagination from "@/components/Pagination";
import { MUSIC_PROVIDERS } from "@/_config";
import Confirmation from "@/components/Confirmation";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import AddMusicPopup from "./AddMusicPopup";

type MusicsTableProps = {
    data: any,
    isLoading: boolean,
    pagination?: any,
    onPaginate?: (page: number) => void,
    onEdit: (item: any) => void,
    onDelete: (item: any) => void,
}
const MusicsTable = ({ data, isLoading, pagination, onPaginate, onDelete }: MusicsTableProps) => {
    const [deletingData, setDeletingData] = useState<any>({});
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            fetch({
                endpoint: `/musics/${deletingData.id}`,
                method: 'DELETE',
            });

            notify('Music deleted successfully');

            setDeletingData({});
            setIsDeleting(false);

            onDelete?.(deletingData);
        } catch (error) {
            console.log(error);
            notify('Something went wrong');
        }
    }

    return (
        <>

            {/* Table */}
            <Box className="table-responsive">
                <Table
                    variant='simple'
                    colorScheme="gray"
                >
                    <Thead>
                        <Tr>
                            <Th>Image</Th>
                            <Th>Artist</Th>
                            <Th>Name</Th>
                            <Th textAlign='center'>Preview</Th>
                            <Th textAlign='center'>Link</Th>
                            <Th textAlign='center'>Products</Th>
                            <Th textAlign='center'>Provider</Th>
                            <Th textAlign='center'>Added By</Th>
                            <Th textAlign='center' color='green.500'>Clickouts</Th>
                            <Th textAlign='right'>Actions</Th>
                        </Tr>
                    </Thead>

                    <Tbody>
                        {
                            isLoading
                                ? <Tr>
                                    <Td colSpan={20} textAlign='center'>
                                        <Box display='inline-block' mx='auto'>
                                            <IconLoader2
                                                size={48}
                                                className="animate-spin"
                                            />
                                        </Box>
                                    </Td>
                                </Tr>
                                : !data?.length
                                    ? <Tr>
                                        <Td colSpan={20} textAlign='center'>
                                            <Text fontStyle='italic' opacity={0.5}>NO RESULT</Text>
                                        </Td>
                                    </Tr>
                                    : data.map((item: any) => <TableRow
                                        key={item?.id}
                                        item={item}
                                        onEdit={() => {}}
                                        onDelete={(item: any) => setDeletingData(item)}
                                    />)
                        }
                    </Tbody>
                </Table>
            </Box>

            {/* Pagination */}
            <Pagination
                total={pagination?.total || 0}
                limit={pagination?.limit || 0}
                page={pagination?.page || 0}
                setPage={(page: number) => onPaginate?.(page)}
            />

            {/* Delete Dialog */}
            <Confirmation
                isOpen={!!deletingData?.id}
                text={`Are you sure you want to delete <strong>${deletingData?.name}</strong> by <strong>${deletingData?.artistNames}</strong>? You can't undo this action afterwards.`}
                isProcessing={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setDeletingData({})}
            />

            {/* Add Music Popup */}
            <AddMusicPopup />
        </>
    )
}

type TableRowProps = {
    item: any,
    onEdit: (item: any) => void,
    onDelete: (item: any) => void,
}
const TableRow = ({ item, onDelete }: TableRowProps) => {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
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

    return (
        <>
            <Tr key={item?.id}>
                <Td>
                    <Image
                        src={item?.smallAlbumImage}
                        alt={item?.name}
                        rounded='lg'
                        width={28}
                        height={28}
                        loading='lazy'
                        objectFit='cover'
                        borderWidth={1}
                        borderStyle='solid'
                        borderColor='gray.100'
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
                        aria-label='Preview'
                        colorScheme='gray'
                        variant='solid'
                        size='sm'
                        rounded='full'
                        icon={<IconWorldWww size={20} stroke={1.2} />}
                        onClick={() => window.open(item?.externalUrl, '_blank')}
                    />
                </Td>
                <Td textAlign='center'>
                    <IconButton
                        aria-label='Preview'
                        colorScheme='gray'
                        variant='solid'
                        size='sm'
                        rounded='full'
                        icon={<svg viewBox="0 0 24 22" width={14} xmlns="http://www.w3.org/2000/svg"><path d="m4.638 10.828v10.416h14.881v-10.416h3.72v-8.4342l-1.6889-0.42378-3.0653-0.77015c-0.5918-0.14863-1.2168-0.27653-1.9717-0.40581l-1.6993-0.28967-0.7107 1.5659c-0.179 0.38647-0.4648 0.71368-0.8237 0.94299s-0.776 0.35115-1.2019 0.35115-0.8429-0.12184-1.2018-0.35115c-0.359-0.22931-0.6448-0.55652-0.8238-0.94299l-0.7079-1.5659-1.7 0.27653c-0.74387 0.12997-1.3827 0.25648-1.9717 0.40581l-3.0654 0.76668-1.6889 0.43692v8.4342l3.7201 0.0034zm-1.4878-6.6941 3.0654-0.76669c0.59524-0.14863 1.2015-0.26754 1.8044-0.37193 0.35592 0.77745 0.92764 1.4363 1.6472 1.8983s1.5566 0.70751 2.4116 0.70751 1.6921-0.24557 2.4116-0.70751c0.7196-0.46194 1.2913-1.1208 1.6472-1.8983 0.6063 0.10439 1.2091 0.21915 1.8044 0.37193l3.0646 0.76669v4.4639h-2.2316c-0.3946 0-0.773 0.15674-1.052 0.43575-0.279 0.279-0.4357 0.65741-0.4357 1.0519v8.9265h-10.417v-8.9278c0-0.39461-0.15674-0.77302-0.43575-1.052-0.27901-0.279-0.65742-0.43575-1.052-0.43575h-2.2323v-4.4625z" fill="currentColor"/></svg>}
                    />
                </Td>
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
                <Td textAlign='center'>
                    <Flex alignItems='center' gap={2} justifyContent='center'>
                        <Avatar
                            size='sm'
                            name={item?.user?.username || '-'}
                            src={item?.user?.smallPictureURL}
                        />
                        <Text>{item?.user?.username || '-'}</Text>
                    </Flex>
                </Td>
                <Td textAlign='center' color='green.500'>{item?.clickouts || 0}</Td>
                <Td textAlign='right' whiteSpace='nowrap'>
                    <Tooltip label='Switch track'>
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
        </>
    )
}

export default MusicsTable;