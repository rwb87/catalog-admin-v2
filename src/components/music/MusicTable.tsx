import { Box, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { IconLoader2 } from "@tabler/icons-react";
import { useState } from "react";
import Pagination from "@/components/Pagination";
import Confirmation from "@/components/Confirmation";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import AddMusicPopup from "./AddMusicPopup";
import MusicTableRow from "./MusicTableRow";

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
                                    : data.map((item: any) => <MusicTableRow
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

export default MusicsTable;