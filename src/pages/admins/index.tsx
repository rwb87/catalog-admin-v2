import { Content } from "@/layouts/app.layout"
import UsersView from "@/components/users/UsersView";

const AdminsView = () => {
    return (
        <Content activePage="Administrators">
            <UsersView userType="admin" />
        </Content>
    )
}

export default AdminsView;