import AppLayout from "@/layouts/app.layout"
import UsersView from "@/components/users/UsersView";

const CreatorsView = () => {
    return (
        <AppLayout activePage="Creators">
            <UsersView userType="creator" />
        </AppLayout>
    )
}

export default CreatorsView;