import { Button, Flex, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import MusicTableRow from "@/components/music/MusicTableRow";
import { IconDeviceFloppy, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";

type LookMusicsProps = {
    data: any,
    lookId: number,
    onSave?: (musics: any) => void
}
export default function LookMusics({ data, lookId, onSave }: LookMusicsProps) {
    const [editedData, setEditedData] = useState<any>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useEffect(() => {
        if(!data?.length) return;

        setEditedData(JSON.parse(JSON.stringify(data)));
    }, [data]);

    useEffect(() => {
        const addNewMusic = (event: any) => {
            const newMusic = event.detail.music;

            setEditedData([...editedData, newMusic]);
        }

        window.addEventListener('action:add-music-to-look', addNewMusic);

        return () => window.removeEventListener('action:add-music-to-look', addNewMusic);
    }, [editedData]);

    const handleSave = async () => {
        if(!editedData?.length) return;

        setIsProcessing(true);

        try {
            const payload = editedData?.map((music: any) => {
                return {
                    id: music?.id,
                    // order: music?.order,
                }
            });

            const response = await fetch({
                endpoint: `/looks/${lookId}/musics`,
                method: 'POST',
                data: payload,
            });

            if(response) {
                notify('Musics list saved successfully');
                onSave?.(editedData);
            } else {
                notify('Error saving musics list');
            }
        } catch (error) {
            console.log(error);
            notify('Error saving musics list');
        }

        setIsProcessing(false);
    }

    return (
        <>
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
                        <Th textAlign='center'>Provider</Th>
                        <Th textAlign='center' color='green.500'>Clickouts</Th>
                        <Th textAlign='right'>Actions</Th>
                    </Tr>
                </Thead>

                <Tbody>
                    {
                        !editedData?.length
                            ? <Tr>
                                <Td colSpan={20} textAlign='center'>
                                    <Text fontStyle='italic' opacity={0.5}>NO RESULT</Text>
                                </Td>
                            </Tr>
                            : editedData.map((item: any) => <MusicTableRow
                                key={item?.id}
                                item={item}
                                isLookMusic={true}
                                onEdit={() => {}}
                                onDelete={(item: any) => setEditedData(editedData.filter((music: any) => music?.id !== item?.id))}
                            />)
                    }
                </Tbody>
            </Table>

            {/* Actions */}
            <Flex
                alignItems='center'
                justifyContent='space-between'
                mt={4}
            >
                <Button
                    variant='solid'
                    colorScheme='green'
                    size='sm'
                    leftIcon={<IconPlus size={20} />}
                    onClick={() => window.dispatchEvent(new CustomEvent('modal:add-music'))}
                >Add Music</Button>

                <Button
                    variant='solid'
                    colorScheme='green'
                    size='sm'
                    leftIcon={<IconDeviceFloppy size={20} />}
                    isLoading={isProcessing}
                    isDisabled={isProcessing}
                    loadingText='Saving...'
                    onClick={handleSave}
                >Save Musics</Button>
            </Flex>
        </>
    )
}