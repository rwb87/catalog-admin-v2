import { useGlobalVolatileStorage, useUser } from "@/_store";
import Confirmation from "@/components/Confirmation";
import Pagination from "@/components/Pagination";
import UpdateProductDrawer from "@/components/products/UpdateProductDrawer";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { Content } from "@/layouts/app.layout"
import { useAuthGuard } from "@/providers/AuthProvider";
import { Box, Button, Flex, Heading, IconButton, Input, InputGroup, InputLeftElement, Select, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from "@chakra-ui/react";
import { ArrowDownIcon, ArrowUpIcon } from '@chakra-ui/icons';
import { IconLoader2, IconPlus, IconSearch } from "@tabler/icons-react";
import { useEffect, useState, useMemo } from "react";
import ChangeCreatorDrawer from "@/components/looks/ChangeCreatorDrawer";
import LooksTableRow from "@/components/looks/LooksTableRow";
import { LOOK_STATUSES } from "@/_config";
import AddMusicPopup from "@/components/music/AddMusicPopup";

const LooksView = () => {
    const { user } = useUser() as any;
    const { setBrands: setGlobalBrands } = useGlobalVolatileStorage() as any;
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [filter, setFilter] = useState<string>('');
    const [data, setData] = useState<any>([]);
    const [search, setSearch] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('createdAt:desc');

    const [sendingAllLookDataToManagement, setSendingAllLookDataToManagement] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const [isCreatingNewLook, setIsCreatingNewLook] = useState<boolean>(false);

    const [pagination, setPagination] = useState({
        page: 1,
        offset: 0,
        limit: 50,
        total: 0,
    });

    useAuthGuard('auth');

    useEffect(() => {
        getBrands();

        setFilter(LOOK_STATUSES.LIVE);
    }, []);

    useEffect(() => {
        setIsLoading(true);

        setData([]);

        getData();

        window?.addEventListener('refresh:data', getData);

        return () => window?.removeEventListener('refresh:data', getData);
    }, [filter, pagination.page, sortBy]);

    useEffect(() => {
        if(search?.trim() !== '') setIsLoading(true);

        const debounce = setTimeout(() => getData(), 500);
        return () => clearTimeout(debounce);
    }, [search]);

    const getData = async () => {
        if(!filter) return;

        const urlFilter = { status: [filter] };

        const sortByString = sortBy?.split(':')[0];
        const orderByString = sortBy?.split(':')[1]?.toUpperCase();
        const finalSortByString = `${sortByString}+${orderByString}`;

        try {
            const response = await fetch({
                endpoint: `/looks?filter=${JSON.stringify(urlFilter)}&search=${search?.trim()}&sortBy=${finalSortByString}&offset=${pagination?.offset}&limit=${pagination.limit}`,
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

            notify('New look created successfully', 3000);
            setFilter(LOOK_STATUSES.IN_EDIT);
        } catch (error: any) {
            notify(error?.response?.data?.message || error?.message, 3000);
        }

        setIsCreatingNewLook(false);
        setIsProcessing(false);
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
                        onChange={(event: any) => setFilter(event.target.value)}
                    >
                        <option value={LOOK_STATUSES.LIVE}>Live</option>
                        <option value={LOOK_STATUSES.SUBMITTED_FOR_APPROVAL}>Incoming</option>
                        <option value={LOOK_STATUSES.IN_EDIT}>In Edit</option>
                    </Select>

                    {/* Search */}
                    <InputGroup
                        width={{
                            base: 'full',
                            lg: '250px',
                        }}
                    >
                        <InputLeftElement
                            pointerEvents='none'
                            color='gray.300'
                            borderWidth={2}
                            borderColor='gray.100'
                            rounded='full'
                            width='2rem'
                            height='2rem'
                        >
                            <IconSearch size={16} strokeWidth={1.5} />
                        </InputLeftElement>

                        <Input
                            type='search'
                            placeholder='Search for creators...'
                            variant='outline'
                            width={{
                                base: 'full',
                                lg: '250px',
                            }}
                            size='sm'
                            rounded='full'
                            bgColor='white'
                            borderWidth={2}
                            borderColor='gray.100'
                            pl={10}
                            fontWeight='medium'
                            _focusVisible={{
                                borderColor: 'gray.200 !important',
                                boxShadow: 'none !important',
                            }}
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </InputGroup>

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
                setSortBy={setSortBy}
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
    const [editingData, setEditingData] = useState<any>({});
    const [brand, setBrand] = useState<any>({});
    const [sortByPriority, setSortByPriority] = useState<string>('');
    const [sortByCreateAt, setSortByCreateAt] = useState<string>('');
    const [sortByFeatured, setSortByFeatured] = useState<string>('');

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
                                    : data.map((item: any) => <LooksTableRow
                                        key={item?.id}
                                        item={item}
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
                onSave={() => {
                    window?.dispatchEvent(new CustomEvent('refresh:data'));
                    setEditingData({});
                    setBrand({});
                }}
            />

            {/* Look Creator Change */}
            <ChangeCreatorDrawer />

            {/* Add music popup */}
            <AddMusicPopup
                onComplete={(music: any) => window.dispatchEvent(new CustomEvent('action:add-music-to-look', { detail: { music } }))}
            />

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

export default LooksView;