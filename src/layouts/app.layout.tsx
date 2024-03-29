import { Box, Button, Flex, Heading, IconButton, Switch, Text, Tooltip } from "@chakra-ui/react";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { IconLogout } from "@tabler/icons-react";
import { useUi, useUser } from "@/_store";
import { Link } from "react-router-dom";
import { RiMenu5Line } from "react-icons/ri";
import { BiDollar } from "react-icons/bi";

type AppLayoutProps = {
    children: ReactElement;
}
const AppLayout = ({ children }: AppLayoutProps) => {
    const [activePage, setActivePage] = useState<string>('Administrators');

    const sidebarItems = useMemo(() => ([
        {
            icon: "/icons/icon-admins.svg",
            label: "Administrators",
            link: "/administrators",
            isDefault: true,
        },
        {
            icon: "/icons/icon-shoppers.svg",
            label: "Shoppers",
            link: "/shoppers",
            isDefault: true,
        },
        {
            icon: "/icons/icon-creators.svg",
            label: "Creators",
            link: "/creators",
            isDefault: true,
        },
        {
            icon: "/icons/icon-looks.svg",
            label: "Looks",
            link: "/looks",
            isDefault: true,
        },
        {
            icon: "/icons/icon-brands.svg",
            label: "Brands",
            link: "/brands",
            isDefault: true,
        },
        {
            icon: "/icons/icon-products.svg",
            label: "Products",
            link: "/products",
            isDefault: true,
        },
        {
            icon: <BiDollar size={24} />,
            label: "Earnings",
            link: "/earnings",
            isDefault: true,
        },
        {
            icon: "/icons/icon-looks-management.svg",
            label: "Looks Management",
            link: "/looks/management",
            isDefault: false,
        },
        {
            icon: "/icons/icon-products-management.svg",
            label: "Products Management",
            link: "/products/management",
            isDefault: false,
        },
    ]), []);

    useEffect(() => {
        window?.addEventListener('set:active-page', (event: any) => {
            setActivePage(event.detail.activePage);
        });

        return () => {
            window?.removeEventListener('set:active-page', () => {});
        }
    }, []);

    return (
        <Box
            minHeight="100dvh"
            width="full"
            display="flex"
            flexDirection="row"
        >

            {/* Sidebar */}
            <Sidebar
                sidebarItems={sidebarItems}
                activePage={activePage}
            />

            {/* Body */}
            <Box flex={1} height='screen'>{children}</Box>
        </Box>
    )
}

const Content = ({ children, activePage }: { children: ReactElement | ReactElement[], activePage: string }) => {
    const { isSidebarCollapsed } = useUi() as any;

    useEffect(() => {
        window?.dispatchEvent(new CustomEvent('set:active-page', { detail: { activePage } }));
    }, [activePage]);

    return (
        <Box
            flex={1}
            overflowY='auto'
            px={{
                base: 4,
                md: 16,
            }}
            pt={0}
            pb={8}
            maxHeight='100vh'
            maxWidth={`calc(100vw - ${(isSidebarCollapsed ? '4rem' : '16rem')})`}
        >{children}</Box>
    )
}

