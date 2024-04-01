import { useSelector } from 'react-redux';
import { Outlet ,Navigate} from 'react-router-dom';

export default function PrivateRouteSign() {
    const {currentUser} = useSelector(state=>state.user);

  return currentUser!=null ? <Navigate to='/profile'/>:<Outlet />;
}
