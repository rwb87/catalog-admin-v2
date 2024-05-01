import { useGlobalVolatileStorage } from "@/_store";
import Confirmation from "@/components/Confirmation";
import LookPhotos from "@/components/looks/LookPhotos";
import Pagination from "@/components/Pagination";
import LookProducts from "@/components/looks/LookProducts";
import UpdateProductDrawer from "@/components/products/UpdateProductDrawer";
import fetch from "@/helpers/fetch";
import formatDateTime from "@/helpers/formatDateTime";
import notify from "@/helpers/notify";
import { Content } from "@/layouts/app.layout"
import { useAuthGuard } from "@/providers/AuthProvider";
import { Avatar, Box, Button, Flex, Heading, IconButton, Image, Input, Select, Switch, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from "@chakra-ui/react";
import { IconChevronDown, IconLoader2, IconPhoto, IconTrash } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import ChangeCreatorDrawer from "@/components/looks/ChangeCreatorDrawer";

const LooksView = () => {
    const { setBrands: setGlobalBrands } = useGlobalVolatileStorage() as any;
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLive, setIsLive] = useState<boolean>(true);
    const [data, setData] = useState<any>([]);
    const [filteredData, setFilteredData] = useState<any>([]);
    const [search, setSearch] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('createdAt:desc');

    const [editingData, setEditingData] = useState<any>({});
    const [deletingData, setDeletingData] = useState<any>({});
    const [sendingLookDataToManagement, setSendingLookDataToManagement] = useState<any>({});
    const [sendingAllLookDataToManagement, setSendingAllLookDataToManagement] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const [pagination, setPagination] = useState({
        page: 1,
        offset: 0,
        limit: 50,
        total: 0,
    });

    useAuthGuard('auth');

    useEffect(() => {
        getBrands();

        window?.addEventListener('refresh:data', getData);

        return () => window?.removeEventListener('refresh:data', getData);
    }, []);

    useEffect(() => {
        setIsLoading(true);

        getData();
    }, [isLive, pagination.page, sortBy]);

    useEffect(() => {
        if(search?.toString()?.trim() === '') return setFilteredData(data);

        setFilteredData(
            data?.filter((item: any) => {
                return item?.name?.toLowerCase().includes(search?.toLowerCase()) ||
                    item?.link?.toLowerCase().includes(search?.toLowerCase());
            })
        );
    }, [search, data]);

    const getData = async () => {
        const filter = isLive
            ? {
                status: [
                    "denied","live","archived","in_edit"
                ]
            }
            : {
                status: [
                    "submitted_for_approval","in_admin"
                ]
            }
        const sortByString = sortBy?.split(':')[0];
        const orderByString = sortBy?.split(':')[1]?.toUpperCase();
        const finalSortByString = `${sortByString}+${orderByString}`;

        try {
            const response = await fetch({
                endpoint: `/looks?filter=${JSON.stringify(filter)}&sortBy=${finalSortByString}&offset=${pagination?.offset}&limit=${pagination.limit}`,
                method: 'GET',
            });

            setData(response?.looks);
            setPagination({
                ...pagination,
                total: response?.count || 0,
            });
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        // await getProducts();
        // await getBrands();

        setIsLoading(false);
    };

    const getBrands = async () => {
        try {
            const response = await fetch({
                endpoint: '/brands?limit=200',
                method: 'GET',
            });

            setGlobalBrands(response);
        } catch (error: any) {
            setGlobalBrands([]);
        }
    }

    const handleUpdateData = async (data: any, id?: string) => {
        setIsProcessing(true);

        try {
            const response = await fetch({
                endpoint: `/looks/${id || editingData?.id}`,
                method: 'PUT',
                data: {
                    ...data,
                },
            });

            if (response) notify('Look saved successfully', 3000);
            else notify('An error occurred', 3000);

            setEditingData({});
            setSendingLookDataToManagement({});
            setSendingAllLookDataToManagement(false);

            setTimeout(() => getData(), 2000);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsProcessing(false);
    }

    const handleSendLookDataToManagement = async () => {
        const message = document.querySelector('input[name="management-message"]') as HTMLInputElement;
        const messageValue: string = message?.value?.trim();

        setIsProcessing(true);

        try {
            if(messageValue !== '') {
                await fetch({
                    endpoint: `/looks/${sendingLookDataToManagement?.id}/messages`,
                    method: 'POST',
                    data: {
                        message: messageValue,
                    },
                });
            }

            handleUpdateData({
                status: 'in_data_management',
                enabled: false,
                carouselEnabled: false,
            }, sendingLookDataToManagement?.id)
        } catch (error: any) {
            notify('Look sent to management but message could not be sent', 5000);
        }
    }

    const handleSendAllLookDataToManagement = async () => {
        const message = document.querySelector('input[name="management-message-for-all"]') as HTMLInputElement;
        const messageValue: string = message?.value?.trim();

        setIsProcessing(true);

        // Create message
        try {
            await fetch({
                endpoint: `/looks/send-all-to-management`,
                method: 'POST',
                data: {
                    message: messageValue,
                },
            });

            notify('All submitted looks sent to management', 3000);
            setSendingAllLookDataToManagement(false);
            getData();
        } catch (error: any) {
            notify('All submitted looks sent to management but message could not be sent', 5000);
        }
    }

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            const response = await fetch({
                endpoint: `/looks/${deletingData?.id}`,
                method: 'DELETE',
            });

            if (response) notify('Look deleted', 3000);
            else notify('An error occurred', 3000);

            setData(data.filter((user: any) => user.id !== deletingData.id));
            setDeletingData({});
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
            setIsDeleting(false);
        }
    }

    return (
        <Content activePage="Looks">

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
                <h1 className="page-heading">Looks</h1>

                {/* Search and Filter */}
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

                    {/* Sorting */}
                    <Select
                        variant='outline'
                        width={{
                            base: 'full',
                            lg: '200px',
                        }}
                        size='sm'
                        rounded='full'
                        bgColor='white'
                        borderWidth={2}
                        borderColor='gray.100'
                        fontWeight='medium'
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                    >
                        <optgroup label="Priority">
                            <option value='priority:asc'>Low - High</option>
                            <option value='priority:desc'>High - Low</option>
                        </optgroup>
                        <optgroup label="Creation Date">
                            <option value='createdAt:desc'>Newest First</option>
                            <option value='createdAt:asc'>Oldest First</option>
                        </optgroup>
                    </Select>

                    {/* Live / Incoming */}
                    <Select
                        variant='filled'
                        width={{
                            base: 'full',
                            md: '200px',
                        }}
                        size='sm'
                        rounded='full'
                        bgColor='white'
                        borderWidth={2}
                        borderColor='gray.100'
                        fontWeight='medium'
                        value={isLive ? 'in_data_management' : 'submitted_for_approval'}
                        onChange={(event: any) => setIsLive(event.target.value === 'in_data_management')}
                    >
                        <option value="submitted_for_approval">Submitted for Approval</option>
                        <option value="in_data_management">Live</option>
                    </Select>

                    {/* Send all look data to management */}
                    {
                        (!isLive && data?.length > 0) && <Button
                            size='sm'
                            rounded='full'
                            backgroundColor='black'
                            color='white'
                            _hover={{
                                backgroundColor: 'blackAlpha.700',
                            }}
                            _focusVisible={{
                                backgroundColor: 'blackAlpha.800',
                            }}
                            leftIcon={<img
                                src="/icons/icon-send-look-to-management.svg"
                                alt="Change Look"
                                width={24}
                            />}
                            onClick={() => setSendingAllLookDataToManagement(data)}
                        >Send all to management</Button>
                    }
                </Flex>
            </Flex>

            {/* Table */}
            <LooksTable
                data={filteredData}
                pagination={pagination}
                onPaginate={(page: number) => {
                    setPagination({
                        ...pagination,
                        page: page,
                        offset: (page - 1) * pagination.limit,
                    })
                }}
                isLoading={isLoading}
                onSendLookToManagement={(item: any) => setSendingLookDataToManagement(item)}
                onUpdate={(data: any, id: string) => handleUpdateData(data, id)}
                onDelete={(id: string) => setDeletingData(id)}
            />

            {/* Delete Dialog */}
            <Confirmation
                isOpen={!!deletingData?.id}
                text={`Are you sure you want to delete this look? You can't undo this action afterwards.`}
                isProcessing={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setDeletingData({})}
            />

            {/* Send look data to management alert */}
            <Confirmation
                isOpen={!!sendingLookDataToManagement?.id}
                title="Send look data to management"
                html={<Input
                    type="text"
                    placeholder="Message for management (optional)"
                    rounded='md'
                    size='sm'
                    width='full'
                    name='management-message'
                    autoComplete='off'
                />}
                isProcessing={isProcessing}
                cancelText="Cancel"
                confirmText="Send"
                processingConfirmText="Sending..."
                isDangerous={false}
                onConfirm={handleSendLookDataToManagement}
                onCancel={() => setSendingLookDataToManagement({})}
            />

            {/* Send all look data to management alert */}
            <Confirmation
                isOpen={sendingAllLookDataToManagement}
                title="Send all look data to management"
                html={<>
                    <Heading as='h3' size='sm' fontWeight='semibold' mb={4}>Are you sure you want to send all the submitted looks to management?</Heading>

                    <Input
                        type="text"
                        placeholder="Message for management (optional)"
                        rounded='md'
                        size='sm'
                        width='full'
                        name='management-message-for-all'
                        autoComplete='off'
                    />
                </>}
                isProcessing={isProcessing}
                cancelText="Cancel"
                confirmText="Send"
                processingConfirmText="Sending..."
                isDangerous={false}
                onConfirm={handleSendAllLookDataToManagement}
                onCancel={() => setSendingAllLookDataToManagement(false)}
            />
        </Content>
    )
}

