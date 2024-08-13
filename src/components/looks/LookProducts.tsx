import { Box, Button, Flex, Grid, IconButton, Select, Table, Tag, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from "@chakra-ui/react";
import { IconArrowDown, IconArrowMerge, IconArrowUp, IconCornerDownRight, IconDeviceFloppy, IconEdit, IconLink, IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import ProductLinks from "@/components/products/ProductLinks";
import CustomDrawer from "@/components/Drawer";
import SearchableInput from "@/components/SearchableInput";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { useGlobalVolatileStorage } from "@/_store";
import { changeSelectBoxColorForProductReviewStatus, encodeAmpersand } from "@/helpers/utils";
import UpdateBrandDrawer from "@/components/brands/UpdateBrandDrawer";
import UpdateProductDrawer from "@/components/products/UpdateProductDrawer";
import KeywordsPopover from "@/components/KeywordsPopover";
import formatDateTime from "@/helpers/formatDateTime";
import { PRODUCT_REVIEW_OPTIONS } from "@/_config";

type LookProductsProps = {
    look: any,
    onSave: (products: any) => void;
}
const LookProducts = ({ look, onSave }: LookProductsProps) => {
    const { brands: globalBrands } = useGlobalVolatileStorage() as any;
    const [editedProducts, setEditedProducts] = useState<any>();
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isAddingProductToLook, setIsAddingProductToLook] = useState(false);

    const [selectedBrand, setSelectedBrand] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const [newBrand, setNewBrand] = useState<any>({});
    const [newProduct, setNewProduct] = useState<any>({});

    const [isSearchingBrands, setIsSearchingBrands] = useState<boolean>(false);
    const [brandSearchTerm, setBrandSearchTerm] = useState<string>('');
    const [brands, setBrands] = useState<any[]>([]);

    useEffect(() => {
        setIsSearchingBrands(true);
        const debounce = setTimeout(() => getBrands(), 500);
        return () => clearTimeout(debounce);
    }, [brandSearchTerm]);

    useEffect(() => {
        const tags = JSON.parse(JSON.stringify(look?.tags ?? []));
        const sortedTags = tags?.sort((a: any, b: any) => a?.orderIndex - b?.orderIndex);

        setEditedProducts(sortedTags?.map((tag: any) => tag?.item));
    }, [look?.tags]);

    const getBrands = async () => {
        if(brandSearchTerm?.trim() === '') {
            setBrands(globalBrands);
            return setIsSearchingBrands(false);
        }

        try {
            const response = await fetch({
                endpoint: `/brands?search=${encodeAmpersand(brandSearchTerm)}`,
                method: 'GET',
            });

            setBrands(response);
        } catch (error: any) {
            setBrands([]);
        }

        setIsSearchingBrands(false);
    }

    const filteredAvailableProducts = useMemo(() => {
        if(selectedBrand === null) return [];

        const productsInSelectedBrand = selectedBrand ? selectedBrand?.items?.filter((product: any) => product?.brandId === selectedBrand?.id) : selectedBrand?.items || [];

        return productsInSelectedBrand?.filter((product: any) => {
            return !editedProducts?.some((editedProduct: any) => editedProduct?.id === product?.id);
        });
    }, [selectedBrand, editedProducts]);

    const handleRemove = (index: number) => {
        const newLinks = [...editedProducts];
        newLinks.splice(index, 1);
        setEditedProducts(newLinks);
    }

    const handleMoveUp = (index: number) => {
        if(index === 0) return;

        const newLinks = [...editedProducts];
        const [removed] = newLinks.splice(index, 1);
        newLinks.splice(index - 1, 0, removed);
        setEditedProducts(newLinks);
    }

    const handleMoveDown = (index: number) => {
        if(index === editedProducts.length - 1) return;

        const newLinks = [...editedProducts];
        const [removed] = newLinks.splice(index, 1);
        newLinks.splice(index + 1, 0, removed);
        setEditedProducts(newLinks);
    }

    const handleSave = async () => {

        // Reset order index
        const newProducts = editedProducts.map((link: any, index: number) => ({ ...link, orderIndex: index }));
        setEditedProducts(newProducts);

        handleSaveProducts(newProducts);
    }

    const handleSaveProducts = async (products: any[]) => {
        setIsProcessing(true);

        const payload = new FormData();

        payload.append('updateReferences', 'true');

        products?.forEach((product: any, index: number) => {
            payload.append(`items[${index}]`, JSON.stringify(product));
        });

        try {
            const response = await fetch({
                endpoint: `/looks/${look?.id}`,
                method: 'PUT',
                data: payload,
            });

            if (response) {
                onSave(editedProducts);
                notify('Look saved successfully', 3000);
            } else notify('An error occurred', 3000);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsProcessing(false);
    }

    const handleOpenBrandDrawer = () => {
        setNewBrand({
            id: Math.random().toString(36).substring(7),
            name: '',
            pageLink: '',
            pictureURL: '',
            smallPictureURL: '',
            partnership: 'NONE',
            isNew: true,
        })

        setIsAddingProductToLook(false);
    }

    const handleOpenProductDrawer = () => {
        setNewProduct({
            id: Math.random().toString(36).substring(7),
            name: '',
            link: '',
            brand: null,
            brandId: null,
            price: 0,
            dealPrice: 0,
            originalImageLink: '',
            squareImageLink: '',
            isNew: true,
        });

        setIsAddingProductToLook(false);
    }

    const handleCreateNewBrand = async (brand: any) => {
        setIsAddingProductToLook(true);
        setIsSearchingBrands(true);
        await getBrands();
        const isBrandAlreadyIsList = brands.find((b: any) => b.id === brand.id);
        setSelectedBrand(isBrandAlreadyIsList || {
            ...brand,
            items: [],
        });
        setIsSearchingBrands(false);
    }

    const handleCreateNewProduct = (product: any) => {
        setIsAddingProductToLook(true);
        setSelectedBrand(product?.brand);
        setSelectedProduct(product);
    }

    return (
        <>
            <Box>
                <Table>
                    <Thead>
                        <Tr>
                            <Th width='30px' textAlign='center'>#</Th>
                            <Th>Image</Th>
                            <Th>Brand</Th>
                            <Th>Name</Th>
                            <Th>Style</Th>
                            <Th>Platform</Th>
                            <Th textAlign='center'>Links</Th>
                            <Th textAlign='center'>Price</Th>
                            <Th textAlign='center'>Submission Date</Th>
                            <Th textAlign='center'>Review</Th>
                            <Th textAlign='center'>Clickouts</Th>
                            <Th textAlign='right'>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {
                            !editedProducts?.length
                                ? <Tr>
                                    <Td colSpan={20} textAlign='center'>
                                        <Text fontStyle='italic' opacity={0.5}>NO RESULT</Text>
                                    </Td>
                                </Tr>
                                : editedProducts?.map((item: any, index: number) => <Product
                                    key={item?.id || index}
                                    item={item}
                                    index={index}
                                    handleMoveUp={handleMoveUp}
                                    handleMoveDown={handleMoveDown}
                                    handleRemove={handleRemove}
                                />
                        )}
                    </Tbody>
                </Table>
            </Box>

            {/* Search and Add product to Look Drawer */}
            <CustomDrawer
                isOpen={isAddingProductToLook}
                title='Add new product to Look'
                cancelText='Cancel'
                submitText='Add'
                isProcessing={false}
                onSubmit={() => {
                    setIsAddingProductToLook(false);
                    if(selectedProduct) {
                        setEditedProducts([
                            ...editedProducts,
                            {
                                ...selectedProduct,
                                brand: selectedBrand,
                            }
                        ]);
                        setSelectedBrand(null);
                        setSelectedProduct(null);
                    }
                }}
                onClose={() => {
                    setIsAddingProductToLook(false)
                    setSelectedBrand(null);
                    setSelectedProduct(null);
                }}
            >
                <Grid
                    templateColumns='repeat(2, 1fr)'
                    gap={4}
                    mb={4}
                >
                    <Button
                        variant='solid'
                        colorScheme='blue'
                        size='sm'
                        leftIcon={<IconPlus size={20} />}
                        onClick={handleOpenBrandDrawer}
                    >Create new Brand</Button>

                    <Button
                        variant='solid'
                        colorScheme='blue'
                        size='sm'
                        leftIcon={<IconPlus size={20} />}
                        onClick={handleOpenProductDrawer}
                    >Create new Product</Button>
                </Grid>

                <Grid gap={4}>
                    <SearchableInput
                        data={brands}
                        property="name"
                        defaultValue={selectedBrand?.name || ''}
                        placeholder="Search brand..."
                        isLoading={isSearchingBrands}
                        onInputChange={(searchTerm: string) => setBrandSearchTerm(searchTerm)}
                        onSelect={(item: any) => setSelectedBrand(item)}
                    />

                    <SearchableInput
                        data={filteredAvailableProducts}
                        property="name"
                        defaultValue={selectedProduct?.name || ''}
                        placeholder="Search product..."
                        onSelect={(item: any) => setSelectedProduct(item)}
                    />
                </Grid>
            </CustomDrawer>

            {/* Create Brand Drawer */}
            <UpdateBrandDrawer
                data={newBrand}
                onSave={handleCreateNewBrand}
                onClose={() => {
                    setNewBrand({})
                    setIsAddingProductToLook(true);
                }}
            />

            {/* Create Product Drawer */}
            <UpdateProductDrawer
                data={newProduct}
                onSave={handleCreateNewProduct}
                onClose={() => {
                    setNewProduct({});
                    setIsAddingProductToLook(true);
                }}
            />

            {/* Actions */}
            <Flex
                alignItems='center'
                justifyContent='space-between'
                mt={4}
            >
                <Button
                    variant='solid'
                    colorScheme='green'
                    size='sm'
                    leftIcon={<IconPlus size={20} />}
                    onClick={() => setIsAddingProductToLook(true)}
                >Add Product</Button>

                <Button
                    variant='solid'
                    colorScheme='green'
                    size='sm'
                    leftIcon={<IconDeviceFloppy size={20} />}
                    isLoading={isProcessing}
                    isDisabled={isProcessing}
                    loadingText='Saving...'
                    onClick={handleSave}
                >Save Products</Button>
            </Flex>
        </>
    )
}

type ProductProps = {
    index: number,
    item: any,
    handleMoveUp: (index: number) => void,
    handleMoveDown: (index: number) => void,
    handleRemove: (index: number) => void,
}
const Product = ({ index, item, handleMoveUp, handleMoveDown, handleRemove }: ProductProps) => {
    const [links, setLinks] = useState<any[] | null>(null);

    useEffect(() => {
        const closeLinks = () => {
            setLinks(null);
        }

        window.addEventListener('refresh:creator-changed', closeLinks);

        return () => {
            window.removeEventListener('refresh:creator-changed', closeLinks);
        }
    }, []);

    const handleOpenImage = (link: string) => {
        window?.dispatchEvent(new CustomEvent('lightcase', { detail: { image: link } }));
    }

    const alphaLink = item?.links?.find((link: any) => link?.linkType === 'ALPHA');
    const productPrice = parseFloat(alphaLink?.price || item?.price || 0).toFixed(2);
    const productDiscountPrice = parseFloat(alphaLink?.discountPrice || item?.dealPrice || 0).toFixed(2);
    const productDiscountPercentage = parseFloat(productDiscountPrice) < parseFloat(productPrice)
        ? ((alphaLink?.discountPrice || item?.dealPrice) ? ((parseFloat(productDiscountPrice) - parseFloat(productPrice)) / parseFloat(productPrice)) * 100 : 0).toFixed(0)
        : '100';

    if(!item) return null;

    return (
        <>
            <Tr>
                <Td width='30px' textAlign='left'>
                    <IconCornerDownRight size={20} />
                </Td>
                <Td>
                    {
                        item?.originalImageLink
                            ? <Box
                                position='relative'
                                textAlign='center'
                                width={28}
                            >
                                <img
                                    src={item?.squareImageLink}
                                    width='full'
                                    height='auto'
                                    alt={item?.name}
                                    loading="lazy"
                                    style={{
                                        objectFit: 'cover',
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => handleOpenImage(item?.originalImageLink)}
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
                <Td>
                    {
                        item?.brand
                        ? item?.brand?.pictureURL
                            ?  <Box width={28}>
                                <img
                                    src={item?.brand?.smallPictureURL}
                                    alt={item?.brand?.name}
                                    width='full'
                                    height='full'
                                    loading="lazy"
                                    style={{
                                        objectFit: 'contain',
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        aspectRatio: '1/1',
                                    }}
                                    onError={(e: any) => {
                                        e.target.src = '/images/cover-placeholder.webp';
                                        e.target.onerror = null;
                                    }}
                                    onClick={() => handleOpenImage(item?.brand?.pictureURL)}
                                />
                            </Box>
                            : item?.brand?.name
                        : '-'
                    }
                </Td>
                <Td width='250px'>{item?.name || '-'}</Td>
                <Td>{item?.style?.label || '-'}</Td>
                <Td>{item?.isShopify ? 'Shopify' : 'General'}</Td>
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
                    <Text whiteSpace='nowrap'><strong>${productPrice}</strong></Text>
                    { parseFloat(productDiscountPrice) > 0 ? <Text whiteSpace='nowrap'>Deal Price: <strong>${productDiscountPrice}</strong></Text> : null }
                </Td>
                <Td textAlign='center'>{formatDateTime(item?.createdAt, false)}</Td>
                <Td textAlign='center'>
                    <Tooltip label={PRODUCT_REVIEW_OPTIONS?.find(option => option.value === item?.reviewStatus)?.label} placement="bottom">
                        <Select
                            variant='solid'
                            size='xs'
                            rounded='full'
                            width={24}
                            background={changeSelectBoxColorForProductReviewStatus(item?.reviewStatus)}
                            isTruncated={true}
                            color='white'
                            style={{
                                color: 'white',
                            }}
                            defaultValue={item?.reviewStatus}
                            onChange={(event: any) => {
                                const { value } = event.target;

                                event.target.style.backgroundColor = changeSelectBoxColorForProductReviewStatus(value);
                                window.dispatchEvent(new CustomEvent('action:change-product-review-status', { detail: { productId: item?.id, reviewStatus: value } }))
                            }}
                        >{PRODUCT_REVIEW_OPTIONS?.map((option: { label: string, value: string }, index: number) => <option key={index} value={option?.value}>{option?.label}</option>)}</Select>
                    </Tooltip>
                </Td>
                <Td textAlign='center' color='green.500'>{item?.clickouts || 0}</Td>
                <Td textAlign='right' whiteSpace='nowrap'>

                    <Tooltip label="Move up">
                        <IconButton
                            aria-label='Move Up'
                            variant='ghost'
                            colorScheme='blue'
                            rounded='full'
                            size='sm'
                            icon={<IconArrowUp size={22} />}
                            onClick={() => handleMoveUp(index)}
                        />
                    </Tooltip>

                    <Tooltip label="Move down">
                        <IconButton
                            aria-label='Move Down'
                            variant='ghost'
                            colorScheme='blue'
                            rounded='full'
                            size='sm'
                            ml={4}
                            icon={<IconArrowDown size={22} />}
                            onClick={() => handleMoveDown(index)}
                        />
                    </Tooltip>

                    <KeywordsPopover type="products" id={item?.id} />

                    <Tooltip label="Merge Products">
                        <IconButton
                            aria-label="Merge Products"
                            variant='ghost'
                            rounded='full'
                            size='sm'
                            ml={4}
                            icon={<IconArrowMerge size={22} />}
                            onClick={() => window.dispatchEvent(new CustomEvent('drawer:merge-products', { detail: { product: item } }))}
                        />
                    </Tooltip>

                    <Tooltip label="Edit">
                        <IconButton
                            aria-label="Edit"
                            variant='ghost'
                            rounded='full'
                            ml={4}
                            size='sm'
                            icon={<IconEdit size={22} />}
                            onClick={() => window?.dispatchEvent(new CustomEvent('action:edit-product', { detail: { product: item, brand: item?.brand } }))}
                        />
                    </Tooltip>

                    <Tooltip label="Delete">
                        <IconButton
                            aria-label='Delete'
                            variant='ghost'
                            colorScheme='red'
                            rounded='full'
                            size='sm'
                            ml={4}
                            icon={<IconTrash size={22} />}
                            onClick={() => handleRemove(index)}
                        />
                    </Tooltip>
                </Td>
            </Tr>

            {/* Product Links */}
            {
                links !== null
                    ? <Tr bgColor='gray.100' p={6}>
                        <Td colSpan={20}>
                            <ProductLinks
                                links={links}
                                productId={item?.id}
                                onCancel={() => setLinks(null)}
                                onSave={(links: any) => {
                                    item.links = links;
                                    setLinks(null);
                                }}
                            />
                        </Td>
                    </Tr>
                    : null
            }
        </>
    )
}

export default LookProducts;