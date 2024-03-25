import AppLayout from "@/layouts/app.layout"
import UsersView from "@/components/users/UsersView";

const AdminsView = () => {
    return (
        <AppLayout activePage="Administrators">
            <UsersView userType="admin" />
        </AppLayout>
    )
}

export default AdminsView;