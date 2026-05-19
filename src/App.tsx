import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { LandingPage } from './pages/LandingPage';
import { EmployeeListPage } from './pages/EmployeeListPage';
import { EmployeeDetailPage } from './pages/EmployeeDetailPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { OptionsPreviewPage } from './pages/OptionsPreviewPage';
import { da } from './data/danishCopy';
import { PATHS } from './paths';

function App() {
    return (
        <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
                <Route path="/" element={<LandingPage />} />

                <Route path="onboarding-v1" element={<AppShell />}>
                    <Route
                        index
                        element={<Navigate to="employees" replace />}
                    />
                    <Route
                        path="employees"
                        element={<EmployeeListPage editMode="page" />}
                    />
                    <Route
                        path="employees/options-preview"
                        element={<OptionsPreviewPage />}
                    />
                    <Route
                        path="employees/:id"
                        element={<EmployeeDetailPage />}
                    />
                    <Route
                        path="employees/groups"
                        element={<PlaceholderPage title={da.nav.employeeGroups} />}
                    />
                    <Route
                        path="payroll/overview"
                        element={<PlaceholderPage title={da.nav.payrollOverview} />}
                    />
                    <Route
                        path="payroll/runs"
                        element={<PlaceholderPage title={da.nav.payrollRuns} />}
                    />
                    <Route
                        path="payroll/archive"
                        element={<PlaceholderPage title={da.nav.payrollArchive} />}
                    />
                    <Route
                        path="reports/vacation"
                        element={<PlaceholderPage title={da.nav.vacationAllowance} />}
                    />
                    <Route
                        path="settings/company"
                        element={<PlaceholderPage title={da.nav.company} />}
                    />
                </Route>

                <Route path="scheduled-changes-v1" element={<AppShell />}>
                    <Route
                        index
                        element={<Navigate to="employees?state=processed" replace />}
                    />
                    <Route
                        path="employees"
                        element={<EmployeeListPage editMode="schedule" />}
                    />
                    <Route
                        path="employees/options-preview"
                        element={<OptionsPreviewPage />}
                    />
                    <Route
                        path="employees/groups"
                        element={<PlaceholderPage title={da.nav.employeeGroups} />}
                    />
                    <Route
                        path="payroll/overview"
                        element={<PlaceholderPage title={da.nav.payrollOverview} />}
                    />
                    <Route
                        path="payroll/runs"
                        element={<PlaceholderPage title={da.nav.payrollRuns} />}
                    />
                    <Route
                        path="payroll/archive"
                        element={<PlaceholderPage title={da.nav.payrollArchive} />}
                    />
                    <Route
                        path="reports/vacation"
                        element={<PlaceholderPage title={da.nav.vacationAllowance} />}
                    />
                    <Route
                        path="settings/company"
                        element={<PlaceholderPage title={da.nav.company} />}
                    />
                </Route>

                <Route path="onboarding-v2" element={<AppShell />}>
                    <Route
                        index
                        element={<Navigate to="employees" replace />}
                    />
                    <Route
                        path="employees"
                        element={<EmployeeListPage editMode="modal" />}
                    />
                    <Route
                        path="employees/options-preview"
                        element={<OptionsPreviewPage />}
                    />
                    <Route
                        path="employees/groups"
                        element={<PlaceholderPage title={da.nav.employeeGroups} />}
                    />
                    <Route
                        path="payroll/overview"
                        element={<PlaceholderPage title={da.nav.payrollOverview} />}
                    />
                    <Route
                        path="payroll/runs"
                        element={<PlaceholderPage title={da.nav.payrollRuns} />}
                    />
                    <Route
                        path="payroll/archive"
                        element={<PlaceholderPage title={da.nav.payrollArchive} />}
                    />
                    <Route
                        path="reports/vacation"
                        element={<PlaceholderPage title={da.nav.vacationAllowance} />}
                    />
                    <Route
                        path="settings/company"
                        element={<PlaceholderPage title={da.nav.company} />}
                    />
                </Route>

                <Route path="*" element={<Navigate to={PATHS.landing} replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
