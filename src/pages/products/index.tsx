import Confirmation from "@/components/Confirmation";
import Pagination from "@/components/Pagination";
import ProductLinks from "@/components/products/ProductLinks";
import UpdateProductDrawer from "@/components/products/UpdateProductDrawer";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import sortData from "@/helpers/sorting";
import { Content } from "@/layouts/app.layout"
import { useAuthGuard } from "@/providers/AuthProvider";
import { Box, Flex, IconButton, Image, Input, InputGroup, InputLeftElement, Select, Table, Tag, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from "@chakra-ui/react";
import { IconEdit, IconLink, IconLoader2, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const ProductsView = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [data, setData] = useState<any>([]);
    const [search, setSearch] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('createdAt,desc');

    const [editingData, setEditingData] = useState<any>({});
    const [deletingData, setDeletingData] = useState<any>({});
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

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

    useEffect(() => {
        setIsLoading(true);

        getData();

        window?.addEventListener('refresh:data', getData);

        return () => {
            window?.removeEventListener('refresh:data', getData);
        }
    }, [sortBy, pagination.page]);

    useEffect(() => {
        const debounce = setTimeout(() => getData(), 500);
        return () => clearTimeout(debounce);
    }, [search]);

    const getData = async () => {
        try {
            const response = await fetch({
                endpoint: `/items?offset=${pagination?.offset}&limit=${pagination.limit}&search=${search}&order=${sortBy}`,
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

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            const response = await fetch({
                endpoint: `/items/${deletingData?.id}`,
                method: 'DELETE',
            });

            if (response) notify('Product deleted successfully', 3000);
            else notify('An error occurred', 3000);

            setData(data.filter((user: any) => user.id !== deletingData.id));
            setDeletingData({});
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
            setIsDeleting(false);
        }
    }

    const totalClickouts = useMemo(() => {
        return data.reduce((acc: number, item: any) => acc + (item?.clickouts || 0), 0);
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
                            onClick={() => setEditingData({
                                id: Math.random().toString(36).substring(7),
                                name: '',
                                link: '',
                                brand: null,
                                brandId: null,
                                price: 0,
                                dealPrice: 0,
                                pictureURL: '',
                                isNew: true,
                            })}
                        />
                    </Flex>

                    <Flex
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
                            <option value='creator-affiliate'>⭐ Creator Affiliate</option>
                            <option value='Basic'>Basic</option>
                            <option value='None'>None</option>
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
                            <option value='alpha'>👑 Alpha</option>
                            <option value='backup'>Backup</option>
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

                        <Text
                            color='green.500'
                            fontWeight='bold'
                            fontSize={{
                                base: '10px',
                                '2xl': '12px',
                            }}
                            whiteSpace='nowrap'
                        >Clickouts: {totalClickouts || 0}</Text>
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
                            onClick={() => setEditingData({
                                id: Math.random().toString(36).substring(7),
                                name: '',
                                link: '',
                                brand: null,
                                brandId: null,
                                price: 0,
                                dealPrice: 0,
                                pictureURL: '',
                                isNew: true,
                            })}
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
                onEdit={(data: any) => setEditingData(data)}
                onDelete={(id: string) => setDeletingData(id)}
            />

            {/* Update Product */}
            <UpdateProductDrawer
                data={editingData}
                onClose={() => setEditingData({})}
                onComplete={() => getData()}
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

type ProductsTableProps = {
    data: any,
    isLoading: boolean,
    pagination: any,
    onPaginate: (page: number) => void,
    onEdit: (id: string) => void,
    onDelete: (id: string) => void,
}
export const ProductsTable = ({ data, isLoading, pagination, onPaginate, onEdit, onDelete }: ProductsTableProps) => {
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
                            <Th>Image</Th>
                            <Th>Brand</Th>
                            <Th>Name</Th>
                            <Th>Style</Th>
                            <Th textAlign='center'>Links</Th>
                            <Th textAlign='center'>Price</Th>
                            <Th textAlign='center' color='green.500'>Clickouts</Th>
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
                                : !data?.length
                                    ? <Tr>
                                        <Td colSpan={20} textAlign='center'>
                                            <Text fontStyle='italic' opacity={0.5}>NO RESULT</Text>
                                        </Td>
                                    </Tr>
                                    : data.map((item: any) => <TableRow
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
                page={pagination?.page || 1}
                setPage={onPaginate}
            />
        </>
    )
}

type TableRowProps = {
    item: any,
    onEdit: (id: string) => void,
    onDelete: (id: string) => void,
}
const TableRow = ({ item, onEdit, onDelete }: TableRowProps) => {
    const [links, setLinks] = useState<any[] | null>(null);

    const handleOpenImage = (link: string) => {
        window?.dispatchEvent(new CustomEvent('lightcase', { detail: { image: link } }));
    }

    const alphaLink = item?.links?.find((link: any) => link?.linkType === 'ALPHA');
    const productPrice = parseFloat(alphaLink?.price || item?.price || 0).toFixed(2);
    const productDiscountPrice = parseFloat(alphaLink?.discountPrice || item?.dealPrice || 0).toFixed(2);
    const productDiscountPercentage = parseFloat(productDiscountPrice) < parseFloat(productPrice)
        ? ((alphaLink?.discountPrice || item?.dealPrice) ? ((parseFloat(productDiscountPrice) - parseFloat(productPrice)) / parseFloat(productPrice)) * 100 : 0).toFixed(0)
        : '100';

    return (
        <>
            <Tr>
                <Td>
                    {
                        item?.pictureURL
                            ? <Box
                                position='relative'
                                textAlign='center'
                                width={28}
                            >
                                <Image
                                    src={item?.pictureURL}
                                    width={28}
                                    height='auto'
                                    objectFit='cover'
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

                                {
                                    parseInt(productDiscountPercentage) !== 0
                                        ? <Tag
                                            position='absolute'
                                            top='0'
                                            right='0'
                                            bgColor='black'
                                            color='white'
                                            rounded='md'
                                            size='sm'
                                        >{productDiscountPercentage}%</Tag>
                                        : null
                                }
                            </Box>
                            : <>
                                <Text>{item?.name || '-'}</Text>
                                {
                                    parseInt(productDiscountPercentage) !== 0
                                        ? <Tag
                                            bgColor='black'
                                            color='white'
                                            rounded='md'
                                            size='sm'
                                        >{productDiscountPercentage}%</Tag>
                                        : null
                                }
                            </>
                    }
                </Td>
                <Td width={40}>
                    {
                        item?.brand?.pictureURL
                            ? <Image
                                src={item?.brand?.pictureURL}
                                width={28}
                                height='auto'
                                objectFit='cover'
                                alt={item?.brand?.name}
                                loading="lazy"
                                rounded='md'
                                onError={(e: any) => {
                                    e.target.src = '/images/cover-placeholder.webp';
                                    e.target.onerror = null;
                                }}
                            />
                            : item?.brand?.name || '-'
                    }
                </Td>
                <Td>{item?.name || '-'}</Td>
                <Td>{item?.style || '-'}</Td>
                <Td textAlign='center'>
                    <IconButton
                        aria-label='View Links'
                        variant='ghost'
                        rounded='full'
                        size='sm'
                        icon={<IconLink size={22} />}
                        onClick={() => {
                            if(links === null) setLinks(item?.links || [item?.link] || []);
                            else setLinks(null);
                        }}
                    />
                </Td>
                <Td textAlign='center'>
                    <Text whiteSpace='nowrap'>Price: <strong>${productPrice}</strong></Text>
                    { parseFloat(productDiscountPrice) > 0 ? <Text whiteSpace='nowrap'>Deal Price: <strong>${productDiscountPrice}</strong></Text> : null }
                </Td>
                <Td textAlign='center' color='green.500'>{item?.clickouts || 0}</Td>
                <Td textAlign='center' whiteSpace='nowrap'>
                    <IconButton
                        aria-label="Edit"
                        variant='ghost'
                        rounded='full'
                        size='sm'
                        icon={<IconEdit size={22} />}
                        onClick={() => onEdit(item)}
                    />

                    <IconButton
                        aria-label='Delete'
                        variant='ghost'
                        colorScheme='red'
                        rounded='full'
                        size='sm'
                        ml={4}
                        icon={<IconTrash size={22} />}
                        onClick={() => onDelete(item)}
                    />
                </Td>
            </Tr>

            {/* Product Links */}
            {
                links !== null
                    ? <Tr bgColor='gray.50'>
                        <Td colSpan={20}>
                            <ProductLinks
                                links={links || []}
                                productId={item?.id}
                                onSave={(links: any) => {
                                    setLinks(null);
                                    item.links = links;
                                }}
                                onCancel={() => setLinks(null)}
                            />
                        </Td>
                    </Tr>
                : null
            }
        </>
    )
}

export default ProductsView;