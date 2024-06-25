import LocationTable, { TableRow as LocationTableRow } from "@/components/location/LocationTable";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { Box, Button, Flex, Input, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { IconDeviceFloppy, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import UpdateLocationDrawer from "@/components/location/UpdateLocationDrawer";
import CustomDrawer from "@/components/Drawer";

type LookLocationsProps = {
    lookId: number,
    data: any,
    onSave: (data: any) => void,
}
export default function LookLocations({ lookId, data, onSave }: LookLocationsProps) {
    const [editedData, setEditedData] = useState<any>([]);
    const [editingData, setEditingData] = useState<any>({});
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isSearching, setIsSearching] = useState<boolean>(false);

    useEffect(() => {
        if (!data?.length) return;

        setEditedData(JSON.parse(JSON.stringify(data || [])));
    }, [data]);

    const handleAddNewLocation = () => {
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

    const handleSave = async () => {
        if(!editedData?.length) return;

        setIsProcessing(true);

        try {
            const payload = editedData?.map((location: any) => {
                return {
                    id: location?.id,
                    // order: location?.order,
                }
            });

            const response = await fetch({
                endpoint: `/looks/${lookId}/locations`,
                method: 'POST',
                data: payload,
            });

            if(response) {
                notify('Locations list saved successfully');
                onSave?.(editedData);
                setEditedData([]);
            } else {
                notify('Error saving locations list');
            }
        } catch (error) {
            console.log(error);
            notify('Error saving locations list');
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
                        <Th>Place</Th>
                        <Th>Type</Th>
                        <Th>City</Th>
                        <Th>State</Th>
                        <Th>Country</Th>
                        <Th>Lat/Lng</Th>
                        <Th textAlign='center'>Links</Th>
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
                            : editedData.map((item: any) => <LocationTableRow
                                key={item?.id}
                                item={item}
                                onEdit={(item: any) => setEditingData(item)}
                                onDelete={(item: any) => setEditedData(editedData.filter((location: any) => location?.id !== item?.id))}
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
                    onClick={() => setIsSearching(true)}
                >Add Location</Button>

                <Button
                    variant='solid'
                    colorScheme='green'
                    size='sm'
                    leftIcon={<IconDeviceFloppy size={20} />}
                    isLoading={isProcessing}
                    isDisabled={isProcessing}
                    loadingText='Saving...'
                    onClick={handleSave}
                >Save List</Button>
            </Flex>

            {/* Search and add location */}
            <SearchAndAddLocationDrawer
                isOpen={isSearching}
                onClose={(item?: any, openCreateDrawer?: boolean) => {
                    setIsSearching(false)

                    if(openCreateDrawer) handleAddNewLocation();

                    if(item) {
                        if(editedData?.find((location: any) => location?.id === item?.id)) notify('Location already added');
                        else setEditedData([...editedData, item]);
                    }
                }}
            />

            {/* Update Drawer */}
            <UpdateLocationDrawer
                data={editingData}
                onSave={(item: any) => {
                    const doesExist = editedData?.find((location: any) => location?.id === item?.id);

                    if(doesExist) {
                        setEditedData(editedData.map((location: any) => {
                            if(location?.id === item?.id) return item;
                            else return location;
                        }))
                    } else {
                        setEditedData([...editedData, item]);
                    }
                }}
                onClose={() => setEditingData({})}
            />
        </>
    )
}

type SearchAndAddLocationDrawerProps = {
    isOpen: boolean,
    onClose: (item?: any, openCreateDrawer?: boolean) => void,
}
const SearchAndAddLocationDrawer = ({ isOpen, onClose }: SearchAndAddLocationDrawerProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState([]);

    useEffect(() => {
        if(!isOpen) return;

        setSearchTerm('');
    }, [isOpen]);

    useEffect(() => {
        if(!isOpen) return;

        setIsLoading(true);

        const debounce = setTimeout(() => getData(), 500);
        return () => clearTimeout(debounce);
    }, [searchTerm, isOpen]);

    const getData = async () => {
        setIsLoading(true);

        try {
            const response = await fetch({
                endpoint: `/locations?search=${searchTerm}&offset=0&limit=50`,
                method: 'GET',
            });

            setData(response?.locations);
        } catch (error) {
            console.log(error);
        }

        setIsLoading(false);
    }

    const handleSelect = (item: any) => {
        onClose(item, false);
    }

    return (
        <CustomDrawer
            isOpen={isOpen}
            title='Search location'
            placement="bottom"
            onClose={() => onClose?.()}
        >
            <Flex
                direction='row'
                alignItems='center'
                gap={4}
            >
                <Input
                    type="text"
                    placeholder='Search location...'
                    onChange={(e: any) => setSearchTerm(e?.target?.value)}
                />

                <Button
                    variant='solid'
                    colorScheme='blue'
                    leftIcon={<IconPlus size={20} />}
                    onClick={() => onClose(null, true)}
                >Create Location</Button>
            </Flex>

            <Box mt={4}>
                <LocationTable
                    data={data}
                    isLoading={isLoading}
                    isSelectable={true}
                    onSelect={handleSelect}
                />
            </Box>
        </CustomDrawer>
    )
}