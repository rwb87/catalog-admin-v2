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
import { Avatar, Box, Button, Divider, Flex, IconButton, Image, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Text, Tooltip } from "@chakra-ui/react";
import { IconChevronDown, IconLoader2, IconMessage, IconPhoto, IconTrash } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import ChangeCreatorDrawer from "@/components/looks/ChangeCreatorDrawer";

const LooksManagementView = () => {
    const { setBrands: setGlobalBrands } = useGlobalVolatileStorage() as any;
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [data, setData] = useState<any>([]);
    const [filteredData, setFilteredData] = useState<any>([]);
    const [search, setSearch] = useState<string>('');

    const [editingData, setEditingData] = useState<any>({});
    const [deletingData, setDeletingData] = useState<any>({});
    const [sendingLookDataToManagement, setSendingLookDataFromManagement] = useState<any>({});
    const [sendingToLive, setSendingToLive] = useState<any>({});
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
    }, [pagination.page]);

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
        const filter = {
            status: [
                "in_data_management",
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
            setSendingLookDataFromManagement({});
            setSendingToLive({});

            setTimeout(() => getData(), 2000);
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
        <Content activePage="Looks Management">

            {/* Search and Options */}
            <Flex
                justifyContent='space-between'
                alignItems='center'
                mb={{
                    base: 4,
                    md: 8,
                    xl: 16,
                }}
            >
                {/* Page Heading */}
                <Flex gap={2} alignItems='center'>
                    <h1 className="page-heading">Looks Management</h1>
                </Flex>
            </Flex>

            {/* Table */}
            <LooksManagementTable
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
                onSendLookFromManagement={(item: any) => setSendingLookDataFromManagement(item)}
                onSendToLive={(item: any) => setSendingToLive(item)}
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

            {/* Send look data to back to admin alert */}
            <Confirmation
                isOpen={!!sendingLookDataToManagement?.id}
                text="Are you sure you want to send this look back to admin?"
                isProcessing={isProcessing}
                cancelText="Cancel"
                confirmText="Send"
                processingConfirmText="Sending..."
                isDangerous={false}
                onConfirm={() => {
                    handleUpdateData({
                        status: 'submitted_for_approval',
                    }, sendingLookDataToManagement?.id)
                }}
                onCancel={() => setSendingLookDataFromManagement({})}
            />

            {/* Send to live alert */}
            <Confirmation
                isOpen={!!sendingToLive?.id}
                text="Are you sure you want to send this look to live?"
                isProcessing={isProcessing}
                cancelText="Cancel"
                confirmText="Send"
                processingConfirmText="Sending..."
                isDangerous={false}
                onConfirm={() => {
                    handleUpdateData({
                        status: 'live',
                    }, sendingToLive?.id)
                }}
                onCancel={() => setSendingToLive({})}
            />
        </Content>
    )
}

