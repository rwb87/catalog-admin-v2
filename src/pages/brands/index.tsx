import Confirmation from "@/components/Confirmation";
import Pagination from "@/components/Pagination";
import BrandProducts from "@/components/brands/BrandProducts";
import UpdateBrandDrawer from "@/components/brands/UpdateBrandDrawer";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import sortData from "@/helpers/sorting";
import { Content } from "@/layouts/app.layout"
import { useAuthGuard } from "@/providers/AuthProvider";
import { Box, Flex, IconButton, Image, Input, InputGroup, InputLeftElement, Select, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from "@chakra-ui/react";
import { IconChevronDown, IconEdit, IconLoader2, IconPlus, IconSearch, IconTrash, IconUnlink, IconWorldWww } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

const BrandsView = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [data, setData] = useState<any>([]);
    const [search, setSearch] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('createdAt:desc');

    const [editingData, setEditingData] = useState<any>({});
    const [deletingData, setDeletingData] = useState<any>({});
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const isManagement = location.pathname.includes('management');
    const pageName = isManagement ? 'Brands Management' : 'Brands';

    useAuthGuard('auth');

    // Reset the whole page when the URL changes
    useEffect(() => {
        setIsLoading(true);
        setSearch('');
        setSortBy('createdAt:desc');
        setEditingData({});
        setDeletingData({});
        getData();
    }, [location.pathname]);

    useEffect(() => {
        setIsLoading(true);

        getData();

        window?.addEventListener('refresh:data', getData);

        return () => window?.removeEventListener('refresh:data', getData);
    }, [sortBy]);

    const getData = async () => {
        try {
            const response = await fetch({
                endpoint: `/brands?all=true`,
                method: 'GET',
            });
            const sortedData = sortData(response, sortBy);

            setData(sortedData);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsLoading(false);
    }

    const filteredData = useMemo(() => {
        if(search?.toString()?.trim() === '') return data || [];

        return data?.filter((item: any) => {
            return item?.name?.toLowerCase().includes(search?.toLowerCase()) ||
                item?.link?.toLowerCase().includes(search?.toLowerCase());
        }) || [];
    }, [search, data]);

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            const response = await fetch({
                endpoint: `/brands/${deletingData?.id}`,
                method: 'DELETE',
            });

            if (response) notify('Brand deleted successfully', 3000);
            else notify('An error occurred', 3000);

            setData(data.filter((user: any) => user.id !== deletingData.id));
            setDeletingData({});
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsDeleting(false);
    }

    const totalClickouts = useMemo(() => {
        return data?.reduce((total: number, brand: any) => {
            return total + (parseInt(brand?.clickouts) || 0);
        }, 0);
    }, [data]);

    return (
        <Content activePage={pageName}>

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
                    <h1 className="page-heading">{pageName}</h1>

                    <Box
                        display={{
                            base: 'none',
                            lg: 'contents',
                        }}
                        fontWeight='bold'
                        fontSize={{
                            base: '10px',
                            '2xl': '12px',
                        }}
                        whiteSpace='break-spaces'
                    >
                        <Text ml={2} color='green.500'>Clickouts: {totalClickouts || 0}</Text>
                    </Box>

                    {/* Create button for mobile */}
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
                        onClick={() => setEditingData({
                            id: Math.random().toString(36).substring(7),
                            name: '',
                            pageLink: '',
                            pictureURL: '',
                            smallPictureURL: '',
                            partnership: 'NONE',
                            isNew: true,
                        })}
                    />
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
                        onChange={(event) => setSortBy(event.target.value)}
                    >
                        <optgroup label="Name">
                            <option value='name:asc'>A - Z</option>
                            <option value='name:desc'>Z - A</option>
                        </optgroup>
                        <optgroup label="# of Products">
                            <option value='items.length:desc'>Most Products</option>
                            <option value='items.length:asc'>Least Products</option>
                        </optgroup>
                        <optgroup label="Creation Date">
                            <option value='createdAt:desc'>Newest First</option>
                            <option value='createdAt:asc'>Oldest First</option>
                        </optgroup>
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
                            placeholder='Search'
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

                    {/* Create button for Desktop */}
                    <Tooltip label='Add new brand' placement="left">
                        <IconButton
                            aria-label="Add new brand"
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
                            onClick={() => setEditingData({
                                id: Math.random().toString(36).substring(7),
                                name: '',
                                pageLink: '',
                                pictureURL: '',
                                smallPictureURL: '',
                                partnership: 'NONE',
                                isNew: true,
                            })}
                        />
                    </Tooltip>
                </Flex>
            </Flex>

            {/* Table */}
            <BrandsTable
                data={filteredData}
                isLoading={isLoading}
                onEdit={(data: any) => setEditingData(data)}
                onDelete={(id: string) => setDeletingData(id)}
            />

            {/* Update Brand */}
            <UpdateBrandDrawer
                data={editingData}
                onSave={async () => {
                    setIsLoading(true);
                    await getData();
                }}
                onClose={() => setEditingData({})}
            />

            {/* Delete Dialog */}
            <Confirmation
                isOpen={!!deletingData?.id}
                text={`Are you sure you want to delete <strong>${deletingData?.name}</strong>? You can't undo this action afterwards.`}
                isProcessing={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setDeletingData({})}
            />
        </Content>
    )
}

