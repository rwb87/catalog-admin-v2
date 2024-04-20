import { IconButton, Image, Table, Tbody, Td, Text, Tr } from "@chakra-ui/react";
import { IconCornerDownRight, IconLink } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import ProductLinks from "../products/ProductLinks";

type BrandProductsProps = {
    brand: any;
    products: any;
    onSave: (products: any) => void;
}
const BrandProducts = ({ brand, products }: BrandProductsProps) => {
    const [editedProducts, setEditedProducts] = useState<any>([]);

    useEffect(() => {
        const newProducts = JSON.parse(JSON.stringify(products));
        setEditedProducts(newProducts);
    }, [products]);

    // const handleRemove = (index: number) => {
    //     const newLinks = [...editedProducts];
    //     newLinks.splice(index, 1);
    //     setEditedProducts(newLinks);
    // }

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

    const handleOnOpenImage = (link: string) => {
        window?.dispatchEvent(new CustomEvent('lightcase', { detail: { image: link } }));
    }

    return (
        <>
            <Table>
                <Tbody>
                    {
                        editedProducts?.map((product: any) => <Product
                            key={product?.id}
                            product={product}
                            brand={brand}
                            handleOnOpenImage={handleOnOpenImage}
                        />
                    )}
                </Tbody>
            </Table>

            {/* Actions */}
            {/* <Flex alignItems='center' justifyContent='space-between' mt={4}>
                <Button
                    variant='solid'
                    colorScheme='green'
                    size='sm'
                    leftIcon={<IconPlus size={20} />}
                    onClick={handleAddNew}
                >Add</Button>

                <Button
                    variant='solid'
                    colorScheme='green'
                    size='sm'
                    leftIcon={<IconDeviceFloppy size={20} />}
                >Save</Button>
            </Flex> */}
        </>
    )
}

type ProductProps = {
    product: any;
    brand: any;
    handleOnOpenImage: (link: string) => void;
}
const Product = ({ product, brand, handleOnOpenImage }: ProductProps) => {
    const [links, setLinks] = useState<any[] | null>(null);

    return (
        <>
            <Tr key={product?.id}>
                <Td width='30px' textAlign='left'>
                    <IconCornerDownRight size={20} />
                </Td>
                <Td>

                    {
                        product?.pictureURL
                            ? <Image
                                src={product?.pictureURL}
                                alt={product?.name}
                                width={20}
                                height={28}
                                objectFit='contain'
                                rounded='md'
                                cursor='pointer'
                                loading="lazy"
                                onClick={() => handleOnOpenImage(product?.pictureURL)}
                                onError={(e: any) => {
                                    e.target.src = '/images/cover-placeholder.webp';
                                    e.target.onerror = null;
                                }}
                            />
                            : '-'
                    }
                </Td>
                <Td width={40}>{brand?.name || '-'}</Td>
                <Td>{product?.name || '-'}</Td>
                <Td>{product?.style || '-'}</Td>
                <Td textAlign='center'>
                    {
                        <IconButton
                            aria-label='View Links'
                            variant='ghost'
                            rounded='full'
                            size='sm'
                            icon={<IconLink size={22} />}
                            onClick={() => {
                                if(links === null) setLinks(product?.links || [product?.link] || []);
                                else setLinks(null);
                            }}
                        />
                    }
                </Td>
                <Td textAlign='center'>
                    <Text>Price: <strong>${parseFloat(product?.price || 0)?.toFixed(2)}</strong></Text>
                    { product?.dealPrice ? <Text>Deal Price: <strong>${parseFloat(product?.dealPrice)?.toFixed(2)}</strong></Text> : null }
                </Td>
                <Td textAlign='center' color='green.500'>{product?.clickouts || 0}</Td>
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

                    {/* <IconButton
                        aria-label='Delete'
                        variant='ghost'
                        colorScheme='red'
                        rounded='full'
                        size='sm'
                        ml={4}
                        icon={<IconTrash size={22} />}
                        onClick={() => handleRemove(index)}
                    /> */}
                </Td>
            </Tr>

            {/* Product Links */}
            {
                links !== null
                    ? <Tr bgColor='gray.100'>
                        <Td colSpan={20}>
                            <ProductLinks
                                links={links}
                                productId={product?.id}
                                onCancel={() => setLinks(null)}
                                onSave={(links: any) => {
                                    product.links = links;
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

export default BrandProducts;