type LooksManagementTableProps = {
    data: any,
    pagination: any,
    onPaginate: (page: number) => void,
    isLoading: boolean,
    onSendLookFromManagement: (item: any) => void,
    onSendToLive: (item: any) => void,
    onUpdate: (data: any, id: string) => void,
    onDelete: (item: any) => void,
}
const LooksManagementTable = ({ data, pagination, onPaginate, isLoading, onSendLookFromManagement, onSendToLive, onUpdate, onDelete }: LooksManagementTableProps) => {
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
            <Flex
                direction='column'
                bgColor='white'
                rounded='md'
                borderWidth={1}
                borderColor='gray.100'
                overflowX='auto'
                width='full'
            >
                {
                    isLoading
                        ? <Box display='inline-block' mx='auto' my={6}>
                            <IconLoader2
                                size={48}
                                className="animate-spin"
                            />
                        </Box>
                        : !data?.length
                            ? <Text fontStyle='italic' opacity={0.5} textAlign='center' my={6}>NO RESULT</Text>
                            : data?.map((item: any, index: number) => <TableRow
                                key={item?.id}
                                item={item}
                                isLastItem={index === data.length - 1}
                                onSendLookFromManagement={onSendLookFromManagement}
                                onSendToLive={onSendToLive}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                            />)
                }
            </Flex>

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
    isLastItem: boolean,
    onSendLookFromManagement: (item: any) => void,
    onSendToLive: (item: any) => void,
    onUpdate: (data: any, id: string) => void,
    onDelete: (item: any) => void,
}
const TableRow = ({ item, isLastItem, onSendLookFromManagement, onSendToLive, onUpdate, onDelete }: TableRowProps) => {
    const [isImagesExpanded, setIsImagesExpanded] = useState<boolean>(false);
    const [isProductsExpanded, setIsProductsExpanded] = useState<boolean>(false);

    const [images, setImages] = useState<any[]>([]);

    const adminMessages = useMemo(() => {
        return item?.messages.sort((a: any, b: any) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }) || [];
    }, [item?.messages]);

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
        <Box minWidth='1024px'>
            <Flex
                gap={20}
                justifyContent='space-between'
                alignItems='center'
                borderBottomWidth={isLastItem ? 0 : 1}
                borderColor='gray.100'
                p={4}
                width='full'
            >

                {/* Images and Creator */}
                <Flex gap={10} alignItems='center'>
                    {/* Images */}
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

                    {/* Creator */}
                    <Flex alignItems='center' gap={2}>
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
                    </Flex>
                </Flex>

                {/* Actions */}
                <Flex gap={4} alignItems='center' whiteSpace='nowrap'>
                    <Button
                        size='md'
                        colorScheme='green'
                        onClick={() => onSendToLive?.(item)}
                    >Send Live</Button>

                    {/* Message */}
                    <Popover>
                        <PopoverTrigger>
                            <Box position='relative'>
                                <IconButton
                                    aria-label="Message"
                                    icon={<IconMessage size={22} />}
                                    size='sm'
                                    variant='solid'
                                    colorScheme='orange'
                                    rounded='full'
                                />

                                {
                                    item?.messages?.length
                                        ? <Box position='absolute' right={-2} top={-2} pointerEvents='none'>
                                            <Text
                                                fontSize='xs'
                                                fontWeight='bold'
                                                color='white'
                                                bgColor='orange.700'
                                                width={5}
                                                height={5}
                                                display='inline-grid'
                                                placeContent='center'
                                                rounded='full'
                                                lineHeight={1}
                                            >{adminMessages?.length}</Text>
                                        </Box>
                                        : null
                                }
                            </Box>
                        </PopoverTrigger>
                        <PopoverContent>
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverHeader>Messages from Admin</PopoverHeader>
                            <PopoverBody>
                                {
                                    adminMessages?.length
                                        ? adminMessages?.map((message: any, index: number) => <Box key={index}>
                                            <Text fontSize='sm' fontWeight='semibold'>{message?.message}</Text>
                                            <Text fontSize='xs' opacity={0.5}>{formatDateTime(message?.createdAt)}</Text>

                                            {index === adminMessages?.length - 1 ? null : <Divider my={1} />}
                                        </Box>)
                                        : <Text fontSize='sm' fontStyle='italic' opacity={0.5}>No message</Text>
                                }
                            </PopoverBody>
                        </PopoverContent>
                    </Popover>

                    {/* Send back to admin */}
                    <Tooltip label="Send look back to admin" placement="bottom">
                        <IconButton
                            aria-label="Edit"
                            variant='ghost'
                            rounded='full'
                            size='sm'
                            backgroundColor='orange'
                            _hover={{
                                backgroundColor: 'orange.600',
                            }}
                            _focusVisible={{
                                backgroundColor: 'orange.700',
                            }}
                            icon={<img
                                src="/icons/icon-send-look-back-from-management.svg"
                                alt="Change Look"
                                width={24}
                            />}
                            onClick={() => onSendLookFromManagement?.(item)}
                        />
                    </Tooltip>

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

                    {/* Expand */}
                    {
                        <IconButton
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
            </Flex>

            {/* Images */}
            <Box
                bgColor='gray.100'
                display={isImagesExpanded ? 'block' : 'none'}
                p={4}
            >
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
            </Box>

            {/* Products */}
            <Box
                bgColor='gray.50'
                display={isProductsExpanded ? 'block' : 'none'}
                p={4}
            >
                <LookProducts
                    look={item}
                    onSave={() => {
                        setIsProductsExpanded(false);
                    }}
                />
            </Box>
        </Box>
    )
}

export default LooksManagementView;