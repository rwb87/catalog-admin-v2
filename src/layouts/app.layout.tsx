import { Box, Button, Flex, Heading, IconButton, Switch, Text, Tooltip } from "@chakra-ui/react";
import { ReactElement } from "react";
import { IconHanger, IconLogout, IconMenu2, IconSettings } from "@tabler/icons-react";
import { useUi, useUser } from "@/_store";
import { Link } from "react-router-dom";
import { FaTag, FaTshirt, FaUserPlus, FaUserTie } from "react-icons/fa";
import { FaBasketShopping, FaRegCircleUser } from "react-icons/fa6";
import { RiMenu5Line } from "react-icons/ri";
import { BiDollar } from "react-icons/bi";

type AppLayoutProps = {
    children: ReactElement | ReactElement[];
    activePage: string;
}
const AppLayout = ({ children, activePage }: AppLayoutProps) => {
    const { isSidebarCollapsed } = useUi() as any;

    return (
        <Box
            minHeight="100dvh"
            width="full"
            display="flex"
            flexDirection="row"
        >

            {/* Sidebar */}
            <Sidebar activePage={activePage} />

            {/* Body */}
            <Box flex={1} height='full'>

                {/* Top Bar */}
                {/* <TopBar activePage={activePage} /> */}

                {/* Content */}
                <Box
                    flex={1}
                    p={{ base: 2, md: 4 }}
                    overflowY='auto'
                    maxHeight='calc(100vh)'
                    maxWidth={`calc(100vw - ${(isSidebarCollapsed ? '4rem' : '16rem')})`}
                >{children}</Box>
            </Box>
        </Box>
    )

}

type SidebarProps = {
    activePage: string;
}
const Sidebar = ({ activePage }: SidebarProps) => {
    const { isSidebarCollapsed: isCollapsed, toggleSidebar } = useUi() as any;
    const { clearToken } = useUser() as any;

    const sidebarItems = [
        {
            icon: <FaUserTie size={22} />,
            label: "Administrators",
            link: "/administrators"
        },
        {
            icon: <FaBasketShopping size={22} />,
            label: "Shoppers",
            link: "/shoppers"
        },
        {
            icon: <FaUserPlus size={22} />,
            label: "Creators",
            link: "/creators"
        },
        {
            icon: <IconHanger size={22} />,
            label: "Looks",
            link: "/looks"
        },
        {
            icon: <FaTag size={22} />,
            label: "Brands",
            link: "/brands"
        },
        {
            icon: <FaTshirt size={22} />,
            label: "Items",
            link: "/items"
        },
        {
            icon: <BiDollar size={22} />,
            label: "Earnings",
            link: "/earnings"
        }
    ]

    const SidebarItem = ({ icon, label, link, isActive = false, onClick }: { icon: ReactElement, label: string, link: string, isActive?: boolean, onClick?: () => void }) => {
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
                        color={isActive? 'black' : 'blackAlpha.500'}
                        borderLeftWidth={4}
                        borderLeftColor={isActive ? 'black' : 'transparent'}
                        _hover={{
                            borderLeftColor: 'black',
                            color : 'black'
                        }}
                    >
                        {icon}
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
            width={isCollapsed ? 16 : 64}
            bgColor='white'
            borderRightWidth={1}
            borderRightColor="gray.100"
            py={4}
        >

            <Box>
                <Box pl={4}>

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
                            <Switch id='email-alerts' colorScheme="green" />
                        </Box>
                        : <Flex my={6} pl={4} alignItems='center' justifyContent='flex-start'>
                            <IconButton
                                aria-label="Toggle Sidebar View"
                                roundedLeft='full'
                                variant='outline'
                                px={10}
                                icon={<FaRegCircleUser size={20} />}
                            >
                            </IconButton>
                            <IconButton
                                aria-label="Toggle Sidebar View"
                                roundedRight='full'
                                variant='outline'
                                px={10}
                                opacity={0.4}
                                icon={<img src="/icons/icon-data.svg" alt="Data" width={20} />}
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
                    {sidebarItems.map((item, index) => (
                        <SidebarItem
                            key={index}
                            icon={item.icon}
                            label={item.label}
                            link={item.link}
                            isActive={activePage === item.label}
                        />
                    ))}
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

type TopBarProps = {
    activePage: string;
}
const TopBar = ({ activePage }: TopBarProps) => {
    const { clearToken } = useUser() as any;
    const { isSidebarCollapsed, toggleSidebar } = useUi() as any;

    return (
        <Flex
            bgColor="white"
            px={4}
            py={2}
            borderBottomWidth={1}
            borderBottomColor="gray.100"
            gap={4}
            justifyContent='space-between'
            width='full'
        >
            <Flex alignItems='center' gap={4}>
                <Tooltip label="Toggle Sidebar" placement="bottom">
                    <IconButton
                        aria-label="Expand / Collapse"
                        variant="ghost"
                        size="sm"
                        rounded='full'
                        icon={<IconMenu2 size={22} />}
                        onClick={() => toggleSidebar(isSidebarCollapsed)}
                    />
                </Tooltip>

                <Text fontSize="lg">{activePage}</Text>
            </Flex>

            <Flex alignItems='center' gap={2}>

                {/* Settings */}
                <Tooltip label="Settings" placement="bottom">
                    <IconButton
                        aria-label="Settings"
                        variant="ghost"
                        size="sm"
                        rounded='full'
                        icon={<IconSettings size={22} />}
                    />
                </Tooltip>

                {/* Logout */}
                <Tooltip label="Logout" placement="bottom">
                    <IconButton
                        aria-label="Logout"
                        variant="ghost"
                        size="sm"
                        rounded='full'
                        icon={<IconLogout size={22} />}
                        onClick={() => {
                            clearToken();
                            window.location.href = '/login';
                        }}
                    />
                </Tooltip>
            </Flex>
        </Flex>
    )
}

export default AppLayout;