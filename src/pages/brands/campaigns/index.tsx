import SearchBox from "@/components/SearchBox";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import sortData from "@/helpers/sorting";
import { Content } from "@/layouts/app.layout";
import { useAuthGuard } from "@/providers/AuthProvider";
import { Flex, Select } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BrandCampaignsTable from "../components/BrandCampaignsTable";

export default function BrandCampaignsView() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [data, setData] = useState<any>([]);

    // Search params
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search') || '',
        sortBy = searchParams.get('sort') || 'createdAt:desc';

    useAuthGuard('auth');

    useEffect(() => {
        setIsLoading(true);

        getData();

        window?.addEventListener('reload:brand-campaigns', getData);

        return () => window?.removeEventListener('reload:brand-campaigns', getData);
    }, [sortBy]);

    const getData = async () => {
        try {
            const response = await fetch({
                endpoint: `/campaigns/ad-campaigns?all=true`,
                method: 'GET',
            });
            const sortedData = sortData(response?.campaigns || [], sortBy);

            setData(sortedData);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message);
        }

        setIsLoading(false);
    }

    const handleUpdateSearchParams = (key: string, value: string) => {
        setSearchParams({
            ...Object.fromEntries(searchParams),
            [key]: value,
        });
    }

    const filteredData = useMemo(() => {
        if(search?.toString()?.trim() === '') return data || [];

        return data?.filter((item: any) => {
            return item?.name?.toLowerCase().includes(search?.toLowerCase()) ||
                item?.brand?.name?.toLowerCase().includes(search?.toLowerCase()) ||
                item?.user?.name?.toLowerCase().includes(search?.toLowerCase()) ||
                item?.advertisement?.title?.toLowerCase().includes(search?.toLowerCase());
        }) || [];
    }, [search, data]);

    return (
        <Content activePage='Brand Campaigns' pageTitle="Campaigns">

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
                    justifyContent={{
                        base: 'space-between',
                        lg: 'flex-start',
                    }}
                    alignItems='center'
                    width={{
                        base: 'full',
                        lg: 'auto',
                    }}
                    gap={2}
                >
                    <h1 className="page-heading">Campaigns</h1>
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
                        <optgroup label="Name">
                            <option value='name:asc'>A - Z</option>
                            <option value='name:desc'>Z - A</option>
                        </optgroup>
                        <optgroup label="Creation Date">
                            <option value='createdAt:desc'>Newest First</option>
                            <option value='createdAt:asc'>Oldest First</option>
                        </optgroup>
                    </Select>

                    {/* Search */}
                    <SearchBox
                        value={search}
                        onChange={(value: string) => handleUpdateSearchParams('search', value)}
                    />
                </Flex>
            </Flex>

            {/* Table */}
            <BrandCampaignsTable
                isInitialDataLoading={isLoading}
                initialData={filteredData}
            />
        </Content>
    )
}