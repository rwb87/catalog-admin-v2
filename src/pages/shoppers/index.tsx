import { Content } from "@/layouts/app.layout"
import UsersView from "@/components/users/UsersView";
import { ROLES } from "@/_config";

const ShoppersView = () => {
    return (
        <Content activePage="Shoppers">
            <UsersView userType={ROLES.SHOPPER} />
        </Content>
    )
}

export default ShoppersView;