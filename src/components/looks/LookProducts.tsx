import { Box, Button, Flex, Grid, IconButton, Image, Table, Tag, Tbody, Td, Text, Tr } from "@chakra-ui/react";
import { IconCornerDownRight, IconDeviceFloppy, IconLink, IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import ProductLinks from "../products/ProductLinks";
import CustomDrawer from "../Drawer";
import SearchableInput from "../SearchableInput";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";

type LookProductsProps = {
    look: any,
    onSave: (products: any) => void;
}
const LookProducts = ({ look, onSave }: LookProductsProps) => {
    const [editedProducts, setEditedProducts] = useState<any>();
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isAddingProductToLook, setIsAddingProductToLook] = useState(false);

    const [selectedBrand, setSelectedBrand] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const [isSearchingBrands, setIsSearchingBrands] = useState<boolean>(false);
    const [brandSearchTerm, setBrandSearchTerm] = useState<string>('');
    const [brands, setBrands] = useState<any[]>([]);

    useEffect(() => {
        const debounce = setTimeout(() => getBrands(), 500);
        return () => clearTimeout(debounce);
    }, [brandSearchTerm]);

    useEffect(() => {
        const tags = JSON.parse(JSON.stringify(look?.tags ?? []))

        setEditedProducts(tags?.map((tag: any) => tag?.item));
    },  [look?.tags]);

    const getBrands = async () => {
        setIsSearchingBrands(true);
        if (brandSearchTerm?.trim() === '' || brandSearchTerm?.trim()?.length < 3) {
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

    const filteredAvailableProducts = useMemo(() => {
        if(selectedBrand === null) return [];

        const productsInSelectedBrand = selectedBrand ? selectedBrand?.items?.filter((product: any) => product?.brandId === selectedBrand?.id) : selectedBrand?.items || [];

        return productsInSelectedBrand.filter((product: any) => {
            return !editedProducts?.some((editedProduct: any) => editedProduct?.id === product?.id);
        });
    }, [selectedBrand, editedProducts]);

    const handleRemove = (index: number) => {
        const newLinks = [...editedProducts];
        newLinks.splice(index, 1);
        setEditedProducts(newLinks);
    }

    // const handleMoveUp = (index: number) => {
    //     if(index === 0) return;

    //     const newLinks = [...editedProducts];
    //     const [removed] = newLinks.splice(index, 1);
    //     newLinks.splice(index - 1, 0, removed);
    //     setEditedProducts(newLinks);
    // }

    // const handleMoveDown = (index: number) => {
    //     if(index === editedProducts.length - 1) return;

    //     const newLinks = [...editedProducts];
    //     const [removed] = newLinks.splice(index, 1);
    //     newLinks.splice(index + 1, 0, removed);
    //     setEditedProducts(newLinks);
    // }

    const handleSave = async () => {
        setIsProcessing(true);

        const payload = new FormData();

        payload.append('updateReferences', 'true');

        editedProducts?.forEach((product: any, index: number) => {
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

    return (
        <>
            <Box>
                {
                    editedProducts?.map((item: any, index: number) => <Product
                        key={item?.id || index}
                        item={item}
                        index={index}
                        // handleMoveUp={handleMoveUp}
                        // handleMoveDown={handleMoveDown}
                        handleRemove={handleRemove}
                    />
                )}
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
                <Grid gap={4}>
                    <SearchableInput
                        data={brands}
                        property="name"
                        defaultValue=''
                        placeholder="Search brand..."
                        isLoading={isSearchingBrands}
                        onDynamicSearch={(searchTerm: string) => setBrandSearchTerm(searchTerm)}
                        onChange={(item: any) => setSelectedBrand(item)}
                    />

                    <SearchableInput
                        data={filteredAvailableProducts}
                        property="name"
                        defaultValue=''
                        placeholder="Search product..."
                        onChange={(item: any) => setSelectedProduct(item)}
                    />
                </Grid>
            </CustomDrawer>

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
    // handleMoveUp: (index: number) => void,
    // handleMoveDown: (index: number) => void,
    handleRemove: (index: number) => void,
}
const Product = ({ index, item, handleRemove }: ProductProps) => {
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
            <Table>
                <Tbody>
                    <Tr>
                        <Td width='30px' textAlign='left'>
                            <IconCornerDownRight size={20} />
                        </Td>
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
                        <Td width={40}>{item?.brand?.name || '-'}</Td>
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
                        <Td textAlign='right' whiteSpace='nowrap'>
                            {/* <IconButton
                                aria-label='Move Up'
                                variant='ghost'
                                colorScheme='blue'
                                rounded='full'
                                size='sm'
                                icon={<IconArrowUp size={22} />}
                                onClick={() => handleMoveUp(index)}
                            />

                            <IconButton
                                aria-label='Move Down'
                                variant='ghost'
                                colorScheme='blue'
                                rounded='full'
                                size='sm'
                                ml={4}
                                icon={<IconArrowDown size={22} />}
                                onClick={() => handleMoveDown(index)}
                            /> */}

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
                        </Td>
                    </Tr>
                </Tbody>
            </Table>

            {/* Product Links */}
            {
                links !== null
                    ? <Box
                        bgColor='gray.100'
                        p={6}
                        width='full'
                    >
                        <ProductLinks
                            links={links}
                            productId={item?.id}
                            onCancel={() => setLinks(null)}
                            onSave={(links: any) => {
                                item.links = links;
                                setLinks(null);
                            }}
                        />
                    </Box>
                    : null
            }
        </>
    )
}

export default LookProducts;