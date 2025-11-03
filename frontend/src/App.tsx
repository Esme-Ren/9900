import './App.css';
import Teams from './Pages/GroupTeam/Teams';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AboutUs from './Pages/AboutUs';
import Login from './Pages/Login';
import SignUp from './Pages/SignUp';
import UserProfile from './Pages/Profile/UserProfile';
import SearchKeyword from './Pages/SearchKeyword';
import Bookmarks from './Pages/Bookmarks';
import AdminPortal from './Pages/AdminPortal';
import SDGForm from './Pages/SDGForms/Form';
import SDGForms from './Pages/SDGForms/Forms';
import AdminOverviewSDGPlans from './Pages/Admin/AdminOverviewSDGPlans';
import AdminAnalytics from './Pages/Admin/AdminAnalytics';
import TopSearchesPage from './Pages/Admin/TopSearchesPage';
import RequestReset from './Pages/RequestReset';
import VerifyResetCode from './Pages/VerifyResetCode';
import ResetPassword from './Pages/ResetPassword';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ConfirmationPin from './Components/ConfirmationPin';
import { TeamWrapper } from './Pages/IndividualTeam/TeamWrapper';
import SdgActionSearch from './Pages/SdgActionSearch';
import SdgEducationSearch from './Pages/SdgEducationSearch';
import SDGChatbot from './Pages/SDGChatbot';
import SdgKeywordsSearch from './Pages/SdgKeywordsSearch';
import UserActivity from './Pages/UserActivity';

const clientId = '457383923915-pcoes829lbarn628vjh78r9lpqitclu7.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<SearchKeyword />}/>
          <Route path='/login' element={<Login />} />
          <Route path='/about-us' element={<AboutUs />} />
          <Route path='/confirmation-pin' element={<ConfirmationPin />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/forgot-password' element={<RequestReset />} />
          <Route path='/forgot-password/verify' element={<VerifyResetCode />} />
          <Route path='/forgot-password/reset' element={<ResetPassword />} />
          <Route path='/userprofile' element={<UserProfile />} />
          <Route path='/userprofile/:targetUsername' element={<UserProfile />} />
          <Route path='/teams' element={<Teams />} />
          <Route path='/teams/:id' element={<TeamWrapper />} />
          <Route path='/search-keyword' element={<SearchKeyword />} />
          <Route path='/bookmarks' element={<Bookmarks />} />
          <Route path='/admin-portal' element={<AdminPortal />} />
          <Route path='/admin/overview-of-sdg-plans' element={<AdminOverviewSDGPlans />} />
          <Route path='/admin/analytics' element={<AdminAnalytics />} />
          <Route path='/admin/top-searches' element={<TopSearchesPage />} />
          <Route path='/sdg-action' element={<SdgActionSearch />} />
          <Route path='/sdg-education' element={<SdgEducationSearch />} />
          <Route path='/sdg-form' element={<SDGForms />} />
          <Route path='/sdg-form/:id' element={<SDGForm />} />
          <Route path='/sdg-ai-chatbot' element={<SDGChatbot />} />
          <Route path='/sdg-keywords' element={<SdgKeywordsSearch />} />
          <Route path='/user-activity' element={<UserActivity />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
