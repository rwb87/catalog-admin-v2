import { Content } from "@/layouts/app.layout"
import UsersView from "@/components/users/UsersView";

const ShoppersView = () => {
    return (
        <Content activePage="Shoppers">
            <UsersView userType="shopper" />
        </Content>
    )
}

export default ShoppersView;