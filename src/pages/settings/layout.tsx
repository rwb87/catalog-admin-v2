import { Content } from "@/layouts/app.layout";
import { useAuthGuard } from "@/providers/AuthProvider";
import { Box, Flex, Tab, TabList, TabPanels, Tabs, Link } from "@chakra-ui/react";
import { IconLoader2 } from "@tabler/icons-react";
import { ReactNode, useMemo } from "react";
import { Link as ViteLink, useLocation } from "react-router-dom";

const TABS = [
    {
        title: 'General',
        path: '/settings',
    },
    {
        title: 'Creator Affiliate Links',
        path: '/settings/creator-affiliate-links',
    },
    {
        title: 'Ad Frequency',
        path: '/settings/ad-frequency',
    }
];

export default function SettingsLayout({ children, isLoading = undefined }: { children: ReactNode, isLoading?: boolean | undefined }) {
    useAuthGuard('auth');
    const location = useLocation();

    const currentTab = useMemo(() => TABS.find((tab: any) => tab.path === location.pathname), [location.pathname])

    return (
        <Content activePage="Settings">

            {/* Search and Options */}
            <Flex
                direction={{
                    base: 'column',
                    lg: 'row',
                }}
                justifyContent='space-between'
                alignItems={{
                    base: 'flex-start',
                    lg: 'center',
                }}
                mb={{
                    base: 4,
                    md: 8,
                    xl: 16,
                }}
                gap={2}
                width='full'
            >

                <h1 className="page-heading">Application Settings</h1>
            </Flex>

            {/* Tabs */}
            <Tabs
                variant='enclosed'
                defaultIndex={TABS.indexOf(currentTab)}
                isLazy
            >
                <TabList
                    borderColor='gray.100'
                    overflowX='auto'
                    overflowY='hidden'
                >
                    {
                        TABS.map((tab, index) => <Tab
                            key={index}
                            p={0}
                            backgroundColor={currentTab?.path === tab.path? 'white' : 'transparent'}
                        >
                            <Link
                                as={ViteLink}
                                to={tab.path}
                                p={3}
                                textDecoration='none'
                                _hover={{
                                    textDecoration: 'none',
                                }}
                                whiteSpace='nowrap'
                                fontSize={{
                                    base: 'sm',
                                    lg: 'md',
                                }}
                                fontWeight='semibold'
                            >{tab.title}</Link>
                        </Tab>)
                    }
                </TabList>
                <TabPanels>

                    {/* Body */}
                    <Box
                        backgroundColor='#fff'
                        border='1px solid'
                        borderColor='gray.100'
                        rounded='lg'
                        roundedTop='none'
                        pt={6}
                    >
                        {/* Loader */}
                        {
                            isLoading
                            ? <Box
                                display='flex'
                                justifyContent='center'
                                alignItems='center'
                                bgColor='#fff'
                                mb={6}
                            ><IconLoader2 className="animate-spin" style={{ width: 40, height: 40 }} /></Box>
                            : children
                        }
                    </Box>
                </TabPanels>
            </Tabs>
        </Content>
    )
}