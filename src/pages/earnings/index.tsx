import Pagination from "@/components/Pagination";
import fetch from "@/helpers/fetch";
import formatDateTime from "@/helpers/formatDateTime";
import notify from "@/helpers/notify";
import AppLayout from "@/layouts/app.layout"
import { useAuthGuard } from "@/providers/AuthProvider";
import { Box, Flex, FormControl, IconButton, Input, InputGroup, InputLeftAddon, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import {  IconEdit, IconLoader2 } from "@tabler/icons-react"
import moment from "moment";
import { useEffect, useState } from "react";
import { BiDollar } from "react-icons/bi";

const EarningsView = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [month, setMonth] = useState(moment().format('YYYY-MM'));
    const [data, setData] = useState<any>([]);
    const [dailyPayout, setDailyPayout] = useState<any>({});
    const [isPayoutEditPopoverOpen, setIsPayoutEditPopoverOpen] = useState<boolean>(false);

    useAuthGuard('auth');

    useEffect(() => {
        getData();
        getDailyPayout();
    }, []);

    useEffect(() => {
        // Debounce month
        const debounce = setTimeout(() => {
            getData();
        }, 500);

        return () => clearTimeout(debounce);
    }, [month]);

    const getData = async () => {
        try {
            const response = await fetch({
                endpoint: `/discovers/daily`,
                method: 'PUT',
                data: {
                    startDate: moment(month).startOf('month').format('YYYY-MM-DD') ?? moment().startOf('month').format('YYYY-MM-DD'),
                    endDate: moment(month).endOf('month').format('YYYY-MM-DD') ?? moment().endOf('month').format('YYYY-MM-DD'),
                },
            });

            setData(response);
        } catch (error: any) {
            const message = error?.response?.data || error?.message;
            notify(message, 3000);
        }

        setIsLoading(false);
    };

    const getDailyPayout = async () => {
        try {
            const response = await fetch({
                endpoint: `/discovers/dailypayout`,
                method: 'GET'
            });

            setDailyPayout(response);
        } catch (error: any) {
            const message = error?.response?.data || error?.message;
            notify(message, 3000);
        }
    }

    const handleUpdatePayoutValue = async (event: any) => {
        const value: number = parseFloat(event?.target?.value || 0);

        if(value <= 0) return;

        try {
            const response = await fetch({
                endpoint: `/discovers/dailypayout`,
                method: 'POST',
                data: {
                    payoutValue: value
                }
            });

            setDailyPayout(response);
        } catch (error: any) {
            const message = error?.response?.data || error?.message;
            notify(message, 3000);
        }
    }

    return (
        <AppLayout activePage="Earnings">

            {/* Search and Options */}
            <Flex
                justifyContent='space-between'
                alignItems='center'
                mb={4}
            >
                {/* Page Heading */}
                <h1 className="page-heading">Earnings</h1>

                {/* Search and Actions */}
                <Flex gap={2} alignItems='center'>

                    {/* Date Filters */}
                    <Input
                        type="month"
                        size='sm'
                        bgColor='white'
                        rounded='md'
                        defaultValue={month ?? moment().format('YYYY-MM')}
                        onChange={(e: any) => setMonth(moment(e.target.value).format('YYYY-MM'))}
                    />

                    {/* Edit Payout */}
                    <Popover
                        placement='left'
                        closeOnBlur={true}
                        isOpen={isPayoutEditPopoverOpen}
                        onClose={() => setIsPayoutEditPopoverOpen(false)}
                    >
                        <PopoverTrigger>
                            <IconButton
                                aria-label='Edit Payout'
                                variant='solid'
                                size='sm'
                                rounded='full'
                                borderWidth={2}
                                borderColor='gray.100'
                                icon={<IconEdit size={20} />}
                                onClick={() => setIsPayoutEditPopoverOpen(true)}
                            />
                        </PopoverTrigger>

                        <PopoverContent>
                            <PopoverArrow />
                            <PopoverHeader>Daily Payout Value</PopoverHeader>
                            <PopoverCloseButton />

                            <PopoverBody>
                                <Box p={4}>
                                    <FormControl>
                                        <InputGroup>
                                            <InputLeftAddon><BiDollar /></InputLeftAddon>

                                            <Input
                                                type="number"
                                                required
                                                autoComplete="payout"
                                                step={0.01}
                                                min={0}
                                                value={parseFloat(dailyPayout?.payoutValue)?.toFixed(2)}
                                                onChange={(e: any) => setDailyPayout({ ...dailyPayout, payoutValue: e.target.value })}
                                                onBlur={handleUpdatePayoutValue}
                                            />
                                        </InputGroup>
                                    </FormControl>
                                </Box>
                            </PopoverBody>
                        </PopoverContent>
                    </Popover>
                </Flex>
            </Flex>

            {/* Table */}
            <EarningsTable
                data={data}
                isLoading={isLoading}
            />
        </AppLayout>
    )
}

type EarningsTableProps = {
    data: any,
    isLoading: boolean,
}
const EarningsTable = ({ data, isLoading }: EarningsTableProps) => {
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
                            <Th>Date</Th>
                            <Th textAlign='center' color='blue.500'># of Discovers</Th>
                            <Th textAlign='center' color='green.500'>Daily Revenue Payout</Th>
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
                                    : reconstructedData.map((item: any, index: number) => (
                                        <Tr key={index}>
                                            <Td>{formatDateTime(item?.date, false)}</Td>
                                            <Td textAlign='center' color='blue.500'>{item?.discovers || 0}</Td>
                                            <Td textAlign='center' color='green.500'>${parseFloat(item?.dailyTotalEarnings)?.toFixed(2) || 0}</Td>
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

export default EarningsView;