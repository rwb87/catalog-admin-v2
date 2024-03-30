import { Button, Flex, IconButton, Image, Table, Tbody, Td, Text, Tr } from "@chakra-ui/react";
import { IconArrowDown, IconArrowUp, IconCornerDownRight, IconPlus, IconTrash, IconWorldWww } from "@tabler/icons-react";

type LookProductsProps = {
    products: any;
}
const LookProducts = ({ products }: LookProductsProps) => {
    return (
        <>
            <Table>
                <Tbody>
                    {
                        products?.map((tag: any, index: number) => <Tr key={index}>
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
                                            loading="lazy"
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
                            <Td textAlign='right'>
                                <IconButton
                                    aria-label='Move Up'
                                    variant='ghost'
                                    colorScheme='blue'
                                    rounded='full'
                                    size='sm'
                                    icon={<IconArrowUp size={22} />}
                                />

                                <IconButton
                                    aria-label='Move Down'
                                    variant='ghost'
                                    colorScheme='blue'
                                    rounded='full'
                                    size='sm'
                                    ml={4}
                                    icon={<IconArrowDown size={22} />}
                                />

                                <IconButton
                                    aria-label='Delete'
                                    variant='ghost'
                                    colorScheme='red'
                                    rounded='full'
                                    size='sm'
                                    ml={4}
                                    icon={<IconTrash size={22} />}
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
                >Add Product</Button>

                <Button
                    variant='solid'
                    colorScheme='green'
                    size='sm'
                >Save Products List</Button>
            </Flex>
        </>
    )
}

export default LookProducts;