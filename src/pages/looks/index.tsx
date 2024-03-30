import Confirmation from "@/components/Confirmation";
import DragDropResetPosition from "@/components/DragDropResetPositions";
import Pagination from "@/components/Pagination";
import fetch from "@/helpers/fetch";
import formatDateTime from "@/helpers/formatDateTime";
import notify from "@/helpers/notify";
import { Content } from "@/layouts/app.layout"
import { useAuthGuard } from "@/providers/AuthProvider";
import { Avatar, Box, Button, Flex, IconButton, Image, Input, InputGroup, InputLeftElement, Select, Switch, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from "@chakra-ui/react";
import { IconArrowDown, IconArrowUp, IconChevronDown, IconCornerDownRight, IconLoader2, IconPhoto, IconPlus, IconSearch, IconTrash, IconUnlink, IconWorldWww } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const LooksView = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLive, setIsLive] = useState<boolean>(true);
    const [data, setData] = useState<any>([]);
    const [products, setProducts] = useState<any>([]);
    const [filteredData, setFilteredData] = useState<any>([]);
    const [search, setSearch] = useState<string>('');

    const [editingData, setEditingData] = useState<any>({});
    const [deletingData, setDeletingData] = useState<any>({});
    const [sendingLookDataToManagement, setSendingLookDataToManagement] = useState<any>({});
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const [pagination, setPagination] = useState({
        page: 1,
        offset: 0,
        limit: 15,
        total: 0,
    });

    useAuthGuard('auth');

    useEffect(() => {
        getProducts();
    }, []);

    useEffect(() => {
        setIsLoading(true);

        getData();
    }, [isLive, pagination.page]);

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

        try {
            const response = await fetch({
                endpoint: `/looks?filter=${JSON.stringify(filter)}&offset=${pagination?.offset}&limit=${pagination.limit}`,
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

    const handleUpdateData = async (data: any, id?: string) => {
        setIsProcessing(true);

        console.log(data);

        setIsProcessing(false);
        return

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
            getData();
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsProcessing(false);
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
                justifyContent='space-between'
                alignItems='center'
                mb={16}
            >
                {/* Page Heading */}
                <Flex gap={2} alignItems='center'>
                    <h1 className="page-heading">Looks</h1>

                    <Select
                        ml={4}
                        variant='filled'
                        width='200px'
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
                </Flex>

                {/* Search and Actions */}
                <Flex display='none' gap={2} alignItems='center'>
                    <InputGroup>
                        <InputLeftElement
                            pointerEvents='none'
                            color='gray.300'
                            borderWidth={2}
                            borderColor='gray.100'
                            rounded='full'
                        >
                            <IconSearch size={16} strokeWidth={1.5} />
                        </InputLeftElement>

                        <Input
                            type='search'
                            placeholder='Search'
                            variant='outline'
                            width='300px'
                            rounded='full'
                            bgColor='white'
                            borderWidth={2}
                            borderColor='gray.100'
                            pl={12}
                            fontWeight='medium'
                            _focusVisible={{
                                borderColor: 'gray.200 !important',
                                boxShadow: 'none !important',
                            }}
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </InputGroup>
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
                handleUpdateDirectly={(id: string, data: any) => handleUpdateData(data, id)}
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
                />}
                isProcessing={isProcessing}
                cancelText="Cancel"
                confirmText="Send"
                processingConfirmText="Sending..."
                isDangerous={false}
                onConfirm={() => {
                    const message = document.querySelector('input[name="management-message"]') as HTMLInputElement;
                    const messageValue: string = message?.value?.trim();

                    handleUpdateData({
                        status: 'in_data_management',
                        messages: [messageValue],
                    }, sendingLookDataToManagement?.id)
                }}
                onCancel={() => setSendingLookDataToManagement({})}
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
    handleUpdateDirectly: (id: string, data: any) => void,
    onDelete: (item: any) => void,
}
const LooksTable = ({ data, pagination, products, onPaginate, isLoading, onSendLookToManagement, handleUpdateDirectly, onDelete }: LooksTableProps) => {
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
                                    <Th textAlign='center'>Catalog</Th>
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
                                        handleUpdateDirectly={handleUpdateDirectly}
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
    handleUpdateDirectly: (id: string, data: any) => void,
    onDelete: (item: any) => void,
}
const TableRow = ({ item, isLive = true, onSendLookToManagement, handleUpdateDirectly, onDelete }: TableRowProps) => {
    const [isImagesExpanded, setIsImagesExpanded] = useState<boolean>(false);
    const [isProductsExpanded, setIsProductsExpanded] = useState<boolean>(false);
    const [images, setImages] = useState<any[]>([]);

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
                                    cursor='pointer'
                                    rounded='md'
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
                <Td textAlign='center'>{formatDateTime(item?.createdAt) || '-'}</Td>
                {
                    isLive && <>
                        <Td textAlign='center'>
                            <Switch
                                colorScheme='blue'
                                size='md'
                                defaultChecked={item?.enabled}
                                onChange={() => handleUpdateDirectly(item?.id, {
                                    enabled: !item?.enabled,
                                })}
                            />
                        </Td>
                        <Td textAlign='center'>
                            <Switch
                                colorScheme='blue'
                                size='md'
                                defaultChecked={item?.carouselEnabled}
                                onChange={() => handleUpdateDirectly(item?.id, {
                                    carouselEnabled: !item?.carouselEnabled,
                                })}
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

                                    handleUpdateDirectly(item?.id, {
                                        priority: parseInt(e.target.value),
                                    })
                                }}
                            />
                        </Td>
                        <Td textAlign='center' color='blue.500'>{item?.incomingDiscovers || 0}</Td>
                    </>
                }
                <Td textAlign='center'>
                    <Flex justifyContent='center' alignItems='center' gap={4}>

                        {/* Send to Management button */}
                        {
                            !isLive && <Tooltip label="Send look to management" placement="bottom">
                                <IconButton
                                    aria-label="Edit"
                                    variant='ghost'
                                    rounded='full'
                                    size='sm'
                                    backgroundColor='black'
                                    _hover={{
                                        backgroundColor: 'blackAlpha.700',
                                    }}
                                    _focusVisible={{
                                        backgroundColor: 'blackAlpha.800',
                                    }}
                                    icon={<img
                                        src="/icons/icon-look-change.svg"
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
                    </Flex>
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
                            handleUpdateDirectly(item?.id, { photos: list });
                            setIsImagesExpanded(false);
                        }}
                        onCancel={() => setIsImagesExpanded(false)}
                    />
                </Td>
            </Tr>

            {/* Products */}
            <Tr
                display={isProductsExpanded ? 'table-row' : 'none'}
                bgColor='gray.50'
            >
                <Td colSpan={20}>
                    <Table>
                        <Tbody>
                            {
                                item?.tags?.map((tag: any, index: number) => <Tr key={index}>
                                    <Td width='30px' textAlign='left'>
                                        <IconCornerDownRight size={20} />
                                    </Td>
                                    <Td>

                                        {
                                            tag?.item?.pictureURL
                                                ? <Image
                                                    src={tag?.item?.pictureURL}
                                                    width={20}
                                                    height={28}
                                                    objectFit='cover'
                                                    rounded='md'
                                                    alt={tag?.item?.name}
                                                    loading="lazy"
                                                    onError={(e: any) => {
                                                        e.target.src = '/images/cover-placeholder.webp';
                                                        e.target.onerror = null;
                                                    }}
                                                />
                                                : '-'
                                        }
                                    </Td>
                                    <Td width={40}>{tag?.item?.brand?.name || '-'}</Td>
                                    <Td>{tag?.item?.name || '-'}</Td>
                                    <Td>{tag?.item?.style || '-'}</Td>
                                    <Td textAlign='center'>
                                        {
                                            tag?.item?.link
                                                ? <a
                                                    href={['http', 'https'].includes(tag?.item?.link?.substr(0, 4))? tag?.item?.link : `http://${tag?.item?.link}`}
                                                    target='_blank'
                                                    style={{ display: 'inline-grid', placeSelf: 'center' }}
                                                ><IconWorldWww size={26} strokeWidth={1.2} /></a>
                                                : '-'
                                        }
                                    </Td>
                                    <Td textAlign='center'>
                                        <Text>Price: <strong>${parseFloat(tag?.item?.price || 0)?.toFixed(2)}</strong></Text>
                                        { tag?.item?.dealPrice ? <Text>Deal Price: <strong>${parseFloat(tag?.item?.dealPrice)?.toFixed(2)}</strong></Text> : null }
                                    </Td>
                                    <Td textAlign='center' color='green.500'>{tag?.item?.clickouts || 0}</Td>
                                    <Td textAlign='right'>
                                        <IconButton
                                            aria-label='Move Up'
                                            variant='ghost'
                                            colorScheme='blue'
                                            rounded='full'
                                            size='sm'
                                            icon={<IconArrowUp size={22} />}
                                        />

                                        <IconButton
                                            aria-label='Move Down'
                                            variant='ghost'
                                            colorScheme='blue'
                                            rounded='full'
                                            size='sm'
                                            ml={4}
                                            icon={<IconArrowDown size={22} />}
                                        />

                                        <IconButton
                                            aria-label='Delete'
                                            variant='ghost'
                                            colorScheme='red'
                                            rounded='full'
                                            size='sm'
                                            ml={4}
                                            icon={<IconTrash size={22} />}
                                        />
                                    </Td>
                                </Tr>
                            )}
                        </Tbody>
                    </Table>

                    {/* Actions */}
                    <Flex alignItems='center' justifyContent='space-between' mt={4}>
                        <Button
                            variant='solid'
                            colorScheme='green'
                            size='sm'
                            leftIcon={<IconPlus size={20} />}
                        >Add Product</Button>

                        <Button
                            variant='solid'
                            colorScheme='green'
                            size='sm'
                        >Save Products List</Button>
                    </Flex>
                </Td>
            </Tr>
        </>
    )
}

export default LooksView;