import AddMusicPopup from "@/components/music/AddMusicPopup";
import ProductsTable from "@/components/products/ProductsTable";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import sortData from "@/helpers/sorting";
import { encodeAmpersand } from "@/helpers/utils";
import { Content } from "@/layouts/app.layout"
import { useAuthGuard } from "@/providers/AuthProvider";
import { Divider, Flex, IconButton, Input, InputGroup, InputLeftElement, Select, Text, Tooltip } from "@chakra-ui/react";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const ProductsView = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [data, setData] = useState<any>([]);
    const [search, setSearch] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('createdAt,desc');

    const location = useLocation();
    const isManagement = location.pathname.includes('management');
    const pageName = isManagement ? 'Products Management' : 'Products';

    const [pagination, setPagination] = useState({
        page: 1,
        offset: 0,
        limit: 50,
        total: 0,
    });

    useAuthGuard('auth');

    // Reset the whole page when the URL changes
    useEffect(() => {
        setIsLoading(true);
        setData([]);
        setSearch('');
        setSortBy('createdAt,desc');
        setPagination({
            page: 1,
            offset: 0,
            limit: 50,
            total: 0,
        });
        getData();
    }, [location]);

    useEffect(() => {
        setIsLoading(true);

        getData();

        window?.addEventListener('refresh:data', getData);

        return () => window?.removeEventListener('refresh:data', getData);
    }, [sortBy, pagination.page]);

    useEffect(() => {
        const debounce = setTimeout(() => getData(), 500);
        return () => clearTimeout(debounce);
    }, [search]);

    const getData = async () => {
        try {
            const response = await fetch({
                endpoint: `/items?offset=${pagination?.offset}&limit=${pagination.limit}&search=${encodeAmpersand(search)}&order=${sortBy}`,
                method: 'GET',
            });

            // Sort by createdAt
            const sortedData = sortData(response?.items, sortBy);

            setData(sortedData);
            setPagination({
                ...pagination,
                total: response?.count || 0,
            });
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsLoading(false);
    }

    const totalClickouts = useMemo(() => {
        return data.reduce((acc: number, item: any) => acc + (item?.clickouts || 0), 0);
    }, [data]);

    const proudctAlters = useMemo(() => {
        if (!data) return 0;

        return data?.reduce((acc: number, item: any) => acc + (item?.alters || 0), 0);
    }, [data]);

    return (
        <Content activePage={pageName}>

            {/* Search and Options */}
            <Flex
                direction={{
                    base: 'column',
                    xl: 'row',
                }}
                justifyContent='space-between'
                alignItems={{
                    base: 'flex-start',
                    xl: 'center',
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
                    direction={{
                        base: 'column',
                        xl: 'row',
                    }}
                    alignItems={{
                        base: 'flex-start',
                        xl: 'center',
                    }}
                    width={{
                        base: 'full',
                        xl: 'auto',
                    }}
                    gap={2}
                >
                    <Flex
                        display={{
                            base: 'flex',
                            lg: 'contents',
                        }}
                        width='full'
                        direction='row'
                        alignItems='center'
                        justifyContent='space-between'
                    >
                        <h1 className="page-heading">{pageName}</h1>

                        {/* Create button for Mobile */}
                        <IconButton
                            aria-label="Add new brand"
                            variant='solid'
                            rounded='full'
                            borderWidth={2}
                            borderColor='gray.100'
                            display={{
                                base: 'inline-flex',
                                lg: 'none',
                            }}
                            size='sm'
                            icon={<IconPlus size={20} />}
                            onClick={() => window?.dispatchEvent(new CustomEvent('action:product-drawer', { detail: { product: {} } }))}
                        />
                    </Flex>

                    {/* Link Type and Class */}
                    <Flex
                        display='none'
                        width='full'
                        gap={2}
                    >
                        {/* Link Type */}
                        <Select
                            variant='outline'
                            width={{
                                base: 'full',
                                xl: '120px',
                            }}
                            size='sm'
                            rounded='full'
                            bgColor='white'
                            borderWidth={2}
                            borderColor='gray.100'
                            fontWeight='medium'
                        >
                            <option value='GAAN'>GAAN</option>
                            <option value='CREATOR-AFFILIATE'>⭐ Creator Affiliate</option>
                            <option value='BASIC'>Basic</option>
                        </Select>

                        {/* Link Class */}
                        <Select
                            variant='outline'
                            width={{
                                base: 'full',
                                xl: '120px',
                            }}
                            size='sm'
                            rounded='full'
                            bgColor='white'
                            borderWidth={2}
                            borderColor='gray.100'
                            fontWeight='medium'
                        >
                            <option value='ALPHA'>👑 Alpha</option>
                            <option value='BACKUP'>Backup</option>
                        </Select>
                    </Flex>

                    {/* Clickouts */}
                    <Flex
                        alignItems='center'
                        gap={2}
                        width={{
                            base: 'full',
                            xl: 'auto',
                        }}
                    >
                        <Select
                            variant='outline'
                            width={{
                                base: 'full',
                                xl: '120px',
                            }}
                            size='sm'
                            rounded='full'
                            bgColor='white'
                            borderWidth={2}
                            borderColor='gray.100'
                            fontWeight='medium'
                        >
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="this week">This Week</option>
                            <option value="this month">This Month</option>
                            <option value=''>All Time</option>
                        </Select>

                        <Divider orientation='vertical' height='20px' />

                        <Text
                            color='green.500'
                            fontWeight='bold'
                            fontSize={{
                                base: '10px',
                                '2xl': '12px',
                            }}
                            whiteSpace='nowrap'
                        >Clickouts: {totalClickouts || 0}</Text>

                        <Divider orientation='vertical' height='20px' />

                        <Text
                            color='red.500'
                            fontWeight='bold'
                            fontSize={{
                                base: '10px',
                                '2xl': '12px',
                            }}
                            whiteSpace='nowrap'
                        >Alerts: {proudctAlters || 0}</Text>
                    </Flex>
                </Flex>

                {/* Search and Actions */}
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
                        xl: 'auto',
                    }}
                >

                    {/* Sorting */}
                    <Select
                        variant='outline'
                        width={{
                            base: 'full',
                            xl: '200px',
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
                        <optgroup label="Product Name">
                            <option value='name,asc'>A - Z</option>
                            <option value='name,desc'>Z - A</option>
                        </optgroup>
                        <optgroup label="Price">
                            <option value='price,asc'>Low - High</option>
                            <option value='price,desc'>High - Low</option>
                        </optgroup>
                        <optgroup label="Deal Price">
                            <option value='dealPrice,asc'>Low - High</option>
                            <option value='dealPrice,desc'>High - Low</option>
                        </optgroup>
                        <optgroup label="Creation Date">
                            <option value='createdAt,desc'>Newest First</option>
                            <option value='createdAt,asc'>Oldest First</option>
                        </optgroup>
                    </Select>

                    {/* Search */}
                    <InputGroup
                        width={{
                            base: 'full',
                            xl: '250px',
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
                            placeholder='Search'
                            variant='outline'
                            width='full'
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

                    {/* Create button for Desktop */}
                    <Tooltip label='Add new product' placement="left">
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
                            onClick={() => window?.dispatchEvent(new CustomEvent('action:product-drawer', { detail: { product: {} } }))}
                        />
                    </Tooltip>
                </Flex>
            </Flex>

            {/* Table */}
            <ProductsTable
                data={data}
                isLoading={isLoading}
                pagination={pagination}
                onPaginate={(page: number) => {
                    setPagination({
                        ...pagination,
                        page: page,
                        offset: (page - 1) * pagination.limit,
                    })
                }}
            />

            {/* Add music popup */}
            <AddMusicPopup
                onComplete={(music: any) => window.dispatchEvent(new CustomEvent('action:add-music-to-look', { detail: { music } }))}
            />
        </Content>
    )
}

export default ProductsView;