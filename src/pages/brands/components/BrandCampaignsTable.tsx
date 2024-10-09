import Confirmation from "@/components/Confirmation";
import ImagePopover from "@/components/ImagePopover";
import fetch from "@/helpers/fetch";
import formatDateTime from "@/helpers/formatDateTime";
import notify from "@/helpers/notify";
import { capitalize, renderTargetGender } from "@/helpers/utils";
import { Box, Flex, Table, Tbody, Td, Th, Thead, Tr , IconButton, Tooltip, Select } from "@chakra-ui/react";
import { IconLoader2, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";

type TableProps = {
    brandId: string;
}
export default function BrandCampaignsTable({ brandId }: TableProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [changingStatus, setChangingStatus] = useState({
        id: null,
        status: null,
    });

    useEffect(() => {
        const getData = async () => {
            setIsLoading(true);

            try {
                const response = await fetch({ endpoint: `/campaigns/ad-campaigns/${brandId}` });
                setData(response?.campaigns);
            } catch (error: any) {
                console.error(error);
                notify(error.message, 'error');
            }

            setIsLoading(false);
        }

        getData();

        window.addEventListener('reload:brand-campaigns', getData);

        return () => {
            window.removeEventListener('reload:brand-campaigns', getData);
        }
    }, [brandId]);

    // const renderStatus = (status: string) => {
    //     switch (status) {
    //         case 'active': return <Text fontWeight='semibold' color='green.500'>Active</Text>;
    //         case 'inactive': return <Text fontWeight='semibold' color='red.500'>Inactive</Text>;
    //         default: return <Text fontWeight='semibold' color='green.500'>Active</Text>;
    //     }
    // }

    const handleUpdateStatus = async () => {
        setIsProcessing(true);

        try {
            await fetch({
                endpoint: `/campaigns/ad-campaigns/${changingStatus?.id}`,
                method: 'PUT',
                data: { status: changingStatus.status },
            })

            const newData = [...data];
            const index = newData.findIndex(item => item?.id === changingStatus.id);
            newData[index].status = changingStatus.status;

            setData(newData);

            notify(`Campaign ${changingStatus.status === 'active' ? 'activated' : 'paused'} successfully`, 'success');
        } catch (error) {
            console.error(error);
            notify('An error occurred while updating campaign status', 'error');
        }

        setIsProcessing(false);
        setChangingStatus({ id: null, status: null });

        window.dispatchEvent(new CustomEvent('reload:data'));
    }

    return (
        <Box>
            <Table variant='simple'>
                <Thead>
                    <Tr>
                        <Th>Status</Th>
                        <Th textAlign='center'>Ad</Th>
                        <Th textAlign='center'>Campaign Name</Th>
                        <Th textAlign='center'>Launched By</Th>
                        <Th textAlign='center'>Audience</Th>
                        <Th textAlign='center' color='var(--table-header-green)'>Daily Budget</Th>
                        <Th textAlign='center' color='var(--table-header-blue)'>CPC</Th>
                        <Th textAlign='center' color='var(--table-header-green)'>Total Spent</Th>
                        <Th textAlign='center' color='var(--table-header-blue)'>
                            <Tooltip label="Impressions">
                                <svg style={{ margin: '0 auto' }} viewBox="0 0 116 116" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth="6" strokeLinecap="square" strokeLinejoin="round" stroke="#3b82f6">
                                    <path d="M99.0163 41.2881L102.269 44.5406C105.766 48.0382 107.731 52.782 107.731 57.7283C107.731 62.6746 105.766 67.4184 102.269 70.9159L99.0163 74.1685C88.0661 85.1188 73.2143 91.2706 57.7283 91.2706C42.2423 91.2706 27.3905 85.1188 16.4402 74.1685L13.1876 70.9159C9.69007 67.4184 7.72533 62.6746 7.72533 57.7283C7.72533 52.782 9.69007 48.0382 13.1876 44.5406L16.4402 41.2881C27.3905 30.3378 42.2423 24.186 57.7283 24.186C73.2143 24.186 88.0661 30.3378 99.0163 41.2881Z" stroke="#3b82f6" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M57.7317 90.7266C70.3569 90.7266 80.5917 75.952 80.5917 57.7266C80.5917 39.5012 70.3569 24.7266 57.7317 24.7266C45.1065 24.7266 34.8717 39.5012 34.8717 57.7266C34.8717 75.952 45.1065 90.7266 57.7317 90.7266Z" stroke="#3b82f6" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M57.7317 65.0765C61.791 65.0765 65.0817 61.7858 65.0817 57.7265C65.0817 53.6672 61.791 50.3765 57.7317 50.3765C53.6724 50.3765 50.3817 53.6672 50.3817 57.7265C50.3817 61.7858 53.6724 65.0765 57.7317 65.0765Z" fill="#3b82f6"/>
                                </svg>
                            </Tooltip>
                        </Th>
                        <Th textAlign='center'color='var(--table-header-blue)'>
                            <Tooltip label="Clicks">
                                <svg style={{ margin: '0 auto' }} viewBox="0 0 52 74" fill="none" xmlns="http://www.w3.org/2000/svg" stroke='var(--table-header-blue)' strokeWidth="6" strokeLinecap="square" strokeLinejoin="round">
                                    <path d="M45.7671 39.4384L31.1516 34.341L31.3158 22.1034C31.3262 21.3964 31.196 20.6943 30.9327 20.0381C30.6693 19.3818 30.278 18.7845 29.7817 18.2808C29.2853 17.7772 28.6938 17.3772 28.0415 17.1042C27.3892 16.8313 26.6892 16.6907 25.982 16.6908C25.2807 16.6908 24.5862 16.829 23.9383 17.0973C23.2904 17.3657 22.7017 17.7591 22.2058 18.255C21.7099 18.7509 21.3165 19.3396 21.0481 19.9875C20.7797 20.6355 20.6416 21.3299 20.6416 22.0312V45.7839C20.6344 46.1635 20.5096 46.5316 20.2842 46.8372C20.0589 47.1428 19.744 47.3709 19.3834 47.4899C19.0229 47.6089 18.6343 47.6129 18.2713 47.5015C17.9083 47.39 17.5889 47.1685 17.3572 46.8677L13.2912 42.1119C12.399 41.0681 11.1338 40.4149 9.76622 40.2922C8.39862 40.1694 7.03721 40.5868 5.97346 41.455C4.88876 42.3222 4.1915 43.5836 4.03395 44.9634C3.8764 46.3431 4.27136 47.7292 5.13264 48.8186L21.5087 69.7073L41.2149 69.6416C41.8692 69.6422 42.5031 69.4139 43.0069 68.9965C43.5107 68.5791 43.8527 67.9986 43.9738 67.3556L47.9545 43.1366C48.0839 42.3613 47.9353 41.5652 47.5351 40.8886C47.135 40.2121 46.5088 39.6985 45.7671 39.4384Z" />
                                    <path d="M9.10034 20.4219C9.10034 11.3504 16.7595 4 26.1791 4C35.5987 4 43.2579 11.357 43.2579 20.4219" />
                                </svg>
                            </Tooltip>
                        </Th>
                        <Th textAlign='center' color='var(--table-header-blue)'>
                            <Tooltip label="CTR">
                                <svg style={{ margin: '0 auto', width: 60 }} viewBox="0 0 116 69" stroke='var(--table-header-blue)' fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="3.70728" width="110" height="62" rx="31" strokeWidth="6"/>
                                    <path d="M30.9576 34.1313C30.9576 28.4678 35.0616 24.1996 41.1355 24.1996C46.717 24.1996 50.2464 27.729 50.903 32.0793H45.1848C44.8291 30.5198 43.297 29.2612 41.1355 29.2612C39.7128 29.2612 38.5637 29.7263 37.7155 30.6566C36.8674 31.5594 36.4296 32.7359 36.4296 34.1313C36.4296 37.0041 38.2901 39.0014 41.1355 39.0014C43.2422 39.0014 44.7744 37.7975 45.431 36.2654H51.1493C50.4926 40.5882 46.6622 44.063 41.1355 44.063C35.0616 44.063 30.9576 39.7948 30.9576 34.1313ZM56.8019 29.0697H51.6582V24.5553H67.2261V29.0697H62.055V43.7073H56.8019V29.0697ZM74.6718 43.7073H69.4187V24.5553H77.3531C79.3504 24.5553 81.0193 25.1846 82.36 26.4158C83.7006 27.647 84.3846 29.2338 84.3846 31.1764C84.3846 33.5567 83.2081 35.5814 81.2656 36.7852L85.1507 43.7073H79.3777L76.5323 37.8796H74.6718V43.7073ZM74.6718 28.9876V33.4473H76.8059C78.1192 33.4473 79.0494 32.5991 79.0494 31.1764C79.0494 29.781 78.1192 28.9876 76.8059 28.9876H74.6718Z" fill='var(--table-header-blue)' />
                                </svg>
                            </Tooltip>
                        </Th>
                        <Th textAlign='center'>Launched At</Th>
                        <Th textAlign='right'>Actions</Th>
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
                            : !data?.length
                                ? <Tr><Td colSpan={20} textAlign='center'>No campaign</Td></Tr>
                                : data?.map((item: any) => (
                                    <Tr key={item?.id}>
                                        <Td>
                                            <Select
                                                data-status={item?.status}
                                                size='xs'
                                                rounded='full'
                                                isDisabled={isProcessing}
                                                defaultValue={item?.status}
                                                backgroundColor={item.status === 'active' ? 'green.500' : 'red.500'}
                                                color='white'
                                                style={{ color: 'white' }}
                                                onChange={(e: any) => setChangingStatus({ id: item?.id, status: e.target.value })}
                                            >
                                                <option value='active'>Active</option>
                                                <option value='inactive'>Paused</option>
                                            </Select>
                                        </Td>
                                        <Td textAlign='center'>
                                            {
                                                item?.advertisement
                                                    ? <ImagePopover
                                                        image={{
                                                            thumbnail: item?.advertisement?.thumbnailUrl,
                                                            image: item?.advertisement?.imageUrl,
                                                        }}
                                                    >
                                                        <img
                                                            src={item?.advertisement?.thumbnailUrl}
                                                            alt={item?.advertisement?.title}
                                                            width={70}
                                                            style={{
                                                                borderRadius: '0.375rem',
                                                                cursor: 'pointer',
                                                            }}
                                                        />
                                                    </ImagePopover>
                                                    : '-'
                                            }
                                        </Td>
                                        <Td textAlign='center'>{item?.name}</Td>
                                        <Td textAlign='center'>{item?.user?.name || '-'}</Td>
                                        <Td textAlign='center'>
                                            {
                                                item?.audience
                                                    ? <>
                                                        <span>{item?.audience?.ageMin} - {item?.audience?.ageMax} years</span>
                                                        <br />
                                                        <span className="capitalize">{capitalize(renderTargetGender(item?.audience?.gender), true)}</span>
                                                        {/* <br /> */}
                                                        {/* <span>{item?.audience?.location || 'NO LOCATION DEFINED'}</span> */}
                                                    </>
                                                    : '-'
                                            }
                                        </Td>
                                        <Td textAlign='center' color='var(--table-header-green)'>${item?.dailyBudget}</Td>
                                        <Td textAlign='center' color='var(--table-header-blue)'>{item?.cpc || 0}</Td>
                                        <Td textAlign='center' color='var(--table-header-green)'>${item?.totalSpent || 0}</Td>
                                        <Td textAlign='center' color='var(--table-header-blue)'>{item?.impressions || 0}</Td>
                                        <Td textAlign='center' color='var(--table-header-blue)'>{item?.clicks || 0}</Td>
                                        <Td textAlign='center' color='var(--table-header-blue)'>{item?.ctr || 0}</Td>
                                        <Td textAlign='center'>{formatDateTime(item?.createdAt)}</Td>
                                        <Td>
                                            <Flex justifyContent='flex-end' alignItems='center' gap={2}>
                                                <IconButton
                                                    aria-label='Delete'
                                                    variant='ghost'
                                                    colorScheme='red'
                                                    rounded='full'
                                                    size='sm'
                                                    icon={<IconTrash size={22} />}
                                                    onClick={() => window?.dispatchEvent(new CustomEvent('confirmation:brand:campaigns:delete', { detail: { ...item, brandId: brandId } }))}
                                                />
                                            </Flex>
                                        </Td>
                                    </Tr>
                                ))
                    }
                </Tbody>
            </Table>

            {/* Update Status Confirmation */}
            <Confirmation
                isOpen={changingStatus.status && changingStatus.id}
                isProcessing={isProcessing}
                title='Update Campaign Status'
                html={<span>Are you sure you want to <b>{status === 'active' ? 'activate' : 'pause'}</b> this campaign?</span>}
                cancelText='Nevermind'
                confirmText={changingStatus.status === 'active' ? 'Yes, activate' : 'Yes, pause'}
                processingConfirmText={changingStatus.status === 'active' ? 'Activating...' : 'Pausing...'}
                isDangerous={false}
                onConfirm={handleUpdateStatus}
                onCancel={() => setChangingStatus({ id: null, status: null })}
            />
        </Box>
    )
}