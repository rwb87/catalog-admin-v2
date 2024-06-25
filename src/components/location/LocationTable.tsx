import { Box, Button, Flex, IconButton, Image, Input, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { IconCornerDownRight, IconDeviceFloppy, IconEdit, IconLink, IconLoader2, IconTrash, IconWorldWww, } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Pagination from "@/components/Pagination";
import Confirmation from "@/components/Confirmation";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import UpdateLocationDrawer from "./UpdateLocationDrawer";
import { Link } from "react-router-dom";

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

type TableRowProps = {
    item: any,
    isSelectable?: boolean,
    onSelect?: (item: any) => void,
    onEdit: (item: any) => void,
    onDelete: (item: any) => void,
}
export const TableRow = ({ item, isSelectable = false, onSelect, onEdit, onDelete }: TableRowProps) => {
    const [links, setLinks] = useState<any>(null);

    const handleOpenImage = (link: string) => {
        window?.dispatchEvent(new CustomEvent('lightcase', { detail: { image: link } }));
    }

    return (
        <>
            <Tr key={item?.id}>
                <Td>
                    <Image
                        src={item?.smallPictureURL}
                        alt={item?.name}
                        rounded='lg'
                        width={28}
                        loading='lazy'
                        objectFit='contain'
                        cursor='pointer'
                        onClick={() => handleOpenImage(item?.pictureURL)}
                        onError={(e: any) => {
                            e.target.src = '/images/cover-placeholder.webp';
                            e.target.onerror = null;
                        }}
                    />
                </Td>
                <Td>{item?.place || '-'}</Td>
                <Td>{item?.type || '-'}</Td>
                <Td>{item?.city || '-'}</Td>
                <Td>{item?.state || '-'}</Td>
                <Td>{item?.country || '-'}</Td>
                <Td>
                    <span>Lat: {item?.latitude || <span className="nil">NIL</span>}</span>
                    <br />
                    <span>Lng: {item?.longitude || <span className="nil">NIL</span>}</span>
                </Td>
                <Td textAlign='center'>
                    <IconButton
                        aria-label='Preview'
                        colorScheme='gray'
                        variant='solid'
                        size='sm'
                        rounded='full'
                        icon={<IconLink size={20} />}
                        onClick={() => {
                            setLinks({
                                website: item?.website,
                                google: item?.googleMapsUrl,
                                apple: item?.appleMapsUrl,
                            })
                        }}
                    />
                </Td>
                <Td textAlign='center' color='green.500'>{item?.clickouts || 0}</Td>
                <Td textAlign='right' whiteSpace='nowrap'>
                    {
                        isSelectable
                            ? <>
                                <Button
                                    variant={item?.isSelected ? 'solid' : 'outline'}
                                    colorScheme='green'
                                    size='sm'
                                    rounded='full'
                                    onClick={() => onSelect?.(item)}
                                >{item?.isSelected ? 'Selected' : 'Select'}</Button>
                            </>
                            : <>
                                <IconButton
                                    aria-label="Edit"
                                    variant='ghost'
                                    rounded='full'
                                    size='sm'
                                    icon={<IconEdit size={22} />}
                                    onClick={() => onEdit(item)}
                                />

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
                            </>
                    }
                </Td>
            </Tr>

            {/* Links */}
            {
                links !== null
                    ? <Tr bgColor='gray.50'>
                        <Td colSpan={20}>
                            <LocationLinks
                                links={links || []}
                                locationId={item?.id}
                                onSave={() => {
                                    setLinks(null);
                                    window.dispatchEvent(new CustomEvent('refresh:data'));
                                }}
                                onCancel={() => setLinks(null)}
                            />
                        </Td>
                    </Tr>
                : null
            }
        </>
    )
}

type LocationLinksProps = {
    links: any,
    locationId: number,
    onSave: (links: any) => void,
    onCancel: () => void,

}
const LocationLinks = ({ links, locationId, onSave, onCancel }: LocationLinksProps) => {
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [editedLinks, setEditedLinks] = useState<any>([]);

    useEffect(() => {
        setEditedLinks(JSON.parse(JSON.stringify(links || {})));
    }, [links]);

    const handleSave = async () => {
        setIsProcessing(true);

        try {
            const response = await fetch({
                endpoint: `/locations/${locationId}`,
                method: 'PUT',
                data: {
                    website: editedLinks?.website || null,
                    googleMapsUrl: editedLinks?.google || null,
                    appleMapsUrl: editedLinks?.apple
                }
            });

            if (response) {
                onSave({
                    website: editedLinks?.website,
                    googleMapsUrl: editedLinks?.google,
                    appleMapsUrl: editedLinks?.apple,
                })
                notify('Links saved successfully');
            }
        } catch (error) {
            console.log(error);
            notify('Something went wrong');
        }

        setIsProcessing(false);
    }

    return (
        <>
            <Table>
                <Tbody>

                    {/* Website */}
                    <Tr>
                        <Td width='30px' textAlign='center'>
                            <IconCornerDownRight size={20} />
                        </Td>
                        <Td width='30px' textAlign='center'>
                            <Link
                                to={editedLinks?.website}
                                target='_blank'
                                style={{
                                    pointerEvents: editedLinks?.website ? 'auto' : 'none',
                                }}
                            >
                                <IconWorldWww
                                    size={20}
                                    stroke={1}
                                    style={{
                                        padding: 0,
                                    }}
                                />
                            </Link>
                        </Td>
                        <Td>
                            <Input
                                type='url'
                                placeholder='Website'
                                variant='solid'
                                borderWidth={1}
                                borderColor='gray.100'
                                px={6}
                                size='sm'
                                rounded='full'
                                autoComplete="off"
                                value={editedLinks?.website || ''}
                                onChange={(event: any) => setEditedLinks({ ...editedLinks, website: event.target.value })}
                            />
                        </Td>
                    </Tr>

                    {/* Apple Map */}
                    <Tr>
                        <Td width='30px' textAlign='center'>
                            <IconCornerDownRight size={20} />
                        </Td>
                        <Td width='30px' textAlign='center'>
                            <Link
                                to={editedLinks?.apple}
                                target='_blank'
                                style={{
                                    pointerEvents: editedLinks?.apple ? 'auto' : 'none',
                                }}
                            >
                                <Image
                                    src='/icons/icon-apple-map.png'
                                    alt='Apple Maps'
                                    width={6}
                                    height={6}
                                    objectFit='contain'
                                />
                            </Link>
                        </Td>
                        <Td>
                            <Input
                                type='url'
                                placeholder='Apple Map Link'
                                variant='solid'
                                borderWidth={1}
                                borderColor='gray.100'
                                px={6}
                                size='sm'
                                rounded='full'
                                autoComplete="off"
                                value={editedLinks?.apple || ''}
                                onChange={(event: any) => setEditedLinks({ ...editedLinks, apple: event.target.value })}
                            />
                        </Td>
                    </Tr>

                    {/* Google Map */}
                    <Tr>
                        <Td width='30px' textAlign='center'>
                            <IconCornerDownRight size={20} />
                        </Td>
                        <Td width='30px' textAlign='center'>
                            <Link
                                to={editedLinks?.google}
                                target='_blank'
                                style={{
                                    pointerEvents: editedLinks?.google ? 'auto' : 'none',
                                }}
                            >
                                <Image
                                    src='/icons/icon-google-map.png'
                                    alt='Google Maps'
                                    width={6}
                                    height={6}
                                    objectFit='contain'
                                />
                            </Link>
                        </Td>
                        <Td>
                            <Input
                                type='url'
                                placeholder='Google Map Link'
                                variant='solid'
                                borderWidth={1}
                                borderColor='gray.100'
                                px={6}
                                size='sm'
                                rounded='full'
                                autoComplete="off"
                                value={editedLinks?.google || ''}
                                onChange={(event: any) => setEditedLinks({ ...editedLinks, google: event.target.value })}
                            />
                        </Td>
                    </Tr>
                </Tbody>
            </Table>

            <Flex
                justifyContent='flex-end'
                alignItems='center'
                gap={4}
                mt={4}
            >
                <Button
                    variant='ghost'
                    colorScheme='gray'
                    size='sm'
                    isDisabled={isProcessing}
                    onClick={() => {
                        setEditedLinks([]);
                        onCancel?.();
                    }}
                >Cancel</Button>

                <Button
                    variant='solid'
                    colorScheme='green'
                    size='sm'
                    leftIcon={<IconDeviceFloppy size={20} />}
                    isLoading={isProcessing}
                    isDisabled={isProcessing}
                    loadingText='Saving...'
                    onClick={handleSave}
                >Save Links</Button>
            </Flex>
        </>
    )
}

export default LocationTable;