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
        const $bodyContainer = document.getElementById('body-container');

        setPage(parseInt(pageNumber.toString()));

        if($bodyContainer) $bodyContainer?.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
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
            my={totalPages > 1 ? 4 : 0}
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
                            title="First Page"
                            isDisabled={page === 1}
                            icon={<IconChevronsLeft size={22} />}
                            onClick={() => onPageChange(1)}
                        />

                        <IconButton
                            aria-label="Previous"
                            variant="ghost"
                            colorScheme="gray"
                            rounded="full"
                            size="sm"
                            title="Previous"
                            isDisabled={page === 1}
                            icon={<IconChevronLeft size={22} />}
                            onClick={() => onPageChange(page - 1)}
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
                                title={`Page ${pageNumber}`}
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
                            title="Next"
                            isDisabled={page === totalPages}
                            icon={<IconChevronRight size={22} />}
                            onClick={() => onPageChange(page + 1)}
                        />

                        <IconButton
                            aria-label="Last Page"
                            variant="ghost"
                            colorScheme="gray"
                            rounded="full"
                            size="sm"
                            title="Last Page"
                            isDisabled={page === totalPages}
                            icon={<IconChevronsRight size={22} />}
                            onClick={() => onPageChange(totalPages)}
                        />
                    </Flex>
                </>
            ) : null}
        </Flex>
    );
};

export default Pagination;