import Confirmation from "@/components/Confirmation";
import CustomDrawer from "@/components/Drawer";
import Pagination from "@/components/Pagination";
import LookProducts from "@/components/looks/LookProducts";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import sortData from "@/helpers/sorting";
import { Content } from "@/layouts/app.layout"
import { useAuthGuard } from "@/providers/AuthProvider";
import { Box, Flex, FormControl, FormLabel, Grid, IconButton, Image, Input, InputGroup, InputLeftElement, Select, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from "@chakra-ui/react";
import { IconCamera, IconChevronDown, IconEdit, IconLoader2, IconPlus, IconSearch, IconTrash, IconUnlink, IconWorldWww } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

const BrandsView = () => {
    const brandImageRef = useRef<any>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [data, setData] = useState<any>([]);
    const [filteredData, setFilteredData] = useState<any>([]);
    const [search, setSearch] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('createdAt:desc');

    const [editingData, setEditingData] = useState<any>({});
    const [deletingData, setDeletingData] = useState<any>({});
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useAuthGuard('auth');

    useEffect(() => {
        setIsLoading(true);

        getData();
    }, [sortBy]);

    useEffect(() => {
        if(search?.toString()?.trim() === '') return setFilteredData(data);

        setFilteredData(
            data?.filter((item: any) => {
                return item?.name?.toLowerCase().includes(search?.toLowerCase()) ||
                    item?.link?.toLowerCase().includes(search?.toLowerCase());
            })
        );
    }, [search, data]);

    const getData = async () => {
        const products = await getProducts();

        try {
            const response = await fetch({
                endpoint: `/brands`,
                method: 'GET',
            });

            // Map products to all brands
            const mappedData = response?.map((brand: any) => {
                return {
                    ...brand,
                    products: products?.filter((product: any) => product?.brandId === brand?.id),
                }
            });

            const sortedData = sortData(mappedData, sortBy);

            setData(sortedData);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsLoading(false);
    }

    const getProducts = async () => {
        try {
            const response = await fetch({
                endpoint: `/items`,
                method: 'GET',
            });

            return response;
        } catch (error: any) {
            return [];
        }
    }

    const handleUpdateData = async () => {
        setIsProcessing(true);

        const payload = new FormData();

        payload.append('name', editingData?.name);
        payload.append('pageLink', editingData?.pageLink);

        if (brandImageRef?.current.files[0]) payload.append('picture', brandImageRef?.current.files[0]);

        try {
            const response = await fetch({
                endpoint: `/brands${editingData?.isNew ? '' : `/${editingData?.id}`}`,
                method: editingData?.isNew ? 'POST' : 'PUT',
                data: payload,
                hasFiles: true,
            });

            if (response) {
                notify('Brand saved successfully', 3000);

                if(editingData?.isNew) setData([editingData, ...data]);
                else {
                    const index = data.findIndex((u: any) => u.id === editingData.id);
                    const newData = [...data];
                    newData[index] = editingData;
                    setData(newData);
                }

                setEditingData({});
            } else notify('An error occurred', 3000);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsProcessing(false);
    }

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
            setIsDeleting(false);
        }
    }

    return (
        <Content activePage="Brands">

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
                    <h1 className="page-heading">Brands</h1>

                    {/* Create button for mobile */}
                    <IconButton
                        aria-label="Add new user"
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
                            <option value='products.length:desc'>Most Products</option>
                            <option value='products.length:asc'>Least Products</option>
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

                    {/* Create button for Desktop */}
                    <Tooltip label='Add new brand' placement="left">
                        <IconButton
                            aria-label="Add new user"
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
            <CustomDrawer
                isOpen={!!editingData?.id}
                title={editingData?.isNew ? `Create Brand` : 'Update Brand'}
                isProcessing={isProcessing}
                onSubmit={handleUpdateData}
                onClose={() => setEditingData({})}
            >
                <Grid
                    mt={4}
                    templateColumns='1fr'
                    gap={4}
                >
                    <FormControl id="name">
                        <FormLabel>Brand Name</FormLabel>
                        <Input
                            type="text"
                            required
                            autoComplete="off"
                            value={editingData?.name}
                            onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                        />
                    </FormControl>

                    <FormControl id="pageLink">
                        <FormLabel>Brand Website</FormLabel>
                        <Input
                            type="text"
                            autoComplete="off"
                            value={editingData?.pageLink}
                            onChange={(e) => setEditingData({ ...editingData, pageLink: e.target?.value?.toLowerCase() })}
                        />
                    </FormControl>

                    <FormControl mt={4} id="creatorBanner">
                        <FormLabel>Brand Logo (Leave blank to keep current image)</FormLabel>

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
                                onClick={() => brandImageRef.current.click()}
                            />
                        </Box>
                    </FormControl>

                    {/* Brand Logo input */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={brandImageRef}
                        hidden
                        onChange={(e: any) => {
                            const photo = e.target.files[0];

                            if(!photo) return;

                            setEditingData({ ...editingData, pictureURL: URL.createObjectURL(photo) });
                        }}
                    />
                </Grid>
            </CustomDrawer>

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
                            <Th>Name</Th>
                            <Th>Image</Th>
                            <Th textAlign='center'>Website</Th>
                            <Th textAlign='center'># of Products</Th>
                            <Th textAlign='center'>Partnership</Th>
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
    onEdit: (item: any) => void,
    onDelete: (item: any) => void,
}
const TableRow = ({ item, onEdit, onDelete }: TableRowProps) => {
    const [isProductsExpanded, setIsProductsExpanded] = useState<boolean>(false);

    const handleExpandProducts = () => {
        setIsProductsExpanded(!isProductsExpanded);
    }

    return (
        <>
            <Tr key={item?.id}>
                <Td>{item?.name || '-'}</Td>
                <Td>
                    {
                        item?.pictureURL
                            ? <Image
                                src={item?.pictureURL}
                                width={28}
                                height='auto'
                                objectFit='cover'
                                alt={item?.name}
                                rounded='md'
                            />
                            : <IconUnlink size={26} />
                    }
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
                <Td textAlign='center'>{item?.products?.length || 0}</Td>
                <Td textAlign='center'>{item?.partnership || 'None'}</Td>
                <Td textAlign='center' color='green.500'>{item?.clickouts || 0}</Td>
                <Td textAlign='center' whiteSpace='nowrap'>
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
                                transform: isProductsExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                            }}
                        />}
                        onClick={handleExpandProducts}
                    />
                </Td>
            </Tr>

            {/* Products */}
            <Tr
                display={isProductsExpanded ? 'table-row' : 'none'}
                bgColor='gray.50'
            >
                <Td colSpan={20}>
                    <LookProducts
                        products={item?.products}
                        onSave={(products: any) => console.log(products)}
                    />
                </Td>
            </Tr>
        </>
    )
}

export default BrandsView;