import { Content } from "@/layouts/app.layout"
import UsersView from "@/components/users/UsersView";

const DataManagersView = () => {
    return (
        <Content activePage="Data Managers">
            <UsersView userType="data-manager" />
        </Content>
    )
}

export default DataManagersView;