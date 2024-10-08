import { useGlobalVolatileStorage, useUser } from "@/_store";
import Confirmation from "@/components/Confirmation";
import Pagination from "@/components/Pagination";
import UpdateProductDrawer from "@/components/products/UpdateProductDrawer";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { Content } from "@/layouts/app.layout"
import { useAuthGuard } from "@/providers/AuthProvider";
import { Box, Button, Flex, Heading, IconButton, Input, Select, Switch, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from "@chakra-ui/react";
import { ArrowDownIcon, ArrowUpIcon } from '@chakra-ui/icons';
import { IconLoader2, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import LooksTableRow from "@/components/looks/LooksTableRow";
import { LOOK_STATUSES } from "@/_config";
import AddMusicPopup from "@/components/music/AddMusicPopup";
import { useSearchParams } from "react-router-dom";
import SearchBox from "@/components/SearchBox";

const LooksView = () => {
    const { user } = useUser() as any;
    const { setBrands: setGlobalBrands } = useGlobalVolatileStorage() as any;

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [data, setData] = useState<any>([]);

    const [sendingAllLookDataToManagement, setSendingAllLookDataToManagement] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const [isCreatingNewLook, setIsCreatingNewLook] = useState<boolean>(false);

    const [pagination, setPagination] = useState({
        page: 1,
        offset: 0,
        limit: 50,
        total: 0,
    });

    // Search params
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search') || '',
        filter = searchParams.get('filter') || LOOK_STATUSES.LIVE,
        sortBy = searchParams.get('sort') || 'createdAt:desc',
        featured = searchParams.get('featured') || '';

    useAuthGuard('auth');

    useEffect(() => {
        getBrands();
    }, []);

    useEffect(() => {
        setIsLoading(true);

        setData([]);

        getData();

        window?.addEventListener('refresh:data', getData);

        return () => window?.removeEventListener('refresh:data', getData);
    }, [search, filter, pagination.page, sortBy, featured]);

    const getData = async () => {
        if(!filter) return;

        const sortByString = sortBy?.split(':')[0];
        const orderByString = sortBy?.split(':')[1]?.toUpperCase();
        const finalSortByString = `${sortByString} ${orderByString}`;

        try {
            const response = await fetch({
                endpoint: `/looks`,
                method: 'GET',
                params: {
                    filter: JSON.stringify({
                        status: [filter],
                        carouselEnabled: featured === 'true' ? true : undefined
                    }),
                    search: search?.trim(),
                    sortBy: finalSortByString,
                    offset: pagination?.offset,
                    limit: pagination.limit,
                }
            });

            setData(response?.looks);
            setPagination({
                ...pagination,
                total: response?.count || 0,
            });
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message);
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

            notify('All submitted looks sent to management');
            setSendingAllLookDataToManagement(false);
            getData();
        } catch (error: any) {
            notify('All submitted looks sent to management but message could not be sent');
        }
    }

    const handleCreateNewLook = async () => {
        setIsProcessing(true);

        try {
            await fetch({
                endpoint: '/looks',
                method: 'POST',
                data: {
                    status: LOOK_STATUSES.IN_EDIT,
                    enabled: false,
                    userId: user?.id,
                },
            });

            notify('New look created successfully');
            handleUpdateSearchParams('filter', LOOK_STATUSES.IN_EDIT);
        } catch (error: any) {
            notify(error?.response?.data?.message || error?.message);
        }

        setIsCreatingNewLook(false);
        setIsProcessing(false);
    }

    const handleUpdateSearchParams = (key: string, value: string) => {
        setSearchParams({
            ...Object.fromEntries(searchParams),
            [key]: value,
        });
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
                <Flex
                    direction='row'
                    gap={4}
                    alignItems='center'
                    justifyContent='space-between'
                    width={{
                        base: 'full',
                        lg: 'auto',
                    }}
                >
                    <h1 className="page-heading">Looks</h1>

                    <Flex
                        gap={2}
                        alignItems='center'
                    >
                        <Switch
                            size={{
                                base: 'sm',
                                lg: 'md',
                                '2xl': 'lg',
                            }}
                            defaultChecked={featured && featured === 'true'}
                            onChange={() => {
                                setIsLoading(true);
                                setTimeout(() => {
                                    handleUpdateSearchParams('featured', featured === 'true' ? 'false' : 'true')
                                }, 10);
                            }}
                        />

                        <label>{featured && featured === 'true' ? 'Featured' : 'All'}</label>
                    </Flex>
                </Flex>

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
                        onChange={(event) => handleUpdateSearchParams('sort', event.target.value)}
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
                        textTransform='capitalize'
                        value={filter}
                        onChange={(event: any) => {
                            setIsLoading(true);
                            handleUpdateSearchParams('filter', event.target.value)
                        }}
                    >
                        <option value={LOOK_STATUSES.LIVE}>Live</option>
                        <option value={LOOK_STATUSES.SUBMITTED_FOR_APPROVAL}>Incoming</option>
                        <option value={LOOK_STATUSES.IN_EDIT}>In Edit</option>
                    </Select>

                    {/* Search */}
                    <SearchBox
                        value={search}
                        onChange={(value: string) => handleUpdateSearchParams('search', value)}
                    />

                    {/* Send all look data to management */}
                    {
                        (filter === LOOK_STATUSES.SUBMITTED_FOR_APPROVAL && data?.length > 0) && <Button
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
                                className="image-as-icon"
                            />}
                            onClick={() => setSendingAllLookDataToManagement(data)}
                        >Send all to management</Button>
                    }

                    {/* Create button for Desktop */}
                    <Tooltip label='Add new look' placement="left">
                        <IconButton
                            aria-label="Add new product"
                            variant='solid'
                            rounded='full'
                            borderWidth={2}
                            borderColor='gray.100'
                            display={{
                                base: 'none',
                                lg: 'inline-flex',
                            }}
                            size='sm'
                            icon={<IconPlus size={20} />}
                            onClick={() => setIsCreatingNewLook(true)}
                        />
                    </Tooltip>
                </Flex>
            </Flex>

            {/* Table */}
            <LooksTable
                data={data}
                pagination={pagination}
                onPaginate={(page: number) => {
                    setPagination({
                        ...pagination,
                        page: page,
                        offset: (page - 1) * pagination.limit,
                    })
                }}
                setSortBy={(field: string) => handleUpdateSearchParams('sort', field)}
                isLoading={isLoading}
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

            {/* Create new look alert */}
            <Confirmation
                isOpen={isCreatingNewLook}
                title="Confirmation"
                text="If you click <strong>Continue</strong>, a new look will be created and you can add products and photos to it. The look will have the status <strong>in edit</strong> and will not be visible to the public until you publish it. Are you sure you want to continue?"
                isProcessing={isProcessing}
                cancelText="Cancel"
                confirmText="Continue"
                processingConfirmText="Creating..."
                isDangerous={false}
                onConfirm={handleCreateNewLook}
                onCancel={() => setIsCreatingNewLook(false)}
            />
        </Content>
    )
}