type SidebarProps = {
    sidebarItems: {
        icon: ReactElement | string;
        label: string;
        link: string;
        isDefault?: boolean;
    }[];
    activePage: string;
}
const Sidebar = ({ sidebarItems, activePage }: SidebarProps) => {
    const { isSidebarCollapsed: isCollapsed, toggleSidebar } = useUi() as any;
    const { clearToken } = useUser() as any;
    const [sidebarDefaultView, setSidebarDefaultView] = useState(true);

    useEffect(( ) => {
        const activeSidebarItem = sidebarItems.find((item) => item.label === activePage);

        if(activeSidebarItem?.isDefault === false) setSidebarDefaultView(false);
    }, [sidebarItems, activePage]);

    const SidebarItem = ({ icon, label, link, isActive = false, onClick }: { icon: ReactElement | string, label: string, link: string, isActive?: boolean, onClick?: () => void }) => {
        return (
            <Link
                to={link}
                onClick={(event: any) => {
                    if(typeof onClick === 'function') {
                        event.preventDefault();
                        event.stopPropagation();
                        onClick?.();
                    }
                }}
            >
                <Tooltip
                    label={label}
                    placement="right"
                    isDisabled={!isCollapsed}
                >
                    <Button
                        variant='none'
                        width='full'
                        rounded='none'
                        gap={4}
                        justifyContent={isCollapsed ? 'center' : 'flex-start'}
                        textAlign='left'
                        fontWeight='medium'
                        py='1.5rem'
                        colorScheme='gray'
                        opacity={isActive? 1 : 0.3}
                        borderLeftWidth={4}
                        borderLeftColor={isActive ? 'black' : 'transparent'}
                        _hover={{
                            borderLeftColor: 'black',
                            color : 'black',
                            opacity: 1,
                        }}
                    >
                        {
                            typeof icon === 'string'
                                ? <img src={icon} alt={label} width={20} loading="eager" />
                                : icon
                        }
                        {
                            !isCollapsed
                                ? <Text fontSize='lg'>{label}</Text>
                                : null
                        }
                    </Button>
                </Tooltip>
            </Link>
        )
    }

    return (
        <Flex
            direction='column'
            gap={4}
            justifyContent='space-between'
            width={isCollapsed ? 16 : '17rem'}
            bgColor='white'
            borderRightWidth={1}
            borderRightColor="gray.100"
            py={4}
        >

            <Box>
                <Box pl={isCollapsed ? 0 : 4} textAlign={isCollapsed ? 'center' : 'left'}>

                    {/* Collapse Button */}
                    <Tooltip label={`${isCollapsed ? 'Expand' : 'Collapse'} Sidebar`} placement="right">
                        <IconButton
                            aria-label="Toggle Sidebar"
                            variant="solid"
                            size="sm"
                            rounded='full'
                            mb={6}
                            icon={<RiMenu5Line size={20} strokeWidth={1} />}
                            onClick={() => toggleSidebar(isCollapsed)}
                        />
                    </Tooltip>

                    {/* Logo */}
                    <Heading
                        fontSize="5xl"
                        fontWeight="semi-bold"
                    >S</Heading>
                </Box>

                {/* Switch */}
                {
                    isCollapsed
                        ? <Box my={6} textAlign='center'>
                            <Switch
                                id='default-view'
                                colorScheme="green"
                                isChecked={!sidebarDefaultView}
                                onChange={() => setSidebarDefaultView(!sidebarDefaultView)}
                            />
                        </Box>
                        : <Flex my={6} px={4} alignItems='center' width='full'>
                            <IconButton
                                aria-label="Toggle Sidebar View"
                                roundedLeft='full'
                                variant='outline'
                                width='full'
                                opacity={sidebarDefaultView ? 1 : 0.4}
                                backgroundColor={sidebarDefaultView ? 'transparent' : 'gray.100'}
                                icon={<img src="/icons/icon-shoppers.svg" alt="Shoppers" width={20} />}
                                onClick={() => setSidebarDefaultView(true)}
                            >
                            </IconButton>
                            <IconButton
                                aria-label="Toggle Sidebar View"
                                roundedRight='full'
                                variant='outline'
                                width='full'
                                opacity={sidebarDefaultView ? 0.4 : 1}
                                backgroundColor={sidebarDefaultView ? 'gray.100' : 'transparent'}
                                icon={<img src="/icons/icon-data.svg" alt="Data" width={20} />}
                                onClick={() => setSidebarDefaultView(false)}
                            ></IconButton>
                        </Flex>
                }

                {/* Items */}
                <Flex
                    direction="column"
                    pl={0.5}
                    pr={1}
                    mt={4}
                    gap={3}
                >
                    {
                        sidebarItems.map((item, index) => item?.isDefault === sidebarDefaultView && (
                            <SidebarItem
                                key={index}
                                icon={item.icon}
                                label={item.label}
                                link={item.link}
                                isActive={activePage === item.label}
                            />
                        ))
                    }
                </Flex>
            </Box>

            {/* Logout */}
            <Flex
                pl={0.5}
                pr={1}
            >
                <SidebarItem
                    icon={<IconLogout size={22} />}
                    label="Logout"
                    link="/login"
                    onClick={() => {
                        clearToken();
                        window.location.href = '/login';
                    }}
                />
            </Flex>
        </Flex>
    )
}

export default AppLayout;
export { Content };