import { Button, Flex, IconButton, Image, Table, Tbody, Td, Text, Tr } from "@chakra-ui/react";
import { IconArrowDown, IconArrowUp, IconCornerDownRight, IconDeviceFloppy, IconPlus, IconTrash, IconWorldWww } from "@tabler/icons-react";
import { useEffect, useState } from "react";

type LookProductsProps = {
    products: any;
    onSave: (products: any) => void;
}
const LookProducts = ({ products }: LookProductsProps) => {
    const [editedProducts, setEditedProducts] = useState<any>(products);

    useEffect(() => {
        setEditedProducts(products);
    }, [products]);

    const handleAddNew = () => {}

    const handleRemove = (index: number) => {
        const newLinks = [...editedProducts];
        newLinks.splice(index, 1);
        setEditedProducts(newLinks);
    }

    const handleMoveUp = (index: number) => {
        const newLinks = [...editedProducts];
        const [removed] = newLinks.splice(index, 1);
        newLinks.splice(index - 1, 0, removed);
        setEditedProducts(newLinks);
    }

    const handleMoveDown = (index: number) => {
        const newLinks = [...editedProducts];
        const [removed] = newLinks.splice(index, 1);
        newLinks.splice(index + 1, 0, removed);
        setEditedProducts(newLinks);
    }

    const handleOpenImage = (link: string) => {
        window?.dispatchEvent(new CustomEvent('lightcase', { detail: { image: link } }));
    }

    return (
        <>
            <Table>
                <Tbody>
                    {
                        editedProducts?.map((tag: any, index: number) => <Tr key={index}>
                            <Td width='30px' textAlign='left'>
                                <IconCornerDownRight size={20} />
                            </Td>
                            <Td>

                                {
                                    tag?.item?.pictureURL
                                        ? <Image
                                            src={tag?.item?.pictureURL}
                                            width={20}
                                            height={28}
                                            objectFit='cover'
                                            rounded='md'
                                            alt={tag?.item?.name}
                                            cursor='pointer'
                                            loading="lazy"
                                            onClick={() => handleOpenImage(tag?.item?.pictureURL)}
                                            onError={(e: any) => {
                                                e.target.src = '/images/cover-placeholder.webp';
                                                e.target.onerror = null;
                                            }}
                                        />
                                        : '-'
                                }
                            </Td>
                            <Td width={40}>{tag?.item?.brand?.name || '-'}</Td>
                            <Td>{tag?.item?.name || '-'}</Td>
                            <Td>{tag?.item?.style || '-'}</Td>
                            <Td textAlign='center'>
                                {
                                    tag?.item?.link
                                        ? <a
                                            href={['http', 'https'].includes(tag?.item?.link?.substr(0, 4))? tag?.item?.link : `http://${tag?.item?.link}`}
                                            target='_blank'
                                            style={{ display: 'inline-grid', placeSelf: 'center' }}
                                        ><IconWorldWww size={26} strokeWidth={1.2} /></a>
                                        : '-'
                                }
                            </Td>
                            <Td textAlign='center'>
                                <Text>Price: <strong>${parseFloat(tag?.item?.price || 0)?.toFixed(2)}</strong></Text>
                                { tag?.item?.dealPrice ? <Text>Deal Price: <strong>${parseFloat(tag?.item?.dealPrice)?.toFixed(2)}</strong></Text> : null }
                            </Td>
                            <Td textAlign='center' color='green.500'>{tag?.item?.clickouts || 0}</Td>
                            <Td textAlign='right' whiteSpace='nowrap'>
                                <IconButton
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
                                />

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
                    )}
                </Tbody>
            </Table>

            {/* Actions */}
            <Flex alignItems='center' justifyContent='space-between' mt={4}>
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
            </Flex>
        </>
    )
}

export default LookProducts;