import { PRODUCT_REVIEW_OPTIONS } from "@/_config";
import AddMusicPopup from "@/components/music/AddMusicPopup";
import ProductsTable from "@/components/products/ProductsTable";
import SearchBox from "@/components/SearchBox";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import sortData from "@/helpers/sorting";
import { encodeAmpersand } from "@/helpers/utils";
import { Content } from "@/layouts/app.layout"
import { useAuthGuard } from "@/providers/AuthProvider";
import { Divider, Flex, IconButton, Select, Text, Tooltip } from "@chakra-ui/react";
import { IconPlus, } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

const ProductsView = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [data, setData] = useState<any>([]);

    const location = useLocation();
    const [lastLocation, setLastLocation] = useState(location.pathname);
    const isManagement = location.pathname.includes('management');
    const pageName = isManagement ? 'Products Management' : 'Products';

    const [pagination, setPagination] = useState({
        page: 1,
        offset: 0,
        limit: 50,
        total: 0,
    });

    // Search params
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search') || '',
        sortBy = searchParams.get('sort') || 'createdAt,desc',
        filterReviewStatusBy = searchParams.get('review-status') || '';

    useAuthGuard('auth');

    // Reset the whole page when url changes from '/product/management' to '/product' and vice versa
    useEffect(() => {
        if(lastLocation === location.pathname) return;

        setLastLocation(location.pathname);
        setIsLoading(true);
        setData([]);
        handleUpdateSearchParams('search', '');
        handleUpdateSearchParams('sort', 'createdAt,desc');
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
    }, [search, sortBy, pagination.page, filterReviewStatusBy]);

    const getData = async () => {

        // Filters
        const reviewStatus = filterReviewStatusBy ? `reviewStatus=${filterReviewStatusBy}` : '';

        try {
            const response = await fetch({
                endpoint: `/items?offset=${pagination?.offset}&limit=${pagination.limit}&search=${encodeAmpersand(search)}&order=${sortBy}&${reviewStatus}`,
                method: 'GET',
            });

            // Sort by createdAt
            let sortedData = sortData(response?.items, sortBy);

            if(filterReviewStatusBy) sortedData = sortedData.filter((item: any) => item?.reviewStatus === filterReviewStatusBy);

            setData(sortedData);
            setPagination({
                ...pagination,
                total: response?.count || 0,
            });
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message);
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

    const handleUpdateSearchParams = (key: string, value: string) => {
        setSearchParams({
            ...Object.fromEntries(searchParams),
            [key]: value,
        });
    }

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
                            isTruncated={true}
                            defaultValue={filterReviewStatusBy}
                            onChange={(e: any) => handleUpdateSearchParams('review-status', e.target.value)}
                        >
                            <option value="">All</option>
                            {PRODUCT_REVIEW_OPTIONS?.map((option: { label: string, value: string }, index: number) => <option key={index} value={option?.value}>{option?.label}</option>)}
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
                        onChange={(event) => handleUpdateSearchParams('sort', event.target.value)}
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
                    <SearchBox
                        value={search}
                        onChange={(value: string) => handleUpdateSearchParams('search', value)}
                    />

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