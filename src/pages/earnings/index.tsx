import { ROLES } from "@/_config";
import { useUser } from "@/_store";
import Avatar from "@/components/Avatar";
import Pagination from "@/components/Pagination";
import fetch from "@/helpers/fetch";
import formatDateTime from "@/helpers/formatDateTime";
import notify from "@/helpers/notify";
import { Content } from "@/layouts/app.layout"
import { useAuthGuard } from "@/providers/AuthProvider";
import { Box, Flex, FormControl, IconButton, Input, InputGroup, InputLeftAddon, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import {  IconEdit, IconLoader2 } from "@tabler/icons-react"
import moment from "moment";
import { useEffect, useState } from "react";
import { BiDollar } from "react-icons/bi";

const EarningsView = () => {
    const { role: authUserRole } = useUser() as any;
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
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
    }, [date]);

    const getData = async () => {
        try {
            const response = await fetch({
                endpoint: `/discovers/daily`,
                method: 'PUT',
                data: {
                    startDay: date,
                    endDay: date,
                }
            });

            setData(response?.[0]);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message);
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
            const message = error?.response?.data?.message || error?.message;
            notify(message);
        }
    }

    const handleUpdatePayoutValue = async (event: any) => {
        const value: number = parseFloat(event?.target?.value || 0);

        if(value <= 0) return;

        try {
            fetch({
                endpoint: `/discovers/dailypayout`,
                method: 'POST',
                data: {
                    payoutValue: value
                }
            }).then(response => {
                setDailyPayout(response);
            })

            notify('Daily payout updated successfully');
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message);
        }
    }

    return (
        <Content activePage="Earnings">

            {/* Search and Options */}
            <Flex
                direction={{
                    base: 'column',
                    md: 'row',
                }}
                justifyContent='space-between'
                alignItems={{
                    base: 'flex-start',
                    md: 'center',
                }}
                mb={{
                    base: 4,
                    md: 8,
                    xl: 16,
                }}
                gap={2}
                width='full'
            >
                {/* Page Heading */}
                <h1 className="page-heading">Earnings</h1>

                {/* Search and Actions */}
                <Flex
                    gap={2}
                    alignItems='center'
                    width={{
                        base: 'full',
                        md: 'auto',
                    }}
                >

                    {/* Date Filters */}
                    <Input
                        type="date"
                        bgColor='white'
                        rounded='full'
                        width={{
                            base: 'full',
                            lg: '250px',
                        }}
                        size='sm'
                        borderWidth={2}
                        borderColor='gray.100'
                        max={moment().format('YYYY-MM-DD')}
                        defaultValue={date ?? moment().format('YYYY-MM')}
                        onChange={(e: any) => setDate(moment(e.target.value).format('YYYY-MM-DD'))}
                    />

                    {/* Edit Payout */}
                    {
                        authUserRole === ROLES.SUPER_ADMIN && <Popover
                            isLazy={true}
                            placement='left'
                            closeOnBlur={true}
                            isOpen={isPayoutEditPopoverOpen}
                            onClose={() => setIsPayoutEditPopoverOpen(false)}
                        >
                            <PopoverTrigger>
                                <IconButton
                                    aria-label='Edit Payout'
                                    variant='solid'
                                    rounded='full'
                                    borderWidth={2}
                                    borderColor='gray.100'
                                    size='sm'
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
                                                    value={dailyPayout?.payoutValue || 0}
                                                    onChange={(e: any) => setDailyPayout({ ...dailyPayout, payoutValue: e.target.value })}
                                                    onBlur={handleUpdatePayoutValue}
                                                />
                                            </InputGroup>
                                        </FormControl>
                                    </Box>
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>
                    }
                </Flex>
            </Flex>

            {/* Table */}
            <EarningsTable
                data={data}
                isLoading={isLoading}
            />
        </Content>
    )
}

type EarningsTableProps = {
    data: any,
    isLoading: boolean,
}
const EarningsTable = ({ data, isLoading }: EarningsTableProps) => {
    const pagination = {
        total: data?.length ?? 0,
        limit: 50,
    }
    const [page, setPage] = useState<number>(1);

    useEffect(() => {
        setPage(1);
    }, [data?.creators?.length]);

    const reconstructedData = pagination.total > pagination.limit
        ? data?.creators?.slice((page - 1) * pagination.limit, page * pagination.limit)
        : data?.creators;

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
                            <Th>Creator</Th>
                            <Th textAlign='center' color='blue.500'># of Discovers</Th>
                            <Th textAlign='right' color='green.500'>Daily Revenue Payout</Th>
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
                                            <Td whiteSpace='nowrap'>{formatDateTime(data?.date, false)}</Td>
                                            <Td>
                                                <Avatar user={item?.creator} />
                                            </Td>
                                            <Td textAlign='center' color='blue.500'>{item?.creatorDailyTotal || 0}</Td>
                                            <Td textAlign='right' color='green.500' fontWeight='bold'>${parseFloat(item?.creatorDailyEarnings || 0)?.toFixed(2)}</Td>
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