type LooksTableProps = {
    data: any,
    pagination: any,
    onPaginate: (page: number) => void,
    isLoading: boolean,
    setSortBy: (field: string) => void
}
const LooksTable = ({ data, pagination, onPaginate, isLoading, setSortBy }: LooksTableProps) => {
    const isLive = data?.[0]?.status === LOOK_STATUSES.LIVE;
    const [sortByPriority, setSortByPriority] = useState<string>('');
    const [sortByCreateAt, setSortByCreateAt] = useState<string>('');
    const [sortByFeatured, setSortByFeatured] = useState<string>('');

    const sortByCreateAtHandler = () => {
        if (sortByCreateAt === "desc"){
            setSortBy('createdAt:asc');
            setSortByCreateAt('asc');
        }
        if (sortByCreateAt === "" || sortByCreateAt === "asc"){
            setSortBy('createdAt:desc');
            setSortByCreateAt('desc');
        }
        setSortByPriority('');
        setSortByFeatured('');
    };

    const sortByPriorityHandler = () => {
        if (sortByPriority === "desc"){
            setSortBy('priority:asc');
            setSortByPriority('asc');
        }
        if (sortByPriority === "" || sortByPriority === "asc"){
            setSortBy('priority:desc');
            setSortByPriority('desc');
        }
        setSortByCreateAt('');
        setSortByFeatured('');
    };

    const sortByFeaturedHandler = () => {
        if (sortByFeatured === "desc"){
            setSortBy('carouselEnabled:asc');
            setSortByFeatured('asc');
        }
        if (sortByFeatured === "" || sortByFeatured === "asc"){
            setSortBy('carouselEnabled:desc');
            setSortByFeatured('desc');
        }
        setSortByCreateAt('');
        setSortByPriority('');
    };

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
                            <Th textAlign='center' onClick={() => sortByCreateAtHandler()} cursor="pointer">
                                Created At
                                {sortByCreateAt ? sortByCreateAt === 'desc' ? <ArrowUpIcon boxSize={6} ml={1}/> : <ArrowDownIcon boxSize={6} ml={1}/> :<></>}
                            </Th>
                            {
                                isLive && <>
                                    <Th textAlign='center'>Platform</Th>
                                    <Th textAlign='center' onClick={() => sortByFeaturedHandler()} cursor="pointer">
                                        Featured
                                        {sortByFeatured ? sortByFeatured === 'desc' ? <ArrowUpIcon boxSize={6} ml={1}/> : <ArrowDownIcon boxSize={6} ml={1}/> :<></>}
                                    </Th>
                                    <Th textAlign='center' onClick={() => sortByPriorityHandler()} cursor="pointer">
                                        Priority
                                        {sortByPriority ? sortByPriority === 'desc' ? <ArrowUpIcon boxSize={6} ml={1}/> : <ArrowDownIcon boxSize={6} ml={1}/> :<></>}
                                    </Th>
                                    <Th textAlign='center'>Splash Index</Th>
                                    <Th textAlign='center' color='blue.500'>Incoming Discovers</Th>
                                </>
                            }
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
                                    : data.map((item: any, index: number) => <LooksTableRow
                                        key={item?.id || index}
                                        item={item}
                                    />)
                        }
                    </Tbody>
                </Table>
            </Box>

            {/* Update product drawer */}
            <UpdateProduct />

            {/* Add music popup */}
            <AddMusicPopup onComplete={(music: any, lookId: number) => window.dispatchEvent(new CustomEvent('action:add-music-to-look', { detail: { music, lookId } }))} />

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

const UpdateProduct = () => {
    const [editingData, setEditingData] = useState<any>({});
    const [brand, setBrand] = useState<any>({});

    useEffect(() => {
        const openProductToModify = (event: any) => {
            const { product = null, brand = null } = event.detail;

            if(!product) return;

            setEditingData(product);
            setBrand(brand);
        }

        window?.addEventListener('action:edit-product', openProductToModify);

        return () => window?.removeEventListener('action:edit-product', openProductToModify);
    }, []);

    return (
        <UpdateProductDrawer
            data={{
                ...editingData,
                brand: brand,
                brandId: brand?.id,
            }}
            onClose={() => setEditingData({})}
            onSave={() => {
                window?.dispatchEvent(new CustomEvent('refresh:data'));
                setEditingData({});
                setBrand({});
            }}
        />
    )
}

export default LooksView;