type LooksTableProps = {
    data: any,
    pagination: any,
    onPaginate: (page: number) => void,
    isLoading: boolean,
    onSendLookToManagement: (item: any) => void,
    onUpdate: (data: any, id: string) => void,
    onDelete: (item: any) => void,
}
const LooksTable = ({ data, pagination, onPaginate, isLoading, onSendLookToManagement, onUpdate, onDelete }: LooksTableProps) => {
    const isLive = data?.[0]?.status === 'live';
    const [editingData, setEditingData] = useState<any>({});
    const [brand, setBrand] = useState<any>({});

    useEffect(() => {
        const openProductToModify = (event: any) => {
            const { product = null, brand = null } = event.detail;

            if(!product || !brand) return;

            setEditingData(product);
            setBrand(brand);
        }

        window?.addEventListener('action:edit-product', openProductToModify);

        return () => window?.removeEventListener('action:edit-product', openProductToModify);
    }, []);

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
                            <Th>Thumbnail</Th>
                            <Th>Creator</Th>
                            <Th textAlign='center'>Created At</Th>
                            {
                                isLive && <>
                                    <Th textAlign='center'>Platform</Th>
                                    <Th textAlign='center'>Featured</Th>
                                    <Th textAlign='center'>Priority</Th>
                                    <Th textAlign='center' color='blue.500'>Incoming Discovers</Th>
                                </>
                            }
                            <Th textAlign='center'>Actions</Th>
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
                                        isLive={isLive}
                                        onSendLookToManagement={onSendLookToManagement}
                                        onUpdate={onUpdate}
                                        onDelete={onDelete}
                                    />)
                        }
                    </Tbody>
                </Table>
            </Box>

            {/* Update Product */}
            <UpdateProductDrawer
                data={{
                    ...editingData,
                    brand: brand,
                    brandId: brand?.id,
                }}
                onClose={() => setEditingData({})}
                onComplete={() => {
                    window?.dispatchEvent(new CustomEvent('refresh:data'));
                    setEditingData({});
                    setBrand({});
                }}
            />

            {/* Look Creator Change */}
            <ChangeCreatorDrawer />

            {/* Pagination */}
            <Pagination
                total={pagination?.total || 0}
                limit={pagination?.limit || 0}
                page={pagination?.page || 1}
                setPage={onPaginate}
            />
        </>
    )
}

