import { Box, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { IconLoader2 } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Pagination from "@/components/Pagination";
import Confirmation from "@/components/Confirmation";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import UpdateLocationDrawer from "./UpdateLocationDrawer";
import LocationsTableRow from "./LocationTableRow";

type LocationTableProps = {
    data: any,
    isLoading?: boolean,
    pagination?: any,
    isSelectable?: boolean,
    onSelect?: (item: any) => void,
    onPaginate?: (page: number) => void,
    onDelete?: (item: any) => void,
}
const LocationTable = ({ data, isLoading = false, pagination, isSelectable = false, onSelect, onPaginate, onDelete }: LocationTableProps) => {
    const [deletingData, setDeletingData] = useState<any>({});
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [editingData, setEditingData] = useState<any>({});

    useEffect(() => {
        const openDrawer = () => {
            setEditingData({
                id: Math.random().toString(36).substring(7),
                name: null,
                place: null,
                type: null,
                city: null,
                state: null,
                country: null,
                website: null,
                googleMapsUrl: null,
                appleMapsUrl: null,
                pictureURL: null,
                smallPictureURL: null,
                clickouts: 0,
                isNew: true,
            });
        }

        window?.addEventListener('action:new-location', openDrawer);

        return () => window?.removeEventListener('action:new-location', openDrawer);
    }, []);

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            fetch({
                endpoint: `/locations/${deletingData.id}`,
                method: 'DELETE',
            });

            notify('Location deleted successfully');

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
                            <Th>Place</Th>
                            <Th>Type</Th>
                            <Th>City</Th>
                            <Th>State</Th>
                            <Th>Country</Th>
                            <Th>Lat/Lng</Th>
                            <Th textAlign='center'>Links</Th>
                            <Th textAlign='center'>Looks</Th>
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
                                    : data.map((item: any) => <LocationsTableRow
                                        key={item?.id}
                                        item={item}
                                        isSelectable={isSelectable}
                                        onSelect={onSelect}
                                        onEdit={(item: any) => setEditingData(item)}
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
                text={`Are you sure you want to delete the place <strong>${deletingData?.place}</strong>? You can't undo this action afterwards.`}
                isProcessing={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setDeletingData({})}
            />

            {/* Update Drawer */}
            <UpdateLocationDrawer
                data={editingData}
                onSave={() => {
                    setEditingData({});
                    window.dispatchEvent(new CustomEvent('refresh:data'));
                }}
                onClose={() => setEditingData({})}
            />
        </>
    )
}

export default LocationTable;