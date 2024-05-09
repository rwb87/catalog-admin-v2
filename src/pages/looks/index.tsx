import { useGlobalVolatileStorage } from "@/_store";
import Confirmation from "@/components/Confirmation";
import Pagination from "@/components/Pagination";
import UpdateProductDrawer from "@/components/products/UpdateProductDrawer";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { Content } from "@/layouts/app.layout"
import { useAuthGuard } from "@/providers/AuthProvider";
import { Box, Button, Flex, Heading, Input, InputGroup, InputLeftElement, Select, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { IconLoader2, IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import ChangeCreatorDrawer from "@/components/looks/ChangeCreatorDrawer";
import LooksTableRow from "@/components/looks/LooksTableRow";

const LooksView = () => {
    const { setBrands: setGlobalBrands } = useGlobalVolatileStorage() as any;
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLive, setIsLive] = useState<boolean>(true);
    const [data, setData] = useState<any>([]);
    const [filteredData, setFilteredData] = useState<any>([]);
    const [search, setSearch] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('createdAt:desc');

    const [sendingAllLookDataToManagement, setSendingAllLookDataToManagement] = useState<boolean>(false);
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

        setData([]);
        setFilteredData([]);

        getData();
    }, [isLive, pagination.page, sortBy]);

    useEffect(() => {
        if(search?.trim() !== '') setIsLoading(true);

        const debounce = setTimeout(() => getData(), 500);
        return () => clearTimeout(debounce);
    }, [search]);

    const getData = async () => {
        const filter = isLive
            ? {
                status: [
                    "denied","live","archived","in_edit"
                ],
            }
            : {
                status: [
                    "submitted_for_approval","in_admin"
                ],
            }
        const sortByString = sortBy?.split(':')[0];
        const orderByString = sortBy?.split(':')[1]?.toUpperCase();
        const finalSortByString = `${sortByString}+${orderByString}`;

        try {
            const response = await fetch({
                endpoint: `/looks?filter=${JSON.stringify(filter)}&search=${search?.trim()}&sortBy=${finalSortByString}&offset=${pagination?.offset}&limit=${pagination.limit}`,
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
                            lg: '200px',
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
                data={data}
                pagination={pagination}
                onPaginate={(page: number) => {
                    setPagination({
                        ...pagination,
                        page: page,
                        offset: (page - 1) * pagination.limit,
                    })
                }}
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
        </Content>
    )
}

type LooksTableProps = {
    data: any,
    pagination: any,
    onPaginate: (page: number) => void,
    isLoading: boolean,
}
const LooksTable = ({ data, pagination, onPaginate, isLoading }: LooksTableProps) => {
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