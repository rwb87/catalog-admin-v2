import Confirmation from "@/components/Confirmation";
import CustomDrawer from "@/components/Drawer";
import Pagination from "@/components/Pagination";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import AppLayout from "@/layouts/app.layout"
import { useAuthGuard } from "@/providers/AuthProvider";
import { Box, Flex, FormControl, FormLabel, Grid, IconButton, Image, Input, Select, Table, Tag, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { IconCamera, IconEdit, IconLoader2, IconTrash, IconUnlink, IconWorldWww } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

const ProductsView = () => {
    const productImageRef = useRef<any>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [data, setData] = useState<any>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any>([]);
    const [search, setSearch] = useState<string>('');

    const [editingData, setEditingData] = useState<any>({});
    const [deletingData, setDeletingData] = useState<any>({});
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useAuthGuard('auth');

    useEffect(() => {
        getData();
        getBrands();
    }, []);

    useEffect(() => {
        setFilteredData(
            // data?.filter((item: any) => {
            //     return item?.name.toLowerCase().includes(search.toLowerCase());
            // })
            data
        );
    }, [search, data]);

    const getData = async () => {
        try {
            const response = await fetch({
                endpoint: `/items`,
                method: 'GET',
            });

            console.log(response);

            // Sort by createdAt
            response.sort((a: any, b: any) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            setData(response);
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
                endpoint: `/items/${deletingData?.id}`,
                method: 'DELETE',
            });

            if (response) notify('User deleted successfully', 3000);
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
        <AppLayout activePage="Products">

            {/* Search and Options */}
            <Flex
                justifyContent='space-between'
                alignItems='center'
                mb={4}
            >
                {/* Page Heading */}
                <h1 className="page-heading">Products</h1>

                {/* Search and Actions */}
                <Flex gap={2} alignItems='center'>
                    <Input
                        type='search'
                        placeholder='Search'
                        size='sm'
                        variant='outline'
                        width='300px'
                        rounded='md'
                        bgColor='white'
                        borderColor='gray.100'

                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />

                    {/* <Tooltip label='Add new brand' placement="left">
                        <IconButton
                            aria-label="Add new user"
                            variant='solid'
                            size='sm'
                            rounded='full'
                            borderWidth={2}
                            borderColor='gray.100'
                            icon={<IconPlus size={20} />}
                            onClick={() => setEditingData({
                                id: Math.random().toString(36).substring(7),
                                name: '',
                                pageLink: '',
                                pictureURL: '',
                                isNew: true,
                            })}
                        />
                    </Tooltip> */}
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
            <CustomDrawer
                isOpen={!!editingData?.id}
                title={editingData?.isNew ? `Create Brand` : 'Update Brand'}
                isProcessing={isProcessing}
                onSubmit={handleUpdateData}
                onClose={() => setEditingData({})}
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
                    <Select
                        placeholder="Select Brand"
                        required
                        value={typeof editingData?.brand?.id !== 'undefined' ? editingData?.brand?.id : ''}
                        onChange={(e: any) => {
                            setEditingData({
                                ...editingData,
                                brand: brands?.find((brand: any) => brand?.id === e?.target?.value) || {}
                            })
                        }}
                        variant='outline'
                    >
                        {/* <option value=''>Unbranded</option> */}
                        {brands?.map((brand: any) => <option
                            key={brand.id}
                            value={brand.id}
                        >{brand.name}</option>)}
                    </Select>
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

            {/* Delete Dialog */}
            <Confirmation
                isOpen={!!deletingData?.id}
                text={`Are you sure you want to delete <strong>${deletingData?.name}</strong>? You can't undo this action afterwards.`}
                isProcessing={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setDeletingData({})}
            />
        </AppLayout>
    )
}

type ProductsTableProps = {
    data: any,
    isLoading: boolean,
    onEdit: (id: string) => void,
    onDelete: (id: string) => void,
}
const ProductsTable = ({ data, isLoading, onEdit, onDelete }: ProductsTableProps) => {
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
                            <Th>Name</Th>
                            <Th>Brand</Th>
                            {/* <Th>Style</Th> */}
                            <Th textAlign='center'>Link</Th>
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
                                    : reconstructedData.map((item: any) => (
                                        <Tr key={item?.id}>
                                            <Td>
                                                {
                                                    item?.pictureURL
                                                        ? <Image
                                                            src={item?.pictureURL}
                                                            width={28}
                                                            height='auto'
                                                            objectFit='contain'
                                                            alt={item?.name}
                                                            loading="lazy"
                                                        />
                                                        : <IconUnlink size={26} />
                                                }
                                            </Td>
                                            <Td>{item?.name || '-'}</Td>
                                            <Td width={40}>{item?.brand?.name || '-'}</Td>
                                            <Td textAlign='center'>
                                                {
                                                    item?.link
                                                        ? <a
                                                            href={['http', 'https'].includes(item?.link?.substr(0, 4))? item?.link : `http://${item?.link}`}
                                                            target='_blank'
                                                            style={{ display: 'inline-grid', placeSelf: 'center' }}
                                                        ><IconWorldWww size={26} strokeWidth={1.2} /></a>
                                                        : '-'
                                                }
                                            </Td>
                                            <Td textAlign='center'>
                                                {
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
                                                }
                                            </Td>
                                            <Td textAlign='center' color='green.500'>{item?.clickouts || 0}</Td>
                                            <Td textAlign='center'>
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
                                    ))
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

export default ProductsView;