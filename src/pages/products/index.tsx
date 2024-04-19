import Confirmation from "@/components/Confirmation";
import CustomDrawer from "@/components/Drawer";
import Pagination from "@/components/Pagination";
import SearchableInput from "@/components/SearchableInput";
import ProductLinks from "@/components/products/ProductLinks";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import sortData from "@/helpers/sorting";
import { Content } from "@/layouts/app.layout"
import { useAuthGuard } from "@/providers/AuthProvider";
import { Box, Flex, FormControl, FormLabel, Grid, IconButton, Image, Input, InputGroup, InputLeftElement, Select, Table, Tag, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from "@chakra-ui/react";
import { IconCamera, IconEdit, IconLink, IconLoader2, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const ProductsView = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [data, setData] = useState<any>([]);
    const [search, setSearch] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('createdAt:desc');

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
                endpoint: `/items?offset=${pagination?.offset}&limit=${pagination.limit}&search=${search}`,
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
                        <optgroup label="Brand Name">
                            <option value='brand_name:asc'>A - Z</option>
                            <option value='brand_name:desc'>Z - A</option>
                        </optgroup>
                        <optgroup label="Product Name">
                            <option value='name:asc'>A - Z</option>
                            <option value='name:desc'>Z - A</option>
                        </optgroup>
                        <optgroup label="Price">
                            <option value='price:asc'>Low - High</option>
                            <option value='price:desc'>High - Low</option>
                        </optgroup>
                        <optgroup label="Deal Price">
                            <option value='dealPrice:asc'>Low - High</option>
                            <option value='dealPrice:desc'>High - Low</option>
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
                        onClick={() => setLinks(item?.links || [item?.link] || [])}
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

type UpdateProductDrawerProps = {
    data: any;
    onComplete: (data: any, isNew: boolean) => void;
    onClose: () => void;
}
const UpdateProductDrawer = ({ data, onComplete, onClose }: UpdateProductDrawerProps) => {
    const productImageRef = useRef<any>(null);

    const [editingData, setEditingData] = useState<any>({});
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const [isSearchingBrands, setIsSearchingBrands] = useState<boolean>(false);
    const [brandSearchTerm, setBrandSearchTerm] = useState<string>('');
    const [brands, setBrands] = useState<any[]>([]);

    useEffect(() => {
        const debounce = setTimeout(() => getBrands(), 500);
        return () => clearTimeout(debounce);
    }, [brandSearchTerm]);

    const getBrands = async () => {
        setIsSearchingBrands(true);
        if (brandSearchTerm?.trim() === '') {
            setBrands([]);
            setIsSearchingBrands(false);
            return;
        }

        try {
            const response = await fetch({
                endpoint: `/brands?search=${brandSearchTerm}`,
                method: 'GET',
            });

            setBrands(response);
        } catch (error: any) {
            setBrands([]);
        }

        setIsSearchingBrands(false);
    }

    const handleUpdateData = async () => {
        setIsProcessing(true);

        const payload = new FormData();

        payload.append('name', editingData?.name);
        payload.append('link', editingData?.link);
        payload.append('brand', editingData?.brand ?? null);
        payload.append('brandId', editingData?.brand?.id ?? null);
        payload.append('price', parseFloat(editingData?.price || 0).toFixed(2));
        payload.append('dealPrice', parseFloat(editingData?.dealPrice || 0).toFixed(2));

        const dealPercent = parseFloat(editingData?.dealPrice) > 0 ? ((parseFloat(editingData?.dealPrice) - parseFloat(editingData?.price)) / parseFloat(editingData?.price)) * 100 : 0;
        payload.append('dealPercent', dealPercent?.toString());

        if (productImageRef?.current.files[0]) payload.append('picture', productImageRef?.current.files[0]);

        try {
            const response = await fetch({
                endpoint: `/items${editingData?.isNew ? '' : `/${editingData?.id}`}`,
                method: editingData?.isNew ? 'POST' : 'PUT',
                data: payload,
                hasFiles: true,
            });

            if (response) {
                notify('Product saved successfully', 3000);
                onComplete(editingData, false);
                setEditingData({});
            } else notify('An error occurred', 3000);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsProcessing(false);
    }

    useEffect(() => {
        setEditingData(data);
    }, [data]);

    return (
        <CustomDrawer
            isOpen={!!editingData?.id}
            title={editingData?.isNew ? `Create Product` : 'Update Product'}
            isProcessing={isProcessing}
            onSubmit={handleUpdateData}
            onClose={onClose}
        >
            {/* Name and Link */}
            <Grid
                mt={4}
                templateColumns={{
                    base: '1fr',
                    md: 'repeat(2, 1fr)',
                }}
                gap={4}
            >
                <FormControl id="name">
                    <FormLabel>Product Name</FormLabel>
                    <Input
                        type="text"
                        autoComplete="off"
                        required={true}
                        value={editingData?.name || ''}
                        onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                    />
                </FormControl>

                <FormControl id="link">
                    <FormLabel>Product Link</FormLabel>
                    <Input
                        type="text"
                        autoComplete="off"
                        required={true}
                        value={editingData?.link || ''}
                        onChange={(e) => setEditingData({ ...editingData, link: e.target?.value?.toLowerCase() })}
                    />
                </FormControl>
            </Grid>

            {/* Price and Discounts */}
            <Grid
                mt={4}
                templateColumns={{
                    base: '1fr',
                    md: 'repeat(2, 1fr)',
                }}
                gap={4}
            >
                <FormControl id="price">
                    <FormLabel>Price</FormLabel>
                    <Input
                        type="number"
                        step="0.01"
                        required
                        autoComplete="off"
                        value={editingData?.price || 0}
                        onChange={(e) => setEditingData({ ...editingData, price: e.target.value })}
                    />
                </FormControl>

                <FormControl id="dealPrice">
                    <FormLabel>Discounted Price</FormLabel>
                    <Input
                        type="number"
                        step="0.01"
                        autoComplete="off"
                        value={editingData?.dealPrice || 0}
                        onChange={(e) => {
                            const { value } = e.target;

                            const dealPercent = parseFloat(value) > 0 ? ((parseFloat(value) - parseFloat(editingData?.price)) / parseFloat(editingData?.price)) * 100 : 0;

                            setEditingData({
                                ...editingData,
                                dealPercent: dealPercent?.toString(),
                                dealPrice: e.target.value,
                            });
                        }}
                    />
                </FormControl>
            </Grid>

            {/* Brand */}
            <FormControl mt={4}>
                <FormLabel>Product Brand</FormLabel>
                <SearchableInput
                    data={brands}
                    property='name'
                    defaultValue={editingData?.brand?.name}
                    placeholder="Search brand..."
                    isLoading={isSearchingBrands}
                    onDynamicSearch={(term: any) => setBrandSearchTerm(term)}
                    onChange={(brand: any) => {
                        setEditingData({
                            ...editingData,
                            brand: brand,
                        });
                    }}
                />
            </FormControl>

            {/* Product Image */}
            <FormControl mt={4} id="productImage">
                <FormLabel>Product Image</FormLabel>

                <Box position='relative'>
                    <Image
                        src={editingData?.pictureURL}
                        alt={editingData?.name}
                        width='full'
                        loading="lazy"
                        aspectRatio={21 / 9}
                        rounded='lg'
                        objectFit='contain'
                        bgColor='gray.100'
                        onError={(e: any) => {
                            e.target.src = '/images/cover-placeholder.webp';
                            e.target.onerror = null;
                        }}
                    />

                    {/* Edit Cover Button */}
                    <IconButton
                        position='absolute'
                        top='2'
                        right='2'
                        rounded='full'
                        colorScheme='gray'
                        aria-label='Edit cover photo'
                        icon={<IconCamera size={22} />}
                        onClick={() => productImageRef.current.click()}
                    />
                </Box>
            </FormControl>

            {/* Product Image input */}
            <input
                type="file"
                accept="image/*"
                ref={productImageRef}
                hidden
                onChange={(e: any) => {
                    const photo = e.target.files[0];

                    if(!photo) return;

                    setEditingData({ ...editingData, pictureURL: URL.createObjectURL(photo) });
                }}
            />
        </CustomDrawer>
    )
}

export default ProductsView;