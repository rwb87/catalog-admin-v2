import { useGlobalData } from "@/_store";
import Confirmation from "@/components/Confirmation";
import DragDropResetPosition from "@/components/DragDropResetPositions";
import Pagination from "@/components/Pagination";
import LookProducts from "@/components/looks/LookProducts";
import fetch from "@/helpers/fetch";
import formatDateTime from "@/helpers/formatDateTime";
import notify from "@/helpers/notify";
import sortData from "@/helpers/sorting";
import { Content } from "@/layouts/app.layout"
import { useAuthGuard } from "@/providers/AuthProvider";
import { Avatar, Box, Button, Flex, IconButton, Image, Input, Select, Switch, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from "@chakra-ui/react";
import { IconChevronDown, IconLoader2, IconPhoto, IconTrash, IconUnlink } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

const LooksView = () => {
    const { setBrands } = useGlobalData() as any;

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLive, setIsLive] = useState<boolean>(true);
    const [data, setData] = useState<any>([]);
    const [products, setProducts] = useState<any>([]);
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
        setIsLoading(true);

        getProducts();
        getBrands();
    }, []);

    useEffect(() => {
        setIsLoading(true);

        getData();
    }, [isLive, pagination.page, sortBy, products]);

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
        if(!products?.length) return setIsLoading(false);

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

            const looks = response?.looks?.map((look: any) => {
                const tags = look?.tags?.map((tag: any) => {
                    return tag.item = products?.find((product: any) => product?.id === tag?.itemId);
                });

                return {
                    ...look,
                    tags,
                }
            });

            setData(looks);
            setPagination({
                ...pagination,
                total: response?.count || 0,
            });
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsLoading(false);
    };

    const getProducts = async () => {
        try {
            const response = await fetch({
                endpoint: `/items`,
                method: 'GET',
            });

            setProducts(response);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }
    }

    const getBrands = async () => {
        try {
            const response = await fetch({
                endpoint: `/brands`,
                method: 'GET',
            });

            const sortedData = sortData(response, 'name.ASC');

            setBrands(sortedData);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
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
            getData();
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

        // Create message
        if(messageValue !== '') {
            try {
                await fetch({
                    endpoint: `/looks/${sendingLookDataToManagement?.id}/messages`,
                    method: 'POST',
                    data: {
                        message: messageValue,
                    },
                });

                handleUpdateData({
                    status: 'in_data_management',
                    enabled: false,
                    carouselEnabled: false,
                }, sendingLookDataToManagement?.id)
            } catch (error: any) {
                notify('Look sent to management but message could not be sent', 7000);
            }
        }
    }

    const handleSendAllLookDataToManagement = async () => {
        const message = document.querySelector('input[name="management-message-for-all"]') as HTMLInputElement;
        const messageValue: string = message?.value?.trim();

        setIsProcessing(true);

        // Create message
        if(messageValue !== '') {
            try {
                filteredData.forEach(async (item: any) => {
                    await fetch({
                        endpoint: `/looks/${item?.id}/messages`,
                        method: 'POST',
                        data: {
                            message: messageValue,
                        },
                    });

                    handleUpdateData({
                        status: 'in_data_management',
                        enabled: false,
                        carouselEnabled: false,
                    }, item?.id);
                });
            } catch (error: any) {
                notify('All submitted looks sent to management but message could not be sent', 7000);
            }
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
                products={products}
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
                html={<Input
                    type="text"
                    placeholder="Message for management (optional)"
                    rounded='md'
                    size='sm'
                    width='full'
                    name='management-message-for-all'
                    autoComplete='off'
                />}
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
    products: any,
    onPaginate: (page: number) => void,
    isLoading: boolean,
    onSendLookToManagement: (item: any) => void,
    onUpdate: (data: any, id: string) => void,
    onDelete: (item: any) => void,
}
const LooksTable = ({ data, pagination, products, onPaginate, isLoading, onSendLookToManagement, onUpdate, onDelete }: LooksTableProps) => {
    const isLive = data?.[0]?.status === 'live';

    const reconstructedData = data;

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
                                : !reconstructedData?.length
                                    ? <Tr>
                                        <Td colSpan={20} textAlign='center'>
                                            <Text fontStyle='italic' opacity={0.5}>NO RESULT</Text>
                                        </Td>
                                    </Tr>
                                    : reconstructedData.map((item: any) => <TableRow
                                        key={item?.id}
                                        item={item}
                                        isLive={isLive}
                                        products={products}
                                        onSendLookToManagement={onSendLookToManagement}
                                        onUpdate={onUpdate}
                                        onDelete={onDelete}
                                    />)
                        }
                    </Tbody>
                </Table>
            </Box>

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
    products: any,
    onSendLookToManagement: (item: any) => void,
    onUpdate: (data: any, id: string) => void,
    onDelete: (item: any) => void,
}
const TableRow = ({ item, isLive = true, products, onSendLookToManagement, onUpdate, onDelete }: TableRowProps) => {
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

    return (
        <>
            <Tr>
                <Td>
                    {
                        item?.thumbnailImage
                            ? <Box
                                width={20}
                                height={28}
                                position='relative'
                            >
                                <Image
                                    src={item?.thumbnailImage}
                                    width='full'
                                    height='full'
                                    objectFit='cover'
                                    alt={item?.name}
                                    rounded='md'
                                    cursor='pointer'
                                    loading="lazy"
                                    onClick={handleExpandImages}
                                />

                                {item?.photos?.length > 1 && <Box position='absolute' right={1} top={1} pointerEvents='none'><IconPhoto color="white" /></Box>}
                            </Box>
                            : <IconUnlink size={26} />
                    }
                </Td>
                <Td textAlign='center'>
                    <Flex alignItems='center' gap={2}>
                        <Avatar
                            size='sm'
                            name={item?.user?.username || '-'}
                            src={item?.user?.pictureURL}
                        />
                        <Text>{item?.user?.username || '-'}</Text>
                    </Flex>
                </Td>
                <Td textAlign='center' minWidth='150px' dangerouslySetInnerHTML={{ __html: dateTime }} />
                {
                    isLive && <>
                        <Td textAlign='center'>
                            <Switch
                                colorScheme='blue'
                                size='md'
                                defaultChecked={item?.enabled}
                                onChange={() => onUpdate({
                                    enabled: !item?.enabled,
                                }, item?.id)}
                            />
                        </Td>
                        <Td textAlign='center'>
                            <Switch
                                colorScheme='blue'
                                size='md'
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
                        !isLive && <Tooltip label="Send look to management" placement="bottom">
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
                    {
                        isLive && <IconButton
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
                    }
                </Td>
            </Tr>

            {/* Photos */}
            <Tr
                display={isImagesExpanded ? 'table-row' : 'none'}
                bgColor='gray.50'
            >
                <Td colSpan={20}>
                    <DragDropResetPosition
                        images={images}
                        onSave={(list: any) => {
                            onUpdate({ photos: list }, item?.id);
                            setIsImagesExpanded(false);
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
                        lookProducts={item?.tags}
                        allProducts={products}
                        onSave={(list: any) => setIsProductsExpanded(false)}
                    />
                </Td>
            </Tr>
        </>
    )
}

export default LooksView;