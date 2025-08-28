import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import CompanyOnboarding from "./CompanyOnboarding";

import CreativeStudio from "./CreativeStudio";

import Tasks from "./Tasks";

import Analytics from "./Analytics";

import Calendar from "./Calendar";

import CreativeAnalytics from "./CreativeAnalytics";

import Assets from "./Assets";

import Settings from "./Settings";

import Team from "./Team";

import TrendingTopics from "./TrendingTopics";

import Scheduler from "./Scheduler";

import ChampionAnalytics from "./ChampionAnalytics";

import CompetitorIntelligence from "./CompetitorIntelligence";

import AICoach from "./AICoach";

import Reports from "./Reports";

import KeywordResearch from "./KeywordResearch";

import Leads from "./Leads";

import Activities from "./Activities";

import TopicDetail from "./TopicDetail";

import QuickMail from "./QuickMail";

import AcceptInvitation from "./AcceptInvitation";

import acceptinvitation from "./accept-invitation";

import CrmPipeline from "./CrmPipeline";

import CrmContacts from "./CrmContacts";

import CrmCompanies from "./CrmCompanies";

import CrmReports from "./CrmReports";

import Landing from "./Landing";

import SocialAnalytics from "./SocialAnalytics";

import AIGraphicDesigner from "./AIGraphicDesigner";

import CrmGeneratedLeads from "./CrmGeneratedLeads";

import FindLeads from "./FindLeads";

import CreativeStudioV2 from "./CreativeStudioV2";

import AIGraphicDesignerV2 from "./AIGraphicDesignerV2";

import Notifications from "./Notifications";

import Premium from "./Premium";

import PrivacyPolicy from "./PrivacyPolicy";

import TermsAndConditions from "./TermsAndConditions";

import Chat from "./Chat";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    CompanyOnboarding: CompanyOnboarding,
    
    CreativeStudio: CreativeStudio,
    
    Tasks: Tasks,
    
    Analytics: Analytics,
    
    Calendar: Calendar,
    
    CreativeAnalytics: CreativeAnalytics,
    
    Assets: Assets,
    
    Settings: Settings,
    
    Team: Team,
    
    TrendingTopics: TrendingTopics,
    
    Scheduler: Scheduler,
    
    ChampionAnalytics: ChampionAnalytics,
    
    CompetitorIntelligence: CompetitorIntelligence,
    
    AICoach: AICoach,
    
    Reports: Reports,
    
    KeywordResearch: KeywordResearch,
    
    Leads: Leads,
    
    Activities: Activities,
    
    TopicDetail: TopicDetail,
    
    QuickMail: QuickMail,
    
    AcceptInvitation: AcceptInvitation,
    
    acceptinvitation: acceptinvitation,
    
    CrmPipeline: CrmPipeline,
    
    CrmContacts: CrmContacts,
    
    CrmCompanies: CrmCompanies,
    
    CrmReports: CrmReports,
    
    Landing: Landing,
    
    SocialAnalytics: SocialAnalytics,
    
    AIGraphicDesigner: AIGraphicDesigner,
    
    CrmGeneratedLeads: CrmGeneratedLeads,
    
    FindLeads: FindLeads,
    
    CreativeStudioV2: CreativeStudioV2,
    
    AIGraphicDesignerV2: AIGraphicDesignerV2,
    
    Notifications: Notifications,
    
    Premium: Premium,
    
    PrivacyPolicy: PrivacyPolicy,
    
    TermsAndConditions: TermsAndConditions,
    
    Chat: Chat,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/CompanyOnboarding" element={<CompanyOnboarding />} />
                
                <Route path="/CreativeStudio" element={<CreativeStudio />} />
                
                <Route path="/Tasks" element={<Tasks />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/Calendar" element={<Calendar />} />
                
                <Route path="/CreativeAnalytics" element={<CreativeAnalytics />} />
                
                <Route path="/Assets" element={<Assets />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Team" element={<Team />} />
                
                <Route path="/TrendingTopics" element={<TrendingTopics />} />
                
                <Route path="/Scheduler" element={<Scheduler />} />
                
                <Route path="/ChampionAnalytics" element={<ChampionAnalytics />} />
                
                <Route path="/CompetitorIntelligence" element={<CompetitorIntelligence />} />
                
                <Route path="/AICoach" element={<AICoach />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/KeywordResearch" element={<KeywordResearch />} />
                
                <Route path="/Leads" element={<Leads />} />
                
                <Route path="/Activities" element={<Activities />} />
                
                <Route path="/TopicDetail" element={<TopicDetail />} />
                
                <Route path="/QuickMail" element={<QuickMail />} />
                
                <Route path="/AcceptInvitation" element={<AcceptInvitation />} />
                
                <Route path="/accept-invitation" element={<accept-invitation />} />
                
                <Route path="/CrmPipeline" element={<CrmPipeline />} />
                
                <Route path="/CrmContacts" element={<CrmContacts />} />
                
                <Route path="/CrmCompanies" element={<CrmCompanies />} />
                
                <Route path="/CrmReports" element={<CrmReports />} />
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/SocialAnalytics" element={<SocialAnalytics />} />
                
                <Route path="/AIGraphicDesigner" element={<AIGraphicDesigner />} />
                
                <Route path="/CrmGeneratedLeads" element={<CrmGeneratedLeads />} />
                
                <Route path="/FindLeads" element={<FindLeads />} />
                
                <Route path="/CreativeStudioV2" element={<CreativeStudioV2 />} />
                
                <Route path="/AIGraphicDesignerV2" element={<AIGraphicDesignerV2 />} />
                
                <Route path="/Notifications" element={<Notifications />} />
                
                <Route path="/Premium" element={<Premium />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/TermsAndConditions" element={<TermsAndConditions />} />
                
                <Route path="/Chat" element={<Chat />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}