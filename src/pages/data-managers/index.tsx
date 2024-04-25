import { Content } from "@/layouts/app.layout"
import UsersView from "@/components/users/UsersView";
import { ROLES } from "@/_config";

const DataManagersView = () => {
    return (
        <Content activePage="Data Managers">
            <UsersView userType={ROLES.DATA_MANAGER} />
        </Content>
    )
}

export default DataManagersView;