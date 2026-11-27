import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { EmptyPage, RequirePermission } from "./components/common.jsx";
import { useAuth } from "./lib/auth.jsx";
import { isConfigured } from "./lib/supabase.js";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Inventory from "./pages/Inventory.jsx";
import IntakeFormList from "./pages/IntakeFormList.jsx";
import IntakeFormEdit from "./pages/IntakeFormEdit.jsx";
import IntakeFormView from "./pages/IntakeFormView.jsx";
import Prescription from "./pages/Prescription.jsx";
import ReferralSource from "./pages/ReferralSource.jsx";
import PriceEstimator from "./pages/PriceEstimator.jsx";
import EstimatorConfig from "./pages/EstimatorConfig.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import Users from "./pages/Users.jsx";
import UserForm from "./pages/UserForm.jsx";

function RequireAuth({ children }) {
  const { loading, session } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

function NotConfigured() {
  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Setup needed</h1>
        <p className="login-subheading">
          Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example), then restart.
        </p>
      </section>
    </main>
  );
}

const intake = ["intake_form"];
const prescription = ["provide_prescription"];
const users = ["users"];

export default function App() {
  if (!isConfigured) return <NotConfigured />;
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="intake-form" element={<RequirePermission anyOf={intake}><IntakeFormList /></RequirePermission>} />
        <Route path="intake-form/create" element={<RequirePermission anyOf={intake}><IntakeFormEdit /></RequirePermission>} />
        <Route path="intake-form/:id/edit" element={<RequirePermission anyOf={intake}><IntakeFormEdit /></RequirePermission>} />
        <Route path="intake-form/:id/view" element={<RequirePermission anyOf={intake}><IntakeFormView /></RequirePermission>} />
        <Route path="intake-form/:id/prescription/create" element={<RequirePermission anyOf={prescription}><Prescription /></RequirePermission>} />
        <Route path="referral-source" element={<ReferralSource />} />
        <Route path="inventory-tracking" element={<RequirePermission anyOf={["inventory_check"]}><Inventory /></RequirePermission>} />
        <Route path="optical-store/estimate" element={<PriceEstimator />} />
        <Route path="optical-store/config" element={<RequirePermission anyOf={["optical_store_config"]}><EstimatorConfig /></RequirePermission>} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route path="users" element={<RequirePermission anyOf={users}><Users /></RequirePermission>} />
        <Route path="users/create" element={<RequirePermission anyOf={users}><UserForm /></RequirePermission>} />
        <Route path="users/:id/edit" element={<RequirePermission anyOf={users}><UserForm /></RequirePermission>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
