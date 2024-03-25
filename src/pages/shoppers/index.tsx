import AppLayout from "@/layouts/app.layout"
import UsersView from "@/components/users/UsersView";

const ShoppersView = () => {
    return (
        <AppLayout activePage="Shoppers">
            <UsersView userType="shopper" />
        </AppLayout>
    )
}

export default ShoppersView;