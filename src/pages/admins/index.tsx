import { Content } from "@/layouts/app.layout"
import UsersView from "@/components/users/UsersView";
import { ROLES } from "@/_config";

const AdminsView = () => {
    return (
        <Content activePage="Administrators">
            <UsersView userType={ROLES.ADMIN} />
        </Content>
    )
}

export default AdminsView;