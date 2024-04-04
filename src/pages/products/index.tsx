import Confirmation from "@/components/Confirmation";
import CustomDrawer from "@/components/Drawer";
import Pagination from "@/components/Pagination";
import ProductLinks from "@/components/products/ProductLinks";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import sortData from "@/helpers/sorting";
import { Content } from "@/layouts/app.layout"
import { useAuthGuard } from "@/providers/AuthProvider";
import { Box, Button, Flex, FormControl, FormLabel, Grid, IconButton, Image, Input, InputGroup, InputLeftElement, Select, Table, Tag, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { IconCamera, IconEdit, IconLink, IconLoader2, IconSearch, IconTrash } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const ProductsView = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [data, setData] = useState<any>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any>([]);
    const [search, setSearch] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('createdAt:desc');

    const [editingData, setEditingData] = useState<any>({});
    const [deletingData, setDeletingData] = useState<any>({});
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const location = useLocation();
    const isManagement = location.pathname.includes('management');
    const pageName = isManagement ? 'Products Management' : 'Products';

    useAuthGuard('auth');

    useEffect(() => {
        getBrands();
    }, []);

    useEffect(() => {
        setIsLoading(true);

        getData();
    }, [sortBy]);

    useEffect(() => {
        if(search?.toString()?.trim() === '') return setFilteredData(data);

        setFilteredData(
            data?.filter((item: any) => {
                return item?.name?.toLowerCase().includes(search?.toLowerCase()) ||
                    item?.brand?.name?.toLowerCase().includes(search?.toLowerCase()) ||
                    item?.link?.toLowerCase().includes(search?.toLowerCase()) ||
                    item?.price?.toString().includes(search?.toLowerCase()) ||
                    item?.dealPrice?.toString().includes(search?.toLowerCase());
            })
        );
    }, [search, data]);

    const getData = async () => {
        try {
            const response = await fetch({
                endpoint: `/items`,
                method: 'GET',
            });

            // Sort by createdAt
            response?.map((item: any) => item.brand_name = item?.brand?.name || '');
            const sortedData = sortData(response, sortBy);

            setData(sortedData);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsLoading(false);
    }

    const getBrands = async () => {
        try {
            const response = await fetch({
                endpoint: `/brands`,
                method: 'GET',
            });

            // Sort by createdAt
            response.sort((a: any, b: any) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            setBrands(response);
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
                    <h1 className="page-heading">{pageName}</h1>

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
                        >Clickouts: 0</Text>
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
                            pl={12}
                            fontWeight='medium'
                            _focusVisible={{
                                borderColor: 'gray.200 !important',
                                boxShadow: 'none !important',
                            }}
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </InputGroup>
                </Flex>
            </Flex>

            {/* Table */}
            <ProductsTable
                data={filteredData}
                isLoading={isLoading}
                onEdit={(data: any) => setEditingData(data)}
                onDelete={(id: string) => setDeletingData(id)}
            />

            {/* Update Brand */}
            <UpdateProductDrawer
                data={editingData}
                brands={brands}
                onClose={() => setEditingData({})}
                onComplete={() => getData()}
                // onComplete={(response: any, isNew: boolean) => {
                //     if(isNew) setData([editingData, ...data]);
                //     else {
                //         const index = data?.findIndex((u: any) => u.id === response.id);
                //         const newData = [...data];
                //         newData[index] = response;
                //         setData(newData);
                //     }
                // }}
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
    onEdit: (id: string) => void,
    onDelete: (id: string) => void,
}
export const ProductsTable = ({ data, isLoading, onEdit, onDelete }: ProductsTableProps) => {
    const pagination = {
        total: data?.length ?? 0,
        limit: 15,
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
    onEdit: (id: string) => void,
    onDelete: (id: string) => void,
}
const TableRow = ({ item, onEdit, onDelete }: TableRowProps) => {
    const [isLinksExpanded, setIsLinksExpanded] = useState<boolean>(false);

    return (
        <>
            <Tr key={item?.id}>
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
                                    loading="lazy"
                                    rounded='md'
                                    onError={(e: any) => {
                                        e.target.src = '/images/cover-placeholder.webp';
                                        e.target.onerror = null;
                                    }}
                                />

                                {
                                    item?.dealPrice && item?.dealPercent && item?.price !== item?.dealPrice
                                        ? <Tag
                                            position='absolute'
                                            top='0'
                                            right='0'
                                            bgColor='black'
                                            color='white'
                                            rounded='md'
                                            size='sm'
                                        >{parseInt(item?.dealPercent || 0)}%</Tag>
                                        : null
                                }
                            </Box>
                            : <>
                                <Text>{item?.name || '-'}</Text>
                                {
                                    item?.dealPrice && item?.dealPercent && item?.price !== item?.dealPrice
                                        ? <Tag
                                            bgColor='black'
                                            color='white'
                                            rounded='md'
                                            size='sm'
                                        >{parseInt(item?.dealPercent || 0)}%</Tag>
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
                    {
                        item?.link
                            ? <IconButton
                                aria-label='View Links'
                                variant='ghost'
                                rounded='full'
                                size='sm'
                                icon={<IconLink size={22} />}
                                onClick={() => setIsLinksExpanded(!isLinksExpanded)}
                            />
                            : '-'
                    }
                </Td>
                <Td textAlign='center'>
                    {/* {
                        item?.dealPrice
                            ? <>
                                <Text as='span' fontWeight='bold'>${parseFloat(item?.dealPrice).toFixed(2)}</Text>
                                <br />
                                <Text as='span' textDecoration='line-through' opacity={0.5}>${parseFloat(item?.price).toFixed(2)}</Text>
                                <Tag size='sm' ml={2} colorScheme="teal">{parseInt(item?.dealPercent || 0)}%</Tag>
                            </>
                            : item?.price
                                ? <Text as='span'>${parseFloat(item?.price).toFixed(2)}</Text>
                                : '-'
                    } */}
                    <Text whiteSpace='nowrap'>Price: <strong>${parseFloat(item?.price || 0)?.toFixed(2)}</strong></Text>
                    { item?.dealPrice ? <Text whiteSpace='nowrap'>Deal Price: <strong>${parseFloat(item?.dealPrice)?.toFixed(2)}</strong></Text> : null }
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
            <Tr
                display={isLinksExpanded ? 'table-row' : 'none'}
                bgColor='gray.50'
            >
                <Td colSpan={20}>
                    <ProductLinks
                        links={(item?.links ?? [item?.link]) || []}
                        onSave={(links: any) => console.log(links)}
                    />
                </Td>
            </Tr>
        </>
    )
}

type UpdateProductDrawerProps = {
    data: any;
    brands: any;
    onComplete: (data: any, isNew: boolean) => void;
    onClose: () => void;
}
const UpdateProductDrawer = ({ data, brands, onComplete, onClose }: UpdateProductDrawerProps) => {
    const productImageRef = useRef<any>(null);

    const [editingData, setEditingData] = useState<any>({});
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showBrandOptions, setShowBrandOptions] = useState<boolean>(false);

    const filteredBrands = useMemo(() => {
        return brands?.filter((brand: any) => brand?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, brands]);

    const handleUpdateData = async () => {
        setIsProcessing(true);

        const payload = new FormData();

        payload.append('name', editingData?.name);
        payload.append('link', editingData?.link);
        payload.append('brand', editingData?.brand ?? null);
        payload.append('brandId', editingData?.brand?.id ?? null);
        payload.append('price', editingData?.price);
        payload.append('dealPrice', editingData?.dealPrice);

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

        setSearchTerm(data?.brand?.name || '');
    }, [data]);

    return (
        <CustomDrawer
            isOpen={!!editingData?.id}
            title={editingData?.isNew ? `Create Brand` : 'Update Brand'}
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
                        required
                        autoComplete="off"
                        value={editingData?.name || ''}
                        onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                    />
                </FormControl>

                <FormControl id="link">
                    <FormLabel>Product Link</FormLabel>
                    <Input
                        type="text"
                        autoComplete="off"
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
            <FormControl mt={4} id="brand">
                <FormLabel>Product Brand</FormLabel>
                <Box position='relative'>
                    <Input
                        type="text"
                        autoComplete="off"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setShowBrandOptions(true);
                        }}
                        onFocus={() => setShowBrandOptions(true)}
                        onBlur={() => setTimeout(() => setShowBrandOptions(false), 200)}
                    />

                    <Flex
                        direction='column'
                        position='absolute'
                        top='100%'
                        left='0'
                        width='full'
                        zIndex={1}
                        bgColor='white'
                        border='1px solid'
                        borderColor='gray.100'
                        rounded='md'
                        display={showBrandOptions ? 'block' : 'none'}
                        maxHeight='200px'
                        overflowY='auto'
                        shadow='md'
                    >
                        {filteredBrands?.map((brand: any) => <Button
                            key={brand?.id}
                            variant='ghost'
                            size='sm'
                            width='full'
                            textAlign='left'
                            justifyContent='flex-start'
                            rounded='none'
                            onClick={() => {
                                setEditingData({
                                    ...editingData,
                                    brand: brand,
                                });
                                setSearchTerm(brand?.name);
                            }}
                        >{brand?.name}</Button>)}
                    </Flex>
                </Box>
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