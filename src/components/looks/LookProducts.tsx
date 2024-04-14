import { Box, Button, Flex, Grid, IconButton, Image, Table, Tag, Tbody, Td, Text, Tr } from "@chakra-ui/react";
import { IconArrowDown, IconArrowUp, IconCornerDownRight, IconDeviceFloppy, IconLink, IconPlus, IconTrash } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ProductLinks from "../products/ProductLinks";
import CustomDrawer from "../Drawer";
import SearchableInput from "../SearchableInput";
import fetch from "@/helpers/fetch";
import sortData from "@/helpers/sorting";
import { useGlobalData } from "@/_store";
import notify from "@/helpers/notify";

type LookProductsProps = {
    look: any,
    lookProducts: any;
    allProducts: any;
    onSave: (products: any) => void;
}
const LookProducts = ({ look, lookProducts, allProducts, onSave }: LookProductsProps) => {
    const { brands: globalBrands } = useGlobalData() as any;

    const [editedProducts, setEditedProducts] = useState<any>(lookProducts);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isAddingProductToLook, setIsAddingProductToLook] = useState(false);

    const [selectedBrand, setSelectedBrand] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const filteredAvailableProducts = useMemo(() => {
        const productsInSelectedBrand = selectedBrand ? allProducts.filter((product: any) => product.brandId === selectedBrand.id) : allProducts;

        return productsInSelectedBrand.filter((product: any) => {
            return !editedProducts.find((lookProduct: any) => lookProduct.id === product.id);
        });
    }, [allProducts, editedProducts, selectedBrand]);

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
        setIsProcessing(true);

        const payload = new FormData();

        payload.append('updateReferences', 'true');

        editedProducts.forEach((product: any) => {
            payload.append('items', JSON.stringify(product));
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
                        key={item?.id}
                        item={item}
                        index={index}
                        handleRemove={handleRemove}
                        handleMoveUp={handleMoveUp}
                        handleMoveDown={handleMoveDown}
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
                    setEditedProducts([...editedProducts, selectedProduct]);
                }}
                onClose={() => setIsAddingProductToLook(false)}
            >
                <Grid gap={4}>
                    <SearchableInput
                        data={globalBrands}
                        property="name"
                        defaultValue=''
                        placeholder="Search brand..."
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
    handleMoveUp: (index: number) => void,
    handleMoveDown: (index: number) => void,
    handleRemove: (index: number) => void,
}
const Product = ({ index, item, handleMoveUp, handleMoveDown, handleRemove }: ProductProps) => {
    const [isLinksExpanded, setIsLinksExpanded] = useState<boolean>(false);

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
                                onClick={() => setIsLinksExpanded(!isLinksExpanded)}
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
            <Box
                bgColor='gray.100'
                display={isLinksExpanded ? 'block' : 'none'}
                p={6}
                width='full'
            >
                <ProductLinks
                    links={item?.links ?? [item?.link] ?? []}
                    productId={item?.id}
                    onSave={() => {
                        setIsLinksExpanded(false);
                    }}
                />
            </Box>
        </>
    )
}

export default LookProducts;