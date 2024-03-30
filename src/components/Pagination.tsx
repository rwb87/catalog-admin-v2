import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react";

type PaginationProps = {
    total: number;
    limit: number;
    page: number;
    setPage: (page: number) => void;
};

const Pagination = ({ total, limit, page, setPage }: PaginationProps) => {
    const totalPages = Math.ceil(total / limit);

    const onPageChange = (pageNumber: string | number) => {
        setPage(parseInt(pageNumber.toString()));
    }

    const getPageNumbers = () => {
        const pageNumbers = [];

        if (totalPages <= 10) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            let startPage = Math.max(1, page - 4);
            let endPage = Math.min(totalPages, page + 4);

            if (page <= 5) {
                endPage = 9;
            } else if (page >= totalPages - 4) {
                startPage = totalPages - 8;
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            if (startPage > 1) {
                pageNumbers.unshift("...");
            }
            if (endPage < totalPages) {
                pageNumbers.push("...");
            }
        }

        return pageNumbers;
    };

    return (
        <Flex
            justifyContent={{
                base: 'space-between',
                md: 'center',
            }}
            alignItems="center"
            mt={4}
            mb={4}
            width='full'
        >
            {total > limit ? (
                <>
                    <Flex
                        display={{
                            base: "flex",
                            md: "content",
                        }}
                        gap={2}
                    >
                        <IconButton
                            aria-label="First Page"
                            variant="ghost"
                            colorScheme="gray"
                            rounded="full"
                            size="sm"
                            icon={<IconChevronsLeft size={22} />}
                            onClick={() => onPageChange(1)}
                            isDisabled={page === 1}
                        />

                        <IconButton
                            aria-label="Previous"
                            variant="ghost"
                            colorScheme="gray"
                            rounded="full"
                            size="sm"
                            icon={<IconChevronLeft size={22} />}
                            onClick={() => onPageChange(page - 1)}
                            isDisabled={page === 1}
                        />
                    </Flex>

                    <Box
                        display={{
                            base: "none",
                            md: "contents",
                        }}
                    >
                        {getPageNumbers().map((pageNumber, index) => (
                            <IconButton
                                key={index}
                                aria-label={`Page ${pageNumber}`}
                                variant="ghost"
                                colorScheme="gray"
                                rounded="full"
                                size="sm"
                                ml={2}
                                isActive={page === pageNumber}
                                icon={
                                    <Text fontWeight="bold">
                                        {pageNumber === "..." ? "..." : pageNumber}
                                    </Text>
                                }
                                onClick={() => {
                                    if (pageNumber === "...") onPageChange(page + 1);
                                    else onPageChange(pageNumber);
                                }}
                            />
                        ))}
                    </Box>

                    {/* Page and total pages */}
                    <Box
                        display={{
                            base: "contents",
                            md: "none",
                        }}
                    >
                        <Text fontWeight="bold">
                            Page: {page} of {totalPages}
                        </Text>
                    </Box>

                    <Flex
                        display={{
                            base: "flex",
                            md: "content",
                        }}
                        gap={2}
                    >
                        <IconButton
                            aria-label="Next"
                            variant="ghost"
                            colorScheme="gray"
                            rounded="full"
                            size="sm"
                            icon={<IconChevronRight size={22} />}
                            onClick={() => onPageChange(page + 1)}
                            isDisabled={page === totalPages}
                        />

                        <IconButton
                            aria-label="Last Page"
                            variant="ghost"
                            colorScheme="gray"
                            rounded="full"
                            size="sm"
                            icon={<IconChevronsRight size={22} />}
                            onClick={() => onPageChange(totalPages)}
                            isDisabled={page === totalPages}
                        />
                    </Flex>
                </>
            ) : null}
        </Flex>
    );
};

export default Pagination;