type TableRowProps = {
    item: any,
    isLive: boolean,
    onSendLookToManagement: (item: any) => void,
    onUpdate: (data: any, id: string) => void,
    onDelete: (item: any) => void,
}
const TableRow = ({ item, isLive = true, onSendLookToManagement, onUpdate, onDelete }: TableRowProps) => {
    const [isImagesExpanded, setIsImagesExpanded] = useState<boolean>(false);
    const [isProductsExpanded, setIsProductsExpanded] = useState<boolean>(false);

    const [images, setImages] = useState<any[]>([]);

    const dateTime = useMemo(() => {
        const date = formatDateTime(item?.createdAt, false);
        const time = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        }).format(new Date(item?.createdAt));

        return `${date}, <br /> ${time}`;
    }, [item?.createdAt]);

    const handleExpandImages = () => {
        setIsProductsExpanded(false);

        if(!isImagesExpanded) {
            setImages(item?.photos);
            setIsImagesExpanded(true);
        } else {
            setImages([]);
            setIsImagesExpanded(false);
        }
    }

    const handleExpandProducts = () => {
        setIsImagesExpanded(false);

        setIsProductsExpanded(!isProductsExpanded);
    }

    const handleOpenChangeCreatorDrawer = (item: any) => {
        window?.dispatchEvent(new CustomEvent('drawer:change-creator', {
            detail: {
                look: item,
            }
        }));
    }

    const thumbnailImage = useMemo(() => {
        if(item?.thumbnailImage) return item?.thumbnailImage;

        // Sort the images with orderIndex
        if(item?.photos?.length) {
            const sortedImages = item?.photos.sort((a: any, b: any) => a.orderIndex - b.orderIndex);
            return sortedImages?.find((image: any) => image.croppedLink)?.croppedLink || '/images/cover-placeholder.webp';
        }

        // Return a placeholder image
        return '/images/cover-placeholder.webp';
    }, [item?.thumbnailImage, item?.photos]);

    return (
        <>
            <Tr>
                <Td>
                    {
                        <Box
                            width={20}
                            height={28}
                            position='relative'
                        >
                            <Image
                                src={thumbnailImage}
                                width='full'
                                height='full'
                                objectFit='cover'
                                alt={item?.name}
                                rounded='md'
                                cursor='pointer'
                                loading="lazy"
                                onClick={handleExpandImages}
                                onError={(e: any) => {
                                    e.target.src = '/images/cover-placeholder.webp';
                                    e.target.onerror = null;
                                }}
                            />

                            {item?.photos?.filter((item: any) => item?.deletedAt === null)?.length > 1 && <Box position='absolute' right={1} top={1} pointerEvents='none'><IconPhoto color="white" /></Box>}
                        </Box>
                    }
                </Td>
                <Td>
                    <Button
                        variant='ghost'
                        rounded='full'
                        gap={2}
                        pl={1}
                        pt={1}
                        pb={1}
                        height='auto'
                        fontWeight='normal'
                        onClick={() => handleOpenChangeCreatorDrawer(item)}
                    >
                        <Avatar
                            size='sm'
                            name={item?.user?.username || '-'}
                            src={item?.user?.pictureURL}
                        />
                        <Text>{item?.user?.username || '-'}</Text>
                    </Button>
                </Td>
                <Td textAlign='center' minWidth='150px' dangerouslySetInnerHTML={{ __html: dateTime }} />
                {
                    isLive && <>
                        <Td textAlign='center'>
                            <Switch
                                colorScheme='blue'
                                size='lg'
                                defaultChecked={item?.enabled}
                                onChange={() => onUpdate({
                                    enabled: !item?.enabled,
                                }, item?.id)}
                            />
                        </Td>
                        <Td textAlign='center'>
                            <Switch
                                colorScheme='blue'
                                size='lg'
                                defaultChecked={item?.carouselEnabled}
                                onChange={() => onUpdate({
                                    carouselEnabled: !item?.carouselEnabled,
                                }, item?.id)}
                            />
                        </Td>
                        <Td textAlign='center'>
                            <Input
                                type="number"
                                rounded='full'
                                size='xs'
                                width={20}
                                textAlign='center'
                                defaultValue={item?.priority || 0}
                                onBlur={(e: any) => {
                                    if(parseInt(e.target.value) === parseInt(item?.priority)) return;

                                    onUpdate({
                                        priority: parseInt(e.target.value),
                                    }, item?.id)
                                }}
                            />
                        </Td>
                        <Td textAlign='center' color='blue.500'>{item?.incomingDiscovers || 0}</Td>
                    </>
                }
                <Td textAlign='center' whiteSpace='nowrap'>
                    {/* Send to Management button */}
                    {
                        <Tooltip label="Send look to management" placement="bottom">
                            <IconButton
                                aria-label="Edit"
                                variant='ghost'
                                rounded='full'
                                size='sm'
                                mr={4}
                                backgroundColor='black'
                                _hover={{
                                    backgroundColor: 'blackAlpha.700',
                                }}
                                _focusVisible={{
                                    backgroundColor: 'blackAlpha.800',
                                }}
                                icon={<img
                                    src="/icons/icon-send-look-to-management.svg"
                                    alt="Change Look"
                                    width={24}
                                />}
                                onClick={() => onSendLookToManagement?.(item)}
                            />
                        </Tooltip>
                    }

                    {/* Delete */}
                    <IconButton
                        aria-label='Delete'
                        variant='ghost'
                        colorScheme='red'
                        rounded='full'
                        size='sm'
                        icon={<IconTrash size={22} />}
                        onClick={() => onDelete?.(item)}
                    />

                    {/* Expand Products */}
                    <IconButton
                        aria-label='Expand'
                        variant='ghost'
                        rounded='full'
                        size='sm'
                        backgroundColor='black'
                        color='white'
                        ml={4}
                        _hover={{
                            backgroundColor: 'blackAlpha.700',
                        }}
                        _focusVisible={{
                            backgroundColor: 'blackAlpha.800',
                        }}
                        icon={<IconChevronDown
                            size={22}
                            style={{
                                transition: 'transform 0.15s',
                                transform: isProductsExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                            }}
                        />}
                        onClick={handleExpandProducts}
                    />
                </Td>
            </Tr>

            {/* Photos */}
            <Tr
                display={isImagesExpanded ? 'table-row' : 'none'}
                bgColor='gray.50'
            >
                <Td colSpan={20}>
                    <LookPhotos
                        lookId={item?.id}
                        images={images}
                        onSave={(list: any) => {
                            onUpdate({ photos: list }, item?.id);
                            setIsImagesExpanded(false);
                            setImages([]);
                        }}
                        onCancel={() => {
                            setIsImagesExpanded(false)
                            setImages([]);
                        }}
                    />
                </Td>
            </Tr>

            {/* Products */}
            <Tr
                display={isProductsExpanded ? 'table-row' : 'none'}
                bgColor='gray.50'
            >
                <Td colSpan={20}>
                    <LookProducts
                        look={item}
                        onSave={() => setIsProductsExpanded(false)}
                    />
                </Td>
            </Tr>
        </>
    )
}

export default LooksView;