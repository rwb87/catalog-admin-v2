import { Content } from "@/layouts/app.layout"
import { Flex } from "@chakra-ui/react";

const LooksManagementView = () => {
    return (
        <Content activePage="Looks Management">

            {/* Search and Options */}
            <Flex
                justifyContent='space-between'
                alignItems='center'
                mb={16}
            >
                {/* Page Heading */}
                <Flex gap={2} alignItems='center'>
                    <h1 className="page-heading">Looks Management</h1>
                </Flex>
            </Flex>

        </Content>
    )
}

export default LooksManagementView;