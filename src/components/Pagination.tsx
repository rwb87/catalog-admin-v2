import { Box, Flex, IconButton, Text } from "@chakra-ui/react"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

type PaginationProps = {
    total: number,
    limit: number,
    page: number,
    setPage: (page: number) => void,
}

const Pagination = ({ total, limit, page, setPage }: PaginationProps) => {
    return (
        <Flex
            justifyContent='center'
            alignItems='center'
            mt={4}
            mb={4}
        >
            {
                total > limit ? <Box>
                    <IconButton
                        aria-label='Previous'
                        variant='ghost'
                        colorScheme='gray'
                        rounded='full'
                        size='sm'
                        icon={<IconChevronLeft size={22} />}
                        onClick={() => setPage(page - 1)}
                        isDisabled={page === 1}
                    />

                    {
                        Array.from({ length: Math.ceil(total / limit) }, (_, index) => (
                            <IconButton
                                key={index}
                                aria-label={`Page ${index + 1}`}
                                variant='ghost'
                                colorScheme='gray'
                                rounded='full'
                                size='sm'
                                ml={2}
                                isActive={page === index + 1}
                                icon={<Text fontWeight='bold'>{index + 1}</Text>}
                                onClick={() => setPage(index + 1)}
                            />
                        ))
                    }

                    <IconButton
                        aria-label='Next'
                        variant='ghost'
                        colorScheme='gray'
                        rounded='full'
                        size='sm'
                        icon={<IconChevronRight size={22} />}
                        onClick={() => setPage(page + 1)}
                        isDisabled={page === Math.ceil(total / limit)}
                    />
                </Box>
                : null
            }
        </Flex>
    )
}

export default Pagination;