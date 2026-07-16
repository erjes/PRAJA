import DocumentController from './DocumentController'
import DashboardController from './DashboardController'
import ProfileController from './ProfileController'
import NotificationController from './NotificationController'
import EventController from './EventController'
import ProjectController from './ProjectController'
import TaskController from './TaskController'
import UserController from './UserController'
import DocumentActivityLogController from './DocumentActivityLogController'
import Auth from './Auth'
const Controllers = {
    DocumentController: Object.assign(DocumentController, DocumentController),
DashboardController: Object.assign(DashboardController, DashboardController),
ProfileController: Object.assign(ProfileController, ProfileController),
NotificationController: Object.assign(NotificationController, NotificationController),
EventController: Object.assign(EventController, EventController),
ProjectController: Object.assign(ProjectController, ProjectController),
TaskController: Object.assign(TaskController, TaskController),
UserController: Object.assign(UserController, UserController),
DocumentActivityLogController: Object.assign(DocumentActivityLogController, DocumentActivityLogController),
Auth: Object.assign(Auth, Auth),
}

export default Controllers