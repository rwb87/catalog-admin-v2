import LocationTable from "@/components/location/LocationTable";
import SearchBox from "@/components/SearchBox";
import fetch from "@/helpers/fetch";
import { Content } from "@/layouts/app.layout"
import { useAuthGuard } from "@/providers/AuthProvider";
import { Flex, IconButton, Tooltip } from "@chakra-ui/react";
import { IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const LocationView = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [data, setData] = useState<any>([]);

    const [pagination, setPagination] = useState({
        page: 1,
        offset: 0,
        limit: 50,
        total: 0,
    });

    // Search params
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search') || '';

    useAuthGuard('auth');

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await fetch({
                    endpoint: `/locations?includeAll=true&search=${search}&offset=${pagination.offset}&limit=${pagination.limit}`,
                    method: 'GET',
                });

                setData(response?.locations);
                setPagination({
                    ...pagination,
                    total: response?.count,
                });
            } catch (error) {
                console.log(error);
            }

            setIsLoading(false);
        }

        setIsLoading(true);

        getData();

        window?.addEventListener('refresh:data', getData);

        return () => window?.removeEventListener('refresh:data', getData);
    }, [search, pagination?.offset]);

    const handleUpdateSearchParams = (key: string, value: string) => {
        setSearchParams({
            ...Object.fromEntries(searchParams),
            [key]: value,
        });
    }

    return (
        <Content activePage="Locations">

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
                    <h1 className="page-heading">Locations</h1>
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

                    {/* Search */}
                    <SearchBox
                        value={search}
                        onChange={(value: string) => handleUpdateSearchParams('search', value)}
                    />

                    {/* Create button for Desktop */}
                    <Tooltip label='Add new music' placement="left">
                        <IconButton
                            aria-label="Add new music"
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
                            onClick={() => window?.dispatchEvent(new CustomEvent('action:new-location'))}
                        />
                    </Tooltip>
                </Flex>
            </Flex>

            {/* Content */}
            <LocationTable
                data={data}
                isLoading={isLoading}
                pagination={pagination}
                onPaginate={(pageNumber: number) => setPagination({
                    ...pagination,
                    page: pageNumber,
                    offset: (pageNumber - 1) * pagination.limit,
                })}
                onDelete={() => window?.dispatchEvent(new CustomEvent('refresh:data'))}
            />
        </Content>
    )
}

export default LocationView;