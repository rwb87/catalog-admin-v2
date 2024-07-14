import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { Button, Flex, IconButton, Image, Input, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { IconCornerDownRight, IconDeviceFloppy, IconEdit, IconHanger, IconLink, IconTrash, IconWorldWww } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LooksTableRow from "@/components/looks/LooksTableRow";

type TableRowProps = {
    item: any,
    isSelectable?: boolean,
    isLookLocation?: boolean,
    onSelect?: (item: any) => void,
    onEdit: (item: any) => void,
    onDelete: (item: any) => void,
}
export default function LocationsTableRow({ item, isSelectable = false, isLookLocation = false, onSelect, onEdit, onDelete }: TableRowProps) {
    const [isLooksExpanded, setIsLooksExpanded] = useState<boolean>(false);
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
                        aria-label='Links'
                        colorScheme='gray'
                        variant='solid'
                        size='sm'
                        rounded='full'
                        icon={<IconLink size={20} />}
                        onClick={() => {
                            if(links === null) {
                                setLinks({
                                    website: item?.website,
                                    google: item?.googleMapsUrl,
                                    apple: item?.appleMapsUrl,
                                })
                            } else setLinks(null);

                        }}
                    />
                </Td>
                {
                    !isLookLocation && <Td textAlign='center'>
                        <IconButton
                            aria-label='Looks'
                            colorScheme='gray'
                            variant='solid'
                            size='sm'
                            rounded='full'
                            icon={<IconHanger size={20} />}
                            onClick={() => setIsLooksExpanded(!isLooksExpanded)}
                        />
                    </Td>
                }
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

            {/* Looks */}
            {
                !isLookLocation && <Tr display={isLooksExpanded? 'table-row' : 'none'}>
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
                                    <Th textAlign='right'>Actions</Th>
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