type BrandsTableProps = {
    data: any,
    isLoading: boolean,
    onEdit: (id: string) => void,
    onDelete: (id: string) => void,
}
const BrandsTable = ({ data, isLoading, onEdit, onDelete }: BrandsTableProps) => {
    const pagination = {
        total: data?.length ?? 0,
        limit: 50,
    }
    const [page, setPage] = useState<number>(1);

    useEffect(() => {
        setPage(1);
    }, [data.length]);

    const reconstructedData = pagination.total > pagination.limit ? data.slice((page - 1) * pagination.limit, page * pagination.limit) : data;

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
                            <Th>Name</Th>
                            <Th>Image</Th>
                            <Th>Image Size</Th>
                            <Th textAlign='center'>Website</Th>
                            <Th textAlign='center'># of Products</Th>
                            <Th textAlign='center'>Partnership</Th>
                            <Th textAlign='center' color='green.500'>Clickouts</Th>
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
                                : !reconstructedData?.length
                                    ? <Tr>
                                        <Td colSpan={20} textAlign='center'>
                                            <Text fontStyle='italic' opacity={0.5}>NO RESULT</Text>
                                        </Td>
                                    </Tr>
                                    : reconstructedData.map((item: any) => <TableRow
                                        key={item?.id}
                                        item={item}
                                        onEdit={onEdit}
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
                page={page || 1}
                setPage={setPage}
            />
        </>
    )
}

type TableRowProps = {
    item: any,
    onEdit: (item: any) => void,
    onDelete: (item: any) => void,
}
const TableRow = ({ item, onEdit, onDelete }: TableRowProps) => {
    const [products, setProducts] = useState<any[] | null>(null);

    const handleExpandProducts = () => {
        setProducts(products !== null ? null : item?.products);
    }

    const handleOpenImage = (link: string) => {
        window?.dispatchEvent(new CustomEvent('lightcase', { detail: { image: link } }));
    }

    return (
        <>
            <Tr key={item?.id}>
                <Td>{item?.name || '-'}</Td>
                <Td>
                    {
                        item?.pictureURL
                            ? <Image
                                src={item?.smallPictureURL}
                                width={28}
                                height={28}
                                objectFit='contain'
                                alt={item?.name}
                                rounded='md'
                                cursor='pointer'
                                loading="lazy"
                                onClick={() => handleOpenImage(item?.pictureURL)}
                                onError={(e: any) => {
                                    e.target.src = '/images/cover-placeholder.webp';
                                    e.target.onerror = null;
                                }}
                            />
                            : <IconUnlink size={26} />
                    }
                </Td>
                <Td>
                    W: {item?.photoMetadataParsed?.width}px, H: {item?.photoMetadataParsed?.height}px
                </Td>
                <Td textAlign='center'>
                    {
                        item?.pageLink
                            ? <a
                                href={['http', 'https'].includes(item?.pageLink?.substr(0, 4))? item?.pageLink : `http://${item?.pageLink}`}
                                target='_blank'
                                style={{ display: 'inline-grid', placeSelf: 'center' }}
                            ><IconWorldWww size={26} strokeWidth={1.2} /></a>
                            : '-'
                    }
                </Td>
                <Td textAlign='center'>{item?.items?.length || 0}</Td>
                <Td textAlign='center'>{item?.partnership || 'None'}</Td>
                <Td textAlign='center' color='green.500'>{item?.clickouts || 0}</Td>
                <Td textAlign='right' whiteSpace='nowrap'>
                    <IconButton
                        aria-label="Edit"
                        variant='ghost'
                        rounded='full'
                        size='sm'
                        icon={<IconEdit size={22} />}
                        onClick={() => onEdit?.(item)}
                    />

                    <IconButton
                        aria-label='Delete'
                        variant='ghost'
                        colorScheme='red'
                        rounded='full'
                        size='sm'
                        ml={4}
                        icon={<IconTrash size={22} />}
                        onClick={() => onDelete?.(item)}
                    />
                    <IconButton
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
                                transform: products !== null ? 'rotate(180deg)' : 'rotate(0deg)'
                            }}
                        />}
                        onClick={handleExpandProducts}
                    />
                </Td>
            </Tr>

            {/* Products */}
            {
                products !== null
                    ? <Tr bgColor='gray.50'>
                        <Td colSpan={20}>
                            <BrandProducts
                                brand={item}
                                products={item?.items}
                                onSave={(products: any) => {
                                    setProducts(products);
                                    window?.dispatchEvent(new CustomEvent('refresh:data'));
                                }}
                            />
                        </Td>
                    </Tr>
                    : null
            }
        </>
    )
}

export default BrandsView;